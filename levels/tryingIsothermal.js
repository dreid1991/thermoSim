
canvasHeight = 450;
$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new TryingIsothermal();
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



function TryingIsothermal(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(TryingIsothermal.prototype, 
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
					{pts: [P(50, 50), P(400, 50), P(400, 350), P(50, 350)], handler: 'cVIsothermal', temp: 200, handle: 'wally'} 
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 55), dims: V(200, 200), count: 500, temp: 300, returnTo: 'wally', tag: 'wally'}, 
					{spcName: 'spc3', pos: P(55, 55), dims: V(200, 200), count: 500, temp: 300, returnTo: 'wally', tag: 'wally'} 
				],
				dataDisplay: [
					{wallInfo: "wally", data:'temp', readout: 'mainReadout'},
					{wallInfo: 'wally', data:'pInt', readout: 'mainReadout'},
					{wallInfo: 'wally', data:'qArrowsAmmt'}
				]
			},
			prompts: [
				{
					sceneData: undefined,
					title: 'wooo!',
					text: 'loooo!'
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