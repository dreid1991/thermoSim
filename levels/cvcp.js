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
	init: function() {
		$('#mainHeader').text('c<sub>V</sub> vs. c<sub>P</sub');
		showPrompt(0, 0, true);
	},
	declareBlocks: function(){
		this.blocks=[
			{//B0
				setup:undefined,
				prompts:[
					{//P0
						setup:undefined,
						cutScene:true,
						text:"<p>It's time to look at heat capacities!</p><p>For an ideal monatomic gas, which of these is correct?  C<sub>V</sub> means heat capacity at constant volume, C<sub>P</sub> means heat capacity at constant pressure.",
						quiz:[
							{	
								type:'multChoice', 
								options:
									[
									{text:"||EQ1|| and ||EQ3||", isCorrect: false},
									{text:"||EQ2|| and ||EQ3||", isCorrect: false},
									{text:"||EQ1|| and ||EQ4||", isCorrect: true},
									{text:"||EQ2|| and ||EQ5||", isCorrect: false}
								]
							}
						],
					},
					{//P1
						setup:undefined,
						cutScene:true,
						text:"Right.  This means that is takes more energy to heat up the same gas at at constant volume than at constant pressure.  Absorbs energy the same way.  The difference comes from the conditions under which the gas is heated, and that's what we're going to investigate.  Shall we?"
					}
				]
			},
			{//B1
				setup:
					function() {
						currentSetupMode = 'block';
						walls = WallHandler({pts:[[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], handlers:'staticAdiabatic', handles:['left', 'right'], bounds:[undefined, {yMin:50, yMax:275}], vols:[5,5]});
						this.borderStd({wallInfo:'left', min:50});
						this.borderStd({wallInfo:'right', min:50});
						spcs['spc1'].populate(P(45,200), V(200, 200), 350, 185, 'left', 'left');
						spcs['spc3'].populate(P(45,200), V(200, 200), 250, 185, 'left', 'left');	
						
						spcs['spc1'].populate(P(300,200), V(200, 200), 350, 185, 'right', 'right');
						spcs['spc3'].populate(P(300,200), V(200, 200), 250, 185, 'right', 'right');	
						
						this.leftTemp400 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:400, alertUnsatisfied:"Bring the left container to 400 K", priorityUnsatisfied:1, checkOn:'conditions'});
						this.rightTemp400 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:400, alertUnsatisfied:"Bring the right container to 400 K", priorityUnsatisfied:1, checkOn:'conditions'});
						
						
						this.piston = new Piston({wallInfo:'right', min:2, init:2, max:2, makeSlider:false})
						this.heaterLeft = new Heater({handle:'heaterLeft', wallInfo:'left'});
						this.heaterRight = new Heater({handle:'heaterRight', wallInfo:'right'});
						walls[1].setDefaultReadout(this.readout);
						walls[0].displayTemp().displayQ();
						walls[1].displayTemp().displayQ();
					},
				prompts:[
					{//P0
						setup:undefined,
						title:"Current step",
						text:"Okay, here’s a constant volume and a constant pressure container.  Both are adiabatic.  Heat the two containers to 400 K.  How do the energies used compare?",
						quiz:[
							{	
							type:'text',
							text:'Type your answer here.',
							},
						]
					}
				]

			},
			{//B2
				setup:undefined,
				prompts:[
					{//P0
						setup:undefined,
						cutScene:true,
						text:"When we’re heating at constant volume, where does the energy go?",
						quiz:[
							{	
								type:'multChoice', 
								options:
									[
									{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: false},
									{text:"To the molecules, to speed them up", isCorrect: true},
									{text:"To the surroundings through work", isCorrect: false}
								]
							},
						]
					},
					{//P1
						setup:undefined,
						cutScene:true,
						text:"Good, and we express this how?"
						quiz:[
							{
								type:'multChoice', 
								options:
									[
									{text:"||EQ7||", isCorrect: false},
									{text:"||EQ6||", isCorrect: true},
									{text:"||EQ8||", isCorrect: false}
								]				
							},		
						]
					},
					{//P2
						setup:undefined,
						cutScene:true,
						text:"<p>Yes.</p><p>It takes some amount of energy to heat up one mole these molecules one degree kelvin.  That amount is the heat capacity c<sub>V</sub>.  To get the total energy change in a temperature change, we multiply that amount by the change in temperature and the number of moles.  Thus we get<p>||EQ6CE<p>Okay, now what about in the constant pressure case?  Where does the energy go then?</p>",
						quiz:[
							{
								type:'multChoice', 
								options:
									[
									{text:"To the molecules, to speed them up.", isCorrect: false, message:"Yes, but doesn't the system expand as well?  That sounds like work."},
									{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: true},
									{text:"To the surroundings by expanding the system.", isCorrect: false, message:"But the system heats up!  You're increasing the molecules' kinetic energy.  Isn't that a place for the energy to go?"}
								]				
							}
						]
					},
					{//P3
						setup:undefined,
						cutScene:true,
						text:"So we’re putting energy into <i>two</i> places now!  So we know that </p>||EQ6aCE<p> is the energy that goes into heating the system.  How could we express the energy that goes into expanding the system again constant pressure?</p>",
						quiz:[
							{
								type:'multChoice', 
								options:
									[
									{text:"||EQ10||", isCorrect: false, message:"Wait, but at constant volume (there's no delta in front of the V), there's no work being done."},
									{text:"||EQ9||", isCorrect: true}
									
								]				
							},
						]
					}
				]
			},
			{//B3
				setup: function() {
					curLevel.blocks[1].setup();
				}
				prompts:[
					{//P0
						setup:undefined,
						text:"Try heating the two systems to 400 K once more.  This time consider how the work done affects the amount of energy used in the heating.",
						quiz:[
							{	
							type:'text',
							text:'Type your answer here.',
							},
						]
					}
				]
			},
			{//B4
				setup:undefined,
				prompts:[
					{//P0
						cutScene:true,
						text:"<p>So the system heated under constant pressure took more energy per temperature change because the system does work on its surroundings while expanding to maintain constant pressure. </p> <p>If we combine adding energy to the molecules to speed them up and the energy added to the surroundings, we get </p>||EQ11CE<p>With a bit of math, we can relate this to a heat capacity.<p>From the ideal gas law, we know ||EQ12CE Substituting in, we get ||EQ13CE  "
					},
					{//P1
						cutScene:true,
						text: "||EQ13CENow we know that a heat capacity is a change in energy per temperature per mole whose temperature you're changing, so to get heat capacity from energy, we divide by nT.  This gives us ||EQ14CE There we go!  Constant pressure for an ideal gas is heat capacity is R greater than constant volume heat capacity because of the work done when changing volume.</p><p>Neat things to to think about:<ul><li>We showed that C<sub>P</sub> was greater than C<sub>V</sub> for heating.  Can you show that it is for cooling as well?  Better yet, draw where the energy goes.</li><li>In the previous page's first equation, we really just defined a change in enthalpy.  If a change in enthlpy is a change in internal energy plus some work done, what is enthalpy?  Hint: Replace change with total.",
					}
				]
			}
		]
	}





}
)