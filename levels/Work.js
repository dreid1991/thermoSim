function Work(){
	dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.e = [];
	this.eUnits = 'kJ';
	this.bgCol = Col(5, 17, 26);
	this.wallCol = Col(255,255,255);
	this.numUpdates = 0;
	this.forceInternal = 0;
	this.wallV = 0;
	this.wallSpeed = 1;
	this.updateListeners = {listeners:{}, save:{}};
	this.dataListeners = {listeners:{}, save:{}};
	this.wallImpactListeners = {listeners:{}, save:{}};
	this.dotImpactListeners = {listeners:{}, save:{}};
	this.mousedownListeners = {listeners:{}, save:{}};
	this.mouseupListeners = {listeners:{}, save:{}};
	this.mousemoveListeners = {listeners:{}, save:{}};
	this.resetListeners = {listeners:{}, save:{}};
	this.initListeners = {listeners:{}, save:{}};
	this.readout = new Readout(30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this);
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.g = 1.75;
	this.prompts=[
		{block:0, title: "testyMcKaw", finished: false, text:""},

	]
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.minY = 30;
	this.maxY = 350;
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	addListener(this, 'wallImpact', 'std', this.onWallImpact, this);
	addListener(this, 'dotImpact', 'std', collide.impactStd, collide);

}

Work.prototype = {
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},
	block0Start: function(){
		var self = this;
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		this.myFancyPiston = new Piston('tootoo', 500, 300, 40, 470, c, 2, function(){return self.g});
		this.myFancyPiston.show();
		var ptsToBorder = this.getPtsToBorder();
		border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container', c);
		populate('spc1', P(45,35), V(450, 350), 400, 300);
		populate('spc3', P(45,35), V(450, 350), 400, 300);
	},

	block0CleanUp: function(){

	},


	getPtsToBorder: function(){
		var pts = [];
		var wallPts = walls.pts[0];
		pts.push(wallPts[1].copy())
		pts.push(wallPts[2].copy());
		pts.push(wallPts[3].copy());
		pts.push(wallPts[4].copy());
		return pts;
	},
	makeDragArrow: function(bounds){
		var pos = walls.pts[0][1].copy()
		var rotation = 0;
		var cols = {};
		cols.outer = Col(247, 240,9);
		cols.onClick = Col(247, 240,9);
		cols.inner = this.bgCol;
		var dims = V(25, 15);
		var name = 'volDragger';
		var drawCanvas = c;
		var canvasElement = canvas;
		var listeners = {};
		listeners.onDown = function(){};
		listeners.onMove = function(){curLevel.changeWallSetPt(this.pos.y)};
		listeners.onUp = function(){};
		
		if(!bounds){
			bounds = {y:{min:this.minY, max:this.maxY}};
		}
		return new DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds);
	},
	getPtsToBorder: function(){
		var pts = [];
		var wallPts = walls.pts[0];
		pts.push(wallPts[1].copy().position({y:this.minY}))
		pts.push(wallPts[2].copy());
		pts.push(wallPts[3].copy());
		pts.push(wallPts[4].copy().position({y:this.minY}));
		return pts;
	},
	changeWallSetPt: function(dest){
		var wall = walls.pts[0]
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var getY = function(){
			return walls.pts[0][0].y;
		}
		
		var dist = dest-getY();
		if(dist!=0){
			var sign = 1;
			sign = Math.abs(dist)/dist;		
			this.wallV = this.wallSpeed*sign;
			removeListener(curLevel, 'wallImpact', 'std');
			addListener(curLevel, 'wallImpact', this.compMode, this['onWallImpact' + this.compMode], this);
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, this.wallV))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
						removeListener(curLevel, 'wallImpact', this.compMode)
						addListener(curLevel, 'wallImpact', 'std', this.onWallImpact, this);
						this.wallV = 0;
					}
				},
			this);
		}
	},
	update: function(){
		this.numUpdates++;
		for (var updateListener in this.updateListeners.listeners){
			var listener = this.updateListeners.listeners[updateListener]
			listener.func.apply(listener.obj);
		}
	},
	addData: function(){
		for (var dataListener in this.dataListeners.listeners){
			var listener = this.dataListeners.listeners[dataListener];
			listener.func.apply(listener.obj);
		}
		this.numUpdates = 0;
		this.forceInternal = 0;
	},
	updateRun: function(){
		move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
	},
	checkDotHits: function(){
		collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},
	onWallImpact: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}
	},
	onWallImpactIsothermal: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		var perpUV = walls.wallPerpUVs[line[0]][line[1]]
		dot.y-=2*perpUV.dy;
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}	
	},
	onWallImpactAdiabatic: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		if(line[0]==0 && line[1]==0){
			dot.v.dy = -vo + 2*this.wallV;
			this.forceInternal += dot.m*(perpV + dot.v.dy);
		}else{
			walls.impactStd(dot, wallUV, perpV);
			this.forceInternal += 2*dot.m*Math.abs(perpV);
		}
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}	
	},
	onWallImpactArrow: function(dot, line, wallUV, perpV){
		var hitResult = this.onWallImpact(dot, line, wallUV, perpV);
		var arrowPts = new Array(3);
		arrowPts[0] = hitResult.pos.copy().movePt(hitResult.vo.copy().mult(10).neg());
		arrowPts[1] = hitResult.pos;
		arrowPts[2] = hitResult.pos.copy().movePt(hitResult.vf.copy().mult(10));
		var lifeSpan = 50;
		var arrowTurn = 0;
		var arrow = new Arrow(arrowPts, Col(255,0,0),c);
		addListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y,
			function(){
				arrow.draw();
				arrowTurn++;
				if(arrowTurn==lifeSpan){
					removeListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y);
				}
			},
		this);
		var textPos = hitResult.pos.copy().movePt(hitResult.vf.mult(15));
		var delV = 2*perpV*pxToMS;
		animText({pos:textPos, col:Col(255,255,255), rotation:0, size:13}, 
				{pos:textPos.copy().movePt({dy:-20}), col:this.bgCol},
				'calibri', 'deltaV = '+round(delV,1)+'m/s', 'center', 3000, c);
	},
	dataRun: function(){

		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volOneWall());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	changeTempSlider: function(event, ui){
		this.playedWithSlider = true;
		var temp = ui.value;
		changeAllTemp(temp);
		var dot = spcs.spc4.dots[0];
		this.readout.hardUpdate(temp, 'temp');
		this.readout.hardUpdate(dot.speed(), 'speed');
	},
	changePressureSlider: function(event, ui){
		this.playedWithSlider = true;
		var temp = ui.value;
		changeAllTemp(temp);
	},
	changeTempSpc3: function(event, ui){
		var rms = ui.value;
		changeRMS('spc3', rms);
		this.readout.hardUpdate(rms, 'rmsLeft');
	},
	changeTempSpc5: function(event, ui){
		var rms = ui.value;
		changeRMS('spc5', rms);	
		this.readout.hardUpdate(rms, 'rmsRight');		
	},

	reset: function(){
		var curPrompt = this.prompts[this.promptIdx];
		if(this['block'+this.blockIdx+'CleanUp']){
			this['block'+this.blockIdx+'CleanUp']()
		}
		if(curPrompt.cleanUp){
			curPrompt.cleanUp();
		}	
		for (var spcName in spcs){
			depopulate(spcName);
		}
		this.numUpdates = 0;

		this.forceInternal = 0;
		this.wallV = 0;

		for (resetListenerName in this.resetListeners.listeners){
			var func = this.resetListeners.listeners[resetListenerName].func;
			var obj = this.resetListeners.listeners[resetListenerName].obj;
			func.apply(obj);
		}

		if(this['block'+this.blockIdx+'Start']){
			this['block'+this.blockIdx+'Start']()
		}
		
		if(curPrompt.start){
			curPrompt.start();
		}	
		
	},
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
	},
	hideBase: function(){
		$('#base').hide();
	},

}
