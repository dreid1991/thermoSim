canvasHeight = 450;
$(function(){
	
	myCanvas.height = canvasHeight;
	window.curLevel = new TestLevel();
	curLevel.cutSceneEnd();
	curLevel.init();
});

myCanvas.width = $('#main').width();



function TestLevel(){
	this.readouts = {};
	this.setStds();
	this.wallSpeed = 1;
	this.compMode = 'Isothermal';//is this used?

	
	//addSpecies(['spc1', 'spc2', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(TestLevel.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Level template');
		sceneNavigator.showPrompt(0, 0, true);
	},
	spcDefs: [
		//add antoine coefs, cvLiq, hvap
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 1, col: Col(150, 100, 100), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	sections: [

		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', temp: 400, handle: 'wally', vol: 10, border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(55, 55), dims: V(150, 200), count: 600, temp: 350, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					// {
						// type: 'AuxImage',
						// attrs: {handle: 'picci', slotNum: 0, imgFunc: 'img("img/work/block0Pic1.jpg")'}
					// },
					// {
						// type: 'Liquid',
						// attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 700, ugly: 700}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3}, makePhaseDiagram: true}
					// },
					// {
						// type: 'Heater',
						// attrs:{wallInfo: 'wally', tempMax: .1, handle: 'heaty'}
					// },
					{
						type: 'DragWeights',
						attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 2}], pInit: 3}
					},
					// {
						// type: 'QArrowsAmmt',
						// attrs: {handle: 'arrowy', wallInfo: 'wally', scale: 1}
					// }
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6}
					// }

						
				],
				// listeners: [
					// {handle: 'trumpet', expr: "pExt('wally') > 3"}
				// ],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugly', tag: 'wally'}},
					{wallInfo: 'wally', data: 'vDist', attrs: {spcName: 'spc1', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'woop: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Vol: ', expr: 'vol("wally")', units: 'L', decPlaces: 1, handle: 'loopy', readout: 'mainReadout'},
					{label: 'pInt: ', expr: 'pInt("wally")', units: 'bar', decPlaces: 1, handle: 'intintnit', readout: 'mainReadout'},
					{label: 'pExt: ', expr: 'pExt("wally")', units: 'bar', decPlaces: 1, handle: 'extextext', readout: 'mainReadout'}
					//{label: 'RCT: ', expr: 'frac("wally", {spcName: "spc1", tag: "wally"}) + frac("wally", {spcName: "ugly", tag: "wally"})', sigFigs: 2, handle: 'coalseamgas', readout: 'mainReadout'}
				],
				buttonGroups: [
					{handle: 'heaterState', label: 'Heater', prefIdx: 1},
					{handle: 'tempControl', label: 'Temp control'},
					{handle: 'rxnControl', label: 'Rxn control'}
				],
				buttons: [
					{groupHandle: 'heaterState', handle: 'on', label: 'On', exprs: ['curLevel.heaterHeaty.enable()']},
					{groupHandle: 'heaterState', handle: 'off', label: 'Off', exprs: ['curLevel.heaterHeaty.disable()']},
					{groupHandle: 'tempControl', handle: 'adiabatic', label: 'Adiabatic', exprs: ['walls.wally.isothermalStop()']},
					{groupHandle: 'tempControl', handle: 'isothermal', label: 'Isothermal', exprs: ['walls.wally.isothermalInit()']},
					{groupHandle: 'rxnControl', handle: 'rxn1On', label: 'Forward on', exprs: ['collide.enableRxn("rxn1")']},
					{groupHandle: 'rxnControl', handle: 'rxn1Off', label: 'Forward off', exprs: ['collide.disableRxn("rxn1")']},
					{groupHandle: 'rxnControl', handle: 'rxn2On', label: 'Backward on', exprs: ['collide.enableRxn("rxn2")']},
					{groupHandle: 'rxnControl', handle: 'rxn2Off', label: 'Backward off', exprs: ['collide.disableRxn("rxn2")']},
				],
				cmmds: [
					//TEST DISPLAY Q ARROWS
					//{type: 'DragWeights', handle: 'draggy', cmmd: 'dropAllOntoPiston', args: ['instant']}
				],
				listeners: [
					//{handle: 'checky', expr: 'fracDiff(vol("wally"), 9) < .05', alertUnsatisied: 'no', satisfyStore: [{storeAs: 'foo', expr: 'vol("wally") * 10'}], satisfyCmmds: ['console.log("lol")']}
				],
				// rxns: [
					// {handle: 'rxn1', rctA: 'spc1', rctB: 'ugly', activeE: 15, prods: {duckling: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:1}, y:{min:0, step:1}}, 
						sets:[
							{handle:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("wally")', y: "pExt('wally')"}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'TvsV', xLabel: "Volume (L)", yLabel: "Temp (K)", axesInit:{x:{min:6, step:1}, y:{min:0, step:60}}, 
						sets:[
							{handle:'temp', label:'temp', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("wally")', y: "temp('wally')"}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}
					 // {type: 'Hist', handle: 'PvsVOne', xLabel: "xLabel", yLabel: "yLabel", axesInit:{x:{min:0, step:50}, y:{min:0, step:10}}, 
						// sets:[
							// {handle:'pExt', barCol:Col(255,50,50), data:"vDist('wally', {spcName: 'spc1', tag: 'wally'})"}
						// ]
					// }

				],
			},
			prompts: [
				{
					sceneData: {
						// objs: [
							// {
								// type: 'AuxImage',
								// attrs: {handle: 'piccy', slotNum: 1, imgFunc: 'img(img/refresh.gif)'}
							// }
						
						// ],
						// listeners: [
							
							// {dataSet: {wallInfo: 'wally', data: 'pExt'}, is: 'equalTo', checkVal: 1, alertUnsatisfied: 'booo', satisfyCmmds: [{type: 'DragWeights', handle: 'draggy', cmmd: 'freeze'}]}
							
						// ],
						// dataDisplay: [
							// {wallInfo: "wally", data:'temp', readout: 'mainReadout'}
						// ]
					},
					quiz: [
						{
							type: 'textSmall',
							label: 'foo',
							text: 'hello',
							messageWrong: 'hello',
							storeAs: 'theAnswer'
						
						}
					],
					title: 'wooo!',
					text: 'Hello, img("img/cvcp/eq1.gif") my lovelies!'
				},
				{
					sceneData: undefined,
					text: 'hello',
					title: 'titley'
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
			},
			prompts: [
				{
					title: 'foo',
					text: 'pre text eval(get("theAnswer", "int") * 2) hello people faces'
				}
			
			]
			
		}

			
	]

}
)