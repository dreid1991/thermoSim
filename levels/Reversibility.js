canvasHeight = 450;
LevelData = {
	levelTitle: 'Reversibility',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 3, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],	

	mainSequence: [
		{//Scene 0
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					quiz:[
						{
							questionText: '<p>In these experiments, we will explore what makes a process irreversible and what makes a process reversible.</p><p>Before we get to the experiment, please first describe what you think the difference between an irreversible and a reversible process is.</p>',
							type: 'text',
							text: 'type your answer here',
							storeAs: 'longAns1',
							CWQuestionId: 13
						}
					]
				},
				{
					cutScene: true,
					quiz: [
						{
							questionText: '<p>A reversible process can be defined as a process that, after it is complete, can be returned to its initial state without having caused any changes to the system or its surroundings.</p><p>State what conditions you believe are necessary for a reversible process to take place.</p>',
							type: 'text',
							text: 'type your answer here',
							storeAs: 'longAns2',
							CWQuestionId: 14
						}
					]
				}
			],	
			
		},
		{//Scene 1
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'left', temp: 273, isothermalRate: 4, border: {type: 'open', width: 10} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 1100, temp:273, returnTo: 'left', tag: 'left'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'left',
							min: 1,
							init: 2,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabatic',
						}	
					},
					{
						type: 'DragWeights',
						attrs: {
							handle: 'Weight1',
							wallInfo: 'left',
							weightDefs: [{count: 1, pressure:2}],
							pInit: 0,
							weightScalar: 100,
							pistonOffset: V(0,-10),
							displayText: true,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}}, axesFixed: {y: true}, numGridLines: {y: 6},
						sets:[
							{handle: 'externalPressure', label: 'P Ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: '1.059 * vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P Int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: '1.059 * vol("left")', y: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))'}, trace: true, fillInPts: true, fillInPtsMin: 5, showPts: false}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}},
					{wallInfo: 'left', data: 'moles', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					// {label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonRightPistonLeft'},
					{label: 'Vol: ', expr: '1.059 * vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonRight'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("left"), 4) < 0.1', message: 'Place the block on the piston', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'freeze', expr: 'pExt("left") == 4', satisfyCmmds: ['curLevel.dragWeightsWeight1.disable()'], requiredFor: 'prompt0'},
					{handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15', message: 'Remove the block from the piston', requiredFor: 'prompt2', checkOn:'conditions'},
				],	
			},
			prompts: [
				{
					quiz: [
						{	
							type: 'textSmall',
							preText: "Let's begin our experiment with the isothermal compression of 1.1 moles of perfectly ideal gas using a single block. Please place the block on the piston. Estimate the value of work in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans1',
							CWQuestionId: 15
						}
					],
					resetId: 112,
					title: 'Current Step'		
				},
				{
					sceneData: undefined,
					resetId: 113,
					quiz: [
						{
							type: 'text',
							preText:'You calculated get("Ans1", "string") kJ for the isothermal compression process.  How does that compare to the value of heat?  Explain.',
							text: 'type your answer here',
							storeAs: 'LongAns3',
							CWQuestionId: 16
						}
					],
				},
				{
					sceneData:{ 
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					resetId: 114,
					quiz: [
						{
							type: 'textSmall',
							preText:'Now remove the block and let the piston isothermally expand.  For the compression process, you estimated that it "cost" you get("Ans1", "string") kJ of work.  Estimate how much work you "got back" from the expansion.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2',
							CWQuestionId: 17
						}
					],
				},
				{
					sceneData: undefined,
					resetId: 115,
					quiz: [
						{
							type: 'text',
							preText: 'The system above has returned to its intial state, but what about the surroundings? Have they changed? Explain. <p>Hint: Think about heat. <p>Was this process reversible?',
							text: 'type your answer here',
							storeAs: 'LongAns4',
							CWQuestionId: 18
						}
					]
				}
			]
		},
		{//Scene 2	
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'left', temp: 273, isothermalRate: 4, border: {type: 'open', width: 10} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 1100, temp:273, returnTo: 'left', tag: 'left'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'left',
							min: 1,
							init: 1,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'DragWeights',
						attrs: {
							handle: 'Weight1',
							wallInfo: 'left',
							weightDefs: [{count: 2, pressure:1}],
							pInit: 1,
							pistonOffset: V(0,-10),
							displayText: true,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}}, axesFixed: {y: true}, numGridLines: {y: 6},
						sets:[
							{handle: 'externalPressure', label: 'P Ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: '1.059 * vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P Int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: '1.059 * vol("left")', y: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))'}, trace: true, fillInPts: true, fillInPtsMin: 5, showPts: false}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}},
					{wallInfo: 'left', data: 'moles', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					// {label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonRightPistonLeft'},
					{label: 'Vol: ', expr: '1.059 * vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonRight'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("left"), 4) < 0.1', message: 'Place the blocks on the piston', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'freeze', expr: 'pExt("left") == 4', satisfyCmmds: ['curLevel.dragWeightsWeight1.disable()'], requiredFor: 'prompt0'},
					{handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15', message: 'Remove the blocks from the piston', requiredFor: 'prompt2', checkOn:'conditions'},
				]	
			},
			prompts:[
				{
					text:  "Now we are going to perform a process with two blocks. Place both blocks on the piston as quickly as possible, one immediately after the other.",  
					resetId: 116,
					title: 'Current Step'		
				},
				{
					sceneData: {
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					resetId: 117,
					text: "Take note of the external pressure curve at the top right. Now remove both blocks as quickly as possible"
				},
			]
		},
		{//Scene 3	
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'left', temp: 273, isothermalRate: 4, border: {type: 'open', width: 10} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 1100, temp:273, returnTo: 'left', tag: 'left'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'left',
							min: 1,
							init: 1,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'DragWeights',
						attrs: {
							handle: 'Weight1',
							wallInfo: 'left',
							weightDefs: [{count: 2, pressure:1}],
							pInit: 1,
							pistonOffset: V(0,-10),
							displayText: true,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}}, axesFixed: {y: true}, numGridLines: {y: 6},
						sets:[
							{handle: 'externalPressure', label: 'P Ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: '1.059 * vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P Int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: '1.059 * vol("left")', y: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))'}, trace: true, fillInPts: true, fillInPtsMin: 5, showPts: false}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}},
					{wallInfo: 'left', data: 'moles', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					// {label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonRightPistonLeft'},
					{label: 'Vol: ', expr: '1.059 * vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonRight'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("left"), 4) < 0.1', message: 'Place the blocks on the piston', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'freeze', expr: 'pExt("left") == 4', satisfyCmmds: ['curLevel.dragWeightsWeight1.disable()'], requiredFor: 'prompt0'},
					{handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15', message: 'Remove the blocks from the piston', requiredFor: 'prompt2', checkOn:'conditions'},
				]	
			},
			prompts:[
				{
					quiz: [
						{	
							type: 'textSmall',
							preText: "Now we're going to repeat the exact same process, but this time place the blocks on the piston one at a time, waiting for the piston to settle before placing the next block. Estimate the value of work done on the system in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans3',
							CWQuestionId: 19
						}
					],
					resetId: 116,
					title: 'Current Step'		
				},
				{
					sceneData: undefined, 
					resetId: 117,
					quiz: [
						{
							type: 'text',
							preText:'You calculated get("Ans3", "string") kJ for the isothermal compression process.  How does this compare to the value of work calculated in the single block simulation?  Explain.',
							text: 'type your answer here',
							storeAs: 'LongAns5',
							CWQuestionId: 20
						}
					],
				},
				{
					sceneData: {
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					resetId: 118,
					quiz: [
						{
							type: 'textSmall',
							preText:'Now remove both blocks one at a time, waiting for the piston to settle before removing the next block. Estimate the work done on the system.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans4',
							CWQuestionId: 21
						}
					],
				},
				{
					sceneData: undefined,
					resetId: 119,
					quiz: [
						{
							type: 'text',
							preText: 'Now that this system has reached its initial state, are its surroundings unchanged? If you believe there has been a change, how does it compare to the change in the first, single block process? Explain.',
							text: 'type your answer here',
							storeAs: 'longAns6',
							CWQuestionId: 22
						}
					]
				},
				{
					sceneData: undefined,
					resetId: 1200,
					quiz: [
						{
							type: 'text',
							preText: 'Placing the two blocks on quickly made the process more like the single block simulation. What effect does waiting for the piston to reach equilibrium before adding another block have on the work done?',
							text: 'type your answer here',
							storeAs: 'longAns6',
							CWQuestionId: 10000
						}
					]
				}
			]
		},
		{//Scene 4
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'left', temp: 273, isothermalRate: 4, border: {type: 'open', width: 10} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 1100, temp:273, returnTo: 'left', tag: 'left'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'left',
							min: 1,
							init: 1,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Sandbox',
						attrs: {
							handle: 'Sand1',
							wallInfo: 'left',
							min: 1,
							init: 1,
							max: 3,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}}, axesFixed: {y: true}, numGridLines: {y: 6},
						sets:[
							{handle: 'externalPressure', label: 'P Ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: '1.059 * vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P Int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: '1.059 * vol("left")', y: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))'}, trace: true, fillInPts: true, fillInPtsMin: 5, showPts: false}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}},
					{wallInfo: 'left', data: 'moles', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					// {label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'moles("left", {spcName: "spc3", tag: "left"}) * R / 100 * 273 / (1.059*vol("left"))', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonRightPistonLeft'},
					{label: 'Vol: ', expr: '1.059 * vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonRight'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("left"), 4) < 0.1', message: 'Add mass to the system', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'notRefreshed', expr: 'fracDiff(pExt("left"), 4) < 0.1', satisfyCmmds: ['curLevel.notRefreshed = true']},
					{handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15 && curLevel.notRefreshed', message: 'Remove mass from the system', requiredFor: 'prompt1', checkOn:'conditions'},
				],	
			},
			prompts:[
				{
					quiz: [
						{	
							type: 'textSmall',
							preText: "Now we're going to break the process into even smaller pieces. Slowly add mass to the system by clicking and holding the button to the right of the piston-cylinder assembly until the external pressure is equal to 4 bar. <p>How much work was done on the 1.1 moles of ideal gas in the system? For simplicity, you can assume that the external pressure is approximately equal to the internal pressure of the system at all times.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans5',
							CWQuestionId: 23
						}
					],
					resetId: 120,
					title: 'Current Step'		
				},
				{
					sceneData: undefined, 
					resetId: 121,
					quiz: [
						{
							type: 'textSmall',
							preText:'You calculated get("Ans5", "string") kJ for the isothermal compression process.  Now slowly remove mass until the external pressure is equal to 2 bar. How much work was done on the system?',
							text: '',
							units: 'kJ',
							storeAs: 'Ans6',
							CWQuestionId: 24
						}
					],
				},
				{
					sceneData: undefined, 
					resetId: 1201,
					quiz: [
						{
							type: 'text',
							preText:'Depending on how slowly you added and removed mass, you can probably see that the external pressure curves do not perfectly overlap. Explain why the two curves do not overlap. Hint: Think back to the two different two block processes.',
							text: 'type your answer here',
							storeAs: 'longAns7',
							CWQuestionId: 10001
						}
					],
				},
				{
					sceneData: undefined, 
					resetId: 122,
					quiz: [
						{
							type: 'text',
							preText:'How did your two calculated values of work in this last process compare? Were the surroundings unchanged? What can you say about amount of work done during a compression compared to amount of work done during expansion when the process is broken into smaller increments?',
							text: 'type your answer here',
							storeAs: 'longAns7',
							CWQuestionId: 25
						}
					],
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz: [
						{
							type: 'text',
							preText:'<p>Was this last process actually reversible? You assumed for your calculations that external pressure was always equal to internal pressure. Was it?',
							storeAs: 'longAns8',
							CWQuestionId: 26
						}
					],
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz: [
						{
							type: 'text',
							preText:'<p>What size must changes in input be for a process to be truly reversible? Can any real process be truly reversible?',
							storeAs: 'longAns8',
							CWQuestionId: 1000000
						}
					],
				},
			]
		},
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					quiz: [
						{
							type: 'text',
							questionText: '<p>Now that you have completed the simulation, describe the difference between reversible and irreversible processes.',
							text: 'type your answer here',
							storeAs: 'longAns9',
							CWQuestionId: 1000
						}	
					]
				}
			]
		},
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					quiz: [
						{
							type: 'text',
							questionText: '<p>Identify and describe in 1-2 sentences the most important concepts about reversibility this interactive virtual laboratory addressed.',
							text: 'type your response here',
							CWQuestionId: 555555
							
						},
						{
							type: 'text',
							questionText: '<p>How do these concepts connect to what you have been learning in class?',
							text: 'type your response here',
							CWQuestionId: 555555
							
						}
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
