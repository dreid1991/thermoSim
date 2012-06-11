function level2(){
	this.dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.p = [];
	this.data.v = [];
	this.data.e = [];
	this.yInit=75;
	walls = new WallHandler([[P(10,this.yInit), P(540,this.yInit), P(540,440), P(10,440)]])
	this.wallSpd = 1;
	this.wallDir = 0;
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.wallImpactListeners = {};	
	this.dotImpactListeners = {};
	this.buttons = {};
	this.sliders = {};
	this.savedVals = {};
	this.curQ = 0;
	this.qa=[
		{q:'Or is it just a ruse?  Answer in nearly complete sentances.'},
		{q:'Is this really level 2?'},
	]
	walls.setup();
	this.yMin = 25;
	this.wallSetPt;
	
	this.yMax = walls.pts[0][2].y-100;
	addSpecies(["spc1", "spc2", "spc3"]);
	collide.setup();
}


level2.prototype = {
	init: function(){
		this.addDots();
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();	
		$('#myCanvas').show();
	},
	startIntro: function(){
		saveVals(this);
		this.hideDash();
		this.hideText();
		this.hideBase();

		$('#canvasDiv').hide()
		$('#display').show();
		$('#textIntro').show();
		$('#dashIntro').show();
		emptyListener(this, "update");
		emptyListener(this, "data");
	},
	startSim: function(){
		this.hideDash();
		this.hideText();
		$('#display').hide();
		$('#canvasDiv').show()
		$('#dashRun').show();
		$('#base').show()
		showCurQ();
		emptyListener(this, "update");
		emptyListener(this, "data");
		addListener(this, "update", "run", this.updateRun, this);
		addListener(this, "data", "run", this.dataRun, this);
		addListener(this, 'wallImpact', 'stationary', this.onWallImpact, this);
		addListener(this, 'dotImpact', 'std', collide.impactStd, collide);
		this.pVSv = new Graph(575,8,300,300, "Volume", "Pressure", "#5a8a92", "#eee252");
		this.tVSv = new Graph(575,8+30+this.pVSv.height, 300, 300,"Volume", "Temperature", "#ca1a14", "#eee252");
		this.fTurn=0;
		this.movedWallsLast = new Boolean();
		this.movedWallsLast = false;	
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
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.drawDashOut();
		this.textBox = new MainTextBox(this.outroText);
	},
	update: function(){
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
	},
	updateRun: function(){
		move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	updateRunMove: function(){
		move();
		this.moveWalls();
		this.checkDotHits();
		this.checkWallHits();
		this.drawRun();
		if(this.wallSetPt==walls.pts[0][0].y){
			this.revertToStationary();
		}
	},

	drawRun: function(){
		draw.clear();
		draw.dots();
		draw.walls(walls);
	},
	checkDotHits: function(){
		collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},

	onWallImpact: function(dot, line, wallUV, perpV){
		walls.impactStd(dot, wallUV, perpV)		
		this.fTurn += dot.m*perpV;
	},
	onWallImpactMove: function(dot, line, wallUV, perpV){
		if(line[0]==0 && line[1]==0){
			dot.v.dy = -dot.v.dy + 2*this.wallSpd*this.wallDir;
			perpV = dot.v.dy;
			dot.y -= wallUV.dy
		}else{
			walls.impactStd(dot, wallUV, perpV);
		}
		this.fTurn += dot.m*perpV;
	},
	moveWalls: function(){
		var curPt = walls.pts[0][0].y;
		curPt+=this.wallSpd*this.wallDir;
		curPt = this.wallDir*Math.min(this.wallDir*curPt, this.wallDir*this.wallSetPt);
		walls.pts[0][0].y=curPt;
		walls.pts[0][1].y=curPt;
		walls.pts[0][4].y=curPt;
		walls.setupWall(0);
	},
	revertToStationary: function(){
		emptyListener(this, 'update');
		emptyListener(this, 'wallImpact');
		addListener(this, 'update', 'run', this.updateRun, this);	
		addListener(this, 'wallImpact', 'stationary', this.onWallImpact, this);//Hey - you're going from wall functions to func in curLevel to another func in curLevel back to walls.  Err
	},												//You can just send it straight to wall handler by making the wall impact std function be your listener.  BE CAREFUL OF PRESSURE.
	addDots: function(){
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		//populate('spc1', 20,80,500,300,1,300);
		populate("spc1", 20, 80, 500, 300, 700, 300);
		populate("spc3", 20, 80, 500, 300, 700, 300);		
		populate("spc2", 20, 80, 500, 300, 20, 300);
	},
	dataRun: function(){
		this.data.p.push(this.dataHandler.pressure(this.fTurn));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		this.fTurn = 0;
		this.pVSv.plotData(this.data.v, this.data.p);
		this.tVSv.plotData(this.data.v, this.data.t);
	},
	changeWallSetPt: function(event, ui){
		this.wallSetPt = ui.value;
		var diff = this.wallSetPt-walls.pts[0][0].y
		this.wallDir = Math.abs(diff)/(diff)
		emptyListener(this, 'update');
		emptyListener(this, 'wallImpact');
		addListener(this, 'update', 'runMoveWalls', this.updateRunMove, this);
		addListener(this, 'wallImpact', 'moveWalls', this.onWallImpactMove, this);
		
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
