/*
Contains:
	Clamps
	ArrowStatic
	Inlet
	Outlet
	Tracer
in that order
*/

//////////////////////////////////////////////////////////////////////////
//CLAMPS
//////////////////////////////////////////////////////////////////////////
function Clamps(attrs) {
	this.type = 'Clamps';
	this.handle = attrs.handle;
	this.draw = defaultTo(false, attrs.draw);
	this.releaseWith = defaultTo('button', attrs.releaseWith);
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.currentClamper = undefined;
	this.clamps = attrs.clamps;
	this.wall = walls[attrs.wallInfo];
	this.buttonId = 'clampRelease' + this.wall.handle;
	this.wallHandler = this.wall.parent.getSubWallHandler(this.wall.handle, 0);
	this.init();
}

_.extend(Clamps.prototype, objectFuncs, {
	init: function() {
		this.setupStd();
		this.wall.moveStop();
		this.assembleClamps();
		if (this.releaseWith=='button') {
			this.makeReleaseButton();
		} else {
			this.setupClampClicking(); //Not implemented 
		}
		if (this.draw) {
			this.drawClamps(); //Not implemented
		}
		this.freezeWall();

		
	},
	assembleClamps: function() {
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var clamp = this.clamps[clampIdx];
			if (clamp.vol) {
				clamp.y = this.wall.volToY(clamp.vol)
				delete clamp.vol;
			}
			clamp.clamping = false;
		}
		this.sortClamps();
		this.addInitClamp();
	},
	sortClamps: function() {
		//sorting for low y's at beginning of list;
		for (var i=0; i<this.clamps.length; i++) {
			var switched = false;
			for (var j=0; j<this.clamps.length-1; j++) {
				if (this.clamps[j].y>this.clamps[j+1].y) {
					this.clamps.switchElements(j, j+1);
					switched = true;
				}
			}
			if (!switched) {
				break;
			}
		}
	},
	addInitClamp: function() {
		var initClampY = this.wall[0].y;
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var curClampY = this.clamps[clampIdx].y;
			if (curClampY>initClampY) {
				this.clamps.splice(clampIdx, 0, {y:initClampY, clamping:true});
				this.currentClamper = this.clamps[clampIdx];
				break;
			}
		}
	},
	makeReleaseButton: function() {
		var self = this;
		addButton(this.buttonId, 'Release');
		buttonBind(this.buttonId, function() {self.release()});
	},
	removeReleaseButton: function() {
		removeButton(this.buttonId);
	},
	release: function() {
		var highBound = undefined;
		var lowBound = undefined;
		this.currentClamper.clamping = false;
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		var highClamp = this.clamps[currentIdx+1];
		var lowClamp = this.clamps[currentIdx-1];
		if (highClamp) {
			highBound = highClamp.y;
		}
		if (lowClamp) {
			lowBound = lowClamp.y;
		}
		var self = this;
		var onArrive = function(y) {
			self.activateClamp(y);
		}
		this.wall.releaseWithBounds(lowBound, highBound, this.wallHandler, onArrive);
	},
	activateClamp: function(arrivedAt) {
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		this.currentClamper.clamping = false;
		if (arrivedAt<this.currentClamper.y) {
			this.currentClamper = this.clamps[currentIdx-1];
		} else {
			this.currentClamper = this.clamps[currentIdx+1];
		}
		this.currentClamper.clamping = true;
		this.freezeWall();	
	},
	freezeWall: function() {
		walls.setSubWallHandler(this.wall.handle, 0, 'staticAdiabatic');	
	},
	remove: function() {
		if (!this.wall.removed) {
			this.wall.moveInit();
			this.wall.parent.setSubWallHandler(walls.indexOf(this.wall), 0, this.wallHandler);
		}
		if (this.releaseWith == 'button') {
			this.removeReleaseButton();
		}
	},

} 
)
function sillyArrow(){
	new ArrowFly({pos:P(100, 100), 
					dist:100, 
					V:V(300,30), 
					fill:Col(200,0,0), 
					fillFinal:Col(0,200,0), 
					stroke:Col(0,0,200),
					dims:V(100,50),
					dimsFinal:V(50,100),
					lifespan:5000,
					cleanUpWith:'section',
				});
}

function sillierArrow() {
	return new ArrowStatic({pos:P(00, 00),
					dims:V(100,50),
					angle:0,
					fill:Col(150, 0, 0),
					stroke:Col(0, 255, 255),
					label:undefined,
					});
					
}

function ArrowStatic(attrs) {
	this.type = 'ArrowStatic';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.pos = attrs.pos.copy();
	this.dims = attrs.dims.copy();
	this.pts = this.getPts();
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	if (attrs.label) {
			this.label = attrs.label;
		} else {
			this.label = false;
	}
	if (attrs.angle) {
		this.angle = attrs.angle;
	} else if (attrs.UV) {
		this.angle = UVToAngle(attrs.UV);
	}
	this.setTextOffset();
	this.fill = attrs.fill.copy();
	this.textCol = defaultTo(Col(255,255,255), attrs.textCol);
	this.stroke = defaultTo(attrs.stroke, Col(0,0,0));
	this.init();
}
_.extend(ArrowStatic.prototype, objectFuncs, toInherit.ArrowFuncs, {
	init: function() {
		this.updateListenerName = unique(this.type + defaultTo('', this.handle), curLevel.updateListeners.listeners);
		if (this.label) {
				addListener(curLevel, 'update', this.updateListenerName, this.runLabel, this);
			} else {
				addListener(curLevel, 'update', this.updateListenerName, this.runNoLabel, this);
		}
		this.setupStd();
	},
	runLabel: function() {
		this.drawCanvas.save();
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.angle);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas);
		this.drawCanvas.translate(this.textOffset.dx, this.textOffset.dy);
		this.drawCanvas.rotate(-this.angle);
		draw.text(this.label, P(0,0), '13pt calibri', this.textCol, 'center', 0, this.drawCanvas);
		this.drawCanvas.restore();
	},
	runNoLabel: function() {
		this.drawCanvas.save();
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.angle);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas);
		this.drawCanvas.restore();
	},
	setTextOffset: function() {
		this.textOffset = V(7 + 5*Math.sin(Math.abs(-this.angle)), Math.cos(this.angle)*5);
	},
	getDims: function() {
		return this.dims;
	},
	move: function(v) {
		this.pos.movePt(v);
		return this;
	},
	scale: function(v) {
		this.dims.multVec(v);
		this.pts = this.getPts();
		return this;
	},
	size: function(v) {
		this.dims = v.copy();
		this.pts = this.getPts();
		return this;
	},
	rotate: function(angle) {
		this.angle+=angle;
		this.setTextOffset();
		return this;
	},
	getAngle: function() {
		return this.angle;
	},
	setFill: function(fill) {
		this.fill = fill.copy();
	},
	setStroke: function(stroke) {
		this.stroke = stroke.copy();
	},
	remove: function() {
		removeListener(curLevel, 'update', this.updateListenerName);
		this.removeCleanUp();
	},
	

}
)

var flowFuncs = {
	getPts: function(a, b, UV, perp, fracOffset) {
		var distAB = a.VTo(b).mag();
		var widthFrac = this.width/(distAB);
		this.fracOffset = Math.max(Math.min(this.fracOffset, 1 - widthFrac/2), widthFrac/2);
		var aOffset = fracOffset - widthFrac;
		var bOffset = fracOffset + widthFrac;
		var pt1 = a.copy().fracMoveTo(b, aOffset);
		var pt4 = a.copy().fracMoveTo(b, bOffset);
		var pt2 = pt1.copy().movePt(perp.copy().neg().mult(this.depth));
		var pt3 = pt4.copy().movePt(perp.copy().neg().mult(this.depth));
		return [pt1, pt2, pt3, pt4];
	},
	addPts: function() {
		var aIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]);
		var bIdx = Math.max(this.ptIdxs[0], this.ptIdxs[1]);
		var a = this.wall.getPt(aIdx).copy();
		var b = this.wall.getPt(bIdx).copy();
		this.perp = this.wall.getPerpUV(aIdx);
		var UV = this.wall.getUV(aIdx);
		this.pts = this.getPts(a, b, UV, this.perp, this.fracOffset);
	},
	addArrows: function(UV, type) {
		var width = this.width;
		var arrowCount = this.width > 30 ? 2 : 1;
		var pos = this.pts[1].copy();
		pos.movePt(UV.copy().neg().mult(this.arrowDims.dy/3));
		var ptVec = this.pts[1].VTo(this.pts[2]);
		var stepAdvance = ptVec.copy().UV().copy().mult(ptVec.mag()/(arrowCount + 1));
		for (var ctIdx=0; ctIdx<arrowCount; ctIdx++) {
			pos.movePt(stepAdvance);
			new ArrowStatic({pos: pos, dims: this.arrowDims, UV: UV.copy(), fill: this.arrowFill, stroke: this.arrowStroke, cleanUpWith: this.cleanUpWith})
		}
	}
}

	//wallInfo, flows(array), ptIdxs, fracOffset, makeSlider, fracOpen
	//flows as [{spcName: , nDotMax: , temp: }]
function Inlet (attrs) {
	this.arrowDims = V(15, 20);
	this.arrowFill = Col(200, 0, 0);
	this.arrowStroke = Col(100, 100, 100);
	this.type = 'Inlet';
	this.handle = attrs.handle;
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.width = defaultTo(30, attrs.width);
	this.depth = defaultTo(20, attrs.depth);
	this.fracOpen = defaultTo(1, attrs.fracOpen);
	//if depth is 0, just have it not add any pointsa
	this.makePts = this.depth;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset);
	this.flows = this.processFlows(attrs.flows);
	this.makeSlider = attrs.makeSlider;
	if (this.makeSlider) {
		this.sliderId = this.addSlider('Flow rate', {value: this.fracOpen*100}, [{eventType:'slide', obj:this, func:this.parseSlider}]);
	}
	this.setupStd();
	this.init();
	
}

_.extend(Inlet.prototype, flowFuncs, objectFuncs, {
	init: function() {
		this.addPts();
		
		//add pts to wall, need to figure out handler.  I guess use the one for pt a
		//make wall check if any adjacent points are equal, splice out if they are (to deal with depth == 0 case)
		if (this.makePts) {
			this.wall.addPts(this.ptIdxs[1], this.pts);
		}
		var inletLine = {pos: this.pts[1].copy(), vec: this.pts[1].VTo(this.pts[2]), dir: this.perp.copy()};
		this.addArrows(this.pts[1].VTo(this.pts[2]).UV().perp('ccw'));
		this.makeInlet(inletLine, this.flows);
	},


	processFlows: function(flows) {
		var procdFlows = [];
		for (var flowIdx=0; flowIdx<flows.length; flowIdx++) {
			var flow = flows[flowIdx];
			procdFlows.push({spc: spcs[flow.spcName], temp: flow.temp, nDotMax: flow.nDotMax, returnTo: this.wallInfo, tag: flow.tag})
			procdFlows[procdFlows.length-1].nDotMax *= 1000 / updateInterval;
		}
		return procdFlows;
	},
	parseSlider: function(event, ui){
		this.fracOpen = ui.value / 100;
	},
	makeInlet: function(inletLine, flows) {
		var inletPos = inletLine.pos;
		var inletVec = inletLine.vec;
		var inletDir = inletLine.dir;
		var dotBank = new Array(flows.length);
		var flowLen = flows.length;
		for (var i=0; i<dotBank.length; i++) dotBank[i] = 0;
		addListener(curLevel, 'update', this.type + this.handle, function() {
			for (var flowIdx=0; flowIdx<flowLen; flowIdx++) {
				var flow = flows[flowIdx];
				dotBank[flowIdx] += this.fracOpen * flow.nDotMax;
				var toMake = Math.floor(dotBank[flowIdx])
				if (toMake) {
					var newDots = [];
					for (var makeIdx=0; makeIdx<toMake; makeIdx++) {
						var rnd = Math.random();
						var pos = P(inletPos.x + inletVec.dx * rnd, inletPos.y + inletVec.dy * rnd);
						newDots.push({pos: pos, dir: inletDir, temp: flow.temp, returnTo: flow.returnTo, tag: flow.tag})
						
					}
					flow.spc.place(newDots);
					dotBank[flowIdx] -= toMake;
				}
			}
		}, this) //maybe context should be this.  Will see if it's needed
	},
	remove: function() {
		if (this.sliderId) {
			this.removeSlider();
		}
		removeListener(curLevel, 'update', this.type + this.handle);
	
	}


})
function Outlet(attrs) {
	this.arrowDims = V(15, 20);
	this.arrowFill = Col(200, 0, 0);	
	this.arrowStroke = Col(100, 100, 100);
	this.type = 'Outlet';
	this.handle = attrs.handle;
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	//if depth is 0, just have it not add any pointsa
	this.width = defaultTo(30, attrs.height);
	this.depth = defaultTo(20, attrs.depth) || 20; //can't be zero, need to set a wall handler
	this.fracOpen = defaultTo(1, attrs.fracOpen);
	this.makePts = this.depth;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset);
	this.init();
}

_.extend(Outlet.prototype, flowFuncs, objectFuncs, {
	init: function() {	
		this.addPts();
		if (this.makePts) {
			this.wall.addPts(this.ptIdxs[1], this.pts);
		}
		var subWallIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]) + 2;
		this.addArrows(this.pts[1].VTo(this.pts[2]).UV().perp('cw'));
		walls.setSubWallHandler(this.wallInfo, subWallIdx, 'outlet');
	}		
})


function Tracer(attrs) {
	this.handle = attrs.handle;
	this.type = 'Tracer';
	this.info = attrs.info;
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.col = defaultTo(Col(175, 175, 175), attrs.col);
	this.lifespan = Math.round(1000/updateInterval * defaultTo(5, attrs.lifespan));
	this.listenerHandle = this.type + this.handle + 'Draw';
	this.listenerHandleSearch = this.type + this.handle + 'Search';
	this.setupStd();
	this.drawCanvas = c;
	this.drawingTools = draw;
	this.init();
	
}

_.extend(Tracer.prototype, objectFuncs, {
	init: function() {
		this.dot = this.getDot();
		this.pts = [];
		if (this.dot) {
			removeListener(curLevel, 'update', this.listenerHandleSearch);
			addListener(curLevel, 'update', this.listenerHandle, this.draw, this);
		} else {
			addListener(curLevel, 'update', this.listenerHandleSearch, this.init, this);
		}
	},
	getDot: function() {
		var potentials = dotManager.get(this.info);
		if (potentials.length > 0) {
			if (this.info.idx && this.info.idx < potentials.length) {
				return potentials[this.info.idx];
			} else {
				return potentials[Math.floor(Math.random() * potentials.length)];
			}
		}
	},
	draw: function() {
		if (this.dot.active) {
			this.pts.push(P(this.dot.x, this.dot.y));
			if (this.pts.length > this.lifespan) this.pts.splice(0, 1);
			this.drawingTools.path(this.pts, this.col, this.drawCanvas);
		} else {
			this.init();
		}
	},
	remove: function() {
		removeListener(curLevel, 'update', this.listenerHandleSearch);
		removeListener(curLevel, 'update', this.listenerHandle);
	},
})