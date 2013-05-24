
LevelData = {
	levelTitle: 'Activation energy example',

	spcDefs: [
		{spcName: 'ugly', m: 4, r: 1, col: Col(150, 100, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 4, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'ugly', pos: P(55, 55), dims: V(350, 200), count: 800, temp: 201, returnTo: 'wally', tag: 'wally'},
				],
				objs: [
					{
						type: 'ActivationEnergyPair',
						attrs: {spcNameLow: 'ugly', spcNameHigh: 'fairy', activationEnergy: 16}
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
						{type: 'Scatter', handle: 'fracExcited', xLabel: "Temp", yLabel: "Frac excited", axesInit:{x:{min:200, step:50}, y:{min:0, step:.2}}, axesFixed: {y: true}, numGridLines: {y: 6}, 
						sets:[
							{handle:'fracExcitedSet', label:'Frac\nExct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'temp("wally")', y: 'frac("wally", {spcName: "fairy", tag: "wally"})'}, trace: true, fillInPtsMin: 5, showPts: false}
						]
					}

				],
			},
			prompts: [
				{
					title: '',
					text: "When the purple molecules reach a specified energy (##6 kJ/mol##), they turn white to show they're excited.  How does the graph you produce by heating the system compare to the graph predicted by the Arrhenius rate equation shown below? $$k_ = Ae^{-\\frac{E_{a}}{RT}}$$",
				}
				
			]
		}

			
	],

}
