// rxnCnts = {aa: 0, ab: 0, bb: 0};

ReactionHandler = {
	addReaction: function(attrs){ //rctA, rctB, hRxn, activeE, prods)
		attrs.parent = this;
		var rxn = new ReactionHandler.Reaction(attrs);
		
		this.initRxn(rxn);
		return rxn;

	},
	rxnIsEnabled: function(handle) {
		var active = this.getRxn(this.activeRxns, handle);
		return active ? true : false;
	},
	disableRxn: function(handle) {
		this.removeRxn(handle);
	},
	enableRxn: function(handle) {
		var rxn = this.getRxn(this.pausedRxns, handle);
		if (rxn) {
			this.pausedRxns.splice(this.pausedRxns.indexOf(rxn), 1);
			this.initRxn(rxn);
		}
	},
	removeRxn: function(handle) {
		for (var rxnId in this.rxns) {
			var spcRxns = this.rxns[rxnId];
			var removedRxn = false;
			for (var spcRxnIdx=0; spcRxnIdx<spcRxns.length; spcRxnIdx++) {
				var spcRxn = spcRxns[spcRxnIdx];
				if (spcRxn.handle == handle) {
					spcRxns.splice(spcRxnIdx, 1);
					removedRxn = true;
				
				}
			
			}
			if (removedRxn) {
				if (spcRxns.length == 0) {
					this.setHandlerByIdStr(rxnId, {func:this.impactStd, obj:this})
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
	getRxn: function(rxns, handle) {
		for (var i=0; i<rxns.length; i++) {
			if (handle == rxns[i].handle) return rxns[i];
		}
	},
	initRxn: function(rxn) {
		if (rxn.rctA && rxn.rctB) {
			this.initPair(rxn)
		} else if (rxn.rctA) {
			this.initDecomp(rxn);
		}
		this.activeRxns.push(rxn);
		
	},
	


	//make a removeReaction function
	removeAllReactions: function(){
		this.setDefaultHandler({func:this.impactStd, obj:this});
	},
	getIdStr: function(defA, defB) {
		return defA.idNum < defB.idNum ? defA.idNum + '-' + defB.idNum : defB.idNum + '-' + defA.idNum;
	},
	//end public
	//maybe automatically adding reverse should reverse activE be specified
	initPair: function(rxn) {
		//rctA, rctB, rctDefA, rctDefB, activeTemp, hRxn, prods
		
		var idStr = this.getIdStr(rxn.rctADef, rxn.rctBDef);
		
		this.rxns[idStr] ? this.rxns[idStr].push(rxn) : this.rxns[idStr] = [rxn];
		
		var isMultiple = this.rxns[idStr].length > 1;

		if (isMultiple) {
			this.setHandler(rxn.rctA, rxn.rctB, {func:this.rctHandlerMultPairs(idStr), obj:this});
		} else {
			this.setHandler(rxn.rctA, rxn.rctB, {func:this.rctHandlerSinglePair(idStr), obj:this});
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
	initDecomp: function(rxn) {
		var rctA = rxn.rctA;
		var idA = rxn.rctADef.idNum;
		for (var rctB in this.spcs) {
			var rxnPair = rxn.copy();
			var rctBDef = this.spcs[rctB];
			rxnPair.rctB = rctB;
			rxnPair.rctBDef = rctBDef;
			
			var idB = rctBDef.idNum;
			if (idA == idB) {
				rxnPair.activeE *= 2;
				rxnPair.doubleProds();
			} else {
				rxnPair.increaseProd(rctB, 1);
			}
			this.initPair(rxnPair);
			
		}
		// var doubleDecomp = rxn.copy();
		// doubleDecomp.rctB = doubleDecomp.rctA;
		// doubleDecomp.rctBDef = doubleDecomp.rctADef;
		// doubleDecomp.activeE *= 2;
		// doubleDecomp.doubleProds();
		// this.initPair(doubleDecomp);
	},

	hitE: function(a, b, perpAB, perpBA){
		return .5*(Math.abs(perpAB)*perpAB*a.m*a.cvKinetic + Math.abs(perpBA)*perpBA*b.m*b.cvKinetic)*this.tConst;
		//abs will handle dots moving away from other dot
	},
	probFunc: function(hitE, activE) {
		return hitE > activE ? 1 : 0;
		//var x = Math.max(hitE/activE - 1, 0);
		//return 2*(x - .5*x*x);//max of 1, min of 0
	},
	rctHandlerSinglePair: function(idStr) {
		var rxn = this.rxns[idStr][0];
		var activeE = rxn.activeE;
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
			if (Math.random() < this.probFunc(hitE, activeE)) {
				if (!this.react(a, b, prods)) {
					return this.impactStd(a, b, UVAB, perpAB, perpBA);
				}
				return false;
			}
			return this.impactStd(a, b, UVAB, perpAB, perpBA);
		
		};
		
	},
	rctHandlerMultPairs: function(idStr) {
		var rxns = this.rxns[idStr];
		
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
				probs[rxnIdx] = this.probFunc(hitE, rxns[rxnIdx].activeE);
				sumProbs += probs[rxnIdx];
			}
			var normalFact = sumProbs > 1 ? 1 / sumProbs : 1;
			
			var rxnIdx = this.pickRxnIdx(probs, normalFact);
			
			if (rxnIdx===false) {
				return this.impactStd(a, b, UVAB, perpAB, perpBA);
			} else if (!this.react(a, b, rxns[rxnIdx].prods)){
				return this.impactStd(a, b, UVAB, perpAB, perpBA);
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
		var hFRct = a.enthalpy() + b.enthalpy();
		var hF298Prod = 0;
		var cPProd = 0;
		var x = .5*(a.x + b.x);
		var y = .5*(a.y + b.y);
		var newDotsBySpc = [];
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var name = prods[prodIdx].name;
			var spc = this.spcs[name];
			var prod = prods[prodIdx];
			var spcDots = [];
			hF298Prod += spc.hF298 * prod.count;
			cPProd += this.spcs[name].cp * prod.count;
			for (var countIdx=0; countIdx<prod.count; countIdx++) {
				var angle = Math.random()*2*Math.PI;
				var UV = V(Math.sin(angle), Math.cos(angle));
				
				spcDots.push(D(x+UV.dx*3, y+UV.dy*3, UV, name, a.tag, a.elemId, a.returnTo)); 
			}
			newDotsBySpc.push(spcDots);
			
		}
		hF298Prod *= 1000 / N; //kj/mol -> j/molec;
		cPProd /= N; //j/mol -> j/molec
		var tempF = (hFRct - hF298Prod) / cPProd + 298.15;
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
}

ReactionHandler.Reaction = function(attrs) { //prods as {name1: count, name2, count2}  hRxn in kj/mol, activeE in kj/mol, convert to j/dot
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

	},

ReactionHandler.Reaction.prototype = {
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
		if (!isEntry) this.prods.push({name: spcName, count: increaseBy});
		this.prodCount += increaseBy;
		return this;
	},
	reformatProds: function(prods) {
		var reformat = [];
		for (var name in prods) {
			reformat.push({name:name, count:prods[name]});
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