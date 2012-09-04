/*
Contains:
	Sandbox
	ParticleEmitter
	PulseArrow
in that order
*/

//////////////////////////////////////////////////////////////////////////
//Sandbox
//////////////////////////////////////////////////////////////////////////

function Sandbox(attrs){
	this.type = 'Sandbox';
	var self = this;
	attrs = defaultTo({}, attrs);
	this.bin = {};
	this.sand = {};
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.rate = defaultTo(.15, attrs.rate);
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.massMax = defaultTo(75, attrs.massMax);
	this.massMin = defaultTo(10, attrs.massMin);
	this.mass = defaultTo(10, attrs.massInit);
	this.buttonAdd = defaultTo('buttonAddMass', attrs.addButtonId);
	this.buttonRemove = defaultTo('buttonRemoveMass', attrs.removeButtonId);
	this.particleMass = .05;
	this.buttonAddId = 'sandAdd';
	this.buttonRemoveId = 'sandRemove';
	this.makeButtons();
	
	this.massChunkName = 'sandMass' + defaultTo('', attrs.handle);
	this.wall.setMass(this.massChunkName, this.mass);	
	this.wall.recordPExt();
	this.wall.recordWork();
	this.wallHandler = defaultTo('cPAdiabaticDamped', attrs.compMode) + compAdj;	
	walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);	
	
	this.wallPt = this.wall[0];
	
	this.emitters = new Array();

	this.binX = (this.wall[1].x+this.wall[0].x)/2;

	this.spcVol = 70; //specific volume
	this.sand.col = defaultTo(Col(224, 165, 75), attrs.sandCol);
	this.sand.pts = this.getSandPts();
	this.sand.pos = P(this.binX, this.wall[0].y).track({pt:this.wallPt, noTrack:'x'});

	this.pistonPt = this.wall[0].y;
	
	this.addCleanUp();
	
	return this.init();	
}
_.extend(Sandbox.prototype, compressorFuncs, objectFuncs,
{
	init: function(){	
		this.drawListenerName = unique('drawSand' + this.handle, curLevel.updateListeners.listeners);
		addListener(curLevel, 'update', this.drawListenerName, this.draw, this);
		this.wall.moveInit();
		this.wall.recordMass();
		this.wall.recordPExt();
		this.wall.displayMass();
		this.wall.displayPExt();
		return this;
	},
	makeButtons: function(){
		addButton(this.buttonAddId, 'Add mass');
		addButton(this.buttonRemoveId, 'Remove mass');
		var self = this;
		$('#'+this.buttonAddId).mousedown(function(){self.buttonAddDown()});
		$('#'+this.buttonAddId).mouseup(function(){self.buttonAddUp()});
		
		$('#'+this.buttonRemoveId).mousedown(function(){self.buttonRemoveDown()});
		$('#'+this.buttonRemoveId).mouseup(function(){self.buttonRemoveUp()});
	},
	removeButtons: function(){
		$('#'+this.buttonAddId).remove();
		$('#'+this.buttonRemoveId).remove();
	},
	draw: function(){
		this.drawCanvas.save();
		this.drawCanvas.translate(this.sand.pos.x, this.sand.pos.y);
		var scalar = Math.sqrt(this.mass*.4);
		this.drawCanvas.scale(scalar, scalar)
		draw.fillPts(this.sand.pts, this.sand.col, this.drawCanvas);
		this.width = scalar * (this.sand.pts[this.sand.pts.length-1].x - this.sand.pts[0].x);
		this.drawCanvas.restore();		
	},
	getSandPts: function(){
		var pts = new Array(4);
		pts[0] = P(-10, 0);
		pts[1] = P(-7, -2);
		pts[2] = P(-3, -6);
		pts[3] = P(0, -7);
		ptsRight = deepCopy(pts).splice(0, pts.length-1).reverse();
		mirrorPts(ptsRight, P(0, 0), V(0, -10));
		pts = pts.concat(ptsRight);
		return pts;
	},
	buttonAddDown: function(){
		if(this.mass < this.massMax){
			this.boundUpper();
			this.addMass();
		}
	},
	buttonAddUp: function(){
		if(this.mass > this.massMin){
			this.boundUpperStop();
			this.addMassStop();	
		}
	},
	buttonRemoveDown: function(){
		this.boundLower();
		this.removeMass();
	},
	buttonRemoveUp: function(){
		this.boundLowerStop();
		this.removeMassStop();
	},
	boundUpper: function(){
		var listenerName = this.handle + 'BoundUpper'
		if(!curLevel.updateListeners.listeners[listenerName]){
			addListener(curLevel, 'update', listenerName,
				function(){
					if(this.mass > this.massMax){
						this.stopAllEmitters()
						removeListener(curLevel, 'update', listenerName);
					}
				},
			this)
		}
	},
	boundLower: function(){
		var listenerName = this.handle + 'BoundLower'
		if(!curLevel.updateListeners.listeners[listenerName]){
			addListener(curLevel, 'update', listenerName,
				function(){
					if(this.mass < this.massMin){
						this.stopAllEmitters();
						removeListener(curLevel, 'update', listenerName);
					}
				},
			this)
		}	
	},
	boundUpperStop: function(){
		var listenerName = this.handle + 'BoundUpper';
		removeListener(curLevel, 'update', listenerName);
	},
	boundLowerStop: function(){
		var listenerName = this.handle + 'BoundLower';
		removeListener(curLevel, 'update', listenerName);	
	},
	stopAllEmitters: function(){
		for(var emitterIdx=0; emitterIdx<this.emitters.length; emitterIdx++){
			this.emitters[emitterIdx].stopFlow();
		}
	},
	addMass: function(){
		this.emitters.push(this.makeAddEmitter())
	},
	addMassStop: function(){
		this.emitters[this.emitters.length-1].stopFlow();
	},
	removeMass: function(){
		this.emitters.push(this.makeRemoveEmitter());
	},
	removeMassStop: function(){
		this.emitters[this.emitters.length-1].stopFlow();
	},
	makeAddEmitter: function(){
		var onArrive = {func:this.onArriveAdd, obj:this};
		var emitterIdx = this.emitters.length;
		
		var dir = Math.PI/2;
		var col = this.sand.col;
		var centerPos = (this.wall[0].x + this.wall[1].x)/2;
		var dist = this.wall[0].y;
		var newEmitter = new ParticleEmitter({pos:P(centerPos, 0), width:this.width, dist:dist, dir:dir, col:col,
											onRemove:onRemove, parentList:this.emitters, onArrive:onArrive});
		newEmitter.adding = true;
		moveListenerName = unique('adjustEmitter' + emitterIdx, curLevel.updateListeners.listeners)
		addListener(curLevel, 'update', moveListenerName, 
			function(){
				newEmitter.adjust({dist:this.wallPt.y, width:this.width});
			},
		this);
		var onRemove = 
			{func:function(){
				removeListener(curLevel, 'update', moveListenerName);
			}, 
			obj:this};
		
		return newEmitter;
	},
	makeRemoveEmitter: function(){
		var onGenerate = {func:this.onGenerateRemove, obj:this};
		var emitterIdx = this.emitters.length;
		var dir = -Math.PI/2;
		var col = this.sand.col;
		var centerPos = (this.wall[0].x + this.wall[1].x)/2;
		var dist = this.wall[0].y;
		var newEmitter = new ParticleEmitter({pos:P(centerPos, 0), width:this.width, dist:dist, dir:dir, col:col,
											onRemove:onRemove, parentList:this.emitters, onGenerate:onGenerate});
		newEmitter.removing = true;
		moveListenerName = unique('adjustEmitter' + emitterIdx, curLevel.updateListeners.listeners)
		var wallPt = this.wall[0];
		addListener(curLevel, 'update', moveListenerName, 
			function(){
				newEmitter.adjust({pos:P(centerPos, wallPt.y), dist:wallPt.y, width:this.width});
			},
		this);
		var onRemove = 
			{func:function(){
				removeListener(curLevel, 'update', moveListenerName);
			}, 
			obj:this};
		
		return newEmitter;		
	},
	onGenerateRemove: function(){
		this.mass-=this.particleMass;
		this.wall.setMass(this.massChunkName, this.mass);
	},
	onArriveAdd: function(){
		this.mass+=this.particleMass;
		this.wall.setMass(this.massChunkName, this.mass);	
	},
	remove: function(){
		for(var emitterIdx=0; emitterIdx<this.emitters.length; emitterIdx++){
			this.emitters[emitterIdx].remove();
		}
		this.emitters = [];
		this.sand.pos.trackStop();
		this.removeButtons();
		removeListener(curLevel, 'update', this.drawListenerName);
		removeListener(curLevel, 'data', this.cleanUpEmittersListenerName);	
		this.wall.moveStop();
	},


}
)
/*
//////////////////////////////////////////////////////////////////////////
//ParticleEmitter
//////////////////////////////////////////////////////////////////////////
Requires
	pos
	dir
	width
	dist
	col
Optional
	parentList
	handle
	onGenerate
	onArrive
	onRemove
	rate
	speed
	speedSpread
	accel
	accelSpread
	dirSpread
	drawCanvas
*/
function ParticleEmitter(attrs){
	this.type = 'ParticleEmitter';
	this.pos = attrs.pos;
	this.handle = unique('emitter' + defaultTo('', attrs.handle), curLevel.updateListeners.listeners);
	this.dir = attrs.dir;
	this.parentList = attrs.parentList;
	this.width = attrs.width;
	this.col = attrs.col;
	this.dist = attrs.dist;
	this.onGenerate = attrs.onGenerate;
	this.onArrive = attrs.onArrive;
	this.onRemove = attrs.onRemove;
	this.rate = defaultTo(Math.round(.1*this.width), attrs.rate);
	this.speed = defaultTo(5, attrs.speed);
	this.speedSpread = defaultTo(1, attrs.speedSpread);
	if(2*this.speedSpread>this.speed){
		console.log('Uh-oh.  Making particle emitter with handle ' + this.handle + ' with speed spread such that particles will hit ~0 speed');
	}
	this.accel = defaultTo(.5, attrs.accel);
	this.accelSpread = defaultTo(1, attrs.accelSpread);
	this.dirSpread = defaultTo(0, attrs.dirSpread);
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.makeBounds();
	this.addCleanUp();
	this.particles = [];
	return this.init();
}
_.extend(ParticleEmitter.prototype, objectFuncs, {
	init: function(){
		this.runListenerName = unique('particle' + this.handle, curLevel.updateListeners.listeners);
		addListener(curLevel, 'update', this.runListenerName, this.run, this);
		return this;
	},
	adjust: function(attrs){
		for(var attr in attrs){
			this[attr] = attrs[attr];
		}
		this.makeBounds();
	},
	makeBounds: function(){
		this.UV = angleToUV(this.dir);
		var edgePt1 = this.pos.copy().movePt(this.UV.copy().rotate(-Math.PI/2).mult(this.width/2));
		var edgePt2 = this.pos.copy().movePt(this.UV.copy().rotate(Math.PI/2).mult(this.width/2));
		this.prodPt = edgePt1;
		this.prodV = edgePt1.VTo(edgePt2);
		this.finishPt = edgePt1.copy().movePt(this.UV.copy().mult(this.dist))
		this.finishV = this.finishPt.VTo(this.prodPt);
	},
	run: function(){
		this.generateNew();
		this.updateParticles();
		this.draw();
	},
	trickleOut: function(){
		this.updateParticles();
		this.draw();
		if(this.particles.length==0){
			this.remove();
		}
	},
	generateNew: function(){
		var numNew = Math.round(Math.random()*this.rate);
		for(var newIdx=0; newIdx<numNew; newIdx++){
			this.particles.push(this.newParticle());
			if(this.onGenerate){
				this.onGenerate.func.apply(this.onGenerate.obj);
			}
		}
	},
	newParticle: function(){
		var initPos = this.prodPt.copy().movePt(this.prodV.copy().mult(Math.random()));
		var initSpeed = Math.max(.01, this.speed + this.speedSpread*(Math.random()-.5));
		var accel = Math.max(0, this.accel + this.accelSpread*(Math.random()-.5));
		var UV = angleToUV(this.dir + this.dirSpread*(Math.random()-.5));
		var lifespan = this.getlifespan(initPos, initSpeed, accel, UV);
		return {pos:initPos, V:UV.copy().mult(initSpeed), accelV:UV.copy().mult(accel), age:0, lifespan:lifespan};
	},
	getlifespan: function(initPos, initSpeed, accel, UV){
		var coLinRatio = UV.dotProd(this.UV);
		var coLinAccel = accel*coLinRatio;
		var coLinSpeed = initSpeed*coLinRatio;
		var a = .5*coLinAccel;
		var b = coLinSpeed;
		var c = -this.dist;
		return (-b + Math.sqrt(b*b - 4*a*c))/(2*a);
	},
	updateParticles: function(){
		for (var particleIdx=this.particles.length-1; particleIdx>=0; particleIdx-=1){
			var particle = this.particles[particleIdx];
			particle.pos.movePt(particle.V);
			particle.V.add(particle.accelV);
			particle.age++;
			if(particle.age>particle.lifespan){
				this.particles.splice(particleIdx, 1);
				if(this.onArrive){
					this.onArrive.func.apply(this.onArrive.obj);
				}
			}	
		}
	},
	draw: function(){
		this.drawCanvas.strokeStyle = this.col.hex;
		for (var particleIdx = 0; particleIdx<this.particles.length; particleIdx++){
			var particle = this.particles[particleIdx];
			c.beginPath();
			c.moveTo(particle.pos.x, particle.pos.y);
			c.lineTo(particle.pos.x+2, particle.pos.y+2);
			//if lines start behaving strangely, not closing the path here may have something to do with it
			c.stroke();
		}	
	},
	stopFlow: function(){
		removeListener(curLevel, 'update', this.runListenerName);
		addListener(curLevel, 'update', this.runListenerName, this.trickleOut, this)
	},
	remove: function(){
		if(this.onRemove){
			this.onRemove.func.apply(this.onRemove.obj);
		}
		if(this.parentList){
			this.parentList.splice(_.indexOf(this.parentList, this), 1);
		}
		removeListener(curLevel, 'update', this.runListenerName);
		removeListener(curLevel, 'cleanUp', this.cleanUpListenerName);
		this.removed = true;
	},

}
)
/*
//////////////////////////////////////////////////////////////////////////
//PulseArrow
//////////////////////////////////////////////////////////////////////////
Requires
	posInit
	posFinal || ((dir || UV) && dist)
	fillInit
	dimsInit
	
Optional
	posFinal
	fillFinal
	dimsFinal
	strokeInit
	strokeFinal
	alphaInit
	alphaFinal
*/
function PulseArrow(attrs){
	this.type = 'PulseArrow';
	this.pos = this.pos.copy();
	if(attrs.posFinal){
		this.posFinal = this.posFinal;
		this.UV = this.pos.VTo(this.posFinal).UV();
		this.dist = this.pos.distTo(this.posFinal);
	} else if((attrs.dir || attrs.UV) && attrs.dist){
		if(attrs.dir){
			this.UV = angleToUV(attrs.dir);
		}else{
			this.UV = attrs.UV;
		}
		this.posFinal = this.pos.copy().movePt(this.UV.copy().mult(attrs.dist));
		this.dist = attrs.dist;
	}
	this.posFinal = attrs.posFinal;
	this.dims = attrs.dims
	this.dimsFinal = defaultTo(this.dims, attrs.dimsFinal);
	this.fill = attrs.fill.copy();
	this.fillFinal = defaultTo(this.fill, attrs.fillFinal);
	this.stroke = defaultTo(this.fill, attrs.stroke);
	this.strokeFinal = defaultTo(this.fillFinal, attrs.strokeFinal);
	this.alpha = defaultTo(1, attrs.alpha);
	this.alphaFinal = defaultTo(this.alpha, attrs.alpha);
	this.age = 0;
	this.lifespan = attrs.lifespan/updateInterval;
	this.getSteps();
	this.getPts();
	return this.init();
}
_.extend(PulseArrow.prototype, objectFuncs, {
	getSteps: function(){
		this.posStep = this.pos.vTo(this.posFinal).mult(1/this.lifespan);
		
		var ddx = this.dimsFinal.dx - this.dims.dx;
		var ddy = this.dimsFinal.dy - this.dims.dy;
		this.dimsStep = V(ddx, ddy).mult(1/this.lifespan);
		
		var drFill = this.fillFinal.r - this.fill.r;
		var dgFill = this.fillFinal.g - this.fill.g;
		var dbFill = this.fillFinal.b - this.fill.b;
		this.fillStep = Col(drFill, dgFill, dbFill).mult(1/this.lifespan);
		
		var drStroke = this.strokeFinal.r - this.stroke.r;
		var dgStroke = this.strokeFinal.g - this.stroke.g;
		var dbStroke = this.strokeFinal.b - this.stroke.b;
		this.strokeStep = Col(drStroke, dgStroke, dbStroke).mult(1/this.lifespan);
		
		this.alphaStep = (this.alphaFinal - this.alpha)/this.lifespan;
	},
	getPts: function(){
	
	},
	init: function(){
		addListener
		
	},
	run: function(){
	
	},
}
)