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
	this.wallImpactListeners = {};
	this.dotImpactListeners = {};
	this.buttons = {};
	this.sliders = {};
	this.savedVals = {};
	this.curQ = 0;
	this.qa=[
		{q:'Alligators: Snout or prickles?  Explain using incomplete sentences.'},
		{q:'How many spots does a proper Irishman have?'},
	]
	this.g = 100*updateInterval/1000;
	var heaterX = 200;
	var heaterY = 400;
	var heaterWidth = 50;
	var heaterHeight = 30;
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	this.weightMin=15;
	this.weightMax=60;
	this.weightSetPt=(this.weightMin+this.weightMax)/2;
	this.weightSpd=6;
	var weightInit = 17;
	var diff = this.weightSetPt-weightInit;
	this.weightDir = Math.abs(diff)/diff;
	this.weight = new Weight(250,75,.5,this.weightMin,this.weightMax, weightInit);
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
		emptyListener(this, "update");
		emptyListener(this, "data");
		addListener(this, 'update', 'updateChangeWeight', this.updateRunChangeWeight, this);
		addListener(this, "data", "run", this.dataRun, this);
		addListener(this, 'wallImpact', 'moving', this.onWallImpact, this);
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
		this.moveWalls();
		this.addGravity();	
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	updateRunChangeWeight: function(){
		move();
		this.moveWalls();
		this.adjustWeight();
		this.addGravity();	
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
		if(this.weight.weight==this.weightSetPt){
			this.revertToFixedWeight()
		}
	},
	revertToFixedWeight: function(){
		emptyListener(this, 'update');
		addListener(this, 'update', 'run', this.updateRun, this);
	},
	adjustWeight: function(){
		var curWeight = this.weight.weight + this.weightSpd*this.weightDir;
		curWeight = this.weightDir*Math.min(this.weightDir*curWeight, this.weightDir*this.weightSetPt);		
		this.weight.changeWeight(curWeight);
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
	checkWallHits: function(){
		walls.check();
	},
	onWallImpact: function(dot, line, wallUV, perpV){
		/*
		To dampen wall speed , doing:
		1 = dot
		2 = wall
		m1vo1^2 + m2vo2^2 = m1v1^2 + m2v2^2
		m1vo1 + m2vo2 = m1v1 + A*m2v2
		where A = (abs(wallV)+1)^(.15)
		leads to
		a = m1 + m1^2/(A^2m2)
		b = -2*vo1*m1^2/(A^2m2) - 2*vo2*m1/A^2
		c = m1^2*vo1^2/(A^2*m2) + 2*m1*vo2*vo1/A^2 + m2*(vo2/A)^2 - m1*vo1^2 - m2*vo2^2
		I recommend grouping squared terms in each block for faster computation
		v1 = (-b + (b^2 - 4*a*c)^.5)/2a
		v2 = (m1*vo1 + m2*vo2 - m1*v1)/(m2*A)
		*/
		if(line[0]==0 && line[1]==0){
			var vo1 = dot.v.dy;
			var vo2 = this.wallV;
			var m1 = dot.m;
			var m2 = this.weight.weight;
			var vo1Sqr = vo1*vo1;
			var vo2Sqr = vo2*vo2;
			
			var scalar = Math.pow(Math.abs(vo2)+1, .15);
			var scalarSqr = scalar*scalar
			
			var a = m1*(1 + m1/(scalarSqr*m2));
			var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
			var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
			
			dot.v.dy = (-b + Math.pow(b*b - 4*a*c,.5))/(2*a);
			dot.y = dot.y+dot.r;
			this.wallV = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
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
	changeWeightSetPt: function(event, ui){
		this.weightSetPt = ui.value;
		emptyListener(this, 'update');
		addListener(this, 'update', 'updateChangeWeight', this.updateRunChangeWeight, this);
		var diff = this.weightSetPt - this.weight.weight;
		this.weightDir = Math.abs(diff)/diff;
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
