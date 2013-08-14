LevelData = {
	levelTitle: 'Hypothetical Paths: Phase Change',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(252, 0, 177), cv: 1.5 * R, hF298: -10, hVap298: 2.64068, antoineCoeffs: {a: 5.93, b:1031.7, c: 273.4-273.15}, cpLiq: 25, spcVolLiq: 0.8},
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
									text: 'Type your answer here.'
									}
								]	
				},
			]
		},		
		{//First Scene
			sceneData: {//Scene 0
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'firstWall', vol: 0.89, border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 350, returnTo: 'firstWall', tag: 'firstWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'firstWall', min:2, init: 3, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'firstWall', max: 1, liquidHandle: 'liq1'}
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
									text: ''
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
									preText: 'The Antoine coefficients are: ##A = 5.93, B = 1031.7, C = 0.25##',
									text: '',
									units: 'bar',
									storeAs: 'HypAns3'
								}
							]
						},
						{//Prompt 1
							sceneData: undefined,
							cutScene: true,
							text: "We wish to calculate the change in enthalpy for the previous process, but only have the following: <p><br> <center><table class= 'data'><tr><th>Species</th><th>##c_{p}##(J/mol-K)</th></tr><tr><td>A liq</td><td>25</td></tr><tr><td>A vap</td><td>2.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{vap}## (kJ/mol)</th></tr><tr><td>450</td><td>2</td></tr></table> </center></br></p> The heat capacities can assumed to be constant over process's temperature range.   The enthalpy of vaporization can be assumed to be constant with respect to pressure. <p>Construct a hypothetical path that will allow you to calculate the change in system enthalpy of the previous process.  Calculate the enthalpy change for each step in your hypothetical path and record the values on a separate sheet of paper. </p> The process is: 1 mole A (liq) 400 K##\\rightarrow## 1 mole A (gas) 400 K "
						}
					]
						
					
		},
		{//Second Scene
			sceneData: {//Scene1
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', isothermalRate: 4, vol: 0.89, handle: 'secondWall', border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 400, returnTo: 'secondWall', tag: 'secondWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'secondWall', min:2, init: 5.8011, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'secondWall', max: 1, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'secondWall', handle: 'liq1', tempInit: 400, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				buttonGroups: [
					{handle: 'hypoPath', label: 'hypPath', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'iso', label: 'Heating', isDown:true, exprs: ['walls.secondWall.isothermalStop()', 'curLevel.liquidLiq1.disablePhaseChange()']},
							{handle: 'phaseChange', label: 'Phase Change', isDown: false, exprs: ['curLevel.liquidLiq1.enablePhaseChange()', 'walls.secondWall.isothermalInit(curLevel.liquidLiq1.temp)']}//CHANGE EXPRESSION!!
						]
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("secondWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr: 'tempSmooth("liquidLiq1")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'},
					{label: 'H: ', expr: '((enthalpy("secondWall") + 10090)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 400)*25*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 400)*25*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000', units: 'kJ', decPlaces: 1, handle: 'h', readout: 'mainReadout'},
					// {label: 'Pressure: ', expr: 'pExt("firstWall")', units: 'bar', decPlaces: 1, handle: 'pExt', readout: 'pistonPistonLeft'}
				],
				dataRecord: [
					{wallInfo: 'secondWall', data: 'enthalpy'},
					{wallInfo: 'liquidLiq1', data : 'enthalpy'}
				],
				graphs: [
					{
						type: 'Scatter', handle: 'EnthalpyVsFracGas', xLabel: 'Fraction of molecules in gas phase', yLabel: 'Enthalpy', axesInit:{y:{min:0, step:4},x:{min:0, step:0.2}}, numGridLines: {x:6, y: 5}, axesFixed:{x: true, y: true},
							sets: [
								{handle: 'fracVH', label: 'frac\nGas', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{y: '((enthalpy("secondWall") + 10090)*dotManager.lists.ALLDOTS.length/1000 + (temp("liquidLiq1") - 400)*25*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000)) / 1000 || (temp("liquidLiq1") - 400)*25*(curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length/1000) / 1000 ', x: 'dotManager.lists.ALLDOTS.length/(dotManager.lists.ALLDOTS.length + curLevel.liquidLiq1.dotMgrLiq.lists.ALLDOTS.length)'},trace: true, fillInPts: true, fillInPtsMin: 5}
							]
					}
				]
			},
			prompts:[
				{//Prompt 0
					sceneData: undefined,
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
					sceneData: undefined,
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
					sceneData: undefined, 
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
		{//Third Scene
			sceneData: {},
			prompts: [
				{//Prompt 0
					sceneData: undefined,
					cutScene: true,
					text: "Now that we know the enthalpy of vaporization at 400 K is xxxx kJ, calculate the heat required for the real process. <p><br> <center><table class= 'data'><tr><th>Species</th><th>##c_{p}##(J/mol-K)</th></tr><tr><td>A liq</td><td>25</td></tr><tr><td>A vap</td><td>2.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{vap}## (kJ/mol)</th></tr><tr><td>425</td><td>2</td></tr></table> </center></br></p>",
					quiz: [
						{
							type: 'textSmall',
							text: '',
							units: 'kJ',
							storeAs: 'HypAns8'
						}
					]
				}
			]
		},
		{//Fourth Scene
			sceneData: {
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'firstWall', vol: 0.89, border: {type: 'open', yMin: 40},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 350, returnTo: 'firstWall', tag: 'firstWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'firstWall', min:2, init: 3, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'firstWall', max: 1, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'firstWall', handle: 'liq1', tempInit: 350, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("firstWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr: 'tempSmooth("liquidLiq1")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'},
					{label: 'Pressure: ', expr: 'pExt("firstWall")', units: 'bar', decPlaces: 1, handle: 'pExt', readout: 'pistonPistonLeft'}
				],
			},
			prompts: [
				{//Prompt 0
					sceneData: undefined,
					text: 'Let`s perform the process again. This time the enthalpy change of the process is displayed and graphed. As before heat the system from 350 K to 450 K.',
					quiz: [
						{
							type: 'text',
							preText: 'How does the enthalpy of the real process compare to that which you calculated?',
							storeAs: 'HypAns9',
							text: 'Type your answer here'
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
