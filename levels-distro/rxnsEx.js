
LevelData = {
	levelTitle: 'Reaction Equilibrium Example',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'a', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'b', m: 4, r: 1.5, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'c', m: 4, r: 1.5, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'd', m: 4, r: 1.5, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'aa', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'bb', m: 4, r: 1.5, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'cc', m: 4, r: 1.5, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -6, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'dd', m: 4, r: 1.5, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -6, hVap298: 10, sF298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},		
		{spcName: 'aaa', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'bbb', m: 4, r: 1.5, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ccc', m: 4, r: 1.5, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: -10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ddd', m: 4, r: 1.5, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -14, hVap298: 10, sF298: -10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'aaaa', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'bbbb', m: 4, r: 1.5, col: Col(0, 255, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: 0, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'cccc', m: 4, r: 1.5, col: Col(100, 100, 255), cv: 1.5 * R, hF298: -6, hVap298: 10, sF298: -10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'dddd', m: 4, r: 1.5, col: Col(255, 255, 0), cv: 1.5 * R, hF298: -6, hVap298: 10, sF298: -10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}
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
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole frac", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
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
					text: "Here's an exothermic and entropically favorable reaction.  $$red + green \\Longleftrightarrow blue + yellow$$ with $$\\Delta H_{rxn} = -8 kJ/mol, \\Delta S_{rxn} = 20 J/mol$$",
				}
				
			]
		},
		
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally2', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
					dots: [
					{spcName: 'aa', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
					{spcName: 'bb', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
				],
				objs: [
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally2', max: 3, handle: 'heaty'}
					},
				

						
				],
				dataRecord: [
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'aa', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'bb', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'cc', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'dd', tag: 'wally2'}}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("wally2")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
				],
				rxns: [
					{handle: 'rxn11', rctA: 'aa', rctB: 'bb', activeE: 14, prods: {cc: 1, dd: 1}},
					{handle: 'rxn22', rctA: 'cc', rctB: 'dd', activeE: 6, prods: {aa: 1, bb: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole frac", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'fracRct', label:'frac\nRct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'aa', tag: 'wally2'}) + frac('wally2', {spcName: 'bb', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5},
							{handle:'fracProd', label:'frac\nProd', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'cc', tag: 'wally2'}) + frac('wally2', {spcName: 'dd', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "eq const", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						sets:[
							{handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'cc', tag: 'wally2'}) * frac('wally2', {spcName: 'dd', tag: 'wally2'}) / (frac('wally2', {spcName: 'aa', tag: 'wally2'}) * frac('wally2', {spcName: 'bb', tag: 'wally2'}))"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},


				],
			},
			prompts: [
				{
					title: '',
					text: "Here's an endothermic and entropically favorable reaction.  $$red + green \\Longleftrightarrow blue + yellow$$ with $$\\Delta H_{rxn} = 8 kJ/mol, \\Delta S_{rxn} = 20 J/mol$$",
				}
				
			]
		},
		
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally2', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
					dots: [
					{spcName: 'aaa', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
					{spcName: 'bbb', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
				],
				objs: [
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally2', max: 3, handle: 'heaty'}
					},
				

						
				],
				dataRecord: [
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'aaa', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'bbb', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'ccc', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'ddd', tag: 'wally2'}}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("wally2")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
				],
				rxns: [
					{handle: 'rxn11', rctA: 'aaa', rctB: 'bbb', activeE: 6, prods: {ccc: 1, ddd: 1}},
					{handle: 'rxn22', rctA: 'ccc', rctB: 'ddd', activeE: 14, prods: {aaa: 1, bbb: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole frac", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'fracRct', label:'frac\nRct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'aaa', tag: 'wally2'}) + frac('wally2', {spcName: 'bbb', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5},
							{handle:'fracProd', label:'frac\nProd', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'ccc', tag: 'wally2'}) + frac('wally2', {spcName: 'ddd', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "eq const", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						sets:[
							{handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'ccc', tag: 'wally2'}) * frac('wally2', {spcName: 'ddd', tag: 'wally2'}) / (frac('wally2', {spcName: 'aaa', tag: 'wally2'}) * frac('wally2', {spcName: 'bbb', tag: 'wally2'}))"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},


				],
			},
			prompts: [
				{
					title: '',
					text: "Here's an exothermic and entropically unfavorable reaction.  $$red + green \\Longleftrightarrow blue + yellow$$ with $$\\Delta H_{rxn} = -8 kJ/mol, \\Delta S_{rxn} = -20 J/mol$$",
				}
				
			]
		},
		
		
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 400), P(50, 400)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally2', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
					dots: [
					{spcName: 'aaaa', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
					{spcName: 'bbbb', pos: P(55, 55), dims: V(390, 270), count: 500, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
				],
				objs: [
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally2', max: 3, handle: 'heaty'}
					},
				

						
				],
				dataRecord: [
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'aaaa', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'bbbb', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'cccc', tag: 'wally2'}},
					{wallInfo: 'wally2', data: 'frac', attrs: {spcName: 'dddd', tag: 'wally2'}}
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("wally2")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'}
				],
				rxns: [
					{handle: 'rxn11', rctA: 'aaaa', rctB: 'bbbb', activeE: 6, prods: {cccc: 1, dddd: 1}},
					{handle: 'rxn22', rctA: 'cccc', rctB: 'dddd', activeE: 14, prods: {aaaa: 1, bbbb: 1}}
				],
				graphs: [
					{type: 'Scatter', handle: 'fracs', xLabel: "time (s)", yLabel: "mole frac", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'fracRct', label:'frac\nRct', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'aaaa', tag: 'wally2'}) + frac('wally2', {spcName: 'bbbb', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5},
							{handle:'fracProd', label:'frac\nProd', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'cccc', tag: 'wally2'}) + frac('wally2', {spcName: 'dddd', tag: 'wally2'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "eq const", axesInit:{x:{min:0, step:1}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						sets:[
							{handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("wally2")', y: "frac('wally2', {spcName: 'cccc', tag: 'wally2'}) * frac('wally2', {spcName: 'dddd', tag: 'wally2'}) / (frac('wally2', {spcName: 'aaaa', tag: 'wally2'}) * frac('wally2', {spcName: 'bbbb', tag: 'wally2'}))"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},


				],
			},
			prompts: [
				{
					title: '',
					text: "Here's an endothermic and entropically unfavorable reaction.  $$red + green \\Longleftrightarrow blue + yellow$$ with $$\\Delta H_{rxn} = 8 kJ/mol, \\Delta S_{rxn} = -20 J/mol$$",
				}
				
			]
		}
			
	],

}
