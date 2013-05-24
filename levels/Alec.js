
canvasHeight = 450;
LevelData = {
	levelTitle: 'Reversible and Irreversible Processes',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],	

	mainSequence: [
		
		// {
			// sceneData: undefined,
			// // prompts: [
				// // {
					// // cutScene: true,
					// // text: '<p>In these experiments, we will explore what makes a process irreversible and what makes a process reversible.</p><p>Before we get to the experiment, please first describe what you think the difference between an irreversible and a reversible process is.</p>',
					// // quiz:[
						// // {
							// // type: 'text',
							// // text: 'type your answer here',
						// // }
					// // ]
				// // },
			// // ],	
			
		// // },
		{
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
					// {
						// type: 'Blob',
						// cleanUpWith: "prompt0",
						// attrs: {
							// handle: 'Blobby',
							// fillCol: Col(150, 200, 150),
							// pts: [P(150, 150), P(300, 150), P(300, 300), P(150, 300)],
						// }
					// },
					{
						type: 'DragWeights',
						attrs: {
							handle: 'Weight1',
							wallInfo: 'left',
							weightDefs: [{count: 1, pressure:2}],
							pInit: 1,
							pistonOffset: V(130,-41),
							displayText: true,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'External Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						sets:[
							{handle: 'externalPressure', label: 'P ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: 'vol("left")', y: 'pInt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					{label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'pInt("left")', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonReadoutRightPiston'},
					{label: 'Vol: ', expr: 'vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'mainReadout'}
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
							preText: "Let's begin our experiment with an isothermal compression process using a single block. Please place the block on the piston. Estimate the value of work in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans1'
						}
					],
					title: 'Current Step'		
				},
				{
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							preText:'You calculated get("Ans1", "string") kJ for the isothermal compression process.  How does that compare to the value of heat?  Explain.',
							text: 'type your answer here',
							storeAs: 'Long1'
						}
					],
				},
				{
					sceneData:{ 
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					quiz: [
						{
							type: 'textSmall',
							preText:'Now remove the block and let the piston isothermally expand.  For the compression process, you estimated that it "cost" you get("Ans1", "string") kJ of work.  Estimate how much work you "got back" from the expansion.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2'
						}
					],
				},
			]
		},
		{	
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
							pistonOffset: V(130,-41),
							displayText: true,
						}
					},
					{
						type: 'QArrowsAmmt',
						attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					}	
				],
				graphs: [
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'External Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						sets:[
							{handle: 'externalPressure', label: 'P ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: 'vol("left")', y: 'pInt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', sigFigs: 3, handle: 'tempReadout', readout: 'mainReadout'},
					{label: 'Q: ', expr: 'q("left")', units: 'kJ', sigFigs: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'pInt("left")', units: 'bar', sigFigs: 2, handle: 'pIntReadout', readout: 'pistonReadoutRightPiston'},
					{label: 'Vol: ', expr: 'vol("left")', units: 'L', sigFigs: 3, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'mainReadout'}
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
							preText: "Now place both blocks on the piston one at a time, waiting for the piston to settle before placing the next block. Estimate the value of work done on the system in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans3'
						}
					],
					title: 'Current Step'		
				},
				{
					sceneData: undefined, 
					quiz: [
						{
							type: 'text',
							preText:'You calculated get("Ans3", "string") kJ for the isothermal compression process.  How does this compare to the value of work calculated in the single block simulation?  Explain.',
							text: 'type your answer here',
							storeAs: 'Long2'
						}
					],
				},
				{
					sceneData: {
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					quiz: [
						{
							type: 'textSmall',
							preText:'Now remove both blocks one at a time, waiting for the piston to settle before removing the next block. Estimate the work done on the system',
							text: '',
							units: 'kJ',
							storeAs: 'Ans4'
						}
					],
				},
			]
		},
		{
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
					{type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'External Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						sets:[
							{handle: 'externalPressure', label: 'P ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							{handle: 'internalPressure', label: 'P int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							data: {x: 'vol("left")', y: 'pInt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}
				],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', sigFigs: 3, handle: 'tempReadout', readout: 'mainReadout'},
					{label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					//{label: 'Pint: ', expr: 'pInt("left")', units: 'bar', sigFigs: 2, handle: 'pIntReadout', readout: 'pistonReadoutRightPiston'},
					{label: 'Vol: ', expr: 'vol("left")', units: 'L', sigFigs: 3, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'mainReadout'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("left"), 4) < 0.1', message: 'Add mass to the system', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15', message: 'Remove mass from the system', requiredFor: 'prompt1', checkOn:'conditions'},
				],	
			},
			prompts:[
				{
					quiz: [
						{	
							type: 'textSmall',
							preText: "Now slowly add mass until the external pressure is equal to 4 bar. How much work was done on the system?",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans5'
						}
					],
					title: 'Current Step'		
				},
				{
					sceneData: undefined, 
					quiz: [
						{
							type: 'textSmall',
							preText:'You calculated get("Ans5", "string") kJ for the isothermal compression process.  Now slowly remove mass until the external pressure is equal to 2 bar. How much work was done on the system?',
							text: '',
							units: 'kJ',
							storeAs: 'Ans6'
						}
					],
				},
				{
					sceneData: undefined, 
					quiz: [
						{
							type: 'text',
							preText:'How do these two values of work compare? What can be said about the amount of work put into a sytem compared to the amount of work gotten out when external pressure is changed in smaller increments?',
							text: 'type your answer here',
							storeAs: 'Long3'
						}
					],
				},
				{
					sceneData: undefined, 
					quiz: [
						{
							type: 'text',
							preText:'Can a real process be truly reversible? What kind of changes in input are required for a process to be truly reversible?',
							text: 'type your answer here',
							storeAs: 'Long4'
						}
					],
				},
				{
					cutScene: true,
					text: 'End of simulation.'
				}
			]
		}	
	]

}
