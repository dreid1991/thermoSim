function level3(){
	this.dataHandler = new DataHandler();
	this.data = new Database();
	this.data.addSet("t");
	this.data.addSet("p");
	this.data.addSet("v");
	walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	this.wallHeatTrans = 0;
	this.introText = "LEVEL THREE HAS A CRAZY NEW INTRO I'M TRYING OUT";
	this.outroText = "YOUR TRAINING IS NOW COMPLETE.  \nYOU CAN LEARN NOTHING MORE FROM ME.";
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.buttons = {};
	this.sliders = {};
	var heaterX = 200;
	var heaterY = 280;
	var heaterWidth = 50;
	var heaterHeight = 30;
	this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight)
//	this.weight = new Weight(
	//walls = new WallHandler([[P(100,100), P(300,100),P(300,300),P(100,300)]])

	//walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup();
	this.minY = 10;
	this.maxY = walls.pts[0][2].y-75
	collide.setup();
}
level3.prototype = {
	init: function(){

		this.addDots();
		this.drawHeader();
		this.startIntro();	
	},
	startIntro: function(){
		cleanDash(this);
		emptyListener(this, "update");
		emptyListener(this, "data");
		//addListener(this, "update", "pause", this.updatePause);
		this.drawDashStart();
		this.textBox = new MainTextBox(this.introText);
	},
	startSim: function(){
		this.textBox.remove();
		cleanDash(this);
		this.drawDashRun();		
		addListener(this, "update", "run", this.updateRun);
		addListener(this, "data", "run", this.dataRun);
		//this.curUpdate = this.updates.run;
		//this.curData = this.dataUpdates.run;
		this.pVSv = new Graph(575,8+header.height,300,300, "Volume", "Pressure", "#5a8a92");
		this.tVSv = new Graph(575,8+header.height+30+this.pVSv.height, 300, 300,"Volume", "Temperature", "#ca1a14");
		this.fTurn=0;
		this.movedWallsLast = new Boolean();
		this.movedWallsLast = false;	
	},
	startOutro: function(){
		cleanDash(this);
		emptyListener(this, "update");
		emptyListener(this, "data");
		//addListener(this, "update", "pause", this.updatePause);
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
	updatePause: function(){
	
	},
	updateRun: function(){
		move();
		this.checkDotHits();
		this.checkWallHits();
		this.drawRun();
	},
	updateRunMoveWall: function(){
		move();
		this.moveWalls();
		this.checkDotHits();
		this.checkWallHits();
		this.drawRun();
	},

	drawRun: function(){
		draw.clear();
		draw.dots();
		draw.walls(walls);
		draw.fillWall(1, this.heater.col);
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
		this.fTurn += dot.m*perpV;
		if(line[0]==0 && line[1]==0){
			if(this.wallHeatTrans<0 && walls.pts[0][0].y!=this.minY){
				perpV -= Math.max(0,Math.sqrt(-this.wallHeatTrans/dot.m));
			}else if (this.wallHeatTrans>0 && walls.pts[0][0].y!=this.maxY){
				perpV += Math.max(0,Math.sqrt(this.wallHeatTrans/dot.m));
			}
		}
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
		populate("spc1", 15, 15, 500, 400, 300, 300);
		populate("spc3", 15, 15, 500, 400, 500, 300);		
		populate("spc2", 120, 120, 75, 75, 20, 1000);
	},
	dataRun: function(){
		this.data.p.push(this.dataHandler.pressure(this.fTurn));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volPolyWall());
		this.fTurn = 0;
		this.pVSv.plotData(this.data.v, this.data.p);
		this.tVSv.plotData(this.data.v, this.data.t);
	},
	dataPause: function(){
	
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
		var compName = "compress";
		this.buttons[compName] = new Button(15,15,90,30,"Compress","#ceae6a", "#b3975c");
		this.buttons[compName].addClickListener(this.clickCompress, this).addReleaseListener(this.releaseCompress, this);
		var expName = "expand";
		this.buttons[expName] = new Button(15,55,90,30,"Expand","#ceae6a", "#b3975c");
		this.buttons[expName].addClickListener(this.clickExpand, this).addReleaseListener(this.releaseExpand, this);
		var toIntroName = "toIntro";
		this.buttons[toIntroName] = new Button(425,15,90,30,"To intro","#ceae6a", "#b3975c");
		this.buttons[toIntroName].addReleaseListener(this.startIntro, this);
		var toOutroName = "toOutro";
		this.buttons[toOutroName] = new Button(425,55,90,30,"To outro","#ceae6a", "#b3975c");
		this.buttons[toOutroName].addReleaseListener(this.startOutro, this);
		var tempSliderName = "temp";
		this.sliders[tempSliderName] = new Slider(150,20,"Temperature");
		this.sliders[tempSliderName].addDragListener(this.changeTemp,this);
		//var massSliderName = "mass";
		//this.sliders[mass] = new Slider(200,20,"Weight");
		//this.sliders[mass].addDragListener(this, this.changeWeight);
	},
	clickCompress: function(){
		removeListener(this, "update", "run");
		addListener(this, "update", "runMoveWall", this.updateRunMoveWall);
		this.wallHeatTrans=.1;
		this.curUpdate = this.updates.compress;
	},
	releaseCompress: function(){
		removeListener(this, "update", "runMoveWall");
		addListener(this, "update", "run", this.updateRun);
		this.wallHeatTrans=0;
		this.curUpdate = this.updates.run;
	},
	clickExpand: function(){
		removeListener(this, "update", "run");
		addListener(this, "update", "runMoveWall", this.updateRunMoveWall);
		this.wallHeatTrans=-.1
		this.curUpdate = this.updates.expand;
	},
	releaseExpand: function(){
		removeListener(this, "update", "runMoveWall");
		addListener(this, "update", "run", this.updateRun);
		this.wallHeatTrans=0;
		this.curUpdate = this.updates.run;
	},
	moveWalls: function(){
		var wall = walls.pts[0];

		if(wall[0].y<this.maxY && !this.movedWallsLast){
			wall[0].y+=10*this.wallHeatTrans;
			wall[1].y+=10*this.wallHeatTrans;
			wall[wall.length-1].y+=10*this.wallHeatTrans;
			this.movedWallsLast = true;
		} else {
			this.movedWallsLast = false;
		}
		walls.setupWall(0);
	},

	changeTemp: function(sliderVal){
		this.heater.changeTemp(sliderVal);
	},
	changeWeight: function(sliderVal){
		this.weight.changeWeight(sliderVal);
	}
}
