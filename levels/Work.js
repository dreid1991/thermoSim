function Work(){
	this.setStds();
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
				text:"<p>Today we’re going to investigate how work transfers energy to a system.  First we’re going to develop the equations that describe a process on an adiabatic system. </p><p>Which of these equations describes work done on a system?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"||EQ1||", isCorrect: true},
						{text:"||EQ2||", isCorrect: false, message:'No!  You do no work with constant volume'},
						{text:"||EQ3||", isCorrect: false, message:"No!"},
						{text:"||EQ4||", isCorrect: false, message:"It is dependant on change in volume, but T?"}
					]
				},
			},
			{block:1, 
				cutScene: true,
				text: "<p>Indeed.  This tells us that work done on a system is equal to how hard you compress a container times how much you compress it.</p><p>Now from the first law, we know</p>||EQ5CE<p>We’re going to be looking at an adiabatic system.  Which of these relations is correct?</p>",
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
				text:"<p>Excellent, so as we add energy through work our system's temperature rises.  We know that temperature is an expression of molecular kinetic energy.  Since energy is conserved, as we add energy through work, the molecules speed up.</p><p> But why does that happen?  There must be some event in the compression that makes a molecule speed up.  </p><p><p>Shall we investigate?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true}
					]
				},
			},
			{block:3,
				title:"Current step",
				text:"Alright, let’s do some work (sorry).  Above we have a piston and cylinder assembly undergoing an adiabatic process.  You can change the external pressure with the slider.  If you compress the system, how does the temperature change?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'inc', text:'Temp Increases', isCorrect:true},
						{buttonId:'same', text:'Temp stays same', isCorrect:false, message: "But if you're doing work on an adiabatic system and temperature stays the same, is energy conserved?"},
						{buttonId:'dec', text:'Temp Decreases', isCorrect:false, message: "Do look at the graphs"}
					]
				},				
			},
			{block:3,
				title:"Current step",
				text:"Does this temperature change seem consistent with the equation below?<br><center>||EQ6||</center>",
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
				//These molecules can be thought of as perfectly elastic bouncy balls.  When the hit a wall...
				text: "These molecules undergo elastic collisions when they hit a wall.  This means that they behave like a perfectly elastic bouncy ball would when you throw it against a wall.</p><p>If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving towards the ball, what will the ball do?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'up', text:'Speed up', isCorrect:true},
						{buttonId:'same', text:'Stay the same', inCorrect:false},
						{buttonId:'down', text:'Slow down', isCorrect:false}
					]
				},
			},
			{block:4, 
				title: 'Current step', 
				text:"Let’s see if we can relate that idea to work by looking at just one molecule. If you compress the cylinder, at what point does the molecule’s speed change?  How could this relate to a temperature change when there are many molecules?"
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
				text:"<p>So we can say that if we hit a molecule with a wall moving towards it3, it’ll speed up, but will this idea really lead to the correct temperature change when compressing a system of many molecules?  Let’s do an experiment and find out! </p><p>Let’s compress a system at 200 K from 15 L to 10 L at a constant pressure of 6 bar and see if calculated and simulated results line up.</p><p>One other thing - these collisions are the <i>only</i> way energy is added in these simulations, so if our idea it wrong, the simulation will give the wrong result.</p><p>Now, how much work will we do on this system?</p>",
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
				text:"<p>Alright, we got XXX K experimental versus 363 K theoretical.  So our idea was that work increases temperature through molecules' collisions with the moving wall.</p><p>Does our experiment back up the idea?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true},
						{buttonId:'no', text:'No', isCorrect:false, message:"Yeah it does!  Look how close they were!"}
					]
				},
				replace:
					[{oldStr:'XXX', newStr:'GETtFinalBlock8'}
				]
			},
			{block:10,
				cutScene: true,
				text:"<p>I thought so too.  Now we know how work adds energy to a system.</p><p>Here’s another conundrum:  Why is work equal to</p><p><center>||EQ1||</center></p><p>and NOT</p><p><center>||EQ3||</center></p><p>Let’s find out.</p>",
			},
			{block:11,
				cutScene: true,
				text:"<p>First, we must convince ourselves that work actually <i>is</i> dependent on external pressure</p><p> If we compress a high pressure system and a low pressure system with the same external pressure over the same volume, how should the temperature changes of the two compare?</p>",
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
				text:'Okay, let’s see if an experiment gives matching changes in temperature.  The left container’s internal pressure is half the right’s.  The graphs should show the temperature change.  <br>How do the temperature changes compare?',
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'EQ9', text:'||EQ9||', isCorrect:false, message:"No it's not, look at the graphs!"},
						{buttonId:'EQ10', text:'||EQ10||', isCorrect:true},
						{buttonId:'EQ11', text:'||EQ11||', isCorrect:false, message:"No it's not, look at the graphs!"}
						
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
				text:"<p>So it seems that energy added depends only on external pressure.  If P<sub>ext</sub> is much greater then P<sub>int</sub>, the wall gets a lot of momentum and hit the molecules really hard, speeding them up a lot.  If it’s not much greater, it means that the wall just hits the molecules <i>a lot</i> of times, with each impact adding some speeding them up a little bit.  </p><p>To generalize, no matter the internal pressure, the energy you add is equal to</p><p><center>||EQ1||</img></center></p><p>Fin.</p>"
			}

		]
		store('prompts', this.prompts);
	},
	init: function(){
		$('#mainHeader').text('Work');
		nextPrompt();
	},

	
	block3Start: function(){

		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});
		spcs['spc1'].populate(P(45,35), V(460, 350), 800, 300);
		spcs['spc3'].populate(P(45,35), V(450, 350), 600, 300);
		
	
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (bar)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.pVSv.addSet('p', 'P Ext.', Col(50,50,255), Col(200,200,255),
								{x:walls[0].data.v, y:walls[0].data.pExt});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{x:walls[0].data.v, y:walls[0].data.t});		
		this.piston = new Piston({wallInfo:'container', init:2, min:2, max:15});
		this.piston.wall.displayWork().displayPExt();
		this.borderStd();
		this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:'Compress the system more!'});		
	},
	block4Start: function(){
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});
		walls[0].setHitMode('Arrow');
		this.borderStd();
		this.compArrow = new CompArrow({mode:'adiabatic', speed:1.5});
		spcs['spc4'].populate(P(45,235), V(460, 100), 1, 600);
		this.tempListener = new StateListener({dataList:walls[0].data.t, is:'notEqualTo', targetVal:dataHandler.temp(), alertUnsatisfied:"Try hitting the molecule with the wall while the wall's moving"});
	},
	block8Start: function(){
		wallHandle = 'container';
		walls = WallHandler({pts:[[P(40,31), P(510,31), P(510,350), P(40,350)]], handlers:'staticAdiabatic', handles:[wallHandle], bounds:[{yMin:30, yMax:300}], vols:[15]});
		this.stops = new Stops({stopPt:{volume:10}});
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 325), 850, 200);
		spcs['spc3'].populate(P(45,35), V(445, 325), 650, 200);
		this.dragWeights = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:wallHandle, compMode:'cPAdiabatic'});
		walls[0].displayWork().displayTemp().displayPExt().displayVol();
		this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'equalTo', targetVal:10, alertUnsatisfied:'Compress the system!'});
		this.tempListener = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:363, storeAtSatisfy:{tFinal:walls[0].data.t}, tolerance:.02});
	},
	block12Start: function(){
		wallHandle = 'container';
		walls = WallHandler({pts:[[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], handlers:'staticAdiabatic', handles:['left', 'right']});
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 400, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 400, 'right', 'right');	
	
		this.dragWeightsLeft = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'left', massInit: 5, compMode:'cPAdiabatic'});
		this.dragWeightsRight = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'right', massInit: 5, compMode:'cPAdiabatic'});
		this.stopsLeft = new Stops({stopPt:{volume:3.5}, wallInfo:'left'});
		this.stopsRight = new Stops({stopPt:{volume:3.5}, wallInfo:'right'});		
		walls[0].displayTemp().displayWork();
		walls[1].displayTemp().displayWork();
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{x:walls['right'].data.v, y:walls['right'].data.t});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{x:walls['left'].data.v, y:walls['left'].data.t});	
		this.volListenerLeft = new StateListener({dataList:walls['left'].data.v, is:'equalTo', targetVal:3.5, alertUnsatisfied:'Compress the systems!'});
		this.volListenerRight = new StateListener({dataList:walls['right'].data.v, is:'equalTo', targetVal:3.5, alertUnsatified:'Compress the systems!'});
	},
	block15Start: function(){
		wallHandle = 'container';
		walls = WallHandler({pts:[[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], handlers:'staticAdiabatic', handles:['left', 'right']});
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 200, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 200, 'right', 'right');	
		this.dragWeightsLeft = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:35}], wallInfo:'left', massInit:5, compMode:'cPAdiabatic'});
		this.dragWeightsRight = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:75}], wallInfo:'right', massInit:5, compMode:'cPAdiabatic'});
		this.stopsLeft = new Stops({stopPt:{volume:3.5}, wallInfo:'left'});
		this.stopsRight = new Stops({stopPt:{volume:3.5}, wallInfo:'right'});		
		walls[0].displayTemp().displayWork();
		walls[1].displayTemp().displayWork();		
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{x:walls['right'].data.v, y:walls['right'].data.t});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{x:walls['left'].data.v, y:walls['left'].data.t});	
		
		this.volListenerLeft = new StateListener({dataList:walls['left'].data.v, is:'equalTo', targetVal:3.5, alertUnsatisfied:'Compress the systems!'});
		this.volListenerRight = new StateListener({dataList:walls['right'].data.v, is:'equalTo', targetVal:3.5, alertUnsatified:'Compress the systems!'});
	},
}
)