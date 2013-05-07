
LevelData = {
	levelTitle: 'Interactive Virtual Laboratories',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		// {spcName: 'a', m: 4, r: 1, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'b', m: 4, r: 1, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'c', m: 4, r: 1, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -13, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'd', m: 4, r: 1, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -13, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc1Cole', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 30, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2Cole', m: 4, r: 2, col: Col(0, 200, 0), cv: 2.5 * R, hF298: -11, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3Cole', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc1', m: 4, r: 1, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 1, col: Col(150, 100, 100), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 1, col: Col(250, 250, 250), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					text: 'IVL group.'
				},
				{
					cutScene: true,
					text: '<p><b>Simulations created</b><br><ul><li>Work</li><li>c<sub>V</sub> vs. c<sub>P</sub></li><li>Reversibility</li></ul></p><p><b>Storyboards completed</b><ul><li>Hypothetical paths</li><li>Chemical reaction rate vs. equilibrium</li></ul></p>'
				}
			]
		},
		{//Third Scene
			sceneData: {//Scene2
				walls: [
					{pts: [P(40,30), P(510,30), P(510,400), P(40,400)], handler: 'cVIsothermal', handle: 'secondWall', temp: 500, border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1Cole', pos: P(45, 35), dims: V(440,350), count: 1000, temp: 500, returnTo: 'secondWall', tag: 'secondWall'},
				],
				rxns: [
					{handle: 'rxn1', rctA: 'spc1Cole', activeE: 7, prods: {spc2Cole:1}}
				],
				buttonGroups: [
					{handle: 'Reaction', label: 'Reaction', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'rxn1go', label: 'Enable RXN', exprs: ['collide.enableRxn("rxn1")']},
							{handle: 'rxn1stop', label: 'Disable RXN', isDown: true, exprs: ['collide.disableRxn("rxn1")']},
						]
					},
					{handle: 'Heat', label: 'Heat', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'isothermal', label: 'Isothermal', isDown: true, exprs: ['walls.secondWall.isothermalInit("current")']},
							{handle: 'adiabatic', label: 'Adiabatic', isDown: false, exprs: ['walls.secondWall.isothermalStop()']}
						]
					}
				],
				dataRecord: [
					{wallInfo: 'secondWall', data: 'frac', attrs: {spcName: 'spc2Cole', tag: 'secondWall'}},
					{wallInfo: 'secondWall', data: 'Q'},
					{wallInfo: 'secondWall', data: 'enthalpy'},
					//{wallInfo: 'firstWall', data: '
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("secondWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'x-rxn: ', expr: 'frac("secondWall", {tag:"secondWall", spcName:"spc2Cole"})', units: '', decPlaces: 2, handle: 'liqTemp', readout: 'mainReadout'}
					
				],
				
				objs: [
					// {type: 'QArrowsAmmt',
								// attrs: {handle: 'arrow', wallInfo: 'firstWall', scale: 1}
					// }
					{
						type: 'Heater',
						attrs: {wallInfo: 'secondWall', handle: 'heatyTHeater', max: 3, dims: V(130, 60)}
					}
				],
				graphs: [
							{type: 'Scatter', handle: 'EnthalpyFracVsTemp', xLabel: "Extent of rxn", yLabel: "Enthalpy", axesInit:{y:{min:110, step:10},x:{min:0, step:0.2}}, numGridLines: {x:6}, axesFixed:{x: true},
								sets: [
									{handle: 'moleFrac', label:'mole\nFrac', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{y: '(enthalpy("secondWall") + 11500) / 40',x: 'frac("secondWall",{spcName:"spc2Cole",tag: "secondWall"})'},trace: true, fillInPts: true, fillInPtsMin: 5}
								]
							},
							{type: 'Scatter', handle: 'convVsTemp', xLabel: "Extent of rxn", yLabel: "Temperature", axesInit:{y:{min:200, step:80},x:{min:0, step:0.2}}, numGridLines: {x:6}, axesFixed:{x: true},
								sets: [
									{handle: 'moleFrac', label:'mole\nFrac', pointCol:Col(50,255,50),flashCol:Col(200,255,200),data:{y: 'temp("secondWall")',x: 'frac("secondWall",{spcName:"spc2Cole",tag: "secondWall"})'},trace: true, fillInPts: true, fillInPtsMin: 5}
								]
							}
						],
			},
			prompts: [
				{sceneData: undefined,
				text:"Now we're going to carry out your hypothetical path.  Above is species A in the same initial state as the previous system.  You can use the buttons to the right to set whether the system is isothermal and whether the reaction occurs.  For this hypothetical process, the activation energy has been lowered so the reaction proceeds at 298 K and the reverse reaction has been disabled. <p> Take the first step in your hypothetical path.  "
				}
			]
		},
	]
}
