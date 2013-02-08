ReactionHandler = {
	addReaction: function(attrs){ //rctA, rctB, hRxn, activeTemp, prods)
		attrs.parent = this;
		var rxn = new this.Reaction(attrs);
		
		if (rxn.rctA && rxn.rctB) {
			this.initPair(rxn)
		} else if (rxn.rctA) {
			this.initDecomp(rxn);
		} else {
			console.log('Bad reaction names');
			console.log(attrs);
			console.trace();
		}
	},
	removeRxn: function(handle) {
		for (var rxnId in this.rxns) {
			var spcRxns = this.rxns[rxnId];
			var removedRxn = false;
			for (var spcRxnIdx=0; spcRxnIdx<spcRxns.length; spcRxnIdx++) {
				var spcRxn = spcRxns[spcRxnIdx];
				if (spcRxn.handle == handle) {
					spcRxn.splice(spcRxnIdx, 1);
					removedRxn = true;
				
				}
			
			}
			if (removedRxn) {
				if (spcRxn.length == 0) {
					this.setHandlerByIdStr(rxnId, {func:this.impactStd, obj:this})
				} else if (spcRxn.length ==1) {
					var rxn = spcRxns[0];
					this.initPair(rxn, true);
				}
			}
		}
	},
	
	Reaction: function(attrs) { //prods as {name1: count, name2, count2}  hRxn in kj/mol, activeTemp in kelvin
		this.handle = attrs.handle;
		this.parent = attrs.parent;
		this.rctA = attrs.rctA || attrs.rctB; //spcName
		this.rctB = attrs.rctA && attrs.rctB ? attrs.rctB : undefined; //spcName
		this.rctADef = this.parent.defs[this.rctA];
		this.rctBDef = this.parent.defs[this.rctB];
		this.activeTemp = attrs.activeTemp;
		this.hRxn = this.convertHRxn(attrs.hRxn); //to temperature
		
		if (this.rctA && !this.rctADef) return console.log('reactant a ' + this.rctA + " doesn't exist");
		if (this.rctB && !this.rctBDef) return console.log('reactant b ' + this.rctB + " doesn't exist");
		
		this.prods = this.reformatProds(attrs.prods);
		this.prodCount = this.countProds(this.prods);

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
	initPair: function(rxn, reIniting) {
		//rctA, rctB, rctDefA, rctDefB, activeTemp, hRxn, prods
		
		var idStr = this.getIdStr(rxn.rctADef, rxn.rctBDef);
		
		if (!reIniting) this.rxns[idStr] ? this.rxns[idStr].push(rxn) : this.rxns[idStr] = [rxn];
		
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
	addRxnDecomp: function(aName, hRxn, activE, prods) {
		var idA = speciesDefs[aName].idNum;
	

		var pairProdsDouble = this.doubleProds(deepCopy(prods));
		this.addRxnPair(aName, aName, 2*hRxn, 2*activE, pairProdsDouble);
		//so if it hits itself, both can decompose with twice deltaHRxn and activation energy, or just one can through reaction below

		for (var spcDefName in speciesDefs) {
			var spcDef = speciesDefs[spcDefName];
			var idB = spcDef.idNum;

			var pairProds = this.plusOne(deepCopy(prods), spcDefName);
			
			this.addRxnPair(aName, spcDefName, hRxn, activE, pairProds);
			
		}
	},
	doubleProds: function(prods) {
		for (var prod in prods) {
			prods[prod]*=2;
		}
		return prods;
	},
	plusOne: function(prods, spc) {
		if (prods[spc] === undefined) {
			prods[spc] = 1;
		} else {
			prods[spc]++;
		}
		return prods;
	},
	hitTemp: function(a, b, perpAB, perpBA){
		return .5*(Math.abs(perpAB)*perpAB*a.m + Math.abs(perpBA)*perpBA*b.m)*this.tConst;
		//abs will handle dots moving away from other dot
		//in temperature
	},
	probFunc: function(hitTemp, activE) {
		var x = Math.max(hitTemp/activE - 1, 0);
		return 2*(x - .5*x*x);//max of 1, min of 0
	},
	rctHandlerSinglePair: function(idStr) {
		var rxn = this.rxns[idStr][0];
		var activeTemp = rxn.activeTemp;
		var hRxn = rxn.hRxn;
		var prods = rxn.prods;
		var prodCount = rxn.prodCount;
		return function(a, b, UVAB, perpAB, perpBA) {
			var hitTemp = this.hitTemp(a, b, perpAB, -perpBA);
			if (Math.random() < this.probFunc(hitTemp, activeTemp)) {
				this.react(a, b, hRxn, prods, prodCount)
				return false;
			}
			return this.impactStd(a, b, UVAB, perpAB, perpBA);
		
		};
		
	},
	rctHandlerMultPairs: function(idStr) {
		var rxns = this.rxns[idStr];
		
		return function(a, b, UVAB, perpAB, perpBA) {
			var hitTemp = this.hitTemp(a, b, perpAB, -perpBA);
			var probs = [];
			var sumProbs = 0;
			for (var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++) {
				probs[rxnIdx] = this.probFunc(hitTemp, rxns[rxnIdx].activeTemp);
				sumProbs += probs[rxnIdx];
			}
			var normalFact = sumProbs > 1 ? 1 / sumProbs : 1;
			
			var rxnIdx = this.pickRxnIdx(probs, normalFact);
			
			if (rxnIdx===false) {
				return this.impactStd(a, b, UVAB, perpAB, perpBA);
			} else {
				this.react(a, b, rxns[rxnIdx].hRxn, rxns[rxnIdx].prods, rxns[rxnIdx].prodCount);
				return false;
			}
		};
		
	},
	
	pickRxnIdx: function(probs, normalFact) {
		var rnd = Math.random();
		var sum = 0;
		for (var probIdx=0; probIdx<probs.length; probIdx++) {
			sum += probs[probIdx] * normalFact;
			if (sum>=rnd) {
				return probIdx;
			}
		}
		return false;
	},
	react: function(a, b, hRxn, prods, prodCount) {
		var prodTemp = (a.temp() + b.temp() - hRxn)/prodCount; 
		this.dotManager.remove([a, b]);
		var x = .5*(a.x + b.x);
		var y = .5*(a.y + b.y);
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var name = prods[prodIdx].name;
			var newDots = new Array(prods[prodIdx].count);
			for (var countIdx=0; countIdx<prods[prodIdx].count; countIdx++) {
				var angle = Math.random()*2*Math.PI;
				var UV = V(Math.sin(angle), Math.cos(angle))
				newDots[countIdx] = D(x+UV.dx*3, y+UV.dy*3, UV, this.defs[name].m, this.defs[name].r, name, this.defs[name].idNum, a.tag, a.returnTo); 
				newDots[countIdx].setTemp(prodTemp);
			}
			this.dotManager.add(newDots);
		}
		return false;
		
	},

	checkMassConserve: function(a, b, products){
		var massIn = a.m + b.m;
		var massOut = 0;
		for (var prodIdx=0; prodIdx<products.length; prodIdx++){
			massOut += spcs[products[prodIdx].spc].m*products[prodIdx].count;
		}
		if(massIn!=massOut){
			console.log('YOUR ATTENTION PLEASE: MASS IS NOT CONSERVED IN THE REACTION BETWEEN ' + a.name + ' AND ' + b.name);
		}
	},	

}

ReactionHandler.Reaction.prototype = {

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
	convertHRxn: function(hRxn) {
		return tConst * hRxn;// / (JtoKJ * N) <- equals 1
	
	},
}