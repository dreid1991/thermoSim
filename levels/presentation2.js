
LevelData = {
	levelTitle: 'Interactive Virtual Laboratories',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		// {spcName: 'a', m: 4, r: 1, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'b', m: 4, r: 1, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'c', m: 4, r: 1, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -13, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		// {spcName: 'd', m: 4, r: 1, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -13, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc1Cole', m: 4, r: 2, col: Col(255, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 30, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2', m: 4, r: 2, col: Col(0, 255, 0), cv: 2.5 * R, hF298: -11, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2Purp', m: 4, r: 1, col: Col(200, 0, 200), cv: 2.5 * R, hF298: -11, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2Cole', m: 4, r: 2, col: Col(0, 255, 0), cv: 2.5 * R, hF298: -11, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3Cole', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc1', m: 4, r: 1, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 1, col: Col(0, 255, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 1, col: Col(250, 250, 250), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1},
		
		{spcName: 'uglyMatt', m: 4, r: 2, col: Col(252, 181, 33), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'ducklingMatt', m: 4, r: 2, col: Col(255, 0, 255), cv: 3 * R, hF298: -11, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		
		{//Second Scene
			sceneData: {//Scene 2
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'SecondWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc2Purp', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'},
					{spcName: 'spc1', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'}
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'SecondWall', min: 2, init: 0, max: 20, makeSlider: false}
					},
					{type: 'DragWeights',
						attrs: {handle: 'DragsOne', wallInfo: 'SecondWall', weightDefs: [{count:1, pressure:13}], weightScalar: 10, pInit: 2, pistonOffset: V(130,-41), displayText: false}
					}			
				],
				dataReadouts: [
					{handle: 'pistonpext1', expr: 'pExt("SecondWall")', readout: 'pistonReadoutPistonOne', label: 'pExt: ', units: 'bar', sigFigs: 3}
				],
				
			},
			prompts: [
				{
					cutScene: false,
					text: ''
				},
				{
					cutScene: true,
					text: '<p><b>Simulations created</b><br><ul><li>Work</li><li>c<sub>V</sub> vs. c<sub>P</sub></li><li>Reversibility</li></ul></p><p><b>Storyboards completed</b><ul><li>Hypothetical paths</li><li>Chemical reaction rate vs. equilibrium</li></ul></p>'
				}
			]
		},
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					text: '<img style="width:540px" src="WBS.png"></img>'
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
						attrs: {wallInfo: 'secondWall', handle: 'heatyTHeater', max: 3, dims: V(130, 55)}
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
		{
			sceneData: {
				walls: [
					{pts: [P(50, 250), P(450, 250), P(450, 400), P(50, 400)], handler: 'staticAdiabatic', handle: 'wally', border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 255), dims: V(380, 100), count: 400, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(55, 255), dims: V(380, 100), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'Liquid',
						attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700, ugly: 500}, primaryKey: 'heavy', actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3000}, makePhaseDiagram: true}
					},
					{
						type: 'DragWeights',
						attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 1}], pInit: 3, displayText: false}
					},
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty', liquidHandle: 'swishy'}
					},
					{
						type: 'Piston',
						attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6, makeSlider: false}
					}

						
				],
				dataReadouts: [
					{label: 'Gas temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Liq temp: ', expr: 'tempSmooth("liquidSwishy")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'}
				],

				graphs: [

				],
			},
			prompts: [
				{
					sceneData: undefined,
					text: ''
				}
			]
		},
		{//S9
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 500, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
					{spcName: 'uglyMatt', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 300, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'Heater',
						attrs:{wallInfo: 'wally', tempMax: .1, handle: 'heaty', max: 4.5, makeSlider: true}
					},


						
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'uglyMatt', tag: 'wally'}}

				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Frac prod: ', expr: '1-frac("wally", {spcName: "uglyMatt", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						],
					}
					],	
				rxns: [
					{handle: 'rxn1', rctA: 'uglyMatt', activeE: 2.5, prods: {ducklingMatt: 1}},
					{handle: 'rxn2', rctA: 'ducklingMatt', activeE: 4.5, prods: {uglyMatt: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "1-frac('wally', {spcName: 'uglyMatt', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts:[
				{
					sceneData: undefined, 
					cutScene: false,
					
					
				},
			]
		}
	]
}
