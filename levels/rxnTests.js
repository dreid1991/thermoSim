
LevelData = {
	levelTitle: 'Level template',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'a', m: 4, r: 2, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'b', m: 4, r: 2, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'c', m: 4, r: 2, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -50, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'd', m: 4, r: 2, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -50, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 400), P(50, 400)], handler: 'cVIsothermal', temp: 798.15, handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'a', pos: P(55, 55), dims: V(390, 340), count: 600, temp: 798.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'b', pos: P(55, 55), dims: V(390, 340), count: 600, temp: 798.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'c', pos: P(55, 55), dims: V(390, 340), count: 400, temp: 798.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'd', pos: P(55, 55), dims: V(390, 340), count: 400, temp: 798.15, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					// {
						// type: 'DragWeights',
						// attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 6}], pInit: 2, cleanUpWith: 'prompt1'}
					// },
					// {
						// type: 'Heater',
						// cleanUpWith: 'prompt1',
						// attrs: {wallInfo: 'wally', max: 3, handle: 'heaty'/*, liquidHandle: 'swishy'*/}
					// },
				
					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrowy', wallInfo: 'wally', scale: 1}
					// }
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6, makeSlider: false}
					// }

						
				],
				dataRecord: [
					
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'a', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'b', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'c', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'd', tag: 'wally'}}
				],
				rxns: [
					{handle: 'rxn1', rctA: 'a', rctB: 'b', activeE: 5, prods: {c: 1, d: 1}},
					{handle: 'rxn2', rctA: 'c', rctB: 'd', activeE: 5, prods: {a: 1, b: 1}}
				],
				dataReadouts: [
					{label: 'temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
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
				////as [{pos: , dir: , temp: , tag: , returnTo: }]
				// cmmds: [
					// function() {
						// spcs.a.place([{pos: P(100, 100), dir: V(1, 0), temp: 100, tag: 'wally', returnTo: 'wally'}]);
						// spcs.b.place([{pos: P(200, 100), dir: V(-1, 0), temp: 100, tag: 'wally', returnTo: 'wally'}]);
					// }
				// ]
			},
			prompts: [
				{
					sceneData: undefined,
					title: 'wooo!',
					text: 'Woink.',
				},
				{
					text: 'hello'
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
	},
	auxPrompts: {
	}

}
