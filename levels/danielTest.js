
//R = 8.314; // does this need to be here?
LevelData = {
	levelTitle: 'Level template',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 2, col: Col(150, 100, 100), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 2, col: Col(250, 250, 250), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 400, handle: 'wally', vol: 10, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(55, 55), dims: V(150, 200), count: 600, temp: 100, returnTo: 'wally', tag: 'wally'},
					{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 6, temp: 100, returnTo: 'wally', tag: 'wally', cleanUpWith: 'prompt0'},
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					// {
						// type: 'AuxImage',
						// attrs: {handle: 'picci', slotNum: 0, imgFunc: 'img("img/work/block0Pic1.jpg")'}
					// },
					// {
						// type: 'Liquid',
						// attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700, ugly: 700}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3}, makePhaseDiagram: true}
					// },
					{
						type: 'DragWeights',
						cleanUpWith: 'prompt0',
						attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 2}], pInit: 3}
					},
					{
						type: 'ThresholdEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'uglier', thresholdEnergy: -7}
					},
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs:{wallInfo: 'wally', max: 1, handle: 'heaty'}
					}

					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrowy', wallInfo: 'wally', scale: 1}
					// }
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6}
					// }

						
				],
				// triggers: [
					// {handle: 'trumpet', expr: "pExt('wally') > 3", alertUnsatisfied: 'la', requiredForAdvance: true}
				// ],
				dataRecord: [
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'uglier', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				dataReadouts: [
					// {label: 'woop: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					//{label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					//{label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					//{label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				],
				buttonGroups: [
					{handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, cleanUpWith: 'prompt1', 
						buttons: [
							{handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
							{handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
						]
					},
					{handle: 'tempControl', label: 'Temp control', isRadio: true,
						buttons: [
							{handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
							{handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}			
						]
					},
					{handle: 'rxnControl', label: 'Rxn control', isToggle: true,
						buttons: [
							{handle: 'rxn1On', label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
							{handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
							{handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
							{handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
						]
					}
				],
				cmmds: [
					'walls.wally.isothermalStop()',
					{type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				],
				// rxns: [
					// {handle: 'rxn1', rctA: 'spc1', rctB: 'ugly', activeE: 15, prods: {duckling: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "frac hot spc", axesInit:{x:{min:0, step:80}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'uglier', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
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

				],
			},
			prompts: [
				{
					sceneData: {
						objs: [
			
						]
						// objs: [
							// {
								// type: 'AuxImage',
								// attrs: {handle: 'piccy', slotNum: 1, imgFunc: 'img(img/refresh.gif)'}
							// }
						
						// ],
						// listeners: [
							
							// {dataSet: {wallInfo: 'wally', data: 'pExt'}, is: 'equalTo', checkVal: 1, alertUnsatisfied: 'booo', satisfyCmmds: [{type: 'DragWeights', handle: 'draggy', cmmd: 'freeze'}]}
							
						// ],
						// dataDisplay: [
							// {wallInfo: "wally", data:'temp', readout: 'mainReadout'}
						// ]
					},
					quiz: [
						{
							type: 'textSmall',
							label: 'foo',
							text: 'hello',
							messageWrong: 'hello',
							storeAs: 'theAnswer'
						
						}
					],
					title: 'wooo!',
					text: 'Woink.'
				},
				{
					sceneData: undefined,
					text: 'hello',
					title: 'titley'
				},
				{
					sceneData: undefined,
					cutScene: true,
					title: 'hello',
					text: ' checll I am the true lorf of winterfell and they will fear me I think.',
				
					quiz: [
						{type: 'multChoice',
							options:[
								{text:"## W = -\\int_{V_{1}}^{V_{2}}P_{sys}dV ##", correct: false, messageWrong:"That's not correct"},
								{text:"## W = - V\\Delta P_{ext} ##", correct: false, messageWrong:"That's not correct"},
								{text:"## W = -P_{ext}\\Delta V ##", correct: true},
								{text:"## W = -T\\Delta V ##", correct: false, messageWrong:"That's not correct"}
							]
						},
						{type: 'multChoice',
							options:[
								{text:"fawe", messageWrong:"That's not correct"},
								{text:"## W = - V\\Delta P_{ext} ##", messageWrong:"That's not correct"},
								{text:"## W = -P_{ext}\\Delta V ##"},
								{text:"## W = -T\\Delta V ##", messageWrong:"That's not correct"}
							]
						}
					]
					
					
				},
				{
					sceneData: undefined,
					text: 'can we do another?',
					title: 'titleynext'
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
			},
			prompts: [
				{
					title: 'section 1',
					text: 'eval(get("theAnswer", "int") * 2) hello people faces'
				}
			
			]
			
		}

			
	]

}
