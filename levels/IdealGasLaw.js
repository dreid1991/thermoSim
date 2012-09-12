function IdealGasLaw(){
	this.setStds();
	this.readout = new Readout('mainReadout', 30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this);
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
	
}

_.extend(IdealGasLaw.prototype, 
		LevelTools, 
{
	declarePrompts: function() {
		this.prompts=[
			{block:0,
				cutScene:true,
				text:"<p>Hey you!</p><p>You know the ideal gas law? This thing?</p>||EQ1CE<p>Any idea why that's actually true?  Want to find out?  Of course you do!</p>",
			},
			{block:1, 
				title:"Currnet step",
				text: "First, we need to find out what our state variables like temperature and pressure look like on a molecular level.  Let’s start with temperature.  Temperature is proportional to average molecular kinetic energy.  What happens to the molecules’ speed and kinetic energy when you change their temperature with the slider?",
				quiz:{ 
					type:'buttons',
					options:
						[{text:"Increases", isCorrect: true},
						{text:"Decreases", isCorrect: false, message:"You should play with the slider more or reread the question."}
					]
				},
			},
			{block:2, 
				title:"Current step",
				text:"Just so we're on the same page, which of these two systems has a higher temperature?",
				quiz:{	
					type:'buttons',
					options:
						[{text:"Right", isCorrect: true},
						{text:"Left", isCorrect: false, message:"Yeah, but temperature is preportional to kinetic energy which is preportional to speed^2"}
						
					]
				},
			},
			{block:3, 
				cutScene: true,
				text:"<p>We can calculate molecules’ temperature with the equation</p>||EQ2CE<p>with <ul><li>k: boltzmann constant <li>t: temperature <li>m: molecule’s mass <li>v molecule’s speed</ul>Alternatively, we can express this in terms of the molecules’ <i>root mean squared</i> speed like this:</p>||EQ3CE<p>so rms is the average of the square of all the velocities square rooted.  The above is for a system of one type of molecule, but rms speed can be used to calculate the temperature of a system with any types of molecules.",
			},

			{block:4,
				cutScene: true,
				text:"<p>Right.  Now root mean square is a tricky idea, but it’s important to understanding temperature, so let’s practice.</p><p>If you have molecules moving at 250, 300, 350, 400, and 450 m/s, what is their root mean square speed?</p>",
				quiz:{	
					type:'text', 
					text:"Root mean square in m/s", 
					answer:357, 
					messageWrong: "Hey, rms = sqrt((x<sub>1</sub><sup>2</sup> + x<sub>2</sub><sup>2</sup>... + x<sub>n</sub><sup>2</sup>)/n)"
				},	
			},
			{block:5,
				cutScene: true,
				text:"<p>Okay, now what’s the <i>average</i> of those values?</p><p>  They were 250, 300, 350, 400, and 450 m/s.</p>",
				quiz:{	
					type:'text', 
					text:"Average in m/s", 
					answer:350, 
					messageWrong: "That's not right."
				},
			},	
			{block:6,
				cutScene: true,
				text:"<p>Okay, from the same values, we have </p><p>&#09;rms: 357 m/s</p><p>&#09;average: 350 m/s</p><p>By the way, root mean square is also called the quadratic mean, if that helps.</p><p>Now which of these would you say best described what root mean square is?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"It's an average that weights large numbers more heavily", isCorrect: true},
						{text:"It’s just like an just like an average", isCorrect: false, message:"But... but the values are different.  How can they be the same if they produce different values?"},
						{text:"It’s an average that weights large numbers less heavily", isCorrect:false, message: "But the rms produced a higher value.  That seems like it's weighting higher values more heavily"}
					]
				},
			},	
			{block:7,
				cutScene: true,
				text:"<p>Right, and we can use that average to calculate temperature through the equation</p>||EQ3CE",
			},				
			{block:8,
				title:"Current step",
				text:"Okay, now I have a challenge for you: Make these containers have the same temperature by adjusting their molecules’ root mean square speeds.  The containers’ molecules have masses of 2 g/mol and 8 g/mol respectively.  Remember, temperature is proportional to average kinetic energy.",
				quiz:{	
					type:'buttons',
					options:
						[{text:"Check answer", isCorrect: true}
					]
				},
			},
			{block:9,
				cutScene: true,
				text:"<p>Excellent, you made it!  Setting the first rms to twice the second gave the two sets of molecules the same <i>average kinetic energy</i> and thus the same temperature.</p><p>So to make sure, which of these best describes temperature?</p>",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"An expression of molecular speed.  A faster moving set of molecules will always have a higher temperature", isCorrect: false, message:"But what if you have a really heavy molecule moving slowly?  It could still have a bunch of kinetic energy compared to a fast small molecule."},
						{text:"An expression of molecular momentum.", isCorrect: false, message:"Close, momentum has mass and speed, but not to the powers."},
						{text:"An expression of molecular kinetic energy, because temperature is really just talking about how energetically molecules are moving, not necessarily which is moving faster or which is more massive", isCorrect: true}
					]
				},
			},
			{block:10,
				title:"Current step",
				text:"Alright, now on to pressure!<br>A pressure is a force per area. This tells us that gases at non-zero pressure must exert a force on their container.  In the system above, what event causes a force to be exerted on the wall?",
				quiz:{	
					type:'text', 
					text:"Type your explanation here", 
				},
			},
			{block:11,
				text:"It might be simpler if we look at just one molecule.  Every time the molecule hits the wall, its momentum changes.  If we average that change over some time, we get an average force applied per area, or a pressure.  How would the momentum change of collision and the frequency of collision change with speed, and how might this relate to pressure?  You can use the slider to change the molecule’s temperature to check your ideas.  When you’re done playing here, we can go through the math on the next page.  ",
				quiz:{	
					type:'buttons',
					options:
						[{text:"Change increases", isCorrect:true},
						{text:"Change decreases", isCorrect: false, message:"But look at it, when it's going faster, its speed must change more when it bounces off a wall"}
					]
				},
			},	
			{block:12,
				cutScene:true,
				text:"<p>So we have two ideas at play here:</p><p><ul><li>First, the harder your molecules hit the wall, the more force each collision exerts on it.</p><p><li>Second, the faster they're moving, the more often they hit the wall.</ul></p><p>Both of these things are <i>linearly</i> dependant on molecular speed.</p><p>The total force applied to the walls by the molecules is the product of these two, so multiplying, we get that pressure is proportional to mass times speed squared, or to temperature.</p><p>Let's see if we can express that with some math.</p>",

			},				
			{block:13,
				cutScene:true,
				text:"<p>Say we have a molecule of mass m moving as follows:</p>||EQ4CE<p>Starting from||EQ5CE<p>and</p>||EQ6CE<p>We can integrate F=ma over time to get</p>||EQ7CE<p>We know that the change in velocity on collision is 2V<sub>x</sub> because it leaves with the inverse of the velocity it arrived with.  This expresses the first idea.<br>Substituting in F, we get</p>||EQ8CE<p>Continued on next page...</p>",
			},	
			{block:14,
				cutScene:true,
				text:"||EQ4CE<p>Because we're looking for an average pressure, we average out the momentum change over the whole time between impacts, which is given by</p>||EQ9CE<p>This gives us the second idea.<br>Then we put it all together and get</p>||EQ10CE<p>Now look at that!  Remember that T is proportional to mV<sup>2</sup> as well?  This means that we have just derived that <i>P is directly proportional to T</i> from a simple model of balls bouncing around!  Does this sound familiar to the ideal gas law or what?",
			},
			{block:15,
				title:"Current step",
				text:"So let’s consider a constant temperature container.  You can use the yellow arrow to change the container volume.  Try halving the volume of this container.  We know from the ideal gas law that if you halve the volume and hold the temperature constant, the pressure will double, right?  Can you explain why this happens in terms of the number of molecular collisions with the wall?",
				quiz:{	
					type:'text', 
					text:"Type your explanation here", 
				},
			},
			{block:16,
				title:"Current step",
				text:"Now try halving the volume again.  How do the pressure and number of collisions behave this time?",
				quiz:{	
					type:'buttons',
					options:
						[{text:"Double again", isCorrect:true},
						{text:"Quadrouple", isCorrect: false, message:"Not really."},
						{text:"No change", isCorrect: false, message:"Yes there is."}
					]
				},
			},
			{block:17,
				cutScene:true,
				text:"<p>Remember how we looked at the side length of a container, L<sub>x</sub> to find the time between collisions?  If you imagine that L<sub>x</sub> is the vertical dimension of the previous container, every time you halve L<sub>x</sub>, you halve the average time between collisions, doubling the number of wall impacts per time and thus doubling pressure.   From this inverse relationship, might we propose the following:</p>||EQ11CE<p>Similarly, might we say that if we double the number of molecules, we would double the number of collisions per time and so double pressure?  So we get</p>||EQ12CE<p>Would the above relationships be true if temperature were not held constant?  ",
				quiz:{	
					type:'multChoice',
					options:
						[{text:"No, from the ideal gas law, a temperature will change the molecules’ speeds, changing the pressure.", isCorrect:true},
						{text:"Yes, changing the temperature will not affect pressure or volume.", isCorrect: false, message:"Try to prove that with the ideal gas law.  I don't think you'll be able to."}
					]
				},				
			},
			{block:18,
				cutScene:true,
				text:"<p>Alright, let’s put it all together!</p><p>From combining impact frequency and speed, we got</p>||EQ13CE<p>By figuring out that if we halve the size, we double the number of collisions, we got</p>||EQ11CE<p>By saying that if we double the number of molecules, we double the number of collisions, we got</p>||EQ12CE<p>Combining, we get</p>||EQ14CE</p>",
			},
			{block:19,
				cutScene:true,
				text:"<p>If we multiply by the ideal gas constant, R, we can say</p>||EQ15CE<p>or</p>||EQ1CE<p>So we just developed the ideal gas law from a model of molecules being hard spheres that bounce around!  Yay!</p>",
			}
		]
		store('prompts', this.prompts);
	},
	init: function() {
		nextPrompt();
		$('#mainHeader').text('Work');
	},
	block1Start: function() {
		this.readout.show();
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});
		spcs['spc4'].populate(P(45,35), V(450, 350), 300, 300);
		this.tempChanger1 = new TempChanger({min:100, max:1200});
		this.stateListener1 = new StateListener({dataList:walls[0].data.t, is:'notEqualTo', targetVal:dataHandler.temp(), alertUnsatisfied:"Play with the slider!"});
		walls[0].displayTemp();
		this.borderStd({min:this.yMin});
	},
	block2Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]], handlers:'staticAdiabatic', handles:['c1', 'c2']});
		this.borderStd({min:this.yMin, wallInfo:0});
		this.borderStd({min:this.yMin, wallInfo:1});
		spcs['spc4'].populate(P(45, 80), V(200, 300), 200, 600);
		spcs['spc4'].populate(P(305,75), V(200, 300), 200, 100);
	},
	block8Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]], handlers:'staticAdiabatic', handles:['c1', 'c2']});
		this.borderStd({min:this.yMin, wallInfo:0});
		this.borderStd({min:this.yMin, wallInfo:1});
		spcs['spc5'].populate(P(45, 80), V(200, 300), 1, 600, 'c1');
		spcs['spc6'].populate(P(305,75), V(200, 300), 1, 100, 'c2');
		this.RMSChanger8Left = new RMSChanger({min:50, max:1000, info:{spcName:'spc5'}});
		this.RMSChanger8Right = new RMSChanger({min:50, max:1000, info:{spcName:'spc6'}});
		walls[0].recordRMS().displayRMS();
		walls[1].recordRMS().displayRMS();
		this.tempEqualListener = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:walls[0].data.t, alertUnsatisfied:"Remember temperature is preportional to kinetic energy.  Set the kinetic energies equal"});
	},
	block10Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});	
		this.borderStd({min:this.yMin});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200);
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200);	
		walls[0].displayPInt();
	},
	block11Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});	
		walls.setHitMode('container', 'Arrow');
		spcs['spc4'].populate(P(100,100), V(300,200), 1, 600);
		this.tempChanger11 = new TempChanger({min:100, max:1100});
		
	},
	block15Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});	
		this.compArrow15 = new CompArrow({handle:'compyT', compMode:'adiabatic', bounds:{y:{min:30, max:235}}});
		this.arrowInit = new Arrow('init', [P(545,30), P(510, 30)], Col(255,255,0));
		this.arrowHalf = new Arrow('half', [P(545,235), P(510, 235)], Col(0,255,0));
	},
	block16Start: function() {
		walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});	
		this.compArrow15 = new CompArrow({handle:'compyT', compMode:'adiabatic', bounds:{y:{min:30, max:337.5}}});
		this.arrowInit = new Arrow('init', [P(545,235), P(510, 235)], Col(255,255,0));
		this.arrowHalf = new Arrow('half', [P(545,337.5), P(510, 337.5)], Col(0,255,0));
	},

	block10CleanUp: function(){
		this.cutSceneEnd();
	},
	block11Start: function(){
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container'], [{yMin:this.yMin, yMax: this.yMin}], [{yMin:this.yMin, yMax: this.yMin}]);
		this.borderStd({min:this.yMin});
		spcs['spc1'].populate(P(45,35), V(450, 350), 800, 300);
		spcs['spc3'].populate(P(45,35), V(450, 350), 600, 300);	
		this.compArrow = new CompArrow({wallInfo:'container'}, {mode:'isothermal', stops:false});
		this.forceInternal=0;
		this.numUpdates=0;
		this.readout.addEntry('pressure', 'Pressure:', 'atm', 0, 0, 1);
		this.readout.show();
		var wall = walls[0];
		this.trackIntPressureStart(wall.handle);
		var pList = this.data['pInt'+wall.handle];
		addListener(curLevel, 'data', 'recordPressure', 
			function(){
				this.readout.tick(pList[pList.length-1], 'pressure')
			},
			this);
			/*
		addListener(curLevel, 'data', 'recordPressure', 
			function(){
				var SAPInt = walls.surfArea()
				var newP = dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt);
				this.data.pInt.push(newP);
				this.readout.tick(newP, 'pressure')
			},
		this);
		*/
	},
	block11aStart: function(){
		this.halfY = 235
		this.arrowVolInit = new Arrow('init', [P(545, 30), P(510, 30)], Col(255,255,0), c).show();
		this.arrowVolHalf = new Arrow('half', [P(545, this.halfY), P(510, this.halfY)], Col(0,255,0), c).show();
	},
	block11aConditions: function(){
		if(fracDiff(walls[0][0].y, this.halfY)<.07){
			return {result:true}
		}else{
			return {result:false, alert:'Halve the volume!'}
		}
	},
	block11aCleanUp: function(){
		this.arrowVolInit.hide();
		this.arrowVolHalf.hide();		
		this.arrowVolInit = undefined;
		this.arrowVolHalf = undefined;
		
		//removeListenerByName(curLevel, 'update', 'drawVolArrows');
	},
	block11bStart: function(){
		this.halfY = 337;
		this.arrowVolInit = new Arrow('init', [P(545, 235), P(510, 235)], Col(255,255,0), c).show();
		this.arrowVolHalf = new Arrow('half', [P(545, this.halfY), P(510, this.halfY)], Col(0,255,0), c).show();
	},
	block11bConditions: function(){
		if(fracDiff(walls[0][0].y, this.halfY)<.07){
			return {result:true}
		}else{
			return {result:false, alert:'Halve the volume!'}
		}	
	},
	block11bCleanUp: function(){
		this.trackIntPressureStop(walls[0].handle);
		this.arrowVolInit.hide();
		this.arrowVolHalf.hide();		
		this.arrowVolInit = undefined;
		this.arrowVolHalf = undefined;
	},

	block11CleanUp: function(){
		walls['container'].removeBorder();
		removeListener(curLevel, 'data', 'recordPressure');
		this.readout.removeAllEntries();
		this.readout.hide();
		this.compArrow.remove();
		this.compArrow = undefined;
	},
	block12Start: function(){
		this.cutSceneStart("<p>Remember how we looked at the side length of a container, L<sub>x</sub> to find the time between collisions?  If you imagine that L<sub>x</sub> is the vertical dimension of the previous container, every time you halve L<sub>x</sub>, you halve the average time between collisions, doubling the number of wall impacts per time and thus doubling pressure.   From this inverse relationship, might we propose the following:</p><p><center><img src=img/ideal/orientPalphaV.gif></img></center></p><p>Similarly, might we say that if we double the number of molecules, we would double the number of collisions per time and so double pressure?  So we get</p><p><center><img src=img/ideal/orientPalphaN.gif></img></center></p><p>Would the above relationships be true if temperature were not held constant?  Try to relate your answer to frequency and momentum of collisions with the wall.</p>");
	},
	block12CleanUp: function(){
		this.cutSceneEnd();
	},
	block13Start: function(){
		this.cutSceneStart("<p>Alright, let's put it all together!</p>"+
		"<p>From combining impact frequency and speed, we got</p><center><img src=img/ideal/orientPalphaT.gif></img></center>"+
		"<p>By figuring out that if we halve the size, we double the number of collisions, we got</p><center><img src=img/ideal/orientPalphaV.gif></img></center>"+
		"<p>By saying that if we double the number of molecules, we double the number of collisions, we got</p><center><img src=img/ideal/orientPalphaN.gif></img></center>"+
		"<p>Combining, we get</p><center><img src=img/ideal/orientPalphaNTV.gif></img></center></p>"
		);
	},
	block13CleanUp: function(){
		this.cutSceneEnd();		
	},
	block14Start: function(){
		this.cutSceneStart("<p>If we multiply by the ideal gas constant, R, we can say</p><center><img src=img/ideal/orientPNRTV.gif></img></center>"+
			"<p>or</p>"+
			"<center><img src=img/ideal/orientPVNRT.gif></img></center>"+
			"<p>So we just developed the ideal gas law from a model of molecules being hard spheres that bounce around!  Yay!</p>"
			, 'outro');

	},
	block14CleanUp: function(){
		this.cutSceneEnd();

		showPrompt(undefined, this.prompts[curLevel.promptIdx]);		
	},


}
)