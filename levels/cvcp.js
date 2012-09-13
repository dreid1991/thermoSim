function cvcp(){
	this.setStds();
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(cvcp.prototype, 
			LevelTools, 
{
	declarePrompts: function(){
		this.prompts=[
			{block:0,
				
				cutScene: true,
				text:'<p>Hold still, this will only take a minute.</p><p>For an ideal monatomic gas, which of these is correct?  C<sub>V</sub> means heat capacity at constant volume, C<sub>P</sub> means heat capacity at constant pressure.',
				quiz:{	
					type:'multChoice', 
					options:
						[
						{text:"||EQ1|| and ||EQ3||", isCorrect: false},
						{text:"||EQ2|| and ||EQ3||", isCorrect: false},
						{text:"||EQ1|| and ||EQ4||", isCorrect: true},
						{text:"||EQ2|| and ||EQ5||", isCorrect: false}
					]
				},
				
			},
			{block:1,
				cutScene: true,
				text:"Indeed!  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why does it take different amounts of energy?</p><p>WE MUST FIND OUT!</p>",
			},
			{block:2,
				title:"Current step",
				text:"Okay, here’s a constant volume and a constant pressure container.  Both are adiabatic.  If you heat them both to the same new temperature, How do the energies used compare?  ",
				quiz: {	
					type:'buttons',
					options:
						[{buttonId:'less', text:'E<sub>C<sub>V</sub></sub>>E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"},
						{buttonId:'equal', text:'E<sub>C<sub>V</sub></sub>=E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"},
						{buttonId:'greater', text:'E<sub>C<sub>V</sub></sub>&#60E<sub>C<sub>P</sub></sub>', isCorrect:true}					
					]
				},
			},
			{block:3,
				title:"Current step",
				text:"Good.  Now try heating them up again and try to figure out <i>why</i> the constant pressure system takes more energy to heat up.  By the way, work.",
			},
			{block:4,
				cutScene: true,
				text:"So what’s the verdict?",
				quiz:{	
					type:'multChoice', 
					options:
						[
						{text:"Constant pressure heating takes more energy because the system must expand as it heats.", isCorrect: true},
						{text:"I'm a cabbage.", isCorrect: false},
						{text:"I really can't think of any.", isCorrect: false}
					]
				},
			},
			{block:5,
				cutScene:true,
				text:"Good, so when we’re heating at constant volume, where does the energy go?",
				quiz:{	
					type:'multChoice', 
					options:
						[
						{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: false},
						{text:"To the molecules, to speed them up", isCorrect: true},
						{text:"To the surroundings through work", isCorrect: false}
					]
				},
			},
			{block:6,
				cutScene: true,
				text:"Yes, and we express this how?",
				quiz:{
					type:'multChoice', 
					options:
						[
						{text:"||EQ7||", isCorrect: false},
						{text:"||EQ6||", isCorrect: true},
						{text:"||EQ8||", isCorrect: false}
					]				
				},
			},
			{block:7,
				cutScene: true,
				text:"<p>Yes.</p><p>It takes some amount of energy to heat up one mole these molecules one degree kelvin.  That amount is the heat capacity C<sub>V</sub>.  To get the total energy change in a temperature change, we multiply that amount by the change in temperature and the number of moles.  Thus we get<p>||EQ6CE<p>Okay, now what about in the constant pressure case?  Where does the energy go then?</p>",
				quiz:{
					type:'multChoice', 
					options:
						[
						{text:"To the molecules, to speed them up.", isCorrect: false, message:"Yes, but doesn't the system expand as well?  That sounds like work."},
						{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: true},
						{text:"To the surroundings by expanding the system.", isCorrect: false, message:"But the system heats up!  You're increasing the molecules' kinetic energy.  Isn't that a place for the energy to go?"}
					]				
				},				
			},
			{block:8,
				cutScene: true,
				text:"So we’re putting energy into <i>two</i> things now!  So we know that </p>||EQ6aCE<p> is the energy that goes into heating the system.  How could we express the energy that goes into expanding the system again constant pressure?</p>",
				quiz:{
					type:'multChoice', 
					options:
						[
						{text:"||EQ10||", isCorrect: false, message:"Wait, but at constant volume (there's no delta in front of the V), there's no work being done."},
						{text:"||EQ9||", isCorrect: true}
						
					]				
				},
			},
			{block:9,
				cutScene: true,
				text:"And if we put those two things together, we get...</p>||EQ11CE<p>OKAY.  We have our idea.  To heat under constant pressure, we have to expand the system, doing work.  This means that it will take more energy to heat something under constant pressure.   This means that C<sub>P</sub> is greater than C<sub>V</sub>.</p><p>Now watch this:</p><p>From the ideal gas law, we know ||EQ12CE Substituting in, we get ||EQ13CE  "
			},
			{block:10,
				cutScene: true,
				text: "||EQ13CENow we know that a heat capacity is a change in energy per temperate per amout of stuff whose temperature you're changing, so to get heat capacity from energy, we divide by nT.  This gives us ||EQ14CE So there we go!  Constant pressure heat capacity is R greater than constant volume heat capacity because of the work done when changing volume.</p><p>Neat things to to think about:<ul><li>We showed that C<sub>P</sub> was greater than C<sub>V</sub> for expanding.  Can you show that it is for compressing as well?  Better yet, draw where the energy goes.</li><li>In the previous page's first equation, we really just defined a change in enthalpy.  If a change in enthlpy is a change in internal energy plus some change in work energy, what is enthalpy?  Hint: Replace change with total.",
			}
		]
		store('prompts', this.prompts);
	}, 
	init: function(){
		$('#mainHeader').text('Heat capacities');
		nextPrompt();
	},

	block2Start: function(){
		var self = this;
		walls = WallHandler({pts:[[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], handlers:'staticAdiabatic', handles:['left', 'right'], bounds:[undefined, {yMin:50, yMax:275}], vols:[5,5]});
		this.borderStd({wallInfo:'left', min:50});
		this.borderStd({wallInfo:'right', min:50});
		spcs['spc1'].populate(P(45,200), V(200, 200), 350, 185, 'left', 'left');
		spcs['spc3'].populate(P(45,200), V(200, 200), 250, 185, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,200), V(200, 200), 350, 185, 'right', 'right');
		spcs['spc3'].populate(P(300,200), V(200, 200), 250, 185, 'right', 'right');	
		
		this.leftChanged = new StateListener({dataList:walls[0].data.t, is:'greaterThan', targetVal:225, alertUnsatisfied:"Heat up the left container more!", priorityUnsatisfied:1, checkOn:'conditions'});
		this.rightChanged = new StateListener({dataList:walls[1].data.t, is:'greaterThan', targetVal:225, alertUnsatisfied:"Heat up the right container more!", priorityUnsatisfied:1, checkOn:'conditions'});
		this.tempsEqual = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:walls[1].data.t, alertUnsatisfied:"Set the temperatures equal!", checkOn:'conditions'});
		
		this.piston = new Piston({wallInfo:'right', min:2, init:2, max:2, makeSlider:false})
		this.heaterLeft = new Heater({handle:'heaterLeft', wallInfo:'left'});
		this.heaterRight = new Heater({handle:'heaterRight', wallInfo:'right'});
		walls[1].setDefaultReadout(this.readout);
		walls[0].displayTemp().displayQ();
		walls[1].displayTemp().displayQ();
	},
	block3Start: function(){
		this.block2Start();
	},



}
)