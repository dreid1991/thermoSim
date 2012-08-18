function cvcp(){
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
	this.imgPath = 'cvcp';
}
_.extend(cvcp.prototype, 
			LevelTools, 
{
	declarePrompts: function(){
		this.prompts=[
			{block:0,
				cutScene: true,
				text:'For an ideal monatomic gas, which of these is correct?  cv means heat capacity at constant volume, cp means heat capacity at constant pressure.',
				quiz:{	
					type:'multChoice', 
					options:
						[
						{optionText:"||EQ1|| and ||EQ3||", isCorrect: false},
						{optionText:"||EQ2|| and ||EQ3||", isCorrect: false},
						{optionText:"||EQ1|| and ||EQ4||", isCorrect: true},
						{optionText:"||EQ2|| and ||EQ5||", isCorrect: false}
					]
				},
			},
			{block:1,
				cutScene: true,
				text:"Indeed!  This means that is takes more energy to heat up a gas at constant pressure than one at constant volume.  Huh?  The gas is the same.  Why does it take different amounts of energy?</p><p>WE MUST FIND OUT!</p>",
			},
			{block:2,
				title:"Current step",
				text:"Okay, here’s a constant volume and a constant pressure container.  Both are adiabatic.  If you heat them both to a new temperature, How do the energies used compare?  ",
				quiz: {	
					type:'buttons',
					options:
						[{buttonId:'less', buttonText:'E<sub>C<sub>V</sub></sub>><E<sub>C<sub>P</sub></sub>', isCorrect:true},
						{buttonId:'equal', buttonText:'E<sub>C<sub>V</sub></sub>=E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"},
						{buttonId:'greater', buttonText:'E<sub>C<sub>V</sub></sub>&#60E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"}					
					]
				},
			},
			{block:2,
				title:"Current step",
				text:"Good.  Now try heating them up again and try to figure out <i>why</i> the constant pressure system takes more energy to heat up.  By the way, work.",
			},
			{block:3,
				cutScene: true,
				text:"So what’s the verdict?",
				quiz:{	
					type:'multChoice', 
					options:
						[
						{optionText:"Constant pressure heating takes more energy because the system must expand as it heats.", isCorrect: true},
						{optionText:"I'm a cabbage.", isCorrect: false},
						{optionText:"I really can't think of any.", isCorrect: false}
					]
				},
			},
			{block:4,
				text:"Good, so when we’re heating at constant volume, where does the energy go?",
				quiz:{	
					type:'multChoice', 
					options:
						[
						{optionText:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: false},
						{optionText:"To the molecules, to speed them up", isCorrect: true},
						{optionText:"To the surroundings through work", isCorrect: false}
					]
				},
			},
			{block:5,
				cutScene: true,
				text:"Yes, and we express this how?",
				quiz:{
					type:'multChoice', 
					options:
						[
						{optionText:"||EQ7||", isCorrect: false},
						{optionText:"||EQ6||", isCorrect: true},
						{optionText:"||EQ8||", isCorrect: false}
					]				
				},
			},
			{block:6,
				cutScene: true,
				text:"<p>Yes.</p><p>It takes some amount of energy to heat up one mole these molecules one degree kelvin.  That amount is C<sub>V</sub>.  To get the total energy change in a temperature change, we multiply that amount by the change in temperature and the number of moles.  Thus we get<p>||EQ6CE<p>Okay, now what about in the constant pressure case?  Where does the energy go then?</p>",
				quiz:{
					type:'multChoice', 
					options:
						[
						{optionText:"To the molecules, to speed them up.", isCorrect: false, message:"Yes, but doesn't the system expand as well?  That sounds like work."},
						{optionText:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: true},
						{optionText:"To the surroundings by expanding the system.", isCorrect: false, message:"But the system heats up!  You're increasing the molecules' kinetic energy.  Isn't that a place for the energy to go?"}
					]				
				},				
			},
			{block:7,
				cutScene: true,
				text:"So we’re putting energy into <i>two</i> things now!  So we know that </p>||EQ6aCE||<p> is the energy that goes into heating the system.  How could we express the energy that goes into expanding the system again constant pressure?</p>",
				quiz:{
					type:'multChoice', 
					options:
						[
						{optionText:"||EQ10||", isCorrect: false, message:"Wait, but at constant volume (there's no delta in front of the V), there's no work being done."},
						{optionText:"||EQ9||", isCorrect: true}
						
					]				
				},
			},
			{block:8,
				cutScene: true,
				text:"And if we put those two things together, we get...</p>||EQ11CE<p>OKAY.  We have our idea.  To heat under constant pressure, we have to expand the system, doing work.  This means that it will take more energy to heat something under constant pressure.   This means that C<sub>P</sub> is greater than C<sub>V</sub>.</p><p>Now watch this:</p><p>Since the definition of enthalpy is</p>||EQ12CE<p>doesn’t change in energy (above) really mean change in enthalpy?  If we rewrite the equation, we get</p>||EQ13CE<p>Then, from the ideal gas law, we know</p>||EQ14CE<p>"
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
	block2Start: function(){
		walls = WallHandler([[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], 'staticAdiabatic', ['left', 'right'], [undefined, {yMin:50, yMax:275}], undefined, [5,5]);
		this.borderStd({wallInfo:'left', min:50});
		this.borderStd({wallInfo:'right', min:50});
		spcs['spc1'].populate(P(45,200), V(200, 200), 350, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,200), V(200, 200), 250, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,200), V(200, 200), 350, 200, 'right', 'right');
		spcs['spc3'].populate(P(300,200), V(200, 200), 250, 200, 'right', 'right');	
		this.piston = new Piston('piston', 'right', {min:2,init:2, max:2}).trackPressure();
		this.heaterLeft = new Heater('heaterLeft', P(97,350), V(100,40), 0, {init:0, max:20}, 'sliderHeaterLeft', c);
		this.heaterRight = new Heater('heaterRight', P(352, 350), V(100,40), 0, {init:0, max:20}, 'sliderHeaterRight', c);
		
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