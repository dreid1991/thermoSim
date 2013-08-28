LevelData = {
	levelTitle: 'TEST0000000000000000000!!!!!!!!!!!!',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(252, 0, 177), cv: 1.5 * R, hF298: -10, hVap298: 30.92, antoineCoeffs: {a: 7.4, b:1622.4, c: -20}, cpLiq: 40, spcVolLiq: 0.8},
		{spcName: 'spc2', m: 3, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		{//Second Scene
			sceneData: {//Scene1
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', isothermalRate: 4, vol: 0.895, handle: 'secondWall', border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 400, returnTo: 'secondWall', tag: 'secondWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'secondWall', min:2, init: 5.6478, max: 8}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'secondWall', max: 4, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'secondWall', handle: 'liq1', tempInit: 400, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				buttonGroups: [
					{handle: 'Phase', label: 'Phase', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'enablePhase', label: 'Enable Phase Change', isDown: false, exprs: ['curLevel.liquidLiq1.enablePhaseChange()']},
							{handle: 'disablePhase', label: 'Disable Phase Change', isDown: true, exprs: ['curLevel.liquidLiq1.disablePhaseChange()']}//CHANGE EXPRESSION!!
						]
					},
					{handle: 'Heat', label: 'Heat', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'iso', label: 'Isothermal', isDown: false, exprs: ['walls.secondWall.isothermalInit(curLevel.liquidLiq1.temp || temp("secondWall"))']},
							{handle: 'adiabatic', label: 'Adiabatic', isDown: true, exprs: ['walls.secondWall.isothermalStop()']}//CHANGE EXPRESSION!!
						]
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("secondWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr: 'tempSmooth("liquidLiq1")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'},
					{label: 'H: ', expr: '((enthalpy("secondWall") + 36839.93)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 400)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 400)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000', units: 'kJ', decPlaces: 1, handle: 'h', readout: 'mainReadout'},
					// {label: 'Pressure: ', expr: 'pExt("firstWall")', units: 'bar', decPlaces: 1, handle: 'pExt', readout: 'pistonPistonLeft'}
				],
				dataRecord: [
					{wallInfo: 'secondWall', data: 'enthalpy'},
					{wallInfo: 'liquidLiq1', data : 'enthalpy'}
				],
				// triggers: [
					// {handle: 'path0', expr: 'curLevel.liquidLiq1.temp > 448 && curLevel.liquidLiq1.temp < 452', message: 'What should the temperature be at the end of the first step?', checkOn: 'conditions', requiredFor: 'prompt0'},
					// {handle: 'path1', expr: 'curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length < 10 && fracDiff(temp("secondWall"), 450) < 0.1', message: 'What state and temperature should species A be at the end of the second step?', checkOn: 'conditions', requiredFor: 'prompt1'},
					// {handle: 'path2', expr: 'fracDiff(temp("secondWall"), 400) <= 0.08', message: 'What should the temperature be at the end of the third step?', checkOn: 'conditions', requiredFor: 'prompt2'},
					// // {handle: 'pathFreeze0', expr: 'curLevel.liquidLiq1.temp >= 450', satisfyCmmds: ['curLevel.heaterHeaterOne.disable()', 'buttonManager.clickButton("Heat", "iso")', 'walls.secondWall.isothermalInit(450)'], requiredFor: 'prompt0'},
					// {handle: 'pathFreeze1', expr: 'curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length == 0', satisfyCmmds: ['buttonManager.clickButton("Phase", "disablePhase")', 'buttonManager.hideButton("Phase", "enablePhase")'], requiredFor: 'prompt1'},
				// ],
				graphs: [
					{
						type: 'Scatter', handle: 'EnthalpyVsFracGas', xLabel: 'Fraction of molecules in gas phase', yLabel: 'Enthalpy', axesInit:{y:{min:0, step:8},x:{min:0, step:0.2}}, numGridLines: {x:6, y: 5}, axesFixed:{x: true, y: true},
							sets: [
								{handle: 'fracVH', label: 'frac\nGas', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{y: '((enthalpy("secondWall") + 36839.93)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 400)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 400)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000 ', x: 'dotManager.lists.ALLDOTS.length/(dotManager.lists.ALLDOTS.length + curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length)'},trace: true, fillInPts: true, fillInPtsMin: 5}
							]
					}
				]
			},
			prompts:[
				{//Prompt 0
					sceneData: {
						// cmmds: [
							// 'buttonManager.hideButton("Phase", "enablePhase")'
						// ]
					},
					text: " Now we're going to carry out your hypothetical path.  Above is species A in the same initial state as the previous system. You can use the buttons to the right to set whether the system is isothermal and whether phase change occurs.<p> Take the first step in your hypothetical path.",
					quiz:[
						{
							type: 'text',
							preText: 'How does the enthalpy change compare to the value you calculated?',
							text: 'Type your answer here',
							storeAs: 'HypAns4'
						}
					]
				},
				{//Prompt 1
					sceneData: {
						// cmmds: [
							// 'curLevel.heaterHeaterOne.enable()',
							// 'buttonManager.clickButton("Heat", "iso")',
							// 'buttonManager.hideButton("Heat", "adiabatic")',
							// '$($("button")[0]).hide()',
							// 'buttonManager.showButton("Phase", "enablePhase")'
						// ],
					},
					text: '<p>Take the next step in your hypothetical path. If you are vaporizing, you may want to have the system be isothermal at this step to make sure the enthalpy of vaporization is equal to the tabulated value.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy change of this step compare to the value you calculated?',
							storeAs: 'HypAns5',
							text: 'Type your answer here'
						}
					]
				},
				{//Prompt 2
					sceneData: {
						// cmmds: [
							// 'curLevel.heaterHeaterOne.enable()',
							// 'buttonManager.hideButton("Phase", "enablePhase")',
							// 'buttonManager.showButton("Heat", "adiabatic")'
						// ]
					},
					text: '<p>Take the final step in your hypothetical path.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy change of this step compare to the value you calculated?',
							storeAs: 'HypAns6',
							text: 'Type your answer here'
						}
					]
				},
				{//Prompt 3
					sceneData: undefined,
					cutScene: true,
					text: 'How does the experimental enthalpy of vaporization compare to the value you predicted? Can you explain any differences?',
					quiz: [
						{
							type: 'text',
							storeAs: 'HypAns7',
							text: 'Type your answer here'
						}
					]
				}
			]
		},
	]
}
