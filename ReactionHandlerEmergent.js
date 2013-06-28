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

// rxnCnts = {aa: 0, ab: 0, bb: 0};

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


	//end public
	initPair: function(rxn) {
		//rctA, rctB, rctDefA, rctDefB, activeTemp, hRxn, prods
		
		var idStr = this.collide.getIdStr(rxn.rctADef, rxn.rctBDef);
		
		this.rxns[idStr] ? this.rxns[idStr].push(rxn) : this.rxns[idStr] = [rxn];
		
		var isMultiple = this.rxns[idStr].length > 1;

		if (isMultiple) {
			if (this.rxnTypesSame(this.rxns[idStr])) {
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
	rxnTypesSame: function(rxns) {
		if (rxns.length) {
			for (var i=1; i<rxns.length; i++) {
				if (rxns[i].constructor != rxns[0].constructor) {
					return false;
				}
			}
			return true;
		} else {
			return true;
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
	//internally formatted as [{name:'...', count:#}..]

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
	react: function(a, b, prods) {
		var uRct = a.internalEnergy() + b.internalEnergy();
		var uF298Prod = 0;
		var cVProd = 0;
		var x = .5*(a.x + b.x);
		var y = .5*(a.y + b.y);
		var newDotsBySpc = [];
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var name = prods[prodIdx].name;
			var spc = this.spcs[name];
			var prod = prods[prodIdx];
			var spcDots = [];
			uF298Prod += spc.uF298 * prod.count;
			cVProd += this.spcs[name].cv * prod.count;
			for (var countIdx=0; countIdx<prod.count; countIdx++) {
				var angle = Math.random()*2*Math.PI;
				var UV = V(Math.sin(angle), Math.cos(angle));
				
				spcDots.push(D(x+UV.dx*3, y+UV.dy*3, UV, name, a.tag, a.elemId, a.returnTo)); 
			}
			newDotsBySpc.push(spcDots);
			
		}
		uF298Prod *= 1000 / N; //kj/mol -> j/molec;
		cVProd /= N; //j/mol -> j/molec
		//kind of slopping between enthalpy and internal energy.  It should all be internal energy
		var tempF = (uRct - uF298Prod) / cVProd + 298.15;
		if (tempF > 0) {
			this.dotManager.remove([a, b]);
			for (var spcIdx=0; spcIdx<newDotsBySpc.length; spcIdx++) {
				var spcDots = newDotsBySpc[spcIdx];
				this.dotManager.add(spcDots);
				for (var dotIdx=0; dotIdx<spcDots.length; dotIdx++) {
					spcDots[dotIdx].setTemp(tempF);
				}
			}
			return true;
		}
		return false;
		
	}
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
		this.sRxn298 = this.calcSRxn([new ReactionHandlerEmergent.ReactionComponent(this.rctA, 1), new ReactionHandlerEmergent.ReactionComponent(this.rctB, 1)], this.prods, this.parent.spcs); 

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
		for (var i=0; i<prods.length; i++) sRxn += spcs[prods[i].name].sF298 * prods[i].count;
		for (var i=0; i<rcts.length; i++) sRxn -= spcs[rcts[i].name].sF298 * prods[i].count;
		return sRxn;
		
	},
	increaseProd: function(spcName, increaseBy) {
		var isEntry = false;
		for (var prodIdx=0; prodIdx<this.prods.length; prodIdx++) {
			var prod = this.prods[prodIdx];
			if (prod.name == spcName) {
				prod.count += increaseBy;
				isEntry = true;
				break;
			}
		}
		if (!isEntry) this.prods.push(new ReactionHandlerEmergent.ReactionComponent(spcName, increaseBy));
		this.prodCount += increaseBy;
		return this;
	},
	reformatProds: function(prods) {
		var reformat = [];
		for (var name in prods) {
			reformat.push(new ReactionHandlerEmergent.ReactionComponent(name, prods[name]));
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

ReactionHandlerEmergent.ReactionComponent = function(name, count) {
	this.name = name;
	this.count = count;
}