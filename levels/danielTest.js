
LevelData = {
	levelTitle: 'Two Component Phase Equilibrium',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 1, col: Col(150, 100, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 4, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 1, col: Col(0, 255, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(350, 50), P(350, 400), P(50, 400)], handler: 'cVIsothermal', temp: 398.15, handle: 'wally', /*, border: {type: 'open', thickness: 5, yMin: 30}*/}
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(300, 325), count: 1000, temp: 398.15, returnTo: 'wally', tag: 'wally'},
					// {spcName: 'ugly', pos: P(55, 55), dims: V(150, 200), count: 0, temp: 398.15, returnTo: 'wally', tag: 'wally'},
					
					
				],
				objs: [
					// {
						// type: 'AuxImage',
						// attrs: {handle: 'picci', slotNum: 0, imgFunc: 'img("img/work/block0Pic1.jpg")'}
					// },
					// {
						// type: 'Liquid',  
						// attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700}, makePhaseDiagram: true, triplePointTemp: 300, criticalPointTemp: 500/*,primaryKey: 'heavy', actCoeffType: 'vanlaar', actCoeffInfo: {spc1:.9227, ugly: 1.67}, makePhaseDiagram: true*/}
					// },
					// {
						// type: 'DragWeights',
						// attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 3}], weightScalar: 30, pInit: 2, cleanUpWith: 'prompt1'}
					// },
					// {
						// type: 'Cell',
						// attrs: {pos: P(150, 150), rad: 100, col: Col(30, 200, 30), handle: 'squishy', parentWallHandle: 'wally', temp: 100, dots: {fairy: 100}, boundingCorner: P(50, 50), boundingVector: V(400, 350), numCorners: 12, col: Col(0, 150, 0), innerChanceTransport: {spc1: 0}, outerChanceTransport: {spc1: 0}}
					// },
					// {
						// type: 'ActivationEnergyPair',
						// attrs: {spcNameLow: 'ugly', spcNameHigh: 'fairy', thresholdEnergy: 12}
					// },
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty'/*, liquidHandle: 'swishy'*/}
					},
					// {
						// type: 'Heater',
						// attrs: {wallInfo: 'wally', max: 3, handle: 'other', offset: V(70, 0), sliderIdx: 0}
					
					
					// },
					// {
						// type: 'Inlet',
						// attrs: {handle: 'inny', wallInfo: 'wally', width: 40, depth: 25, flows: [{spcName: 'spc1', temp:200, nDotMax: .05, tag: 'wally'}], ptIdxs: [3, 4], fracOffset: .2}
					// },
					// {
						// type: 'Outlet',
						// attrs: {handle: 'thor', wallInfo: 'wally', width: 70, depth: 30, ptIdxs: [1, 2], fracOffset: .4}
					// }
					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrowy', wallInfo: 'wally', scale: 1}
					// }
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6, makeSlider: true}
					// }

						
				],
				// triggers: [
					// {handle: 'trumpet', expr: "pExt('wally') > 7", message: 'la', requiredFor: 'section'}
				// ],
				dataRecord: [
					//{wallInfo: 'wally', data: 'internalEnergy'}
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc2', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'b', tag: 'wally'}},
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'c', tag: 'wally'}},
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'd', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				rxnsEmergent: [
					{handle: 'rxn1', rctA: 'spc1', rctB: 'spc1', activeE: .5, prods: {spc2: 2}},
					{handle: 'rxn2', rctA: 'spc2', rctB: 'spc2', activeE: 1.5, prods: {spc1: 2}}
					// {handle: 'rxn2', rctA: 'c', rctB: 'd', activeE: 10, prods: {a: 1, b: 1}}
					//{handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				],
				// rxnsNonEmergent: [
					// {rcts: [{spcName: 'spc1', count: 2}], prods: [{spcName: 'spc2', count: 1}], preExpForward: 10, activeEForward: 200, handle: 'reacty7'}
				// ],
				dataReadouts: [
					{label: 'temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					//{label: 'cell temp: ', expr: 'tempSmooth("cellSquishyInner")', units: 'K', decPlaces: 1, handle: 'cell', readout: 'mainReadout'}
					//{label: 'liq temp: ', expr: 'tempSmooth("liquidSwishy")', units: 'K', decPlaces: 1, handle: 'liqTemp', readout: 'mainReadout'}
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					//{label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					//{label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					//{label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				],
				// buttonGroups: [
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, cleanUpWith: 'prompt1', 
						// buttons: [
							// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
							// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
						// ]
					// },
					// {handle: 'tempControl', label: 'Temp control', isRadio: true,
						// buttons: [
							// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
							// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}			
						// ]
					// },
					// {handle: 'rxnControl', label: 'Rxn control', isToggle: true,
						// buttons: [
							// {handle: 'rxn1On', label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
							// {handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
							// {handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
							// {handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
						// ]
					// }
				// ],
				cmmds: [
					// //'walls.wally.isothermalStop()',
					//'spcs.spc1.place([{pos: P(150, 200)/*P(230, 116.0)*/, dir: V(1, 1), temp: 40, tag: "wally", returnTo: "wally"}])'
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				],
				graphs: [
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole frac", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'fracRct', label:'frac\nRct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'spc1', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5},
							{handle:'fracProd', label:'frac\nProd', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'spc2', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
					// {type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "eq const", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						// sets:[
							// {handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'c', tag: 'wally'}) * frac('wally', {spcName: 'd', tag: 'wally'}) / (frac('wally', {spcName: 'a', tag: 'wally'}) * frac('wally', {spcName: 'b', tag: 'wally'}))"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						// ]
					// },
					// {type: 'Scatter', handle: 'tempvstime', xLabel: "vol", yLabel: "pExt (K)", axesInit:{x:{min:0, step:3}, y:{min:0, step:2}}, numGridLines: {x: 3, y: 10},
						// sets:[
							// {handle:'temp', label:'temp', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("wally")', y: "pExt('wally')"}, trace: true, fillInPts: true, fillInPtsMin: 5}
						// ]
					// }
						
					 // {type: 'Hist', handle: 'PvsVOne', xLabel: "xLabel", yLabel: "yLabel", axesInit:{x:{min:0, step:50}, y:{min:0, step:10}}, 
						// sets:[
							// {handle:'pExt', barCol:Col(255,50,50), data:"vDist('wally', {spcName: 'spc1', tag: 'wally'})"}
						// ]
					// }
					// {type: 'Scatter', handle: 'PvsVTwo', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:4}}, 
						// sets:[
							// {handle:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("wally")', y: 'pExt("wally")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						// ]
					// }

				],
			},
			prompts: [
				{
					sceneData: {
						objs: [
			
						],
						// triggers: [
							// {handle: 'trumpet', expr: "pExt('wally') > 3", message: 'la', requiredFor: 'prompt1', checkOn: 'conditions'}
						// ],
						
						// objs: [
							// {
								// type: 'AuxImage',
								// attrs: {handle: 'piccy', slotNum: 1, imgFunc: 'img(img/refresh.gif)'}
							// }
						
						// ],
					},
					quiz: [
						{
							type: 'textSmall',
							label: 'foo',
							text: 'hello',
							questionText: 'woopydoo',
							CWQuestionId: 1234,
							messageWrong: 'hello',
							storeAs: 'theAnswer'
						
						}
					],
					title: 'wooo!',
					text: 'Woink.',
					directions: function() {
						with (DataGetFuncs) {
							if (get('theAnswer') == '12') {
								return 'branchPromptsPostClean(LevelData.auxPrompts.spare)';
							} else if (get('theAnswer') == '24') {
								return 'branchSections(LevelData.auxSections.goofy)';
							} else {
								return 'advance()';
							}
						}
					}
				},
				{
					text: 'hello',
					quiz: [
						{
							type: 'multChoice',
							CWQuestionId: 5499,
							storeAs: 'bop',
							options: [
								{text: 'hello', CWAnswerId: 567567},
								{text: 'chjas', CWAnswerId: 243523}
					
							]
						}
					]
				}
			]
		},
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', handle: 'wapple'} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(200, 200), count: 199, temp: 300, returnTo: 'wapple', tag: 'wapple'} 
				],		
				objs: [
					{
						type: 'DragWeights',
						attrs: {handle: 'draggy', wallInfo: 'wapple', weightDefs: [{count: 2, pressure: 1}], pInit: .5}
					}
				],
				graphs: [
					{type: 'load', handle: 'PvsVTwo',
						sets:[
							{handle:'pExt2', label:'pExt2', pointCol:Col(50,200,50), flashCol:Col(255,200,200), data:{x: 'vol("wapple")', y: 'pExt("wapple")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'load', handle: 'liquidSwishy'}
				]
			},
			prompts: [
				{
					title: 'section 1',
					text: 'eval(get("theAnswer", "int") * 2) hello people faces',
					sceneData: {
						
					}
				}
			
			]
			
		}

			
	],
	auxSections: {
		goofy: [
			{
				sceneData: {
					walls: [
						{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', handle: 'wapple'} 
					],
					dots: [
						{spcName: 'spc1', pos: P(55, 55), dims: V(200, 200), count: 199, temp: 300, returnTo: 'wapple', tag: 'wapple'} 
					],		
					objs: [
						{
							type: 'DragWeights',
							attrs: {handle: 'draggy', wallInfo: 'wapple', weightDefs: [{count: 2, pressure: 1}], pInit: .5}
						},
					],
				},
				prompts: [
					{
						text: 'The wonderful text',
						title: 'worp'
					},
					{
						text: 'The superb text',
						title: 'worp',
						quiz: [
							{
								type: 'textSmall',
								label: 'foo',
								text: 'hello',
								messageWrong: 'hello',
								storeAs: 'theBranch'
							
							}
						],
						directions: function() {
							with (DataGetFuncs) {
								if (get('theBranch') == 'hello') {
									return 'branchSections(LevelData.auxSections.secondLevel)';
								}
							}
							
						}
					}
				]
			}
		
		],
		secondLevel: [
			{sceneData: undefined,
				prompts: [
					{title: 'deeper section',
					text: 'deeper text'
					}
				]
			}
		
		]
	},
	auxPrompts: {
		spare: [
			//list of prompts
			{
				sceneData: undefined,
				title: 'hello',
				text: 'also hello'
			}
		]
	}

}
