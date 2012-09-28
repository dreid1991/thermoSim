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
		$('#mainHeader').html('c<sub>V</sub> vs. c<sub>P</sub');
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
						text:"<p>It's time to look at heat capacities!</p><p>For an ideal monatomic gas, which of these is correct?  c<sub>V</sub> means heat capacity at constant volume, c<sub>P</sub> means heat capacity at constant pressure.",
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
						text:"<p>Right.</p><p>This means that is takes more energy to heat up the same gas at constant pressure than at constant volume.  Let's investigate these processes to find out why this is.</p>"
					}
				]
			},
			{//B1
				setup:
					function() {
						currentSetupType = 'block';
						walls = WallHandler({pts:[[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], handlers:'staticAdiabatic', handles:['left', 'right'], bounds:[undefined, {yMin:50, yMax:275}], vols:[5,5]});
						this.borderStd({wallInfo:'left', min:50});
						this.borderStd({wallInfo:'right', min:50});
						spcs['spc1'].populate(P(45,200), V(200, 200), 350, 185, 'left', 'left');
						spcs['spc3'].populate(P(45,200), V(200, 200), 250, 185, 'left', 'left');	
						
						spcs['spc1'].populate(P(300,200), V(200, 200), 350, 185, 'right', 'right');
						spcs['spc3'].populate(P(300,200), V(200, 200), 250, 185, 'right', 'right');	
						
						
						this.piston = new Piston({wallInfo:'right', min:2, init:2, max:2, makeSlider:false})
						this.heaterLeft = new Heater({handle:'heaterLeft', wallInfo:'left'});
						this.heaterRight = new Heater({handle:'heaterRight', wallInfo:'right'});
						walls[1].displayPExt();
						walls[1].setDefaultReadout(this.readout);
						walls[0].displayTemp().displayQ();
						walls[1].displayTemp().displayQ();
					},
				prompts:[
					{//P0
						setup: 
							function(){
								currentSetupType = 'prompt1';
								this.leftTemp250 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the left container to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
								this.rightTemp250 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the right container to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
							},
						title:"Current step",
						text:"Okay, here’s a constant volume and a constant pressure container filled with an ideal gas.  Both are adiabatic.  Heat the two containers to 250 K.  How do the energies used compare?",
						quiz:[
							{	
							type:'text',
							text:'Type your answer here.',
							},
						]
					},
					{
						setup:undefined,
						text:"<p>It took 0.5 kJ to bring to 250K while the constant pressure container took 0.8 kJ.</p>Do you have any theories about why that is?<br>",
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
				setup:
					function() {
						this.blocks[1].setup.apply(this);
						walls[1].setDefaultReadout(this.piston.readout);
						walls[1].displayWork();
						
					},
				prompts:[
					{//P0
						setup:
							function() {
								this.leftTemp250 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the left container to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
								this.rightTemp250 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the right container to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});							
							
							},
						text:"Try heating the containers to 250 K again.  This time the work done by the constant pressure container is displayed.  Is your theory consistant with the data from this heating?",
						quiz:[
							{	
							type:'text',
							text:'Type your answer here.',
							},
						]
					}
				]
			},
			{//B3
				setup:undefined,
				prompts:[
					{
						setup:undefined,
						cutScene:true,
						text:"<p>Here's the data from the previous experiment:</p><p><table style='color:white;' border='1' bordercolor=white><tr><td>Q c<sub>V</sub></td><td>0.5 kJ</td></tr><tr><td>Q c<sub>P</sub></td><td>0.8 kJ</td></tr><tr><td>W (on sys) c<sub>P</sub></td><td>-0.3 kJ</td></tr></table></p><p>From your theory and the data, try to build an equation to that relates the energy added during the constant pressure and constant volume heatings.",
						quiz:[
							{	
							type:'text',
							text:'Type your equation here.',
							},
						]
					}
				]
				
			},
			{//B4
				setup:undefined,
				prompts:[
					{
						setup:undefined,
						cutScene:true,
						text:"<p>From that data, we can say</p>||EQ16CE<p>The idea is that in a constant pressure, the energy goes to heating up the molecules <i>and</i> to the surroundings as the system expands.  Note that we changed to work done <i>by</i> the system, not on.</p><p>Substituting in from the first law, we get</p>||EQ11CE<p>From the ideal gas law, we know</p>||EQ12CE<p>Substituting in, we get</p>||EQ13CE<p>Continued on next page.</p>",
					},
					{
						setup:undefined,
						cutScene:true,
						text:"||EQ13CE<p>Now a heat capacity is the amount of energy per mole per degree temperature change.  We can express that as follows</p>||EQ17CE<p>If we divide the top equation by nT, we get</p>||EQ14CE<p>There.  We've built up the idea that constant pressure heat capacity is greater that constant volume because of the work done while expanding to maintain constant pressure."
					}
					
				]
			}
			/*
				{//B2
				setup:undefined,
				prompts:[
					{//P0
						setup:undefined,
						cutScene:true,
						text:"<p>Right, the constant pressure heating took more energy.  To figure out why, we need to think about where the energy added by the heater goes.</p><p>A change in temperature is just a change in the kinetic energy of the molecules.</p><p>In the constant volume heating, where did the energy added by the heater go?</p>",
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
						text:"<p>Under constant volume, all of the energy added by the heater was transfered to the molecules, leading to a temperature increase. </p><p> How can we express this thought in an equation?</p>",
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
						text:"<p>Yes.</p><p>It takes some amount of energy to heat up one mole these molecules one degree kelvin.  Under constant volume, that amount is the heat capacity c<sub>V</sub>.  To get the total energy change in a temperature change, we multiply that heat capacity by the change in temperature and the number of moles.  Thus we get<p>||EQ6CE<p>In the constant pressure case, the system was expanding against a constant external pressure.  Where does this tell you that the energy added by the heater goes?",
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
						text:"So we’re putting energy into <i>two</i> places now!  We put </p>||EQ6aCE<p> into speeding up the molecules.  Which of these expresses the energy expended by expanding against contstant pressure?</p>",
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
					},

				]
			},
			{//B3
				setup: function() {
					this.blocks[1].setup.apply(this);
				},
				prompts:[
					{//P0
						setup:undefined,
						text:"That's right, so under constant pressure, energy goes into speeding up the molecules <i>and</i> into expanding the system, whereas in a constant volume heating, energy only goes into speeding up the molecules.  Try heating the two systems to 250 K once more.  How does work done affect the amount of energy needed to heat the them?",
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
						text:"<p>Now to express this idea mathematically, we can say</p>||EQ11CE<p>From the ideal gas law, we know</p>||EQ12CE<p>Substituting in, we get</p>||EQ13CE",
						//text:"<p>So the system heated under constant pressure took more energy per temperature change because the system does work on its surroundings while expanding to maintain constant pressure. </p> <p>If we combine adding energy to the molecules to speed them up and the energy added to the surroundings, we get </p>||EQ11CE<p>With a bit of math, we can relate this to a heat capacity.<p>From the ideal gas law, we know ||EQ12CE Substituting in, we get ||EQ13CE  "
					},
					{//P1
						cutScene:true,
						text: "||EQ13CENow we know that a heat capacity is a change in energy per temperature per mole whose temperature you're changing, so to get heat capacity from energy, we divide by nT.  This gives us ||EQ14CE There we go!  Constant pressure for an ideal gas is heat capacity is R greater than constant volume heat capacity because of the work done when changing volume.</p><p>Neat things to to think about:<ul><li>We showed that C<sub>P</sub> was greater than C<sub>V</sub> for heating.  Can you show that it is for cooling as well?  Better yet, draw where the energy goes.</li><li>In the previous page's first equation, we really just defined a change in enthalpy.  If a change in enthlpy is a change in internal energy plus some work done, what is enthalpy?  Hint: Replace change with total.",
					}
				]
			}
		*/
		]
	}





}
)