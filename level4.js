function level4(){
	
	this.dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.p = [];
	this.data.v = [];
	this.data.e = [];
	walls = new WallHandler([[P(10,75), P(540,75), P(540,440), P(10,440)]])
	this.wallV = 0;
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.buttons = {};
	this.sliders = {};
	this.savedVals = {};
	this.curQ = 0;
	this.qa=[
		{q:'How many spots does a proper Irishman have?'},
		{q:'Alligators: Snout or prickles?'}
	]
	this.g = 100*updateInterval/1000;
	var heaterX = 200;
	var heaterY = 400;
	var heaterWidth = 50;
	var heaterHeight = 30;
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	this.weightMin=15;
	this.weightMax=60;
	this.weightInit=(this.weightMin+this.weightMax)/2;
	this.weight = new Weight(250,75,.5,this.weightMin,this.weightMax, this.weightInit);
	//this.readout = new Readout(250, 60, 140, "white", "#bdbdbd", "#454545");
	//this.readout.addEntry('Temp',['data','t']).addEntry('Pressure',['data','p']);
	//walls = new WallHandler([[P(100,100), P(300,100),P(300,300),P(100,300)]])
	//walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup();
	this.minY = 25;
	this.maxY = walls.pts[0][2].y-75;
	addSpecies(["spc1", "spc2", "spc3"]);
	collide.setup();
}


level4.prototype = {
	init: function(){
		this.addDots();
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();	
	},
	startIntro: function(){
		saveVals(this);
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#myCanvas').hide();
		$('#textIntro').show();
		$('#dashIntro').show();
		emptyListener(this, "update");
		emptyListener(this, "data");
	},
	startSim: function(){
		this.hideDash();
		this.hideText();
		$('#dashRun').show();
		$('#myCanvas').show();
		$('#base').show();
		showCurQ();
		addListener(this, "update", "run", this.updateRun);
		addListener(this, "data", "run", this.dataRun);
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
		$('#myCanvas').hide();
		$('#textOutro').show();	
		$('#dashOutro').show();
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.drawDashOut();
		this.textBox = new MainTextBox(this.outroText);
	},
	update: function(){
		for (var updateListener in this.updateListeners){
			this.updateListeners[updateListener].apply(curLevel);
		}
	},
	addData: function(){
		for (var dataListener in this.dataListeners){
			this.dataListeners[dataListener].apply(curLevel);
		}
	},
	updateRun: function(){
		move();
		this.moveWalls();
		this.addGravity();	
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();

	},
	addGravity: function(){
		this.wallV += this.g;
	},
	drawRun: function(){
		draw.clear();
		draw.dots();
		draw.walls(walls);
		//draw.fillPts(walls.pts[1], this.heater.col);
		draw.fillPts(this.weight.pts, this.weight.col);
	},
	checkDotHits: function(){
		collide.check();
	},
	onDotImpact: function(a, b){
		collide.impactStd(a, b);
	},
	checkWallHits: function(){
		walls.check();
	},
	onWallImpact: function(dot, line, wallUV, perpV){
		if(line[0]==0 && line[1]==0){
			var pt = walls.pts[line[0]][line[1]];
			var dotVo = dot.v.dy;
			var wallVo = this.wallV;
			dot.v.dy = (dotVo*(dot.m-this.weight.weight)+2*this.weight.weight*wallVo)/(dot.m+this.weight.weight);
			this.wallV = (wallVo*(this.weight.weight-dot.m)+2*dot.m*dotVo)/(this.weight.weight+dot.m);
			dot.y = pt.y+dot.r;
		}else{
			walls.impactStd(dot, wallUV, perpV)		
		}
		this.fTurn += dot.m*perpV;
	},
	addDots: function(){
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 20, 80, 500, 300, 700, 300);
		populate("spc3", 20, 80, 500, 300, 700, 300);		
		populate("spc2", 20, 80, 500, 300, 20, 300);
	},
	dataRun: function(){
		this.data.p.push(this.dataHandler.pressure(this.fTurn));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volPolyWall());
		this.fTurn = 0;
		this.pVSv.plotData(this.data.v, this.data.p);
		this.tVSv.plotData(this.data.v, this.data.t);
	},
	drawHeader: function(){
		this.header = makeHeader("THE PATH TO THE BEYOND");
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	moveWalls: function(){
		var wall = walls.pts[0];
		var lastY = wall[0].y
		var unboundedY = lastY + this.wallV + .5*this.g;
		var dyWeight = null;
		if(unboundedY>this.maxY || unboundedY<this.minY){
			var boundedY = Math.max(this.minY, Math.min(this.maxY, unboundedY));
			var tHit = null;
			if (boundedY==this.maxY){
				var tHit = (-this.wallV + Math.sqrt(this.wallV*this.wallV + 2*this.g*(boundedY-lastY)))/this.g;
			}else if (boundedY==this.minY){
				var tHit = (-this.wallV - Math.sqrt(this.wallV*this.wallV + 2*this.g*(boundedY-lastY)))/this.g;
			}
			var vRebound = -(this.wallV + this.g*tHit);
			var tLeft = 1 - tHit;
			var nextY = boundedY + vRebound*tLeft + .5*this.g*tLeft*tLeft;
			this.wallV += 2*this.g*tHit;
			this.wallV = -this.wallV;
			wall[0].y = nextY;
			wall[1].y = nextY;
			wall[wall.length-1].y = nextY;
			dyWeight = nextY - lastY;
		}else{
			wall[0].y = unboundedY;
			wall[1].y = unboundedY;
			wall[wall.length-1].y = unboundedY;
			dyWeight = unboundedY - lastY;
		}
		this.weight.move(V(0,dyWeight));
		walls.setupWall(0);
	},
	changeTemp: function(sliderVal){
		this.heater.changeTemp(sliderVal);
	},
	changeWeight: function(event, ui){
		this.weight.changeWeight(ui.value);
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
