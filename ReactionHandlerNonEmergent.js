
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
	rcts: [{spcName: 'name', count: #, order: #}]
	prods: [{spcName: 'name', count: #, order: #}]
	both must be <=2
	preExpForwards: val, L^n/(mol^m sec)
	activeEForwards: val, j/(mol K)
	*/
	this.parent = attrs.parent;
	this.handle = attrs.handle;
	this.enqueueListenerHandle = this.handle + 'Enqueue';
	checkRxnSideCount(attrs.rcts);
	checkRxnSideCount(attrs.prods);
	this.rcts = this.reformatSide(attrs.rcts);
	this.prods = this.reformatSide(attrs.prods);
	this.sRxn298 = this.calcSRxn298(this.rcts, this.prods, this.parent.spcs);
	this.preExpForwards = attrs.preExpForwards;
	this.activeEForwards = attrs.activeEForwards;
	this.wallGroups = this.makeWallGroups(window.walls, [], this.rcts, this.prods);
	
}

ReactionHandlerNonEmergent.Reaction.prototype = {
	initQueue: function() {
		var preExpForwards = this.preExpForwards;
		var activeEForwards = this.activeEForwards;
		var sRxn298 = this.sRxn298;
		
		addListener(curLevel, 'update', this.enqueueListenerHandle, function() {
			var wallGroups = this.wallGroups;
			var queues = this.queues;
			for (var i=0; i<wallGroups.length; i++) {
				var wallGroup = wallGroups[i];
				var temp = wallGroup.temp[wallGroup.temp - 1];
				
			}
		}, this);
	},
	checkRxnSideCount: function(rxnSide) {
		if (this.countRxnSide(attrs.rcts) > 2 || this.countRxnSide(attrs.rcts) <= 0) {
			console.log('Bad number of products or reactions for non-emergent reaction');
			console.log('Reaction will not work');
			console.log(rxnSide);
		}		
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
	reformatSide: function(side) {
		var asList = [];
		for (var i=0; i<side.length; i++) asList.push(new ReactionHandlerNonEmergent.ReactionComponent(side[i].spcName, side[i].count, side[i].order));
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

ReactionHandlerNonEmergent.ReactionComponent = function(name, count, order) {
	this.name = name;
	this.count = count; //how many are being produced
	this.order = order;
}
ReactionHandlerNonEmergent.Queue = function() {
	this.rcts = 0;//how many quantities are enqueued to react, normalized by species' stoichiometry.
	this.prods = 0;
}

