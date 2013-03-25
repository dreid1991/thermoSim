canvasHeight = 450;
$(function(){
	
	myCanvas.height = canvasHeight;
	window.curLevel = new TestLevel();
	curLevel.cutSceneEnd();
	curLevel.init();
});

myCanvas.width = $('#main').width();



function TestLevel(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
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
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 40, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: 1}, //act coeff will depend on mixture - don't put in spcDef
		{spcName: 'ugly', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 30, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: 1},
		{spcName: 'duckling', m: 4, r: 2, col: Col(255, 255, 255), cv: 2.5 * R, hF298: -30, hVap298: 30, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	sections: [
		// {
			// sceneData: undefined,
			// prompts: [
				// {
					// sceneData: undefined,
					// text: 'I am text',
					// title: 'I am not a title.',
					// cutScene: true,
					// quiz: [
						// {
							// type: 'text',
							// preText: 'woop woop!',
							// label: 'gi'
						
						// }
					// ]
				// }
			// ]
		// },
		{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', handle: 'wally', border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(200, 20), count: 1, temp: 300, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(55, 55), dims: V(200, 20), count: 1, temp: 300, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'spc3', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'AuxImage',
						attrs: {handle: 'picci', slotNum: 1, imgFunc: 'img(img/work/block0Pic1.jpg)'}
					},
					{
						type: 'Liquid',
						attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcCounts: {spc1: 1, ugly: 1}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3}}
					}
					// {
						// type: 'Heater',
						// attrs:{wallInfo: 'wally', tempMax: 20, handle: 'heaty', offset: V(0, 30), liquid: {handle:'swishy'}}
					// }
					// {
						// type: 'DragWeights',
						// attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 1}], pInit: 1}
					// },
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6}
					// }

						
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugly', tag: 'wally'}}
				],
				dataDisplay: [
					{wallInfo: 'wally', data:'pInt', readout: 'mainReadout'},
					{wallInfo: 'wally', data:'frac', readout: 'mainReadout', attrs: {spcName: 'spc1', tag: 'wally'}},
					{wallInfo: 'wally', data:'frac', readout: 'mainReadout', attrs: {spcName: 'ugly', tag: 'wally'}}
				],
				cmmds: [
					//{type: 'DragWeights', handle: 'draggy', cmmd: 'dropAllOntoPiston', args: ['instant']}
				],
				// rxns: [
					// {handle: 'rxn1', rctA: 'spc1', rctB: 'ugly', activeE: 15, prods: {duckling: 1}},
					// {handle: 'rxn2', rctA: 'duckling', activeE: 15, prods: {spc1: 1, ugly: 1}}
				// ]
			},
			prompts: [
				{
					sceneData: {
						objs: [
							{
								type: 'AuxImage',
								attrs: {handle: 'piccy', slotNum: 1, imgFunc: 'img(img/refresh.gif)'}
							}
						
						],
						// listeners: [
							
							// {dataSet: {wallInfo: 'wally', data: 'pExt'}, is: 'equalTo', checkVal: 1, alertUnsatisfied: 'booo', satisfyCmmds: [{type: 'DragWeights', handle: 'draggy', cmmd: 'freeze'}]}
							
						// ],
						dataDisplay: [
							{wallInfo: "wally", data:'temp', readout: 'mainReadout'}
						]
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
					text: 'Hello, my lovelies!'
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
					text: 'foo',
					title: 'goo'
				}
			
			]
			
		}

			
	]

}
)