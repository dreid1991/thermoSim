
canvasHeight = 450;


$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new Matt();
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



function Matt(){
	this.setStds();
	this.wallSpeed = 6;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Matt.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-400, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Temperature and Pressure differences with constant volume (Cv) and constant pressure (Cp) systems');
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
				dataDisplay: [
					{wallInfo: "wally", data:'temp', readout: 'mainReadout'},
					{wallInfo: 'wally', data:'pInt', readout: 'mainReadout'}
				]
			},
			prompts: [
				{
					sceneData: undefined,
					title: 'wooo!',
					text: 'loooo!',
					quiz:[
						{	
							type:'multChoice', 
							options:
								[
								{text:"||EQ1|| and ||EQ3||", isCorrect: false, message:"That's not correct"},
								{text:"||EQ2|| and ||EQ3||", isCorrect: false, message:"That's not correct"},
								{text:"||EQ1|| and ||EQ4||", isCorrect: true},
								{text:"||EQ2|| and ||EQ5||", isCorrect: false, message:"That's not correct"}
							]
						}
					],
				},
				{
					sceneData: undefined,
					title: 'Heat capacities ',
					text: 'some more text!'
				}
			]
		}
			
	]

}
)