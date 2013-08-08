LevelData = {
	levelTitle: 'Hypothetical Path: Phase Change',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 2, antoineCoeffs: {a: 1.07, b:1030.6, c: 273.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
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
									storeAs:'HypAns',
									text: 'Type your answer here.'
									}
								]	
				},
			]
		},		
		{//First Scene
			sceneData: {//Scene 0
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'firstWall', border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 300, returnTo: 'firstWall', tag: 'firstWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'firstWall', min:2, init: 3, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'firstWall', max: 1, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'firstWall', handle: 'liq1', tempInit: 300, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("firstWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'}
				],
			},
			prompts:[ 
						{//Prompt 0
							sceneData: undefined,
							text: " Above is a constant pressure system containing 1 mole of species A in the liquid phase at 300 K.  Heat the system until it reaches 450 K and all of species A is vaporized.",
						},
						{//Prompt 1
							sceneData: undefined,
							cutScene: true,
							text: "We wish to calculate the change in enthalpy for the previous process, but only have the following: <p><br> <center><table class= 'data'><tr><th>Species</th><th>##c_{p}##(J/mol-K)</th></tr><tr><td>A liq</td><td>25</td></tr><tr><td>A vap</td><td>2.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{vap}## (kJ/mol)</th></tr><tr><td>425</td><td>2</td></tr></table> </center></br></p> The heat capacities can assumed to be constant over process's temperature range.   The enthalpy of vaporization can be assumed to be constant with respect to pressure. <p>Construct a hypothetical path that will allow you to calculate the change in system enthalpy of the previous process.  Calculate the enthalpy change for each step in your hypothetical path and record the values on a separate sheet of paper. </p> The process is: 1 mole A (liq) 300 K##\\rightarrow## 1 mole A (gas) 450 K "
						}
					]
						
					
		},
		{//Second Scene
			sceneData: {//Scene1
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'secondWall', border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 0, temp: 300, returnTo: 'secondWall', tag: 'secondWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'Piston', wallInfo: 'secondWall', min:2, init: 3, max: 4}
					},
					{type: 'Heater',
						attrs: {handle: 'heaterOne', wallInfo: 'secondWall', max: 1, liquidHandle: 'liq1'}
					},
					{type: 'Liquid',
						attrs: {wallInfo: 'secondWall', handle: 'liq1', tempInit: 300, spcCounts: {spc1:1000}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}}
					}
				],
				buttonGroups: [
					{handle: 'hypoPath', label: 'hypPath', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'iso', label: 'Isothermal', isDown:true, exprs: ['walls.secondWall.isothermalStop()']},
							{handle: 'phaseChange', label: 'Phase Change', isDown: true, exprs: ['collide.enablephas']}//CHANGE EXPRESSION!!
						]
					}
				] 
			},
			prompts:[
				{//Prompt 0
							sceneData: undefined,
							text: " Now we're going to carry out your hypothetical path.  Above is species A in the same initial state as the previous system. You can use the buttons to the right to set whether the system is isothermal and whether phase change occurs.<p> Take the first step in your hypothetical path. How does the enthalpy change compare to the value you calculated.   ",
				},
			]
		}
	]
}
