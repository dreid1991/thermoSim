canvasHeight = 450;
LevelData = {
	levelTitle: 'Phase Equilibrium Template',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'Water', m: 4, r: 2, col: Col(27, 181, 224), cv: 3.37 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.07, b:1730.6, c:233.426-273.15}, cpLiq: 75.34, spcVolLiq: 1},
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
							CWQuestionId: 89
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
							max: 6,
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
							spcCounts: {Water: 400},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: true,
							triplePointTemp: 273.16,
							criticalPointTemp: 647.1,
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
							pos: new Point(225, 335), 
							dims: new Vector(100, 12)
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'Water', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'moles', attrs: {spcName: 'Water', tag:'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy'},
				],
				graphs: [
					{type: 'Scatter', handle: 'TVGraph', xLabel: 'Temperature (K)', yLabel: 'Volume (L)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						sets:[
							{handle: 'tempVolume', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: '(curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length && tempSmooth("liquidWater")) || tempSmooth("wallo")', y: 'vol("wallo")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						]
					}
				],	
				dataReadouts: [
					{label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Heat: ', expr: 'q("wallo") + q("liquidWater")', units: 'kJ', decPlaces: 1, handle: 'qReadout', readout: 'mainReadout'},
					// {label: 'frac: ', expr: 'frac("wallo")', units: '', decPlaces: 1, handle: 'fracReadout', readout: 'mainReadout'},
					// {label: 'moles: ', expr: 'moles("wallo")', units: 'mol', decPlaces: 2, handle: 'molReadout', readout: 'mainReadout'},
					// {label: 'Enthalpy: ', expr: 'enthalpy("wallo")', units: 'kJ', decPlaces: 2, handle: 'hReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'tempSmooth("wallo")', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'tempSmooth("liquidWater")', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'curLevel.liquidWater.temp > 371', message: 'Heat the liquid', priority: 1, checkOn: 'conditions', requiredFor: 'prompt2'},
					{handle: 'freeze1', expr: 'curLevel.liquidWater.temp >= 371', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'walls["wallo"].isothermalInit(373)'], requiredFor: 'prompt2'},
					{handle: 'trigger2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length <= 200 || !curLevel.heaterHeater1.enabled', message: 'Vaporize the liquid', checkOn: 'conditions', requiredFor: 'prompt4'},
					{handle: 'freeze2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length <= 200', satisfyCmmds: ['curLevel.heaterHeater1.disable()'], requiredFor: 'prompt4'},
					// {handle: 'unfreeze2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length > 200', satisfyCmmds: ['curLevel.heaterHeater1.enable()'], requiredFor: 'prompt2'},
					{handle: 'trigger3', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length < 10', message: 'Fully vaporize the liquid', checkOn: 'conditions', requiredFor: 'prompt8'},
					{handle: 'freeze3', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length == 0', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'walls["wallo"].isothermalInit(374)'], requiredFor: 'prompt8'},
					{handle: 'trigger4', expr: 'temp("wallo") >= 405', message: 'Heat the vapor', requiredFor: 'prompt11', checkOn: 'conditions'},
					{handle: 'freeze4', expr: 'temp("wallo") > 423 && curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length == 0', requiredFor: 'prompt11', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'walls["wallo"].isothermalInit(423)']},
					
				]
			},
			prompts: [
				{//prompt0
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.disable()',
						]	
					},
					quiz: [
						{	
							type: 'text',							
							preText: "Is the above system saturated? Explain",
							text: 'Type your response here', 
							storeAs: 'Ans1',
							CWQuestionId: 90
						}
					],
					title: 'Current Step'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'The system contains 0.4 moles of liquid water molecules. Determine the energy you have to add to the system in order to reach a saturated liquid state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2',
							CWQuestionId: 91
						}
					],
				},
				{//prompt2
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()',
							'curLevel.liquidWater.disablePhaseChange()'
						]
					},
					text: 'Heat the system until it reaches the saturated liquid state. Compare the energy required to what you calculated.'
				},
				{//prompt3
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'<p>Determine the energy required to vaporize half the liquid. The enthalpy of vaporization for water is 40.68 kJ/mol</p>',
							text: '',
							units: 'kJ',
							storeAs: 'Ans3',
							CWQuestionId: 92
						}
					],
				},
				{//prompt4
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()',
							'curLevel.liquidWater.enablePhaseChange()',
							'walls["wallo"].isothermalStop()'
						]
					},
					text: 'Vaporize half the liquid. Compare the energy required to what you calculated.'
				},
				{//prompt5
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'How do the temperatures of the vapor and liquid phases compare?',
							text: 'Type your response here',
							storeAs: 'Ans4',
							CWQuestionId: 93
						}
					],
				},
				{//prompt6
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Is the system saturated?',
							text: '',
							storeAs: 'Ans5',
							CWQuestionId: 94
						}
					],
				},	
				{//prompt7
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText: 'Determine the energy required to fully bring the system to the saturated vapor state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans6',
							CWQuestionId: 95
						}
					],
				},
				{//prompt8
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()'
						]
					},
					text: 'Fully vaporize the liquid. Compare the energy required to what you calculated.'
				},
				{//prompt9
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Is the system still saturated?',
							text: ' ',
							storeAs: 'Ans7',
							CWQuestionId: 96
						}
					],
				},
				{//prompt10
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText: 'Now we want to superheat the vapor to 150 C at constant pressure. Determine the energy required to reach this state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans8',
							CWQuestionId: 97
						}
					],
				},
				{//prompt11
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()',
							'walls["wallo"].isothermalStop()'
						]
					},
					quiz: [
						{
							type: 'text',
							preText: 'Heat the vapor until it reaches 150 C. Is the system saturated at this new temperature?',
							text: '',
							storeAs: 'Ans9',
							CWQuestionId: 98
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
							CWQuestionId: 99,
							questionText: '<p>Now we want to return the system to saturation while keeping the temperature constant at 150 C. Which of the following will accomplish this goal?</p>',
							options:[
										{text:"Decrease Pressure", correct: false, message:"That's not correct", CWAnswerId: 9},
										{text:"Increase Pressure", correct: true, CWAnswerId: 10},
										{text:"Remove Water Vapor", correct: false, message: "That's not correct", CWAnswerId: 11},
										{text:"Add Water Vapor", correct: false, message:"That's not correct", CWAnswerId: 12},
										{text:"Add Inert Species", correct: false, message: "That's not correct", CWAnswerId: 13}, 
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
							storeAs: 'Ans10',
							CWQuestionId: 100
						}	
					],
				},
			]
		},
		{//Third Scene
			sceneData: {
				walls: [
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'cVIsothermal', temp: 423.15, handle: 'wallo', vol: 13.5, isothermalRate: 50, border: {type: 'open', width: 10, yMin: 40} },
				],
				dots: [
					{spcName: 'Water', pos: P(45,100), dims: V(465,240), count: 396, temp:423.15, returnTo: 'wallo', tag: 'wallo'}, //count 396
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 0.5,
							init: 0.5,
							max: 20,
							makeSlider: true,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Sandbox',
						attrs: {
							handle: 'mrSandMan',
							wallInfo: 'wallo',
							min: 0.5,
							max: 9,
							init: 0.5,
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
							spcCounts: {Water: 4},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: true,
							triplePointTemp: 273.16,
							criticalPointTemp: 647.1,
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'Water', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy', attrs: {spcName: 'Water', tag: 'wallo'}},
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
				triggers: [
					{handle: 'triggery1', expr: 'pExt("wallo") >= 4.8', message: 'Add Pressure to the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt1'},
					//{handle: 'triggery1', expr: 'pExt("wallo") >= 4.9', satisfyCmmds: [], priority: 1, checkOn: 'conditions', requiredFor: 'prompt1'},
				]
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
							CWQuestionId: 101,
							questionText: 'The vapor heat capacity of water is 1.9 kJ/kgK and the liquid heat capacity of water is 4.2 kJ/kgK. How will the heat of vaporization at 150 C compare to the value at 100 C?',
							options:[
								{text: "Less at 150 C", correct: true, CWAnswerId: 14},
								{text: "Equal at 150 C", correct: false, message: "That is the incorrect answer", CWAnswerId: 15},
								{text: "Greater at 150 C", correct: false, message: "That is the incorrect answer", CWAnswerId: 16}
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
							storeAs: 'Ans11',
							CWQuestionId: 102
						}
					],
				},
				{//prompt3
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Vaporizing the liquid at 100 C took 2257 kJ/kg and condensing at 150 C took 2114 kJ/kg. Do these values agree with your prediction?',
							storeAs: 'Ans12',
							CWQuestionId: 103
						}
					]
				},
			]
		},
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					title: '',
					text: 'You have completed the simulation.'
				}
			]
		}
	]
}