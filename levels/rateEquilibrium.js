LevelData = {
	levelTitle: 'Chemical reaction rate and equilibrium',
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, sF298: 0, col: Col(200, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ugly', m: 4, r: 2, sF298: 0, col: Col(52, 90, 224), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 2, sF298: 20, col: Col(255, 30, 62), cv: 3 * R, hF298: -12, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, sF298: 0, col: Col(255, 255, 255), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: 0.3},
		{spcName: 'ugliest', m: 4, r: 2, sF298: -3.3, col: Col(255, 30, 62), cv: 3 * R, hF298: -12.5, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
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
						CWQuestionId: 37
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
					
				],
				triggers: [
					{handle: 'trigger1', expr: "dotManager.lists.uglier.length > 450", message: 'Turn on the reaction and allow it to react.', checkOn: 'conditions', requiredFor: 'prompt0'}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'moles', attrs: {spcName: 'ugly', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugly', tag: 'wally'}},
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxn1On', isRadio: true, label: 'Enable reaction', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxn1Off', isRadio: true, label: 'Disable reaction', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn2")']}
					]}
				],
				rxns: [
					{handle: 'rxn1', rctA: 'ugly', rctB: 'ugly', activeE: 6, prods: {uglier: 2}},
				],
				graphs: [
					{type: 'Scatter', handle: 'molAtime', xLabel: "time (s)", yLabel: "mole fraction of A", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'moles', label:'frac A', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: "time('wally')", y: "frac('wally', {spcName: 'ugly', tag: 'wally'})"}, trace: true, showPts: false, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined, 
					cutScene: false, 
					text: '<p>We first consider the case where A can react to form B, but B cannot react in "reverse" to form A. A will be represented by a blue molecule and B by a red molecule.</p><p> The isothermal system above is held at 300 K. You can start the reaction by clicking "enable reaction." How long does it take for 60% of the A to be consumed?</p>', 
					quiz:[
							{
								storeAs: 'foo2', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
								CWQuestionId: 38
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'Do you believe the A molecules react every time they collide with another molecule? Explain.', 
					quiz:[
							{
								storeAs: 'foo3', 
								type:'text', 
								text:'Type your response here.', 
								CWQuestionId: 39
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: "Now let's try to make the reaction happen faster. Enter a temperature at which you would like to conduct the experiment in order to speed it up and click 'submit'.", 
					quiz:[
							{
								storeAs: 'foo4', 
								type:'textSmall', 
								units: 'K',
								text:'', 
								CWQuestionId: 40
							}, 
					]
				},
			]
		},	
		{//S2
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 'get("foo4", "float", 500, 300, 900)', handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 'get("foo4", "float", 500, 300, 900)', returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [

				],
				triggers: [
					{handle: 'trigger2', expr: "dotManager.lists.uglier.length >= 450", message: 'Turn on the reaction and allow it to react.', requiredFor: 'prompt0', checkOn: 'conditions'}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugly', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxn1On', isRadio: true, label: 'Enable reaction', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")']},
						{groupHandle: 'rxnControl', handle: 'rxn1Off', isRadio: true, label: 'Disable reaction', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn2")']},
						// {groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn2")']}
					]}
				],
				rxns: [
					{handle: 'rxn1', rctA: 'ugly', rctB: 'ugly', activeE: 6, prods: {uglier: 2}},
				],
				graphs: [
					{type: 'Scatter', handle: 'molAtime', xLabel: "time (s)", yLabel: "mole fraction of A", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'moles', label:'frac A', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: "time('wally')", y: "frac('wally', {spcName: 'ugly', tag: 'wally'})"}, trace: true, showPts: false, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts:[
				{
					sceneData: undefined, 
					cutScene: false, 
					text: "Here is the same system, except at get('foo4', 'string', 'noValue') K instead of 300 K. Last time you said it took get('foo2', 'string', 'noValue') seconds for 60% of A to be consumed. When you're ready, click 'enable' and find out how long it takes this time. Enter the time you find in the text box.", 
					quiz:[
							{
								storeAs: 'foo5', 
								type:'textSmall', 
								units: 'seconds',
								text:'', 
								CWQuestionId: 41
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
					text: "Your results are shown in the table below. Can you explain the data's behavior from a physical perspective?<p><table class = 'data' border='1'><tr><th>Temp (K)</th><th>Time (s)</th></tr><tr><td>300</td><td>get('foo2', 'string', 'noValue')</td></tr><tr><td>get('foo4', 'string', 'noValue')</td><td>get('foo5', 'string', 'noValue')</td></tr></table></p>", 
					quiz:[
							{
								storeAs: 'foo6', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 42
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "Let's consider why the rate changes with temperature (or the reactivity of A). Using the Arrhenius equation, graph on a separate piece of paper the reaction rate constant with respect to temperature from 0 to 1000 K. $$ k = Ae^{-E_{a}/{RT}} $$ The activation energy of this reaction is 150 kJ/mol and the pre-exponential constant is ##0.05 M^{-1}s^{-1}##. Why do you believe the rate behaves this way with respect to temperature?", 
					quiz:[
							{
								storeAs: 'foo7', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 43
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "<p>Now we’re going to turn off the reaction, so there will be no production of B.  However, when a molecule’s kinetic energy is above the activation energy for ##A \\rightarrow B##, we’re going to turn it white.</p><p>How to do think the fraction of white molecules will change with temperature?</p>", 
					quiz:[
							{
								storeAs: 'foo8', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 44
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
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 50, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'duckling', activationEnergy: 15}
					},
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'duckling', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "Mole Fraction Excited", axesInit:{x:{min:0, step:80}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'duckling', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'Here is a system of A at 50 K. When a molecule reaches the activation energy, it will turn white. The mole fraction of white excited molecules is graphed with respect to temperature. Why are there not many white excited molecules at this temperature?', 
					quiz:[
							{
								storeAs: 'foo9', 
								type:'text', 							
								text:'Type your answer here', 
								CWQuestionId: 45
							}, 
					]
				},
			]
		},
		{//S7
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 50, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
				],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 50, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'duckling', activationEnergy: 15}
					},
					{
						type: 'Heater',
						attrs:{wallInfo: 'wally', temp: 0, handle: 'heaty', max: 5, makeSlider: true}
					},
				],
				triggers: [
					{handle: 'trigger3', expr: "temp('wally') >= 998", message: 'Heat the system to 700 K.', requiredFor: 'prompt0', checkOn: 'conditions'}
				],
				dataRecord: [
					
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'duckling', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "temp (K)", yLabel: "Mole Fraction Excited", axesInit:{x:{min:0, step:10}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: "frac('wally', {spcName: 'duckling', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'Now try heating the system until it reaches 1000 K. Describe how the fraction of excited molecules changes with temperature.', 
					quiz:[
							{
								storeAs: 'foo10', 
								type:'text', 
								text:'Type your answer here', 
								CWQuestionId: 46
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'How does the graph of fraction of excited molecules vs. temperature compare to your graph of reaction rate vs. temperature?', 
					quiz:[
							{
								storeAs: 'foo11', 
								type:'text', 
								text:'Type your answer here', 
								CWQuestionId: 47
							}, 
					]
				},
				{
					sceneData: undefined, 
					cutScene: false, 
					text: 'Can you come up with a physical explanation for why reaction rate behaves as described by the Arrhenius equation?', 
					quiz:[
							{
								storeAs: 'foo12', 
								type:'text', 
								text:'Type your answer here', 
								CWQuestionId: 48
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
					text: "Now let's introduce the reverse reaction, ##B \\rightarrow A##, to our system. For the reaction of ##A \\rightarrow B##: $$\\Delta{h}_{rxn} = -2.5\\frac{kJ}{mol}$$ and $$\\Delta{s}_{rxn} = -3.3\\frac{J}{mol-K}$$ With the isothermal system held at 300 K, what will be the equilibrium mole fraction of B?", 
					quiz:[
							{
								storeAs: 'foo13', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 49
							},
					
					]
				}
			]
		},
		{//S9
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 300, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 300, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger5', expr: "dotManager.lists.ugliest.length >= 362", message: 'Enable the reaction and allow it to reach equilibrium.', requiredFor: 'prompt0', checkOn: 'conditions'}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty7")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty8")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty7")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty8")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 100, activeEForward: 8, handle: 'reacty7'},
					// {rcts: [{spcName: 'ugliest', count: 2}], prods: [{spcName: 'ugly', count: 2}], preExpForward: 1, activeEForward: .08, handle: 'reacty8'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts:[
				{
					sceneData: undefined,
					cutScene: false, 
					text: "Let's perform an experiment with both a forward and reverse reaction. Click 'enable' to start the reaction. How long does it take for the system at 300 K to reach the equilibrium mole fraction of the product B?", 
					quiz:[
							{
								storeAs: 'foo14', 
								type:'textSmall',
								units:'seconds',
								text:'', 
								CWQuestionId: 50
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: false,
					text: "What can you say about the rates of the forward and reverse reactions now that the system is at equilibrium?",
					quiz:[
							{
								storeAs: 'foo15', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId:51
							},
					
					]
				}
			]
		},
		{//S10
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "<p>Next we’re going to conduct the reaction at 500 K.  What will the equilibrium mole fraction of B be at this temperature?</p><p>Enter the value as a decimal between 0 and 1</p>", 
					quiz:[
							{
								storeAs: 'foo16', 
								type:'textSmall',
								text:'', 
								CWQuestionId: 52
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "How does this compare to the equilibrium concentration of 0.64 at 300 K?  Explain why the equilibrium concentrations might be different.", 
					quiz:[
							{
								storeAs: 'foo17', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 53
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					text: "At 300 K, it took get('foo14', 'string', 'noValue') seconds to reach equilibrium.  How do you think this will compare to the time required to reach equilibrium at 500 K?", 
					quiz:[
							{
								storeAs: 'foo18', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 54
							},
					]	
				}
			]
		},
		{//S11
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 500, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 500, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger6', expr: "dotManager.lists.ugliest.length >= 320", message: 'Enable the reaction and allow it to reach equilibrium.', requiredFor: 'prompt0', checkOn: 'conditions'}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty3")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty4")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty3")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty4")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 100, activeEForward: 8, handle: 'reacty3'},
					// {rcts: [{spcName: 'ugliest', count: 2}], prods: [{spcName: 'ugly', count: 2}], preExpForward: 0.8, activeEForward: .0008, handle: 'reacty4'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined, 
					text: 'Let’s find out. Above is the same isothermal system but now at 500 K.  Click ‘enable’ to start the reaction.  You wrote it took get("foo14", "string", "noValue") seconds to reach equilibrium at 300 K.  How long does it take at 500 K?',
					quiz:[
							{
								storeAs: 'foo19', 
								type:'textSmall',
								text:'', 
								units: 'seconds',
								CWQuestionId: 55
							},
					]
				},
				{
					sceneData: undefined, 					
					text: 'Does the equilibrium mole fraction match your predicted value of get("foo16", "string", "noValue")?',
					quiz:[
							{
								storeAs: 'foo20', 
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 56
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					text: "Now let’s lower the temperature to 100 K.  What will be the equilibrium mole fraction of product B at this temperature?",
					quiz:[
							{
								storeAs: 'foo21', 
								type:'textSmall',
								text:'', 
								CWQuestionId: 57
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					text: "How do you think the time required to reach equilibrium at 100 K will compare to the times in the other two experiments?",
					quiz:[
							{
								storeAs: 'foo22', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 58
							},
					]
				}
			]
		},
		{//S12
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 100, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 100, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger7', expr: "collide.rxnHandlerNonEmergent.rxnIsEnabled('reacty5')",message: 'Enable the reaction', requiredFor: 'prompt0', checkOn:'conditions'}
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty5")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty6")', '$("button")[5].click()']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty5")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty6")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 10, activeEForward: 8, handle: 'reacty5'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined,
					text: "Click 'Enable' to start the reaction.",
				},
				{
					sceneData: undefined, 
					text: 'Why is the reaction not proceeding?',
					quiz:[
							{
								storeAs: 'foo23', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 59
							},
					]
				},
				{
					sceneData: undefined, 
					text: 'Although it appears nothing is happening, there is a non-zero rate constant in the forward direction. What will be the mole fraction of A if you wait for a very long time?',
					quiz:[
							{
								storeAs: 'foo24', 
								type:'textSmall',
								text:'', 
								CWQuestionId: 60
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					text: '<br>Describe how the reaction equilibrium changed with temperature for the exothermic reaction ##A \\rightarrow B##.<br>',
					quiz:[
							{
								storeAs: 'foo25', 
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 61
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					text: '<br>Describe how the reaction rate changed with temperature for the exothermic reaction ##A \\rightarrow B##.<br>',
					quiz:[
							{
								storeAs: 'foo26', 
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 62
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					text: '<br>In a couple of sentences, explain the difference between reaction rate and equilibrium.<br>',
					quiz:[
							{
								storeAs: 'foo27', 
								type:'text',
								text:'Type your answer here',
								CWQuestionId: 63
							},
					]
				},
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

