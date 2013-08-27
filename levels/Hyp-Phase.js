LevelData = {
	levelTitle: 'Hypothetical Paths: Phase Change',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(252, 0, 177), cv: 1.5 * R, hF298: -10, hVap298: 30.92, antoineCoeffs: {a: 7.4, b:1622.4, c: -20}, cpLiq: 40, spcVolLiq: 0.8},
		{spcName: 'spc2', m: 3, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		{//First Scene
			sceneData: {//Scene 0
			},
			prompts:[ 
				{//Prompt 0
				sceneData: undefined,
							cutScene: true,
							text:" <p>Today we're going to examine hypothetical paths and how they can be used to determine unknown thermodynamic process values.</p><p>The use of hypothetical paths is entirely dependent on state functions. Please identify here what you believe are the distinguishing characteristics that make a thermodynamic property a state function.</p>",
							quiz:[
									{type: 'text',
									storeAs:'HypAns1',
									text: 'Type your answer here.',
									CWQuestionId: 64
									}
								]	
				},
			]
		},		
		{//First Scene
			sceneData: {//Scene 0
				walls: [
					{pts: [P(20,30), P(530,30), P(530,440), P(20,440)], handler: 'staticAdiabatic', handle: 'firstWall', vol: 0.89, border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 350, returnTo: 'firstWall', tag: 'firstWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'firstWall', min:2, init: 1.8, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'firstWall', max: 2, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'firstWall', handle: 'liq1', tempInit: 350, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("firstWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr: 'tempSmooth("liquidLiq1")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'},
					// {label: 'Pressure: ', expr: 'pExt("firstWall")', units: 'bar', decPlaces: 1, handle: 'pExt', readout: 'pistonPistonLeft'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(temp("firstWall"), 450) < 0.05', message: 'Heat the system to 450 K', checkOn: 'conditions', requiredFor: 'prompt0'},
					{handle: 'freeze1', expr: 'temp("firstWall") >= 450 && dotManager.lists.ALLDOTS.length == 1000', satisfyCmmds: ['curLevel.heaterHeaterOne.disable()', 'walls.firstWall.isothermalInit(450)'], requiredFor: 'prompt0'}
				]
			},
			prompts:[ 
						{//Prompt 0
							sceneData: undefined,
							text: " Above is a constant pressure system containing 1 mole of species A in the liquid phase at 350 K.  Heat the system until it reaches 450 K and all of species A is vaporized.",
							quiz: [
								{
									type: 'textSmall',
									preText: 'At what temperature did the liquid vaporize?',
									units: 'K',
									storeAs: 'HypAns2',
									text: '',
									CWQuestionId: 65
								}
							]
						},
						{
							sceneData: undefined,
							cutScene: true,
							text: '<p>The liquid in the process vaporized at 400 K. Using the Antoine Equation calculate the pressure at which the process took place.',
							quiz: [
								{
									type: 'textSmall',
									preText: 'The Antoine coefficients are: <p>##A = 7.4, B = 1622.2 K, C = -20 K##</p> <p>Pressure is in ##mmHg##.</p>',
									text: '',
									units: 'bar',
									storeAs: 'HypAns3',
									CWQuestionId: 66
								}
							]
						},
						{//Prompt 1
							sceneData: undefined,
							cutScene: true,
							text: "We wish to calculate the change in enthalpy for the previous process, but only have the following: <p> <center><table class= 'data'><tr><th>Species</th><th>##c_{p}##(J/mol-K)</th></tr><tr><td>A liq</td><td>40</td></tr><tr><td>A vap</td><td>2.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{vap}## (kJ/mol)</th></tr><tr><td>450</td><td>28</td></tr></table> </center></p> The heat capacities can be assumed to be constant over the entire temperature range of the process.   The enthalpy of vaporization can be assumed to be constant with respect to pressure. <p>Construct a hypothetical path that will allow you to calculate the change in system enthalpy of the previous process.  Calculate the enthalpy change for each step in your hypothetical path and record the values on a separate sheet of paper. </p> The process is: 1 mole A (liq) 400 K##\\rightarrow## 1 mole A (gas) 400 K "
						},
						{//Prompt 2
							sceneData: undefined,
							cutScene: true,
							text: '<p>Input your enthalpy change values for each step below</p>',
							quiz: [
								{type: 'textSmall',
								storeAs: 'step1',
								units: 'kJ',
								preText: '##\\Delta H## of step 1: ',
								text: '',
								CWQuestionId: 67},
								{type: 'textSmall',
								storeAs:'step2',
								units: 'kJ',
								preText: '##\\Delta H## of step 2: ',
								text: '',
								CWQuestionId: 68},
								{type: 'textSmall',
								storeAs: 'step3',
								units: 'kJ',
								preText: '##\\Delta H## of step 3: ',
								text: '',
								CWQuestionId: 69}
							]
						}
					]
						
					
		},
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
						attrs: {handle: 'heaterOne', wallInfo: 'secondWall', max: 1, liquidHandle: 'liq1'}
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
				triggers: [
					{handle: 'path0', expr: 'curLevel.liquidLiq1.temp > 448 && curLevel.liquidLiq1.temp < 452', message: 'What should the temperature be at the end of the first step?', checkOn: 'conditions', requiredFor: 'prompt0'},
					{handle: 'path1', expr: 'curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length < 10 && fracDiff(temp("secondWall"), 450) < 0.1', message: 'What state and temperature should species A be at the end of the second step?', checkOn: 'conditions', requiredFor: 'prompt1'},
					{handle: 'path2', expr: 'fracDiff(temp("secondWall"), 400) <= 0.08', message: 'What should the temperature be at the end of the third step?', checkOn: 'conditions', requiredFor: 'prompt2'},
					// {handle: 'pathFreeze0', expr: 'curLevel.liquidLiq1.temp >= 450', satisfyCmmds: ['curLevel.heaterHeaterOne.disable()', 'buttonManager.clickButton("Heat", "iso")', 'walls.secondWall.isothermalInit(450)'], requiredFor: 'prompt0'},
					{handle: 'pathFreeze1', expr: 'curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length == 0', satisfyCmmds: ['buttonManager.clickButton("Phase", "disablePhase")', 'buttonManager.hideButton("Phase", "enablePhase")'], requiredFor: 'prompt1'},
				],
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
						cmmds: [
							'buttonManager.hideButton("Phase", "enablePhase")'
						]
					},
					text: " Now we're going to carry out your hypothetical path.  Above is species A in the same initial state as the previous system. You can use the buttons to the right to set whether the system is isothermal and whether phase change occurs.<p> Take the first step in your hypothetical path.",
					quiz:[
						{
							type: 'text',
							preText: 'How does the enthalpy change compare to the value you calculated?',
							text: 'Type your answer here',
							storeAs: 'HypAns4',
							CWQuestionId: 70
						}
					]
				},
				{//Prompt 1
					sceneData: {
						cmmds: [
							'curLevel.heaterHeaterOne.enable()',
							'buttonManager.clickButton("Heat", "iso")',
							'buttonManager.hideButton("Heat", "adiabatic")',
							'$($("button")[0]).hide()',
							'buttonManager.showButton("Phase", "enablePhase")'
						],
					},
					text: '<p>Take the next step in your hypothetical path. If you are vaporizing, you may want to have the system be isothermal at this step to make sure the enthalpy of vaporization is equal to the tabulated value.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy change of this step compare to the value you calculated?',
							storeAs: 'HypAns5',
							text: 'Type your answer here',
							CWQuestionId: 71
						}
					]
				},
				{//Prompt 2
					sceneData: {
						cmmds: [
							'curLevel.heaterHeaterOne.enable()',
							'buttonManager.hideButton("Phase", "enablePhase")',
							'buttonManager.showButton("Heat", "adiabatic")'
						]
					},
					text: '<p>Take the final step in your hypothetical path.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy change of this step compare to the value you calculated?',
							storeAs: 'HypAns6',
							text: 'Type your answer here',
							CWQuestionId: 72
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
							text: 'Type your answer here',
							CWQuestionId: 73
						}
					]
				}
			]
		},
		{//Third Scene
			sceneData: {},
			prompts: [
				{//Prompt 0
					sceneData: undefined,
					cutScene: true,
					text: "Now that we know the enthalpy of vaporization at 400 K is 2.2 kJ/mol, calculate the heat required for the real process:<p>##A (liquid, 350 K) \\rightarrow A(vapor, 450 K)##<p><br> <center><table class= 'data'><tr><th>Species</th><th>##c_{p}##(J/mol-K)</th></tr><tr><td>A liq</td><td>25</td></tr><tr><td>A vap</td><td>2.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{vap}## (kJ/mol)</th></tr><tr><td>450</td><td>2.0</td></tr></table> </center></br></p>",
					quiz: [
						{
							type: 'textSmall',
							text: '',
							units: 'kJ',
							storeAs: 'HypAns8',
							CWQuestionId: 74
						}
					]
				}
			]
		},
		{//Fourth Scene
			sceneData: {
				walls: [
					{pts: [P(20,30), P(530,30), P(530,440), P(20,440)], handler: 'staticAdiabatic', handle: 'thirdWall', vol: 0.89, border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 350, returnTo: 'thirdWall', tag: 'thirdWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'thirdWall', min:2, init: 1.8, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'thirdWall', max: 2, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'thirdWall', handle: 'liq1', tempInit: 350, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("thirdWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr: 'tempSmooth("liquidLiq1")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'},
					{label: 'Pressure: ', expr: 'pExt("thirdWall")', units: 'bar', decPlaces: 1, handle: 'pExt', readout: 'pistonPistonLeft'},
					// {label: 'q: ', expr: 'q("thirdWall")', units: 'kJ', decPlaces: 1, handle: 'qwer', readout: 'mainReadout'},
					{label: 'H: ', expr: '((enthalpy("thirdWall") + 38839.93)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 350)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 350)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000', units: 'kJ', decPlaces: 1, handle: 'h', readout: 'mainReadout'},
				],
				dataRecord: [
					{wallInfo: 'thirdWall', data: 'enthalpy'},
					{wallInfo: 'liquidLiq1', data: 'enthalpy'},
				],	
				graphs: [
					{
						type: 'Scatter', handle: 'EnthalpyVsFracGas', xLabel: 'Fraction of molecules in gas phase', yLabel: 'Enthalpy', axesInit:{y:{min:0, step:8},x:{min:0, step:0.2}}, numGridLines: {x:6, y: 5}, axesFixed:{x: true, y: true},
							sets: [
								{handle: 'fracVH', label: 'frac\nGas', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{y: '((enthalpy("thirdWall") + 38839.93)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 350)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 350)*curLevel.liquidLiq1.Cp*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000 ', x: 'dotManager.lists.ALLDOTS.length/(dotManager.lists.ALLDOTS.length + curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length)'},trace: true, fillInPts: true, fillInPtsMin: 5}
							]
					}
				],
				triggers:[
					{handle: 'artichoke', expr: 'temp("thirdWall") >= 440 && curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length == 0', message: 'Heat the system to 450 K', checkOn: 'conditions', requiredFor: 'prompt0'},
					{handle: 'eggplant',  expr: 'temp("thirdWall") >= 450 && curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length == 0', satisfyCmmds: ['walls.thirdWall.isothermalInit(450)', 'curLevel.heaterHeaterOne.disable()'], requiredFor: 'prompt0'}
				]
			},
			prompts: [
				{//Prompt 0
					sceneData: {
						cmmds: [
							'$($("button")[0]).show()'
						]
					},
					text: 'Let\'s perform the process again. This time the enthalpy change of the process is displayed and graphed. As before heat the system from 350 K to 450 K.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy of vaporization of the real process compare to that which you calculated using hypothetical paths?',
							storeAs: 'HypAns9',
							text: 'Type your answer here',
							CWQuestionId: 75
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
					text: 'You have completed the simulation.'
				}
			]
		}
	]
}
