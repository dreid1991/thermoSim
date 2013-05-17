
LevelData = {
	levelTitle: 'Two Component Phase Equilibrium',

	spcDefs: [
		{spcName: 'ugly', m: 4, r: 1, col: Col(150, 100, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 4, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'ugly', pos: P(55, 55), dims: V(350, 200), count: 800, temp: 398.15, returnTo: 'wally', tag: 'wally'},
					
					
					// {spcName: 'a', pos: P(55, 55), dims: V(390, 340), count: 1000, temp: 298.15, returnTo: 'wally', tag: 'wally'},
					// {spcName: 'b', pos: P(55, 55), dims: V(390, 340), count: 1000, temp: 298.15, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 600, temp: 100, returnTo: 'wally', tag: 'wally', cleanUpWith: 'prompt0'},
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'fairy', thresholdEnergy: 12}
					},
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty'}
					},
				

						
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'fairy', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
				],
				graphs: [
						{type: 'Scatter', handle: 'fracExcited', xLabel: "Temp", yLabel: "Frac excited", axesInit:{x:{min:300, step:50}, y:{min:0, step:.2}}, axesFixed: {y: true}, numGridLines: {y: 6}, 
						sets:[
							{handle:'fracExcitedSet', label:'Frac\nExct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: 'frac("wally", {spcName: "fairy", tag: "wally"})'}, trace: true, fillInPtsMin: 5, showPts: false}
						]
					}

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
					text: 'hello'
				}
				/*
				{
					sceneData: {
						// cmmds: [
							// "alert('woop')"
						// ]
					},
					text: 'hello',
					title: 'titley'
				},
				{
					sceneData: {
						// cmmds: [
							// "alert('woop')"
						// ]
					},
					text: 'prompt2',
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
								{text:"## W = -\\int_{V_{1}}^{V_{2}}P_{sys}dV ##", correct: false, message:"That's not correct"},
								{text:"## W = - V\\Delta P_{ext} ##", correct: false, message:"That's not correct"},
								{text:"## W = -P_{ext}\\Delta V ##", correct: true},
								{text:"## W = -T\\Delta V ##", correct: false, message:"That's not correct"}
							]
						},
						{type: 'multChoice',
							options:[
								{text:"fawe", message:"That's not correct"},
								{text:"## W = - V\\Delta P_{ext} ##", message:"That's not correct"},
								{text:"## W = -P_{ext}\\Delta V ##"},
								{text:"## W = -T\\Delta V ##", message:"That's not correct"}
							]
						}
					]
					
					
				},
				{
					sceneData: undefined,
					text: 'can we do another?',
					title: 'titleynext'
				}*/
				
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
