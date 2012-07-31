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
		{block:1, title: 'Current step', finished: false, conditions: this.block1Conditions, text:"Alright, let’s do some work.  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the slider.  If you compress the system, how does the temperature behave?  Does the change seem consistent with the previous equation?"},
		{block:1, title: 'Current step', finished: false, text:"Now these molecules undergo perfectly elastic collisions when they hit a wall.  That is to say they behave like a bouncy ball would when you throw it against a wall.  If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving, that is not true."},
		{block:2, title: 'Current step', finished: false, conditions: this.block2Conditions, text:"Let’s see if we can relate that idea to work by looking at just one molecule.  If you compress the cylinder, why does the molecule’s speed change?  How does this relate to temperature change and work?"},
		{block:3, title: '', finished: false, text:''},
		{block:4, title: 'Current step', finished: false, conditions: this.block4Conditions, text:"So here we have a big weight we can use to bring our system to a pressure of 6 atm.  There are some stops on the piston that let us compress to 10 liters.  We have 1.5 moles of gas with a heat capacity of R J/mol*K (<a href = extras/heatCapacity.html target='_blank'>explanation</a>).  What final temperature should we expect if we compress our piston all the way?  Once you have a value, try the experiment!  "},
		{block:5, title: 'Current step', finished: false, text:''},
		{block:6, title: 'Current step', finished: false, text:''},
		{block:7, title: 'Current step', finished: false, conditions: this.block7Conditions, text:'Alright, here’s our adiabatic system.  If you compress the system, does the slope of temperature with respect to volume look like what the previous equation says it should be?  How can you relate this slope to the number of collisions that happen with the wall as the volume decreases?'},
		{block:8, title: '', finished: false, text:''},
		{block:9, title: '', finished: false, text:''},
		{block:10, title: '', finished: false, conditions: this.block10Conditions, text:'Well, let’s figure it out.  Here we have two containers.  Both contain 1 mole of gas at 300 K.  One is held at constant volume, the other at constant pressure.  You can heat or cool them with their corresponding sliders.  If you heat both containers to some new temperature, how do the energies used compare?  The piston tracks the work it does on the system.  Remember that it takes energy to speed up molecules <i>and</i> to expand against a pressure.'},
		{block:11, title: '', finished: false, text:''},
		{block:12, title: '', finished: false, text:''},
		{block:13, title: '', finished: false, text:''},
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
		"Today we’re going to try to figure out why work changes a system’s temperature.  Let’s start with the equation for relating work to a temperature change:"+
		"<p><center><img src='img/work/eq1.gif' alt='hoverhoverhover'></img></center></p>"+
		"<p>This equation says that work is equal to how hard you compress a container times how much you compress it.  It also says that as you compress that container, the gas inside heats up.  But why does that happen?  What is it about pushing on a container that makes its molecules speed up?</p>"+
		"<p> One might say that it’s because energy is being added, and that is true, but we’re going to try to pin down the physical event that makes molecules speed up as a result of the container compressing.",
		'intro'
		);
		
	},
	block0CleanUp: function(){
		this.cutSceneEnd()
	},
	
	block1Start: function(){
		this.playedWithSlider = false;
		var self = this;
		var sliderMin = $('#sliderPressure').slider('option', 'min');
		$('#sliderPressure').slider('option', {value:sliderMin});
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
	block1Conditions: function(){
		if(this.playedWithSlider){
			return {result:true};
		}
		return {result:false, alert:'Play with the slider, I insist.'};
	},
	block1CleanUp: function(){
		this.playedWithSlider = undefined;
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
		spcs['spc4'].populate(P(45,35), V(460, 100), 1, 600);
		this.tempChanged = false;
		var initTemp = dataHandler.temp();
		addListener(curLevel, 'data', 'checkTempChanged',
			function(){
				var curTemp = dataHandler.temp();
				if(curTemp!=initTemp){
					this.tempChanged = true;
					removeListener(curLevel, 'data', 'checkTempChanged');
				}
			},
		this);
	},
	block2Conditions: function(){
		if(this.tempChanged){
			return {result:true};
		}
		return {result:false, alert:"Try hitting the molecule with the wall while the wall's moving"};	
	},
	block2CleanUp: function(){
		this.tempChanged = undefined;
		this.wallV=0;
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		walls.setHitMode('container', 'Std');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
	},
	block3Start: function(){
		this.cutSceneStart("<p>So it would seem the molecule speeds up as a result of its collisions with a moving wall!  Could simple elastic collisions with moving walls really explain why compressing or expanding (against non-zero pressure) changes system temperature? I think that’s it, but to make sure, we need to do an experiment. </p><p> First we should note that the only way energy is added to the system in these simulations is through <a href=http://en.wikipedia.org/wiki/Elastic_collision  target='_blank'>elastic collisions</a> with the wall.  There’s no magically speeding up the molecules to match how much work was put in.  If work is expressed in some way other than through elastic collisions with the wall, our experiment will produce the wrong temperature change. </p><p>That being said, I propose the following experiment:<br>From the equation <p><center><img src='img/work/eq2.gif' alt='Don't click me, it hurts!'></img></center></p><p>If we compress with a fixed pressure over some volume, we can calculate the expected temperature change and compare it to experiment.  If they match, we can probably say that when you do work on a system, the system’s temperature increases because of elastic (or shall we say bouncy) collisions with a moving wall.</p>");
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
		spcs['spc1'].populate(P(45,35), V(445, 325), 850, 198);
		spcs['spc3'].populate(P(45,35), V(445, 325), 650, 198);
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
		var str = "<p>Okay, so your calculations should have looked something like this:<p><center><img src = img/work/eq3.gif></img></p><img src=img/work/eq4.gif></img></center></p>You had an initial temperature of INITIAL K and a final temperature of FINAL K.  Are the two results close to each other?  What does this say about our idea that work adds energy through molecules’ collisions with a moving wall?</p>";
		var results15 = this.volListener15.getResults();
		var results10 = this.volListener10.getResults();
		if(results15 && results10 && !isNaN(results15.t) && !isNaN(results10.t)){
			str = replaceString(replaceString(str, 'INITIAL', round(results15.t,0)), 'FINAL', round(results10.t,0));
		}
		this.cutSceneStart(str);
	},
	block5CleanUp: function(){
		this.cutSceneEnd();
	},
	block6Start: function(){
		this.cutSceneStart("<p><p>Now let’s go on a brief tangent.  When you compress, temperature increases, right?  If you start from the equation</p><center><img src=img/work/eq5.gif></img></center></p> <p>which describes adiabatic compressions, and solve for temperature, how should temperature increase as volume decreases?  If you get stuck solving, remember that you can use the ideal gas law to replace variables.</p><p> Once you’ve solved for temperature, try graphing temperature with respect to volume with C<sub>V</sub> of R and C<sub>P</sub> of 2R.  Note that the temperature’s slope gets steeper you compress.  Why might this be?  Let’s try to figure it out by looking at an adiabatic compression.</p>");
	},
	block6CleanUp: function(){
		this.cutSceneEnd();
	},
	block7Start: function(){
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(510,30), P(510,400), P(40,400)]], 'staticAdiabatic', [wallHandle]);
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 375), 650, 250);
		spcs['spc3'].populate(P(45,35), V(445, 375), 450, 250);		
		this.compArrow = this.makeCompArrow('container', {mode:'adiabatic'});
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:200, step:50}});
		this.graphs.pVSv.addSet('p', 'P Int.', Col(50,50,255), Col(200,200,255),
								{data:this.data, x:'v', y:'p'});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});	
		this.volListener = new StateListener(7, this.data.v, .15, {}, {func:function(){}, obj:''});
		
		
	},
	block7Conditions: function(){
		if(this.volListener.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress MORE!'};

	},
	block7CleanUp: function(){
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		this.removeAllGraphs();
		
	},
	block8Start: function(){
		this.cutSceneStart('<p>So it would seem that as your volume decreases, the number of collisions that happen over a given compression increases.  From this we can say that the energy added per volume when compressing at high pressure is <i>greater</i> than when at low pressure.</p><p>  This means that as our volume decreases (and pressure increases), the rate of temperature change will increase, giving us a greater-than-linear slope.</p><p>I know this doesn’t perfectly justify why volume should be raised to the C<sub>p</sub>/C<sub>v</sub> power, but hopefully it gives you a mental model that you can work with to understand how systems behave when they’re compressed.</p>');
	},
	block8CleanUp: function(){
		this.cutSceneEnd();
	},
	block9Start: function(){
		this.cutSceneStart('<p>Now let’s apply some of this thinking to figure out why constant pressure and constant volume heat capacities are different.  For the gas in these simulations, C<sub>v</sub> is R and C<sub>p</sub> is 2R.  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why do they take different amounts of energy?  Any thoughts?</p>');
	},
	block9CleanUp: function(){
		this.cutSceneEnd();
	},
	block10Start: function(){
		$('#sliderHeaterHolder').show();
		walls = WallHandler([[P(40,30), P(255,30), P(255,440), P(40,440)], [P(295,250), P(510,250), P(510,440), P(295,440)]], 'staticAdiabatic', ['left', 'right']);
		//this.piston = new Piston('pistony', 'right', 5, function(){return this.g}, this);
		this.tempInit = 300;
		spcs['spc1'].populate(P(40,30), V(200,350), 400, this.tempInit, 'left', 'left');
		spcs['spc3'].populate(P(40,30), V(200,350), 400, this.tempInit, 'left', 'left');
		spcs['spc1'].populate(P(295,250), V(200,140), 400, this.tempInit, 'right', 'right');
		spcs['spc3'].populate(P(295,250), V(200,140), 400, this.tempInit, 'right', 'right');
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
	block10Conditions: function(){
		var tempLeft = dataHandler.temp({tag:'left'});
		var tempRight = dataHandler.temp({tag:'right'});
		var heatBy = 1.5;
		if(fracDiff(tempLeft, tempRight) < .1 && tempLeft>this.tempInit*heatBy && tempRight>this.tempInit*heatBy){
			return {result:true};
		}else if(tempLeft<this.tempInit*heatBy || tempRight<this.tempInit*heatBy){
			return {result:false, alert:'Heat the containers more!'};
		}
		return {result:false, alert:'Make your containers have the same temperature!'};
		
	},
	block10CleanUp: function(){
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
	block11Start: function(){
		this.cutSceneStart('<p>So, what happened?  Why did the constant pressure system take more energy to heat up?  Because it was doing work on its surroundings to maintain that constant pressure?  Why yes, that’s it!  Well done.  Shall we formalize?</p><p> To heat up the C<sub>v</sub> container, you just had to put energy into the molecules to make them move more quickly.</p>We can say that like...</p><center><p><img src = img/work/eq6.gif></img></center></p>  But there’s more going on in the C<sub>p</sub> container.  To maintain constant pressure, it had to expand, doing work on its surroundings.</p><p>This means that the energy we added to the C<sub>p</sub> went to <i>two</i> places:  to the molecules to make them move more quickly, and to the wall to push it outwards.  That looks like...</p><center><p><img src=img/work/eq7.gif></img></p></center><p>Having another place for the energy to go means that you have to put more energy in to change the temperature a given amount.</p>');		
		
	},
	block11CleanUp: function(){
		this.cutSceneEnd();
	},
	block12Start: function(){
		this.cutSceneStart('<p>If you substitute in PV = RT from the ideal gas law, you’ll find that C<sub>V</sub> + R = C<sub>P</sub>.  Or, the energy that goes into speeding up the molecules plus work done to maintain constant pressure equals heat capacity at constant pressure.  </p>');
	},
	block12CleanUp: function(){
		this.cutSceneEnd();
	},
	block13Start: function(){
		this.cutSceneStart('<p>And thus we have demystified work</p>  <p>By knowing that our molecules behave like bouncy balls, we figured out that that molecules change speed as a result of collisions with a moving wall.  On a macroscopic scale, we say that work is being done on the container.  The higher the system pressure, the more work is done per volume change.  We can justify this by saying there are more collisions with the wall at higher pressure, and that each collision speeds up the colliding molecule.</p> <p> From there, we looked at heat capacities and decided that C<sub>P</sub> is greater than C<sub>V</sub> because of the work done by the constant pressure container. </p><p> Now go forth and conquer.  </p>',
		'outro');
	},
	block13CleanUp: function(){
		this.cutSceneEnd();
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
		this.playedWithSlider = true;
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