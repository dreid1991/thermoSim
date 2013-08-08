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

function CollideHandler(dotManager){
	this.tConst = tConst;
	this.rxns = {};
	this.dotManager = dotManager;
	this.activeRxns = [];
	this.pausedRxns = [];
	this.numHits = 0;
	this.hitsPerTurn = [];
	this.checkStore = this.check;
	this.breakUpStore = this.breakUp;
	this.recordingHits = false;
	this.recordCleanUpListenerName = 'recordCollideHits';
	this.rxnHandlerEmergent = new ReactionHandlerEmergent(this, this.dotManager, this.rxns, this.tConst, this.activeRxns, this.pausedRxns);
	this.rxnHandlerNonEmergent = new ReactionHandlerNonEmergent(this, this.dotManager, this.rxns, this.tConst, this.activeRxns, this.pausedRxns);
	
}
_.extend(CollideHandler.prototype, toInherit.gridder, {
	setSpcs: function(spcs) {
		this.spcs = spcs;
		this.setDefaultHandler({func: this.impactStd, obj: this}, this.spcs);
		this.rxnHandlerEmergent.spcs = spcs;
		this.rxnHandlerNonEmergent.setSpcs(spcs); // need to map chanceMap
		this.setup(this.spcs);
	},
	setDefaultHandler: function(handler, spcs){
		var numSpcs = countAttrs(spcs);
		for (var i=0; i<numSpcs; i++){
			for (var j=i; j<numSpcs; j++){
				this[i + '-' + j] = handler; //has func and obj
				this.rxns[i + '-' + j] = [];
			}
		}
	
	},
	getIdStr: function(defA, defB) {
		return defA.idNum < defB.idNum ? defA.idNum + '-' + defB.idNum : defB.idNum + '-' + defA.idNum;
	},
	setHandler: function(aName, bName, handler){
		var idStr = this.getIdStr(this.spcs[aName], this.spcs[bName]);
		if (this.isIdStr(idStr)) {
			this[idStr] = handler;
		} else {
			console.log('bad spc names ' + aName + ' ' + bName);
		}
	},
	setHandlerByIdStr: function(idStr, handler) {
		if (this.isIdStr(idStr)) {
			this[idStr] = handler;
		} else {
			console.log('bad id string ' + idStr);
		}
	},
	resetHandlerByIdStr: function(idStr) {
		if (this.isIdStr(idStr)) {
			this.rxns[idStr] = [];
			this.setHandlerByIdStr(idStr, new Listener(this.impactStd, this));
		} else {
			console.log('Bad id str ' + idStr);
		}

	},
	isIdStr: function(idStr) {
		return /^[0-9]+\-[0-9]+$/.test(idStr)
	},
	recordCollisions: function() {
		this.check = this.checkRecord;
		this.breakUp = this.breakUpRecord;
		this.recordingCollisions = true;
		addListener(curLevel, 'sectionCleanUp', this.recordCleanUpListenerName, this.recordCollisionsStop, this);
	},
	recordCollisionsStop: function() {
		this.check = this.checkStore;
		this.breakUp = this.breakUpStore;
		this.recordingCollisions = false;
		removeListener(curLevel, 'sectionCleanUp', this.recordCleanUpListenerName);
	},
	check: function(){
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		this.grid = this.makeGrid();
		var grid = this.grid;

		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		var dots = dotManager.lists.ALLDOTS;
		
		for (var dotIdx=dots.length - 1; dotIdx>-1; dotIdx--) {
	
			var dot = dots[dotIdx];
			var gridX = Math.floor(dot.x/gridSize);
			var gridY = Math.floor(dot.y/gridSize);
			var doAdd = true;
			//hey - define x & y mins so I don't have to call each time?
			//In optimizing, DO NOT define min and max locally.  It slows things down a lot.
			gridLoop:
				for (var x=Math.max(gridX-1, 0), xCeil=Math.min(gridX+1, xSpan)+1; x<xCeil; x++){
					for (var y=Math.max(gridY-1, 0), yCeil=Math.min(gridY+1, ySpan)+1; y<yCeil; y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>=0; neighborIdx--){
							var neighbor = grid[x][y][neighborIdx];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							if (dx*dx+dy*dy<=(dot.r+neighbor.r)*(dot.r+neighbor.r)) {
								var handler = this[Math.min(dot.idNum, neighbor.idNum) + '-' + Math.max(dot.idNum, neighbor.idNum)];
								var UVAB = V(neighbor.x-dot.x, neighbor.y-dot.y).UV();
								if (handler.func.apply(handler.obj, [dot, neighbor, UVAB, dot.v.dotProd(UVAB), neighbor.v.dotProd(UVAB)])===false) {
									doAdd = false;
									grid[x][y].splice(neighborIdx, 1);
									break gridLoop;
								}
							}
						}
					}
				}
				
			if (gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows) {
				doAdd && grid[gridX][gridY].push(dot);
			} else {
				returnEscapist(dot);
				console.log("ball out of bounds");		
			}
		}
		
	},
	checkRecord: function(){
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		this.grid = this.makeGrid();
		var grid = this.grid;
		this.hitsPerTurn.push(this.numHits);
		this.numHits = 0;
		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		var dots = dotManager.lists.ALLDOTS;
		
		for (var dotIdx=dots.length - 1; dotIdx>-1; dotIdx--) {
	
			var dot = dots[dotIdx];
			var gridX = Math.floor(dot.x/gridSize);
			var gridY = Math.floor(dot.y/gridSize);
			var doAdd = true;
			//hey - define x & y mins so I don't have to call each time?
			//In optimizing, DO NOT define min and max locally.  It slows things down a lot.
			gridLoop:
				for (var x=Math.max(gridX-1, 0), xCeil=Math.min(gridX+1, xSpan)+1; x<xCeil; x++){
					for (var y=Math.max(gridY-1, 0), yCeil=Math.min(gridY+1, ySpan)+1; y<yCeil; y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx--){
							var neighbor = grid[x][y][neighborIdx];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							if (dx*dx+dy*dy<=(dot.r+neighbor.r)*(dot.r+neighbor.r)) {
								var handler = this[Math.min(dot.idNum, neighbor.idNum) + '-' + Math.max(dot.idNum, neighbor.idNum)];
								var UVAB = V(neighbor.x-dot.x, neighbor.y-dot.y).UV();
								if (handler.func.apply(handler.obj, [dot, neighbor, UVAB, dot.v.dotProd(UVAB), neighbor.v.dotProd(UVAB)])===false) {
									doAdd = false;
									grid[x][y].splice(neighborIdx, 1);
									break gridLoop;
								}
							}
						}
					}
				}
				
			if (gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows) {
				doAdd && grid[gridX][gridY].push(dot);
			} else {
				returnEscapist(dot);
				console.log("ball out of bounds");		
			}
		}
		
	},
	impactStd: function(a, b, UVAB, perpAB, perpBA){
		var perpABRes = (perpAB * (a.m - b.m) + 2 * b.m * perpBA) / (a.m + b.m);
		var perpBARes = (perpBA * (b.m - a.m) + 2 * a.m * perpAB) / (a.m + b.m);
		var aTempO = a.temp();
		var bTempO = b.temp();
		a.v.dx += UVAB.dx * (perpABRes - perpAB);
		a.v.dy += UVAB.dy * (perpABRes - perpAB);
		b.v.dx += UVAB.dx * (perpBARes - perpBA);
		b.v.dy += UVAB.dy * (perpBARes - perpBA);
		
		var aTempF = a.temp();
		var bTempF = b.temp();
		var aTempAdj = aTempO + (aTempF - aTempO) * a.cvKinetic / a.cv;
		var bTempAdj = bTempO + (bTempF - bTempO) * b.cvKinetic / b.cv;
	
		a.v.mult(Math.sqrt(aTempAdj / aTempF));
		a.internalPotential *= aTempAdj / aTempO;//(aTempF - aTempAdj) * (a.cv - a.cvKinetic);

		b.v.mult(Math.sqrt(bTempAdj / bTempF));
		b.internalPotential *= bTempAdj / bTempO; //(bTempF - bTempAdj) * (b.cv - b.cvKinetic);
		
		this.breakUp(a, b, UVAB);
		return true;
	},
	//HEY - threshold energy change and hit counting are NOT going to play nicely together.  Also, the breakUp function for thresholdEnergy is yoinked in enternally.  Sorry for the inconsistancy, I just wanted to have the spc changer be local
	breakUp: function(a, b, UVAB){
		var sumR = a.r+b.r;
		var aXNew = b.x - UVAB.dx*sumR;
		var aYNew = b.y - UVAB.dy*sumR;
		b.x = a.x + UVAB.dx*sumR;
		b.y = a.y + UVAB.dy*sumR;
		a.x = aXNew;
		a.y = aYNew;
	},
	breakUpRecord: function(a, b, UVAB){
		this.numHits ++;
		var sumR = a.r+b.r;
		var aXNew = b.x - UVAB.dx*sumR;
		var aYNew = b.y - UVAB.dy*sumR;
		b.x = a.x + UVAB.dx*sumR;
		b.y = a.y + UVAB.dy*sumR;
		a.x = aXNew;
		a.y = aYNew;
	},

	setup: function(spcs){
		this.gridSize = Math.max(5, 2*this.getMaxR(spcs));
		this.numCols = Math.ceil(myCanvas.width/this.gridSize+1);
		this.numRows = Math.ceil(myCanvas.height/this.gridSize+1);
		this.xSpan = Math.floor(myCanvas.width/this.gridSize);
		this.ySpan = Math.floor(myCanvas.height/this.gridSize);
	},

	getMaxR: function(spcs){
		var maxR = 0;
		for (var spcName in spcs){
			var spc = spcs[spcName];
			maxR = Math.max(maxR, spc.r);
		}
		return maxR;	
	},
})