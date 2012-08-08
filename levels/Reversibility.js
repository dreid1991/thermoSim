function Reversibility(){
	dataHandler = new DataHandler();
	this.setStds();
	this.data.t = [];
	this.data.pInt = [];
	this.data.pExt = [];
	this.data.v = [];
	this.data.e = [];
	var wallHandle = 'container';
	walls = WallHandler([[P(40,75), P(510,75), P(510,440), P(40,440)]], 'staticAdiabatic', [wallHandle], [{yMin:60, yMax:435}]);

	this.readout = new Readout('mainReadout', 15, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), this);
	var self = this;
	this.prompts=[
		{block:0, title:"Current step", finished: false, text:"Good day.  I have an important task for you.  This system above, it must be compressed to 10 L using as little energy as possible.  You can drag the weight onto the piston to compress to this volume with a pressure of 6 atm.  If you compress with this block, how much work will you do on the system?"},
		{block:1, title:"", finished: false, text:""},
		{block:2, title:"GAH", finished:false, text:"WAY TO GO"}
	]
	
	
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	;
	//walls.setSubWallHandler(0, 0, {func:this.onWallImpactTop, obj:this});
	/*
	this.workTracker = new WorkTracker('tracky',
										function(){return walls[0][0].y},
										walls[0][1].x-walls[0][0].x,
										function(){return self.dragWeights.mass()},
										{readout:this.readout, idx:1},
										this);
										*/
										

	addSpecies(['spc1', 'spc3']);
	this.massInit = 10;
}
_.extend(Reversibility.prototype, 
			LevelTools, 
{
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}
		var self = this;
		this.graphs.pVSv = new GraphScatter('pVSv', 400,293, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:2}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 293,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:180, step:60}});
		this.graphs.pVSv.addSet('pInt', 'P Int.', Col(0,0,255), Col(200,200,255),
								{data:this.data, x:'v', y:'pInt'});
		this.graphs.pVSv.addSet('pExt', 'P Ext.', Col(0,255,0), Col(200,255,200),
								{data:this.data, x:'v', y:'pExt'});
		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
		
		
		nextPrompt();
	},
	block0Start: function(){
		var wallHandle = 'container';
		this.unCompSetup();
		walls[0].trackWorkStart(this.readout);
		this.dragWeights = this.makeDragWeights([{name:'lrg', count:1, mass:90}], wallHandle, this.massInit).init().trackEnergyStop().trackPressureStart();
		this.trackVolumeStart(0);
		this.volListener10 = new StateListener(10, this.data.v, .05, {v:this.data.v});
		this.readout.show();
	},	
	block0Conditions: function(){
		if(this.volListener10.isSatisfied()){
			return {result:true};
		}else{
			return {result:false, alert:'Compress thy system!'};
		}
		
		
	},
	block0CleanUp: function(){
		this.trackVolumeStop();
		walls[0].trackWorkStop();
		this.readout.removeAllEntries();
		this.dragWeights.remove();
	},
	block1Start: function(){
		var self = this;
		this.cutSceneStart("<p>So we compressed our container with XX J of work.  Do you think it’s possible to compress our system using less energy?  What if we break our block into smaller pieces? </p><p>How many pieces would you like to break the block into?</p>",
			'quiz',
			{quizOptions:
			[{buttonID:'button2blocks', buttonText:'2', func:function(){self.storeFunc = self.makeDragWeightsFunc({mass:90, count:2}, 'container', self.massInit, {trackPressure:true});nextPrompt()}},
			{buttonID:'button4blocks', buttonText:'4', func:function(){self.storeFunc = self.makeDragWeightsFunc({mass:90, count:4}, 'container', self.massInit, {trackPressure:true});nextPrompt()}},
			{buttonID:'button8blocks', buttonText:'8', func:function(){self.storeFunc = self.makeDragWeightsFunc({mass:90, count:8}, 'container', self.massInit, {trackPressure:true});nextPrompt()}}
			]}
		);
	},
	block1CleanUp: function(){
		this.cutSceneEnd();
	},
	block2Start: function(){
		this.trackVolumeStart();
		this.unCompSetup();
		walls[0].trackWorkStart(this.readout);
	},
	block2CleanUp: function(){
		walls[0].trackWorkStop();
		this.trackVolumeStop();
		this.readout.removeAllEntries();
	},
	unCompSetup: function(){
		walls = WallHandler([[P(40,68), P(510,68), P(510,410), P(40,410)]], 'staticAdiabatic', ['container'], [{yMin:68, yMax:435}]);
		this.borderStd({min:68});
		spcs['spc1'].populate(P(35, 80), V(460, 320), 800, 200);
		spcs['spc3'].populate(P(35, 80), V(460, 320), 600, 200);
		this.stops = new Stops({volume:10}, 'container').init();	
	},
	
	dataRun: function(){
		var wall = walls[0];
		this.data.pInt.push(wall.pInt());
		this.data.pExt.push(wall.pExt());
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volume());
		this.forceInternal = 0;
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		
	},

}
)
function foo(){
	alert('ongomgomg');
}