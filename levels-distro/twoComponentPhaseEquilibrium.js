canvasHeight = 450;
LevelData = {
	levelTitle: 'Two Component Phase Equilibrium Template',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(27, 181, 224), cv: 3.37 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.07, b:1730.6, c:233.426-273.15}, cpLiq: 75.34, spcVolLiq: 1},
		{spcName: 'spc4', m: 4, r: 1, col: Col(115, 250, 98), cv: 2.5 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.14, b:1810.94, c:244.485-273.15}, cpLiq: 75.34, spcVolLiq: 1}
	],	

	mainSequence: [
		{//Initial Questions 
			sceneData: undefined,
			prompts: [
				{
					sceneData: undefined,
					cutScene: true,
					text: "<p>Today we're going to look at two component phase equilibrium. Before we start, what does it mean for a system to be saturated?</p>",
					quiz:[
						{
							type: 'text',
							text: 'type your answer here',
							storeAs: 'beginning1', 
						}
					]
				},
				{
					sceneData: undefined,
					cutScene: true,
					text: "<p>A system is saturated when the phases can coexist at equilibrium. This requres that the temperature, pressure, and molar Gibbs energy be the same for each phase.</p>",
				},
			],	
			
		},
	]
}	