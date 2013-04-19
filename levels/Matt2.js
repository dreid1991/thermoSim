LevelData = {	
	levelTitle: 'Heat capacity behaviors',
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 1.5, col: Col(16, 200, 200), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	
	mainSequence: [
		// {//S0(p0,p1): q0 and q1, both cutscenes
			// sceneData:undefined, 
			// prompts:[
				// {//p0, q0
					// sceneData:undefined,
					// cutScene:true,
					// text:"<p>Today we're going to investigate heat capacities.  Using your own words, how would you explain heat capacity to a high school senior?</p>",
					// quiz:[
						// {
							// storeAs: 'foo1', 
							// type:'text', 
							// text:'Type your answer here.', 
							// }, 
						// ]	
					// },	 
				// {//p1, q1
					// sceneData: undefined, 
					// cutScene: true, 
					// text: "<p>We'll start by heating a constant volume system.  It contains 1 mole of an ideal monotomic gas.  How much energy should this heating 'cost'?</p>",
					// quiz:[						
					// {
						// type: 'textSmall', 
						// storeAs: 'foo2', 
						// units: 'kJ', 
						// text: ''
					// },							
					 
					// ]
				// }
			// ]
		// }, 
/*
		{//S1(p0,p1,p2): q2- constant volume heating, q3- cutscene constant volume, q4- constant pressure heating
			sceneData: {
				walls: [
					{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
				],
				dots: [	
					//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(50, 50), dims: V(200, 350), count: 1000, temp:150, returnTo: 'wally1', tag: 'wally1'},
				],
				objs: [
					{type: 'Heater', attrs: {handle: 'heaterWally1', wallInfo: 'wally1', tempMax: 500, max: 5}},	
				],			
				dataReadouts: [
					//{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutRightPiston'},
					//{wallInfo: 'wally', data: 'vol', readout: 'pistonReadoutRightPiston'},
					{label: 'Heat: ', expr: 'q("wally1")', units: 'kJ', sigFigs: 2, handle: 'heating1', readout: 'mainReadout'},
					{label: 'Temp: ', expr: 'temp("wally1")', units: 'K', sigFigs: 1, handle: 'temperature1', readout: 'mainReadout'}, 
					//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
				]
					// triggers: [
							// {handle: 'heatcheck', expr: 'fracDiff(temp("wally1"), 250) < 0.05', message: 'Heat the system by 100 K', priorityUnsatisfied:1},
									// ],
			}, 
			prompts:[				
				{//p0, q2
					sceneData: 
						{
						triggers: [
							{handle: 'heatcheck', expr: 'fracDiff(temp("wally1"), 250) < 0.05', message: 'Heat the system by 100 K', priority:1, checkOn: 'conditions'},
									],
						},											
					cutScene:false,
					text: "Now let's perform an experiment.  You wrote that this heating would 'cost' get('foo20', 'string', 'noValue') kJ.  The system shown above contains our one mole of ideal monatomic gas.   You can add energy by using the slider to activate the heater.  Increase the temperature by 100 K. Note that you can cool the system if its temperature increases too much.<p>How does your prediction for the heating amount compare to the experimental result? Explain.</p>",
					quiz:[
						{
							storeAs: 'foo3', 
							type:'text', 
							text:'Type your answer here.', 
						},
					],					
				},
				{//p1, q3
				cutScene: true, 
				text: "<p>Now we're going to look at heating in a constant pressure system. This means the volume is no longer constant. If we increase its temperature by 100 K, how do you think the energy 'cost' will compare to heating the constant volume system?  Explain.</p>", 
				quiz:[
						{
							storeAs: 'foo4', 
							type:'text', 
							text:'Type your answer here.', 
						}, 
					]
				},
				{//p2, q4
					sceneData:
						{
						walls: [
								//{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
								{pts:[P(300,40), P(510,40), P(510,425), P(300,425)], handler:'staticAdiabatic', handle:'wally2', vol: 5, border: {type: 'open', yMin: 50}},
							],
						dots: [	
								//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally1'},
								//{type: 'ugly', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally1', tag: 'wally1'},
								{spcName: 'ugly', pos: P(310, 200), dims: V(200, 200), count: 1000, temp:150, returnTo: 'wally2', tag: 'wally2'},
							],
						objs: [
								{type: 'Heater', attrs: {handle: 'heaterWally2', cleanUpWith: 'section', wallInfo: 'wally2'}},
								{type: 'Piston', attrs: {handle: 'pistony', cleanUpWith: 'section', wallInfo: 'wally2', makeSlider: false, init: 3}},								
							],
						dataReadouts: [
								//{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutRightPiston'},
								//{wallInfo: 'wally', data: 'vol', readout: 'pistonReadoutRightPiston'},
								{label: 'Heat: ', expr: 'q("wally2")', units: 'kJ', sigFigs: 2, handle: 'heating2', readout: 'mainReadout'},
								{label: 'Temp: ', expr: 'temp("wally2")', units: 'K', sigFigs: 1, handle: 'temperature2', readout: 'mainReadout'},
								{label: 'pExt: ', expr: 'pExt("wally2")', units: 'bar', sigFigs: 2, handle: 'pressure2', readout: 'pistonReadoutPistony'},
								//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
								//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
								//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
								//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
							],
						cmmds: [
							'curLevel.heaterHeaterWally1.disable()'
						],
					},
					cutScene:false, 
					text: "Here is the constant pressure version of the system filled with one mole of the ideal monatomic gas.  Heat the system by 100 K.  How does the value compare to the constant volume heating value of get('foo20', 'string', 'noValue') kJ?",
					quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
						}, 
					]
				}				
			]
		}, 
		{//S2(p0); q5- cutscene, constant pressure heating analysis
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				text: "<p>The system had a constant external pressure of 3 bar, contained one mole of an ideal monatomic gas, and was heated by 100 K.  From the first law, what should the change in system volume have been?</p>", 
				quiz:[						
					{
						type: 'textSmall', 
						storeAs: 'foo5', 
						units: 'L', 
						text: ''
					},
					{
						type: 'textSmall', 
						preText: 'How much work did the system do on its surroundings?',
						storeAs: 'foo6', 
						units: 'kJ', 
						text: ''
					},						 
					]
				}
			]	
		}, */
		{//Sixth section; one wall with heater and extra info displayed, 
			sceneData: 
				{
					walls: [
							//{pts:[P(40,40), P(250,40), P(250,425), P(40,425)], handler:'staticAdiabatic', handle:'wally1', border: {type: 'wrap'}},
							{pts:[P(300,40), P(510,40), P(510,425), P(300,425)], handler:'staticAdiabatic', handle:'wally3', vol: 5, border: {type: 'open', yMin: 50}},
					],
					dots: [	
							//{type: 'spc1', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally', tag: 'wally1'},
							//{type: 'ugly', pos: P(100, 100), dims: V(300, 300), count: 500, temp:600, returnTo: 'wally1', tag: 'wally1'},
							{spcName: 'ugly', pos: P(310, 50), dims: V(200, 350), count: 1000, temp:150, returnTo: 'wally3', tag: 'wally3'},
					],
					objs: [
							{type: 'Heater', attrs: {handle: 'heaterWally3', cleanUpWith: 'section', wallInfo: 'wally3'}},
							{type: 'Piston', attrs: {handle: 'pistony3', cleanUpWith: 'section', wallInfo: 'wally3', makeSlider: false, init: 3}},
					],
					dataReadouts: [
							//{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutRightPiston'},
							//{wallInfo: 'wally', data: 'vol', readout: 'pistonReadoutRightPiston'},
							{label: 'Heat: ', expr: 'q("wally3")', units: 'kJ', sigFigs: 2, handle: 'heating3', readout: 'mainReadout'},
							{label: 'Temp: ', expr: 'temp("wally3")', units: 'K', sigFigs: 2, handle: 'temperature3', readout: 'mainReadout'}, 
							{label: 'pExt: ', expr: 'pExt("wally3")', units: 'bar', sigFigs: 2, handle: 'external pressure', readout: 'pistonReadoutPistony3'},
							{label: 'work: ', expr: 'work("wally3")', units: 'kJ', sigFigs: 2, handle: 'work', readout: 'mainReadout'},
							//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
							//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
							//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
							//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
					],
			},			
			prompts: [
						{
						text: "Here's the same system with the work done displayed.  Increase the temperature by 100 K.  You predicted that get('foo5', 'string', 'noValue') kJ of work would be done.  How does this compare to the experimental result?",
						quiz:[
						{
							storeAs: 'foo7', 
							type:'text', 
							text:'Type your answer here.', 
						},
					]
				}, 
				{
					text: "We've established that when you expand at constant pressure, the system does work on its surroundings.  Can you use this idea to explain why a system's heat capacity is higher at constant pressure than at constant volume?",
					quiz:[
							{
								storeAs: 'foo8', 
								type:'text', 
								text:'Type your answer here.', 
							},
						]
					}
			]
		}, 
		{//Seventh section; cutscene, one question in one prompt
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				text: "<p>The heat capacity per mole of gas can be described at the heat per temperature change, or ##\\frac{dq}{dT} ##.</p><p> We know that the constant volume heat capacity of an ideal monatomic gas is ##\\frac{3}{2}R##. </p><p>From the first law, solve for what the ##\\frac{dq}{dt}##, or heat capacity, would be for this system at constant pressure. </p><p>How does the result relate to your conceptual understanding of how constant pressure systems behaves?  Explain.</p>", 
				quiz:[
						{
							storeAs: 'foo9', 
							type:'text', 
							text:'Type your answer here.', 
						},
					]
				}
			]
		}
	]

}