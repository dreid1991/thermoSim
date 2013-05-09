/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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