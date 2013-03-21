
canvasHeight = 450;


$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new Alec();
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



function Alec(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Alec.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-400, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Reversible and irreversible processes');
		showPrompt(0, 0, true);
	},
	
	
	
	sections: [
		{
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					text: '<p>In these experiments, we will explore what makes a process irreversible and what makes a process reversible.</p><p>Before we get to the experiment, please first describe what you think the difference between an irreversible and a reversible process is.</p>',
					quiz:[
						{
							type: 'text',
							text: 'type your answer here',
						}
					]
				},
			],	
			
		},
		{
			sceneData: {
				walls: [
					{pts:[P(40,40), P(510,40), P(510,350), P(40,350)], handler: 'staticAdiabatic', handle: 'left'},
				],
				dots: [
					{spcName: 'spc3', pos: P(45,50), dims: V(465,300), count: 500, temp:150, returnTo: 'left', tag: 'left'},
					{spcName: 'spc1', pos: P(45,50), dims: V(465,300), count: 300, temp: 150, returnTo: 'left', tag: 'left'}
				],	
				objs: [
					{
						type: 'Piston',
						attrs: {
							handle: 'RightPiston',
							wallInfo: 'left',
							min: 0,
							init: 0,
							max: 0,
							makeSlider: false
						}	
					},
					{
						type: 'DragWeights',
						attrs: {
							handle: 'Weight1',
							wallInfo: 'left',
							weightDefs: [{count: 4, pressure:0.5}, {count: 2, pressure:1}],
							pInit: 2,
							pistonOffset: V(130,-41),
							displayText: true,
						}
					}
				],
				dataRecord: [
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc1', tag: 'left'}}
				],
				dataDisplay: [
					{wallInfo: 'left', data: 'tempSmooth', readout: 'mainReadout'},
					{wallInfo: 'left', data: 'pExt', readout: 'pistonReadoutRightPiston'},
					{wallInfo: 'left', data: 'frac', attrs: {spcName: 'spc1', tag: 'left'}, readout: 'mainReadout'}
				],
			},
			prompts: [
				{
					title: 'TITLE',
					text: 'This is the Text',
				}
				
			
			]
		}
		
		
	
	]

}
)