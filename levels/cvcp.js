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
				/*
				cutScene: true,
				text:'For an ideal monatomic gas, which of these is correct?  C<sub>V</sub> means heat capacity at constant volume, C<sub>P</sub> means heat capacity at constant pressure.',
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
				*/
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
						[{buttonId:'less', text:'E<sub>C<sub>V</sub></sub>>E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"},
						{buttonId:'equal', text:'E<sub>C<sub>V</sub></sub>=E<sub>C<sub>P</sub></sub>', isCorrect:false, message:"No it's not"},
						{buttonId:'greater', text:'E<sub>C<sub>V</sub></sub>&#60E<sub>C<sub>P</sub></sub>', isCorrect:true}					
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
						{text:"Constant pressure heating takes more energy because the system must expand as it heats.", isCorrect: true},
						{text:"I'm a cabbage.", isCorrect: false},
						{text:"I really can't think of any.", isCorrect: false}
					]
				},
			},
			{block:4,
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
			{block:5,
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
			{block:6,
				cutScene: true,
				text:"<p>Yes.</p><p>It takes some amount of energy to heat up one mole these molecules one degree kelvin.  That amount is C<sub>V</sub>.  To get the total energy change in a temperature change, we multiply that amount by the change in temperature and the number of moles.  Thus we get<p>||EQ6CE<p>Okay, now what about in the constant pressure case?  Where does the energy go then?</p>",
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
			{block:7,
				cutScene: true,
				text:"So we’re putting energy into <i>two</i> things now!  So we know that </p>||EQ6aCE||<p> is the energy that goes into heating the system.  How could we express the energy that goes into expanding the system again constant pressure?</p>",
				quiz:{
					type:'multChoice', 
					options:
						[
						{text:"||EQ10||", isCorrect: false, message:"Wait, but at constant volume (there's no delta in front of the V), there's no work being done."},
						{text:"||EQ9||", isCorrect: true}
						
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
	//testing fill
	block0Start: function(){
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(300,100), V(200, 200), 350, 185);
		spcs['spc3'].populate(P(300,100), V(200, 200), 250, 185);		
		this.pool = new Pool();
	},
	block2Start: function(){
		var self = this;
		this.readout.show();
		recordDataStart('tLeft', this.dataHandler.tempFunc({tag:'left'}), this);
		recordDataStart('tRight', this.dataHandler.tempFunc({tag:'right'}), this);
		walls = WallHandler([[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], 'staticAdiabatic', ['left', 'right'], [undefined, {yMin:50, yMax:275}], undefined, [5,5]);
		this.borderStd({wallInfo:'left', min:50});
		this.borderStd({wallInfo:'right', min:50});
		spcs['spc1'].populate(P(45,200), V(200, 200), 350, 185, 'left', 'left');
		spcs['spc3'].populate(P(45,200), V(200, 200), 250, 185, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,200), V(200, 200), 350, 185, 'right', 'right');
		spcs['spc3'].populate(P(300,200), V(200, 200), 250, 185, 'right', 'right');	
		this.piston = new Piston({wallInfo:'right', min:2, init:2, max:2}).trackPressureStart();
		this.heaterLeft = new Heater({handle:'heaterLeft', wallInfo:'left', slider:'sliderHeaterLeft'});
		this.heaterRight = new Heater({handle:'heaterRight', wallInfo:'right', slider:'sliderHeaterRight'});
		
		this.trackTempStart('tleft', 'Temp:', this.data.tLeft, 0);
		//this.trackStart('eLeft', 'Energy in:', function(){return self.heaterLeft.eAdded}, 1, 'kJ');
		
		this.trackTempStart('tRight', 'Temp:', this.data.tRight, 0);
		//this.trackStart('eRight', 'Energy in:', function(){return self.heaterRight.eAdded}, 1, 'kJ');
	
	},
	block2Conditions: function(){
		return {result:true};
	},
	block2CleanUp: function(){
		this.heaterLeft.remove();
		this.heaterRight.remove();
		this.trackTempStop('tLeft');
		this.trackTempStop('tRight');
		this.trackStop('eLeft');
		this.trackStop('eRight');
		this.piston.remove();
	},


}
)