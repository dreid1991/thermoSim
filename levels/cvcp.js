function cvcp(){
	this.setStds();
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-155, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(cvcp.prototype, 
			LevelTools, 
{
	declarePrompts: function(){
		this.prompts=[
			{block:0,
				title:'lalala',
				text:'Eat me.'
			},


		]
		store('prompts', this.prompts);
	},
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},
	block0Start: function(){
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(45,35), V(460, 350), 0, 300);
		spcs['spc3'].populate(P(45,35), V(450, 350), 5, 300);
		this.heater = new Heater('heaty', P(200,350), V(190,40), 0, 10, c);
		
	},
	
	block3Start: function(){
		this.playedWithSlider = false;
		var self = this;
		var sliderMin = $('#sliderPressure').slider('option', 'min');
		$('#sliderPressure').slider('option', {value:sliderMin});
		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		spcs['spc1'].populate(P(45,35), V(460, 350), 800, 300);
		spcs['spc3'].populate(P(45,35), V(450, 350), 600, 300);
		
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
		
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.pVSv.addSet('p', 'P Int.', Col(50,50,255), Col(200,200,255),
								{data:this.data, x:'v', y:'p'});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
		
		this.piston = new Piston('tootoo', 'container', 2, this).show().trackWork().trackPressure();
		this.borderStd();
		this.volListener8 = new StateListener(10, this.data.v, .1, {})
		//this.heater = new Heater('spaceHeater', P(150,360), V(250,50), 0, 20, c);//P(40,425), V(470,10)
		//this.heater.init();

	},
	block3Conditions: function(){
		if(this.volListener8.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress more!'};
	},
	
	block3CleanUp: function(){
		this.playedWithSlider = undefined;
		this.volListener8 = undefined;
		this.wallV=0;
		$('#sliderPressureHolder').hide();
		this.removeAllGraphs();
		this.readout.removeAllEntries();
		this.readout.hide();
		this.piston.remove();
		this.piston = undefined;
		walls.setWallHandler(0, 'staticAdiabatic')
		walls['container'].removeBorder();
	},
	
	block4Start: function(){

		walls = WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], 'staticAdiabatic', ['container']);
		walls.setHitMode('container', 'Arrow');
		this.borderStd();
		this.compArrow = new CompArrow({wallInfo:'container'}, {mode:'adiabatic', speed:1.5});
		spcs['spc4'].populate(P(45,235), V(460, 100), 1, 600);
		this.tempChanged = false;
		var initTemp = dataHandler.temp();
		addListener(curLevel, 'data', 'checkTempChanged',
			function(){
				var curTemp = dataHandler.temp();
				if(curTemp!=initTemp){
					this.tempChanged = true;
					removeListener(curLevel, 'data', 'checkTempChanged');
				}
			},
		this);
	},
	block4Conditions: function(){
		if(this.tempChanged){
			return {result:true};
		}
		return {result:false, alert:"Try hitting the molecule with the wall while the wall's moving"};	
	},
	block4CleanUp: function(){
		this.tempChanged = undefined;
		walls['container'].v = 0;
		walls['container'].removeBorder();
		this.compArrow.remove();
		this.compArrow = undefined;
		walls.setHitMode('container', 'Std');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
	},
	block8Start: function(){
		$('#reset').show()
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,31), P(510,31), P(510,350), P(40,350)]], 'staticAdiabatic', [wallHandle], [{yMin:30, yMax:300}], undefined, [15]);
		this.stops = new Stops({volume:10}, 'container');
		this.borderStd();
		spcs['spc1'].populate(P(45,35), V(445, 325), 850, 200);
		spcs['spc3'].populate(P(45,35), V(445, 325), 650, 200);
		this.dragWeights = this.makeDragWeights([{name:'lrg', count:1, mass:75}], wallHandle).trackMassStop().trackPressureStart();
		this.trackTempStart();
		this.trackVolumeStart(0);
		this.volListener15 = new StateListener(15, this.data.v, .05, {p:this.data.p, t:this.data.t});
		this.volListener10 = new StateListener(10, this.data.v, .03, {p:this.data.p, t:this.data.t}, {func:function(){store('tFinal', round(this.data.t[this.data.t.length-1],0))}, obj:this});
	},
	block8Conditions: function(){
		if(this.volListener10.isSatisfied() && this.volListener15.isSatisfied()){
			return {result:true};
		}
		if(!this.volListener10.isSatisfied()){
			return {result:false, alert:'Compress the container!'};
		}
	},
	block8CleanUp: function(){
		this.wallV=0;
		$('#reset').hide();
		this.trackTempStop();
		this.trackVolumeStop();
		walls['container'].removeBorder();
		this.readout.hide();
		this.stops.remove();
		this.stop = undefined;
		this.dragWeights.remove();
		this.dragWeights = undefined;
	},
	block12Start: function(){
		$('#reset').show();
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], 'staticAdiabatic', ['left', 'right']);
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 400, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 400, 'right', 'right');	
		this.data.tLeft = [];
		this.data.tRight = [];
		this.data.vLeft = [];
		this.data.vRight = [];		
		this.dragWeightsLeft = this.makeDragWeights([{name:'lrg', count:1, mass:75}], 'left', 5).trackMassStop().trackPressureStart();
		this.dragWeightsRight = this.makeDragWeights([{name:'lrg', count:1, mass:75}], 'right', 5).trackMassStop().trackPressureStart();
		this.stopsLeft = new Stops({volume:3.5}, 'left');
		this.stopsRight = new Stops({volume:3.5}, 'right');		
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run',
			function(){
				this.data.tLeft.push(this.dataHandler.temp({tag:'left'}));
				this.data.tRight.push(this.dataHandler.temp({tag:'right'}));
				this.data.vLeft.push(this.dataHandler.volume('left'));
				this.data.vRight.push(this.dataHandler.volume('right'));
			},
		this);
		addListener(curLevel, 'data', 'updateGraphs',
			this.updateGraphs,
		this);
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{data:this.data, x:'vRight', y:'tRight'});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'vLeft', y:'tLeft'});	
		
		this.volListenerLeft = new StateListener(3.5, this.data.vLeft, .02, {});
		this.volListenerRight = new StateListener(3.5, this.data.vRight, .02, {});
	},
	block12Conditions: function(){
		if(this.volListenerLeft.isSatisfied() && this.volListenerRight.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress the containers!'};
	},
	block12CleanUp: function(){
		$('#reset').hide();
		removeListener(curLevel, 'data', 'updateGraphs');
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run', this.dataRun, this);
		this.removeAllGraphs();
		this.stopsLeft.remove();
		this.stopsRight.remove();
		this.dragWeightsLeft.remove();
		this.dragWeightsRight.remove();
		this.readout.hide();
	},
	block15Start: function(){
		$('#reset').show();
		this.readout.show();
		wallHandle = 'container';
		walls = WallHandler([[P(40,30), P(255,30), P(255,350), P(40,350)], [P(295,30), P(510,30), P(510,350), P(295,350)]], 'staticAdiabatic', ['left', 'right']);
		this.borderStd({wallInfo:'left'});
		this.borderStd({wallInfo:'right'});
		spcs['spc1'].populate(P(45,35), V(200, 300), 250, 200, 'left', 'left');
		spcs['spc3'].populate(P(45,35), V(200, 300), 150, 200, 'left', 'left');	
		
		spcs['spc1'].populate(P(300,35), V(200, 300), 250, 200, 'right', 'right');
		spcs['spc3'].populate(P(300,35), V(200, 300), 150, 200, 'right', 'right');	
		this.data.tLeft = [];
		this.data.tRight = [];
		this.data.vLeft = [];
		this.data.vRight = [];		
		this.dragWeightsLeft = this.makeDragWeights([{name:'lrg', count:1, mass:35}], 'left', 5).trackMassStop().trackPressureStart();
		this.dragWeightsRight = this.makeDragWeights([{name:'lrg', count:1, mass:75}], 'right', 5).trackMassStop().trackPressureStart();
		this.stopsLeft = new Stops({volume:3.5}, 'left');
		this.stopsRight = new Stops({volume:3.5}, 'right');		
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run',
			function(){
				this.data.tLeft.push(this.dataHandler.temp({tag:'left'}));
				this.data.tRight.push(this.dataHandler.temp({tag:'right'}));
				this.data.vLeft.push(this.dataHandler.volume('left'));
				this.data.vRight.push(this.dataHandler.volume('right'));
			},
		this);
		addListener(curLevel, 'data', 'updateGraphs',
			this.updateGraphs,
		this);
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:2}, y:{min:150, step:50}});
		this.graphs.tVSv.addSet('tRight', 'Temp\nRight', Col(255,200,0), Col(255,200,200),
								{data:this.data, x:'vRight', y:'tRight'});									
		this.graphs.tVSv.addSet('tLeft', 'Temp\nLeft', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'vLeft', y:'tLeft'});	
		
		this.volListenerLeft = new StateListener(3.5, this.data.vLeft, .02, {});
		this.volListenerRight = new StateListener(3.5, this.data.vRight, .02, {});
	},
	block15Conditions: function(){
		if(this.volListenerLeft.isSatisfied() && this.volListenerRight.isSatisfied()){
			return {result:true};
		}
		return {result:false, alert:'Compress the containers!'};
	},
	block15CleanUp: function(){
		$('#reset').hide();
		removeListener(curLevel, 'data', 'updateGraphs');
		removeListener(curLevel, 'data', 'run');
		addListener(curLevel, 'data', 'run', this.dataRun, this);
		this.removeAllGraphs();
		this.stopsLeft.remove();
		this.stopsRight.remove();
		this.dragWeightsLeft.remove();
		this.dragWeightsRight.remove();
		this.readout.hide();
	},
	dataRun: function(){
		var wall = walls[0];
		this.data.p.push(wall.pInt())
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volume());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},

}
)