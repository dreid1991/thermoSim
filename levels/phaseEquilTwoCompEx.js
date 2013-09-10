
LevelData = {
	levelTitle: 'One Component Phase Equilibrium',

	spcDefs: [
		{spcName: 'spc1', m: 4, r: 1.5, col: Col(75, 75, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 1.5, col: Col(255, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.213, b: 1652.27, c: 231.48-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'fairy', m: 4, r: 1, col: Col(250, 250, 250), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 1, col: Col(0, 255, 255), cv: 1.5 * R, hF298: -12, hVap298: 10, sF298: -1, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(350, 200), count: 500, temp: 398.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'spc2', pos: P(55, 55), dims: V(150, 200), count: 400, temp: 398.15, returnTo: 'wally', tag: 'wally'}
					
					
				],
				objs: [
					{
						type: 'Liquid',  
						attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700, spc2: 300}, primaryKey: 'heavy', actCoeffType: 'ideal' /*actCoeffType: 'vanlaar', actCoeffInfo: {spc1:.9227, spc2: 1.67}*/, makePhaseDiagram: true}
					},
					{
						type: 'Piston',
						attrs: {makeSlider: false, init: 0, handle: 'pistony'}
					},
					{
						type: 'DragWeights',
						attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 3}], weightScalar: 30, pInit: 2, cleanUpWith: 'prompt1'}
					},
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty', liquidHandle: 'swishy'}
					}
				

						
				],
				dataReadouts: [
					{label: 'Liquid temp: ', expr: 'tempSmooth("liquidSwishy")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Gas temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'}
				],
				graphs: [
					{type: 'Scatter', handle: 'TVGraph', xLabel: 'Frac spc1', yLabel: 'Volume (L)', numGridLines: {x: 6, y: 6}, axesFixed: {x: true, y: true}, axesInit: {x:{min: 340, step: 10}, y:{min: 0, step: 0.2}},
						sets:[
							{handle: 'tempVolume', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'tempSmooth("liquidSwishy")', y: 'curLevel.liquidSwishy.dotMgrLiq.lists.spc1.length / curLevel.liquidSwishy.dotMgrLiq.lists.ALLDOTS.length'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						]
					},
				],	
			},
			prompts: [
				{
					sceneData: undefined,
					title: '',
					text: 'In this two component system, the red molecules are more volatile than the blue.'
				}
				
			]
		},
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(450, 50), P(450, 350), P(50, 350)], handler: 'staticAdiabatic',/* temp: 298.15,*/ handle: 'wally', isothermalRate: 3, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(350, 200), count: 500, temp: 398.15, returnTo: 'wally', tag: 'wally'},
					{spcName: 'spc2', pos: P(55, 55), dims: V(350, 200), count: 400, temp: 398.15, returnTo: 'wally', tag: 'wally'}
					
					
				],
				objs: [
					{
						type: 'Liquid',  
						attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700, spc2: 300}, primaryKey: 'heavy', actCoeffType: 'vanlaar', actCoeffInfo: {spc1:.9227, spc2: 1.67}, makePhaseDiagram: true}
					},
					{
						type: 'DragWeights',
						attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 3}], weightScalar: 30, pInit: 5, cleanUpWith: 'prompt1'}
					},
					{
						type: 'Heater',
						cleanUpWith: 'prompt1',
						attrs: {wallInfo: 'wally', max: 3, handle: 'heaty', liquidHandle: 'swishy'}
					}
				

						
				],
				dataReadouts: [
					{label: 'Liquid temp: ', expr: 'tempSmooth("liquidSwishy")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Gas temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'}
				],
				graphs: [
					{type: 'Scatter', handle: 'TVGraph', xLabel: 'Frac spc1', yLabel: 'Volume (L)', numGridLines: {x: 6, y: 6}, axesFixed: {x: true, y: true}, axesInit: {x:{min: 380, step: 10}, y:{min: 0, step: 0.2}},
						sets:[
							{handle: 'tempVolume', label: 'Phase Change', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							data: {x: 'tempSmooth("liquidSwishy")', y: 'curLevel.liquidSwishy.dotMgrLiq.lists.spc1.length / curLevel.liquidSwishy.dotMgrLiq.lists.ALLDOTS.length'}, trace: true, fillInPts: true, fillInPtsMin: 5},
						]
					},
				],	
			},
			prompts: [
				{
					sceneData: undefined,
					title: '',
					text: "Now the species' activity coefficients have been changed to model that of ethanol and water, where blue represents water and red ethanol.  We can see an azeotrope form neat 95% ethanol."
				}
				
			]
		},
			
	],

}
