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
	this.wallSpeed = 1;
	this.makeListeners();
	this.readout = new Readout('mainReadout', 30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.prompts=[
		{block:0, title: '', finished: false, text:''},
		{block:1, title: 'Current step', finished: false, text:"Alright, let’s do some work.  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the slider.  If you compress the system, how does the temperature behave?  From the previous equation, how should the slopes of temperature and pressure with respect to volume change?  Do they behave as they should?"},
		{block:1, title: 'Current step', finished: false, text:"Now these molecules undergo perfectly elastic collisions when they hit a wall.  That is to say they behave like a bouncy ball would when you throw it against a wall.  If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving, that is not true."},
		{block:2, title: 'Current step', finished: false, text:"Let’s see if we can relate that idea to work by looking at just one molecule. If you compress the cylinder, why does the molecule’s speed change?  How does this relate to temperature?"},
		{block:3, title: '', finished: false, text:''},
		{block:4, title: 'Current step', finished: false, conditions: this.block4Conditions, text:'So here we have a big weight we can use to bring our system to a pressure of 6 atm.  There are some stops on the piston that let us compress to 10 liters.  We have 1.1 moles of gas with a heat capacity of R J/mol*K (<a href = extras/heatCapacity.html>explanation</a>).  What final temperature should we expect if we compress our piston all the way?  Once you have a value, try the experiment!  Do the calculated and simulated result match?  Do these results back up or refute the idea that works adds energy through collisions with a moving wall?'},
		{block:5, title: 'Current step', finished: false, text:''},
		{block:6, title: 'Current step', finished: false, text:''},
	]
	walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
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
		this.cutSceneStart("<p>Good afternoon!</p>"+
		"HEY - CAPITAL Pressure Today we’re going to try to figure out why work changes a system's temperature.  Let’s start with the equations for relating work to a temperature change:"+
		"<p><center><img src='img/work/eq1.gif' alt='hoverhoverhover'></img></center></p>"+
		"<p>This equation says that work is equal to how hard you compress a container times how much you compress it.  It also says that as you compress that container, the gas inside heats up.  But why does that happen?  What is it about pushing on a container makes its molecules speed up? </p>"+
		"<p> One might say that it’s because energy is being added, and that is true, but we’re going to try to pin down the physical event that makes a molecule speed up as a result of the container compressing.",
		'intro'
		);
		
	},
	block0CleanUp: function(){
		this.cutSceneEnd()
	},
	
	block1Start: function(){
		var self = this;
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		
		populate('spc1', P(45,35), V(460, 350), 800, 300);
		populate('spc3', P(45,35), V(450, 350), 600, 300);
		
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
		
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.pVSv.addSet('p', 'P Int.', Col(50,50,255), Col(200,200,255),
								{data:this.data, x:'v', y:'p'});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
		
		this.piston = new Piston('tootoo', 'container', 2, this);
		this.piston.show();
		this.piston.trackWork();
		this.piston.trackPressure();
		this.borderStd();
		//this.heater = new Heater('spaceHeater', P(150,360), V(250,50), 0, 20, c);//P(40,425), V(470,10)
		//this.heater.init();

	},

	block1CleanUp: function(){
		this.wallV=0;
		$('#sliderPressureHolder').hide();
		this.removeAllGraphs();
		this.readout.removeAllEntries();
		this.readout.hide();
		this.piston.remove();
		this.piston = undefined;
		walls.setWallHandler(0, {func:this.staticAdiabatic, obj:this})
		walls['container'].removeBorder();
	},
	block2Start: function(){
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		walls.setHitMode('container', 'Arrow');
		this.borderStd();
		this.compArrow = this.makeCompArrow('container', {mode:'adiabatic'});
		populate('spc4', P(45,35), V(460, 350), 1, 600);
	},
	block2CleanUp: function(){
		this.wallV=0;
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		walls.setHitMode('container', 'Std');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
	},
	block3Start: function(){
		this.cutSceneStart("<p>So it would seem the molecule speeds up as a result of its collisions with a moving wall!  Could simple elastic collisions with moving walls really explain why compressing or expanding (against non-zero pressure) changes system temperature? I think that’s it, but to make sure, we need to do an experiment. </p><p> First we should note that the only way energy is added to the system in these simulations is through <a href=’ http://en.wikipedia.org/wiki/Elastic_collision ‘ target=’_blank’>elastic collisions</a> with the wall.  There’s no magically speeding up the molecules to match how much work was put in.  If work is expressed in some way other than through elastic collisions with the wall, our experiment will produce the wrong temperature change. </p><p>That being said, I propose the following experiment:<br>From the equation <p><center><img src='img/work/eq2.gif' alt='Don’t click me, it hurts!'></img></center></p><p>If we compress with a fixed pressure over some volume, we can calculate the expected temperature change and compare it to experiment.  If they match, we’ve verified that when you do work on a system, the system’s temperature increases because of elastic collisions with a moving wall (remember the bouncy ball model).</p>");
	},
	block3CleanUp: function(){
		this.cutSceneEnd();
	},
	block4Start: function(){
		$('#reset').show()
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(510,30), P(510,350), P(40,350)]], {func:this.staticAdiabatic, obj:this}, [wallHandle]);
		//walls.setSubWallHandler(0, 0, {func:this.cPAdiabaticDamped, obj:this});
		this.stops = new Stops(10, 'container').init();
		this.borderStd();
		populate('spc1', P(45,35), V(445, 325), 650, 250);
		populate('spc3', P(45,35), V(445, 325), 450, 250);
		this.dragWeights = this.makeDragWeights(wallHandle).init().trackEnergyStop().trackMassStop().trackPressureStart();
		this.trackTempStart();
		this.trackVolumeStart(0);
		this.volListener15 = new StateListener(15, this.data.v, .05, {p:this.data.p, t:this.data.t});
		this.volListener10 = new StateListener(10, this.data.v, .03, {p:this.data.p, t:this.data.t});
	},
	block4CleanUp: function(){
		this.wallV=0;
		$('#reset').hide();
		this.trackTempStop();
		this.trackVolumeStop();
		walls['container'].removeBorder();
		this.stops.remove();
		this.stop = undefined;
		this.dragWeights.remove();
		this.dragWeights = undefined;
	},
	block4Conditions: function(){
		if(this.volListener10.isSatisfied() && this.volListener15.isSatisfied()){
			return {result:true};
		}
		if(!this.volListener10.isSatisfied()){
			return {result:false, alert:'Compress the container!'};
		}
	},
	block5Start: function(){
		var str = '<p>Okay, so your calculations should have looked something like this:<p><center><img src = img/work/eq3.gif></img></p><p><img src=img/work/eq4.gif></img></p></center>You had an initial temperature of INITIAL K and a final temperature of FINAL K.  How’d it do?</p><p>Now let’s apply some of that thinking to figure out why constant pressure and constant volume heat capacities are different.  For this gas, C<sub>v</sub> is R and C<sub>p</sub> is 2R.  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why do they take different amounts of energy?  Any thoughts?</p>';
		str = replaceString(replaceString(str, 'INITIAL', round(this.volListener15.getResults().t,0)), 'FINAL', round(this.volListener10.getResults().t,0));
		this.cutSceneStart(str);
	},
	block5CleanUp: function(){
		this.cutSceneEnd();
	},
	block6Start: function(){
		$('#sliderHeaterHolder').show();
		walls = WallHandler([[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], {func:this.staticAdiabatic, obj:this}, ['left', 'right']);
		//this.piston = new Piston('pistony', 'right', 5, function(){return this.g}, this);
		populate('spc1', P(40,30), V(200,300), 600, 300);
		populate('spc1', P(285,30), V(200,300), 600, 300);
	},
	makeDragWeights: function(wallHandle){
		var self = this;
		var massInit = 25;
		var dragWeights = new DragWeights([{name:'lrg', count:1, mass:75}
									],
									walls[0][2].y,
									function(){return walls[0][0].y},
									myCanvas.height-15,
									20,
									Col(218, 187, 41),
									Col(150, 150, 150),
									massInit,
									this.readout,
									wallHandle,
									{func:this.cPAdiabaticDamped, obj:this},
									this
									);

		return dragWeights;		
	},

	dataRun: function(){
		var wall = walls[0];
		var SA = getLen([wall[0], wall[1], wall[2], wall[3], wall[4]]);//HEY - FOR TESTING PURPOSES ONLY.  DOES NOT WORK WITH MOVING WALL AS WE DO NOT ADD FORCE INTERNAL THERE  //What?
		this.data.p.push(dataHandler.pressureInt(this.forceInternal, this.numUpdates, SA))
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volume());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		this.numUpdates=0;
		this.forceInternal=0;
	},
	changePressure: function(event, ui){
		this.piston.setP(ui.value);
	},
	heatLeft: function(event, ui){
		this.heaterLeft.setTemp(ui.value);
	},
	heatRight: function(event, ui){
		this.heaterRight.setTemp(ui.value)
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