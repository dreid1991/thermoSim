function Orientation(){
	this.dataHandler = new DataHandler();
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
	this.readout = new Readout(30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255),this);
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.prompts=[
		{block:0, title: "one fish", text:"Alright, let’s figure out what temperature looks like.  Above, we have one molecule, and I submit to you that this molecule has a temperature.  The equation for a molecule’s temperature is as follows: 1.5kT = .5mv<sup>2</sup>, where k in the boltzmann constant, T is temperature, m in the molecule’s mass, and v is its velocity.  The slider above changes that molecule’s temperature.  If you double the molecule’s temperature, how will its speed increase?  Try drawing a graph of a hydrogen atom’s velocity with respect to its temperature.  "},
		{block:1, title: "two fish", text:"1"},
		{block:1,  title: "red fish", text:"2"},
	]
	addSpecies(['spc1', 'spc3', 'spc4']);
	collide.setup();
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	addListener(this, 'wallImpact', 'std', this.onWallImpact, this);
	addListener(this, 'dotImpact', 'std', collide.impactStd, collide);

}

Orientation.prototype = {
	init: function(){
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		var self = this;
		$('#myCanvas').show();
	},
	startIntro: function(){
		//var ptsToBorder = this.getPtsToBorder();
		//border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container',c);
		saveListener(this, 'update');
		saveListener(this, 'data');
		saveListener(this, 'wallImpact');
		saveListener(this, 'dotImpact');
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#graphs').hide()
		$('#display').show();
		$('#textIntro').show();
		$('#dashIntro').show();
	},
	block0Start: function(){
		$('#sliderTemp').show();
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		populate('spc4', P(45,35), V(450, 350), 1, 300);
		var dot = spcs.spc4.dots[0]
		this.readout.addEntry('temp', "Molecule's temperature:", 'K', this.dataHandler.temp(), 0, 0);
		this.readout.addEntry('speed', "speed:", 'm/s', dot.speed(),0,0);
	},
	block0CleanUp: function(){
		this.readout.removeEntry('speed');
		this.readout.removeEntry('temp');
		$('#sliderTemp').hide();
	},
	block1Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		populate('spc4', P(45,35), V(450, 350), 400, 200);
	},
	block2Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]]);
		walls.setup();
		populate('spc4', P(45, 80), V(200, 300), 200, 600);
		populate('spc4', P(305,75), V(200, 300), 200, 100);
		
	},

	startSim: function(){
		this.hideDash();
		this.hideText();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();
		loadListener(this, 'update');
		loadListener(this, 'data');		
		loadListener(this, 'wallImpact');
		loadListener(this, 'dotImpact');
	},
	startOutro: function(){
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, 'update');
		emptyListener(this, 'data');
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#display').show();
		$('#textOutro').show();	
		$('#dashOutro').show();

	},
	toSim: function(){
		nextPrompt();
	},
	backToSim: function(){
		this.promptIdx = this.prompts.length-1;
		this.hideDash();
		this.hideText();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();	
		loadListener(this, 'update');
		loadListener(this, 'data');
	},
	makeDragArrow: function(){
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
		bounds = {y:{min:this.minY, max:this.maxY}};
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
		
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, this.wallV))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
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
		if(line[0]==0 && line[1]==0){
			
			var pt = walls.pts[line[0]][line[1]]; 
			dot.v.dy = -dot.v.dy + 2*this.wallV;
			dot.y = pt.y+dot.r;	
			
		}else{
			walls.impactStd(dot, wallUV, perpV);
			this.forceInternal += 2*dot.m*Math.abs(perpV);
		}
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}
	},
	onWallImpactArrow: function(dot, line, wallUV, perpV){
		var hitResult = this.onWallImpact(dot, line, wallUV, perpV);
		var arrowPts = new Array(3);
		arrowPts[0] = hitResult.pos.copy().movePt(hitResult.vo.mult(10).neg());
		arrowPts[1] = hitResult.pos;
		arrowPts[2] = hitResult.pos.copy().movePt(hitResult.vf.mult(10));
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
		'');
	},
	dataRun: function(){
		var SAPInt = getLen([walls.pts[0][1], walls.pts[0][2], walls.pts[0][3], walls.pts[0][4]])
		this.data.pInt.push(this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		this.forceInternal = 0;
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	changeTempSlider: function(event, ui){
		var temp = ui.value;
		var dot = spcs.spc4.dots[0];
		for(var spc in spcs){
			var dots = spcs[spc].dots;
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				var dot = dots[dotIdx];
				changeDotTemp(dot, temp);
			}
		}
		this.readout.hardUpdate(temp, 'temp');
		this.readout.hardUpdate(dot.speed(), 'speed');
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
		emptyListener(this, 'update');
		emptyListener(this, 'wallImpact');
		emptyListener(this, 'dotImpact');
		emptyListener(this, 'data');
		
		this.startSim();
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
	hideText: function(){
		$('#textIntro').hide();
		$('#textOutro').hide();
	},
	hideBase: function(){
		$('#base').hide();
	},

}
