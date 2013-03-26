WallMethods.DataObj = function() {
	this.srcVal = [];
	this.idVal;
	this.typeVal;
	this.idArgsVal;
	this.wallHandleVal;
	this.recordingVal = false;
	//this.displayingVal = false;
	this.recordStopVal = undefined;
	//this.displayStopVal = undefined;
	this.readoutVal;
}

WallMethods.DataObj.prototype = {
	id: function(id) {
		if (id) this.idVal = id;
		return this.idVal;
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
	// displaying: function(displaying) {
		// if (displaying !== undefined) this.displayingVal = displaying;
		// return this.displayingVal;
	// },
	//attn: the function behavior is different from the value behavior.  It calls instead of returns the values if no argument is given.
	//This is inconsistant, but I think fits the use cases better
	recordStop: function(func) {
		if (func) {
			this.recordStopVal = func;
		} else if (this.recordStopVal && this.recordingVal) {
			this.recordStopVal();
		}
	},
	// displayStop: function(func) {
		// if (func) {
			// this.displayStopVal = func;
		// } else if (this.displayStopVal && this.displayingVal) {
			// this.displayStopVal();
		// }
	// },
}