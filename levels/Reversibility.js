function Reversibility(){

	this.setStds();

	this.readout = new Readout('mainReadout', 15, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), this);

	addSpecies(['spc1', 'spc3']);
	this.massInit = 33;

}
_.extend(Reversibility.prototype, 
			LevelTools, 
{
	init: function() {
		$('#mainHeader').html("Reversibility");
		showPrompt(0, 0, true);
	},
	blocks:[
		{//B0
			setup:undefined,
			prompts:[
				{//P0
					setup:undefined,
					cutScene:'intro',
					text:"hello, I'm an intro",
				}
			],
		},
		{//B1
			setup:
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:1, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							alertUnsatisfied:"Compress the system by dragging the weight up from the bin", 
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Put block on",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15,
							alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Take block off",
					title:"Current step",
				}
			]
		},
		{//B2
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:2, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8,
							alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Put blocks on when at equilibrium",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Take block off when at equilibrium",
					title:"Current step",
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
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
								alertUnsatisfied:"Compress the system by dragging the weight up from the bin", 
								storeAtSatisfy:{work:walls[0].data.work}});
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
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
								alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
								storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"take off as quickly as you can",
					title:"Current step",
				},
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
			]
		},

		{//B4
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:8, pressure:2}], displayText:false, pInit:2})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							//this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:4, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Put on",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							//this.dragWeights.unfreeze();
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:2, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"Take off",
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
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:7.8, 
							alertUnsatisfied:"Compress the system by dragging the weight up from the bin",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"B5P0",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, 
							alertUnsatisfied:"Expand the system by dragging the weight off of the piston",
							storeAtSatisfy:{work:walls[0].data.work}});
						},
					text:"B5P1 - last",
					title:"Current step",
				}
			]
		}
	],	

	makeGraph: function(){
		this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
							axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}});
		this.graphs.pVSv.addSet({address:'pExt', label:'P Ext.', pointCol:Col(50,50,255), flashCol:Col(200,200,255),
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
		walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[10.1]});
		//add temp to wall
		this.borderStd({min:68});
		var maxY = walls[0][0].y;
		var height = walls[0][3].y-walls[0][0].y;
		spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 814, 273);
		spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 611, 273);
	},


}
)

