
canvasHeight = 450;
$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new LevelTemplate();
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



function LevelTemplate(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(LevelTemplate.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Level template');
		showPrompt(0, 0, true);
	},
	sections: [
		{//First Question
			sceneData: undefined,
				prompts:[ 
					{
						sceneData:undefined,
						cutScene:true,
						text: 'Lets Talk about work! Click the correct answer to advance!',
						quiz: [
							{type: 'multChoice',
							options:[
								{text:"Nope", isCorrect: false, message:"That's not correct"},
								{text:"Nope", isCorrect: false, message:"That's not correct"},
								{text:"Click Me!", isCorrect: true},
								{text:"Nope", isCorrect: false, message:"That's not correct"}
							]
							}
						]
					}
				]
		},
		{//First Scene
			sceneData: {
				walls: [
					{pts: [P(50, 200), P(250, 200), P(250, 400), P(50, 400)], handler: 'staticAdiabatic', handle: 'LeftWall'},
					{pts: [P(300, 200), P(500, 200), P(500, 400), P(300, 400)], handler: 'staticAdiabatic', handle: 'RightWall', temp: 300}
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 50, temp: 300, returnTo: 'LeftWall', tag: 'LeftWall'},
					{spcName: 'spc1', pos: P(305, 210), dims: V(150,150), count: 50, temp: 300, returnTo: 'RightWall', tag: 'RightWall'}
				],
				objs: [
					{type: 'Piston',
					attrs: {handle:'RightPiston', wallInfo: 'RightWall'}
					},
					{type: 'Piston',
					attrs: {handle: 'LeftPiston', wallInfo: 'LeftWall'}
					},
					{type: 'DragWeights',
					attrs: {handle:'dragsL', wallInfo:'LeftWall', weightDefs:[{count:2, pressure:2}], pistonOffset: V(130,-41),binHeight: 30, pInit: 0}
					},
					{type: 'DragWeights',
					attrs: {handle:'dragsR', wallInfo:'RightWall', weightDefs:[{count:2, pressure:2}], pistonOffset: V(130,-41),binHeight: 30, pInit: 0}
					}
				],
				graphs: [
							{type: 'Scatter', handle: 'PvsW', xLabel: "P Int.", yLabel: "Work", axesInit:{x:{min:6, step:2},y:{min:0, step:2}},
								sets: [
									{address:'work', label: 'Work', pointCol:Col(255,50,50), flashCol:Col(255,200,200),data:{x: {wallInfo: 'LeftWall', data: 'pExt'},y: {wallInfo: 'LeftWall', data: 'q'}},trace: false, fillInPts: false, fillInPtsMin: 5}
								]	
							}
				],	
				dataDisplay: [
					{wallInfo: 'RightWall', data:'pInt', readout: 'pistonReadoutRightPiston'},
					{wallInfo: 'LeftWall', data:'pInt', readout: 'pistonReadoutLeftPiston'}
				]
			},
			prompts:[
				{
				sceneData: undefined,
					title: 'wooo!',
					text: 'Scene 1!',
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