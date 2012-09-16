function Reversibility(){

	this.setStds();

	this.readout = new Readout('mainReadout', 15, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), this);

	addSpecies(['spc1', 'spc3']);
	this.massInit = 33;

}
_.extend(Reversibility.prototype, 
			LevelTools, 
{
	declarePrompts: function(){
		var self = this;
		this.prompts=[
			{block:0,	
				title:"Current step", 
				text:"Good day.  I have an important task for you.  This system above, it must be compressed to 10 L using as little energy as possible.  You can drag the weight onto the piston to compress to this volume with a pressure of 6 atm.  If you compress with this block, how much work will you do on the system?"
			},
			{block:1, 	
				cutScene:true, 
				text: "<p>So we compressed our container with XX kJ of work.  Do you think it’s possible to compress our system using less energy?  What if we break our block into smaller pieces? </p><p>How many pieces would you like to break the block into?</p>",
				quiz: {	
					type:'buttons',
					options:
						[{buttonId:'button2blocks', text:'2', func:function(){store('numBlocks', 2)}, isCorrect:true},
						{buttonId:'button4blocks', text:'4', func:function(){store('numBlocks', 4)}, isCorrect:true},
						{buttonId:'button8blocks', text:'6', func:function(){store('numBlocks', 6)}, isCorrect:true}					
					]
				},
				replace: 
					[{oldStr:'XX', newStr:'GETworkInLrg'}]
				
			},
			{block:2, 
				title:"Current step", 
				text:"In the first compression, we compressed at 6 atm the whole time.  Are we always at 6 atm in this new compression?  How does this affect the work we have to do to compress?",
				quiz:{	
					type:'buttons', 
					options:
						[{buttonId:'decrease', text:'Decreases work', isCorrect:true},
						{buttonId:'increase', text:'Increases work', isCorrect:false, message:"That's not correct"}
					]
				}
			},
			{block:3, 
				cutScene:true, 
				text: "Good.  Now to compress a system, what condition <i>must</i> be true?",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:"extgreaterint", text:"P<sub>ext</sub>&#62P<sub>int</sub>", isCorrect: true},
						{buttonId:"extequalint", text:"P<sub>ext</sub>=P<sub>int</sub>", message:'NO', isCorrect: false},
						{buttonId:"extlessint", text:"P<sub>ext</sub>&#60P<sub>int</sub>", message:'NOOO', isCorrect: false}
					]
				}
			},
			{block:4, 
				cutScene: true, 
				text: "<p>Yes!</p><p>So when we compressed with the biggest block, P<sub>ext</sub> was much greater than P<sub>int</sub>.  We did more work than we had to because when P<sub>int</sub> was low, we didn’t need to apply such a high external pressure to compress.<p></p>When we compressed with the smaller blocks, P<sub>ext</sub> stepped more smoothly with P<sub>int</sub>.</p><p>Since we weren’t compressing at the maximum pressure the whole time, we did less work and heated the system less.</p><p>What if we ground up our block into a paste and slowly placed it on top?  How do you think the amount of work we have to do will change?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'increase', text:'Increase', message:'Hmm, you should compare the work done in your two previous compressions.', isCorrect: false},
						{buttonId:'decrease', text:'Decrease', isCorrect: true}
					]
				}
			},
			{block:5,
				title:'Current step', 
				text:"Okay, here's our paste.  To compress, P<sub>ext</sub> must only be barely greater than P<sub>int</sub>.  When it is more than a tiny amount higher, we’re doing more work than we have to.  How much work does it take to compress to 10 liters this time?"},
			{block:6, 
				cutScene: true, 
				text:"<p>So in the three compressions, you did XX, YY, and finally ZZ kJ of work.  But even when we compressed with the paste, we added it quickly enough so that P<sub>ext</sub> was significantly greater than P<sub>int</sub>. </p><p>If we added paste slowly enough, one little droplet at a time, would P<sub>ext</sub> even be noticeably different than P<sub>int</sub>?</p> <p> If we kept those pressures almost equal, would we ever be doing any more work than we had to? </p><p> By the way, the answer is the same to both questions.</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', message:'No', isCorrect: false},
						{buttonId:'no', text:'No', isCorrect: true}
					]
				},
				replace:
					[{oldStr:'XX', newStr:'GETworkInLrg'}, 
					{oldStr:'YY', newStr:'GETworkInMed'},
					{oldStr:'ZZ', newStr:'GETworkInSml'}
				]
			},
			{block:7, 
				cutScene: true, 
				text:"<p>Indeed!  We could even say that when increasing the pressure in such small steps</p><center>||EQ1||</center>"},
			{block:8, 
				title:'Current step', 
				text:"Now I have another equally important task for you.  I want this piston expanded in a way that gets as much work out as possible.  When we compressed, we used the blocks to do work on the system.  When expanding, the system can do work on the blocks, lifting them to a higher potential energy.  Let’s start with just one block.  How much work can you get out?"},
			{block:9, 
				cutScene: true, 
				text:"<p>Well that didn't go very well.  From before, we know it takes at least XX kJ to compress to that volume and we only got YY kJ out!  We can do better.</p><p>What if we use the liquid so we incease P<sub>int</sub> in very small steps?  Do you think we'll get more work out that way?</p>",
				quiz:{	
					type:'buttons',
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:true},
						{buttonId:'no', text:'No', isCorrect:false, message:'But the system will be pushing against a higher average pressure!'},
					]
				},
				replace:
					[{oldStr:'XX', newStr:'GETworkInSml'},
					{oldStr:'YY', newStr:'GETworkOutLrg'}
				]
			},
			{block:10, 
				title:'Current step', 
				text:"Ah, good choice.  How much work can you get out this time?"},
			{block:11, 
				cutScene: true, 
				text:"So you got XX kJ out versus YY kJ with the big block.  This is much closer to the ZZ kJ minimum we had to put in.  Why do you think you got more work out this time?",
				quiz:{	
					type:'multChoice', 
					options:
						[{text:'The average difference between P<sub>ext</sub> and P<sub>int</sub> was lower so the system did more work on its surroundings.', isCorrect: true},
						{text:'The smaller blocks are easier to lift so the system can do more work on them.', isCorrect: false},
						{text:'Luck', isCorrect: false},
						{text:'Can anyone else think of one?', isCorrect: false}
					]
				},
				replace:
					[{oldStr:'XX', newStr:'GETworkOutSml'},
					{oldStr:'YY', newStr:'GETworkOutLrg'},
					{oldStr:'ZZ', newStr:'GETworkInSml'}
				]
			},
			{block:12, 
				cutScene: true, 
				text: "<p>Now say we mash our block into a paste again.  The maximum amount of work we can get out at any point is</p><center>||EQ2||</center><p>over a tiny (or differential) change in volume.  As we take smaller and smaller pressure steps by adding just a little bit of paste at a time, we again approach</p><center>||EQ1||</center>"
			},
			{block:13, 
				title:'Current step', 
				text:"Your final and most important task is to compress this container and then bring it back to its original volume.  We can call this going through a cycle.  Can you get all of your work back out using this block?  Find out!",
				quiz:{	
					type:'buttons', 
					options:
						[{buttonId:'yes', text:'Yes', isCorrect:false, message:"That's not correct."},
						{buttonId:'no', text:'No', isCorrect:true}
					]
				}		
			},
			{block:14, 
				title:'Current step', 
				text:"Just like before, let’s use the liquid for tiny pressure steps.  Do you think you’ll be able to recover more or less work with these?  Try going through a cycle to find out!",
				quiz:{
					type:'buttons', 
					options:
						[{buttonId:'less', text:'Recover less', isCorrect:false, message:"That's not correct."},
						{buttonId:'more', text:'Recover more', isCorrect:true}
					]
				}			
			},
			{block:15, 
				cutScene: true, 
				text:"<p>When you compressed with the big block, you put in AA kJ and recovered BB kJ, so you got CC% of the work back out.  With the smaller blocks, you put in XX kJ and recovered YY kJ.</p><p>What percent of the work did you get back for this cycle?</p>",
				quiz:{	
					type:'text', 
					text:"Type the percentage recovered here", 
					answer:-1, 
					messageRight: 'Correct!', 
					messageWrong: "That's not correct"
				},
				replace:
					[{oldStr:'AA', newStr:'GETcycleLrgCompWork'},
					{oldStr:'BB', newStr:'GETcycleLrgUnCompWork'},
					{oldStr:'CC', newStr:function(){return 100*round(getStore('cycleLrgUnCompWork')/getStore('cycleLrgCompWork'),2)}},
					{oldStr:'XX', newStr:'GETcycleSmlCompWork'},
					{oldStr:'YY', newStr:'GETcycleSmlUnCompWork'}
				]
			},
			{block:16, 
				cutScene:'outro', 
				text:"<p>We got a lot more work out this time, yes?</p><p>If we again split our blocks up into so many pieces that</p><center>||EQ1||</center><p>we can say that when compressing, we’re only doing as much work as we have to, and when expanding, we’re getting as much work out as we can.  If we did this, then P<sub>ext</sub> at any volume in our cycle is the same whether we’re compressing or expanding.  This means that we do the same amount of work compressing as we get out expanding.</p><p>If we do that same amount of work in either direction, we can say that in a cycle, the net work done is zero, so our system has a net energy and temperature change of zero!  </p><p>Our final system now looks exactly like our initial system.  Our compression was reversed!  This brings us to the meaning of reversibility:  If a volume change is done reversibly, with</p><center>||EQ1||</img></center><p>the system can be brought back to its original state through another reversible volume change.  The volume change can be...  reversed!</p>"},
		]
		store('prompts', this.prompts);
	
	},


	init: function(){
		var self = this;
		$('#mainHeader').text('Origins of Reversibily');
		nextPrompt();
	},
	block0Start: function(){
		var wallHandle = 'container';
		this.unCompSetup();
		//this.makeGraphsRev();
		this.sandBox = new Sandbox();
		walls[0].displayQArrows();
		//this.dragWeights = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:33}]})
		//this.dragWeights.wall.displayPExt().displayWork().recordMass().displayMass().displayVol();
		this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'equalTo', targetVal:7, alertUnsatisfied:'NO', alertSatisfied:'YES', atSatisfyFunc:{func:function(){store('workInLrg',round(walls[0].work,1))},obj:''}});
		this.readout.show();
	},	
	/*
	block0Conditions: function(){
		if(this.volListener10.isSatisfied()){
			return {result:true};
		}else{
			return {result:false, alert:'Compress thy system!'};
		}
	},
	block0CleanUp: function(){
		this.dragWeights.remove();
	},
	*/
	//block1CleanUp: function(){
	//	this.removeAllGraphs();
	//},
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
	makeGraphsRev: function(){
		this.graphs.pVSv = new GraphScatter('pVSv', 400,293, "Volume (L)", "Pressure (bar)",
							{x:{min:0, step:3}, y:{min:0, step:2}});
		//this.graphs.tVSv = new GraphScatter('tVSv', 400, 293,"Volume (L)", "Temperature (K)",
		//					{x:{min:0, step:4}, y:{min:180, step:60}});
		this.graphs.pVSv.addSet('pInt', 'P Int.', Col(0,0,255), Col(200,200,255),
								{x:walls[0].data.v, y:walls[0].data.pInt});
		this.graphs.pVSv.addSet('pExt', 'P Ext.', Col(0,255,0), Col(200,255,200),
								{x:walls[0].data.v, y:walls[0].data.pExt});
		//this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
		//						{data:this.data, x:'v', y:'t'});		
	},
	unCompSetup: function(){
		walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'cVIsothermal', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[14], temps:[236]});
		this.borderStd({min:68});
		//spcs['spc1'].populate(P(35, 150), V(460, 250), 2, 215.38);
		spcs['spc1'].populate(P(35, 110), V(460, 250), 814, 236);
		spcs['spc3'].populate(P(35, 110), V(460, 250), 611, 236);
	},
	compSetup: function(){
		walls = WallHandler([[P(40,68), P(510,68), P(510,410), P(40,410)]], 'cVIsothermal', ['container'], [{yMin:68, yMax:435}], undefined, [10.1]);
		this.borderStd({min:68});
		var maxY = walls[0][0].y;
		var height = walls[0][3].y-walls[0][0].y;
		spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 814, 273);
		spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 611, 273);
		this.stops = new Stops({stopPt:{volume:10}});		
	},


}
)
