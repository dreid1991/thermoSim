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
	this.readout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.prompts=[
		{block:0, title: '', finished: false, text:''},
		{block:1, title: 'Current step', finished: false, text:"Alright, let’s do some work.  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the slider.  If you compress the system, how does the temperature behave?  From the previous equation, how should the slopes of temperature and pressure with respect to volume change?  Do they behave as they should?"},
		{block:1, title: 'Current step', finished: false, text:"Now these molecules undergo perfectly elastic collisions when they hit a wall.  That is to say they behave like a bouncy ball would when you throw it against a wall.  If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving, that is not true."},
		{block:2, title: 'Current step', finished: false, text:"Let’s see if we can relate that idea to work by looking at just one molecule.  If you compress the cylinder, why does the molecule’s speed change?  How does this relate to temperature and work?"},
		{block:3, title: '', finished: false, text:''},
		{block:4, title: 'Current step', finished: false, conditions: this.block4Conditions, text:"So here we have a big weight we can use to bring our system to a pressure of 6 atm.  There are some stops on the piston that let us compress to 10 liters.  We have 1.1 moles of gas with a heat capacity of R J/mol*K (<a href = extras/heatCapacity.html target='_blank'>explanation</a>).  What final temperature should we expect if we compress our piston all the way?  Once you have a value, try the experiment!  Do the calculated and simulated result match?  Do these results back up or refute the idea that works adds energy through collisions with a moving wall?"},
		{block:5, title: 'Current step', finished: false, text:''},
		{block:6, title: 'Current step', finished: false, text:'Alright, here’s our adiabatic system.  If you compress the system, does the slope of temperature with respect to volume match what the previous equation says it should be(Note C<sub>v</sub> is R and C<sub>p</sub> is 2R)?  How can you relate this slope to the number of collisions that happen with the wall as the volume decreases?'},
		{block:7, title: '', finished: false, text:''},
		{block:8, title: '', finished: false, text:''},
		{block:9, title: '', finished: false, text:'Well, let’s figure it out.  Here we have two containers.  Both contain 1 mole of gas at 300 K.  One is held at constant volume, the other at constant pressure.  You can heat or cool them with their corresponding sliders.  If you heat both containers to some new temperature, how do the energies used compare?  The piston tracks the work it does on the system.  Remember that it takes energy to speed up molecules and to expand against a pressure. '},
		{block:10, title: '', finished: false, text:''},
	]
	walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	collide.setDefaultHandler({func:collide.impactStd, obj:collide})
}
_.extend(Work.prototype, 
			LevelTools, 
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
		"Today we’re going to try to figure out why work changes a system's temperature.  Let’s start with the equations for relating work to a temperature change:"+
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
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(45,35), V(460, 350), 800, 300);
		spcs['spc3'].populate(P(45,35), V(450, 350), 600, 300);
		
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
		
		
		this.piston = new Piston('tootoo', 'container', 2, this).show().trackWork().trackPressure();
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
		walls.setWallHandler(0, 'staticAdiabatic')
		walls['container'].removeBorder();
	},
	block2Start: function(){
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		walls.setHitMode('container', 'Arrow');
		this.borderStd();
		this.compArrow = this.makeCompArrow('container', {mode:'adiabatic'});
		spcs['spc4'].populate(P(45,35), V(460, 350), 1, 600);
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
		this.cutSceneStart("<p>So it would seem the molecule speeds up as a result of its collisions with a moving wall!  Could simple elastic collisions with moving walls really explain why compressing or expanding (against non-zero pressure) changes system temperature? I think that’s it, but to make sure, we need to do an experiment. </p><p> First we should note that the only way energy is added to the system in these simulations is through <a href=’ http://en.wikipedia.org/wiki/Elastic_collision  target='_blank'>elastic collisions</a> with the wall.  There’s no magically speeding up the molecules to match how much work was put in.  If work is expressed in some way other than through elastic collisions with the wall, our experiment will produce the wrong temperature change. </p><p>That being said, I propose the following experiment:<br>From the equation <p><center><img src='img/work/eq2.gif' alt='Don’t click me, it hurts!'></img></center></p><p>If we compress with a fixed pressure over some volume, we can calculate the expected temperature change and compare it to experiment.  If they match, we’ve verified that when you do work on a system, the system’s temperature increases because of elastic collisions with a moving wall (remember the bouncy ball model).</p>");
	},
	block3CleanUp: function(){
		this.cutSceneEnd();
	},
	block4Start: function(){
		$('#reset').show()
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(510,30), P(510,350), P(40,350)]], 'staticAdiabatic', [wallHandle]);
		//walls.setSubWallHandler(0, 0, {func:this.cPAdiabaticDamped, obj:this});
		this.stops = new Stops(10, 'container').init();
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 325), 650, 250);
		spcs['spc3'].populate(P(45,35), V(445, 325), 450, 250);
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
		var str = 'Okay, so your calculations should have looked something like this:<p><center><img src = img/work/eq3.gif></img></p><p><img src=img/work/eq4.gif></img></p></center>You had an initial temperature of INITIAL K and a final temperature of FINAL K.  Do the calculated and simulated result match?  Does this back up or refute the idea that works adds energy through collisions with a moving wall?</p><p>Now let’s go on a brief tangent.  When you compress, temperature increases, right?  If you start from the equation</p><p><center><img src=img/work/eq5.gif></img></center></p> which describes adiabatic compressions, and solve for temperature , how should temperature increase as volume decreases?  If you get stuck solving, remember that you can use the ideal gas law to replace variables.  Once you’ve solved for temperature, consider:  Can you justify what slope given that energy is added when molecules collide with the moving wall?  Let’s try to do that on the next page.';
		str = replaceString(replaceString(str, 'INITIAL', round(this.volListener15.getResults().t,0)), 'FINAL', round(this.volListener10.getResults().t,0));
		this.cutSceneStart(str);
	},
	block5CleanUp: function(){
		this.cutSceneEnd();
	},
	block6Start: function(){
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(510,30), P(510,400), P(40,400)]], 'staticAdiabatic', [wallHandle]);
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 375), 650, 250);
		spcs['spc3'].populate(P(45,35), V(445, 375), 450, 250);		
		this.compArrow = this.makeCompArrow('container', {mode:'adiabatic'});
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.pVSv.addSet('p', 'P Int.', Col(50,50,255), Col(200,200,255),
								{data:this.data, x:'v', y:'p'});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
	},
	block6CleanUp: function(){
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		this.removeAllGraphs();
		
	},
	block7Start: function(){
		this.cutSceneStart('<p>So it would seem that as your volume decreases, the number of collisions that happen over a given compression increases, meaning that the energy added when compressing at a small volume is greater than the energy added when compressing at a large volume.  This translates to a larger temperature increase.  I know this doesn’t perfectly justify why volume should be raised to the C<sub>p</sub>/C<sub>v</sub> power, but hopefully it gives you a mental model that you can work with to understand how systems behave when they’re compressed.</p>');
	},
	block7CleanUp: function(){
		this.cutSceneEnd();
	},
	block8Start: function(){
		this.cutSceneStart('<p>Now let’s apply some of this thinking to figure out why constant pressure and constant volume heat capacities are different.  For the gas in these simulations, C<sub>v</sub> is R and C<sub>p</sub> is 2R.  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why do they take different amounts of energy?  Any thoughts?</p>');
	},
	block8CleanUp: function(){
		this.cutSceneEnd();
	},
	block9Start: function(){
		$('#sliderHeaterHolder').show();
		walls = WallHandler([[P(40,30), P(255,30), P(255,440), P(40,440)], [P(295,250), P(510,250), P(510,440), P(295,440)]], 'staticAdiabatic', ['left', 'right']);
		//this.piston = new Piston('pistony', 'right', 5, function(){return this.g}, this);
		spcs['spc1'].populate(P(40,30), V(200,350), 400, 300, 'left', 'left');
		spcs['spc3'].populate(P(40,30), V(200,350), 400, 300, 'left', 'left');
		spcs['spc1'].populate(P(295,250), V(200,140), 400, 300, 'right', 'right');
		spcs['spc3'].populate(P(295,250), V(200,140), 400, 300, 'right', 'right');
		this.heaterLeft = new Heater('left', P(67,400), V(160, 25), 0, 20, c).init();
		this.heaterRight = new Heater('right', P(322,400), V(160, 25), 0, 20, c).init()
		this.piston = new Piston('tootoo', 'right', 5, this).show().trackWork();
		this.readout.show();
		this.readout.addEntry('tLeft', 'Temp:', 'K', dataHandler.temp('left'), undefined, 0);
		this.readout.addEntry('eLeft', 'E added:', 'kJ', this.heaterLeft.eAdded, undefined, 1);
		this.readout.addEntry('tRight', 'Temp:', 'K', dataHandler.temp('right'), undefined, 0);
		this.readout.addEntry('eRight', 'E added:', 'kJ', this.heaterRight.eAdded, undefined, 1);
		addListener(curLevel, 'data', 'updateT',
			function(){
				this.readout.tick(dataHandler.temp({tag:'left'}), 'tLeft');
				this.readout.tick(dataHandler.temp({tag:'right'}), 'tRight');
				this.readout.tick(this.heaterLeft.eAdded, 'eLeft');
				this.readout.tick(this.heaterRight.eAdded, 'eRight');
			},
		this);
	},
	block9CleanUp: function(){
		$('#sliderHeaterHolder').hide();
		this.readout.removeAllEntries();
		this.readout.hide();
		this.piston.remove();
		this.heaterLeft.remove();
		this.heaterRight.remove();
		this.piston = undefined;
		this.heaterLeft = undefined;
		this.heaterRight = undefined;
	},
	block10Start: function(){
		this.cutSceneStart('<p>So, what happened?  Why did the constant pressure system take more energy to heat up?  Because it was doing work on its surroundings to maintain that constant pressure?  Why yes, that’s it!  Well done.  Shall we formalize?</p><p> To heat up the C<sub>v</sub> container, you just had to put energy into the molecules to make them move more quickly.  But there’s more going on in the C<sub>p</sub> container.  To maintain constant pressure, it had to expand, doing work on its surroundings.  This means that the energy we added to the C<sub>p</sub> went to two places:  to the molecules to make them move more quickly, and to the wall, to push it outwards.  Having the energy go into expanding the container means that you have to put more energy to achieve a given molecular kinetic energy, or temperature, increase.  Let’s express that in math:');
		
		
	},
	/*
	blockNStart: function(){
		$('#sliderHeaterHolder').show();
		walls = WallHandler([[P(40,30), P(255,30), P(255,440), P(40,440)], [P(295,30), P(510,30), P(510,440), P(295,440)]], 'staticAdiabatic', ['left', 'right']);
		//this.piston = new Piston('pistony', 'right', 5, function(){return this.g}, this);
		spcs['spc1'].populate(P(40,30), V(200,350), 600, 300, 'left');
		spcs['spc1'].populate(P(285,30), V(200,350), 600, 300, 'right');
		this.heaterLeft = new Heater('left', P(60,370), V(160, 50), 0, 20, c).init();
		this.heaterRight = new Heater('right', P(315,370), V(160, 50), 0, 20, c).init();
	},
	*/
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
									'cPAdiabaticDamped',
									this
									);

		return dragWeights;		
	},

	dataRun: function(){
		var wall = walls[0];
		this.data.p.push(wall.pInt())
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