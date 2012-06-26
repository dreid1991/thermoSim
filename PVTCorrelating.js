function levelCorrelating(){
	
	this.dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.pExt = [];
	this.data.v = [];
	this.data.e = [];
	this.eUnits = 'u';
	this.bgCol = Col(5, 17, 26);
	this.wallCol = Col(255,255,255);
	this.numUpdates = 0;
	walls = new WallHandler([[P(40,75), P(510,75), P(510,440), P(40,440)]])
	this.forceInternal = 0;
	this.wallV = 0;
	this.updateListeners = {};
	this.dataListeners = {};
	this.wallImpactListeners = {};
	this.dotImpactListeners = {};
	this.mousedownListeners = {};
	this.mouseupListeners = {};
	this.mousemoveListeners = {};
	this.graphs = {}
	this.curQ = 0;
	this.qa=[
		{q:"I'm a question"},
		{q:"I'm another question"},
	]
	
	walls.setup();
	this.initY = walls.pts[0][0].y;
	this.minY = 60;
	this.maxY = walls.pts[0][2].y-75;
	addSpecies(['spc1', 'spc3']);
	collide.setup();

}

levelCorrelating.prototype = {

	init: function(){
		this.addDots();
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();
		var self = this;
		this.graphs.pVSv = new Graph('pVSv', 400,300, "Volume", "Pressure",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new Graph('tVSv', 400, 300,"Volume", "Temperature",
							{x:{min:0, step:4}, y:{min:100, step:60}});
		this.graphs.pVSv.addSet('pInt', 'P Int.', Col(0,0,255), Col(200,200,255),
								function(){
									var pLast = self.data.pInt[self.data.pInt.length-1];
									var vLast = self.data.v[self.data.v.length-1];
									var address = 'pInt';
									return {x:vLast, y:pLast, address:address};
								});
		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								function(){
									var vLast = self.data.v[self.data.v.length-1];
									var tLast = self.data.t[self.data.t.length-1];
									var address = 't';
									return {x:vLast, y:tLast, address: address};
								});		
		$('#myCanvas').show();
	},
	startIntro: function(){
		saveVals(this);
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#graphs').hide()
		$('#display').show();
		$('#textIntro').show();
		$('#dashIntro').show();
		emptyListener(this, "update");
		emptyListener(this, "data");
		
	},
	startSim: function(){
		this.hideDash();
		this.hideText();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();
		showCurQ();
		emptyListener(this, 'data');
		addListener(this, 'update', 'run', this.updateRun, this);
		addListener(this, 'data', 'run', this.dataRun, this);
		addListener(this, 'wallImpact', 'moving', this.onWallImpact, this);
		addListener(this, 'dotImpact', 'std', collide.impactStd, collide);

	},
	startOutro: function(){
		saveVals(this);
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#display').show();
		$('#textOutro').show();	
		$('#dashOutro').show();
		removeListener(this, 'update', 'run');
		emptyListener(this, "data");
	},
	update: function(){
		this.numUpdates++;
		for (var updateListener in this.updateListeners){
			var listener = this.updateListeners[updateListener]
			listener.func.apply(listener.obj);
		}
	},
	addData: function(){
		for (var dataListener in this.dataListeners){
			var listener = this.dataListeners[dataListener];
			listener.func.apply(listener.obj);
		}
		this.numUpdates = 0;
	},
	updateRun: function(){
		move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},

	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
	},
	checkDotHits: function(){
		//collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},
	onWallImpact: function(dot, line, wallUV, perpV){
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		
	},
	wallSetPtChange: function(event, ui){
		var wallSetPt = ui.value;
		var moveSpeed = 1;
		var curVal = function(){return walls.pts[0][0].y};
		var set = function(y){	walls.pts[0][0].y = y;
								walls.pts[0][1].y = y;
								walls.pts[0][4].y = y;
								walls.setupWall(0);
							}
		removeListener(curLevel, 'update', 'moveWall');
		var sign=1;
		var diff = wallSetPt - curVal();
		if(diff!=0){
			sign = Math.abs(diff)/diff;
		}
		var stepChange = moveSpeed*sign;
		addListener(curLevel, 'update', 'moveWall', function(){
			set(boundedStep(curVal(), wallSetPt, stepChange));
			if(curVal()==wallSetPt){
				removeListener(curLevel, 'update', 'moveWall');
			}
		},
		'');
	},	
	addDots: function(){
		
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 35, 80, 460, 350, 800, 250);
		populate("spc3", 35, 80, 460, 350, 600, 250);		
		//populate("spc2", 35, 80, 460, 300, 20, 250);
	},
	dataRun: function(){
		var SAPInt = walls.surfArea();
		this.data.pInt.push(this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		this.forceInternal = 0;
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	clearGraphs: function(){
		for (var graph in this.graphs){
			this.graphs[graph].clear();
		}
	},
	reset: function(){
		for (var spcName in spcs){
			depopulate(spcName);
		}
		this.addDots();
		this.numUpdates = 0;
		walls = undefined;
		walls = new WallHandler([[P(40,75), P(510,75), P(510,440), P(40,440)]])
		walls.setup();
		
		this.extPressurePts = [walls.pts[0][0], walls.pts[0][1]];
		this.SAPExt = getLen(this.extPressurePts);
		this.forceInternal = 0;
		this.wallV = 0;
		this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
		this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
		this.wallImpactListeners = {};
		this.dotImpactListeners = {};
		this.clearGraphs();
		this.startSim();
		this.dragWeights.dropAllInBins();
		this.dragWeights.resetReadouts();
	},
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
	},
	hideText: function(){
		$('#textIntro').hide();
		$('#textOutro').hide();
	},
	hideBase: function(){
		$('#base').hide();
	},

}
