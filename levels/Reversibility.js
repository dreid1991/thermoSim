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
					this.dragWeights = new DragWeights({weightDefs:[{count:1, pressure:3}], displayText:false, pInit:3})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				},
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:6, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:"Compress the system by dragging the weight up from the bin"});
						},
					text:"B1P0",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							this.drawWeights.unfreeze();
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:3, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, alertUnsatisfied:"Expand the system by dragging the weight off of the piston"});
						},
					text:"B1P1",
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
					this.dragWeights = new DragWeights({weightDefs:[{count:4, pressure:3}], displayText:false, pInit:3})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				}
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:6, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:"Compress the system by dragging the weight up from the bin"});
						},
					text:"B2P0",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							this.drawWeights.unfreeze();
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:3, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, alertUnsatisfied:"Expand the system by dragging the weight off of the piston"});
						},
					text:"B2P1",
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
					this.dragWeights = new DragWeights({weightDefs:[{count:8, pressure:3}], displayText:false, pInit:3})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				}
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:6, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:"Compress the system by dragging the weight up from the bin"});
						},
					text:"B3P0",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							this.drawWeights.unfreeze();
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:3, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, alertUnsatisfied:"Expand the system by dragging the weight off of the piston"});
						},
					text:"B3P1",
					title:"Current step",
				}
			]
		},
		{//B4  Make this be sandbox block
			setup: 
				function() {
					currentSetupType = 'block';
					this.unCompSetup();
					this.makeGraph();
					this.dragWeights = new DragWeights({weightDefs:[{count:8, pressure:3}], displayText:false, pInit:3})
					walls[0].displayPExt().displayWork().displayQ().displayQArrows();
				}
			prompts:[
				{//P0
					setup:
						function() {
							currentSetupType = 'prompt0';
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:6, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:"Compress the system by dragging the weight up from the bin"});
						},
					text:"B4P0",
					title:"Current step",
				},
				{//P1
					setup: 
						function() {
							currentSetupType = 'prompt1';
							this.drawWeights.unfreeze();
							this.pListener = new StateListener({dataList:walls[0].data.pExt, is:'equalTo', targetVal:3, atSatisfyFunc: {func:function(){this.dragWeights.freeze()}, obj:this}});
							this.compListener = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:15, alertUnsatisfied:"Expand the system by dragging the weight off of the piston"});
						},
					text:"B4P1",
					title:"Current step",
				}
			]
		}
	],	

	makeGraph: function(){
		this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
							axesInit:{x:{min:6, step:2}, y:{min:0, step:3}}});
		this.graphs.pVSv.addSet({address:'pExt', label:'P Ext.', pointCol:Col(50,50,255), flashCol:Col(200,200,255),
								data:{x:walls[0].data.v, y:walls[0].data.pExt}, trace:true});		
		this.graphs.pVSv.addSet({address:'pInt', label:'P Int.', pointCol:Col(50,255,50), flashCol:Col(200,255,200),
								data:{x:walls[0].data.v, y:walls[0].data.pInt}, trace:true});

	},
	unCompSetup: function(){
		walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[15], temps:[236]});
		this.borderStd({min:68});
		//spcs['spc1'].populate(P(35, 150), V(460, 250), 2, 215.38);
		spcs['spc1'].populate(P(35, 110), V(460, 250), 814, 236);
		spcs['spc3'].populate(P(35, 110), V(460, 250), 611, 236);
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


/*

	block0Start: function(){
		var wallHandle = 'container';
		this.unCompSetup();
		this.makeGraphsRev();
		this.sandBox = new Sandbox();
		walls[0].displayQArrows();
		//this.dragWeights = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:33}]})
		//this.dragWeights.wall.displayPExt().displayWork().recordMass().displayMass().displayVol();
		this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'equalTo', targetVal:7, alertUnsatisfied:'NO', alertSatisfied:'YES', atSatisfyFunc:{func:function(){store('workInLrg',round(walls[0].work,1))},obj:''}});
		this.readout.show();
	},	

	block2Start: function(){
		this.makeGraphsRev();
		var numBlocks = getStore('numBlocks');
		this.unCompSetup();
		this.dragWeights = new DragWeights({weightDefs:{mass:90, count:numBlocks}}).trackPressure().trackWork();
		this.trackVolume(0);
		this.volListener10 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.02, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:function(){store('workInMed', round(walls[0].work,1))},obj:''}});
	},
	block2Conditions: function(){
		if(this.volListener10.isSatisfied()){
			return {result:true};
		}else{
			return {result:false, alert:'Compress thy system!'};
		}
	},
	block2CleanUp: function(){
		this.trackVolumeStop();
		this.removeAllGraphs();
		this.dragWeights.remove();
		this.dragWeights = undefined;
		//walls[0].trackWorkStop();
	},
	block5Start: function(){
		this.makeGraphsRev();
		this.unCompSetup();
		this.trackVolume(0);		
		this.pool = new Pool({massMax:100, massMin:10}).trackWork().trackMass().trackPressure();
		this.volListener10 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.02, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:function(){store('workInSml', round(walls[0].work,1))},obj:''}});
		$('#reset').hide();
		$('#clearGraphs').hide();
		$('#buttonFill').show();
		$('#buttonDrain').show();
	},
	block5Conditions: function(){
		if(this.volListener10.isSatisfied()){
			return {result:true};
		}else{
			return {result:false, alert:'Compress thy system!'};
		}
	},
	block5CleanUp: function(){
		$('#reset').show();
		$('#clearGraphs').show();
		$('#buttonFill').hide();
		$('#buttonDrain').hide();
		this.trackVolumeStop();
		this.removeAllGraphs();
		this.pool.remove();
		this.pool = undefined;
		this.stops.remove();
		
	},
	block7CleanUp: function(){
		this.removeAllGraphs();
	},
	block8Start: function(){
		this.makeGraphsRev();
		this.compSetup();
		this.trackVolume(0);
		this.volListener16 = new StateListener({condition:16, checkAgainst:this.data.v, tolerance:.05, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:function(){store('workOutLrg', Math.abs(round(walls[0].work,1)))},obj:''}});
		walls[0].trackWork(this.readout);
		this.dragWeights = new DragWeights({weightDefs:{mass:90, count:1}}).dropAllIntoPistons('instant').trackPressure();
	},
	block8Conditions: function(){
		if(this.volListener16.isSatisfied){
			return{result:true};
		}else{
			return{result:false, alert:"Expand the system!"}
		}
	},
	block8CleanUp: function(){
		walls[0].trackWorkStop();
		this.trackVolumeStop();
		this.dragWeights.remove();
	},
	block9CleanUp: function(){
		this.removeAllGraphs();
	},
	block10Start: function(){
		this.compSetup();
		this.pool = new Pool({massInit:60});
		//this.dragWeights = new DragWeights({weightDefs:{mass:90, count:12}}).trackPressure().dropAllIntoPistons('instant');
		this.makeGraphsRev();
		this.volListener16 = new StateListener({condition:16, checkAgainst:this.data.v, tolerance:.05, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:function(){store('workOutSml', Math.abs(round(walls[0].work,1)))},obj:''}});
		walls[0].trackWork(this.readout);
		this.trackVolume(0);
		$('#reset').hide();
		$('#clearGraphs').hide();
		$('#buttonFill').show();
		$('#buttonDrain').show();
	},
	block10CleanUp: function(){
		$('#reset').show();
		$('#clearGraphs').show();
		$('#buttonFill').hide();
		$('#buttonDrain').hide();
		this.trackVolumeStop();
		walls[0].trackWorkStop();
		this.removeAllGraphs();
		this.pool.remove();
	},
	block13Start: function(){
		this.unCompSetup();
		this.makeGraphsRev();

		this.volListener10 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.02, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:
				function(){
					var compWork = walls[0].work;
					store('cycleLrgCompWork', round(compWork,1));
					this.volListener16 = new StateListener({condition:16, checkAgainst:this.data.v, tolerance:.02, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:
					function(){
						store('cycleLrgUnCompWork', round(compWork - walls[0].work,1));
					},obj:this}
					}
					);
				},
				obj:this}
			}
			
		);
		this.dragWeights = new DragWeights({weightDefs:{mass:90, count:1}}).trackPressure().trackWork();		
		this.trackVolume(0);
	},
	block13Conditions: function(){
		if(this.volListener10.isSatisfied() && this.volListener16.isSatisfied()){
			return {result:true};
		}else if(!this.volListener10.isSatisfied()){
			return {result:false, alert:"You haven't compressed it all the way yet!"};
		}else{
			return {result:false, alert:"Finish the cycle!"};
		}
	},
	block13CleanUp: function(){
		this.removeAllGraphs();
		this.dragWeights.remove();
		this.trackVolumeStop();
	},
	block14Start: function(){
		$('#reset').hide();
		$('#clearGraphs').hide();
		$('#buttonFill').show();
		$('#buttonDrain').show();
		this.unCompSetup();
		this.makeGraphsRev();
		this.volListener10 = new StateListener({condition:10, checkAgainst:this.data.v, tolerance:.05, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:
			function(){
				var compWork = walls[0].work;
				store('cycleSmlCompWork', round(compWork, 1));
				this.volListener16 = new StateListener({condition:16, checkAgainst:this.data.v, tolerance:.02, recordAtSatisfy:{v:this.data.v}, atSatisfyFunc:{func:
				function(){
					store('cycleSmlUnCompWork', round(compWork - walls[0].work, 1));
				},obj:this}
				}
				);
			},
			obj:this}
		});
		this.trackVolume(0);
		this.pool = new Pool().trackPressure().trackMass().trackWork();
	},
	block14Conditions: function(){
		if(this.volListener10.isSatisfied() && this.volListener16.isSatisfied()){
			return {result:true};
		}else if(!this.volListener10.isSatisfied()){
			return {result:false, alert:"You haven't compressed it all the way yet!"};
		}else{
			return {result:false, alert:"Finish the cycle!"};
		}
	},
	block14CleanUp: function(){
		$('#reset').show();
		$('#clearGraphs').show();
		$('#buttonFill').hide();
		$('#buttonDrain').hide();
		this.removeAllGraphs();
		this.trackVolumeStop();
		walls[0].trackWorkStop();
		this.pool.remove();
		this.prompts[15].quiz.answer = 100*getStore('cycleSmlUnCompWork')/getStore('cycleSmlCompWork');
	},

	blockNStart: function(){
	
	},
	blockNCleanUp: function(){
	
	},
	*/