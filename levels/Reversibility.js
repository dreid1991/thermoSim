function Reversibility(){

	this.setStds();
	this.readouts = {};

	addSpecies(['spc1', 'spc3']);
	this.massInit = 33;

}


canvasHeight = 500;
$(function(){
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window.curLevel = new Reversibility();
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



_.extend(Reversibility.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html("Reversible and Irreversible Processes");
		showPrompt(0, 0, true);
	},
	sections:[
		// {//S0
			// setup:undefined,
			// prompts:[
				// {//P0
					// setup:undefined,
					// cutScene:true,
					// text:"<p>In these experiments, we will explore what makes a process irreversible and what makes a process reversible.</p><p>Before we get to the experiment, please first describe what you think the difference between an irreversible and a reversible process is.</p>",
					// quiz:[
						// {	
							// type:'text', 
							// text:'Type your answer here.'
						// }
					// ],						
					
				// }
			// ],
		// },
		{//S1
			sceneData:
				{
					walls: [
						{pts: [P(40,68), P(510,68), P(510,410), P(40,410)], handler: 'cVIsothermal', handle: 'wally', bounds: {yMin: 68, yMax: 435}, vol: 15, temp: 240.7, border: {yMin: 50, type: 'open'}}
					],
					dots: [
						{spcName: 'spc1', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'},
						{spcName: 'spc3', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'}
					],
					objs: [
						{type: 'Piston',
							attrs: {handle: 'PistonOne', wallInfo: 'wally', min: 2, init: 2, max: 20, makeSlider: false}
						},
						{type: 'DragWeights',
							attrs: {handle: 'DragsOne', wallInfo: 'wally', weightDefs: [{count:1, pressure:2}], weightScalar: 70, pInit: 0, pistonOffset: V(130,-41), displayText: false}
						}	
					],
					graphs: [
						{type: 'Scatter', handle: 'PvsV', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}, 
							sets:[
								{address:'pExt', label:'P_ext', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pExt'}}, trace: true, fillInPts: true, fillInPtsMin: 5},
								{address:'pInt', label:'P_int', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pInt'}}, trace: true, fillInPts: true, fillInPtsMin: 5}
							]
						}
					],
					dataDisplay: [
						{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistonOne'}
					]
				},
			prompts:[
				{//P0
					sceneData: undefined,
					// setup:
						// function() {
							// currentSetupType = 'prompt0';
							// this.listener = new StateListener({dataList:'v', is:'equalTo', targetVal:7.5, tolerance:.04, storeAtSatisfy:{work:walls[0].data.work}, alertUnsatisfied:"Click and drag the block onto the piston."});	
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							// //alertUnsatisfied:"Compress the system by dragging the weight up from the bin", 
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					text:"Let's begin our experiments with an isothermal compression process using a single block.  Please place the block on the piston.  In this compression process, estimate value of work.",
					title:"Current step",
					quiz:[
						{	
							type:'textSmall', 
							units:'kJ',
							text:'',
						}
					],	
				},
				// {//P1
					// setup: 
						// function() {
							// currentSetupType = 'prompt1';
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							// //alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"You calculated GET_userAnswerS1P0Q0| kJ for the isothermal compression process.  How does that compare to the value of heat?  Explain.",
					// title:"Current step",
					// quiz:[
						// {	
							// type:'text', 
							// text:'Type your answer here.'
						// }
					// ],	
				// },
				// {//P2
					// setup: 
						// function() {
							// currentSetupType = 'prompt2';
							// walls[0].resetQ();
							// walls[0].resetWork();
							// this.listener = new StateListener({dataList:walls[0].data.v, is:'equalTo', targetVal:15, tolerance:.04, storeAtSatisfy:{work:walls[0].data.work}, alertUnsatisfied:"Click and drag the block off of the piston."});	
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							// //alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:'Now remove the block and let the piston isothermally expand.  For the compression process, you estimated that it "cost" you GET_userAnswerS1P0Q0| kJ of work.  Estimate how much work you "got back" from the expansion.',
					// title:"Current step",
					// quiz:[
						// {	
							// type:'textSmall', 
							// text:'',
							// units:'kJ',
						// }
					// ],	
				// },
				// {//P3
					// setup: 
						// function() {
							// currentSetupType = 'prompt3';
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							// //alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"<p>Indeed, so it 'cost' you EVAL_round(GET_workS1P0| + GET_workS1P2|,1)| more kJ to compress the system than you 'got back' when expanding it.</p>",
					// title:"Current step",
	
				// },				
			]
		},
		{//S2
			sceneData:
				{
					walls: [
						{pts: [P(40,68), P(510,68), P(510,410), P(40,410)], handler: 'cVIsothermal', handle: 'wally', bounds: {yMin: 68, yMax: 435}, vol: 15, temp: 240.7, border: {yMin: 50, type: 'open'}}
					],
					dots: [
						{spcName: 'spc1', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'},
						{spcName: 'spc3', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'}
					],
					objs: [
						{type: 'Piston',
							attrs: {handle: 'PistonOne', wallInfo: 'wally', min: 2, init: 2, max: 20, makeSlider: false}
						},
						{type: 'DragWeights',
							attrs: {handle: 'DragsOne', wallInfo: 'wally', weightDefs: [{count:2, pressure:1}], weightScalar: 70, pInit: 0, pistonOffset: V(130,-41), displayText: false}
						}	
					],
					graphs: [
						{type: 'Scatter', handle: 'PvsV', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}, 
							sets:[
								{address:'pExt', label:'P_ext', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pExt'}}, trace: true, fillInPts: true, fillInPtsMin: 5},
								{address:'pInt', label:'P_int', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pInt'}}, trace: true, fillInPts: true, fillInPtsMin: 5}
							]
						}
					],
					dataDisplay: [
						{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistonOne'}
					]
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = "prompt0";
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8,
							//alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					title:"Current step",
					text:"Now place one block on the piston and let it come to rest.  Then add the second block.  How much work did the compression 'cost' you?",
					quiz:[
						{	
							type:'textSmall', 
							text:'',
							units:'kJ',
						}
					],
				},
				// {//P1
					// setup: 
						// function() {
							// currentSetupType = 'prompt1';
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							// //alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"The value for work that it 'cost' to compress with a single block was X.  Why you think it 'cost' less in two-block compression process?",
					// title:"Current step",
					// quiz:[
						// {	
							// type:'text', 
							// text:'Type your answer here.',
						// }
					// ],
				// },
				// {//P2
					// setup: 
						// function() {
							// currentSetupType = 'prompt2';
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							// //alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// title:"Current step",
					// text:"Next we're going to expand this system taking one block off at a time.  In the one-block expansion you got X kJ of work back.  How do you think this value will compare to the value you get back in the two block expansion?",
					
					// quiz:[
						// {
							// type:'buttons',
							// options:
								// [
								// {text:"greater", isCorrect: true},
								// {text:"less", isCorrect: false},
								// {text:"equal", isCorrect: false}
								
							// ]
						// }
					// ],
					
				// },
				// {//P3
					// setup:
						// function() {
							// currentSetupType = 'prompt3';
						// },
					// title:'Current step',

				// }
			]
		},
		{//S3
			sceneData:
				{
					walls: [
						{pts: [P(40,68), P(510,68), P(510,410), P(40,410)], handler: 'cVIsothermal', handle: 'wally', bounds: {yMin: 68, yMax: 435}, vol: 15, temp: 240.7, border: {yMin: 50, type: 'open'}}
					],
					dots: [
						{spcName: 'spc1', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'},
						{spcName: 'spc3', pos: P(42, 100), dims: V(468, 310), count: 750, temp: 240.7, returnTo: 'wally', tag: 'wally'}
					],
					objs: [
						{
							type: 'Sandbox', 
							attrs: {
								handle: 'sandy', 
								wallInfo: 'wally', 
								min: 2, 
								init: 2, 
								max:4
							}
						}
					],
					graphs: [
						{type: 'Scatter', handle: 'PvsV', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}, 
							sets:[
								{address:'pExt', label:'P_ext', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pExt'}}, trace: true, fillInPts: true, fillInPtsMin: 5},
								{address:'pInt', label:'P_int', pointCol:Col(50,50,255), flashCol:Col(255,200,200), data:{x: {wallInfo: 'wally', data: 'vol'}, y: {wallInfo: 'wally', data: 'pInt'}}, trace: true, fillInPts: true, fillInPtsMin: 5}
							]
						}
					],
					dataDisplay: [
						{wallInfo: 'wally', data: 'pExt', readout: 'pistonReadoutPistonOne'}
					]
				},
			prompts:[
				{//P0
					setup: undefined,
					text:"",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							//	alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//	storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"take off as quickly as you can",
					title:"Current step",
				},
				/*
				{//P2
					setup: undefined,
					cutScene:true,
					text:"Last time when putting on slowly, did GET#workS1P0| kJ of work.  This time when putting on quickly, did GET#workS3P0| kJ work.  Ask why?",
					quiz:[
						{
							type:'text',
							text:"Type your answer here.",
						}
					]
				}
				*/
			]
		},

		// {//S4
			// setup: 
				// function() {
					// currentSetupType = 'section';
					// this.unCompSetup();
					// this.makeGraph();
					// this.dragWeights = new DragWeights({weightDefs:[{count:8, pressure:2}], displayText:false, pInit:2})
					// walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
				// },
			// prompts:[
				// {//P0
					// setup:
						// function() {
							// currentSetupType = 'prompt0';
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							// //	alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							// //	storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"Put blocks on",
					// title:"Current step",
				// },
				// {//P1
					// setup: 
						// function() {
							// currentSetupType = 'prompt1';
							// //this.dragWeights.unfreeze();
							// //this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							// //	alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //	storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"Take blocks off",
					// title:"Current step",
				// }
			// ]
		// },
		// {//S5
			// setup: 
				// function() {
					// currentSetupType = 'section';
					// this.unCompSetup();
					// this.makeGraph();
					// this.sandbox = new Sandbox({pMin:2, pInit:2, pMax:4});
					// walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
				// },
			// prompts:[
				// {//P0
					// setup:
						// function() {
							// currentSetupType = 'prompt0';
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							// //	alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							// //	storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"Add weight in small increments",
					// title:"Current step",
				// },
				// {//P1
					// setup: 
						// function() {
							// currentSetupType = 'prompt1';
							// //this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							// //	alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							// //	storeAtSatisfy:{work:walls[0].data.work}});
						// },
					// text:"Remove weight in small increments",
					// title:"Current step",
				// }
			// ]
		// }
	// ],	

	// makeGraph: function(){
		// this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
							// axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}});
		// this.graphs.pVSv.addSet({address:'pExt', label:'P Ext.', pointCol:Col(255,50,50), flashCol:Col(255,200,200),
								// data:{x:walls[0].data.v, y:walls[0].data.pExt}, trace:true});		
		// this.graphs.pVSv.addSet({address:'pInt', label:'P Int.', pointCol:Col(50,255,50), flashCol:Col(200,255,200),
								// data:{x:walls[0].data.v, y:walls[0].data.pInt}, trace:true});

	// },
	// unCompSetup: function(){
		// walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[15], temps:[240.7]});
		// this.borderStd({min:40});
		// //spcs['spc1'].populate(P(35, 150), V(460, 250), 2, 215.38);
		// spcs['spc1'].populate(P(42, 100), V(468, 310), 750, 240.7, 'container');
		// spcs['spc3'].populate(P(42, 100), V(468, 310), 750, 240.7, 'container');
	// },
	// compSetup: function(){
		// walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[10.1], temps:[240.7]});
		// this.borderStd({min:68});
		// var maxY = walls[0][0].y;
		// var height = walls[0][3].y-walls[0][0].y;
		// spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 814, 240.7, 'container');
		// spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 611, 240.7, 'container');
	// },


}
)

