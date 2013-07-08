
LevelData = {
	levelTitle: 'Two Component Phase Equilibrium',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 1, col: Col(150, 100, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 4, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 1, col: Col(0, 255, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 400), P(50, 400)], handler: 'staticAdiabatic', handle: 'wally'}
				]
			},
			prompts: [
				{
					sceneData: {
						dots: [
							{pos: P(60, 60), dims: V(200, 200), spcName: 'spc1', count: 10, temp: 200, tag: 'wally', returnTo: 'wally'}
						]
					},
					quiz: [
						{
							type: 'text',
							preText: 'the text above it',
							text: 'lalala',
							storeAs: 'importantAnswer'
						}
					],
					text: 'The text',
					title: 'The title',
					directions: function() {
						
						return 'branchSections(LevelData.auxSections.aux1)'
					}
				},
				{
					text: 'second',
					title: 'second title'
				}
			]
		}
	],
	auxSections: {
		aux1: [
			{
				sceneData: {
					walls: [
						{pts: [P(50, 50), P(200, 50), P(450, 400), P(50, 400)], handler: 'staticAdiabatic', handle: 'wally'}
					]
				},
				prompts: [
					{
						text: 'ox prompt.  made with real ox',
						title: 'woop!'
					}
				]
			}
		]
	},

}