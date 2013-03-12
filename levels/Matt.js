
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
		$('#mainHeader').html('Heat capacity behaviors');
		showPrompt(0, 0, true);
	},
	
	
	
	sections: [		
	//Questions only section	
		{
			sceneData:undefined, 
			prompts:[
				{//first question
					sceneData:undefined,
					cutScene:true,
					text:"<p>Let's examine heat capacities.</p><p>For an ideal monatomic gas, which of these is correct?  ##c_V## refers to the heat capacity in a constant volume system; ## c_P ## refers to heat capacity in a constant pressure system.",
					quiz:[
						{
							type:'multChoice',
							options:
								[
									{text:"<center> ## c_V = \\frac{3}{2}R ## and ## c_P = \\frac{5}{2}R ##</center>", isCorrect: true},
									{text:"<center> ## c_V = \\frac{5}{2}R ## and ## c_P = \\frac{3}{2}R ##</center>", isCorrect: false, message:"try harder"}, 
									{text:"<center> ## c_V = \\frac{3}{2}R ## and ## c_P = \\frac{3}{2}R ##</center>", isCorrect: false, message:"try harder"},
									{text:"<center> ## c_V = \\frac{9}{2}R ## and ## c_P = \\frac{7}{2}R ##</center>", isCorrect: false, message:"try harder"},
							]
						}, 
					]
				}, 
				{//second question
					sceneData: undefined, 
					cutScene: true, 
					text: "You just said that an ideal gas has a higher heat capacity under constant pressure than under constant volume. Let's see why. But first a test of context understanding... with a constant heating rate, will a constant volume system increase in temperature more than a constant pressure system?", 
					quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
						}, 
					]
				}
			]
		}, 
	
	//Simulations section
		{
			sceneData: {
				walls: [
					{pts:[P(40,190), P(255,190), P(255,425), P(40,425)], handler:'staticAdiabatic', handle:'left', vol:5, border: {type: 'wrap'}},
					{pts:[P(295,190), P(510,190), P(510,425), P(295,425)], handler:'staticAdiabatic', handle:'right', bounds:{yMin:50, yMax:275}, border: {type: 'open'}}
				],
				dots: [	
					{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 300, temp:150, returnTo: 'left', tag: 'left'},
					{type: 'spc3', pos: P(45,200), dims: V(200, 200), count: 300, temp:150, returnTo: 'left', tag: 'left'},
					{type: 'spc1', pos: P(300,200), dims: V(200, 200), count: 300, temp:150, returnTo: 'right', tag: 'right'},
					{type: 'spc3', pos: P(300,200), dims: V(200, 200), count: 300, temp:150, returnTo: 'right', tag: 'right'}, 
				],
				objs: [
					{type: 'Piston', 
						attrs: {handle: 'RightPiston', wallInfo: 'right', makeSlider:false}},
					{type: 'Heater', 
						attrs: {handle: 'heaterLeft', wallInfo: 'left'}},
					{type: 'Heater', 
						attrs: {handle: 'heaterRight', wallInfo: 'right'}}, 
					{type: 'DragWeights', attrs: {wallInfo: 'right', weightDefs:[{count:2, pressure:2}], weightScalar:70, displayText:true, pInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)}}					
					],
				dataDisplay: [
					{wallInfo: 'right', data: 'pExt', readout: 'pistonReadoutRightPiston'},
					{wallInfo: 'right', data: 'vol', readout: 'pistonReadoutRightPiston'},
					//{wallInfo: 'right', data: 'q', readout: 'mainReadout'},
					{wallInfo: 'right', data: 'Temp', readout: 'mainReadout'},
					{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
				],
				graphs: [
					{type: 'Scatter', handle: 'leftHeat', xLabel: 'Heat (J)', yLabel: 'Volume (L)', axesInit:{x:{min:6, step:2}, y:{min:3, step:2}}, 
						sets:[
							{address:'vol', label:'volume', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'right', data: 'q'}, y: {wallInfo: 'right', data: 'vol'}}, trace: true, fillInPts: false, fillInPtsMin: 5}
						]
					}
				]
			}, 
			prompts:[
				{sceneData:undefined,
					text: "So here are constant volume and constant pressure containers. Both are adiabatic and contain 0.6 moles of an ideal monatomic gas. Heat the two containers to 250 K. How do the energies used compare?",
					quiz: [
						{type: 'textSmall', storeAs: 'WorkDoneAnswer', units: 'kJ', text: ''}
					]
				},
				{sceneData: undefined,
					text: "<p>It took 0.5 kJ to bring the constant volume container to 250 K while the constant pressure took 0.8 kJ.</p>Do you have any theories about why that is?",
					quiz: [
						{type: 'text', storeAs: 'TempAnswer', text: ''}
					]
				},
				{sceneData: undefined, 
					text: "<p>Good, goooooood. When you heated the constant <i>volume</i> container, where did the added energy go?</p>", 
					quiz:[
						{
						type:'multChoice', 
						options:
								[
								 {text:"To the molecules, to speed them up, and to the surroundings by expanding the system (work).", isCorrect: true}, 
								 {text:"To the molecules, to speed them up", isCorrect: false, message: "Didn't the system also expand?"},
								 {text:"To the surroundings through work", isCorrect: false, message: "Didn't the molecules also speed up?"},  											
							]
						}
					]
				}, 
				{sceneData: undefined, 
					text:"<p>What about the constant pressure piston? When you heated the constant <i>pressure</i> container, where did the added energy go?</p>", 
					quiz:[
						{
						type:'multChoice', 
						options:
							[
								{text:"To the molecules, to speed them up, and to the surroundings by expanding the system (work).", isCorrect: true}, 
								{text:"To the molecules, to speed them up", isCorrect: false, message: "Didn't the system also expand?"},
								{text:"To the surroundings through work", isCorrect: false, message: "Didn't the molecules also speed up?"}, 												
						],
					}			
				]
			}	
			]
		}
	
	]

}
)