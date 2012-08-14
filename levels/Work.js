function Work(){
	this.setStds();
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Work.prototype, 
			LevelTools, 
{
	declarePrompts: function(){
		this.prompts=[
			{block:0,
				cutScene:true,
				text:"<p>Good afternoon!</p><p>Today we’re going to try to figure out how work adds energy to a system.  First we’re going to put together the equations that describe doing work on an adiabatic system, </p><p>Which of these equations describes work done on a system?</p>,",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"<img src='img/work/eq1.gif'></img>", isCorrect: true},
						{optionText:"<img src='img/work/eq2.gif'></img>", isCorrect: false, message:'No!  You do no work with constant volume'},
						{optionText:"<img src='img/work/eq3.gif'></img>", isCorrect: false, message:"No!"},
						{optionText:"<img src='img/work/eq4.gif'></img>", isCorrect: false, message:"It is dependant of change in volume, but T?"}
					]
				},
			},
			{block:1, 
				cutScene: true,
				text: "<p>Indeed.  This tells us that work done on a system is equal to how hard you compress a container times how much you compress it.</p><p>Now from the first law, we know</p><p><center><img src='img/work/eq5.gif></img></center></p><p>We’re going to be looking at an adiabatic system.  Which is these simplifications is correct?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"<img src='img/work/eq6.gif'></img>", isCorrect: true},
						{optionText:"<img src='img/work/eq7.gif'></img>", isCorrect: false, message:"Why c<sub>P</sub>?"},
						{optionText:"<img src='img/work/eq8.gif'></img>", isCorrect: false, message:"But it's adiabatic!"},
						{optionText:"It cannot be simplified", isCorrect: false, message:"Yes it can.  What is Q equal to?"}
					]
				},
			{block:3, 
				cutScene: true,
				text:"<p>Excellent, so as we add energy through work our system heats up since energy is conserved.  We know that temperature is an expression of molecular kinetic energy.  This tells us that as we compress our container, the molecules speed up.</p><p> But why does that happen?  Why does pushing on a container make molecules speed up?  There must be some event in the compression that makes a molecule speed up.  </p><p><p>Shall we investigate?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', buttonText:'Yes', isCorrect:true}
					]
				},
			{block:4,
				title:"Current step",
				text:"Alright, let’s do some work (sorry).  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the slider.  If you compress the system, how does the temperature behave?  Does the change seem consistent with the previous equation?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'inc', buttonText:'Increases', isCorrect:true},
						[{buttonId:'dec', buttonText:'Decreases', isCorrect:false}
					]
				},				
			},
			{block:4, 
				title: 'Current step', 
				text: "<p>Now these molecules undergo perfectly elastic collisions when they hit a wall.  This means that they behave like a bouncy ball would when you throw it against a wall.</p><p>If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving towards the ball, what should happen?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'up', buttonText:'Speeds up', isCorrect:true},
						[{buttonId:'down', buttonText:'Slows down', isCorrect:false}
					]
				},				
			{block:5, 
				title: 'Current step', 
				text:"Let’s see if we can relate that idea to work by looking at just one molecule. If you compress the cylinder, at what point does the molecule’s speed change?  How could this relate to a temperature change?"
			},
			{block:6,
				text:"<p>Okay, now which of the following would you say describes what happened?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"The molecules sped up becase it was hit with the moving wall.", isCorrect: true},
						{optionText:"Something else.", isCorrect: false},
						{optionText:"Filler.", isCorrect: false}

					]
				},				
			
			},
			{block:7,
				cutScene: true,
				text:"<p>So we can say that if we hit a molecule with a moving wall, it’ll be speed up, but will this idea really lead to the correct temperature change for a system of many molecules?  Let’s do an experiment and find out! </p><p>Let’s compress a system at YYY K from XX L to 10 L at a constant pressure of 6 atm and see if calculated and simulated results line up.</p><p>One other thing - these collisions are the <i>only</i> way energy is added in these simulations, so if our idea it wrong, the simulation will give the wrong result.</p><p>Now, how much work will we do on this system?</p>",
				quiz:{	
					type:'text', 
					text:"Work in in kJ", 
					answer:-1, //MAKE AN ANSWER
					messageRight: 'Correct!', 
					messageWrong: "That's not correct.  Check your units maybe?"
				},
			},
			{block:8,
				cutScene: true,
				text:"<p>Okay, and what final temperature should we expect from doing that much work?  T<sub>i</sub> is YYY K.  The system will contain 1.4 moles and the gas has a heat capacity of 3/2R.</p>",
				quiz:{	
					type:'text', 
					text:"Final temperature in kelvin", 
					answer:-1, //MAKE AN ANSWER
					messageRight: 'Correct!', 
					messageWrong: "That's not correct.  Are you using the right R?"
				},
			},			
			{block:9,
				title:'Current step',
				text:'And... Experiment!'
			},
			{block:10,
				cutScene: true,
				text:"<p>Alright, we got XXX K experimental versus YYY K theoretical.  So our idea was that work increased temperature through collisions with the moving wall.</p><p>Does our experiment back up the idea?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', buttonText:'Yes', isCorrect:true},
						[{buttonId:'no', buttonText:'No', isCorrect:false, message:"Yeah it does!  Look how close they were!"}
					]
				},
				replace:
					[{oldStr:'XXX', newStr:'GETstuffstuffstuff'},
					{oldStr:'YYY', newStr:'GETstuffstuffstuff'}
					//FILL IN
				]
			},
			{block:11,
				text:"<p>I thought so too.  Now we know how work adds energy to a system.</p><p>Here’s another conundrum:  Why is work equal to</p><p><center><img src=img/work/eq1.gif></img></center></p><p>and NOT</p><p><center><img src=img/work/eq3.gif></img></center></p><p>Let’s find out.</p>",
			},
			{block:12,
				cutScene: true,
				text:"<p>First, shall we convince ourselves that work actually <i>is</i> dependant on external pressure?</p><p> If we compress a high pressure system and a low pressure system with the same external pressure over the same volume, how should the temperature changes of the two compare?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"<img src='img/work/eq9.gif'></img>", isCorrect: true},
						{optionText:"<img src='img/work/eq10.gif'></img>", isCorrect: false},
						{optionText:"<img src='img/work/eq11.gif'></img>", isCorrect: false}

					]
				},
			},
			{block:13, 
				title: 'Current step', 
				text:'Okay, let’s see if an experiment gives matching changes in temperature.  The graphs should show the data well.<br>Did it?'},
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', buttonText:'Yes', isCorrect:true},
						[{buttonId:'no', buttonText:'No', isCorrect:false, message:"Yeah it does!  Look at the graphs!"}
					]
				},				
			{block:14,
				cutScene: true,
				text:"<p>Alright, it looks like work does in fact depend on P<sub>ext</sub>.  But we need to figure out why!</p><p>Say we compress with P<sub>ext</sub> >> P<sub>int</sub>  What will happen to the speed of the wall?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"It will compress at a constant speed because speeding up would make P<sub>int</sub> be greater than P<sub>ext</sub>", isCorrect: false, message:'Not correct.'},
						{optionText:"It will speed up since the external force will be much greater than the internal force", isCorrect: true},
						{optionText:"It will compress at a constant slow speed because fast compression will cause an unsafe rise in blood pressure.", isCorrect: false, message:'Not correct.'},
						{optionText:"I’ll take that one out as soon as I can think of something else to take its place.", isCorrect: false, message:'Not correct.'}
					]
				},				
			},
			{block:15,
				cutScene: true,
				text:"<p>Indeed!  So why would this translate to a greater temperature change than if P<sub>ext</sub> were only slightly greater than P<sub>int</sub>?  Consider the bouncy ball and moving wall.</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{optionText:"Magic", isCorrect: false, message:'Not correct.'},
						{optionText:"A faster wall will speed up the molecules more, increasing system temperature.", isCorrect: true},
						{optionText:"It won't becacuse the wall speed isn't affected by the difference between internal and external pressure.", isCorrect: false, message:'Not correct.'}
					]
				},				
			},
			{block:16,
				text:"Okay, let’s fit an experiment to that.  Take a look at how the two containers behave when you compress them with their respective weights.  Can you <i>see</i> the temperature increase more with the high P<sub>ext</sub>?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', buttonText:'I see it!', isCorrect:true},
						[{buttonId:'no', buttonText:'No, I am blind', isCorrect:false, message:"Look harder."}
					]
				},					
			},
			{block:17,
				cutScene: 'outro',
				text:"<p>So it seems that energy added depends only on external pressure.  If P<sub>ext</sub> >> P<sub>int</sub>, the wall gets a lot of momentum and hit the molecules really hard, speeding them up a lot.  If it’s not much greater, it means that it hit the molecules <i>a lot</i> of times, with each impact adding some speeding them up a little bit.  </p><p>No matter the path, the energy you add is equal to</p><p><center><img src=’img/work/eq1.gif></img></center></p><p>And thus we have work.</p><p>Fin.</p>"
			}

		]
		store('prompts', this.prompts);
	},
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},

	block0Start: function(){
		this.cutSceneStart(
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
		this.compArrow = new CompArrow({wallInfo:'container'}, {mode:'adiabatic', speed:1.5});
		spcs['spc4'].populate(P(45,235), V(460, 100), 1, 600);
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
		walls['container'].v = 0;
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
		this.stops = new Stops({volume:10}, 'container').init();
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 325), 850, 198);
		spcs['spc3'].populate(P(45,35), V(445, 325), 650, 198);
		this.dragWeights = this.makeDragWeights([{name:'lrg', count:1, mass:75}], wallHandle).init().trackEnergyStop().trackMassStop().trackPressureStart();
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
			this.results15 = round(results15.t,0);
			this.results10 = round(results10.t,0);
			
		}
		str = replaceString(replaceString(str, 'INITIAL', this.results15), 'FINAL', this.results10);
		this.cutSceneStart(str);
	},
	block5CleanUp: function(){
		this.cutSceneEnd();
	},
	block6Start: function(){
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(255,30), P(255,440), P(40,440)], [P(295,30), P(510,30), P(510,440), P(295,440)]], 'staticAdiabatic', ['left', 'right']);
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 375), 450, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 375), 350, 200, 'left', 'left');	

		spcs['spc1'].populate(P(300,35), V(200, 375), 450, 400, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 375), 350, 400, 'right', 'right');	
		this.data.tLeft = [];
		this.data.tRight = [];
		this.data.vLeft = [];
		this.data.vRight = [];
		addListener(curLevel, 'data', 'updateData',
			function(){
				this.data.tLeft.push(dataHandler.temp({tag:'left'}));
				this.data.tRight.push(dataHandler.temp({tag:'right'}));
				this.data.vLeft.push(dataHandler.volume('left'));
				this.data.vRight.push(dataHandler.volume('right'));
			},
		this);
		var stopMax = this.yMax-110;
		this.compArrowLeft = new CompArrow({wallInfo:'left', handle:'left'}, {mode:'adiabatic', bounds:{y:{min:this.yMin, max:stopMax}}});
		this.compArrowRight = new CompArrow({wallInfo:'right', handle:'right'}, {mode:'adiabatic', bounds:{y:{min:this.yMin, max:stopMax}}});
		
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 350,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});


		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'vLeft', y:'tLeft'});			
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(0,100,200), Col(255,200,200),
								{data:this.data, x:'vRight', y:'tRight'});	
		
		this.volListenerLeft = new StateListener(stopMax, function(){return walls['left'][0].y}, .15, {}, {func:function(){}, obj:''});
		this.volListenerRight = new StateListener(stopMax, function(){return walls['right'][0].y}, .15, {}, {func:function(){}, obj:''});
		
		
	},
	block6Conditions: function(){
		if(this.volListenerLeft.isSatisfied() && this.volListenerRight.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress MORE!'};

	},
	block6CleanUp: function(){
		removeListener(curLevel, 'data', 'updateData');
		walls['left'].removeBorder();
		walls['right'].removeBorder();
		this.compArrowLeft.remove();
		this.compArrowLeft = undefined;
		this.compArrowRight.remove();
		this.compArrowRight = undefined;
		this.removeAllGraphs();
		
	},
	block7Start: function(){
		this.cutSceneStart('<p>So each collision with a moving wall adds some energy to the system.  In the high pressure container, molecules hit the walls more frequently.  This means that over our volume change, more molecules in the high pressure container hit the moving wall and gained energy, giving a greater change in temperature.  Since pressure increases as compress, you get a a greater-than-linear increase in temperature.</p> <p>Now let’s shift topics and try to figure out why constant pressure and constant volume heat capacities are different.</p><p>  For the gas in these simulations, C<sub>v</sub> is R and C<sub>p</sub> is 2R.  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why do they take different amounts of energy?</p><p>Any thoughts?</p>');
	},
	block7CleanUp: function(){
		this.cutSceneEnd();
	},

	block8Start: function(){
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
	block8Conditions: function(){
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
	block8CleanUp: function(){
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
	block9Start: function(){
		this.cutSceneStart('<p>So, what happened?  Why did the constant pressure system take more energy to heat up?  Because it was doing work on its surroundings to maintain that constant pressure?  Why yes, that’s it!  Well done.  Shall we formalize?</p><p> To heat up the C<sub>v</sub> container, you just had to put energy into the molecules to make them move more quickly.</p>We can say that like...</p><center><p><img src = img/work/eq6.gif></img></center></p>  But there’s more going on in the C<sub>p</sub> container.  To maintain constant pressure, it had to expand, doing work on its surroundings.</p><p>This means that the energy we added to the C<sub>p</sub> went to <i>two</i> places:  to the molecules to make them move more quickly, and to the wall to push it outwards.  That looks like...</p><center><p><img src=img/work/eq7.gif></img></p></center><p>Having another place for the energy to go means that you have to put more energy in to change the temperature a given amount.</p>');		
		
	},
	block9CleanUp: function(){
		this.cutSceneEnd();
	},
	block10Start: function(){
		this.cutSceneStart('<p>If you substitute in PV = RT from the ideal gas law, you’ll find that C<sub>V</sub> + R = C<sub>P</sub>.  Or, the energy that goes into speeding up the molecules plus work done to maintain constant pressure equals heat capacity at constant pressure.  </p>');
	},
	block10CleanUp: function(){
		this.cutSceneEnd();
	},
	block11Start: function(){
		this.cutSceneStart('<p>And thus we have demystified work</p>  <p>By knowing that our molecules behave like bouncy balls, we figured out that that molecules change speed as a result of collisions with a moving wall.  On a macroscopic scale, we say that work is being done on the container.  The higher the system pressure, the more work is done per volume change.  We can justify this by saying there are more collisions with the wall at higher pressure and that each collision speeds up the colliding molecule.</p> <p> From there, we looked at heat capacities and decided that C<sub>P</sub> is greater than C<sub>V</sub> because of the work done by the constant pressure container. </p><p> Now go forth and conquer.  </p>',
		'outro');
	},
	block11CleanUp: function(){
		this.cutSceneEnd();
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

}
)