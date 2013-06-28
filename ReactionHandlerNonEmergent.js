
function ReactionHandlerNonEmergent(collide, dotManager, rxns, tConst, activeRxns, pausedRxns) {
	this.collide = collide;
	this.dotManager = dotManager;
	this.tConst = tConst
	this.rxns = rxns;
	this.spcs = undefined; //set in collide's setSpcs func
	this.activeRxns = activeRxns;
	this.pausedRxns = pausedRxns;
}

_.extend(ReactionHandlerNonEmergent.prototype, ReactionFuncs, {
	addReaction: function(attrs) {
		attrs.parent = this;
		var rxn = new ReactionHandlerNonEmergent.Reaction(attrs);
	}
	
})


ReactionHandlerNonEmergent.Reaction = function(attrs) {
	/*
	to specify non-emergent reaction, you need...
	rcts: [{spcName: 'name', count: #},]
	prods: [{spcName: 'name', count: #},]
	both must be <=2
	preExpForward: val, L^n/(mol^m sec)
	activeEForward: val, j/(mol K)
	*/
	this.parent = attrs.parent;
	this.handle = attrs.handle;
	this.enqueueListenerHandle = this.handle + 'Enqueue';
	checkRxnSideCount(attrs.rcts);
	checkRxnSideCount(attrs.prods);
	this.rcts = this.reformatSide(attrs.rcts, LevelData.spcDefs);
	this.prods = this.reformatSide(attrs.prods, LevelData.spcDefs);
	this.sRxn298 = this.calcSRxn298(this.rcts, this.prods, this.parent.spcs);
	this.preExpForward = attrs.preExpForward;
	this.activeEForward = attrs.activeEForward;
	this.wallGroups = this.makeWallGroups(window.walls, [], this.rcts, this.prods);
	var updateQueue = this.wrapUpdateQueue();
	this.updateListenerHandle = this.handle + 'CheckQueueEmpty';
	this.checkWallGroupListenerHandle = this.handle + 'CheckWallGroups';
	this.initWallGroupCheck(this.rcts, this.prods, window.walls, this.checkWallGroupListenerHandle);
	this.initQueueCheck(updateQueue, this.wallGroups, this.updateListenerHandle);
}

ReactionHandlerNonEmergent.Reaction.prototype = {
	initWallGroupCheck: function(rcts, prods, walls, listenerHandle) {
		addListener(curLevel, 'data', listenerHandle, function() {
			this.wallGroups = this.makeWallGroups(walls, this.wallGroups, rcts, prods);
		}, this)
	},
	initQueueCheck: function(updateQueue, listenerHandle) {
		addListener(curLevel, 'update', listenerHandle, function() {
			var wallGroups = this.wallGroups;
			for (var i=0; i<wallGroups.length; i++) {
				if (wallGroups[i].queue.rcts == 0 && wallGroups[i].queue.prods == 0) {
					updateQueue(wallGroups[i]);
				}
			}
		}, this);
	},
	wrapUpdateQueue: function() {
		var self = this;
		var preExpForward = this.preExpForward;
		var activeEForward = this.activeEForward;
		var sRxn298 = this.sRxn298;
		var rcts = this.rcts;
		var prods = this.prods;
		var hRxn298 = this.calcHRxn298(this.rcts, this.prods);
		var kEq298 = Math.exp(-(hRxn298 - 298.15 * sRxn298) / (8.314 * 298.15)); 
		return function(wallGroup) {
			var temp = wallGroup.temp[wallGroup.temp - 1];
			var kEq = kEq298 * Math.exp(-hRxn298 / 8.314 * (1/temp - 1/298.15));
			var rateConstForward = preExpForward * Math.exp(-activeEForward / (8.314 * temp));
			var rateConstBackward = rateConstForward / kEq;
			var numForward = Math.round(self.getNumInDir(rateConstForward, self.rcts, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1]));
			var numBackard = Math.round(self.getNumInDir(rateConstBackward, self.prods, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1]));
			wallGroup.queue.rcts = numForward; 
			wallGroup.queue.prods = numBackward;
		}
	},
	getNumInDir: function(rateConst, rxnSide, moleCounts, vol) {
		var num = N * rateConst;
		for (var i=0; i<rxnSide.length; i++) {
			num *= moleCounts[rxnSide[i].spcName] / vol;
			if (rxnSide[i].count == 2) num *= moleCounts[rxnSide[i].spcName] / vol;
		}
		return num;
	},
	checkRxnSideCount: function(rxnSide) {
		if (this.countRxnSide(attrs.rcts) > 2 || this.countRxnSide(attrs.rcts) <= 0) {
			console.log('Bad number of products or reactions for non-emergent reaction');
			console.log('Reaction will not work');
			console.log(rxnSide);
		}		
	},
	calcHRxn298: function(rcts, prods) {
		var hRxn = 0;
		for (var i=0; i<prods.length; i++) hRxn += prods[i].hF298 + prods[i].cp * (temp - 298.15);
		for (var i=0; i<rcts.length; i++) hRxn -= rcts[i].hF298 + rcts[i].cp * (temp - 298.15);
		return hRxn;
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
					updatedGroups.push(new ReactionHandlerNonEmergent.WallGroup(wall, wall.handle, rcts, prods);
				}
			}
		}
		return updatedGroups;
	},
	getWallGroups: function(wallGroups, wallHandle) {
		for (var i=0; i<wallGroups.length; i++) wallGroups[i].wallHandle == wallHandle && return wallGroups[i];
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
	reformatSide: function(side, spcDefs) {
		var asList = [];
	
		for (var i=0; i<side.length; i++) {
			var def = spcDefs[side[i].spcName];
			asList.push(new ReactionHandlerNonEmergent.ReactionComponent(side[i].spcName, side[i].count, def.hF298, def.cp));
		}
		return asList;
	},
	calcSRxn298: function(rcts, prods, spcs) {
		var sRxn = 0;
		for (var i=0; i<prods.length; i++) sRxn += spcs[prods[i].name].sF298 * prods[i].count;
		for (var i=0; i<rcts.length; i++) sRxn -= spcs[rcts[i].name].sF298 * rcts[i].count;
		return sRxn;
	},
}

ReactionHandlerNonEmergent.WallGroup = function(wall, tag, rcts, prods) {
	this.temp = wall.getDataSrc('temp');
	this.vol = wall.getDataSrc('vol');
	this.moles = {};
	this.wallHandle = wall.handle;
	this.queue = new ReactionHandlerNonEmergent.Queue();
	this.populateMoles(wall, tag, this.moles, rcts);
	this.populateMoles(wall, tag, this.moles, prods);
	
}

ReactionHandlerNonEmergent.WallGroup.prototype = {
	populateMoles: function(wall, tag, moles, rxnSide) {
		for (var i=0; i<rxnSide.length; i++) {
			var spcMoles = wall.recordFrac({tag: tag, spcName: rxnSide[i].spcName});
			moles[rxnSide[i].spcName] = moles;
		}
	},
}

ReactionHandlerNonEmergent.ReactionComponent = function(name, count, hF298, cp) {
	this.name = name;
	this.count = count; //how many are being produced, corresponds to order
	this.hF298 = hF298 * 1000; //to J / mol
	this.cp = cp;
}
ReactionHandlerNonEmergent.Queue = function() {
	this.rcts = 0;
	this.prods = 0;
}

