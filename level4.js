function level4(){
	this.dataHandler = new DataHandler();
	this.data = new Database();
	this.data.addSet("t");
	this.data.addSet("p");
	this.data.addSet("v");
	walls = new WallHandler([[P(10,75), P(540,75), P(540,440), P(10,440)]])
	this.wallV = 0;
	this.introText = "I AM LEVEL 4";
	this.outroText = "YOUR TRAINING IS NOW COMPLETE.  \nYOU CAN LEARN NOTHING MORE FROM ME.";
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.buttons = {};
	this.sliders = {};
	this.savedVals = {};
	this.g = .3;
	var heaterX = 200;
	var heaterY = 400;
	var heaterWidth = 50;
	var heaterHeight = 30;
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	this.weight = new Weight(250,75,.5,5000,20000);
	//walls = new WallHandler([[P(100,100), P(300,100),P(300,300),P(100,300)]])
	//walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup();
	this.minY = 25;
	this.maxY = walls.pts[0][2].y-75;
	collide.setup();
}

level4.prototype = {
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
		this.moveWalls();
		this.checkDotHits(); //okay, I think move walls should go up here so if we're at max, wallV gets set to zero.  I dunno though.  Figger it out.
		this.checkWallHits();
		this.drawRun();
	},
	addWeightForce: function(){
		this.counter++;
		this.wallV += this.g*updateInterval/1000;
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
			if (pt.y==this.yMin){
				dot.v.dy = -dotVo;
			}else if (pt.y==this.yMax){
				this.wallV = (wallVo*(this.weight.weight-dot.m)+2*dot.m*dotVo)/(this.weight.weight+dot.m);
			} else{
				dot.v.dy = (dotVo*(dot.m-this.weight.weight)+2*this.weight.weight*wallVo)/(dot.m+this.weight.weight);
				this.wallV = (wallVo*(this.weight.weight-dot.m)+2*dot.m*dotVo)/(this.weight.weight+dot.m);
				dot.y = pt.y+dot.r;
			}
		}else{
			walls.impactStd(dot, wallUV, perpV)		
		}
		this.fTurn += dot.m*perpV;
	},
	addDots: function(){
		addSpecies(["spc1", "spc2", "spc3"]);
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 20, 100, 500, 300, 500, 300);
		populate("spc3", 20, 100, 500, 300, 400, 300);		
		populate("spc2", 20, 100, 500, 300, 10, 300);
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
		var wall = walls.pts[0];
		var lastY = wall[0].y
		var unboundedY = lastY + this.wallV;
		var dyWeight = this.wallV;
		if(unboundedY>this.maxY || unboundedY<this.minY){
			var boundedY = Math.max(this.minY, Math.min(this.maxY, unboundedY));
			var nextY = 2*boundedY-unboundedY
			wall[0].y = nextY;
			wall[1].y = nextY;
			wall[wall.length-1].y = nextY;
			var deltaPEOverM = this.g*(unboundedY-nextY);
			if(this.wallV>0){
				this.wallV = -Math.sqrt(this.wallV*this.wallV - 2*deltaPEOverM);
			} else {
				this.wallV = Math.sqrt(this.wallV*this.wallV - 2*deltaPEOverM);
			}
			dyWeight = boundedY - lastY;
		}else{
			wall[0].y+=this.wallV;
			wall[1].y+=this.wallV;
			wall[wall.length-1].y+=this.wallV;
		}
		this.weight.move(V(0,dyWeight));
		walls.setupWall(0);
	},
	changeTemp: function(sliderVal){
		this.heater.changeTemp(sliderVal);
	},
	changeWeight: function(sliderVal){
		this.weight.changeWeight(sliderVal);
	},

}
