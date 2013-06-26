canvasHeight = 450;
LevelData = {
	levelTitle: 'Phase Equilibrium Template',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(115, 250, 98), cv: 2.5 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.07, b:1730.6, c:233.426-273.15}, cpLiq: 75.34, spcVolLiq: 1},
		{spcName: 'spc4', m: 4, r: 1, col: Col(115, 250, 98), cv: 2.5 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.14, b:1810.94, c:244.485-273.15}, cpLiq: 75.34, spcVolLiq: 1}
	],	

	mainSequence: [
		{//Initial Questions 
			sceneData: undefined,
			prompts: [
				{
					sceneData: undefined,
					cutScene: true,
					text: "<p>Today we're going to look at single component phase equilibrium. Before we start, what does it mean for a system to be saturated?</p>",
					quiz:[
						{
							type: 'text',
							text: 'type your answer here',
							storeAs: 'beginning1', 
						}
					]
				},
				{
					sceneData: undefined,
					cutScene: true,
					text: "<p>A system is saturated when the phases can coexist at equilibrium. This requres that the temperature, pressure, and molar Gibbs energy be the same for each phase.</p>",
				},
			],	
			
		},
		{//First Scene
			sceneData: {
				walls: [
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'staticAdiabatic', handle: 'wallo', vol: 0.5, isothermalRate: 4, border: {type: 'open', width: 10, yMin: 40} },
				],
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 1,
							init: 1,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Liquid',
						attrs:{
							wallInfo: 'wallo',
							handle: 'water',
							tempInit: 333.15,
							spcCounts: {spc3: 400},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: false,
						},
					},
					{
						type: 'Heater',
						attrs: {
							handle: 'heater1',
							wallInfo: 'wallo',
							liquidHandle: 'water',
							temp: 333.15,
							max: 2,
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'spc3', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy', attrs: {spcName: 'spc3', tag: 'wallo'}},
				],
				// graphs: [
					// {type: 'Scatter', handle: 'hTGraph', xLabel: 'Enthalpy (kJ)', yLabel: 'Temperature (K)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						// sets:[
							// {handle: 'enthalpyTemperature', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							// data: {x: 'enthalpy("left")', y: 'tempSmooth("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						// ]
					// }
				// ],	
				dataReadouts: [
					{label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'tempSmooth("wallo")', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'tempSmooth("liquidWater")', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
			},
			prompts: [
				{//prompt0
					quiz: [
						{	
							type: 'text',							
							preText: "Is the above system saturated? Explain",
							text: 'Type your response here', 
							storeAs: 'Ans1'
						}
					],
					title: 'Current Step'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'Determine the energy you have to add to the system in order to reach a saturated liquid state. Heat the system by this amount',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2'
						}
					],
				},
				{//prompt2
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'<p>Determine the energy required to vaporize half the liquid. Heat the system by this amount.</p><p>The enthalpy of vaporization for water is 40.68 kJ/mol</p>',
							text: '',
							units: 'kJ',
							storeAs: 'Ans3'
						}
					],
				},
				{//prompt3
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'How do the temperatures of the vapor and liquid phases compare?',
							text: 'Type your response here',
							storeAs: 'Ans4',
						}
					],
				},
				{//prompt4
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Is the system saturated?',
							text: '',
							storeAs: 'Ans5',
						}
					],
				},	
				{//prompt5
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText: 'Determine the energy required to fully bring the system to the saturated vapor state. Heat the system by this amount.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans6',
						}
					],
				},
				{//prompt6
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Is the system still saturated?',
							text: ' ',
							storeAs: 'Ans7',
						}
					],
				},
				{//prompt7
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText: 'Now we want to superheat the vapor to 150 C at constant pressure. Determine the energy required to reach this state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans8',
						}
					],
				},
				{//prompt8
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Heat the vapor until it reaches 150 C. Is the system saturated at this new temperature?',
							text: '',
							storeAs: 'Ans7',
						}
					],
				},
			]
		},
		{//Second Scene
			sceneData: undefined,
			prompts: [
				{//prompt0
					sceneData: undefined,
					cutScene: true,
					quiz: [
						{
							type: 'multChoice',
							questionText: '<p>Now we want to return the system to saturation while keeping the temperature constant at 150 C. Which of the following will accomplish this goal.</p>',
							options:[
										{text:"Decrease Pressure", correct: false, message:"That's not correct"},
										{text:"Increase Pressure", correct: true},
										{text:"Remove Water Vapor", correct: false, message: "That's not correct"},
										{text:"Add Water Vapor", correct: false, message:"That's not correct"},
										{text:"Add Inert Species", correct: false, message: "That's not correct"}, 
							]
						}
					]
				},
				{//prompt1
					sceneData: undefined,
					cutScene: true,
					text: '<p>Determine the pressure at which the system will be saturated if the temperature is held at 150 C. Antoine coefficients are listed below.</p><p>A: 8.071</p><p>B:1730.6</p><p>C: 233.4</p>',
					quiz: [
						{
							type: 'textSmall',
							text: '',
							units: 'bar',
							storeAs: 'Ans8',
						}	
					],
				},
			]
		},
		{//Third Scene
			sceneData: {
				walls: [
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'cVIsothermal', temp: 423.15, handle: 'wallo', vol: 13.5, isothermalRate: 4, border: {type: 'open', width: 10, yMin: 40} },
				],
				dots: [
					{spcName: 'spc4', pos: P(45,100), dims: V(465,240), count: 400, temp:423.15, returnTo: 'wallo', tag: 'wallo'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 1,
							init: 1,
							max: 20,
							makeSlider: true,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					// {
						// type: 'DragWeights',
						// attrs: {
							// handle: 'Weight1',
							// wallInfo: 'wallo',
							// weightDefs: [{count: 5, pressure:1}],
							// pInit: 0,
							// weightScalar: 100,
							// pistonOffset: V(130,-41),
							// displayText: true,
						// }
					// },
					{
						type: 'Liquid',
						attrs:{
							wallInfo: 'wallo',
							handle: 'water',
							tempInit: 423.15,
							spcCounts: {spc4: 1},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: false,
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'spc3', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy', attrs: {spcName: 'spc3', tag: 'wallo'}},
				],
				// graphs: [
					// {type: 'Scatter', handle: 'hTGraph', xLabel: 'Enthalpy (kJ)', yLabel: 'Temperature (K)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						// sets:[
							// {handle: 'enthalpyTemperature', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							// data: {x: 'enthalpy("left")', y: 'tempSmooth("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						// ]
					// }
				// ],	
				dataReadouts: [
					{label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'tempSmooth("wallo")', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'tempSmooth("liquidWater")', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
			},
			prompts: [
				{//prompt0
					sceneData: undefined,
					text: 'Now increase the pressure to bring the system to saturation with the temperature held constant at 150 C.'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'multChoice',
							questionText: 'The vapor heat capacity of water is 1.9 kJ/kgK and the liquid heat capacity of water is 4.2 kJ/kgK. How ill the heat of vaporization at 150 C compare to the value at 100 C?',
							options:[
								{text: "Less at 150 C", correct: true},
								{text: "Equal at 150 C", correct: false, message: "That is the incorrect answer"},
								{text: "Greater at 150 C", correct: false, message: "That is the incorrect answer"}
							]
						}
					]	
				},
				{//prompt2
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'Condense the vapor. How much heat was removed?',
							text: '',
							units: 'kJ',
							storeAs: 'Ans3'
						}
					],
				},
				{//prompt3
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Vaporizing the liquid at 100 C took 2257 kJ/kg and condensing at 150 C took 2114 kJ/kg. Do these values agree with your prediction?',
						}
					]
				},
			]
		},
	]
}