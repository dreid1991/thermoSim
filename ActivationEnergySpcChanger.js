function ActivationEnergySpcChanger(collideHandler) {
	this.collideHandler = collideHandler;
	this.pairs = {}; //map of spcName to the threshold data, which is high/low
	this.active = false;
	this.standardBreakUp = this.collideHandler.breakUp;
	this.breakUpFunc = this.makeBreakUpFunc();
}
// the pair object is not an attribute of the changer to make this fit into the object framework
ActivationEnergySpcChanger.prototype = {
	addPair: function(pairObj) {
		//have check that spc names exist by this point
		var nameLow = pairObj.spcNameLow;
		var nameHigh = pairObj.spcNameHigh;
		if (this.pairs[nameLow] || this.pairs[nameHigh]) {
			console.log('Trying to add another energy threshold to either ' + nameLow + ' or ' + nameHigh); 
		} else {
			this.pairs[pairObj.spcNameLow] = pairObj;
			this.pairs[pairObj.spcNameHigh] = pairObj;
			if (!this.active) this.addActiveEBreakUp();
		}
		
	},
	removePair: function(pairObj) {
		delete this.pairs[pairObj.spcNameLow];
		delete this.pairs[pairObj.spcNameHigh];
		if (!countAttrs(this.pairs)) {
			this.active = false;
			this.restoreBreakUp();
		}
	},
	addActiveEBreakUp: function() {
		this.collideHandler.breakUp = this.breakUpFunc;
	},
	restoreBreakUp: function() {
		this.collideHandler.breakUp = this.standardBreakUp;
	},
	makeBreakUpFunc: function() {
		var self = this;
		return function(a, b, UVAB) {
			var kineticEnergy;
			var pairA = self.pairs[a.spcName];
			var pairB = self.pairs[b.spcName];
			if (pairA) {
				kineticEnergy = a.kineticEnergy();
				if (pairA.activationEnergy >= kineticEnergy && a.spcName == pairA.spcNameHigh) {
					dotManager.changeDotSpc([a], pairA.spcNameLow);
				} else if (pairA.activationEnergy < kineticEnergy && a.spcName == pairA.spcNameLow) {
					dotManager.changeDotSpc([a], pairA.spcNameHigh);
				}
			}
			if (pairB) {
				kineticEnergy = b.kineticEnergy();
				if (pairB.activationEnergy >= kineticEnergy && b.spcName == pairB.spcNameHigh) {
					dotManager.changeDotSpc([b], pairB.spcNameLow);
				} else if (pairB.activationEnergy < kineticEnergy && b.spcName == pairB.spcNameLow) {
					dotManager.changeDotSpc([b], pairB.spcNameHigh);
				}			
			}
			self.standardBreakUp(a, b, UVAB);
		}
	}
}