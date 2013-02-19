/*
Contains:
	Sandbox
	ParticleEmitter
	ArrowFly
	CheckMark
	Arrow
	TempChanger
	RMSChanger
	ReleaseArrow
in that order
*/

//////////////////////////////////////////////////////////////////////////
//Sandbox
//////////////////////////////////////////////////////////////////////////

function Sandbox(attrs){
	this.type = 'Sandbox';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	var self = this;
	attrs = defaultTo({}, attrs);
	this.bin = {};
	this.sand = {};
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	//must send init as pressure
	this.mass = this.pressureToMass(defaultTo(2, attrs.init));
	this.massMin = this.pressureToMass(defaultTo(.5, attrs.min));
	this.massMax = this.pressureToMass(defaultTo(15, attrs.max));


	this.particleMass = defaultTo(.01, attrs.partMass);
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
	this.sand.pos = P(this.binX, this.wall[0].y).track({pt:this.wallPt, noTrack:'x', cleanUpWith:this.cleanUpWith});

	this.pistonPt = this.wall[0].y;
	
	this.setupStd();
	
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
		return this;
	},
	makeButtons: function(){
		addButton(this.buttonAddId, 'Add mass');
		addButton(this.buttonRemoveId, 'Remove mass');
		var self = this;
		$('#'+this.buttonAddId).mousedown(function(){self.buttonAddDown()});
		//$('#'+this.buttonAddId).mouseup(function(){self.buttonAddUp()});
		
		$('#'+this.buttonRemoveId).mousedown(function(){self.buttonRemoveDown()});
		//$('#'+this.buttonRemoveId).mouseup(function(){self.buttonRemoveUp()});
	},
	removeButtons: function(){
		removeButton(this.buttonAddId);
		removeButton(this.buttonRemoveId);
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
			addListener(curLevel, 'mouseup', 'mouseUpSandbox', this.buttonAddUp, this);
		}
	},
	buttonAddUp: function(){
		this.boundUpperStop();
		this.addMassStop();	
		removeListener(curLevel, 'mouseup', 'mouseUpSandbox');
	},
	buttonRemoveDown: function(){
		if(this.mass > this.massMin){
			this.boundLower();
			this.removeMass();
			addListener(curLevel, 'mouseup', 'mouseUpSandbox', this.buttonRemoveUp, this);
		}
	},
	buttonRemoveUp: function(){
		this.boundLowerStop();
		this.removeMassStop();
		removeListener(curLevel, 'mouseup', 'mouseUpSandbox');
	},
	boundUpper: function(){
		var listenerName = this.handle + 'BoundUpper'
		if (!curLevel.updateListeners.listeners[listenerName]) {
			addListener(curLevel, 'update', listenerName,
				function(){
					if (this.mass > this.massMax) {
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
											onRemove:onRemove, parentList:this.emitters, onGenerate:onGenerate, cleanUpWith:this.cleanUpWith});
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
		for (var emitterIdx=0; emitterIdx<this.emitters.length; emitterIdx++) {
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
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
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
	if (2*this.speedSpread>this.speed) {
		console.log('Uh-oh.  Making particle emitter with handle ' + this.handle + ' with speed spread such that particles will hit ~0 speed');
	}
	this.accel = defaultTo(.5, attrs.accel);
	this.accelSpread = defaultTo(1, attrs.accelSpread);
	this.dirSpread = defaultTo(0, attrs.dirSpread);
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.makeBounds();
	this.setupStd();
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
		for (var attr in attrs) {
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
		if (this.particles.length==0) {
			this.remove();
		}
	},
	generateNew: function(){
		var numNew = Math.round(Math.random()*this.rate);
		for (var newIdx=0; newIdx<numNew; newIdx++) {
			this.particles.push(this.newParticle());
			if (this.onGenerate) {
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
		removeListener(curLevel, this.cleanUpWith + 'CleanUp', this.cleanUpListenerName);
		this.removed = true;
	},

}
)
/*
//////////////////////////////////////////////////////////////////////////
//ArrowFly
//////////////////////////////////////////////////////////////////////////
Requires
	posInit
	posFinal || ((dir || UV) && dist)
	fillInit
	dimsInit
	lifespan
Optional
	posFinal
	fillFinal
	dimsFinal
	strokeInit
	strokeFinal
	alphaInit
	alphaFinal
	fade //defaults to true
	fadeTurns
	onFinish {func:, obj:}
*/

function ArrowFly(attrs){
	this.type = 'ArrowFly';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.pos = attrs.pos.copy();
	if (attrs.posFinal) {
		this.posFinal = attrs.posFinal;
		this.UV = this.pos.VTo(this.posFinal).UV();
		this.dir = this.UV.angle();
		this.dist = this.pos.distTo(this.posFinal);
	} else if (attrs.V) {
		this.posFinal = this.pos.copy().movePt(attrs.V);
		this.UV = attrs.V.UV();
		this.dir = this.UV.angle();
	} else if ((attrs.dir || attrs.UV) && attrs.dist) {
		if (attrs.dir) {
			this.dir = attrs.dir;
			this.UV = angleToUV(attrs.dir);
		} else {// must be UV
			this.UV = attrs.UV;
			this.dir = this.UV.angle();
			this.UV = attrs.UV;
		}
		this.posFinal = this.pos.copy().movePt(this.UV.copy().mult(attrs.dist));
		this.dist = attrs.dist;
	}
	this.drawCanvas = 			defaultTo(c, attrs.drawCanvas);
	this.dims = 				attrs.dims.copy();
	this.dimsFinal = 			defaultTo(this.dims, attrs.dimsFinal);
	this.fill = 				attrs.fill.copy();
	this.fillUnround = 			{r:this.fill.r, g:this.fill.g, b:this.fill.b};
	this.fillFinal = 			defaultTo(this.fill, attrs.fillFinal);
	this.stroke = 				defaultTo(this.fill, attrs.stroke.copy());
	this.fade = 				defaultTo(true, attrs.fade);
	this.fadeTurns = 			defaultTo(4, attrs.fadeTurns);
	//need to keep precision in unround.  Rounding in color class will lose steps if < .5/turn
	this.strokeUnround = 		{r:this.stroke.r, g:this.stroke.g, b:this.stroke.b};
	this.strokeFinal = 			defaultTo(this.fillFinal, attrs.strokeFinal);
	this.alpha = 				defaultTo(1, attrs.alpha);
	this.alphaFinal = 			defaultTo(this.alpha, attrs.alphaFinal);
	this.age = 					0;
	this.lifespan = 			Math.round(attrs.lifespan/updateInterval);
	this.getSteps();
	this.pts = 					this.getPts();
	/*
	if(this.fade){
		this.lifespan = Math.max(0, this.lifespan-=this.fadeTurns;
	}
	*/
	this.onFinish = attrs.onFinish;
	return this.init();
}
_.extend(ArrowFly.prototype, objectFuncs, toInherit.ArrowFuncs, {
	getSteps: function(){
		var scalar = 1/this.lifespan;
		this.posStep = this.pos.VTo(this.posFinal).mult(scalar);
		
		var ddx = this.dimsFinal.dx - this.dims.dx;
		var ddy = this.dimsFinal.dy - this.dims.dy;
		this.dimsStep = V(ddx, ddy).mult(scalar);
		
		var drFill = this.fillFinal.r - this.fill.r;
		var dgFill = this.fillFinal.g - this.fill.g;
		var dbFill = this.fillFinal.b - this.fill.b;
		this.fillStep = {r:scalar*drFill, g:scalar*dgFill, b:scalar*dbFill};
		
		var drStroke = this.strokeFinal.r - this.stroke.r;
		var dgStroke = this.strokeFinal.g - this.stroke.g;
		var dbStroke = this.strokeFinal.b - this.stroke.b;
		this.strokeStep = {r:scalar*drStroke, g:scalar*dgStroke, b:scalar*dbStroke};
		
		this.alphaStep = (this.alphaFinal - this.alpha)*scalar;
	},

	init: function(){
		this.updateListenerName = unique(this.type + defaultTo('', this.handle), curLevel.updateListeners.listeners);
		addListener(curLevel, 'update', this.updateListenerName, this.run, this);
		this.setupStd();
		return this;
	},
	run: function(){
		this.drawCanvas.save();
		this.drawCanvas.globalAlpha = this.alpha;
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.dir);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas)
		this.drawCanvas.restore();
		this.takeStep();
		this.age++;
		if (this.age == this.lifespan) {
			if (this.onFinish) {
				this.onFinish.func.apply(this.onFinish.obj);
			}
			if (this.fade) {
				this.alphaStep = -this.alpha/this.fadeTurns;
				this.remove();
				this.updateListenerName = unique(this.type + defaultTo('', this.handle) + 'fade', curLevel.updateListeners.listeners);
				addListener(curLevel, 'update', this.updateListenerName, this.runFade, this);
				this.addCleanUp();
			} else {
				this.remove();
			}
		}
	},
	runFade: function() {
		this.drawCanvas.save();
		this.drawCanvas.globalAlpha = this.alpha;
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.dir);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas)
		this.drawCanvas.restore();
		this.takeStepFade();
		this.age++;
		if (this.age == this.lifespan+this.fadeTurns) {
			this.remove();
		}		
	},
	scale: function(){
		var scalarX = (this.dims.dx + this.dimsStep.dx)/this.dims.dx;
		var scalarY = (this.dims.dy + this.dimsStep.dy)/this.dims.dy;
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			this.pts[ptIdx].x*=scalarX;
			this.pts[ptIdx].y*=scalarY;
		}
	},
	takeStep: function(){
		this.pos.movePt(this.posStep);
		this.dims.add(this.dimsStep);
		this.scale() //can't just scale canvas because that scale stroke as well;
		this.alpha += this.alphaStep;
		
		this.fillUnround.r += this.fillStep.r;
		this.fillUnround.g += this.fillStep.g;
		this.fillUnround.b += this.fillStep.b;
		
		this.strokeUnround.r += this.strokeStep.r;
		this.strokeUnround.g += this.strokeStep.g;
		this.strokeUnround.b += this.strokeStep.b;
		
		this.fill.setFromUnround(this.fillUnround);
		this.stroke.setFromUnround(this.strokeUnround);
		
		
		
	},
	takeStepFade: function(){
		this.pos.movePt(this.posStep);
		this.dims.add(this.dimsStep);
		this.scale() //can't just scale canvas because that scale stroke as well;
		this.alpha += this.alphaStep;
	},
	remove: function(){
		removeListener(curLevel, 'update', this.updateListenerName);
		this.removeCleanUp();
	},
}
)

//////////////////////////////////////////////////////////////////////////
//CheckMark
//////////////////////////////////////////////////////////////////////////

function CheckMark(corner, dims, col, stroke, drawCanvas){
	var a = corner;
	var b = dims;
	var p1 = P(a.x			, a.y+b.dy*.6	);
	var p2 = P(a.x+b.dx*.4	, a.y+b.dy		);
	var p3 = P(a.x+b.dx		, a.y			);
	var p4 = P(a.x+b.dx*.35	, a.y+b.dy*.75	);
	var pts = [p1, p2, p3, p4];
	this.pts = pts;
	this.col = col;
	this.stroke = stroke;
	this.drawCanvas = drawCanvas;
}
CheckMark.prototype = {
	draw: function(){
		draw.fillPtsStroke(this.pts, this.col, this.stroke, this.drawCanvas);
	},
}

//////////////////////////////////////////////////////////////////////////
//ArrowLine
//////////////////////////////////////////////////////////////////////////

function ArrowLine(handle, pts, col, lifespan, drawCanvas){
	this.handle = handle;
	var rotate = .5;
	this.pts = {line:pts, arrow: new Array(3)}
	this.col = col;
	this.drawCanvas = defaultTo(c, drawCanvas);
	var ptLast = this.pts.line[this.pts.line.length-1];
	var ptNextLast = this.pts.line[this.pts.line.length-2];
	var dirBack = ptLast.VTo(ptNextLast).UV();
	var dirSide1 = dirBack.copy().rotate(rotate);
	var dirSide2 = dirBack.copy().rotate(-rotate);

	this.pts.arrow[0] = ptLast.copy().movePt(dirSide1.mult(10));
	this.pts.arrow[1] = ptLast;
	this.pts.arrow[2] = ptLast.copy().movePt(dirSide2.mult(10));
	return this.show(lifespan);
}	

ArrowLine.prototype = {
	draw: function(){
		var shaft = this.pts.line;
		for (var ptIdx=0; ptIdx<shaft.length-1; ptIdx++) {
			draw.line(shaft[ptIdx], shaft[ptIdx+1], this.col, this.drawCanvas);
		}
		var arrow = this.pts.arrow;
		
		draw.line(arrow[0], arrow[1], this.col, this.drawCanvas);
		draw.line(arrow[1], arrow[2], this.col, this.drawCanvas);
	},
	show: function(lifespan){//in ms
		var turn = 0;
		addListener(curLevel, 'update', 'drawArrow' + this.handle, this.makeDrawFunc(lifespan), this)
		return this;
	},
	makeDrawFunc: function(lifespan){
		var turn = 0;
		var self = this;
		var drawListener = function(){
			self.draw();
		}
		if(lifespan){
			drawListener = extend(drawListener, function(){
				turn++;
					if(turn==lifespan){
						removeListener(curLevel, 'update', 'drawArrow' + self.handle);
					}
				}
			)
		}
		return drawListener;
	},
	hide: function(){
		removeListener(curLevel, 'update', 'drawArrow' + this.handle);
	}
}



//////////////////////////////////////////////////////////////////////////
//TempChanger
//////////////////////////////////////////////////////////////////////////
function TempChanger(attrs) {
	this.type = 'tempChanger';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.info = attrs.info;
	this.min = defaultTo(100, attrs.min);
	this.val = dataHandler.temp(this.info);
	this.max = defaultTo(1500, attrs.max);
	this.sliderPos = attrs.sliderPos;
	this.handle = attrs.handle;;
	this.totalDots = dataHandler.count(this.info);
	this.setupStd();
	return this.init();
}
_.extend(TempChanger.prototype, objectFuncs, {
	init: function() {
		if (this.totalDots > 1) {
			var title = 'System temperature';
		} else {
			var title = "Molecule's kinetic energy";//temperature";
		}
		this.sliderId = this.addSlider(title, {value:this.valToPercent(this.val)}, [{eventType:'slide', obj:this, func:this.parseSlider}], this.sliderPos);
	},
	parseSlider: function(event, ui) {
		changeTemp(this.info, this.percentToVal(ui.value));
	},
	remove: function(){
		this.removeSlider();
	},
}
)

//////////////////////////////////////////////////////////////////////////
//RMSChanger
//////////////////////////////////////////////////////////////////////////
function RMSChanger(attrs) {
	this.type = 'RMSChanger';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.info = attrs.info;
	this.min = defaultTo(1, attrs.min);
	this.val = dataHandler.RMS(this.info);
	this.max = defaultTo(15, attrs.max);
	this.handle = attrs.handle;
	//this.handle = 'RMSChanger' + Math.round(this.min).toString() + Math.round(this.val).toString() + Math.round(this.max).toString() + Math.round(Math.random()*1000);
	this.totalDots = dataHandler.count(this.info);
	this.sliderPos = attrs.sliderPos;
	this.setupStd();
	return this.init();
}
_.extend(RMSChanger.prototype, objectFuncs, {
	init: function() {
		if (this.totalDots > 1) {
			var title = "Molecules' RMS";
		} else {
			var title = "Molecule's RMS";
		}
		this.sliderId = this.addSlider(title, {value:this.valToPercent(this.val)}, [{eventType:'slide', obj:this, func:this.parseSlider}], this.sliderPos);
	},
	parseSlider: function(event, ui) {
		changeRMS(this.info, this.percentToVal(ui.value));
	},
	remove: function(){
		this.removeSlider();
	},
}
)


