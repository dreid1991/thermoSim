function level2(){
	this.dataHandler = new DataHandler();
	this.data = new Database();
	this.data.addSet("t");
	this.data.addSet("p");
	this.data.addSet("v");
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
	this.buttons = {};
	this.sliders = {};

	this.wallHeatTrans = 0;

	this.introText = "Let's look at adiabatic compression.  We know that when you compress a container adiabatically, it heats up because you’re putting energy into the system through work.  We can relate a molecule’s temperature to its speed with the equation (1/2)mv^2=(3/2)kT.  This tell us that being compressed makes molecules speed up, but why?\n  To figure this out, we need to look how molecules behave when they collide with objects.  When an ideal gas molecule hits another object, it undergoes an elastic collision.  When that object is a massive stationary wall, the gas molecule is reflected by the wall and its kinetic energy is unchanged.  When the wall is moving, this is not true.\nSo to understand why compression heats a system, we need to describe molecules’ collisions with moving walls.  Try to do that using the simulation.  ";
	this.outroText = "     -You should have seen that as you compressed the container, the temperature increased faster than linearly as volume decreased.  Adiabatic expansion and compression can be described by the equation P1V1^k = P2V2^k with k=Cp/Cv.  From that equation, solve for T2 with P1 and V1 as your initial state.  Graph it.  Does this fit what you saw?\n     -So, did you figure out why the collisions with a moving wall cause a temperature change?\n     -Why is the temperature change nonlinear?  Think about how the number of molecules hitting the moving wall changes as pressure increases.\n     -If you compress and expand the container a few times, you’ll notice that the temperature starts to creep up.  Why does it do that?\n     -Related:  Is this expansion/compression reversible?";
	//walls = new WallHandler([[P(10,10), P(200,10), P(250,100), P(540,10), P(540,150), P(260,110), P(350,150), P(540,440), P(10,440)]]); // list of lists, can have multiple walls
	walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup(this.walls);
	this.minY = 10;
	this.maxY = walls.pts[0][2].y-75
	collide.setup();

}
level2.prototype = {
	init: function(){
		this.addDots();
		this.drawHeader();
		this.startIntro();
	},
	startIntro: function(){
		cleanDash(this);
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.drawDashStart();
		this.textBox = new MainTextBox(this.introText);
	},
	startSim: function(){
		this.textBox.remove();
		cleanDash(this);
		emptyListener(this, "update");
		emptyListener(this, "data");
		addListener(this, "update", "run", this.updateRun);
		addListener(this, "data", "run", this.dataRun);
		this.drawDashRun();		
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
	updateRunning: function(){
		move();
		this.checkDotHits();
		this.checkWallHits();
		draw.clear();
		draw.dots();
		draw.walls(walls);
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
	},
	addDots: function(){
		addSpecies(["spc1", "spc2", "spc3"]);
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 15, 15, 500, 400, 300, 300);
		populate("spc3", 15, 15, 500, 400, 500, 300);		
		populate("spc2", 15, 15, 75, 75, 20, 400);
		
		
	},
	dataRun: function(){
		this.data.p.push(this.dataHandler.pressure(this.fTurn));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		this.fTurn = 0;
		this.pVSv.plotData(this.data.v, this.data.p);
		this.tVSv.plotData(this.data.v, this.data.t);
	},
	dataPause: function(){
	
	},
	drawHeader: function(){
		this.header = makeHeader("Adiabatic compression");
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

		if((wall[0].y<this.maxY && this.wallHeatTrans>0) || (wall[0].y>this.minY && this.wallHeatTrans<0) && !this.movedWallsLast){
			wall[0].y+=5*this.wallHeatTrans;
			wall[1].y+=5*this.wallHeatTrans;
			wall[wall.length-1].y+=10*this.wallHeatTrans;
			this.movedWallsLast = true;
		} else {
			this.movedWallsLast = false;
		}
		walls.setupWall(0);
	},

}
