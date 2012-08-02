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
		{block:0, title: '', finished: false, text:'quack quack quack'},

	]
	walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
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
		this.playedWithSlider = false;
		var self = this;
		var sliderMin = $('#sliderPressure').slider('option', 'min');
		$('#sliderPressure').slider('option', {value:sliderMin});
		//walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		//walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		//spcs['spc1'].populate(P(45,35), V(460, 350), 800, 300);
		//spcs['spc3'].populate(P(45,35), V(450, 350), 600, 300);		
		walls = WallHandler([[P(40,30), P(70,30), P(70,70), P(40,70)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(45,35), V(1, 1), 1, 300);
		spcs['spc3'].populate(P(45,35), V(1, 1), 1, 300);
		collide.addReaction('spc3', 'spc1', 1, 100, [{spc:'spc4', count:1}]);
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		this.borderStd();
	},

	block0CleanUp: function(){
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