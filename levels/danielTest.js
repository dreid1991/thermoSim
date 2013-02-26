
canvasHeight = 450;
$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new TestLevel();
	curLevel.cutSceneEnd();
	curLevel.init();
	addJQueryElems($('button'), 'button');
	$('#resetExp').click(function(){curLevel.reset()});
	$('#toSim').click(function(){nextPrompt()});
	$('#toLastStep').click(function(){prevPrompt()});
	$('#previous').click(function(){prevPrompt()});
	$('#next').click(function(){nextPrompt()});
});

myCanvas.width = $('#main').width();



function TestLevel(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(TestLevel.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Level template');
		showPrompt(0, 0, true);
	},
	sections: [
				{
			sceneData: {
				walls: [
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'staticAdiabatic', handle: 'wally'} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(200, 200), count: 50, temp: 300, returnTo: 'wally', tag: 'wally'} 
				],
				objs: [
					{
						type: 'AuxImage',
						attrs: {handle: 'picci', slotNum: 1, imgFunc: 'img(img/work/block0Pic1.jpg)'}
					}

						
				],
				dataDisplay: [
					{wallInfo: "wally", data:'temp', readout: 'mainReadout'},
					{wallInfo: 'wally', data:'pInt', readout: 'mainReadout'}
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
						]
					},
					quiz: [
						{
							type: 'textSmall',
							label: 'foo',
							text: 'hello',
							answer: 5,
							messageWrong: 'hello'
						
						}
					],
					title: 'wooo!',
					text: 'math($x=5^{300}$)!'
				},
				{
					sceneData: undefined,
					title: 'wooo!',
					text: 'some more text!'
				}
			]
		}

			
	]

}
)