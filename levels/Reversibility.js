function Reversibility(){

	this.setStds();

	this.readout = new Readout('mainReadout', 15, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');

	addSpecies(['spc1', 'spc3']);
	this.massInit = 33;

}
_.extend(Reversibility.prototype, 
			LevelTools, 
{
	init: function() {
		$('#mainHeader').html("Reversible and Irreversible Processes");
		showPrompt(0, 0, true);
	},
	blocks:[
		{//B0
			setup:undefined,
			prompts:[
				{//P0
					setup:undefined,
					cutScene:true,
					text:"<p>In these experiments, we will explore what makes a process irreversible and what makes a process reversible.</p><p>Before we get to the experiment, please first describe what you think the difference between an irreversible and a reversible process is.</p>",
					quiz:[
						{	
							type:'text', 
							text:'Type your answer here.'
						}
					],						
					
				}
			],
		},
		{//B1
			setup:
				function() {
					currentSetupType = 'block';
					this.compSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:10, pressure:2}], weightScalar:70, displayText:false, massInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)});
					this.piston = new Piston({wallInfo:'container', init:2, min:2, max:15, makeSlider:false});
					//this.dragWeights = new DragWeights({weightDefs:[{count:1, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayQ().displayQArrowsAmmt();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							//alertUnsatisfied:"Compress the system by dragging the weight up from the bin", 
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
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
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							//alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"You calculated XXX kJ for the isothermal compression process.  How does that compare to the value heat?  Explain.",
					title:"Current step",
					quiz:[
						{	
							type:'text', 
							text:'Type your answer here.'
						}
					],	
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt2';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							//alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Now remove the block and let the piston isothermally expand.  For the compression process, you estimated that it 'cost'DOUBLE QUOTES you 3 kJ of work.  Estimate how much work you 'got back' from the expansion.",
					title:"Current step",
					quiz:[
						{	
							type:'textSmall', 
							text:'',
							units:'kJ',
						}
					],	
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt3';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							//alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"<p>Indeed, so it 'cost' you X more kJ to compress the system than you 'got back' when expanding it.</p>",
					title:"Current step",
	
				},				
			]
		},
		{//B2
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:2, pressure:2}], weightScalar:70, displayText:false, massInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)});
					this.piston = new Piston({wallInfo:'container', init:2, min:2, max:15, makeSlider:false});
					//this.dragWeights = new DragWeights({weightDefs:[{count:2, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
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
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							//alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"The value for work that it 'cost' to compress with a single block was X.  Why you think it 'cost' less in two-block compression process?",
					title:"Current step",
					quiz:[
						{	
							type:'text', 
							text:'Type your answer here.',
						}
					],
				},
				{//P2
					setup: 
						function() {
							currentSetupType = 'prompt2';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							//alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					title:"Current step",
					text:"Next we're going to expand this system taking one block off at a time.  In the one-block expansion you got X kJ of work back.  How do you think this value will compare to the value you get back in the two block expansion?",
					
					quiz:[
						{
							type:'buttons',
							options:
								[
								{text:"greater", isCorrect: true},
								{text:"less", isCorrect: false},
								{text:"equal", isCorrect: false}
								
							]
						}
					],
					
				},
				{//P3
					setup:
						function() {
							currentSetupType = 'prompt3';
						},
					title:'Current step',

				}
			]
		},
		{//B3
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:2, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							//alertUnsatisfied:"Compress the system by dragging the weight up from the bin", 
							//storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Put on as quickly as you can",
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
					text:"Last time when putting on slowly, did GET#workB1P0| kJ of work.  This time when putting on quickly, did GET#workB3P0| kJ work.  Ask why?",
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

		{//B4
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:8, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							//	alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							//	storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Put blocks on",
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
					text:"Take blocks off",
					title:"Current step",
				}
			]
		},
		{//B5
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.sandbox = new Sandbox({pMin:2, pInit:2, pMax:4});
					walls[0].displayPExt().displayWork().displayQ().displayQArrowsAmmt();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							//	alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							//	storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Add weight in small increments",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							//	alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							//	storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Remove weight in small increments",
					title:"Current step",
				}
			]
		}
	],	

	makeGraph: function(){
		this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
							axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}});
		this.graphs.pVSv.addSet({address:'pExt', label:'P Ext.', pointCol:Col(255,50,50), flashCol:Col(255,200,200),
								data:{x:walls[0].data.v, y:walls[0].data.pExt}, trace:true});		
		this.graphs.pVSv.addSet({address:'pInt', label:'P Int.', pointCol:Col(50,255,50), flashCol:Col(200,255,200),
								data:{x:walls[0].data.v, y:walls[0].data.pInt}, trace:true});

	},
	unCompSetup: function(){
		walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[15], temps:[240.7]});
		this.borderStd({min:40});
		//spcs['spc1'].populate(P(35, 150), V(460, 250), 2, 215.38);
		spcs['spc1'].populate(P(42, 100), V(468, 310), 750, 240.7);
		spcs['spc3'].populate(P(42, 100), V(468, 310), 750, 240.7);
	},
	compSetup: function(){
		walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[10.1], temps:[240.7]});
		this.borderStd({min:68});
		var maxY = walls[0][0].y;
		var height = walls[0][3].y-walls[0][0].y;
		spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 814, 240.7);
		spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 611, 240.7);
	},


}
)

