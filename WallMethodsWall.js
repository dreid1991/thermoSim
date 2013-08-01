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
	checkWallHit: function(dot, wallPtIdx){
		//doing all this new Point and Vector business to take out one function call
		var wallUV = this.wallUVs[wallPtIdx];
		var perpUV = this.wallPerpUVs[wallPtIdx];
		//this is to make the walls two-sided.  It sort of works
		// var dotToWall = new Vector(wallPt.x - dot.x, wallPt.y - dot.y);
		// var dotProdToWall = dotToWall.dx * perpUV.dx + dotToWall.dy * perpUV.dy;
		// var sign = Math.abs(dotProdToWall) / dotProdToWall;
		// if (sign * dotProdToWall < dot.r) {
			// //makes it so it definitely hits if we're closer than r
			// var dotProdNext = -dotProdToWall;
		// } else {
			// var dotEdgePt;
			// if (dotProdToWall >= 0) {
				// dotEdgePt = new Point(dot.x + perpUV.dx * dot.r, dot.y + perpUV.dy * dot.r)
			// } else {
				// dotEdgePt = new Point(dot.x - perpUV.dx * dot.r, dot.y - perpUV.dy * dot.r)
			// }
			// var wallANext = new Point(wallPt.x + wall.vs[wallPtIdx].dx, wallPt.y + wall.vs[wallPtIdx].dy);
			// var wallBNext = new Point(wall[wallPtIdx + 1].x + wall.vs[wallPtIdx + 1].dx, wall[wallPtIdx + 1].y + wall.vs[wallPtIdx + 1].dy);
			// var edgePtNext = new Point(dotEdgePt.x + dot.v.dx, dotEdgePt.y + dot.v.dy);
			// var dx = wallBNext.x - wallANext.x;
			// var dy = wallBNext.y - wallANext.y;
			// var mag = Math.sqrt(dx * dx + dy * dy);
			// //hello.  If you even change the direction that perp wall UVs are taken, this will break.
			// var dotToWallNext = new Vector(wallANext.x - edgePtNext.x, wallANext.y - edgePtNext.y);
			// var perpNext = new Vector(-dy / mag, dx / mag);
			// var dotProdNext = dotToWallNext.dx * perpNext.dx + dotToWallNext.dy * perpNext.dy;
		// }
		
		// if (dotProdToWall * dotProdNext <=0 && this.isBetween(dot, wall, wallPtIdx, wallUV)) {
	
			// var perpV = -perpUV.dx * dot.v.dx - perpUV.dy * dot.v.dy;
			// var dxo = dot.v.dx;
			// var dyo = dot.v.dy;
			// var tempo = dot.temp();
			// this['didHit' + wall.hitMode](dot, wall, wallPtIdx, wallUV, perpV, perpUV);
			// return true;
		// } else {
			// return false;
		// }
		
		
		var dotVec = new Vector(dot.x + dot.v.dx - perpUV.dx*dot.r - this[wallPtIdx].x, dot.y + dot.v.dy - perpUV.dy*dot.r - this[wallPtIdx].y);
		var distPastWall = -perpUV.dotProd(dotVec);
		var perpV = -perpUV.dotProd(dot.v);
		if (distPastWall>=0 && distPastWall<=this.hitThreshold && this.isBetween(dot, wallPtIdx, wallUV)){
			this['didHit'+this.hitMode](dot, wallPtIdx, wallUV, perpV, perpUV);
			return true;
		}
		return false;
	},
////////////////////////////////////////////////////////////
//WALL HIT HANDLER WRAPPERS
////////////////////////////////////////////////////////////	
	didHitStd: function(dot, subWallIdx, wallUV, perpV, perpUV) {
		var handler = this.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, this, subWallIdx, wallUV, perpV, perpUV]);		
	},
	isBetween: function(dot, wallPtIdx, wallUV){
		// var numVsPast = perpV == 0 ? 0 : distPastWall / perpV;
		// var dotPosAdj = new Point(dot.x - numVsPast * dot.v.dx, dot.y - numVsPast * dot.v.dy);
		
		var wallPtA = new Point(this[wallPtIdx].x - wallUV.dx * dot.r, this[wallPtIdx].y - wallUV.dy * dot.r);
		var wallPtB = new Point(this[wallPtIdx + 1].x + wallUV.dx * dot.r, this[wallPtIdx + 1].y + wallUV.dy * dot.r);
		
		// var aToDot = new Vector(dotPosAdj.x - wallPtA.x, dotPosAdj.y - wallPtA.y); //inlining VTo
		// var bToDot = new Vector(dotPosAdj.x - wallPtB.x, dotPosAdj.y - wallPtB.y);
		var aToDot = new Vector(dot.x - wallPtA.x, dot.y - wallPtA.y);
		var bToDot = new Vector(dot.x - wallPtB.x, dot.y - wallPtB.y);
		return (aToDot.dotProd(wallUV) >= 0 && bToDot.dotProd(wallUV) <= 0);
		
	},
	didHitArrowDV: function(dot, subWallIdx, wallUV, perpV, perpUV) {
		var vo = dot.v.copy();
		var handler = this.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, this, subWallIdx, wallUV, perpV, perpUV]);
		var pos = P(dot.x, dot.y);
		var vf = dot.v.copy();
		var perpVf = -perpUV.dotProd(dot.v);
		this.drawArrowV(pos, vo, vf, perpV, perpVf);  
	},
	didHitArrowSpd: function(dot, subWallIdx, wallUV, perpV, perpUV) {
		var vo = dot.v.copy();
		var handler = this.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, this, subWallIdx, wallUV, perpV, perpUV]);
		var pos = P(dot.x, dot.y);
		var vf = dot.v.copy();
		var perpVf = -perpUV.dotProd(dot.v);
		this.drawArrowSpd(pos, vo, vf, perpV, perpVf);  
	},
	didHitGravity: function(dot, subWallIdx, wallUV, perpV, perpUV) {
		var handler = this.handlers[subWallIdx];
		if (wallUV.dx!=0) {
			var yo = dot.y;
			var dyo = dot.v.dy;
		}
		handler.func.apply(handler.obj, [dot, this, subWallIdx, wallUV, perpV, perpUV])
		if (wallUV.dx!=0) {
			//v^2 = vo^2 + 2ax;
			var discrim = dot.v.dy*dot.v.dy + 2*gInternal * (dot.y-yo);
			if (discrim>=0) { 
				if (dot.v.dy>0) {
					dot.v.dy = Math.sqrt(discrim);
				} else {
					dot.v.dy = -Math.sqrt(discrim);
				}		
			} else { 
				//should not have gotten as far up as reflection over wall moved it     so dyFinal<0/
				//so basically I'm setting a new velocity (1e-7)and solving for the approptiate y
				dot.v.dy = -1.e-7;
				dot.y = (dot.v.dy*dot.v.dy - dyo*dyo)/(2*gInternal) + yo;
			}
		}
	},
////////////////////////////////////////////////////////////
//END
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//COLLIDE EXTRAS
////////////////////////////////////////////////////////////
	drawArrowV: function(pos, vo, vf, perpVo, perpVf){
		var arrowPts = new Array(3);
		arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
		arrowPts[1] = pos.copy();
		arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
		var lifespan = 50;
		var arrowTurn = 0;
		var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
		var arrow = new ArrowLine(handle, arrowPts, Col(255,0,0), lifespan, 'main');


		var textPos = pos.copy().movePt(vf.mult(15));
		var delV = (Math.abs(perpVo)+Math.abs(perpVf))*pxToMS;
		animText.newAnim({pos:textPos}, 
				{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
				{text:'deltaV = '+round(delV,1)+'m/s', time:3000}
		);
	},
	drawArrowSpd: function(pos, vo, vf, perpVo, perpVf){
		var arrowPts = new Array(3);
		arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
		arrowPts[1] = pos.copy();
		arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
		var lifespan = 50;
		var arrowTurn = 0;
		var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
		var arrow = new ArrowLine(handle, arrowPts, Col(255,0,0), lifespan, 'main');


		var textPos = pos.copy().movePt(vf.mult(15));
		var V = vf.mag()*pxToMS*.1;//MAYBE SEND DOT.  GET SPEED RIGHT WAY.
		animText.newAnim({pos:textPos}, 
				{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
				{text:'Speed = '+round(V,1)+'m/s', time:3000}
		);
	},
	changeSetPt: function(dest, compType, speed){
		if (/isothermal/i.test(compType)) {
			var wallMoveMethod = 'cVIsothermal';
		} else if (/adiabatic/i.test(compType)) {
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
				if (tempData.length) {
					this.tSet = tempData[tempData.length - 1];
				}
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
		var newHandler = oldHandlers[0] || this.handlers[spliceIdx - 1];
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
		//QArrowsAmmt uses this
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