function Work(){
	dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.eUnits = 'kJ';
	this.bgCol = Col(5, 17, 26);
	this.wallCol = Col(255,255,255);
	this.numUpdates = 0;
	this.forceInternal = 0;
	this.wallV = 0;

	this.makeListeners();
	this.readout = new Readout('mainReadout', 30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.g = 1.75;
	this.prompts=[
		{block:0, title: "", finished: false, text:""},
		{block:1, title: "Current step", finished: false, text:"Alright, let’s fit a model to what we just described.  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the pressure slider. Now these molecules undergo perfectly elastic collisions when they hit a wall.  That is to say they behave like a bouncy ball would when you throw it against the wall.  If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving, that is not true.  If you compress the cylinder, the gas will heat up.  Can you relate the change in gas speed and temperature to the bouncy ball model?"},
		{block:2, title: "Current step", finished: false, text:""},

	]
	walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
	walls.setup();
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.minY = 30;
	this.maxY = 350;
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	collide.setDefaultHandler({func:collide.impactStd, obj:collide})
}
_.extend(Work.prototype, 
			LevelTools.prototype, 
			WallCollideMethods.prototype, 
{
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},

	block0Start: function(){
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.hideDash();
		this.hideBase();
		$('#canvasDiv').hide();
		$('#graphs').hide();
		$('#display').show();
		$('#dashIntro').show();
		$('#intText').show().html("<p>Good afternoon!</p>"+
		"Today we're going to try to figure out why work does work.  Let's start with the equations that relate work to a temperature change:"+
		//equations
		"<p>This equation says that work is equal to how hard you push on a container times how much you compress it.  It also says that as you compress that container, the gas inside heats up.  But why does that happen?  What is it about pushing on a container makes its molecules speed up?</p>"+
		"<p> One might say that it’s because energy is being added, and that is true, but we’re going to try to pin down the physical event that makes a molecule speed up as a result of the container compressing."
		);
		
	},
	block0CleanUp: function(){
		this.hideDash();
		$('#graphs').show()
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
		$('#dashRun').show();
		$('#base').show();
		loadListener(this, 'update');
		loadListener(this, 'data');		
	},
	
	block1Start: function(){
		console.log('here');
		var self = this;
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		walls.setup();
		walls.setSubWallHandler('container', 0, {func:this.cPAdiabaticDamped, obj:this});		
		populate('spc1', P(45,35), V(460, 350), 800, 300);
		populate('spc3', P(45,35), V(450, 350), 600, 300);
		//populate('spc3', P(45,35), V(450, 350), 1, 300);
		
		//this.readout.addEntry('temp', 'Temperature:', 'K', dataHandler.temp(), 0, 0);
		//this.readout.show();
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
		/*
		addListener(curLevel, 'data', 'measureTemp', function(){
			var temps = this.data.t;
			var tempLast = temps[temps.length-1];
			this.readout.tick(tempLast, 'temp');
		},
		this);
		*/
		addListener(curLevel, 'update', 'moveWalls', this.moveWalls, this);
		addListener(curLevel, 'update', 'addGravity', this.addGravity, this);
		

		this.piston = new Piston('tootoo', 500, function(){return walls.pts[0][0].y}, 40, 470, c, 2, function(){return self.g}, this);
		this.piston.show();
		//this.piston.trackWork();
		//this.piston.trackPressure();
		var ptsToBorder = this.getPtsToBorder();
		border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container', c);
		//this.heater = new Heater('spaceHeater', P(150,360), V(250,50), 0, 20, c);//P(40,425), V(470,10)
		//this.heater.init();

	},

	block1CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
		removeListener(curLevel, 'update', 'moveWalls');
		removeListener(curLevel, 'update', 'addGravity');
		walls.setWallHandler(0, {func:this.onWallImpactSides, obj:this})
	},
	block2Start: function(){
		populate('spc1', P(45,35), V(460, 350), 1, 300);
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
//HOLD ON - YOU HAVE TWO.  FIGGER IT OUT.
	getPtsToBorder: function(){
		var pts = [];
		var wallPts = walls.pts[0];
		pts.push(wallPts[1].copy().position({y:this.minY}))
		pts.push(wallPts[2].copy());
		pts.push(wallPts[3].copy());
		pts.push(wallPts[4].copy().position({y:this.minY}));
		return pts;
	},

	dataRun: function(){
		var wall = walls.pts[0];
		var SA = getLen([wall[0], wall[1], wall[2], wall[3], wall[4]]);//HEY - FOR TESTING PURPOSES ONLY.  DOES NOT WORK WITH MOVING WALL AS WE DO NOT ADD FORCE INTERNAL THERE
		this.data.p.push(dataHandler.pressureInt(this.forceInternal, this.numUpdates, SA))
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volOneWall());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		this.numUpdates=0;
		this.forceInternal=0;
	},
	vol: function(){
		return walls.area(0) - walls.area(1);
	},

	changePressure: function(event, ui){
		this.piston.setP(ui.value);
	},
	changeTemp: function(event, ui){
		this.heater.setTemp(ui.value);
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


}
)