canvasHeight = 450;
LevelData = {
	levelTitle: 'Tests',

		
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'spc3', m: 4, r: 1, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],	

	mainSequence: [
		{
			sceneData: {
				walls: [
					{pts:[P(40,95), P(510,95), P(510,350), P(40,350)], handler: 'staticAdiabatic', handle: 'left', bounds: undefined}//, border: {type: 'wrap'} },
				],
				dots: [
					{spcName: 'spc3', pos: P(45,100), dims: V(465,240), count: 1100, temp:273, returnTo: 'left', tag: 'left'},
				],	
				objs: [
					// {
						// type: 'Piston',
						// attrs: {
							// handle: 'RightPiston',
							// wallInfo: 'left',
							// min: 1,
							// init: 1,
							// max: 4,
							// makeSlider: false,	
							// compMode: 'cPAdiabaticDamped',
						// }	
					// },
					{
						type: 'Inlet',
						attrs: {
							handle: 'inlet1',
							wallInfo: 'left',
							width: 40,
							depth: 25,
							temp: 298,
							makeTempSlider: true,
							tempMin: 100,
							tempMax: 400,
							flows: [{spcName: 'spc3', nDotMax: .05, handle: 'for3'}, {spcName: 'spc1', nDotMax: .05, handle: 'for1'}],
							sliders: [{flowHandles: ['for3', 'for1'], handle: 'slidery1', fracOpen: 1, title: 'thing1'}, {flowHandles: ['for1'], handle: 'rootCanal', fracOpen: .5, title: 'thing2'}],
							ptIdxs: [3,4],
							fracOffset: 0.5,
							makeSlider: true
						}
					},
					{
						type: 'Outlet',
						attrs: {
							handle: 'outlet1',
							wallInfo: 'left',
							ptIdxs: [1,2],
							width: 200,
							depth: 25,
							pressureFloor: 1,
							fracOffset: 0.5,
							makeSlider: true
							
						}
						
					},
					// {
						// type: 'DragWeights',
						// attrs: {
							// handle: 'Weight1',
							// wallInfo: 'left',
							// weightDefs: [{count: 1, pressure:2}],
							// pInit: 1,
							// weightScalar: 100,
							// pistonOffset: V(0,-10),
							// displayText: true,
						// }
					// },
					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrow', wallInfo: 'left', scale: 1}
					// }	
				],
				// graphs: [
					// {type: 'Scatter', handle: 'pVGraph', xLabel: 'Volume (L)', yLabel: 'Pressure (bar)', axesInit: {x:{min: 0, step:3}, y:{min: 0, step: 1}},
						// sets:[
							// {handle: 'externalPressure', label: 'P Ext', pointCol: Col(255, 50, 50), flashCol: Col(255, 50, 50),
							// data: {x: 'vol("left")', y: 'pExt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5},
							// {handle: 'internalPressure', label: 'P Int', pointCol: Col(50, 255, 50), flashCol: Col(50, 255, 50),
							// data: {x: 'vol("left")', y: 'pInt("left")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						// ]
					// }
				// ],	
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc3', tag: 'left'}},
					{wallInfo: 'left', data: 'moles', attrs: {spcName: 'spc3', tag: 'left'}},
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("left")', units: 'K', decPlaces: 0, handle: 'tempReadout', readout: 'mainReadout'},
					// {label: 'Q: ', expr: 'q("left")', units: 'kJ', decPlaces: 1, handle: 'heatReadout', readout: 'mainReadout'},
					{label: 'Pint: ', expr: 'pInt("left")', units: 'bar', decPlaces: 1, handle: 'pIntReadout', readout: 'mainReadout'},
					{label: 'Vol: ', expr: 'vol("left")', units: 'L', decPlaces: 1, handle: 'volReadout', readout: 'mainReadout'},
					// {label: 'Pext: ', expr: 'pExt("left")', units: 'bar', sigfigs: 2, handle: 'pExtReadout', readout: 'pistonRightPistonRight'},
					{label: 'Moles: ', expr: 'moles("left", {spcName: "spc3", tag: "left"})', units: 'moles', sigfigs: 2, handle: 'moleReadout', readout: 'mainReadout'}
				],
				triggers: [
					// {handle: 'trigger1', expr: 'moles("left", {spcName: "spc3", tag: "left"}) < 2', satisfyCmmds: ['curLevel., requiredFor: 'now'},
					// {handle: 'freeze', expr: 'pExt("left") == 4', satisfyCmmds: ['curLevel.dragWeightsWeight1.disable()'], requiredFor: 'prompt0'},
					// {handle: 'trigger2', expr: 'fracDiff(pExt("left"), 2) < 0.15', message: 'Remove the block from the piston', requiredFor: 'prompt2', checkOn:'conditions'},
				],	
			},
			prompts: [
				{
					quiz: [
						{	
							type: 'textSmall',
							preText: "Open System Test!!!",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans1'
						}
					],
					title: 'Test!!!'		
				},				
			]
		},
	]
}
