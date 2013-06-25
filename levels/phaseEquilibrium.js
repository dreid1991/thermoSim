canvasHeight = 450;
LevelData = {
	levelTitle: 'Phase Equilibrium Template',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(90, 124, 194), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {a: 8.07, b:1810.9, c:233.4-273.15}, cpLiq: 75.34, spcVolLiq: 1}
	],	

	mainSequence: [
		{//Initial Questions 
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					text: "<p>Today we're going to look at single component phase equilibrium. Before we start, what does it mean for a system to be saturated?</p>",
					quiz:[
						{
							type: 'text',
							text: 'type your answer here',
							CWQuestionId: 23,
							storeAs: 'beginning1', 
						}
					]
				},
			],
		},
		{		
			sceneData: undefined,
			prompts: [
				{
					cutscene: true,
					text: "<p>A system is saturated when the phases can coexist at equilibrium. This requres that the temperature, pressure, and molar Gibbs energy be the same for each phase</p>",
					quiz: [
						{
							type: 'text',
							text: 'type your answer here',
							storeAs: 'beginning2',
						},	
					],
				},
			],	
			
		},
		{//First Scene
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'cVIsothermal', handle: 'wallo', temp: 273, isothermalRate: 4, border: {type: 'open', width: 10} },
				],
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 1,
							init: 1,
							max: 4,
							makeSlider: false,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Liquid',
						attrs:{
							wallInfo: 'wallo',
							handle: 'liquido',
							tempInit: '333.15',
							spcCounts: {spc3: 1000},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: false,
						},
					},
					{
						type: 'TempChanger',
						attrs: {
							handle: 'changer1',
							min: 300,
							max: 600,
							sliderPos: 'center',
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'spc3', tag: 'wallo'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wallo")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					{label: 'Q: ', expr: 'q("wallo")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'pInt("wallo")', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'pistonRightPistonRight'},
					{label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
				triggers: [
					{handle: 'trigger1', expr: 'fracDiff(pExt("wallo"), 4) < 0.1', message: 'Place the block on the piston', requiredFor: 'prompt0', checkOn:'conditions'},
					{handle: 'freeze', expr: 'pExt("wallo") == 4', satisfyCmmds: ['curLevel.dragWeightsWeight1.disable()'], requiredFor: 'prompt0'},
					{handle: 'trigger2', expr: 'fracDiff(pExt("wallo"), 2) < 0.15', message: 'Remove the block from the piston', requiredFor: 'prompt2', checkOn:'conditions'},
				],	
			},
			prompts: [
				{//prompt0
					quiz: [
						{	
							type: 'textSmall',
							CWQuestionId: 24,
							preText: "Let's begin our experiment with an isothermal compression process using a single block. Please place the block on the piston. Estimate the value of work in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans1'
						}
					],
					title: 'Current Step'		
				},
				{//prompt1
					sceneData: undefined,
					quiz: [
						{
							type: 'text',
							CWQuestionId: 25,
							preText:'You calculated get("Ans1", "string") kJ for the isothermal compression process.  How does that compare to the value of heat?  Explain.',
							text: 'type your answer here',
							storeAs: 'Long1'
						}
					],
				},
				{//prompt2
					sceneData:{ 
						cmmds: [
							'curLevel.dragWeightsWeight1.enable()'
						],
					},	
					quiz: [
						{
							type: 'textSmall',
							CWQuestionId: 26,
							preText:'Now remove the block and let the piston isothermally expand.  For the compression process, you estimated that it "cost" you get("Ans1", "string") kJ of work.  Estimate how much work you "got back" from the expansion.',
							text: '',
							units: 'kJ',
							storeAs: 'Ans2'
						}
					],
				},
			]
		},	
	]

}