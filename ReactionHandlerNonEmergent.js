
/*
The structure of the emergent and non-emergent reactions is slightly different.  In the emergent reactions, a reaction is a single pair of reacting 
species.  The possible reacting pairs go in the collide handler's list for that pair.
The non-emergent reaction handler's reaction escompasses all the collision pairs that could be involved in a 2->2, 1->2, 1->1 reaction.  There are potentially many
reacting pairs for a reaction.
The non-emergent reaction will add its pairs, not itself, to the collide handler's reaction list.  
*/

//Emergent and non-emergent reactions cannot mix.
function ReactionHandlerNonEmergent(collide, dotManager, rxns, tConst, activeRxns, pausedRxns) {
	this.collide = collide;
	this.dotManager = dotManager;
	this.tConst = tConst
	this.rxns = rxns;
	this.spcs = undefined; //collide calls setSpcs
	this.chanceMap = undefined;
	//the chance map exists so the sum of the chances doesn't need to be calculated each time dots w/ 2+ possible pairs collide
	this.activeRxns = activeRxns;
	this.pausedRxns = pausedRxns;
	
}

_.extend(ReactionHandlerNonEmergent.prototype, ReactionFuncs, {

	setSpcs: function(spcs) {
		this.spcs = spcs;
		this.chanceMap = {};
		for (var a in this.rxns) {
			this.chanceMap[a] = {} //map of wall handles to WallPairObjs
		}
	},
	addReaction: function(attrs) {
		var self = this;
		attrs.parent = this;
		var rxn = new ReactionHandlerNonEmergent.Reaction(attrs, this.rxns);
		this.activeRxns.push(rxn);
		addListenerOnce(curLevel, 'update', 'initRxn' + rxn.handle, function() {
			rxn.init();
			self.readyHandlers(self.collide, self.rxns, rxn, self.chanceMap);
		}, undefined)
	},
	disableRxn: function(handle) {
		this.removeRxn(handle);
	},
	removeRxn: function(handle) {
		var rxn = this.getRxn(this.activeRxns, handle);
		if (rxn) {
			if (!rxn.inited) removeListener(curLevel, 'update', 'initRxn' + rxn.handle);
			var pairs = rxn.pairs;
			var chanceMap = this.chanceMap;
			var allRxns = this.rxns;
			rxn.removeListener();
			this.splicePairsFromRxns(pairs, allRxns);
			this.splicePairsFromChanceMap(pairs, chanceMap);
			
			this.activeRxns.splice(this.activeRxns.indexOf(rxn), 1);
			this.pausedRxns.push(rxn);
			this.readyHandlers(this.collide, this.rxns, rxn, this.chanceMap);
		}
	},
	rxnIsEnabled: function(handle) {
		return this.getRxn(this.activeRxns, handle) ? true : false;
	},
	enableRxn: function(handle) {
		var rxn = this.getRxn(this.pausedRxns, handle);
		if (rxn) {
			rxn.init();
			this.pausedRxns.splice(this.pausedRxns.indexOf(rxn), 1);
			this.activeRxns.push(rxn);
			this.readyHandlers(this.collide, this.rxns, rxn, this.chanceMap);
		}
	},
	splicePairsFromRxns: function(pairs, allRxns) {
		for (var idStr in allRxns) {
			var idStrRxns = allRxns[idStr];
			for (var i=0; i<pairs.length; i++) {
		
				var idx = idStrRxns.indexOf(pairs[i]);
				if (idx >= 0) {
					idStrRxns.splice(idx, 1);
				}
			}
		}	
	},
	splicePairsFromChanceMap: function(pairs, chanceMap) {
		for (var idStr in chanceMap) {
			var strPairs = chanceMap[idStr];
			for (var wallHandle in strPairs) {
				var chanceObj = strPairs[wallHandle];
				for (var i=0; i<pairs.length; i++) {
					chanceObj.removePair(pairs[i]);
				}
			}
		}
	},
	readyHandlers: function(collide, allRxns, rxn, chanceMap) {
		for (var i=0; i<rxn.pairs.length; i++) {
			var idStr = rxn.pairs[i].idStr
			pairRxns = allRxns[idStr];
			if (pairRxns.length == 1) {
				this.initSingleRxnPair(pairRxns[0], idStr, collide);
			} else if (pairRxns.length > 1) {
				this.initMultiRxnPair(pairRxns, idStr, collide, chanceMap);
			} else if (pairRxns.length == 0) {
				collide.resetHandlerByIdStr(idStr);
			}
		}
	},
	initSingleRxnPair: function(reactivePair, idStr, collide) {
		var pair = reactivePair;
		var idStr = pair.idStr;
		collide.setHandlerByIdStr(idStr, new Listener(function(a, b, UVAB, perpAB, perpBA) {
			var wallGroup = pair.rxn.wallGroupsMap[a.tag];
			var queue = wallGroup[pair.queuePath];
			if (Math.random() < wallGroup[pair.chancePath]) {
				if (queue.now > 0) {
					if (this.react(a, b, pair.prods)) { //prods is list of ReactionComponents
						queue.now--; 
						return false;
					} else {
						return collide.impactStd(a, b, UVAB, perpAB, perpBA);
					}
/*
danger zone - can only subtract from queue once we know the reactants have enough energy to make the products.  
Should also only subtract below zero if there's enough energy.  This applies to to multiple pair rxns as well
*/					
				} else {
					if (this.canReact(a, b, pair.prods)) queue.now--;
					return collide.impactStd(a, b, UVAB, perpAB, perpBA);
				}
				
			} else {
				return collide.impactStd(a, b, UVAB, perpAB, perpBA);
			}
		}, this));
	},
	initMultiRxnPair: function(reactivePairs, idStr, collide, chanceMap) {
		collide.setHandlerByIdStr(idStr, new Listener(function(a, b, UVAB, perpAB, perpBA) {
			var chanceObj = chanceMap[idStr][a.tag];
			var chanceScalar = 1 / Math.max(1, chanceObj.total);
			var roll = Math.random();
			if (chanceObj.total < roll) {
				return collide.impactStd(a, b, UVAB, perpAB, perpBA);
			}
			var sum = 0;
			for (var i=0; i<reactivePairs.length; i++) {
				var pair = reactivePairs[i];
				var wallGroup = pair.rxn.wallGroupsMap[a.tag];
				sum += chanceScalar * wallGroup[pair.chancePath];
				if (sum >= roll) {
					var queue = wallGroup[pair.queuePath];
					if (queue.now > 0) {
						if (this.react(a, b, pair.prods)) {
							queue.now--;
							return false
						} else {
							return collide.impactStd(a, b, UVAB, perpAB, perpBA);
						}
					} else {
						if (this.canReact(a, b, pair.prods)) queue.now--;
						return collide.impactStd(a, b, UVAB, perpAB, perpBA);
					}
				}
				
			}
		}, this));
	},	
})


ReactionHandlerNonEmergent.Reaction = function(attrs, allRxns) {
	/*
	to specify non-emergent reaction, you need...
	rcts: [{spcName: 'name', count: #},]
	prods: [{spcName: 'name', count: #},]
	totals of both rcts and prods must be <=2
	preExpForward: val, L^n/(mol^m sec)
	activeEForward: val, kJ/mol
	*/
	this.parent = attrs.parent;
	this.chanceMap = this.parent.chanceMap;
	this.collide = this.parent.collide;
	this.handle = attrs.handle;
	this.enqueueListenerHandle = this.handle + 'Enqueue';
	this.checkRxnSideCount(attrs.rcts);
	this.checkRxnSideCount(attrs.prods);
	this.allRxns = allRxns;
	this.rctsNet = this.reformatSide(attrs.rcts);
	this.prodsNet = this.reformatSide(attrs.prods);
	this.sRxn298 = this.calcSRxn298(this.rctsNet, this.prodsNet);
	this.pairs = [];
	this.preExpForward = attrs.preExpForward;
	this.activeEForward = attrs.activeEForward * 1000; //sent in kJ/mol
	this.updateWalls();
	this.updateQueue = this.wrapUpdateQueue();
	this.listenerHandle = this.handle + 'UpdateQueue';
	this.inited = false;

}

ReactionHandlerNonEmergent.Reaction.prototype = {
	init: function() {
		var walls = window.walls;
		var rcts = this.rctsNet;
		var prods = this.prodsNet;
		var chanceMap = this.chanceMap;
		this.inited = true;
		addListener(curLevel, 'data', this.listenerHandle, function() {
			this.updateWalls();
			for (var i=0; i<this.wallGroups.length; i++) {
				this.updateQueue(this.wallGroups[i], chanceMap);
			}
		}, this);
		this.addCollisionPairs(this.collide, this.rctsNet, this.prodsNet, this.allRxns, this.chanceMap, window.dotManager, window.spcs); 
		
		for (var i=0; i<this.wallGroups.length; i++) {
			this.updateQueue(this.wallGroups[i], chanceMap);
		}
		
	},
	getWallTemp: function(wallGroup) {
		var dataObj = window.walls[wallGroup.wallHandle].data.temp;
		var src = dataObj.src();
		if (src.length) {
			return src[src.length - 1];
		} else {
			var listener = dataObj.listener();
			return listener.func.apply(listener.obj);
		}
	},
	remove: function() {
		this.parent.removeRxn(this.handle);
	},
	removeListener: function() { 
		removeListener(curLevel, 'data', this.listenerHandle);
	},
	updateWalls: function() {
		var chanceMap = this.chanceMap;
		this.wallGroups = this.makeWallGroups(window.walls, this.wallGroups || [], this.rctsNet, this.prodsNet);
		this.wallGroupsMap = {};
		for (var i=0; i<this.wallGroups.length; i++) {
			var wallHandle = this.wallGroups[i].wallHandle;
			this.wallGroupsMap[wallHandle] = this.wallGroups[i];
			for (var a in chanceMap) {
				if (chanceMap[a][wallHandle] === undefined) chanceMap[a][wallHandle] = new ReactionHandlerNonEmergent.WallChanceObj();
			}
		}	
	},
	addCollisionPairs: function(collide, rctsNet, prodsNet, allRxns, chanceMap, dotMgr, spcs) {
		var numRcts = this.countRxnSide(rctsNet), numProds = this.countRxnSide(prodsNet);
		var rcts = this.copyRxnSide(rctsNet),     prods = this.copyRxnSide(prodsNet);
		
		if (numRcts == 2 && numProds == 2) {
			this.addTwoTwo(spcs, allRxns, collide, rcts, prods, chanceMap);
		} else if (numRcts == 1 && numProds == 1) {
			this.addOneOne(spcs, allRxns, collide, rcts, prods, chanceMap);
		} else if ((numRcts == 1 && numProds == 2) || (numRcts == 2 && numProds == 1)) {
			this.addOneTwo(spcs, allRxns, collide, rcts, prods, chanceMap);
		}
	},
	addOneOne: function(spcs, allRxns, collide, rctsNet, prodsNet, chanceMap) {
		var rcts, prods;
		for (var spcName in spcs) {
			rcts = this.copyRxnSide(rctsNet);
			prods = this.copyRxnSide(prodsNet);
			this.addToRxnSide(rcts, spcName, 1);
			this.addToRxnSide(prods, spcName, 1);
			this.addTwoTwo(spcs, allRxns, collide, rcts, prods);
		}
	},
	addOneTwo: function(spcs, allRxns, collide, rctsNet, prodsNet, chanceMap) {
		var rcts, prods;
		var reverseRxn = false;

		if (this.countRxnSide(prodsNet) == 1) {
			reverseRxn = true;
		}
		//so if it's a 2 -> 1 reaction, we flip it
		//the resulting reaction will always be 1 -> 2
		var chanceForward = !reverseRxn ? 'chanceForward' : 'chanceBackward';
		var chanceBackward = !reverseRxn ? 'chanceBackward' : 'chanceForward';
		var rctQueue = !reverseRxn ? 'rctQueue' : 'prodQueue';
		var prodQueue = !reverseRxn ? 'prodQueue' : 'rctQueue';
		
		rcts =  !reverseRxn ? this.copyRxnSide(rctsNet)  : this.copyRxnSide(prodsNet);
		prods = !reverseRxn ? this.copyRxnSide(prodsNet) : this.copyRxnSide(rctsNet);
		
		for (var spcName in spcs) {
			var rctsForward = this.copyRxnSide(rcts);
			var prodsForward = this.copyRxnSide(prods);			
			var rctsBackward = this.copyRxnSide(prods);
			var prodsBackward = this.copyRxnSide(rcts);
			
			this.addToRxnSide(rctsForward, spcName, 1);
			this.addToRxnSide(prodsForward, spcName, 1); //only adding to side w/ 1 rct.
			
			var pairForward = new ReactionHandlerNonEmergent.ReactivePair(this, collide, rctsForward, prodsForward, chanceForward, rctQueue);
			this.pushPair(collide, allRxns, spcs, pairForward);
		}
		var pairBackward = new ReactionHandlerNonEmergent.ReactivePair(this, collide, this.copyRxnSide(prods), this.copyRxnSide(rcts), chanceBackward, prodQueue);
		this.pushPair(collide, allRxns, spcs, pairBackward);
	},
	addTwoTwo: function(spcs, allRxns, collide, rcts, prods, chanceMap) {
		var pairFoward = new ReactionHandlerNonEmergent.ReactivePair(this, collide, rcts, prods, 'chanceForward', 'rctQueue');
		var pairBackward = new ReactionHandlerNonEmergent.ReactivePair(this, collide, prods, rcts, 'chanceBackward', 'prodQueue');
		this.pushPair(collide, allRxns, spcs, pairFoward, chanceMap);
		this.pushPair(collide, allRxns, spcs, pairBackward, chanceMap);
		//this.readyRxn(collide, allRxns, pairFoward.idStr);
		//this.readyRxn(collide, allRxns, pairBackward.idStr);
	},
	pushPair: function(collide, allRxns, spcs, pair) {
		var idStr = pair.idStr;
		this.pairs.push(pair);
		allRxns[idStr] == undefined ? allRxns[idStr] = [pair] : allRxns[idStr].push(pair);
		
	},
	countRxnSide: function(rxnSide) {
		var count = 0;
		for (var i=0; i<rxnSide.length; i++) {
			count += rxnSide[i].count;
		}
		return count;
	},
	addToRxnSide: function(rxnSide, spcName, count) {
		for (var i=0; i<rxnSide.length; i++) {
			if (rxnSide[i].spcName == spcName) {
				rxnSide[i].count += count;
				return;
			}
		}
		rxnSide.push(new ReactionComponent(spcName, count));
	},

	copyRxnSide: function(rxnSide) {
		var copy = [];
		for (var i=0; i<rxnSide.length; i++) {
			copy.push(rxnSide[i].copy());
		}
		return copy;
	},

	wrapUpdateQueue: function() {
		var self = this;
		var preExpForward = this.preExpForward;
		var activeEForward = this.activeEForward;
		var sRxn298 = this.sRxn298;
		var rcts = this.rctsNet;
		var prods = this.prodsNet;
		var hRxn298 = this.calcHRxn298(this.rctsNet, this.prodsNet);
		var kEq298 = Math.exp(-(hRxn298 - 298.15 * sRxn298) / (8.314 * 298.15)); 
		var rxnPairs = this.pairs;
		var updateChanceMap = function(wallGroup, chanceMap, pairs) {  
			for (var i=0; i<pairs.length; i++) {
				var pair = pairs[i];
				
				chanceMap[pair.idStr][wallGroup.wallHandle].updatePairChance(pair, wallGroup[pair.chancePath]);
			}
		}
		
		return function(wallGroup, chanceMap) {
			var temp = wallGroup.temp[wallGroup.temp.length - 1];

			var rctQueue = wallGroup.rctQueue;
			var prodQueue = wallGroup.prodQueue;
			//queue.now goes below zero.  When it gets to zero, they won't react, but ones that roll right will decrement the counter
			//this is used to adjust the chance of reaction so they react through the whole interval between updating the queues
			var rctsInit = rctQueue.init;
			var rctsLeft = rctQueue.now;
			var prodsInit = prodQueue.init;
			var prodsLeft = prodQueue.now;
			
			wallGroup.chanceForward = self.moveAlongSigmoid(wallGroup.chanceForward, rctsLeft !== 0 ? .2 * rctsLeft / (rctsInit > 0 ? Math.sqrt(rctsInit) : 1) : 0);
			wallGroup.chanceBackward = self.moveAlongSigmoid(wallGroup.chanceBackward, prodsLeft !== 0 ? .2 * prodsLeft / (prodsInit > 0 ? Math.sqrt(prodsInit) : 1) : 0); 
			
			if (wallGroup.chanceForward > 1 - 1e-3 || wallGroup.chanceBackward > 1 - 1e-3) {
				wallGroup.rateScalar = self.moveAlongSigmoid(wallGroup.rateScalar, -.3);
			} else {
				wallGroup.rateScalar = self.moveAlongSigmoid(wallGroup.rateScalar, .3);
			}
			
			var kEq = kEq298 * Math.exp(-hRxn298 / 8.314 * (1 / temp - 1 / 298.15));
			
			var rateConstForward = wallGroup.rateScalar * preExpForward * Math.exp(-activeEForward / (8.314 * temp));
			var rateConstBackward = rateConstForward / kEq;
			var numForward = Math.max(0, Math.round(self.getNumInDir(rateConstForward, self.rctsNet, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1]) + Math.random() - .5));
			var numBackward = Math.max(0, Math.round(self.getNumInDir(rateConstBackward, self.prodsNet, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1]) + Math.random() - .5));
			
			rctQueue.init  = numForward;
			rctQueue.now   = numForward; 
			prodQueue.init = numBackward;
			prodQueue.now  = numBackward;
			
			updateChanceMap(wallGroup, chanceMap, rxnPairs);
			
		}
	},
	avgLast: function(list, num) {
		var sum = 0;
		num = Math.min(num, list.length);
		for (var i=list.length - num; i<list.length; i++) {
			sum += list[i];
		}
		return sum / num;
	},
	moveAlongSigmoid: function(yo, dx) {
		//solve for y val corresponding to yo, xNew = xo + dx
		//bounding value so it can slide back
		return Math.min(Math.max(1e-4, 1 / (1 + (1 / yo - 1) * Math.exp(-dx))), 1 - 1e-4);
	},
	getNumInDir: function(rateConst, rxnSide, moleCounts, vol) {
		var num = N * rateConst * dataInterval * 1e-3;
		for (var i=0; i<rxnSide.length; i++) {
			var moleList = moleCounts[rxnSide[i].spcName];
			num *= Math.pow(moleList[moleList.length - 1] / vol, rxnSide[i].count)
			//num *= moleList[moleList.length - 1] / vol;
			//if (rxnSide[i].count == 2) num *= moleList[moleList.length - 1] / vol;
		}
		return num;
	},
	checkRxnSideCount: function(rxnSide) {
		if (this.countRxnSide(rxnSide) > 2 || this.countRxnSide(rxnSide) <= 0) {
			console.log('Bad number of products or reactions for non-emergent reaction');
			console.log('Reaction will not work');
			console.log(rxnSide);
		}		
	},
	calcHRxn298: function(rcts, prods) {
		var hRxn = 0;
		for (var i=0; i<prods.length; i++) hRxn += prods[i].def.hF298*prods[i].count;
		for (var i=0; i<rcts.length; i++) hRxn -= rcts[i].def.hF298*rcts[i].count;
		return hRxn * 1000; //to Joules from kJ
	},
	makeWallGroups: function(walls, wallGroups, rcts, prods) {
		var updatedGroups = [];
		for (var i=0; i<walls.length; i++) {
			var wall = walls[i];
			if (wall.data.temp) {
				var existingGroup = this.getWallGroup(wallGroups, wall.handle);
				if (existingGroup) {
					updatedGroups.push(existingGroup);
				} else {
					updatedGroups.push(new ReactionHandlerNonEmergent.WallGroup(wall, wall.handle, rcts, prods));
				}
			}
		}
		return updatedGroups;
	},
	getWallGroup: function(wallGroups, wallHandle) {
		for (var i=0; i<wallGroups.length; i++) if (wallGroups[i].wallHandle == wallHandle) return wallGroups[i];
		return undefined;
	},
	makeQueues: function(walls, lastQueues) {
		var queues = {};
		for (var i=0; i<walls.length; i++) {
			if (lastQueues[walls[i].handle]) {
				queues[walls[i].handle] = lastQueues[walls[i].handle];
			} else {
				queues[walls[i].handle] = new ReactionHandlerNonEmergent.Queue();
			}
		}
		return queues;
	},
	countRxnSide: function(side) {
		var x = 0;
		for (var i=0; i<side.length; i++) x += side[i].count;
		return x;
	},
	flatten: function(side, path) {
		var flat = [];
		for (var i=0; i<side.length; i++) {
			flat = flat.concat(side[i].flatten(path));
		}
		return flat;
		
	},
	reformatSide: function(side) {
		var typedSpcs = [];
	
		for (var i=0; i<side.length; i++) {
			typedSpcs.push(new ReactionComponent(side[i].spcName, side[i].count));
		}
		return typedSpcs;
	},
	calcSRxn298: function(rcts, prods) {
		var sRxn = 0;
		for (var i=0; i<prods.length; i++) sRxn += prods[i].def.sF298 * prods[i].count;
		for (var i=0; i<rcts.length; i++) sRxn -= rcts[i].def.sF298 * rcts[i].count;
		return sRxn;
	},
}

ReactionHandlerNonEmergent.WallGroup = function(wall, tag, rcts, prods) {
	this.temp = wall.getDataSrc('temp');
	this.vol = wall.getDataSrc('vol');
	this.moles = {};
	this.wallHandle = wall.handle;
	this.chanceForward = .1; //must be  0<x<1 or sigmoid won't work
	this.chanceBackward = .1;
	this.rateScalar = 1 - 1e-4; //if reaction is too fast, this will slow it down so chanceRxn can be 0<x<1 and rxn hits equil
	this.rctQueue = new ReactionHandlerNonEmergent.Queue();
	this.prodQueue = new ReactionHandlerNonEmergent.Queue();
	this.populateMoles(wall, tag, this.moles, rcts);
	this.populateMoles(wall, tag, this.moles, prods);
	
}

ReactionHandlerNonEmergent.WallGroup.prototype = {
	populateMoles: function(wall, tag, moles, rxnSide) {
		for (var i=0; i<rxnSide.length; i++) {
			var spcMolesObj = wall.recordMoles({tag: tag, spcName: rxnSide[i].spcName});
			spcMolesObj.recordVal();
			moles[rxnSide[i].spcName] = spcMolesObj.src();
		}
	},
}


ReactionHandlerNonEmergent.Queue = function() {
	this.init = 0;
	this.now = 0;
}

ReactionHandlerNonEmergent.ReactivePair = function(rxn, collide, rcts, prods, chancePath, queuePath) {
	this.rxn = rxn;
	this.rcts = rcts; //rcts and prods are lists of ReactionComponents
	this.prods = prods;
	this.chancePath = chancePath;
	this.queuePath = queuePath;
	var rctDefs = rxn.flatten(this.rcts, 'def');
	this.idStr = collide.getIdStr(rctDefs[0], rctDefs[1]);
}

ReactionHandlerNonEmergent.WallChanceObj = function(allRxns) {
	this.total = 0;
	this.pairChances = []
}

ReactionHandlerNonEmergent.WallChanceObj.prototype = {
	updatePairChance: function(pair, chance) {
		var exists = false;
		for (var i=0; i<this.pairChances.length; i++) {
			if (this.pairChances[i].pair == pair) {
				this.pairChances[i].chance = chance;
				exists = true;
			}
		}
		if (!exists) {
			this.pairChances.push(new ReactionHandlerNonEmergent.PairChances(pair, chance));
		}
		this.updateTotal();
		
	},
	removePair: function(pair) {
		for (var i=this.pairChances.length - 1; i>=0; i--) {
			if (this.pairChances[i].pair == pair) this.pairChances.splice(i, 1);
		}
		this.updateTotal();
	},
	updateTotal: function() {
		this.total = 0;
		for (var i=0; i<this.pairChances.length; i++) {
			this.total += this.pairChances[i].chance;
		}
	}
}




ReactionHandlerNonEmergent.PairChances = function(pair, chance) {
	this.pair = pair;
	this.chance = chance;
}
