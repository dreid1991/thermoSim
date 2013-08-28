
LevelData = {
	levelTitle: 'Cell demo',

	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 2, r: 2, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 1, col: Col(150, 100, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 2, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'heavy', m: 10, r: 4, col: Col(0, 0, 200), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 400), P(50, 400)], handler: 'cVIsothermal', temp: 298.15, handle: 'wally', isothermalRate: 3/*, border: {type: 'open', thickness: 5, yMin: 30}*/}
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(350, 300), count: 400, temp: 298.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'heavy', pos: P(55, 55), dims: V(350, 300), count: 400, temp: 298.15, returnTo: 'wally', tag: 'wally'},
					
				],
				objs: [
					{
						type: 'Cell',
						attrs: {pos: P(150, 150), rad: 100, handle: 'squishy', parentWallHandle: 'wally', temp: 298, dots: {fairy: 200, heavy: 50}, boundingCorner: P(70, 70), boundingVector: V(300, 350), numCorners: 18, col: Col(0, 150, 0), innerChanceTransport: {spc1: .7}, outerChanceTransport: {spc1: .2}}
					},
					// {
						// type: 'Inlet',
						// attrs: {
							// handle: 'inlet1',
							// wallInfo: 'wally',
							// width: 40,
							// depth: 25,
							// flows: [{spcName: 'spc2', temp: 273, nDotMax: .01, tag: 'wally'}],
							// ptIdxs: [3,4],
							// fracOffset: 0.5,
							// makeSlider: true,
							// title: 'test'
						// }
					// },
						
				],
				dataRecord: [
					{wallInfo: 'cellSquishyInner', data: 'moles', attrs: {spcName: 'spc1', tag: 'cellSquishyInner'}},
					{wallInfo: 'wally', data: 'moles', attrs: {spcName: 'spc1', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'cell temp: ', expr: 'tempSmooth("cellSquishyInner")', units: 'K', decPlaces: 1, handle: 'cell', readout: 'mainReadout'},
					{label: 'cell conc: ', expr: 'moles("cellSquishyInner", {spcName: "spc1", tag: "cellSquishyInner"}) / vol("cellSquishyInner")', units: 'M', decPlaces: 2, handle: 'cellFrac', readout: 'mainReadout'},
					{label: 'cont. conc: ', expr: 'moles("wally", {spcName: "spc1", tag: "wally"}) / (vol("wally") - vol("cellSquishyInner"))', units: 'M', decPlaces: 2, handle: 'cellFracWally', readout: 'mainReadout'}
				],
				graphs: [
					{type: 'Scatter', handle: 'eqConst', xLabel: "time (s)", yLabel: "vol", axesInit:{x:{min:0, step:10}, y:{min:0, step:.2}}, numGridLines: {y: 6}, 
						sets:[
							{handle:'frac', label:'eq\nconst', pointCol:Col(50,255,50), flashCol:Col(255,200,200), data:{x: 'time("cellSquishyInner")', y: "vol('cellSquishyInner')"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				]
			},
			prompts: [
				{
					sceneData: undefined,
					title:'',
					text: 'jhgfuyhgiuhiuh',
				}
			]
		},
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 400), P(50, 400)], handler: 'cVIsothermal', temp: 298.15, handle: 'wally2', isothermalRate: 3/*, border: {type: 'open', thickness: 5, yMin: 30}*/}
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(350, 300), count: 1000, temp: 298.15, returnTo: 'wally2', tag: 'wally2'},
					// {spcName: 'spc2', pos: P(55, 55), dims: V(350, 300), count: 300, temp: 298, returnTo: 'wally2', tag: 'wally2'}
					
					
				],
				objs: [
					{
						type: 'Cell',
						attrs: {pos: P(150, 150), rad: 100, col: Col(30, 200, 30), handle: 'squishy2', parentWallHandle: 'wally2', temp: 298, dots: {fairy: 200}, boundingCorner: P(50, 50), boundingVector: V(400, 350), numCorners: 12, col: Col(0, 150, 0), innerChanceTransport: {spc1: .1}, outerChanceTransport: {spc1: .2/7}}
					}

						
				],
				dataRecord: [
					{wallInfo: 'cellSquishy2Inner', data: 'frac', attrs: {spcName: 'spc1', tag: 'cellSquishy2Inner'}}
				],
				dataReadouts: [
					{label: 'temp: ', expr: 'tempSmooth("wally2")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'cell temp: ', expr: 'tempSmooth("cellSquishy2Inner")', units: 'K', decPlaces: 1, handle: 'cell', readout: 'mainReadout'},
					{label: 'cell frac: ', expr: 'frac("cellSquishy2Inner", {spcName: "spc1", tag: "cellSquishy2Inner"})', units: '', decPlaces: 2, handle: 'cellFrac', readout: 'mainReadout'}
				],
			},
			prompts: [
				{
					sceneData: undefined,
					title:'',
					text: '',
				}
			]
		},
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 400), P(50, 400)], handler: 'cVIsothermal', temp: 298.15, handle: 'wally3', isothermalRate: 3/*, border: {type: 'open', thickness: 5, yMin: 30}*/}
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(350, 300), count: 800, temp: 298.15, returnTo: 'wally3', tag: 'wally3'},
					{spcName: 'heavy', pos: P(55, 55), dims: V(350, 300), count: 100, temp: 298.15, returnTo: 'wally3', tag: 'wally3'}
					
				],
				objs: [
					{
						type: 'Cell',
						attrs: {pos: P(150, 150), rad: 100, col: Col(30, 200, 30), handle: 'squishy3', parentWallHandle: 'wally3', temp: 298, dots: {fairy: 200}, boundingCorner: P(50, 50), boundingVector: V(400, 350), numCorners: 12, col: Col(0, 150, 0), innerChanceTransport: {spc1: .1, heavy: .2}, outerChanceTransport: {spc1: .2/7, heavy: .1}}
					},
						
				],
				dataRecord: [
					{wallInfo: 'cellSquishy3Inner', data: 'frac', attrs: {spcName: 'spc1', tag: 'cellSquishy3Inner'}}
				],
				dataReadouts: [
					{label: 'temp: ', expr: 'tempSmooth("wally3")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'cell temp: ', expr: 'tempSmooth("cellSquishy3Inner")', units: 'K', decPlaces: 1, handle: 'cell', readout: 'mainReadout'},
					{label: 'cell frac: ', expr: 'frac("cellSquishy3Inner", {spcName: "spc1", tag: "cellSquishy3Inner"})', units: '', decPlaces: 2, handle: 'cellFrac', readout: 'mainReadout'}
			
				],
			},
			prompts: [
				{
					sceneData: undefined,
					title:'',
					text: '',
				}
			]
		}
			
	]
	

}
