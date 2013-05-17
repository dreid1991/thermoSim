
LevelData = {
	levelTitle: 'Reaction Equilibrium Example',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'a', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'b', m: 4, r: 1.5, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'c', m: 4, r: 1.5, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'd', m: 4, r: 1.5, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
					dots: [
					{spcName: 'a', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'b', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally', tag: 'wally'},
				],
				objs: [
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty'}
					},
				

						
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'a', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'b', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'c', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'd', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
				],
				rxns: [
					{handle: 'rxn1', rctA: 'a', rctB: 'b', activeE: 6, prods: {c: 1, d: 1}},
					{handle: 'rxn2', rctA: 'c', rctB: 'd', activeE: 14, prods: {a: 1, b: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole face", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'fracRct', label:'frac\nRct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'a', tag: 'wally'}) + frac('wally', {spcName: 'b', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5},
							{handle:'fracProd', label:'frac\nProd', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'c', tag: 'wally'}) + frac('wally', {spcName: 'd', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "eq const", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						sets:[
							{handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'c', tag: 'wally'}) * frac('wally', {spcName: 'd', tag: 'wally'}) / (frac('wally', {spcName: 'a', tag: 'wally'}) * frac('wally', {spcName: 'b', tag: 'wally'}))"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},

				],
			},
			prompts: [
				{
					title: '',
					text: "When the purple molecules reach a specified energy (##12 kJ/mol##), they turn white to show they're excited.  How does the graph you produce by heating the system compare to the graph predicted by the Arrhenius rate equation shown below? $$k_ = Ae^{-\\frac{E_{a}}{RT}}$$",
				}
				
			]
		}

			
	],

}
