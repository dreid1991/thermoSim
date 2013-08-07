LevelData = {
	levelTitle: 'Testing!',

	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, sF298: 0, col: Col(200, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ugly', m: 4, r: 2, sF298: 0, col: Col(52, 90, 224), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 2, sF298: 20, col: Col(255, 30, 62), cv: 3 * R, hF298: -12, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, sF298: 0, col: Col(255, 255, 255), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: 0.3},
		{spcName: 'ugliest', m: 4, r: 2, sF298: -16.6667s, col: Col(255, 30, 62), cv: 3 * R, hF298: -15, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [
		{//S0	
		sceneData: undefined, 	
		prompts:[
			{//p0, q0
				sceneData:undefined,
				cutScene:true,
				text:"<p>In this simulation we're going to investigate the distinction between chemical reaction rate and equilibrium. In your own words, how would you explain the difference between reaction rate and equilibrium?</p>",
				quiz:[
					{
						storeAs: 'foo1', 
						type:'text', 
						text:'Type your answer here.', 
					}, 
				]	
			},	 
		]
		},	
		{//S1
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', isothermalRate: 5, temp: 300, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 300, returnTo: 'wally', tag: 'wally'}
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
					// {
						// type: 'DragWeights',
						// attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 2}], pInit: 3}
					// },
					// {
						// type: 'ActivationEnergyPair',
						// attrs: {spcNameLow: 'ugly', spcNameHigh: 'uglier', activationEnergy: 3}
					// },
					// {
						// type: 'Heater',
						// attrs:{wallInfo: 'wally', tempMax: .1, handle: 'heaty', max: 2.5}
					// }

					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrowy', wallInfo: 'wally', scale: 1}
					// }
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6}
					// }

						
				],
				triggers: [
					//{handle: 'trumpet', expr: "pExt('wally') > 3", alertUnsatisfied: 'la', requiredForAdvance: false}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugly', tag: 'wally'}},
					//{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'uglier', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					//{label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					//{label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					//{label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				],
				buttonGroups: [
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, buttons: [
						// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
						// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
					// ]},
					// {handle: 'tempControl', label: 'Temp control', isRadio: true, buttons: [
						// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
						// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}
					// ]},
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxn1On', isRadio: true, label: 'Enable reaction', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxn1Off', isRadio: true, label: 'Disable reaction', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn2")']}
					]}
				],
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				// rxns: [
					// {handle: 'rxn1', rctA: 'ugly', rctB: 'ugly', activeE: 2, prods: {ugliest: 2}},
					// {handle: 'rxn2', rctA: 'ugliest', rctB: 'ugliest', activeE: 3, prods: {ugly: 2}}
				// ],
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 2, activeEForward: 15, handle: 'reacty7'},
					{rcts: [{spcName: 'ugliest', count: 2}], prods: [{spcName: 'ugly', count: 2}], preExpForward: 2, activeEForward: 15, handle: 'reacty7'},
				],
				graphs: [
					{type: 'Scatter', handle: 'molAtime', xLabel: "time", yLabel: "mole fraction of A", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'moles', label:'frac A', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: "time('wally')", y: "frac('wally', {spcName: 'ugly', tag: 'wally'})"}, trace: true, showPts: false, fillInPtsMin: 5}
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
					sceneData: undefined, 
					cutScene: false, 
					text: '<p>We first consider the case where A can react to form B, but B cannot react in "reverse" to form A. A will be represented by a blue molecule and B by a red molecule.</p><p> The isothermal system above is held at 300 K. You can start the reaction by clicking "enable reaction." How long does it take for 75% of the A to be consumed?</p>', 
					quiz:[
							{
								storeAs: 'foo2', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
							}, 
					]
				}
			]
		}
	]
}	