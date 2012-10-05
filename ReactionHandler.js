ReactionHandler = {
	addRxn: function(aName, bName, hRxn, activE, prods) {
		if (bName) {
			this.addRxnPair(aName, bName, hRxn, activE, prods);
		} else {
			this.addRxnDecomp(aName, hRxn, activE, prods);
		}

	},
	//maybe automatically adding reverse should reverse activE be specified
	addRxnPair: function(aName, bName, hRxn, activE, prods) {
		var idA = speciesDefs[aName].idNum;
		var idB = speciesDefs[bName].idNum;
		var low = Math.min(idA, idB);
		var high = Math.max(idA, idB);
		var idStr = low + '-' + high;
		this.rxns[idStr].push({hRxn:hRxn, activE:activE, prods:this.flattenProds(prods)});
		if (this.rxns[idStr].length==1) {
			this.setHandler(aName, bName, {func:this.setupReactSinglePair(this.rxns[idStr]), obj:this});
		} else {
			this.setHandler(aName, bName, {func:this.setupReactMultPairs(this.rxns[idStr]), obj:this});
		}	
	},
	//Input prods as {name:count, ...}
	//for a rxn, if any returnTos/tags are set, will not inherit from a parent
	//if are tags specified, prods ->[{name:'...', returnTo:'...', tag:'...'}//one entry for each prod
	//else -> ['myName'...] one entry for each prod
	addRxnDecomp: function(aName, hRxn, activE, prods) {
		var idA = speciesDefs[aName].idNum;
		for (var spcDefName in speciesDefs) {
			var spcDef = speciesDefs[spcDefName];
			var idB = spcDef.idNum;
			if (idA==idB) {
				var pairProds = deepCopy(prods).concat(deepCopy(prods));
				this.addRxnPair(aName, aName, 2*hRxn, 2*activE, pairProds);
			} //so if it hits itself, both can decompose with twice deltaHRxn and activation energy, or just one can through reaction below
			var pairProds = deepCopy(prods).push({name:spcDefName, count:1});
			this.addRxnPair(aName, spcDefName, hRxn, activE, pairProds);
			
		}
	},
	flattenProds: function(prods) {
		var flatProds = [];
		var hasTags = this.checkHasTags(prods);
		if (hasTags) {
			for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
				var prod = prods[prodIdx];
				for (var countIdx=0; countIdx<prod.count; countIdx++) {
					flatProds.push({name:prod.name, returnTo:prod.returnTo, tag:prod.tag});
				}
			}
		} else {
			for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
				var prod = prods[prodIdx];
				for (var countIdx=0; countIdx<prod.count; countIdx++) {
					flatProds.push(prod.name);
				}
			}
		}
		return flatProds;
	},
	checkHasTags: function(prods) {
		var hasTags = false;
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var prod = prods[prodIdx];
			if (prod.returnTo || prod.tag) {
				return true;
			}
		}
		return false;
	},
	removeAllReactions: function(){
		removeListenerByName(curLevel, 'data', 'trackExtentRxn');
		this.setDefaultHandler({func:this.impactStd, obj:this});
	},
	hitTemp: function(a, b, perpAB, perpBA){
		return .5*(perpAB*perpAB*a.m + perpBA*perpBA*b.m)*this.tConst;
		//in temperature
	},
	probFunc: function(hitTemp, activE) {
		var x = Math.max(hitTemp/activE - 1, 0);
		return 2*(x - .5*x*x);//max of 1, min of 0
	},
	setupReactSinglePair: function(pairs) {
		var activE = pairs[0].activE;
		var hRxn = pairs[0].hRxn;
		var prods = pairs[0].prods;
		if (pairs[0].prods instanceof Object) {
			return function(a, b, UVAB, perpAB, perpBA) {
				var hitTemp = this.hitTemp(a, b, perpAB, perpBA);
				if (Math.random()>this.probFunc(hitTemp, activE)) {
					this.reactTagsSpecified(a, b, hRxn, prods)
					return false;
				}
				return this.impactStd(a, b, UVAB, perpAB, perpBA);
			
			};			
		} else {
			return function(a, b, UVAB, perpAB, perpBA) {
				var hitTemp = this.hitTemp(a, b, perpAB, perpBA);
				if (Math.random()>this.probFunc(hitTemp, activE)) {
					this.reactInheritTags(a, b, hRxn, prods)
					return false;
				}
				return this.impactStd(a, b, UVAB, perpAB, perpBA);
			
			};
		}
	},
	setupReactMultPairs: function(pairs) {
		if (pairs[0] instanceof Object) {
			return function(a, b, UVAB, perpAB, perpBA) {
				var hitTemp = this.hitTemp(a, b, perpAB, perpBA);
				var probs = new Array(pairs.length);
				var sumProbs = 0;
				for (var pairIdx=0; pairIdx<pairs.length; pairIdx++) {
					probs[pairIdx] = this.probFunc(hitTemp, pairs[pairIdx].activE);
					sumProbs += probs[pairIdx];
				}
				if (sumProbs>1) {
					var correctionFac = 1/sumProbs;
					for (var probIdx=0; probIdx<probs.length; probIdx++) {
						probs[probIdx]*=correctionFac;
					}
				}
				var rxnIdx = this.pickRxnIdx(probs);
				if (rxnIdx===false) {
					return this.impactStd(a, b, UVAB, perpAB, perpBA);
				} else {
					this.reactTagsSpecified(a, b, pairs[rxnIdx].hRxn, pairs[rxnIdx].prods);
					return false;
				}
			};
		}
	},
	
	pickRxnIdx: function(probs) {
		var rnd = Math.random();
		var sum = 0;
		for (var probIdx=0; probIdx<probs.length; probIdx++) {
			sum+=probs[probIdx];
			if (sum>=rnd) {
				return probIdx;
			}
		}
		return false;
	},
	reactTagsSpecified: function(a, b, hRxn, prods) {
		var ePerProd = (a.temp() + b.temp() - hRxn)/prods.length; //neg hRxn means energy released
		
		a.kill();
		b.kill();
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			
		}
		return false;
		
	},
	reactInheritTags: function(a, b, hRxn, prods) {
		var ePerProd = (a.temp() + b.temp() - hRxn)/prods.length; //neg hRxn means energy released
		
		a.kill();
		b.kill();
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			
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