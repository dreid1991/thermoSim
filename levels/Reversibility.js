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
		{block:2, title:"Current step", finished:false, text:"In our previous compression, we compressed at 6 atm the whole time.  Are we always at 6 atm in this new compression?  How does this affect the work we have to do to compress?"},
		{block:3, title:'', finished: false, text:""},
		{block:4, title:'', finished: false, text:""},
		{block:5, title:'Current step', finished: false, text:"Alright, here are the blocks.  To compress, P<sub>ext</sub> must only be barely greater than P<sub>int</sub>.  When it is more than a tiny amount higher, we’re doing more work than we have to.  How much work does it take to compress to 10 liters this time?"},
		{block:6, title:'', finished: false, text:''},
		{block:7, title:'', finished: false, text:''},
		{block:8, title:'Current step', finished: false, text:"Now I have another equally important task for you.  I want this piston expanded in a way that gets as much work out as possible.  When we compressed, we used the blocks to do work on the system.  When expanding, the system can do work on the blocks, lifting them to a higher potential energy.  Let’s start with just one block.  How much work can you get out?"},
		{block:9, title:'', finished: false, text:""},
		{block:10, title:'Current step', finished: false, text:"Ah, good choice.  How much work can you get out this time?"},
		//{block:N, title:'Current step', finished: false, text:""},
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
		
		
		
		nextPrompt();
	},
	block0Start: function(){
		this.makeGraphsRev();
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
		var addOnce2 = function(){self.numBlocks=2;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:2}, 'container', self.massInit, {trackPressure:true}), self)};
		var addOnce4 = function(){self.numBlocks=4;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:4}, 'container', self.massInit, {trackPressure:true}), self)};
		var addOnce8 = function(){self.numBlocks=8;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:8}, 'container', self.massInit, {trackPressure:true}), self)};
		this.cutSceneStart("<p>So we compressed our container with XX J of work.  Do you think it’s possible to compress our system using less energy?  What if we break our block into smaller pieces? </p><p>How many pieces would you like to break the block into?</p>",
			'quiz',
			{quizOptions:
			[{buttonID:'button2blocks', buttonText:'2', func:function(){addOnce2()}, isCorrect:true},
			{buttonID:'button4blocks', buttonText:'4', func:function(){addOnce4()}, isCorrect:true},
			{buttonID:'button8blocks', buttonText:'8', func:function(){addOnce8()}, isCorrect:true}
			]}
		);
	},
	block1CleanUp: function(){
		this.removeAllGraphs();
		this.cutSceneEnd();
	},
	block2Start: function(){
		this.makeGraphsRev();
		this.trackVolumeStart();
		this.unCompSetup();
		walls[0].trackWorkStart(this.readout);
	},
	block2CleanUp: function(){
		this.removeAllGraphs();
		this.dragWeights.remove();
		this.dragWeights = undefined;
		walls[0].trackWorkStop();
		this.trackVolumeStop();
		this.readout.removeAllEntries();
	},
	block3Start: function(){
		this.cutSceneStart("Now to compress a system, what condition <i>must</i> be true?",
			'quiz',
			{quizOptions:
			[{buttonID:"extgreaterint", buttonText:"P<sub>ext</sub>&#62P<sub>int</sub>", message:'Correct!', isCorrect: true},
			{buttonID:"extequalint", buttonText:"P<sub>ext</sub>=P<sub>int</sub>", message:'NO', isCorrect: false},
			{buttonID:"extlessint", buttonText:"P<sub>ext</sub>&#60P<sub>int</sub>", message:'NOOO', isCorrect: false}
			]}
		);
		
	},
	block3CleanUp: function(){
		this.cutSceneEnd();
	},
	block4Start: function(){
		this.cutSceneStart("<p>So when we compressed with the biggest block, P<sub>ext</sub> was much greater than P<sub>int</sub>.  We did more work than we had to because when P<sub>int</sub> was low, we didn’t need to apply such a high external pressure to compress.<p></p>When we compressed with the smaller blocks, P<sub>ext</sub> stepped more smoothly with P<sub>int</sub>.</p><p>Since we weren’t compressing at the maximum pressure the whole time, we did less work.</p><p>What if we split all of our blocks in half and compress with those?  How do you think the amount of work we have to do will change?</p>",
			'quiz',
			{quizOptions:
			[{buttonID:'increase', buttonText:'Increase', message:'Hmm, you should compare the work done in your two previous compressions.', isCorrect: false},
			{buttonID:'decrease', buttonText:'Decrease', message:'Correct!', isCorrect: true}
			]}
		);
	},
	block4CleanUp: function(){
		this.cutSceneEnd();
	},
	block5Start: function(){
		this.makeGraphsRev();
		this.unCompSetup();
		walls[0].trackWorkStart(this.readout);		
		this.dragWeights = this.makeDragWeights({mass:90, count:2*this.numBlocks}, 'container', this.massInit).init().trackPressureStart();
	},
	block5CleanUp: function(){
		this.removeAllGraphs();
		this.dragWeights.remove();
		this.dragWeights = undefined;
		walls[0].trackWorkStop();
		
	},
	block6Start: function(){
		this.cutSceneStart('<p>So in the three compressions, you did XX, YY, and finally ZZ kJ of work.  What if we kept breaking our blocks into smaller pieces?</p><p>If they were small enough, every time we put a new block on, would P<sub>ext</sub> even be noticeably different than P<sub>int</sub>?</p> <p> If we kept those pressures almost equal, would we ever be doing any more work than we had to? </p><p> By the way, the answer is the same to both questions.</p>',
			'quiz',
			{quizOptions:
			[{buttonID:'yes', buttonText:'Yes', message:'No', isCorrect: false},
			{buttonID:'no', buttonText:'No', message:'Yes (correct)!', isCorrect: true}
			]}
		);
	},
	block6CleanUp: function(){
		this.cutSceneEnd();
	},
	block7Start: function(){
		this.cutSceneStart('<p>Indeed!  We could even say that when using such tiny blocks</p><center><img src=img/rev/eq1.gif></img></center>');
	},
	block7CleanUp: function(){
		this.cutSceneEnd();
		this.removeAllGraphs();
	},
	block8Start: function(){
		this.makeGraphsRev();
		this.compSetup();
		walls[0].trackWorkStart(this.readout);
		this.dragWeights = this.makeDragWeights({mass:90, count:1}, 'container', this.massInit).init().dropAllIntoPistons('instant').trackPressureStart();
	},
	block8CleanUp: function(){
		walls[0].trackWorkStop();
		this.dragWeights.remove();
	},
	block9Start: function(){
		var self = this;
		var addOnce8 = function(){self.numBlocks=8;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:8}, 'container', self.massInit, {trackPressure:true}), self)};
		var addOnceDropInstant = function(){addListenerOnce(curLevel, 'update', 'dropToPiston', function(){self['dragWeights'].dropAllIntoPistons('instant')}, self)};
		this.cutSceneStart("<p>Well that didn’t go very well.  From before, we know it takes at least XX kJ to compress to that volume and we only got YY kJ out!  We can do better.</p><p>What if we break up our block like we did before?</p><p>How many pieces would you like?</p>",
			'quiz',
			{quizOptions:
			[{buttonID:'button2blocks', buttonText:'2', isCorrect:false, message:'I think you want more blocks than that.'},
			{buttonID:'button4blocks', buttonText:'4', isCorrect:false, message:'I think you want more blocks than that.'},
			{buttonID:'button8blocks', buttonText:'8', func:function(){addOnce8(); addOnceDropInstant()}, isCorrect:true}
			]}
		);
	},
	block9CleanUp: function(){
		this.removeAllGraphs();
		this.cutSceneEnd();
	},
	block10Start: function(){
		this.compSetup();
		walls[0].trackWorkStart();
	},
	block10CleanUp: function(){
		this.dragWeights.remove();
	},
	blockNStart: function(){
	
	},
	blockNCleanUp: function(){
	
	},
	makeGraphsRev: function(){
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
	},
	unCompSetup: function(){
		walls = WallHandler([[P(40,68), P(510,68), P(510,410), P(40,410)]], 'staticAdiabatic', ['container'], [{yMin:68, yMax:435}]);
		this.borderStd({min:68});
		spcs['spc1'].populate(P(35, 80), V(460, 320), 800, 200);
		spcs['spc3'].populate(P(35, 80), V(460, 320), 600, 200);
		this.stops = new Stops({volume:10}, 'container').init();	
	},
	compSetup: function(){
		walls = WallHandler([[P(40,68), P(510,68), P(510,410), P(40,410)]], 'staticAdiabatic', ['container'], [{yMin:68, yMax:435}], undefined, [10.1]);
		this.borderStd({min:68});
		var maxY = walls[0][0].y;
		var height = walls[0][3].y-walls[0][0].y;
		spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 800, 320);
		spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 600, 320);
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
