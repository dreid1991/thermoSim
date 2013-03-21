
canvasHeight = 450;


$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new Matt2();
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



function Matt2(){
	this.setStds();
	this.wallSpeed = 6;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Matt2.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('Heat capacity behaviors');
		showPrompt(0, 0, true);
	},
	
	sections: [		
		{//First Section; cutscene, two questions contained in two prompts	
			sceneData:undefined, 
			prompts:[
				{//first question
					sceneData:undefined,
					cutScene:true,
					text:"<p>Today we're going to investigate heat capacities.  Using your own words, how would you explain heat capacity to a high school senior?</p>",
					quiz:[
						{
							storeAs: 'foo1', 
							type:'text', 
							text:'Type your answer here.', 
							}, 
						]	
					},	 
				{//second question
					sceneData: undefined, 
					cutScene: true, 
					text: "<p>We're going to start by heating a constant volume system containing 1 mole of an ideal monotomic gas by 100 K.  How much energy should this heating 'cost'?</p>",
					quiz:[						
					{
						type: 'textSmall', 
						storeAs: 'foo2', 
						units: 'kJ', 
						text: ''
					},							
					 
					]
				}
			]
		}, 
		{//Second Section; one wall with a heater, one question in one prompt
			sceneData: {
				walls: [
					{pts:[P(40,40), P(510,40), P(510,425), P(40,425)], handler:'staticAdiabatic', handle:'wally', border: {type: 'wrap'}},
					],
				dots: [	
					{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc3', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					],
				objs: [
					{type: 'Heater', 
						attrs: {handle: 'heaterWally', wallInfo: 'wally'}},	
					],			
				dataDisplay: [
					//{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutRightPiston'},
					//{wallInfo: 'wally', data: 'vol', readout: 'pistonReadoutRightPiston'},
					{wallInfo: 'wally', data: 'q', readout: 'mainReadout'},
					{wallInfo: 'wally', data: 'Temp', readout: 'mainReadout'},
					//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
					],
			}, 
			prompts:[				
				{//question
					sceneData:undefined,
					cutScene:false,
					text: "Now let's perform an experiment.  You wrote that this heating would 'cost' get(foo2, string, noValue) kJ.  The system above shows contains our one mole of ideal monatomic gas.   You can add energy by heat using the slider.  Heat the system by 100 K.   How does your prediction compare to the experimental result?  Explain.",
					quiz:[
						{
							storeAs: 'foo3', 
							type:'text', 
							text:'Type your answer here.', 
						}, 
					]	
				},	
			]
		}, 
		{//Third section; cutscene, one question in one prompt 
			sceneData:undefined,
			prompts: [
			{//question 
				cutScene: true, 
				text: "Now we're going to heat the system by 100 K at constant pressure.   How do you think the energy 'cost' for this process will compare to heating it at constant volume?  Explain.", 
				quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
						}, 
					]
				}, 
			],
		}, 
		{//Fourth section; one wall filled with half a mole of spc1 and half a mole of spc2, one prompt
			sceneData: {
				walls: [
					{pts:[P(40,190), P(510,190), P(510,425), P(40,425)], handler:'staticAdiabatic', vol: 6.66, handle:'wally', border: {type: 'open', yMin: 50}},
				],
				dots: [	
					{type: 'spc1', pos: P(100,300), dims: V(300, 110), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc3', pos: P(100,300), dims: V(300, 110), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					],
				objs: [
					{type: 'Heater', 
						attrs: {handle: 'heaterWally', wallInfo: 'wally'}},	
					{type: 'Piston', 
						attrs: {handle: 'pistony', wallInfo: 'wally', makeSlider: false}}, 
				],			
				dataDisplay: [
					{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistony'},
					//{wallInfo: 'wally', data: 'vol', readout: 'pistonReadoutRightPiston'},
					{wallInfo: 'wally', data: 'q', readout: 'mainReadout'},
					{wallInfo: 'wally', data: 'Temp', readout: 'mainReadout'},
					//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
				]
			},			
			prompts:[ 
				{
				text: "Here is the constant pressure system filled with one mole of the ideal monatomic gas.  Heat the system by 100 K.  How does the value compare to the constant volume value of (get the value) kJ?",
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
		{//Fifth section; cutscene, one question in one prompt
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				text: "<p>The system had a constant external pressure of (system pressure) bar, contained one mole of an ideal monatomic gas, and was heated by 100 K.  From the first law, what should the change in system volume have been?  How much work did the system do on its surroundings?</p>", 
				quiz:[						
					{
						type: 'textSmall', 
						storeAs: 'foo', 
						units: 'L', 
						text: ''
					},
					{
						type: 'textSmall', 
						storeAs: 'fooo', 
						units: 'kJ', 
						text: ''
					},						 
				]
			}
		]	
	}, 
		{//Sixth section; one wall with heater and extra info displayed, 
			sceneData: {
				walls: [
					{pts:[P(40,190), P(510,190), P(510,425), P(40,425)], handler:'staticAdiabatic', vol: 6.66, handle:'wally', border: {type: 'open', yMin: 50}},
				],
				dots: [	
					{type: 'spc1', pos: P(100,300), dims: V(300, 110), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc3', pos: P(100,300), dims: V(300, 110), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					],
				objs: [
					{type: 'Heater', 
						attrs: {handle: 'heaterWally', wallInfo: 'wally'}},	
					{type: 'Piston', 
						attrs: {handle: 'pistony', wallInfo: 'wally', makeSlider: false}}, 
				],			
				dataDisplay: [
					{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistony'},
					{wallInfo: 'wally', data: 'work', readout: 'pistonReadoutPistony'},
					{wallInfo: 'wally', data: 'q', readout: 'mainReadout'},
					{wallInfo: 'wally', data: 'tempSmooth', readout: 'mainReadout'},
					//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
				]
			},
			prompts: [
						{
						text: "Here's the same system with the work done displayed.  Heat the system by to (init + 100) K.  You predicted that (their work val) kJ of work would be done.  How does this compare to the experimental result?",
						quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
						},
					]
				}, 
				{
					text: "We've established that when you expand at constant pressure, the system does work on its surroundings.  Can you use this idea to explain why a system's heat capacity is higher at constant pressure than at constant volume?",
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
		{//Seventh section; cutscene, one question in one prompt
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				text: "<p>The heat capacity per mole of gas can be described at the heat per temperature change, or ##\\frac{dq}{dT} ##.</p><p> We know that the constant volume heat capacity of an ideal monatomic gas is ##\\frac{3}{2}R##. </p><p>From the first law, solve for what the ##\\frac{dq}{dt}##, or heat capacity, would be for this system at constant pressure. </p><p>How does the result relate to your conceptual understanding of how constant pressure systems behaves?  Explain.</p>", 
				quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
						},
					]
				}
			]
		}
	]

}
)