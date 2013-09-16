canvasHeight = 450;
LevelData = {
	levelTitle: 'Phase Equilibrium',

		
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
					quiz:[
						{
							questionText: "<p>Today we're going to look at single component phase equilibrium. Before we start, what does it mean for a system to be saturated?</p>",
							type: 'text',
							text: 'type your answer here',
							storeAs: 'beginning1', 
							CWQuestionId: 91
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
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'wallo', isothermalRate: 4, vol: 4.5, border: {type: 'open', width: 10, yMin: 40} },
				],
				dots: [
					{spcName: 'Water', pos: P(45,240), dims: V(465,110), count: 550, temp:550, returnTo: 'wallo', tag: 'wallo'}, //count 396
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 1,
							init:6.5,
							max: 7,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Liquid',
						attrs:{
							wallInfo: 'wallo',
							handle: 'water',
							tempInit: 550,
							spcCounts: {Water: 0},
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
							temp: 550,
							max: 2,
							pos: new Point(225, 325), 
							dims: new Vector(100, 22)
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'Water', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'moles', attrs: {spcName: 'Water', tag:'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy'},
				],
				graphs: [
					{type: 'Scatter', handle: 'TVGraph', xLabel: 'Temperature (K)', yLabel: 'Volume (L)', axesInit: {x:{min: 350, step: 40}, y:{min: 0, step: 1}}, numGridLines: {x: 6, y: 6},axesFixed: {x: true, y: true},
						sets:[
							{handle: 'tempVolume', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'if (curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length < 25) {return tempSmooth("wallo");} else {return tempSmooth("liquidWater");}', y: 'vol("wallo")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						]
					}
				],	
				dataReadouts: [
					// {label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Heat Total: ', expr: 'q("wallo") + q("liquidWater")', units: 'kJ', decPlaces: 1, handle: 'qReadout', readout: 'mainReadout'},
					{label: 'Heat Step: ', expr: 'q("wallo") + q("liquidWater")', units: 'kJ', decPlaces: 1, handle: 'qReadoutStep', readout: 'mainReadout'},
					// {label: 'frac: ', expr: 'frac("wallo")', units: '', decPlaces: 1, handle: 'fracReadout', readout: 'mainReadout'},
					// {label: 'moles: ', expr: 'moles("wallo")', units: 'mol', decPlaces: 2, handle: 'molReadout', readout: 'mainReadout'},
					// {label: 'Enthalpy: ', expr: 'enthalpy("wallo")', units: 'kJ', decPlaces: 2, handle: 'hReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'var tempVal = tempSmooth("wallo"); if (tempVal){return tempVal;} else {return "N/A";}', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'var tempVal = tempSmooth("liquidWater"); if (curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length){return tempVal;} else {return "N/A";}', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					// {label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
				triggers: [
					{handle: 'resetterTest', expr: 'wasReset', satisfyCmmds: ['console.log("shenanigans!!!!!!!!!!!")']},
					{handle: 'trigger1', expr: 'tempSmooth("wallo") < 447', message: 'Cool the liquid', priority: 1, checkOn: 'conditions', requiredFor: 'prompt2'},
					{handle: 'freeze1', expr: 'tempSmooth("wallo") <= 436', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'walls["wallo"].isothermalInit(436)'], requiredFor: 'prompt2'},
					{handle: 'trigger2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length >= 225 || !curLevel.heaterHeater1.enabled', message: 'Condense the vapor', checkOn: 'conditions', requiredFor: 'prompt4'},
					{handle: 'freeze2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length >= 225', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'curLevel.liquidWater.disablePhaseChange()'], requiredFor: 'prompt4'},
					{handle: 'trigger3', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length > 540', message: 'Fully condense the vapor', checkOn: 'conditions', requiredFor: 'prompt8'},
					{handle: 'freeze3', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length == 550', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'curLevel.liquidWater.disablePhaseChange()'], requiredFor: 'prompt8'},
					{handle: 'trigger4', expr: 'curLevel.liquidWater.temp <= 390', message: 'Heat the vapor', requiredFor: 'prompt11', checkOn: 'conditions'},
					{handle: 'freeze4', expr: 'curLevel.liquidWater.temp <= 388 && curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length == 550', requiredFor: 'prompt11', satisfyCmmds: ['curLevel.heaterHeater1.disable()', 'walls["wallo"].isothermalInit(388)']},
					
				]
			},
			prompts: [
				{//prompt0
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.disable()',
							'walls.wallo.isothermalStop()'
						]	
					},
					quiz: [
						{	
							type: 'text',							
							preText: "The system above depicts liquid water molecules at 6.5 bar. At the top right is another representation of the system in the form of a PT phase diagram. The pointer represents the current state of the system. <br><br>Is the system above saturated? Explain",
							text: 'Type your response here', 
							storeAs: 'Ans1',
							CWQuestionId: 92
						}
					],
					title: 'Current Step'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'textSmall',
							preText:'The system contains 1 mole of liquid water molecules. Determine the energy you have to remove from the system in order to reach a saturated vapor state. You may use the steam tables in your book to find the saturation temperature.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2',
							CWQuestionId: 93
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
					text: 'Cool the system until it reaches the saturated vapor state. Compare the energy required to what you calculated.'
				},
				{//prompt3
					sceneData: {
						cmmds: [
							'dataDisplayer.setEntryValue("qReadoutStep", 0)'
						]
					},
					quiz: [
						{
							type: 'textSmall',
							preText:'Determine the energy required to condense half the vapor. The enthalpy of vaporization for water at this temperature is 37.4 kJ/mol',
							text: '',
							units: 'kJ',
							storeAs: 'Ans3',
							CWQuestionId: 94
						}
					],
				},
				{//prompt4
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()',
							'walls.wallo.isothermalStop()',
							'curLevel.liquidWater.enablePhaseChange()',
						]
					},
					text: 'Condense half the vapor. Compare the energy required to what you calculated.'
				},
				{//prompt5
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'How do the temperatures of the vapor and liquid phases compare?',
							text: 'Type your response here',
							storeAs: 'Ans4',
							CWQuestionId: 95
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
							CWQuestionId: 96
						}
					],
				},	
				{//prompt7
					sceneData: {
						cmmds: [
							'dataDisplayer.setEntryValue("qReadoutStep", 0)'
						]	
					},
					quiz: [
						{
							type: 'textSmall',
							preText: 'Determine the energy required to fully bring the system to the saturated liquid state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans6',
							CWQuestionId: 97
						}
					],
				},
				{//prompt8
					sceneData: {
						cmmds: [
							'curLevel.heaterHeater1.enable()',
							'curLevel.liquidWater.enablePhaseChange()'
						]
					},
					text: 'Fully condense the vapor. Compare the energy required to what you calculated.'
				},
				{//prompt9
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Is the system still saturated?',
							text: ' ',
							storeAs: 'Ans7',
							CWQuestionId: 98
						}
					],
				},
				{//prompt10
					sceneData: {
						cmmds: [
							'dataDisplayer.setEntryValue("qReadoutStep", 0)'
						]
					},
					quiz: [
						{
							type: 'textSmall',
							preText: 'Now we want to supercool the vapor to 115 C at constant pressure. Determine the energy required to reach this state.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans8',
							CWQuestionId: 99
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
							preText: 'Cool the liquid until it reaches 115 C. Is the system saturated at this new temperature?',
							text: '',
							storeAs: 'Ans9',
							CWQuestionId: 100
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
							CWQuestionId: 101,
							questionText: '<p>Now we want to return the system to saturation while keeping the temperature constant at 115 C. Which of the following will accomplish this goal?</p>',
							options:[
										{text:"Decrease Pressure", correct: true, CWAnswerId: 9},
										{text:"Increase Pressure", correct: false, message: "That's not correct", CWAnswerId: 10},
										{text:"Remove Liquid Water", correct: false, message: "That's not correct", CWAnswerId: 11},
										{text:"Add Liquid Water", correct: false, message:"That's not correct", CWAnswerId: 12},
										{text:"Add Water Vapor", correct: false, message: "That's not correct", CWAnswerId: 13}, 
							]
						}
					]
				},
				{//prompt1
					sceneData: undefined,
					cutScene: true,
					quiz: [
						{
							questionText: '<p>Use your text book to determine the pressure at which the system will be saturated if the temperature is held at 115 C.',
							type: 'textSmall',
							text: '',
							units: 'bar',
							storeAs: 'Ans10',
							CWQuestionId: 102
						}	
					],
				},
			]
		},
		{//Third Scene
			sceneData: {
				walls: [
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'cVIsothermal', temp: 388.15, handle: 'wallo', vol: 0.6, isothermalRate: 50, border: {type: 'open', width: 10, yMin: 40} },
				],
				dots: [
					{spcName: 'Water', pos: P(45,100), dims: V(465,240), count: 0, temp:388.15, returnTo: 'wallo', tag: 'wallo'}, //count 396
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 0,
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
							min: 0,
							max: 3.5,
							init: 3.5,
						}
					},
					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrow', wallInfo: 'wallo', scale: 1}
					// },	
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
							tempInit: 388.15,
							spcCounts: {Water: 550},
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
					{label: 'Heat: ', expr: 'q("wallo")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'var tempVal = tempSmooth("wallo"); if (tempVal){return tempVal;} else {return "N/A";}', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'var tempVal = tempSmooth("liquidWater"); if (tempVal){return tempVal;} else {return "N/A";}', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', decPlaces: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
				graphs: [
					{type: 'Scatter', handle: 'PVGraph', xLabel: 'Pressure (bar)', yLabel: 'Volume (L)', axesInit: {x:{min: 0, step: 1}, y:{min: 0, step: 2}}, numGridLines: {x: 6, y: 6},axesFixed: {x: true, y: true},
						sets:[
							{handle: 'pressureVolume', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'pExt("wallo")', y: 'vol("wallo")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						]
					}
				],
				triggers: [
					{handle: 'triggery1', expr: 'pExt("wallo") <= 1.74', message: 'Remove sand from the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt0'},
					{handle: 'triggery2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length < 30', message: 'Vaporize the system', priority: 1, checkOn: 'conditions', requiredFor: 'prompt2'},
					{handle: 'triggery2', expr: 'curLevel.liquidWater.dotMgrLiq.lists.ALLDOTS.length == 0', satisfyCmmds: ['curLevel.liquidWater.disablePhaseChange()'], priority: 1},
					{handle: 'freeze1', expr: 'pExt("wallo") <= 1.70', satisfyCmmds: ['curLevel.sandboxMrSandMan.removeMassStop()', 'buttonManager.hideButton("mrSandManSandButtons", "add")', 'buttonManager.hideButton("mrSandManSandButtons", "remove")'], priority: 1},
					{handle: 'freeze2', expr: 'pExt("wallo") <= 1.60', satisfyCmmds: ['curLevel.sandboxMrSandMan.removeMassStop()', 'buttonManager.hideButton("mrSandManSandButtons", "add")', 'buttonManager.hideButton("mrSandManSandButtons", "remove")'], priority: 1},
				]
			},
			prompts: [
				{//prompt0
					sceneData: {
						cmmds: [
							'curLevel.liquidWater.disablePhaseChange()'
						]
					},
					text: 'Now decrease the pressure to bring the system to saturation with the temperature held constant at 115 C.'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'multChoice',
							CWQuestionId: 103,
							questionText: 'The vapor heat capacity of water is 1.9 kJ/kgK and the liquid heat capacity of water is 4.2 kJ/kgK. How will the heat of vaporization at 115 C compare to the value at 162 C?',
							options:[
								{text: "Less at 115 C", correct: false, message: "That is not the correct answer", CWAnswerId: 14},
								{text: "Equal at 115 C", correct: false, message: "That is not the correct answer", CWAnswerId: 15},
								{text: "Greater at 115 C", correct: true, CWAnswerId: 16}
							]
						}
					]	
				},
				{//prompt2
					sceneData: {
						cmmds: [
							'buttonManager.showButton("mrSandManSandButtons", "add")', 
							'buttonManager.showButton("mrSandManSandButtons", "remove")',
							'curLevel.liquidWater.enablePhaseChange()'
						]
					},
					quiz: [
						{
							type: 'textSmall',
							preText:'Vaporize the liquid. How much heating was done?',
							text: '',
							units: 'kJ',
							storeAs: 'Ans11',
							CWQuestionId: 104
						}
					],
				},
				{//prompt3
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText: 'Condensing the liquid at 162 C took 37.40 kJ/mol and vaporizing at 115 C took 39.92 kJ/mol. Do these values agree with your prediction?',
							storeAs: 'Ans12',
							CWQuestionId: 105
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