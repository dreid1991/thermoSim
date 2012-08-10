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
		{block:0, title:"Current step", conditions: this.block0Conditions, text:"Good day.  I have an important task for you.  This system above, it must be compressed to 10 L using as little energy as possible.  You can drag the weight onto the piston to compress to this volume with a pressure of 6 atm.  If you compress with this block, how much work will you do on the system?"},
		{block:1},
		{block:2, title:"Current step", conditions: this.block2Conditions, text:"In our previous compression, we compressed at 6 atm the whole time.  Are we always at 6 atm in this new compression?  How does this affect the work we have to do to compress?",
			quiz:{type:'buttons', 
				options:[{buttonId:'decrease', buttonText:'Decreases work', isCorrect:true, message:"Correct!"},
						{buttonId:'increase', buttonText:'Increases work', isCorrect:false, message:"That's not correct"}
						]
				}
		},
		{block:3},
		{block:4},
		{block:5, title:'Current step', conditions: this.block5Conditions, text:"Alright, here are the blocks.  To compress, P<sub>ext</sub> must only be barely greater than P<sub>int</sub>.  When it is more than a tiny amount higher, we’re doing more work than we have to.  How much work does it take to compress to 10 liters this time?"},
		{block:6},
		{block:7},
		{block:8, title:'Current step', text:"Now I have another equally important task for you.  I want this piston expanded in a way that gets as much work out as possible.  When we compressed, we used the blocks to do work on the system.  When expanding, the system can do work on the blocks, lifting them to a higher potential energy.  Let’s start with just one block.  How much work can you get out?"},
		{block:9},
		{block:10, title:'Current step', text:"Ah, good choice.  How much work can you get out this time?"},
		{block:11},
		{block:12},
		{block:13, title:'Current step', text:"Your final and most important task is to compress this container and then bring it back to its original volume.  We can call this going through a cycle.  Can you get all of your work back out using this block?  Find out!"
			quiz:{type:'buttons', 
				options:[{buttonId:'yes', buttonText:'Yes', isCorrect:false, message:"That's not correct."},
						{buttonId:'yes', buttonText:'No', isCorrect:true, message:"Correct!"}
						]
				}		
		},
		{block:14, title:'Current step', text:"Just like before, let’s split up our block.  Do you think you’ll be able to recover more or less work with these?  Try going through a cycle to find out!"
			quiz:{type:'buttons', 
				options:[{buttonId:'less', buttonText:'Recover less', isCorrect:false, message:"That's not correct."},
						{buttonId:'more', buttonText:'Recover more', isCorrect:true, message:"Correct!"}
						]
				}			
		},
		{block:15},
		{block:16},
		//{block:N, title:'Current step', finished: false, text:""},
	]
	
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
		this.trackVolumeStart(0);
		this.dragWeights = this.makeDragWeights([{name:'lrg', count:1, mass:90}], wallHandle, this.massInit).init().trackPressureStart();
		this.volListener10 = new StateListener(10, this.data.v, .05, {v:this.data.v}, {func:function(){this.workInLrg = round(walls[0].work,1)},obj:this});
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
		var addOnce6 = function(){self.numBlocks=6;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:6}, 'container', self.massInit, {trackPressure:true}), self)};
		this.cutSceneStart(replaceString("<p>So we compressed our container with XX kJ of work.  Do you think it’s possible to compress our system using less energy?  What if we break our block into smaller pieces? </p><p>How many pieces would you like to break the block into?</p>", 'XX', this.workInLrg),
			'quiz',
			{type:'buttons',
			options:
			[{buttonId:'button2blocks', buttonText:'2', func:function(){addOnce2()}, isCorrect:true},
			{buttonId:'button4blocks', buttonText:'4', func:function(){addOnce4()}, isCorrect:true},
			{buttonId:'button8blocks', buttonText:'6', func:function(){addOnce6()}, isCorrect:true}
			]}
		);
	},

	block1CleanUp: function(){
		this.removeAllGraphs();
		this.cutSceneEnd();
	},

	block2Start: function(){
		this.makeGraphsRev();
		this.unCompSetup();
		walls[0].trackWorkStart(this.readout);
		this.trackVolumeStart(0);
		this.volListener10 = new StateListener(10, this.data.v, .02, {v:this.data.v}, {func:function(){this.workInMed = round(walls[0].work,1)},obj:this});
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
		walls[0].trackWorkStop();
		this.trackVolumeStop();
		this.readout.removeAllEntries();
	},
	
	block3Start: function(){
		this.cutSceneStart("Now to compress a system, what condition <i>must</i> be true?",
			'quiz',
			{type:'buttons',
			options:
			[{buttonId:"extgreaterint", buttonText:"P<sub>ext</sub>&#62P<sub>int</sub>", message:'Correct!', isCorrect: true},
			{buttonId:"extequalint", buttonText:"P<sub>ext</sub>=P<sub>int</sub>", message:'NO', isCorrect: false},
			{buttonId:"extlessint", buttonText:"P<sub>ext</sub>&#60P<sub>int</sub>", message:'NOOO', isCorrect: false}
			]}
		);
		
	},
	block3CleanUp: function(){
		this.cutSceneEnd();
	},
	block4Start: function(){
		this.cutSceneStart("<p>So when we compressed with the biggest block, P<sub>ext</sub> was much greater than P<sub>int</sub>.  We did more work than we had to because when P<sub>int</sub> was low, we didn’t need to apply such a high external pressure to compress.<p></p>When we compressed with the smaller blocks, P<sub>ext</sub> stepped more smoothly with P<sub>int</sub>.</p><p>Since we weren’t compressing at the maximum pressure the whole time, we did less work.</p><p>What if we split all of our blocks up again and compress with those?  How do you think the amount of work we have to do will change?</p>",
			'quiz',
			{type:'buttons',
			options:
			[{buttonId:'increase', buttonText:'Increase', message:'Hmm, you should compare the work done in your two previous compressions.', isCorrect: false},
			{buttonId:'decrease', buttonText:'Decrease', message:'Correct!', isCorrect: true}
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
		this.trackVolumeStart(0);		
		this.dragWeights = this.makeDragWeights({mass:90, count:16}, 'container', this.massInit).init().trackPressureStart();
		this.volListener10 = new StateListener(10, this.data.v, .02, {v:this.data.v}, {func:function(){this.workInSml = round(walls[0].work,1)},obj:this});
	},
	block5Conditions: function(){
		if(this.volListener10.isSatisfied()){
			return {result:true};
		}else{
			return {result:false, alert:'Compress thy system!'};
		}
	},
	block5CleanUp: function(){
		this.trackVolumeStop();
		this.removeAllGraphs();
		this.dragWeights.remove();
		this.dragWeights = undefined;
		walls[0].trackWorkStop();
		
	},
	block6Start: function(){
		var text = '<p>So in the three compressions, you did XX, YY, and finally ZZ kJ of work.  What if we kept breaking our blocks into smaller pieces?</p><p>If they were small enough, every time we put a new block on, would P<sub>ext</sub> even be noticeably different than P<sub>int</sub>?</p> <p> If we kept those pressures almost equal, would we ever be doing any more work than we had to? </p><p> By the way, the answer is the same to both questions.</p>'
		text = replaceString(replaceString(replaceString(text, 'XX', this.workInLrg), 'YY', this.workInMed), 'ZZ', this.workInSml);
		this.cutSceneStart(text,
			'quiz',
			{type:'buttons',
			options:
			[{buttonId:'yes', buttonText:'Yes', message:'No', isCorrect: false},
			{buttonId:'no', buttonText:'No', message:'Yes (correct)!', isCorrect: true}
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
		this.trackVolumeStart(0);
		this.volListener16 = new StateListener(16, this.data.v, .05, {v:this.data.v}, {func:function(){this.workOutLrg = Math.abs(round(walls[0].work,1))},obj:this});
		walls[0].trackWorkStart(this.readout);
		this.dragWeights = this.makeDragWeights({mass:90, count:1}, 'container', this.massInit).init().dropAllIntoPistons('instant').trackPressureStart();
	},
	block8CleanUp: function(){
		walls[0].trackWorkStop();
		this.trackVolumeStop();
		this.dragWeights.remove();
	},
	block9Start: function(){
		var self = this;
		var addOnce12 = function(){self.numBlocks=12;addListenerOnce(curLevel, 'update', 'addWeights', self.makeDragWeightsFunc({mass:90, count:12}, 'container', self.massInit, {trackPressure:true}), self)};
		var addOnceDropInstant = function(){addListenerOnce(curLevel, 'update', 'dropToPiston', function(){self['dragWeights'].dropAllIntoPistons('instant')}, self)};
		var text = "<p>Well that didn’t go very well.  From before, we know it takes at least XX kJ to compress to that volume and we only got YY kJ out!  We can do better.</p><p>What if we break up our block like we did before?</p><p>How many pieces would you like?</p>";
		text = replaceString(replaceString(text, 'XX', this.workInSml),'YY', this.workOutLrg);
		this.cutSceneStart(text,
			'quiz',
			{type:'buttons',
			options:
			[{buttonId:'button2blocks', buttonText:'4', isCorrect:false, message:'I think you want more blocks than that.'},
			{buttonId:'button4blocks', buttonText:'8', isCorrect:false, message:'I think you want more blocks than that.'},
			{buttonId:'button8blocks', buttonText:'12', func:function(){addOnce12(); addOnceDropInstant()}, isCorrect:true}
			]}
		);
	},
	block9CleanUp: function(){
		this.removeAllGraphs();
		this.cutSceneEnd();
	},
	block10Start: function(){
		this.compSetup();
		this.makeGraphsRev();
		this.volListener16 = new StateListener(16, this.data.v, .05, {v:this.data.v}, {func:function(){this.workOutSml = Math.abs(round(walls[0].work,1))},obj:this});
		walls[0].trackWorkStart(this.readout);
		this.trackVolumeStart(0);
	},
	block10CleanUp: function(){
		this.trackVolumeStop();
		walls[0].trackWorkStop();
		this.removeAllGraphs();
		this.dragWeights.remove();
	},
	block11Start: function(){
		var text = 'So you got XX kJ out versus YY kJ with the big block.  This is much closer to the ZZ kJ minimum we had to put in.  Why do you think you got more work out this time?';
		text = replaceString(replaceString(replaceString(text, 'XX', this.workOutSml), 'YY', this.workOutLrg), 'ZZ', this.workInSml);
		this.cutSceneStart(text,
			'quiz', 
			{type:'multChoice', 
			options:
			[{optionText:'The average difference between P<sub>ext</sub> and P<sub>int</sub> was lower so the system did more work on its surroundings.', isCorrect: true},
			{optionText:'The smaller blocks are easier to lift so the system can do more work on them.', isCorrect: false},
			{optionText:'Luck', isCorrect: false},
			{optionText:'Can anyone else think of one?', isCorrect: false}
			]}
		);
	},
	block11CleanUp: function(){
		this.cutSceneEnd();
	},
	block12Start: function(){
		this.cutSceneStart('<p>Now say we split our blocks into tiny pieces again.  The maximum amount of work we can get out at any point is</p><center><img src=img/rev/eq2.gif></img></center><p>over a tiny (or differential) change in volume.  As we use smaller and smaller blocks, we again approach</p><center><img src=img/rev/eq1.gif></img></center>');
	},
	block12CleanUp: function(){
		this.cutSceneEnd();
	},	
	block13Start: function(){
		this.unCompSetup();
		this.makeGraphsRev();
		walls[0].trackWorkStart(this.readout);
		this.volListener10 = new StateListener(10, this.data.v, .02, {v:this.data.v}, {func:
			function(){
				this.cycleLrgCompWork = walls[0].work;
				this.volListener16 = new StateListener(16, this.data.v, .02, {v:this.data.v}, {func:
				function(){
					this.cycleLrgUnCompWork = this.cycleLrgCompWork - walls[0].work;
				},obj:this}
				);
			},
			obj:this}
		);
		this.dragWeights = this.makeDragWeights({mass:90, count:1}, 'container', this.massInit).init().trackPressureStart();		
		this.trackVolumeStart(0);
	},
	block13CleanUp: function(){
		this.removeAllGraphs();
		this.dragWeights.remove();
		walls[0].trackWorkStop();
		this.trackVolumeStop();
	},
	block14Start: function(){
		this.unCompSetup();
		this.makeGraphsRev();
		walls[0].trackWorkStart(this.readout);
		this.volListener10 = new StateListener(10, this.data.v, .02, {v:this.data.v}, {func:
			function(){
				this.cycleSmlCompWork = walls[0].work;
				this.volListener16 = new StateListener(16, this.data.v, .02, {v:this.data.v}, {func:
				function(){
					this.cycleSmlUnCompWork = this.cycleSmlCompWork - walls[0].work;
				},obj:this}
				);
			},
			obj:this}
		);
		this.trackVolumeStart(0);
		this.dragWeights = this.makeDragWeights({mass:90, count:12}, 'container', this.massInit).init().trackPressureStart();		
	},
	block14CleanUp: function(){
		this.removeAllGraphs();
		this.trackVolumeStop();
		walls[0].trackWorkStop();
		this.dragWeights.remove();
	},
	block15Start: function(){
		this.block15Quiz = {type:'text', text:"Type the percentage recovered here", answer:NUMBER.MAX_VALUE, messageRight: 'Correct!', messageWrong: "That's not correct"}
		var text = '<p>When you compressed with the big block, you put in AA kJ and recovered BB kJ, so you got CC% of the work back out.  With the smaller blocks, you put in XX kJ and recovered YY kJ.</p><p>What percent of the work did you get back for this cycle?</p>';
		text = replaceString(text, 'AA', this.cycleLrgCompWork);
		text = replaceString(text, 'BB', this.cycleLrgUnCompWork);
		text = replaceString(text, 'CC', 100*round(this.cycleLrgUnCompWork/this.cycleLrgCompWork,2));
		text = replaceString(text, 'XX', this.cycleSmlCompWork);
		text = replaceString(text, 'YY', this.cycleSmlUnCompWork);
		this.block15Quiz.answer = 100*this.cycleSmlUnCompWork/this.cycleSmlCompWork;
		this.cutSceneStart(text,
			'quiz',
			this.block15Quiz
		);
	},
	block15CleanUp: function(){
		this.cutSceneEnd();
	},
	block16Start: function(){
		this.cutSceneStart('<p>The temperatures were much closer this time, yes?</p><p>If we again split our blocks up into so many pieces that</p><center><img src=’img/rev/eq1.gif></img></center><p>we can say that when compressing, we’re only doing as much work as we have to, and when expanding, we’re getting as much work out as we can.  If we did this, then P<sub>ext</sub> at any volume in our cycle is the same whether we’re compressing or expanding.  This means that we do the same amount of work compressing as we get out expanding.</p><p>If we do that same amount of work in either direction, we can say that in a cycle, the net work done is zero, so our system has a net energy and temperature change of zero!  </p><p>Our final system now looks exactly like our initial system.  Our compression was reversed!  This brings us to the meaning of reversibility:  If a volume change is done reversibly, with</p><center><img src=img/rev/eq1.gif></img></center><p>the system can be brought back to its original state through another reversible volume change.  The volume change can be...  reversed!</p>',
		'outro');
	},
	block16CleanUp: function(){
		this.cutSceneEnd();
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
