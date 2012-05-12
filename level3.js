function level3(){
	this.dataHandler = new DataHandler();
	this.data = new Database();
	this.data.addSet("t");
	this.data.addSet("p");
	this.data.addSet("v");
	walls = new WallHandler([[P(10,75), P(540,75), P(540,440), P(10,440)]])
	this.wallV = 0;
	this.wallVLast = 0;
	this.introText = "LEVEL THREE HAS A CRAZY NEW INTRO I'M TRYING OUT";
	this.outroText = "YOUR TRAINING IS NOW COMPLETE.  \nYOU CAN LEARN NOTHING MORE FROM ME.";
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.buttons = {};
	this.sliders = {};
	this.savedVals = {};
	this.weightScalar = .002;
	var heaterX = 200;
	var heaterY = 400;
	var heaterWidth = 50;
	var heaterHeight = 30;
	this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	this.weight = new Weight(250,75,.5,10,300);
	//walls = new WallHandler([[P(100,100), P(300,100),P(300,300),P(100,300)]])
	//walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup();
	this.minY = 75;
	this.maxY = walls.pts[0][2].y-75;
	collide.setup();
}
level3.prototype = {
	init: function(){
		this.addDots();
		this.drawHeader();
		this.startIntro();	
	},
	startIntro: function(){
		saveVals(this);
		cleanDash(this);
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.drawDashStart();
		this.textBox = new MainTextBox(this.introText);
	},
	startSim: function(){
		this.textBox.remove();
		cleanDash(this);
		this.drawDashRun();		
		addListener(this, "update", "run", this.updateRun);
		addListener(this, "data", "run", this.dataRun);
		this.pVSv = new Graph(575,8+header.height,300,300, "Volume", "Pressure", "#5a8a92");
		this.tVSv = new Graph(575,8+header.height+30+this.pVSv.height, 300, 300,"Volume", "Temperature", "#ca1a14");
		this.fTurn=0;
		this.movedWallsLast = new Boolean();
		this.movedWallsLast = false;	
	},
	startOutro: function(){
		saveVals(this);
		cleanDash(this);
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
		this.addWeightForce();	
		this.checkDotHits();
		this.checkWallHits();
		this.moveWalls();
		this.drawRun();
	},
	addWeightForce: function(){
		this.wallV += this.weight.weight*this.weightScalar;
	},
	drawRun: function(){
		draw.clear();
		draw.dots();
		draw.walls(walls);
		draw.fillPts(walls.pts[1], this.heater.col);
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
			if(walls.pts[0][0].y!=this.minY && walls.pts[0][0].y!=this.maxY){
				perpV += this.wallVLast;
			}
			this.wallV-=(dot.m/this.weight.weight)*(perpV+this.wallV);
		}
		this.fTurn += dot.m*perpV;
		walls.impactStd(dot, wallUV, perpV)
		if(line[0]==1){
			var foo = hitHeater(dot, perpV, this.heater.t)
		}

	},
	addDots: function(){
		addSpecies(["spc1", "spc2", "spc3"]);
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 20, 100, 500, 300, 500, 300);
		populate("spc3", 20, 100, 500, 300, 500, 300);		
		populate("spc2", 20, 100, 500, 300, 20, 300);
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
		return walls.area(0) - walls.area(1);
	},
	drawDashStart: function(){
		var buttonWidth = 150;
		var name = "toSim"
		this.buttons[name] = (new Button(myCanvas.width/2 - buttonWidth/2, 40, buttonWidth, 50,"To the simulation!","#ceae6a", "#b3975c"));
		this.buttons[name].addReleaseListener(this.startSim, this);
	},
	drawDashOut: function(){
		var buttonWidth = 150;
		var name = "toSim"
		this.buttons[name] = new Button(myCanvas.width/2 - buttonWidth/2, 40, buttonWidth, 50,"To the simulation!","#ceae6a", "#b3975c");
		this.buttons[name].addReleaseListener(this.startSim, this);
	},
	drawDashRun: function(){
		var toIntroName = "toIntro";
		this.buttons[toIntroName] = new Button(425,15,90,30,"To intro","#ceae6a", "#b3975c");
		this.buttons[toIntroName].addReleaseListener(this.startIntro, this);
		var toOutroName = "toOutro";
		this.buttons[toOutroName] = new Button(425,55,90,30,"To outro","#ceae6a", "#b3975c");
		this.buttons[toOutroName].addReleaseListener(this.startOutro, this);
		var tempSliderName = "temp";
		this.sliders[tempSliderName] = new Slider(this, tempSliderName, 150,20,"Temperature");
		this.sliders[tempSliderName].addDragListener(this.changeTemp,this);
		var weightSliderName = "weight";
		this.sliders[weightSliderName] = new Slider(this, weightSliderName, 240,20,"Weight");
		this.sliders[weightSliderName].addDragListener(this.changeWeight, this);
	},
	moveWalls: function(){
		this.wallVLast = this.wallV;
		var wall = walls.pts[0];
		var lastY = wall[0].y
		var newY = Math.max(this.minY, Math.min(this.maxY, lastY+this.wallV));
		this.wallV = newY-lastY
		this.weight.move(V(0,this.wallV));
		wall[0].y+=this.wallV;
		wall[1].y+=this.wallV;
		wall[wall.length-1].y+=this.wallV;
		walls.setupWall(0);
	},
	changeTemp: function(sliderVal){
		this.heater.changeTemp(sliderVal);
	},
	changeWeight: function(sliderVal){
		this.weight.changeWeight(sliderVal);
	},

}
