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
	this.extPressurePts = [walls[0][0], walls[0][1]];
	this.SAPExt = getLen(this.extPressurePts);
	this.readout = new Readout('mainReadout', 15, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), this);
	var self = this;
	this.prompts=[
		{block:0, title: "", finished: false, text:""},
		{block:1, title: "Current step", 		 finished:false, text:"Okay, let’s get oriented!  Here we have a container filled with a gas that follows the <a href = http://en.wikipedia.org/wiki/Hard_spheres target='_blank'>hard sphere model</a>, which is like the ideal gas model but the molecules take up some space.  There are some weights in bins below the container.  You can drag the weights on top of or off of the container to compress or expand it."},
		{block:1, title: "Current step", 		 finished:false, text:"Imagine that the energy to lift a block comes from a battery.  When lifting a block, the battery is drained.  When dropping a block, the battery is replenished.  The energy changes correspond to the potential energies gained or lost by the block.  This energy is shown in the E Added dialog.  In a reversible cycle, you could compress and expand as long as you like and the battery will always have the same amount of charge at given volume.  In an irreversible cycle, your battery will gradually drain and the system will gradually gain energy.  Take a minute now to figure out how everything works. "},
		{block:2,  title: "Current step", 		conditions: this.block2aConditions, finished:false, text:"Say you want to compress this container but you only have a couple of big blocks.  Try it.  You’ll notice you have to put a lot of energy into lifting those.  Now for the compression to be reversible, you need to be able to get all of that energy back out of the system for a net work of zero.  Do you think that’s possible?  Test your idea!  What does this say about the reversibility of the process?"},
		{block:2,  title: "Current step",		finished:false, text:"Hopefully you found that with the large blocks, you couldn’t get all of the energy back out, making this an <i>irreversible</i> compression and expansion cycle.  From the graphs, I think there are two ways we can verify of this.  What might they be?"},
		{block:3,  title: "Current step", 		conditions: this.block3aConditions, finished:false, text:"Each bin has the same total weight in it.  Try to compress the container with one bin’s worth of weight, but using less energy than you did to compress with the largest blocks.  Last time you used eAddedBig KJ"},
		{block:3, title: "Current step",		finished:false, text:"If you found a way, why did it take less energy this time?  If you didn’t, try harder.  This is a key question to understanding reversibility, so give it some thought.  Thinking about potential energy may be helpful."},
		{block:3,  title: "Current step",		conditions: this.block3cConditions, finished:false, text:"If you take all of the weight back off, how does the total energy added in this cycle compare to the energy added in the cycle using the big blocks?  Why is it different?"},
		{block:4,  title: "Current step",		conditions: this.block4aConditions, finished:false, text:"Now that you’ve found a way to add less energy than you had to with the big blocks, try to compress with one bin’s worth of weight using the <i>least</i> energy that you can.  You may have done this in the previous experiment.  If you did, well done, but do verify that you did by trying something else."},
		{block:4, title: "Current step", 		conditions: this.block4bConditions, finished:false, text:"If you take all of the weight back off, how does the total energy added in <i>this</i> cycle compare to the energy added in the cycle using the big blocks.  Also, consider the pressure vs. volume graph.  Looks less ‘steppy’, doesn’t it?  How might we relate this to the condition for reversibility, P<sub>int</sub> = P<sub>ext</sub>?"},
		{block:5, title: "", finished: false, text:""},
	]
	
	this.dragWeights = this.makeDragWeights([{name:'sml', count:12, mass:5}, 
									{name:'med', count:6, mass:10}, 
									{name:'lrg', count:2, mass:30}]);
	
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	;
	//walls.setSubWallHandler(0, 0, {func:this.onWallImpactTop, obj:this});
	this.workTracker = new WorkTracker('tracky',
										function(){return walls[0][0].y},
										walls[0][1].x-walls[0][0].x,
										function(){return self.dragWeights.mass()},
										{readout:this.readout, idx:1},
										this);

	addSpecies(['spc1', 'spc3']);
}
_.extend(Reversibility.prototype, 
			LevelTools, 
{
	init: function(){
		this.workTracker.start();
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}
		var self = this;
		this.graphs.pVSv = new GraphScatter('pVSv', 400,300, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 300,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:200, step:60}});
		this.graphs.pVSv.addSet('pInt', 'P Int.', Col(0,0,255), Col(200,200,255),
								{data:this.data, x:'v', y:'pInt'});
		this.graphs.pVSv.addSet('pExt', 'P Ext.', Col(0,255,0), Col(200,255,200),
								{data:this.data, x:'v', y:'pExt'});
		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
		
		this.borderStd({min:60});
		nextPrompt();
	},
	block0Start: function(){
		this.cutSceneStart("Let’s look at reversibility.  When someone says a process is reversible, they mean that all of the work done to compress (or expand) the system can be recovered by bringing the container back to its original volume.  This means that the system experiences no net energy or temperature change after going through the compression/expansion cycle.</p>"+
			"<p>The definition of a reversible process says that P<sub>internal</sub>, the pressure exerted by the gas on the walls of the container, always equals P<sub>external</sub>, the pressure from an outside force.  Starting from the definition of work, we get</p>"+
			"<center><img src = img/reversibility1.gif></img></center><br>"+
			"In this simulation, we're going to try to figure out a physical model of how reversibility works.", 
			'intro');
		$('#graphs').hide()
		
	},
	block0CleanUp: function(){
		$('#graphs').show()
		this.cutSceneEnd();
	},
	block1Start: function(){
		spcs['spc1'].populate(P(35, 80), V(460, 350), 800, 230);
		spcs['spc3'].populate(P(35, 80), V(460, 350), 600, 230);

		this.numUpdates = 0;
		walls.restoreWall(0);
		this.extPressurePts = [walls[0][0], walls[0][1]];
		this.forceInternal = 0;
		for (resetListenerName in this.resetListeners.listeners){
			var func = this.resetListeners.listeners[resetListenerName].func;
			var obj = this.resetListeners.listeners[resetListenerName].obj;
			func.apply(obj);
		}	
		this.readout.show();
	},	
	block2Start: function(){
		this.block1Start();
		this.addedBigBlocks = new Boolean();
		this.addedBigBlocks = false;
		addListener(curLevel, 'update', 'pistonLrgFull', 
			function(){
				this.addedBigBlocks = this.dragWeights.binIsFull('piston', 'lrg');
				if(this.addedBigBlocks){
					var eAddedBig = this.dragWeights.eAdded;
					for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++){
						var prompt = this.prompts[promptIdx];
						if(prompt.text.indexOf('eAddedBig')>=0){
							prompt.text = replaceString(prompt.text, 'eAddedBig', round(eAddedBig, 1));
						}
					}
					removeListener(curLevel, 'update', 'pistonLrgFull');
				}
			},
		this);
	},	
	block2CleanUp: function(){
		removeListener(curLevel, 'update', 'pistonLrgFull')
		this.addedBigBlocks = undefined;
	},
	block3Start: function(){this.block1Start();},
	block4Start: function(){this.block1Start();},
	block2aConditions: function(){
		var weights = this.dragWeights;
		if(this.addedBigBlocks && weights.allEmpty('piston')){
			return {result: true};
		}else{
			if(!this.addedBigBlocks){
				return {result:false, alert:'Put the big blocks on!'};
			}else{
				return {result:false, alert:'Take the big blocks back off!'};
			}
			
		}
	},

	block3aConditions: function(){
		if(this.dragWeights.mass()==this.dragWeights.massInit + 60){
			return {result:true};
		}else{
			return {result:false, alert:'You need to have 85kg total weight to compare it to the previous test'};
		}
	},
	block3cConditions: function(){
		if(this.dragWeights.mass()==this.dragWeights.massInit){
			return {result:true};
		} else{
			return {result:false, alert:'Take the weight back off!'}
		}
	},
	block4aConditions: function(){
		return this.block3aConditions();
	},
	block4bConditions: function(){
		return this.block3cConditions();
	},
	block5Start: function(){
		this.cutSceneStart("Now we must journey into the land of abstraction.  You may have picked up on a trend that the smaller your block size, the more reversibile your cycle becomes.  If a smaller block size makes a cycle more reversible, what block size would make a process completely reversible, such that we can get all of the energy back out?</p>"+
			"<p>Infinitely small blocks, you say?  Yes, that’s correct!  Let’s go through why.  When you lifted the big block on to the uncompressed piston, you did more work than you had to.  In fact, all you had to do to compress the piston was to lift a tiny weight, like a grain of sand, or more precisely, a <a href = http://en.wikipedia.org/wiki/Differential_(infinitesimal) target='_blank'>differential element </a>.</p>"+
			"<p>With each new element we put on top, the system compresses by a differential amount, which corresponds to a height, and thus potential energy change of zero.  That means that we can take that element back off the piston and get all the energy we put in back out.  If we’re using weights of any non-zero size, this isn’t true, since the piston will have compressed some non-zero amount, making the height at which we can take it off lower than the height at which we put it on.  That energy we can’t get back out stays in the system resulting in a temperature increase.</p>"+
			"<p>By added differential weight elements to the piston, we are making infinitesimally small changes to P<sub>ext</sub>, so might we say that in this compression,  P<sub>ext</sub> = P<sub>int</sub>?  Why we’ve stumbled upon the condition for reversibility!</p>"+
			"<p>So, can any real process be reversible?  Hint: No, you can only approach reversibility.  Even if you compress with gas very slowly, you’re still adding one gas molecule at a time, and that creates a very small, but still non-zero pressure change.</p>",
			'outro'
		);
	},
	block5CleanUp: function(){
		this.cutSceneEnd();
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
