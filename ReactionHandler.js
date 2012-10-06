ReactionHandler = {
	addReaction: function(aName, bName, hRxn, activE, prods) {
		if (bName) {
			this.addRxnPair(aName, bName, hRxn, activE, prods);
		} else {
			this.addRxnDecomp(aName, hRxn, activE, prods);
		}

	},
	//make a removeReaction function
	removeAllReactions: function(){
		this.setDefaultHandler({func:this.impactStd, obj:this});
	},
	//end public
	//maybe automatically adding reverse should reverse activE be specified
	addRxnPair: function(aName, bName, hRxn, activE, prods) {
		var idA = this.defs[aName].idNum;
		var idB = this.defs[bName].idNum;
		var low = Math.min(idA, idB);
		var high = Math.max(idA, idB);
		var idStr = low + '-' + high;
		this.rxns[idStr].push({hRxn:hRxn, activE:activE, prods:this.reformatProds(prods), prodCount:this.countProds(prods)});
		if (this.rxns[idStr].length==1) {
			this.setHandler(aName, bName, {func:this.setupReactSinglePair(this.rxns[idStr]), obj:this});
		} else {
			this.setHandler(aName, bName, {func:this.setupReactMultPairs(this.rxns[idStr]), obj:this});
		}	
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
		var prodCount = pairs[0].prodCount;
		return function(a, b, UVAB, perpAB, perpBA) {
			var hitTemp = this.hitTemp(a, b, perpAB, perpBA);
			if (Math.random()>this.probFunc(hitTemp, activE)) {
				this.react(a, b, hRxn, prods, prodCount)
				return false;
			}
			return this.impactStd(a, b, UVAB, perpAB, perpBA);
		
		};
		
	},
	setupReactMultPairs: function(pairs) {
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
				this.react(a, b, pairs[rxnIdx].hRxn, pairs[rxnIdx].prods, pairs[rxnIdx].prodCount);
				return false;
			}
		};
		
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
	react: function(a, b, hRxn, prods, prodCount) {
		var prodTemp = (a.temp() + b.temp() - hRxn)/prodCount; //hey - should make hRxn be in j or kj and convert at some point
		a.kill();
		b.kill();
		var x = .5*(a.x + b.x);
		var y = .5*(a.y + b.y);
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var name = prods[prodIdx].name;
			var newDots = new Array(prods[prodIdx].count);
			for (var countIdx=0; countIdx<prods[prodIdx].count; countIdx++) {
				var UV = this.rndUVs[Math.floor(Math.random()*20)];
				newDots[countIdx] = D(x+UV.dx*3, y+UV.dy*3, UV.copy(), this.defs[name].m, this.defs[name].r, name, this.defs[name].idNum, a.tag, a.returnTo); 
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