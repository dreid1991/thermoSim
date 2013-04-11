function ThresholdEnergySpcChanger(collideHandler) {
	this.collideHandler = collideHandler;
	this.pairs = {}; //map of spcName to the threshold data, which is high/low
	this.active = false;
	this.standardBreakUp = this.collideHandler.breakUp;
	this.breakUpFunc = this.makeBreakUpFunc();
}
// the pair object is not an attribute of the changer to make this fit into the object framework
ThresholdEnergySpcChanger.prototype = {
	addPair: function(pairObj) {
		//have check that spc names exist by this point
		var nameLow = pairObj.spcNameLow;
		var nameHigh = pairObj.spcNameHigh;
		if (this.pairs[nameLow] || this.pairs[nameHigh]) {
			console.log('Trying to add another energy threshold to either ' + nameLow + ' or ' + nameHigh); 
		} else {
			this.replaceCollideBreak
		}
		if (!this.active) 
			this.initBreakUp();
	},
	removePair: function(pairObj) {
		delete this.pairs[pairObj.spcNameLow];
		delete this.pairs[pairObj.spcNameHigh];
		if (!countAttrs(this.pairs)) {
			this.active = false;
			this.restoreBreakUp();
		}
	},
	initBreakUp: function() {
		this.collideHandler.breakUp = this.breakUpFunc;
	},
	restoreBreakUp: function() {
		this.collideHandler.breakUp = this.standardBreakUp;
	},
	makeBreakUpFunc: function() {
		var self = this;
		return function(a, b, UVAB) {
			var internalEnergy;
			var pairA = self.pairs[a.spcName];
			var pairB = self.pairs[b.spcName];
			if (pairA) {
				internalEnergy = a.internalEnergy();
				if (pairA.thresholdEnergy >= internalEnergy && a.spcName == pairA.spcNameLow) {
					dotManager.changeDotSpc([a], pairA.spcNameHigh);
				} else if (pairA.thresholdEnergy < internalEnergy && a.spcName == pairA.spcNameHigh) {
					dotManager.changeDotSpc([a], pairA.spcNameLow);
				}
			}
			if (pairB) {
				internalEnergy = b.internalEnergy();
				if (pairB.thresholdEnergy >= internalEnergy && b.spcName == pairB.spcNameLow) {
					dotManager.changeDotSpc([b], pairB.spcNameHigh);
				} else if (pairB.thresholdEnergy < internalEnergy && b.spcName == pairB.spcNameHigh) {
					dotManager.changeDotSpc([b], pairB.spcNameLow);
				}			
			}
			self.standardBreakUp(a, b, UVAB);
		}
	}
}