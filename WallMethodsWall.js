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


//////////////////////////////////////////////////////////////////////////
//WALL
//////////////////////////////////////////////////////////////////////////
WallMethods.wall = {
	reset: function(){
		var init = this.ptsInit;
		for (var ptIdx=0; ptIdx<init.length; ptIdx++){
			this[ptIdx].x = init[ptIdx].x;
			this[ptIdx].y = init[ptIdx].y;//Must copy by value to keep point object the same since things follow the points
		}
		this.forceInternal = 0;
		for (var i=0; i<this.vs.length; i++) this.vs[i].zero();
		this.parent.setupWall(this.parent.indexOf(this));
	},
	setVol: function(vol){
		var setY = this.volToY(vol)
		this[0].position({y:setY});
		this[1].position({y:setY});
	},
	volToY: function(vol) {
		var width = this[2].distTo(this[3]);
		var height = vol/(vConst*width);
		return this[2].y - height;
	},
	changeSetPt: function(dest, compType, speed){
		if(compType.indexOf('isothermal')!=-1){
			var wallMoveMethod = 'cVIsothermal';
		} else if (compType.indexOf('adiabatic')!=-1){
			var wallMoveMethod = 'cVAdiabatic';
		}
		removeListener(curLevel, 'wallMove', 'cV' + this.handle);
		var setY = function(wall, curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var y = this[0].y
		var dist = dest-y;
		if (dist!=0) {
			var sign = getSign(dist);
			this.vs[0].dy = speed*sign;
			this.vs[1].dy = speed*sign;
			this.parent.setSubWallHandler(this.handle, 0, wallMoveMethod);
			addListener(curLevel, 'wallMove', 'cV' + this.handle,
				function(){
					var y = this[0].y
					setY(this, stepTowards(y, dest, this.vs[0].dy));
					this.parent.setupWall(this.handle);
					if(round(y,2)==round(dest,2)){
						removeListener(curLevel, 'wallMove', 'cV' + this.handle);
						this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
						this.vs[0].dy = 0;
						this.vs[1].dy = 0;
					}
				},
			this);
		}		
	},
	releaseWithBounds: function(lowBound, highBound, handler, funcOnFinish) {
		this.moveStop();
		removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
		removeListener(curLevel, 'wallMove', 'cP' + this.handle);
		this.parent.setSubWallHandler(this.handle, 0, handler);
		lowBound = defaultTo(0, lowBound)
		highBound = defaultTo(Number.MAX_VALUE, highBound);
		var gLocal = g;
		var bounds = this.bounds;
		addListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle,
			function(){
				var lastY = this[0].y
				var nextY;
				var unboundedY = lastY + this.vs[0].dy + .5*gLocal;
				var dyWeight = null;
				if (unboundedY<lowBound || unboundedY>highBound) {
					this.moveStop();
					this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
					if (unboundedY<lowBound) {
						funcOnFinish(lowBound);
						nextY = lowBound;
					} else {
						funcOnFinish(highBound);
						nextY = highBound;
					}
				} else if(unboundedY>bounds.max.y || unboundedY<bounds.min.y) {
					nextY = this.hitBounds(lastY, gLocal, bounds.min.y, bounds.max.y);
				} else {
					nextY = unboundedY;
					this.vs[0].dy += gLocal;
					this.vs[1].dy += gLocal;

				}
				this[0].y = nextY;
				this[1].y = nextY;
				this[this.length-1].y = nextY;
				this.parent.setupWall(this.handle);		
			},
		this);

	},
	moveInit: function(){
		var gLocal = g;
		var bounds = this.bounds;
		
		addListener(curLevel, 'wallMove', 'cP' + this.handle,
			function(){
				var lastY = this[0].y
				var nextY;
				var unboundedY = lastY + this.vs[0].dy + .5*gLocal;
				var dyWeight = null;
				if (unboundedY>bounds.max.y) {
					//want a list of things to do.  Want an *option* for if to do standard hitBounds.  Add like {func:, obj:, replaceStd: }
					var useStdBound = true;
					for (var i=0; i<this.boundMaxHandlers.length; i++) {
						if (this.boundMaxHandlers[i].replacesStd) {
							nextY = this.boundMaxHandlers[i].func.apply(this.boundMaxHandlers[i].obj, [this, unboundedY, bounds.max.y]);
							useStdBound = false;
						} else {
							this.boundMaxHandlers[i].func.apply(this.boundMaxHandlers[i].obj, [this, unboundedY, bounds.max.y]);
						}
					}
					if (useStdBound) nextY = this.hitBounds(lastY, gLocal, bounds.min.y, bounds.max.y);
				} else if (unboundedY<bounds.min.y) {
					var useStdBound = true;
					for (var i=0; i<this.boundMinHandlers.length; i++) {
						if (this.boundMinHandlers[i].replacesStd) {
							nextY = this.boundMinHandlers[i].func.apply(this.boundMinHandlers[i].obj, [this, unboundedY, bounds.min.y]);
							useStdBound = false;
						} else {
							this.boundMinHandlers[i].func.apply(this.boundMinHandlers[i].obj, [this, unboundedY, bounds.min.y]);
						}
					}
					if (useStdBound) nextY = this.hitBounds(lastY, gLocal, bounds.min.y, bounds.max.y);
				} else {
					nextY = unboundedY;
					this.vs[0].dy += gLocal;
					this.vs[1].dy += gLocal;

				}
				this[0].y = nextY;
				this[1].y = nextY;
				this[this.length-1].y = nextY;
				this.parent.setupWall(this.handle);		
			},
		this);
	},
	addBoundHandler: function(type, handler) {
		var handlers = this['bound' + type.toCapitalCamelCase() + 'Handlers'];
		if (handlers) {
			handlers.push(handler);
		} else {
			console.log('Bad wall bound handler type ' + type);
		}
	},
	removeBoundHandler: function(type, handler) {
		var handlers = this['bound' + type.toCapitalCamelCase() + 'Handlers'];
		if (handlers) {
			var idx = handlers.indexOf(handler);
			if (idx>=0) {
				handlers.splice(idx, 1);
			}
		} else {
			console.log('Bad wall bound handler type ' + type);
		}
	},
	moveStop: function(){
		this.vs[0].dy = 0;
		this.vs[1].dy = 0;
		removeListener(curLevel, 'wallMove', 'cP' + this.handle);
		removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
	},
	hitBounds: function(lastY, gLocal, yMin, yMax){
		var tLeft = 1;
		var dy = this.vs[0].dy;
		var unboundedY = lastY + dy*tLeft + .5*gLocal*tLeft*tLeft;
		var boundedY = Math.max(yMin, Math.min(yMax, unboundedY));
		var discr = dy*dy + 2*gLocal*(boundedY-lastY);
		if (boundedY==yMax){
			
			var tHit = (-dy + Math.sqrt(discr))/gLocal;

		} else if (boundedY==yMin) {
			
			var tHit = (-dy - Math.sqrt(discr))/gLocal;
		}
		this.vs[0].dy+=gLocal*tHit;
		this.vs[1].dy+=gLocal*tHit;
		this.vs[0].dy*=-1;
		this.vs[1].dy*=-1;
		tLeft-=tHit;
		dy = this.vs[0].dy;
		if(-2*dy< tLeft*gLocal && dy<0){
			var tBounce = Math.abs(2*dy/gLocal);
			var numBounces = Math.floor(tLeft/tBounce);
			tLeft-=numBounces*tBounce;
		}
		var nextY = boundedY + dy*tLeft + .5*gLocal*tLeft*tLeft;
 
		
		this.vs[0].dy += gLocal*tLeft;
		this.vs[1].dy += gLocal*tLeft;
		
		return nextY;
	},

	setHitMode: function(inputMode){
		(/^[sS]td$/.test(inputMode) || /^[aA]rrowDV$/.test(inputMode) || /^[aA]rrowSpd$/.test(inputMode) || /^[gG]ravity$$/.test(inputMode)) ? this.hitMode = inputMode.toCapitalCamelCase() : console.log('bad hitMode ' + inputMode);
	},
	setDefaultReadout: function(readout){
		this.defaultReadout = readout;
		return this;
	},
	unsetDefaultReadout: function(){
		this.defaultReadout = undefined;
		return this;
	},
	setTemp: function(temp){
		this.tSet = temp;
	},
	getCv: function() {
		var Cv = 0;
		for (var spcName in window.spcs) {
			var dots = dotManager.get({tag: this.handle, spcName: spcName});
			Cv += (dots ? dots.length : 0) * spcs[spcName].cv / N;
		}
		return Cv;
	},

	isothermalInit: function(temp){
		if (temp) {
			if (typeof temp == 'number') {
				this.tSet = temp;
			} else if (/current/i.test(temp)) {
				var tempData = this.getDataSrc('temp');	
				this.tSet = tempData[tempData.length - 1];
			}
		}
		this.eToAdd = 0;
		var activeDots = dotManager.get({tag: this.handle});
		var tempData = this.data.temp.src();
		//hey - this is called for each wall that is isothermal, but that's okay, it only inits once.  The listener would over overwritten anyway
		if (!this.isothermal) {
			addListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle,
				function(){
					var tLastLiq, dt;
					var tLast = tempData[tempData.length - 1] || this.tSet;
					dt = this.tSet - tLast;
					this.eToAdd = this.getCv() * dt;
					for (var liquidName in this.liquids) {
						var liquid = this.liquids[liquidName];
						var listenerName = 'setT' + liquid.handle;
						removeListener(curLevel, 'update', listenerName);
						var tSet = this.tSet;
						var dT = tSet - liquid.temp;
						if (Math.abs(dT) > 1) {
							var dtTurn = dT / 15;
							addListener(curLevel, 'update', listenerName, function() {
								var tNew = stepTowards(liquid.temp, tSet, dtTurn);
								this.q += (tNew - liquid.temp) * liquid.Cp * JtoKJ;
								liquid.temp = tNew;
								if (tNew == tSet) removeListener(curLevel, 'update', listenerName);
									

							}, this)
						}
						

					}
				},
			this);
			// for (var liqHandle in this.liquids) {
				// this.isothermalInitLiquid(this.liquids[liqHandle]);
			// }
			this.recordQ();
		}
		for (var lineIdx=0; lineIdx<this.length; lineIdx++){
			this[lineIdx].isothermal = true;
		}
		this.isothermal = true;
	
	},
	isothermalStop: function(){
		this.isothermal = false;
		removeListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle);
	},
	surfArea: function(){
		var SA=0;
		for (ptIdx=0; ptIdx<this.length-1; ptIdx++){
			var pt = this[ptIdx];
			var ptNext = this[ptIdx+1];
			SA+=pt.distTo(ptNext);
		}
		
		return SA;
	},
	updateMass: function() {
		var totalMass = 0;
		for (var chunkName in this.massChunks){
			totalMass+=this.massChunks[chunkName];
		}
		this.mass = totalMass;			
	},
	setMass: function(chunkName, value){
		this.massChunks[chunkName] = value;
		this.updateMass();
		return this;
	},
	unsetMass: function(chunkName) {
		if (!chunkName) {
			for (var chunkName in this.massChunks){
				delete this.massChunk[chunkName]
			}		
		} else {
			delete this.massChunks[chunkName];
		}
		this.updateMass();
		return this;
	},
	addLiquid: function(liquid) {
		this.liquids[liquid.handle] = liquid;
	},
	removeLiquid: function(liquid) {
		if (typeof liquid == 'string') liquid = this.liquids[liquid];
		if (liquid && liquid.handle) {
			delete this.liquids[liquid.handle];
		}
	},
	setBounds: function(min, max){
		var wallBounds = this.bounds;
		if (max) {
			if (max instanceof Point) {
				wallBounds.max = max;
			} else {
				wallBounds.max.y = max;
			}	
		}
		if (min) {
			if (min instanceof Point) {
				wallBounds.min = min;
			} else {
				wallBounds.min.y = min;
			}	
		}
	},
	addBorder: function(attrs) {
		attrs.wall = this;
		this.border = new WallMethods.Border(attrs);
	},
	removeBorder: function() {
		if (this.border) this.border.remove();
	},


	addPts: function(spliceIdx, toAdd) {
		//can't just set concat result equal to this because this's prototype is extended
		//will use handler of wall at spliceIdx because they're usually all the same anyway
		var oldHandlers = [];
		var idx = this.parent.idxByInfo(this.handle);
		for (var handlerIdx=spliceIdx; handlerIdx<this.length; handlerIdx++) {
			oldHandlers.push(this.parent.getSubWallHandler(idx, spliceIdx))
		}
		var oldPts = this.concat();
		var toAddVs = [];
		for (var i=0; i<toAdd.length; i++) toAddVs.push(V(0, 0));
		var vSpliceArgs = [spliceIdx, 0].concat(toAddVs);
		var ptSpliceArgs = [spliceIdx, 0].concat(toAdd);
		Array.prototype.splice.apply(this, ptSpliceArgs);
		Array.prototype.splice.apply(this.vs, vSpliceArgs);
		// var newPts = oldPts.slice(0, spliceIdx).concat(toAdd, oldPts.slice(spliceIdx, oldPts.length));
		// for (var ptIdx=0; ptIdx<newPts.length; ptIdx++) {
			// this[ptIdx] = newPts[ptIdx];
		// }
		for (var movedPtIdx=spliceIdx + toAdd.length; movedPtIdx<this.length; movedPtIdx++) {
			this.parent.setSubWallHandler(this.handle, movedPtIdx, oldHandlers[movedPtIdx - toAdd.length - spliceIdx]);
		}
		var newHandler = oldHandlers[0] || this.parent[id + '-' + (spliceIdx - 1)];
		for (var newPtIdx=spliceIdx; newPtIdx<spliceIdx + toAdd.length; newPtIdx++) {
			this.parent.setSubWallHandler(this.handle, newPtIdx, newHandler)
		}
		this.parent.setupWall(this.handle);
		if (this.border && !this.border.removed) this.border.update();
	},
	removePts: function(spliceIdx, num) {
		var handlers = [];
		var idx = this.parent.idxByInfo(this.handle);
		for (var toMoveIdx = spliceIdx + num; toMoveIdx<this.length; toMoveIdx++) {
			handlers.push(this.parent.getSubWallHandler(idx, toMoveIdx));
		}
		this.splice(spliceIdx, num);
		this.vs.splice(splice, num);
		for (var subWallIdx=spliceIdx; subWallIdx<this.length; subWallIdx++) {
			this.parent.setSubWallHandler(idx, subWallIdx, handlers[subWallIdx-spliceIdx]);
		}
		this.parent.setupWall(this.handle);
		if (this.border && ! this.border.removed) this.border.update();
	},
	getPt: function(idx) {
		return this[idx];
	},
	getUV: function(idx) {
		return this.wallUVs[idx];
	},
	getPerpUV: function(idx) {
		return this.wallPerpUVs[idx];
	},
	
	populateArrows: function(dQ){
		var rotations = {'-1':'cw', '1':'ccw'};
		var dist = 30;
		var fill = this.parent.qArrowFill;
		var fillFinal = this.parent.qArrowFillFinal;
		var stroke = this.parent.qArrowStroke;
		var qList = this.data.q;
		var heatTransSign = getSign(dQ);
		var UVRot = rotations[heatTransSign];
		this.turnLastArrow = this.data.q.src().length-1;
		var dims = V(110*Math.abs(dQ), 170*Math.abs(dQ));//big numbers from adjusting to q per turn so if I change interval, size of arrows doesn't change
		var dimsFinal = dims.copy();
		dimsFinal.dx *= 1.4;
		dimsFinal.dy *= .85;
		var offset = {'-1':0, '1':-dimsFinal.dx-dist};
		if (dims.dx>7 || dims.dy>7) {
			for (var lineIdx=0; lineIdx<this.length-1; lineIdx++) {
				if (this[lineIdx].isothermal) {
					var len = this[lineIdx].distTo(this[lineIdx+1]);
					var numArrows = Math.round(len/150);
					var pxStep = len/(numArrows+1);
					var distAlongLine = pxStep;
					for (var arrowIdx=0; arrowIdx<numArrows; arrowIdx++){
						var pos = this[lineIdx].copy().movePt(this.wallUVs[lineIdx].copy().mult(distAlongLine)).movePt(this.wallPerpUVs[lineIdx].copy().mult(offset[heatTransSign]));
						new ArrowFly({pos:pos, 
										dist:dist, 
										UV:this.wallUVs[lineIdx].copy().perp(UVRot), 
										fill:fill, 
										fillFinal:fillFinal, 
										stroke:stroke,
										dims:dims,
										dimsFinal:dimsFinal,
										lifespan:3500
									});
						distAlongLine += pxStep;
					}	
				}
			}
		}
		 
	},
	cleanUp: function() {
		//HEY - I AM NOT SURE THIS EVEN EXISTS
		var listeners = this.cleanUpListeners;
		for (var listenerName in listeners) {
			var listener = listeners[listenerName];
			listener.func.apply(listener.obj);
		}
	}
	
}
WallMethods.BoundHandler = function(func, obj, replacesStd) {
	this.func = func;
	this.obj = obj;
	this.replacesStd = replacesStd;
}