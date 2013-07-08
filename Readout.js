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

function Readout(handle, leftBound, rightBound, y, font, fontCol, align, level, canvasHandle){
	this.handle = handle;
	this.align = defaultTo('left', align);
	this.canvasHandle = canvasHandle || 'main';
	this.font = defaultTo('11pt calibri', font);
	this.fontCol = defaultTo(Col(255, 255, 255), fontCol);
	this.leftBound = leftBound;
	this.width = rightBound - leftBound;
	this.y = y;
	this.entries = [];
	level.readouts[handle] = this;
}
Readout.prototype = {

	draw: function(ctx) {
		ctx.save();
		ctx.translate(this.leftBound, this.y);
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			draw.text(entry.text, entry.pos, this.font, this.fontCol, this.align, 0, ctx);
		}
		ctx.restore();
	},
	update: function(name, setPt) {
		var entry = byAttr(this.entries, name, 'name');
		var decPlaces = entry.decPlaces;
		entry.val = round(setPt, decPlaces);
	},
	addEntry: function(handle, idx) {
		var entry = new Readout.Entry(handle, '', this);
		if (idx) {
			this.entries.splice(idx, 0, entry);
		} else {
			this.entries.push(entry);
		}
		this.positionEntries();
		this.hide().show();
		return entry;
	},
	removeEntry: function(handle) {
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++) {
			if (this.entries[entryIdx].handle == handle) {
				this.entries.splice(entryIdx,1);
				this.positionEntries();
				return this;
			}
		}
		console.log('Tried to remove entry that does not exist: ' + handle);
	},
	entryExists: function(entryName) {
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++) {
			if (this.entries[entryIdx].name==entryName) {
				return true;
			}
		}
		return false;		
	},
	removeAllEntries: function() {
		this.entries = [];
	},
	positionEntries: function() {
		var numEntries = this.entries.length;
		var spacing;
		if (numEntries>1) {
			spacing = Math.floor(this.width/(numEntries-1));
		} else {
			spacing=this.width;
		}

		if (this.align=='center') {
			spacing = this.width/(numEntries+1);
			var center = this.leftBound + this.width/2;
			var spaceNum = numEntries-1;
			var sideSpace = spacing*spaceNum/2
			for (var entryIdx=0; entryIdx<numEntries; entryIdx++) {
				var entry = this.entries[entryIdx];
				var x = spacing*(entryIdx+1);
				var y = 0;
				entry.pos = P(x,y);
			}
		} else if (this.align=='left') {
			for (var entryIdx=0; entryIdx<numEntries; entryIdx++) {
				var entry = this.entries[entryIdx];
				var x = spacing*entryIdx
				var y = 0;
				entry.pos = P(x, y);
			}
		}

	},
	getNumEntries: function(){
		var count = 0;
		for(var entryName in this.entries){
			count++;
		}
		return count;
	},
	reset: function(name){
		var entry = byName(this.entries, name);
		var curVal = entry.curVal;
		var setPt = entry.setPt;
		this.tickReadout(curVal, setPt, name);
	},
	resetAll: function(){
		for(var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var name = entry.name;
			var curVal = entry.val;
			var setPt = entry.initVal;
			this.hardUpdate(setPt, name);
		}
		
	},
	position: function(p){
		if(p.x!==undefined){
			this.leftBound = p.x
		}
		if(p.y!==undefined){
			this.y = p.y
		}
	},
	show: function(){
		curLevel.readouts[this.handle] = this;
		canvasManager.addListener(this.canvasHandle, 'drawReadout'+this.handle, this.draw, this, 999);
		return this;
	},
	hide: function(){
		delete curLevel.readouts[this.handle];
		canvasManager.removeListener(this.canvasHandle, 'drawReadout'+this.handle);
		removeListener(curLevel, 'update', 'drawReadout'+this.handle);
		return this;
	}
}

Readout.Entry = function(handle, text, readout) {
	this.handle = handle;
	this.text = text;
	this.pos = undefined;
	this.readout = readout;
}
Readout.Entry.prototype = {
	setText: function(text) {
		this.text = text;
	},
	remove: function() {
		this.readout.removeEntry(this.handle);
	},
}