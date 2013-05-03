LevelData = {
	levelTitle: 'Chemical reaction rate and equilibrium',

	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ugly', m: 4, r: 2, col: Col(255, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 2, col: Col(255, 255, 255), cv: 3 * R, hF298: -15, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [
		// {//S0	
		// sceneData: undefined, 	
		// prompts:[
			// {//p0, q0
				// sceneData:undefined,
				// cutScene:true,
				// text:"<p>In this simulation we're going to investigate the distinction between chemical reaction rate and equilibrium. In your own words, how would you explain the difference between the reaction rate and equilibrium?</p>",
				// quiz:[
					// {
						// storeAs: 'foo1', 
						// type:'text', 
						// text:'Type your answer here.', 
					// }, 
				// ]	
			// },	 
		// ]
		// },	
		{//S1
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 400, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 200, returnTo: 'wally', tag: 'wally'}
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
					{wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'uglier', tag: 'wally'}}
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
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, buttons: [
						// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
						// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
					// ]},
					// {handle: 'tempControl', label: 'Temp control', isRadio: true, buttons: [
						// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
						// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}
					// ]},
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxn1On', isDown: true, label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
					]}
				],
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				rxns: [
					{handle: 'rxn1', rctA: 'ugly', activeE: 5, prods: {uglier: 1}},
					//{handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'molATime', xLabel: "time", yLabel: "moles A", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 4}, axesFixed: {y: false},
						sets:[
							{handle:'moles', label:'moles A', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: "time('wally')", y: "moles('wally', {spcName: 'ugly', tag: 'wally'})"}, trace: true, showPts: false, fillInPtsMin: 5}
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
					text: 'We first consider the case where A can react to form B, but B cannot react in "reverse" to form A. A will be represented by a red molecule and B by a blue molecule. The isothermal system above is held at 300 K. You can start the reaction by clicking "enable reaction" How long does it take for 75% of the A to be consumed?', 
					quiz:[
							{
								storeAs: 'foo2', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'In your experiment, do the A molecules react every time they collide with another molecule? Explain.', 
					quiz:[
							{
								storeAs: 'foo3', 
								type:'text', 
								text:'Type your thoughts here.', 
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: "Now let's try to make the reaction happen faster. Enter a temperature you'd like to conduct this experiment at to speed it up and click 'submit'.", 
					quiz:[
							{
								storeAs: 'foo4', 
								type:'textSmall', 
								units: 'K',
								text:'', 
							}, 
					]
				},
			]
		},	
		{//S2
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 'get("foo4", "string", "noValue")', handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 200, returnTo: 'wally', tag: 'wally'}
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
					{wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'uglier', tag: 'wally'}}
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
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, buttons: [
						// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
						// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
					// ]},
					// {handle: 'tempControl', label: 'Temp control', isRadio: true, buttons: [
						// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
						// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}
					// ]},
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxn1On', isDown: true, label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
					]}
				],
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				rxns: [
					{handle: 'rxn1', rctA: 'ugly', activeE: 5, prods: {uglier: 1}},
					//{handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'molA-time', xLabel: "time", yLabel: "moles A", axesInit:{x:{min:0, step:80}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'moles', label:'moles A', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: "time('wally')", y: "moles('wally')", trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}}
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
			prompts:[
				{
					sceneData: undefined, 
					cutScene: false, 
					text: "Here is the same system, except at get('foo4', 'string', 'noValue') K instead of 300 K. Last time you said it took get('foo2', 'string', 'noValue') seconds for 75% of A to be consumed. When you're ready, click 'enable' and find out how long it takes this time. Enter the time you find in the text box.", 
					quiz:[
							{
								storeAs: 'foo5', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
							}, 
					]
				}
			]		
		},
		{//S3	
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "Your results are shown in the table below. Can you explain the data's behavior from a physical perspective?<p><table class = 'data' border='1'><tr><td>Temp (K)</td><td>Time (s)</td></tr><tr><td>300</td><td>get('foo2', 'string', 'noValue')</td></tr><tr><td>get('foo4', 'string', 'noValue')</td><td>get('foo5', 'string', 'noValue')</td></tr></table></p>", 
					quiz:[
							{
								storeAs: 'foo5', 
								type:'text',
								text:'Type your answer here.', 
							},
					
					]
				}
			]
		},
		{//S4
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "Let's consider why the rate changes with temperature (or the reactivity of A). The activation energy of this reaction is 10 kJ/mol and the pre-exponential constant is Y. Using the Arrhenius equation, graph the reaction rate constant with respect to temperature from 0 to 1000 K. Do you have any ideas as to why the rate behaves this way with respect to temperature?", 
					quiz:[
							{
								storeAs: 'foo6', 
								type:'text',
								text:'Type your answer here.', 
							},
					
					]
				}
			]
		},
		{//S5
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "Now let's try ...How do you think the fraction of white molecules will change with temperature?", 
					quiz:[
							{
								storeAs: 'foo6', 
								type:'text',
								text:'Type your answer here.', 
							},
					
					]
				}
			]
		},
		{//S6
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 300, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 50, returnTo: 'wally', tag: 'wally'}
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
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'duckling', activationEnergy: 3}
					},
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
					// {wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'duckling', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				// dataReadouts: [
					// {label: 'woop: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					// {label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					// {label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					// {label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				// ],
				// buttonGroups: [
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, buttons: [
						// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
						// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
					// ]},
					// {handle: 'tempControl', label: 'Temp control', isRadio: true, buttons: [
						// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
						// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}
					// ]},
					// {handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						// {groupHandle: 'rxnControl', handle: 'rxn1On', isDown: true, label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
				// ],
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				// rxns: [
					// {handle: 'rxn1', rctA: 'ugly', activeE: 5, prods: {uglier: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "frac hot spc", axesInit:{x:{min:0, step:80}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'duckling', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
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
					text: 'Here is a system of A at 50 K. When a molecule reaches the activation energy, it will turn white. The mole fraction of white excited molecules is graphed with respect to temperature. Why do you not see (many/any) white excited molecules at this temperature?', 
					quiz:[
							{
								storeAs: 'foo2', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
							}, 
					]
				},
			]
		},
		{//S7
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 300, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 50, returnTo: 'wally', tag: 'wally'}
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
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'duckling', activationEnergy: 3}
					},
					{
						type: 'Heater',
						attrs:{wallInfo: 'wally', tempMax: .1, handle: 'heaty', max: 2.5, makeSlider: true}
					},

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
					// {wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'duckling', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				// dataReadouts: [
					// {label: 'woop: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					// {label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					// {label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					// {label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				// ],
				// buttonGroups: [
					// {handle: 'heaterState', label: 'Heater', prefIdx: 1, isRadio: true, buttons: [
						// {handle: 'on', label: 'On', isDown: true, exprs: ['curLevel.heaterHeaty.enable()']},
						// {handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']}
					// ]},
					// {handle: 'tempControl', label: 'Temp control', isRadio: true, buttons: [
						// {handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
						// {handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']}
					// ]},
					// {handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						// {groupHandle: 'rxnControl', handle: 'rxn1On', isDown: true, label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
				// ],
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				// rxns: [
					// {handle: 'rxn1', rctA: 'ugly', activeE: 5, prods: {uglier: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "frac hot spc", axesInit:{x:{min:0, step:10}, y:{min:0, step:.2}}, numGridLines: {y: 4}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'duckling', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
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
					text: 'Now try heating the system until it reaches 200 K. Describe how the xHot changes with temperature.', 
					quiz:[
							{
								storeAs: 'foo', 
								type:'text', 
								text:'', 
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'How does the graph of xHot vs. temperature compare to your graph of reaction rate vs. temperature?', 
					quiz:[
							{
								storeAs: 'foo', 
								type:'text', 
								text:'', 
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'Can you come up with a physical explanation for why reaction rate behaves as described by the Arrhenius equation?', 
					quiz:[
							{
								storeAs: 'foo', 
								type:'text', 
								text:'', 
							}, 
					]
				},
			]
		},
		{//S8
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "Now let's introduce the reverse reaction, B --> A, to our system. The enthalpy and entropy of reaction for A --> B are -5 kJ/mol and -50 J/mol-K respectively. With the isothermal system held at 500 K, what will the equilibrium mole fraction of A be?", 
					quiz:[
							{
								storeAs: 'foo6', 
								type:'text',
								text:'Type your answer here.', 
							},
					
					]
				}
			]
		},
		{//S9
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 500, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 70), dims: V(420, 290), count: 600, temp: 500, returnTo: 'wally', tag: 'wally'}
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
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'duckling', activationEnergy: 10}
					},
					{
						type: 'Heater',
						attrs:{wallInfo: 'wally', tempMax: .1, handle: 'heaty', max: 2.5, makeSlider: true}
					},

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
					// {wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'duckling', tag: 'wally'}}
					// {wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}},
					//{data: 'collisions'}
				],
				// dataReadouts: [
					// {label: 'woop: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					// {label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					// {label: 'Coll/sec: ', expr: 'collisions()', units: '', decPlaces: 0, handle: 'lala', readout: 'mainReadout'}
					// {label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					// {label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					// {label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				// ],
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
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxnOff', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']}
						],
					}
					],	
				// cmmds: [
					// 'walls.wally.isothermalStop()',
					// {type: 'span', spawn: 'walls.wally.isothermalInit()', remove: 'walls.wally.isothermalStop()', cleanUpWith: 'prompt1'}
				// ],
				// rxns: [
					// {handle: 'rxn1', rctA: 'ugly', activeE: 5, prods: {uglier: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "frac hot spc", axesInit:{x:{min:0, step:80}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'duckling', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
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
			prompts:[
				{
					sceneData: undefined, 
					cutScene: false, 
					text: "Now let's perform the experiment with both the forward and reverse reaction. Click 'enable' to start the reaction. How long does it take for the system to reach the equilibrium mole fraction of A you predict?", 
					quiz:[
							{
								storeAs: 'foo6', 
								type:'textSmall',
								units:'s',
								text:'', 
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: false,
					text: "What can you say about the rates of the forward and reverse reaction now that the system is at equilibrium?",
					quiz:[
							{
								storeAs: 'foo6', 
								type:'text',
								text:'Type your answer here.', 
							},
					
					]
				}
			]
		}
	]
}

