
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

	
	addSpecies(['spc1', 'spc2', 'spc3', 'spc4', 'spc5', 'spc6']);
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
	sections: [
				{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', handle: 'wally', border: {type: 'open', thickness: 5, yMin: 30}} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'},
					{spcName: 'spc3', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
					{
						type: 'AuxImage',
						attrs: {handle: 'picci', slotNum: 1, imgFunc: 'img(img/work/block0Pic1.jpg)'}
					},
					{
						type: 'Liquid',
						attrs:{wallInfo: 'wally', handle: 'swishy', tempInit: 400, spcInfo: {spc1: {count: 500, spcVol: .5, cP:12.4, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, hVap: 5/*40.65*/}, spc3: {count: 1000, spcVol: .7, cP:12.4, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, hVap: 3.5}}, actCoeffType: 'twoSfxMrg', actCoeffInfo: {a: 3}}
					},
					{
						type: 'Heater',
						attrs:{wallInfo: 'wally', tempMax: 20, handle: 'heaty', offset: V(0, 30), liquid: {handle:'swishy'}}
					}
					// {
						// type: 'DragWeights',
						// attrs: {handle: 'draggy', wallInfo: 'wally', weightDefs: [{count: 2, pressure: 1}], pInit: 1}
					// },
					// {
						// type: 'Piston',
						// attrs: {handle: 'pistony', wallInfo: 'wally', min: 2, init: 4, max: 6}
					// }

						
				],
				dataDisplay: [
					{wallInfo: 'wally', data:'pInt', readout: 'mainReadout'}
				],
				cmmds: [
					//{type: 'DragWeights', handle: 'draggy', cmmd: 'dropAllOntoPiston', args: ['instant']}
				]
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
					text: 'Hello, my lovlies! $$ \\frac{1}{2} $$  That was mathematical!'
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