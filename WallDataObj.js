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

WallMethods.DataObj = function() {
	this.srcVal = [];
	this.idVal = undefined;
	this.typeVal = undefined;
	this.idArgsVal = undefined;
	this.wallHandleVal = undefined;
	this.recordingVal = false;
	this.listenerVal = undefined
	//this.displayingVal = false;
	this.recordStopVal = undefined;
	//this.displayStopVal = undefined;
	this.readoutVal;
}

WallMethods.DataObj.prototype = {
	recordVal: function() {
		this.srcVal.push(this.listenerVal.func.apply(this.listenerVal.obj));
	},
	id: function(id) {
		if (id) this.idVal = id;
		return this.idVal;
	},
	listener: function(listener) {
		if (listener) this.listenerVal = listener;
		return this.listenerVal;
	},
	type: function(type) {
		if (type) this.typeVal = type;
		return this.typeVal;	
	},
	idArgs: function(args) {
		if (args) this.idArgsVal = args;
		return this.idArgsVal;
	},
	argsMatch: function(testArgs) {
		return objectsEqual(this.idArgsVal, testArgs);
	},
	readout: function(readout) {
		if (readout) this.readoutVal = readout;
		return this.readoutVal;
	},
	wallHandle: function(wallHandle) {
		if (wallHandle) this.wallHandleVal = wallHandle;
		return this.wallHandleVal;
	},
	src: function(src) {
		if (src) this.srcVal = src;
		return this.srcVal;
	},
	recording: function(recording) {
		if (recording !== undefined) this.recordingVal = recording;
		return this.recordingVal;
	},
	//attn: the function behavior is different from the value behavior.  It calls instead of returns the values if no argument is given.
	//This is inconsistant, but I think fits the use cases better
	recordStop: function(func) {
		if (func) {
			this.recordStopVal = func;
		} else if (this.recordStopVal && this.recordingVal) {
			this.recordStopVal();
		}
	},
}