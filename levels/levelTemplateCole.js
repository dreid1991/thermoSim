
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
		$('#mainHeader').html('Work');
		showPrompt(0, 0, true);
	},
	sections: [
		{//First Questions
			sceneData: undefined,
				prompts:[ 
					{//Prompt 1
						sceneData:undefined,
						cutScene:true,
						text: "Today we're going to investigate how work transfers energy to a system.  First we're going to develop the equations that describe a process on an adiabatic system. </p><p>If we compress the adiabatic system pictured to the right at a constant external pressure from state 1 to state 2, which of the following equations best represents the work done?</p>",
						quiz: [
							{type: 'multChoice',
								options:[
									{text:"## W = -\\int_{V_{1}}^{V_{2}}P_{sys}dV ##", isCorrect: false, message:"That's not correct"},
									{text:"## W = - V\\Delta P_{ext} ##", isCorrect: false, message:"That's not correct"},
									{text:"## W = -P_{ext}\\Delta V ##", isCorrect: true},
									{text:"## W = -T\\Delta V ##", isCorrect: false, message:"That's not correct"}
								]
							},
						]
					},
					{//Prompt 2
						sceneData:undefined,
						cutScene:true,
						text: "$$ W = -P_{ext}\\Delta V $$ <p> Indeed. This equation tells us that work done on a sustem is equal to how hard you compress a container per area times how much you compress it. <p> Now from the first law, we know $$ \\Delta U = Q + W $$ <p> For our adiabatic system, which of the following relations is correct, if we asume constant heat capacity?",
						quiz: [
							{type: 'multChoice',
								options:[
									{text:"## nc_v\\Delta T = Q ##", isCorrect: false, message:"But it's adiabatic!"},
									{text:"##nc_v\\Delta T = -P_{ext}\\Delta V ##", isCorrect: true},
									{text:"##nc_p\\Delta T = -P_{ext}\\Delta V ##", isCorrect: false, message:"Why Cp?"},
									{text:"It cannot be simplified", isCorrect: false, message:"Yes it can.  What is Q equal to for an adiabatic system?"}
								]
							}
						]
					}			
				]	
		},
		{//First Scene
			sceneData: {
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'FirstWall', border: {type: 'wrap'}, hitMode: 'ArrowSpd'},
				],
				dots: [
					{spcName: 'spc4', pos: P(55, 210), dims: V(150,150), count: 1, temp: 400, returnTo: 'FirstWall', tag: 'FirstWall'},
				],
				objs: [
					{type: 'CompArrow',
						attrs: {handle: 'compArrow', wallInfo: 'FirstWall', speed: 2, bounds: {y: {max:380, min: 30}}, stops: true}
					}
				]
			},
			prompts:[
				{
					sceneData: {
						listeners: [
							{dataSet: {wallInfo: 'FirstWall', data: 'temp'}, is: 'notEqualTo', checkVal: 400, alertUnsatisfied: "Try to hit the molecule with the slider and see what happens!", priorityUnsatisfied: 1}
						]
					},
					text: "From the equation above we see that temperature increases as we do work by decreasing volume.  Temperature is an expression is molecular kinetic energy, so as the system is compressed, the molecules must speed up.  These ideal gas molecules can be thought of as perfectly elastic bouncy balls.  Using the movable wall above, can you determine what event causes the molecule's speed to change?  Can you explain why that would cause a temperature change in many molecules?<p>",
					quiz: [
						{type: 'text', storeAs: 'FirstSceneAnswer', Text: 'Type your answer here.'}
					],
					
				},
				{
				sceneData: undefined,
				text: "<p>So the molecules speed up when they collide with the moving wall.  Those collisions add kinetic energy, which means that the temperature increases.</p><p>Now let's do an experiment where we compress our adiabatic system.",
				}
			]
		},
		{//Second Scene
			sceneData: {
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'SecondWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc3', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'},
					{spcName: 'spc1', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'}
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'SecondWall', min: 2, init: 0, max: 20, makeSlider: false}
					},
					{type: 'DragWeights',
						attrs: {handle: 'DragsOne', wallInfo: 'SecondWall', weightDefs: [{count:1, pressure:13}], weightScalar: 10, pInit: 2, pistonOffset: V(130,-41), displayText: false}
					}			
				],
				dataDisplay: [
					{wallInfo: 'SecondWall', data: 'pExt', readout: 'pistonReadoutPistonOne'}
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:4}}, 
						sets:[
							{address:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'SecondWall', data: 'vol'}, y: {wallInfo: 'SecondWall', data: 'pExt'}}, trace: true, fillInPts: false, fillInPtsMin: 5}
						]
					}
				],
			},
			prompts:[
				{
					sceneData:{
						listeners: [
								// {dataSet: {wallInfo: 'SecondWall', data: 'pExt'}, is: 'isEqual', checkVal: 15 , atSatisfyCmmds: 'freeze' , priorityUnsatisfied: 1},
								// {dataSet: {wallInfo: 'SecondWall', data: 'v'}, is: 'lessThan', checkVal: 10, alertUnsatisfied: "Compress the system!", priorityUnsatisfied: 1, checkOn: 'conditions'}
							]
					},
						text: "Above is a well insulated piston cylinder assembly.  Place the block on top of the piston and observe the response.  How much work did the piston and block do on the system?",
						quiz: [
							{type: 'textSmall', storeAs: 'WorkDoneAnswer', units: 'kJ', text: ''}
						]
				},
				{
					sceneData: undefined,
						text: "The system had an initial temperature of 200 K and contains 1.8 moles of an ideal monatomic gas.  You wrote that get(WorkDoneAnswer,int) kJ of work were done.  What final temperature should the system have had?",
						quiz: [
							{type: 'textSmall', storeAs: 'TempAnswer', units: 'K', text: ''}
						]
				}
			]
		},
		{//Third Scene
			sceneData: {
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'ThirdWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc3', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'ThirdWall', tag: 'ThirdWall'},
					{spcName: 'spc1', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'ThirdWall', tag: 'ThirdWall'}
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'ThirdWall', min: 2, init: 0, max: 20, makeSlider: false}
					},
					{type: 'DragWeights',
						attrs: {handle: 'DragsOne', wallInfo: 'ThirdWall', weightDefs: [{count:1, pressure:13}], weightScalar: 10, pInit: 2, pistonOffset: V(130,-41), displayText: false}
					}			
				],
				dataDisplay: [
					{wallInfo: 'ThirdWall', data: 'pExt', readout: 'pistonReadoutPistonOne'},
					{wallInfo: 'ThirdWall', data: 'temp', readout: 'pistonReadoutPistonOne'},
					{wallInfo: 'ThirdWall', data: 'work', readout: 'pistonReadoutPistonOne'}
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVTwo', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:4}}, 
						sets:[
							{address:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'ThirdWall', data: 'vol'}, y: {wallInfo: 'ThirdWall', data: 'pExt'}}, trace: true, fillInPts: false, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'TvsVOne', xLabel: "Volume (L)", yLabel: "Temperature (K)", axesInit:{x:{min:6, step:2}, y:{min:0, step:200}}, 
						sets:[
							{address:'temp', label:'T sys', pointCol:Col(50,50,255), flashCol:Col(50,50,255), data:{x: {wallInfo: 'ThirdWall', data: 'vol'}, y: {wallInfo: 'ThirdWall', data: 'temp'}}, trace: true, fillInPts: false, fillInPtsMin: 5}
						]
					}	
				]
			},
			prompts:[
				{sceneData:undefined,
					text: "Previously you answered that the compression did get(WorkDoneAnswer,int) KJ on the system bringing it to a final temperature of get(TempAnswer,int) K.  Here's the same compression, but this time we're displaying work done and temperature. How do the results compare?  If there's a discrepency, can you account for it?",
					quiz: [
						{type: 'text', storeAs: 'DiscrepencyAnswer'}
					]
				}
			]
		},
	]
}
)