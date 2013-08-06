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


function ReactionHandlerEmergent(collide, dotManager, rxns, tConst, activeRxns, pausedRxns) {
	this.collide = collide;
	this.dotManager = dotManager;
	this.tConst = tConst
	this.rxns = rxns;
	this.spcs = undefined; //set in collide's setSpcs func
	this.activeRxns = activeRxns;
	this.pausedRxns = pausedRxns;
}

_.extend(ReactionHandlerEmergent.prototype, ReactionFuncs, {
	addReaction: function(attrs){ //rctA, rctB, hRxn, activeE, prods)
		attrs.parent = this;
		var rxn = new ReactionHandlerEmergent.Reaction(attrs);
		
		this.initRxn(rxn);
		return rxn;

	},
	enableRxn: function(handle) {
		var rxn = this.getRxn(this.pausedRxns, handle);
		if (rxn) {
			this.pausedRxns.splice(this.pausedRxns.indexOf(rxn), 1);
			this.initRxn(rxn);
		}
	},
	disableRxn: function(handle) {
		this.removeRxn(handle);
	},
	removeRxn: function(handle) {
		for (var rxnId in this.rxns) {
			var spcRxns = this.rxns[rxnId];
			var removedRxn = false;
			for (var spcRxnIdx=spcRxns.length - 1; spcRxnIdx>=0; spcRxnIdx--) {
				var spcRxn = spcRxns[spcRxnIdx];
				if (spcRxn.handle == handle) {
					spcRxns.splice(spcRxnIdx, 1);
					removedRxn = true;
				
				}
			
			}
			if (removedRxn) {
				if (spcRxns.length == 0) {
					this.collide.setHandlerByIdStr(rxnId, {func:this.collide.impactStd, obj:this.collide})
				} else if (spcRxns.length ==1) {
					var rxn = spcRxns[0];
					this.initPair(rxn, true);
				}
			}
		}
		var rxn = this.getRxn(this.activeRxns, handle);
		if (rxn) {
			this.activeRxns.splice(this.activeRxns.indexOf(rxn), 1);
			this.pausedRxns.push(rxn);
		}
	},

	initRxn: function(rxn) {
		this.initPair(rxn)

		this.activeRxns.push(rxn);
		
	},
	
	removeAllReactions: function(){
		this.collide.setDefaultHandler({func:this.collide.impactStd, obj:this});
	},

	//end public
	initPair: function(rxn) {
		//rctA, rctB, rctDefA, rctDefB, activeTemp, hRxn, prods
		
		var idStr = this.collide.getIdStr(rxn.rctADef, rxn.rctBDef);
		
		this.rxns[idStr] ? this.rxns[idStr].push(rxn) : this.rxns[idStr] = [rxn];
		
		var isMultiple = this.rxns[idStr].length > 1;

		if (isMultiple) {
			if (this.rxnsAreType(this.rxns[idStr], ReactionHandlerEmergent.Reaction)) {//make sure this works
				this.collide.setHandler(rxn.rctA, rxn.rctB, {func:this.rctHandlerMultPairs(idStr), obj:this});
			} else {
				console.log('Cannot mix reaction types.');
				console.log('Failed to add reaction: ');
				console.log(rxn);
			}
		} else {
			this.collide.setHandler(rxn.rctA, rxn.rctB, {func:this.rctHandlerSinglePair(idStr), obj:this});
		}	
	},
	countProds: function(prods) {
		var count = 0;
		for (var prod in prods) {
			count+=prods[prod];
		}
		return count;
	},
	//Input prods as {name:count, ...}  
	//reformatting since looping through array is faster than looping through obj
	//internally formatted as [{spcName:'...', count:#}..]

	hitE: function(a, b, perpAB, perpBA){
		return .5*(Math.abs(perpAB)*perpAB*a.m*a.cvKinetic + Math.abs(perpBA)*perpBA*b.m*b.cvKinetic)*this.tConst;
		//abs will handle dots moving away from other dot
	},
	probFunc: function(hitE, activE, sRxn298) {
		return hitE > 1.5 * activE ? 1 / (1 + Math.exp(-sRxn298 / R)) : 0;
/*
Excuse me.  Please take a minute to marvel at the beauty and simplicity of that probability function.  And that it works with respect to hRxn, sRxn, and temp.
the 1.5 * activE is to convert from 2d -> 3d, because in 2 dimensional space, it's more likely that your vectors will point towards each other, so to 
make it behave like 3 dimensional stuff, we have to scale hitE down by 2/3, or activE up by 1.5.  Cool, right?
So if it hits the threshold, we feed the entropy into a sigmoid function. Thermo says entropy's contribution to exp of eq. const is sRxn298 / R.  
And emperically, it shows up here too.  I think there is something pretty fundamental to that.  I chose a sigmoid because it deals with edge cases very nicely,
and it just so happens, it works!  Maybe I've stumbled upon the probability shape that linear changes in entropy of reaction describe (with same collision radius, mass)

		
*/
	},
	rctHandlerSinglePair: function(idStr) {
		var rxn = this.rxns[idStr][0];
		var activeE = rxn.activeE;
		var collide = this.collide;
		var prods = rxn.prods;
		return function(a, b, UVAB, perpAB, perpBA) {
			var hitE = this.hitE(a, b, perpAB, -perpBA);
			if (Math.random() < this.probFunc(hitE, activeE, rxn.sRxn298)) {
				if (!this.react(a, b, prods)) {
					return collide.impactStd(a, b, UVAB, perpAB, perpBA);
				}
				return false;
			}
			return collide.impactStd(a, b, UVAB, perpAB, perpBA);
		
		};
		
	},
	rctHandlerMultPairs: function(idStr) {
		var rxns = this.rxns[idStr];
		var collide = this.collide;
		return function(a, b, UVAB, perpAB, perpBA) {
			// if (a.spcName == 'ugly' && b.spcName == 'ugly') {
				// rxnCnts.aa++;
			// } else if (a.spcName == 'ugly' && b.spcName == 'uglier') {
				// rxnCnts.ab++;
			// } else if (a.spcName == 'uglier' && b.spcName == 'ugly') {
				// rxnCnts.ab++;
			// } else if (a.spcName == 'uglier' && b.spcName == 'uglier') {
				// rxnCnts.bb++;
			// }
			var hitE = this.hitE(a, b, perpAB, -perpBA);
			var probs = [];
			var sumProbs = 0;
			for (var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++) {
				probs[rxnIdx] = this.probFunc(hitE, rxns[rxnIdx].activeE, rxn.sF298);
				sumProbs += probs[rxnIdx];
			}
			var normalFact = sumProbs > 1 ? 1 / sumProbs : 1;
			
			var rxnIdx = this.pickRxnIdx(probs, normalFact);
			
			if (rxnIdx===false) {
				return collide.impactStd(a, b, UVAB, perpAB, perpBA);
			} else if (!this.react(a, b, rxns[rxnIdx].prods)){
				return collide.impactStd(a, b, UVAB, perpAB, perpBA);
			} else {
				return false;
			}
		};
		
	},
	
	pickRxnIdx: function(probs, normalFact) {
		var threshold = Math.random();
		var sum = 0;
		for (var probIdx=0; probIdx<probs.length; probIdx++) {
			sum += probs[probIdx] * normalFact;
			if (sum > threshold) {
				return probIdx;
			}
		}
		return false;
	},

})

ReactionHandlerEmergent.Reaction = function(attrs) { //prods as {name1: count, name2, count2}  hRxn in kj/mol, activeE in kj/mol, convert to j/dot
		this.attrs = attrs;
		this.handle = attrs.handle;
		this.parent = attrs.parent;
		this.rctA = attrs.rctA || attrs.rctB; //spcName
		this.rctB = attrs.rctA && attrs.rctB ? attrs.rctB : undefined; //spcName
		this.rctADef = this.parent.spcs[this.rctA];
		this.rctBDef = this.parent.spcs[this.rctB];
		this.activeE = attrs.activeE * 1000 / N; // in joules of collision
		//this.hRxn = attrs.hRxn * 1000 / N; //only used if hRxn fixed
		
		if (this.rctA && !this.rctADef) return console.log('reactant a ' + this.rctA + " doesn't exist");
		if (this.rctB && !this.rctBDef) return console.log('reactant b ' + this.rctB + " doesn't exist");
		
		this.prods = this.reformatProds(attrs.prods);
		this.prodCount = this.countProds(this.prods);
		this.sRxn298 = this.calcSRxn([new ReactionComponent(this.rctA, 1), new ReactionComponent(this.rctB, 1)], this.prods, this.parent.spcs); 

	},

ReactionHandlerEmergent.Reaction.prototype = {
	copy: function() {
		var copy = new this.parent.Reaction(this.attrs);
		return copy; //no mutable values from attrs are used directly, so this should be safe.
	},
	doubleProds: function() {
		for (var prodIdx=0; prodIdx<this.prods.length; prodIdx++) {
			this.prods[prodIdx].count *= 2;
		}
		this.prodCount *= 2;
		return this;
	},
	calcSRxn: function(rcts, prods, spcs) {
		var sRxn = 0;
		//kJ/mol
		for (var i=0; i<prods.length; i++) sRxn += spcs[prods[i].spcName].sF298 * prods[i].count;
		for (var i=0; i<rcts.length; i++) sRxn -= spcs[rcts[i].spcName].sF298 * prods[i].count;
		return sRxn;
		
	},
	increaseProd: function(spcName, increaseBy) {
		var isEntry = false;
		for (var prodIdx=0; prodIdx<this.prods.length; prodIdx++) {
			var prod = this.prods[prodIdx];
			if (prod.spcName == spcName) {
				prod.count += increaseBy;
				isEntry = true;
				break;
			}
		}
		if (!isEntry) this.prods.push(new ReactionComponent(spcName, increaseBy));
		this.prodCount += increaseBy;
		return this;
	},
	reformatProds: function(prods) {
		var reformat = [];
		for (var spcName in prods) {
			reformat.push(new ReactionComponent(spcName, prods[spcName]));
		}
		return reformat;	
	},
	countProds: function(prods) {
		var count = 0;
		for (var idx=0; idx<prods.length; idx++) {
			count += prods[idx].count;
		}
		return count;
	},
	remove: function() {
		this.parent.removeRxn(this.handle);
	}
}

