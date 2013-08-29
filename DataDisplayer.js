/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function DataDisplayer () {
	this.entries = {};
}
DataDisplayer.prototype = {
	setReadouts: function(readouts) {
		this.readouts = readouts;
	},
	addEntry: function(attrs) {
		var self = this;
		var label = attrs.label || '';
		var decPlaces = defaultTo(1, attrs.decPlaces);
		var handle = attrs.handle;
		var expr = attrs.expr || '';
		var units = attrs.units || '';
		var readout = this.readouts[attrs.readout];
		if (!readout) console.log('Bad readout name ' + attrs.readout);
		var listenerStr = 'display' + label + this.entries.length;
		var readoutEntry = readout.addEntry(label + handle);
		var dataEntry = new DataDisplayer.Entry(handle, label, decPlaces, expr, units, listenerStr, this, readoutEntry);
		this.entries[dataEntry.handle] = dataEntry;
		addListener(curLevel, 'update', listenerStr, function() {
			var displayStr = label;
			var valStr;
			var val = dataEntry.func();
			if (val === undefined) 
				valStr = ''
			else
				valStr = val.toFixed(decPlaces);
				
			displayStr += valStr + ' ';
			displayStr += units;
			readoutEntry.setText(displayStr);
		})
		
		return dataEntry;
	},
	setEntryValue: function(handle, newSetPoint) {
		var entry = this.entries[handle];
		if (!entry) {
			console.log('bad handle ' + handle);
		}
		var offset = newSetPoint - entry.func();
		entry.expr = entry.expr + ' + ' + offset;
		entry.func = entry.wrapExprInFunc();
	},
	removeEntry: function(handle) {
		if (this.entries[handle]) {
			this.entries[handle].remove();
		}
	},
}

DataDisplayer.Entry = function(handle, label, decPlaces, expr, units, listenerStr, dataDisplayer, readoutEntry) {
	this.handle = handle;
	this.label = label;
	this.decPlaces = decPlaces;
	this.expr = expr;
	this.func = this.wrapExprInFunc();
	this.units = units;
	this.listenerStr = listenerStr;
	this.dataDisplayer = dataDisplayer;
	this.readoutEntry = readoutEntry;
	this.removed = false;
}

DataDisplayer.Entry.prototype = {
	remove: function() {
		if (!this.removed) {
			delete this.dataDisplayer.entries[this.handle];
			this.readoutEntry.remove();
			removeListener(curLevel, 'update', this.listenerStr);
			this.removed = true;
		}
	},
	wrapExprInFunc: function() {
		var expr = this.expr
		with (DataGetFuncs) {
			var func;
			if (exprHasReturn(expr)) {
				func = eval('(function(){' + expr + '})');
			} else {
				func = eval('(function(){return ' + expr + '})');
			}
		}
		return func;
	}
}
