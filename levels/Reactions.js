function Reactions(){
	dataHandler = new DataHandler();
	this.setStds();
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	this.prompts=[
		{block:0, title: '', finished: false, text:''},
		{block:1, title: 'Current step', finished: false, text:"Alright, let's figure out what enthalpy of reaction looks like.  Enthalpy of reaction is the change in chemical energy of the system due to the reaction.  If it’s negative, we've fallen to a lower elevation on our energy plane.  This translates to losing chemical energy.  Since energy is conserved, we must have gained kinetic energy.  If it's positive, the opposite is true.  We've gone to a higher elevation, gaining chemical energy and losing kinetic energy.  If it's zero, there is no chemical or kinetic energy change.  Do you think the enthalpy of this reaction is positive or negative?  Why?  "},

	]
	
	addSpecies(['spc1', 'spc3']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Reactions.prototype, 
			LevelTools, 
{
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();

	},


	block0Start: function(){
		this.cutSceneStart('lalala', 'intro');

	},

	block0CleanUp: function(){
		this.cutSceneEnd();

	},
	block1Start: function(){
		//walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		walls = WallHandler([[P(40,30), P(100,30), P(100,100), P(40,100)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(45,35), V(60, 50), 2, 300);
		spcs['spc3'].populate(P(45,35), V(50, 50), 2, 300);		
		collide.addReaction('spc3', 'spc1', 900, 0/*-cV*300*/, [{spc:'spc4', count:1}], false);
		collide.addReaction('spc4', undefined, 900, 0, [{spc:'spc1', count:1}, {spc:'spc3', count:1}], false);
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		this.borderStd();
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
	},
	block1CleanUp: function(){
		walls['container'].removeBorder();
		collide.removeAllReactions();
	},


	dataRun: function(){
		var wall = walls[0];
		this.data.p.push(wall.pInt())
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volume());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		this.numUpdates=0;
		this.forceInternal=0;
	},
}
)