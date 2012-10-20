/*
Contains:
	Clamps
in that order
*/

//////////////////////////////////////////////////////////////////////////
//CLAMPS
//////////////////////////////////////////////////////////////////////////
function Clamps(attrs) {
	this.type = 'Clamps';
	this.draw = defaultTo(false, attrs.draw);
	this.releaseWith = defaultTo('button', attrs.releaseWith);
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.clampee = attrs.clampee;
	this.currentClamper = undefined;
	this.clamps = attrs.clamps;
	this.wall = this.clampee.wall;
	this.buttonId = 'clampRelease' + this.wall.handle;
	this.wallHandler = this.wall.parent.getSubWallHandler(this.wall.handle, 0);
	this.init();
}

_.extend(Clamps.prototype, objectFuncs, {
	init: function() {
		this.addCleanUp();
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
				clamp.vol = undefined;
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
					cleanUpWith:'block',
				});
}

function sillierArrow() {
	return new ArrowStatic({pos:P(100, 100),
					dims:V(100,50),
					angle:Math.PI,
					fill:Col(150, 0, 0),
					stroke:Col(0, 255, 255),
					label:'LOL',
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
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	return this.init();
}
_.extend(ArrowStatic.prototype, objectFuncs, toInherit.ArrowFuncs, {
	init: function() {
		this.updateListenerName = unique(this.type + defaultTo('', this.handle), curLevel.updateListeners.listeners);
		if (this.label) {
				addListener(curLevel, 'update', this.updateListenerName, this.runLabel, this);
			} else {
				addListener(curLevel, 'update', this.updateListenerName, this.runNoLabel, this);
		}
		this.addCleanUp();
		return this;		
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
		this.textOffset = V(8, Math.cos(this.angle)*5);
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
