
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
		this.readout = new Readout('mainReadout', 30, myCanvas.width-400, 25, '13pt calibri', Col(255,255,255), 'left');
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
					text:"<p>Let's examine heat capacities.</p><p>For an ideal monatomic gas, which of these is correct?  ##c_V## refers to the heat capacity in a constant volume system; ## c_P ## refers to heat capacity in a constant pressure system.",
					quiz:[
						{
							storeAs: 'foo', 
							type:'text', 
							text:'Type your answer here.', 
							}, 
						]	
					},	 
				{//second question
					sceneData: undefined, 
					cutScene: true, 
					text: "We're going to start by heating a constant volume system containing 1 mole of an ideal monotomic gas by 100 K.  How much energy should this heating ‘cost’?",
					quiz:[						
					{
						type: 'textSmall', 
						storeAs: 'WorkDoneAnswer', 
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
					{pts:[P(40,190), P(510,190), P(510,425), P(40,425)], handler:'staticAdiabatic', handle:'wally', vol:5, border: {type: 'wrap'}},
				],
				dots: [	
					{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc2', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
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
					cutScene:true,
					text: "You wrote that this heating would 'cost' (get the stored value for first section, third prompt) kj.  If you heat this system containing one mole of our ideal monatomic gas, how much energy does it take?   Does your prediction match the experimental result?  Explain",
					quiz:[
						{
							storeAs: 'foo', 
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
				text: "Now we're going to heat the system by 100 K under constant pressure.   How do you think the energy ‘cost’ for heating the system under constant pressure will compare to heating it under constant volume?  Explain.", 
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
					{pts:[P(40,190), P(510,190), P(510,425), P(40,425)], handler:'staticAdiabatic', handle:'wally', vol:5, border: {type: 'open'}},
				],
				dots: [	
					{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc2', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					],
				objs: [
					{type: 'Heater', 
						attrs: {handle: 'heaterWally', wallInfo: 'wally'}},	
					{type: 'piston', 
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
				text: "Here is the constant pressure system filled with one mole of the ideal monatomic gas.  Heat the system to (init temp + 100) K.  How does the value compare to the constant volume value of (get the value) kJ?",
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
				text: "The system had a constant external pressure of (system pressure) bar, contained one mole of an ideal monatomic gas, and was heated by 100 K.  From the first law, what should the change in system volume have been?  How much work did the system do on its surroundings?", 
				quiz:[						
					{
						type: 'textSmall', 
						storeAs: 'volumeChangeAnswer', 
						units: 'L', 
						text: ''
					},
					{
						type: 'textSmall', 
						storeAs: 'workDoneAnswer', 
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
					{pts:[P(40,190), P(510,190), P(510,425), P(40,425)], handler:'staticAdiabatic', handle:'wally', vol:5, border: {type: 'open'}},
				],
				dots: [	
					{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					{type: 'spc2', pos: P(45,200), dims: V(200, 200), count: 500, temp:150, returnTo: 'wally', tag: 'wally'},
					],
				objs: [
					{type: 'Heater', 
						attrs: {handle: 'heaterWally', wallInfo: 'wally'}},	
					{type: 'piston', 
						attrs: {handle: 'pistony', wallInfo: 'wally', makeSlider: false}}, 
					],			
				dataDisplay: [
					{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistony'},
					{wallInfo: 'wally', data: 'work', readout: 'mainReadout'},
					{wallInfo: 'wally', data: 'q', readout: 'mainReadout'},
					{wallInfo: 'wally', data: 'Temp', readout: 'mainReadout'},
					//{wallInfo: 'right', data: 'pInt', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'Temp', readout: 'mainReadout'}, 
					//{wallInfo: 'left', data: 'q', readout: 'mainReadout'},
					//{wallInfo: 'left', data: 'pInt', readout: 'mainReadout'},										
				],
			}, 			
		}, 
		{//Seventh section; cutscene, one question in one prompt
			sceneData:undefined, 
			prompts:[
				{
				cutScene:true, 
				text: "The heat capacity per mole of gas can be described at the heat per temperature change, or $$\\frac{dq}{dT} $$. We know that the constant volume heat capacity of an ideal monatomic gas is ##\\frac{3}{2}R##. From the first law, solve for what the ##\\frac{dq}{dt}##, or heat capacity, would be for this system under constant pressure. How does the result relate to your conceptual understanding of how constant pressure systems behaves?  Explain.", 
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