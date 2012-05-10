function level1(){
	this.dataHandler = new DataHandler();
	this.data = new Database();
	this.data.addSet("t");
	this.data.addSet("p");
	this.data.addSet("v");
	this.updates = [this.updateRunning, this.updateCompressing, this.updateExpanding, this.updatePause];
	this.dataUpdates = [this.dataRun, this.dataPause];
	this.buttons = [];
	this.introText = "I'm typing a big old message here and I really don't have much to say.  Let's see if this triggers the word wrap! Looooooooooooooooooooooooooooooooooooooooooooks like it did!  Now let's see if the top stays about constant as I add more lines.  Golly gee, I sure hope it does.  That'd be swell, wouldn't it, pop?  Why yes it would, my boy.  We sure do have a long message here.  The text box's height coordinate designates the where the center of the box goes, vertically, so I have to adjust that point as the mesage gets longer.";
	this.outroText = "weeedleDEEhhhh\nhhhhhhhhh\nh\nh\nhhh";
	//walls = new WallHandler([[P(10,10), P(200,10), P(250,100), P(540,10), P(540,150), P(260,110), P(350,150), P(540,440), P(10,440)]]); // list of lists, can have multiple walls
	walls = new WallHandler([[P(10,10), P(540,10), P(540,440), P(10,440)]])
	walls.setup(this.walls);
	collide.setup();
	this.addDots();
	this.drawHeader();
	this.startIntro();
}
level1.prototype = {
	startIntro: function(){
		cleanDash(this);
		this.curData = this.dataUpdates[1]
		this.curUpdate = this.updates[3];
		this.drawDashStart();
		this.textBox = new MainTextBox(this.introText);
	},
	startSim: function(){
		this.textBox.remove();
		cleanDash(this);
		this.drawDashRun();		
		this.curUpdate = this.updates[0];
		this.curData = this.dataUpdates[0]
		this.graph = new Graph(575,8+header.height,400,400, "Volume", "Pressure", "#5a8a92");
		this.fTurn=0;
		this.movedWallsLast = new Boolean();
		this.movedWallsLast = false;	
	},
	startOutro: function(){
		cleanDash(this);
		this.curData = this.dataUpdates[1]
		this.curUpdate = this.updates[3];
		this.drawDashOut();
		this.textBox = new MainTextBox(this.outroText);
	},
	update: function(){
		this.curUpdate();
	},
	addData: function(){
		this.curData();
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
	updateCompressing: function(){
		move();
		this.compressWalls();
		this.checkDotHits();
		this.checkWallHits();
		draw.clear();
		draw.dots();
		draw.walls(walls);	
	},
	updateExpanding: function(){
		move();
		this.expandWalls();
		this.checkDotHits();
		this.checkWallHits();
		draw.clear();
		draw.dots();
		draw.walls(walls);	
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
		this.header = makeHeader("Isothermal compression");
	},
	drawDashStart: function(){
		var buttonWidth = 150;
		this.buttons.push(new Button(myCanvas.width/2 - buttonWidth/2, 40, buttonWidth, 50,"To the simulation!","#ceae6a", "#b3975c", this.onClickToSim, this.onReleaseToSim));
	},
	drawDashOut: function(){
		var buttonWidth = 150;
		this.buttons.push(new Button(myCanvas.width/2 - buttonWidth/2, 40, buttonWidth, 50,"To the simulation!","#ceae6a", "#b3975c", this.onClickToSim, this.onReleaseToSim));
	},
	drawDashRun: function(){
		this.buttons.push(new Button(15,15,90,30,"Compress","#ceae6a", "#b3975c", this.onClickCompress, this.onReleaseCompress));
		this.buttons.push(new Button(15,55,90,30,"Expand","#ceae6a", "#b3975c", this.onClickExpand, this.onReleaseExpand));
		this.buttons.push(new Button(425,15,90,30,"To intro","#ceae6a", "#b3975c", this.onClickToIntro, this.onReleaseToIntro));
		this.buttons.push(new Button(425,55,90,30,"To outro","#ceae6a", "#b3975c", this.onClickToOutro, this.onReleaseToOutro));
	},
	clickCompress: function(){
		this.curUpdate = this.updates[1];
	},
	releaseCompress: function(){
		this.curUpdate = this.updates[0];
	},
	clickExpand: function(){
		this.curUpdate = this.updates[2];
	},
	releaseExpand: function(){
		this.curUpdate = this.updates[0];
	},
	compressWalls: function(){
		var wall = walls.pts[0];
		if(wall[0].y<wall[2].y-75 && !this.movedWallsLast){
			wall[0].y++;
			wall[1].y++;
			wall.pop();
			walls.setup();
			this.movedWallsLast = true;
		} else {
			this.movedWallsLast = false;
		}
	},
	expandWalls: function(){
		var wall = walls.pts[0];
		if(wall[0].y>10 && !this.movedWallsLast){
			wall[0].y-=1;
			wall[1].y-=1;
			wall.pop();
			walls.setup();
			this.movedWallsLast = true;
		} else {
			this.movedWallsLast = false;
		}	
	},
	onClickCompress: function(){
		curLevel.clickCompress();
	},
	onReleaseCompress: function(){
		curLevel.releaseCompress();
	},
	onClickExpand: function(){
		curLevel.clickExpand();		
	},
	onReleaseExpand: function(){
		curLevel.releaseExpand();
	},
	onClickToSim: function(){
	
	},
	onReleaseToSim: function(){
		curLevel.startSim();
	},
	onClickToIntro: function(){
	
	},
	onReleaseToIntro: function(){
		curLevel.startIntro();
	},
	onClickToOutro: function(){
	
	},
	onReleaseToOutro: function(){
		curLevel.startOutro();
	},
}
