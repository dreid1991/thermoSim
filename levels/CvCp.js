LevelData = {	
	levelTitle: 'Heat capacities',
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 1.5, col: Col(16, 200, 200), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	
	mainSequence: [
		{//S0(p0,p1): q0 and q1, both cutscenes
			sceneData:undefined, 
			prompts:[
				{//p0, q0
					sceneData:undefined,
					cutScene:true,
					quiz:[
						{
							questionText:"<p>Today we're going to investigate heat capacities.  Using your own words, how would you explain the concept of a heat capacity to a high school senior?</p>",
							storeAs: 'foo1', 
							type:'text', 
							text:'Type your answer here.', 
							CWQuestionId: 27
							}, 
						]	
					},	 
				{//p1, q1
					sceneData: undefined, 
					cutScene: true, 
					quiz:[						
					{
						questionText: "<p>We'll start by heating a constant volume system.  It contains 0.5 moles of an ideal monotomic gas.  How much energy should heating this system by 100 K 'cost'?</p>",
						type: 'textSmall', 
						storeAs: 'foo2', 
						units: 'kJ', 
						text: '',
						CWQuestionId: 28
					},							
					 
					]
				}
			]
		}, 
		{//S1(p0,p1,p2): q2- constant volume heating, q3- cutscene constant volume, q4- constant pressure heating
			sceneData: {
				walls: [
					{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
				],
				dots: [	
					//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(60, 60), dims: V(200, 350), count: 500, temp:150, returnTo: 'wally1', tag: 'wally1'},
				],
				objs: [
					{type: 'Heater', attrs: {handle: 'heaterWally1', wallInfo: 'wally1', tempMax: 500, max: 2}}
				],			
				dataReadouts: [			
					{label: 'Heat: ', expr: 'q("wally1")', units: 'kJ', sigFigs: 2, handle: 'heating1', readout: 'mainReadout'},
					{label: 'Temp: ', expr: 'temp("wally1")', units: 'K', sigFigs: 1, handle: 'temperature1', readout: 'mainReadout'}, 												
				],
				triggers: [
					{handle: 'triggery1', expr: 'temp("wally1") >= 245', message: 'Heat the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt0'},
					{handle: 'at250', expr: 'temp("wally1") >= 245', satisfyCmmds: ['curLevel.at250 = true'], requiredFor: false},
					{handle: 'superCool', expr: 'temp("wally1") <= 140', satisfyCmmds: ['sendToCW("Constant volume system cooled below 150 K", 156)'], requiredFor: false},
					{handle: 'coolingBelow250', expr: 'temp("wally1") <= 235 && curLevel.at250', satisfyCmmds: ['sendToCW("Constant volume system raised to 250 K but then cooled again", 157)'], requiredFor: false},
					{handle: 'triggery2', expr: 'temp("wally1") <= 255', message: 'Cool the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt0'},
				]
					// triggers: [
							// {handle: 'heatcheck', expr: 'fracDiff(temp("wally1"), 250) < 0.05', message: 'Heat the system by 100 K', priorityUnsatisfied:1},
									// ],
			}, 
			prompts:[				
				{//p0, q2
					// sceneData: 
						// {
						// triggers: [
							// {handle: 'heatcheck', expr: 'fracDiff(temp("wally1"), 250) < 0.05', message: 'Heat the system by 100 K', priority:1, checkOn: 'conditions'},
									// ],
						// },											
					cutScene:false,
					resetId: 123,
					quiz:[
						{
							questionText: "Now let's perform an experiment.  You wrote that this heating would 'cost' get('foo2', 'string', 'noValue') kJ.  The system shown above contains our 0.5 moles of ideal monatomic gas.   You can add energy by using the slider to activate the heater.  Increase the temperature by 100 K. Note that you can also cool the system if its temperature increases too much.<p>How does your prediction for the heating amount compare to the experimental result? Explain.</p>",
							storeAs: 'foo3', 
							type:'text', 
							text:'Type your answer here.', 
							CWQuestionId: 29
						},
					],					
				},
				{//p1, q3
				cutScene: true, 
				quiz:[
						{
							questionText: "<p>Now we're going to look at heating in a constant pressure system. This means the volume will no longer be held constant. <p>If we increase its temperature by 100 K, how will the system's energy 'cost' compare to that of the constant volume system? Explain.</p>", 
							storeAs: 'foo4', 
							type:'text', 
							text:'Type your answer here.', 
							CWQuestionId: 30
						}, 
					]
				},
				{//p2, q4
					sceneData:
						{
						walls: [
								//{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
								{pts:[P(300,40), P(510,40), P(510,425), P(300,425)], handler:'staticAdiabatic', handle:'wally2', vol: 4.7, border: {type: 'open', yMin: 50}},
							],
						dots: [	
								//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally1'},
								//{type: 'ugly', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally1', tag: 'wally1'},
								{spcName: 'ugly', pos: P(310, 220), dims: V(200, 180), count: 500, temp:150, returnTo: 'wally2', tag: 'wally2'},
							],
						objs: [
								{type: 'Heater', attrs: {handle: 'heaterWally2', cleanUpWith: 'section', wallInfo: 'wally2', max: 2}},
								{type: 'Piston', attrs: {handle: 'pistony', cleanUpWith: 'section', wallInfo: 'wally2', makeSlider: false, init: 1.5}},								
							],
						dataReadouts: [								
								{label: 'Heat: ', expr: 'q("wally2")', units: 'kJ', sigFigs: 2, handle: 'heating2', readout: 'mainReadout'},
								{label: 'Temp: ', expr: 'tempSmooth("wally2")', units: 'K', sigFigs: 1, handle: 'temperature2', readout: 'mainReadout'},
								{label: 'pExt: ', expr: 'pExt("wally2")', units: 'bar', sigFigs: 2, handle: 'pressure2', readout: 'pistonPistonyLeft'},																
							],
						triggers: [
							{handle: 'triggery3', expr: 'temp("wally2") >= 238', message: 'Heat the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt2'},
							{handle: 'at250', expr: 'temp("wally2") >= 245 && turn > 25', satisfyCmmds: ['curLevel.isAt250 = true'], requiredFor: false},
							{handle: 'superCool', expr: 'temp("wally2") <= 135', satisfyCmmds: ['sendToCW("Constant pressure system cooled below 150 K", 158)'], requiredFor: false},
							{handle: 'coolingBelow250', expr: 'temp("wally2") <= 235 && curLevel.isAt250', satisfyCmmds: ['sendToCW("Constant pressure system raised to 250 K but then cooled again", 159)'], requiredFor: false},
							{handle: 'triggery4', expr: 'temp("wally2") <= 262', message: 'Cool the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt2'},
						],
						cmmds: [
							'curLevel.heaterHeaterWally1.disable()'
						],
					},
					cutScene:false,
					resetId: 124,
					quiz:[
						{
							questionText: "Here is the constant pressure version of the system filled with one mole of the ideal monatomic gas.  Heat the system by 100 K.  How does the value compare to the constant volume heating value of get('foo2', 'string', 'noValue') kJ?",
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
							CWQuestionId: 31
						}, 
					]
				}				
			]
		}, 
		{//S2(p0); q5- cutscene, constant pressure heating analysis of volume change and work 
			sceneData:undefined, 
			prompts:[
				{//p0, q5
				cutScene:true, 
				quiz:[						
					{
						questionText: "<p>The system had a constant external pressure of 3 bar, contained one mole of an ideal monatomic gas, and was heated by 100 K.</p>  Using the First Law of Thermodynamics, what should the change in system volume have been?<br>", 
						type: 'textSmall', 
						storeAs: 'foo5', 
						units: 'L', 
						text: '',
						CWQuestionId: 32
					},
					{
						type: 'textSmall', 
						preText: '<br>How much work did the system do on its surroundings?<br>',
						storeAs: 'foo6', 
						units: 'kJ', 
						text: '',
						CWQuestionId: 33
					},						 
					]
				}
			]	
		}, 
		{//S3(p0, p1); q6- constant pressure with work displayed for theoretical and experimental comparison, q7- synthesize Cv and Cp
			sceneData: 
				{
					walls: [
							//{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
							{pts:[P(300,40), P(510,40), P(510,425), P(300,425)], handler:'staticAdiabatic', handle:'wally3', vol: 4.7, border: {type: 'open', yMin: 50}},
							
					],
					dots: [	
							//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally1'},
							//{type: 'ugly', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally1', tag: 'wally1'},
							{spcName: 'ugly', pos: P(310, 200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally3', tag: 'wally3'},
					],
					objs: [
							{type: 'Heater', attrs: {handle: 'heaterWally3', cleanUpWith: 'section', wallInfo: 'wally3'}},
							{type: 'Piston', attrs: {handle: 'pistony3', cleanUpWith: 'section', wallInfo: 'wally3', makeSlider: false, init: 1.5}},
					],
					dataReadouts: [							
							{label: 'Heat: ', expr: 'q("wally3")', units: 'kJ', sigFigs: 2, handle: 'heating3', readout: 'mainReadout'},
							{label: 'Temp: ', expr: 'temp("wally3")', units: 'K', sigFigs: 2, handle: 'temperature3', readout: 'mainReadout'}, 
							{label: 'pExt: ', expr: 'pExt("wally3")', units: 'bar', sigFigs: 2, handle: 'external pressure', readout: 'pistonPistony3Left'},
							{label: 'work: ', expr: 'work("wally3")', units: 'kJ', sigFigs: 2, handle: 'work', readout: 'mainReadout'},
																
					],
					triggers: [
						{handle: 'triggery5', expr: 'temp("wally3") >= 238', message: 'Heat the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt0'},
						{handle: 'triggery6', expr: 'temp("wally3") <= 262', message: 'Cool the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt0'},
					]
			},			
			prompts: [					
						{//p0, q6
						resetId: 125,
						quiz:[
								{		
									questionText: "Here's the same system with the work done displayed.  Increase the temperature by 100 K.  You predicted that get('foo5', 'string', 'noValue') kJ of work would be done.  How does this compare to the experimental result?",
									storeAs: 'foo7', 
									type:'text', 
									text:'Type your answer here.', 
									CWQuestionId: 34
								},
							]
						}, 
						{//p1, q7
							resetId: 126,
							sceneData: {
								cmmds: [
									'curLevel.heaterHeaterWally3.disable()'
								]
							},
							quiz:[
								{
									questionText: "We've established that when you expand at constant pressure, the system does work on its surroundings.  Can you use this idea to explain why a system's heat capacity is higher at constant pressure than at constant volume?",
									storeAs: 'foo8', 
									type:'text', 
									text:'Type your answer here.', 
									CWQuestionId: 35
								},
							]	
						}
					]
		}, 
		{//S6(p0); q8- cutscene question asking to relate quantitative to qualitative understanding
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				quiz:[
						{
							questionText: "<p>The heat capacity per mole of gas can be described as the energy added through heat per temperature change, or ##\\frac{dq}{dT} ##.</p><p> We know that the constant volume heat capacity of an ideal monatomic gas is ##\\frac{3}{2}R##. </p><p>From the first law, solve for what the ##\\frac{dq}{dT}##, or heat capacity, would be for this system at constant pressure. </p><p>How does the result relate to your conceptual understanding of how constant pressure systems behave?  Explain.</p>", 
							storeAs: 'foo9', 
							type:'text', 
							text:'Type your answer here.', 
							CWQuestionId: 36
						},
					]
				}
			]
		},
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					title: '',
					text: 'You have completed the simulation.',
					quiz: [
						{
							type: 'multChoice',
							CWQuestionId: 106,
							questionText: "<p>By selecting the button below and clicking 'Submit' you will exit the simulation. If you are not finished or would like to return to a previous page, click 'back' to return to the simulation.",
							options:[
								{text:"I would like to exit the simulation", correct: true, message:"Select the button labeled 'I would like to exit the simulation'", CWAnswerId: 17},
							]
						},
					]
				},
				{
					sceneData: {
						cmmds: [
							'location.reload()'
						]
					}	
				}
			]
		}
	]

}