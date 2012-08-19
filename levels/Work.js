function Work(){
	this.setStds();
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-155, 25, '13pt calibri', Col(255,255,255),this, 'left');
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
				text:"<p>Good afternoon!</p><p>Today we’re going to try to figure out how work adds energy to a system.  First we’re going to put together the equations that describe doing work on an adiabatic system, </p><p>Which of these equations describes work done on a system?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"||EQ1||", isCorrect: true},
						{text:"||EQ2||", isCorrect: false, message:'No!  You do no work with constant volume'},
						{text:"||EQ3||", isCorrect: false, message:"No!"},
						{text:"||EQ4||", isCorrect: false, message:"It is dependant of change in volume, but T?"}
					]
				},
			},
			{block:1, 
				cutScene: true,
				text: "<p>Indeed.  This tells us that work done on a system is equal to how hard you compress a container times how much you compress it.</p><p>Now from the first law, we know</p>||EQ5CE<p>We’re going to be looking at an adiabatic system.  Which is these simplifications is correct?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"||EQ6||", isCorrect: true},
						{text:"||EQ7||", isCorrect: false, message:"Why Cp?"},
						{text:"||EQ8||", isCorrect: false, message:"But it's adiabatic!"},
						{text:"It cannot be simplified", isCorrect: false, message:"Yes it can.  What is Q equal to?"}
					]
				},
			},
			{block:2, 
				cutScene: true,
				text:"<p>Excellent, so as we add energy through work our system heats up since energy is conserved.  We know that temperature is an expression of molecular kinetic energy.  This tells us that as we compress our container, the molecules speed up.</p><p> But why does that happen?  There must be some event in the compression that makes a molecule speed up.  </p><p><p>Shall we investigate?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true}
					]
				},
			},
			{block:3,
				title:"Current step",
				text:"Alright, let’s do some work (sorry).  Above we have a piston and cylinder setup.  You can change the piston’s pressure with the slider.  If you compress the system, how does the temperature behave?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'inc', text:'Temp Increases', isCorrect:true},
						{buttonId:'dec', text:'Temp Decreases', isCorrect:false, message: "Do look at the graphs"}
					]
				},				
			},
			{block:3,
				title:"Current step",
				text:"Does this temperature change seem consistant with the equation below?<br><center>||EQ6||</center>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true},
						{buttonId:'no', text:'No', isCorrect:false, message:"But wouldn't delta V be negative since we compressing?  A negative negative volume change gives us a positive temperature change!"}
					]
				},
			},
			{block:3, 
				title: 'Current step', 
				text: "Now these molecules undergo perfectly elastic collisions when they hit a wall.  This means that they behave like a bouncy ball would when you throw it against a wall.</p><p>If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving towards the ball, what will the ball do?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'up', text:'Speed up', isCorrect:true},
						{buttonId:'down', text:'Slow down', isCorrect:false}
					]
				},
			},
			{block:4, 
				title: 'Current step', 
				text:"Let’s see if we can relate that idea to work by looking at just one molecule. If you compress the cylinder, at what point does the molecule’s speed change?  How could this relate to a temperature change?"
			},
			{block:5,
				cutScene: true,
				text:"<p>Okay, now which of the following would you say describes what happened?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"The molecule sped up becase it was hit with the moving wall.", isCorrect: true},
						{text:"Something else.", isCorrect: false},
						{text:"Filler.", isCorrect: false}

					]
				},				
			
			},
			{block:6,
				cutScene: true,
				text:"<p>So we can say that if we hit a molecule with a moving wall, it’ll speed up, but will this idea really lead to the correct temperature change when compressing a system of many molecules?  Let’s do an experiment and find out! </p><p>Let’s compress a system at 200 K from 15 L to 10 L at a constant pressure of 6 atm and see if calculated and simulated results line up.</p><p>One other thing - these collisions are the <i>only</i> way energy is added in these simulations, so if our idea it wrong, the simulation will give the wrong result.</p><p>Now, how much work will we do on this system?</p>",
				quiz:{	
					type:'text', 
					text:"Work in in kJ", 
					answer:3.04, 
					messageWrong: "That's not correct.  Check your units maybe?  Also, the work done on the system is positive since we're compressing."
				},
			},
			{block:7,
				cutScene: true,
				text:"<p>Yes, and what final temperature should we expect from doing 3.04 kJ of work on the system?  T<sub>o</sub> is 200 K.  The system will contain 1.5 moles and the gas has a heat capacity of 3/2R.</p>",
				quiz:{	
					type:'text', 
					text:"Final temperature in kelvin", 
					answer:362.6, //MAKE AN ANSWER
					messageWrong: "That's not correct.  Are you using the right R?"
				},
			},			
			{block:8,
				title:'Current step',
				text:'And... Experiment!'
			},
			{block:9,
				cutScene: true,
				text:"<p>Alright, we got 363 K experimental versus XXX K theoretical.  So our idea was that work increases temperature through molecules' collisions with the moving wall.</p><p>Does our experiment back up the idea?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true},
						{buttonId:'no', text:'No', isCorrect:false, message:"Yeah it does!  Look how close they were!"}
					]
				},
				replace:
					[{oldStr:'XXX', newStr:'GETtFinal'}
					//FILL IN
				]
			},
			{block:10,
				cutScene: true,
				text:"<p>I thought so too.  Now we know how work adds energy to a system.</p><p>Here’s another conundrum:  Why is work equal to</p><p><center>||EQ1||</center></p><p>and NOT</p><p><center>||EQ3||</center></p><p>Let’s find out.</p>",
			},
			{block:11,
				cutScene: true,
				text:"<p>First, we must convince ourselves that work actually <i>is</i> dependant on external pressure?</p><p> If we compress a high pressure system and a low pressure system with the same external pressure over the same volume, how should the temperature changes of the two compare?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"||EQ9||", isCorrect: false},
						{text:"||EQ10||", isCorrect: true},
						{text:"||EQ11||", isCorrect: false},
						{text:"Can't tell", isCorrect: false}

					]
				},
			},
			{block:12, 
				title: 'Current step', 
				text:'Okay, let’s see if an experiment gives matching changes in temperature.  The left container’s internal pressure is half the right’s.  The graphs should show the temperature change.  <br>Did it?',
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true},
						{buttonId:'no', text:'No', isCorrect:false, message:"Yeah it does!  Look at the graphs!"}
					]
				},		
			},
			{block:13,
				cutScene: true,
				text:"<p>Alright, it looks like work does in fact depend on P<sub>ext</sub>.  But we need to figure out why!</p><p>Say we compress with P<sub>ext</sub> >> P<sub>int</sub>  What will happen to the speed of the wall?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"It will compress at a constant speed because speeding up would make P<sub>int</sub> be greater than P<sub>ext</sub>", isCorrect: false, message:'Not correct.'},
						{text:"It will speed up since the external force will be much greater than the internal force", isCorrect: true},
						{text:"It will compress at a constant slow speed because fast compression will cause an unsafe rise in blood pressure.", isCorrect: false, message:'Not correct.'},
						{text:"I’ll take that one out as soon as I can think of something else to take its place.", isCorrect: false, message:'Not correct.'}
					]
				},				
			},
			{block:14,
				cutScene: true,
				text:"<p>Indeed!  So why would this translate to a greater temperature change than if P<sub>ext</sub> were only slightly greater than P<sub>int</sub>?  Consider the bouncy ball and moving wall.</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"Magic", isCorrect: false, message:'Not correct.'},
						{text:"A faster wall will speed up the molecules more on impact, increasing system temperature.", isCorrect: true},
						{text:"It won't becacuse the wall speed isn't affected by the difference between internal and external pressure.", isCorrect: false, message:'Not correct.'}
					]
				},				
			},
			{block:15,
				text:"Okay, let’s fit an experiment to that.  Take a look at how the two containers behave when you compress them with their respective weights.  Initially they have the same internal pressure.  Can you <i>see</i> the temperature increase more with the high P<sub>ext</sub>?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'I see it!', isCorrect:true},
						{buttonId:'no', text:'No, I am blind', isCorrect:false, message:"Look harder."}
					]
				},					
			},
			{block:16,
				cutScene: 'outro',
				text:"<p>So it seems that energy added depends only on external pressure.  If P<sub>ext</sub> is much greater then P<sub>int</sub>, the wall gets a lot of momentum and hit the molecules really hard, speeding them up a lot.  If it’s not much greater, it means that the wall just hits the molecules <i>a lot</i> of times, with each impact adding some speeding them up a little bit.  </p><p>In both cases, the energy you add is equal to</p><p><center>||EQ1||</img></center></p><p>Fin.</p>"
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

	
	block3Start: function(){
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
		
		
		this.piston = new Piston({wallInfo:'container', init:2, min:2, max:15, slider:'sliderPiston'}).trackWorkStart().trackPressureStart();
		this.borderStd();
		this.volListener8 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.1});
		//this.heater = new Heater('spaceHeater', P(150,360), V(250,50), 0, 20, c);//P(40,425), V(470,10)
		//this.heater.init();

	},
	block3Conditions: function(){
		if(this.volListener8.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress more!'};
	},
	
	block3CleanUp: function(){
		this.playedWithSlider = undefined;
		this.volListener8 = undefined;
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
	
	block4Start: function(){

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
	block4Conditions: function(){
		if(this.tempChanged){
			return {result:true};
		}
		return {result:false, alert:"Try hitting the molecule with the wall while the wall's moving"};	
	},
	block4CleanUp: function(){
		this.tempChanged = undefined;
		walls['container'].v = 0;
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		walls.setHitMode('container', 'Std');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
	},
	block8Start: function(){
		$('#reset').show()
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,31), P(510,31), P(510,350), P(40,350)]], 'staticAdiabatic', [wallHandle], [{yMin:30, yMax:300}], undefined, [15]);
		this.stops = new Stops({stopPt:{volume:10}});
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 325), 850, 200);
		spcs['spc3'].populate(P(45,35), V(445, 325), 650, 200);
		this.dragWeights = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:wallHandle, compMode:'cPAdiabatic'}).trackMassStop().trackPressureStart();
		this.trackTempStart();
		this.trackVolumeStart(0);
		this.volListener15 = new StateListener({condition:15, checkAgainst:this.data.v, tolerance:.05, recordAtSatisfy:{p:this.data.p, t:this.data.t}});
		this.volListener10 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.03, recordAtSatisfy:{p:this.data.p, t:this.data.t}, atSatisfyFunc:{func:function(){store('tFinal', round(this.data.t[this.data.t.length-1],0))}, obj:this}});
	},
	block8Conditions: function(){
		if(this.volListener10.isSatisfied() && this.volListener15.isSatisfied()){
			return {result:true};
		}
		if(!this.volListener10.isSatisfied()){
			return {result:false, alert:'Compress the container!'};
		}
	},
	block8CleanUp: function(){
		this.wallV=0;
		$('#reset').hide();
		this.trackTempStop();
		this.trackVolumeStop();
		walls['container'].removeBorder();
		this.readout.hide();
		this.stops.remove();
		this.stop = undefined;
		this.dragWeights.remove();
		this.dragWeights = undefined;
	},
	block12Start: function(){
		$('#reset').show();
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], 'staticAdiabatic', ['left', 'right']);
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 400, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 400, 'right', 'right');	
		this.data.tLeft = [];
		this.data.tRight = [];
		this.data.vLeft = [];
		this.data.vRight = [];		
		this.dragWeightsLeft = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'left', massInit: 5, compMode:'cPAdiabatic'}).trackMassStop().trackPressureStart();
		this.dragWeightsRight = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'right', massInit: 5, compMode:'cPAdiabatic'}).trackMassStop().trackPressureStart();
		this.stopsLeft = new Stops({stopPt:{volume:3.5}, wallInfo:'left'});
		this.stopsRight = new Stops({stopPt:{volume:3.5}, wallInfo:'right'});		
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run',
			function(){
				this.data.tLeft.push(this.dataHandler.temp({tag:'left'}));
				this.data.tRight.push(this.dataHandler.temp({tag:'right'}));
				this.data.vLeft.push(this.dataHandler.volume('left'));
				this.data.vRight.push(this.dataHandler.volume('right'));
			},
		this);
		addListener(curLevel, 'data', 'updateGraphs',
			this.updateGraphs,
		this);
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{data:this.data, x:'vRight', y:'tRight'});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'vLeft', y:'tLeft'});	
		
		this.volListenerLeft = new StateListener({condition:3.5, checkAgainst:this.data.vLeft, tolerance:.05});
		this.volListenerRight = new StateListener({condition:3.5, checkAgainst:this.data.vRight, tolerance:.05});
	},
	block12Conditions: function(){
		if(this.volListenerLeft.isSatisfied() && this.volListenerRight.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress the containers!'};
	},
	block12CleanUp: function(){
		$('#reset').hide();
		removeListener(curLevel, 'data', 'updateGraphs');
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run', this.dataRun, this);
		this.removeAllGraphs();
		this.stopsLeft.remove();
		this.stopsRight.remove();
		this.dragWeightsLeft.remove();
		this.dragWeightsRight.remove();
		this.readout.hide();
	},
	block15Start: function(){
		$('#reset').show();
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], 'staticAdiabatic', ['left', 'right']);
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 200, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 200, 'right', 'right');	
		this.data.tLeft = [];
		this.data.tRight = [];
		this.data.vLeft = [];
		this.data.vRight = [];		
		this.dragWeightsLeft = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:35}], wallInfo:'left', massInit:5, compMode:'cPAdiabatic'}).trackMassStop().trackPressureStart();
		this.dragWeightsRight = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'right', massInit:5, compMode:'cPAdiabatic'}).trackMassStop().trackPressureStart();
		this.stopsLeft = new Stops({stopPt:{volume:3.5}, wallInfo:'left'});
		this.stopsRight = new Stops({stopPt:{volume:3.5}, wallInfo:'right'});		
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run',
			function(){
				this.data.tLeft.push(this.dataHandler.temp({tag:'left'}));
				this.data.tRight.push(this.dataHandler.temp({tag:'right'}));
				this.data.vLeft.push(this.dataHandler.volume('left'));
				this.data.vRight.push(this.dataHandler.volume('right'));
			},
		this);
		addListener(curLevel, 'data', 'updateGraphs',
			this.updateGraphs,
		this);
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{data:this.data, x:'vRight', y:'tRight'});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'vLeft', y:'tLeft'});	
		
		this.volListenerLeft = new StateListener({condition:3.5, checkAgainst:this.data.vLeft, tolerance:.02});
		this.volListenerRight = new StateListener({condition:3.5, checkAgainst:this.data.vRight, tolerance:.02});
	},
	block15Conditions: function(){
		if(this.volListenerLeft.isSatisfied() && this.volListenerRight.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress the containers!'};
	},
	block15CleanUp: function(){
		$('#reset').hide();
		removeListener(curLevel, 'data', 'updateGraphs');
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run', this.dataRun, this);
		this.removeAllGraphs();
		this.stopsLeft.remove();
		this.stopsRight.remove();
		this.dragWeightsLeft.remove();
		this.dragWeightsRight.remove();
		this.readout.hide();
	},
	dataRun: function(){
		var wall = walls[0];
		this.data.p.push(wall.pInt())
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volume());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},

}
)