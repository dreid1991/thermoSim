canvasHeight = 450;
LevelData = {
	levelTitle: 'Phase Equilibrium Template',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(115, 250, 98), cv: 2.5 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.07, b:1730.6, c:233.426-273.15}, cpLiq: 75.34, spcVolLiq: 1},
		{spcName: 'spc4', m: 4, r: 1, col: Col(115, 250, 98), cv: 2.5 * R, hF298: -260, hVap298: 40.6, antoineCoeffs: {a: 8.14, b:1810.94, c:244.485-273.15}, cpLiq: 75.34, spcVolLiq: 1}
	],	

	mainSequence: [
		{//First Scene
			sceneData: {
				walls: [
					{pts:[P(40,55), P(510,55), P(510,350), P(40,350)], handler: 'cVIsothermal', temp: 423.15, handle: 'wallo', vol: 13.5, isothermalRate: 4, border: {type: 'open', width: 10, yMin: 40} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 396, temp:423.15, returnTo: 'wallo', tag: 'wallo'},
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'wallo',
							min: 0.5,
							init: 0.5,
							max: 20,
							makeSlider: true,	
							compMode: 'cPAdiabaticDamped',
						}	
					},
					{
						type: 'Sandbox',
						attrs: {
							handle: 'mrSandMan',
							wallInfo: 'wallo',
							min: 0.5,
							max: 9,
							init: 0.5,
						}
					},
					// {
						// type: 'DragWeights',
						// attrs: {
							// handle: 'Weight1',
							// wallInfo: 'wallo',
							// weightDefs: [{count: 5, pressure:1}],
							// pInit: 0,
							// weightScalar: 100,
							// pistonOffset: V(130,-41),
							// displayText: true,
						// }
					// },
					{
						type: 'Liquid',
						attrs:{
							wallInfo: 'wallo',
							handle: 'water',
							tempInit: 423.15,
							spcCounts: {spc3: 4},
							actCoeffType: 'twoSfxMrg',
							actCoeffInfo: {a: 3000},
							makePhaseDiagram: true,
							triplePointTemp: 273.16,
							criticalPointTemp: 647.1,
						},
					},
				],
				dataRecord: [
					{wallInfo: 'wallo', data: 'frac', attrs: {spcName: 'spc3', tag: 'wallo'}},
					{wallInfo: 'wallo', data: 'enthalpy', attrs: {spcName: 'spc3', tag: 'wallo'}},
				],
				// graphs: [
					// {type: 'Scatter', handle: 'hTGraph', xLabel: 'Enthalpy (kJ)', yLabel: 'Temperature (K)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						// sets:[
							// {handle: 'enthalpyTemperature', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							// data: {x: 'enthalpy("left")', y: 'tempSmooth("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						// ]
					// }
				// ],	
				dataReadouts: [
					{label: 'Vol: ', expr: 'vol("wallo")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					{label: 'Gas Temp: ', expr: 'tempSmooth("wallo")', units: 'K', decPlaces: 0, handle: 'tempGasReadout', readout: 'mainReadout'},
					{label: 'Liquid Temp: ', expr:  'tempSmooth("liquidWater")', units: 'K', decPlaces: 0, handle: 'tempLiquidReadout', readout: 'mainReadout'},
					{label: 'Pext: ', expr: 'pExt("wallo")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonLeft'}
				],
			},
			prompts: [
				{//prompt0
					sceneData: undefined,
					text: 'Now increase the pressure to bring the system to saturation with the temperature held constant at 150 C.'		
				},
			]		
		}
	]
}	