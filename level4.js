function level4(){
	this.dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.pExt = [];
	this.data.v = [];
	this.data.e = [];
	this.numUpdates = 0;
	walls = new WallHandler([[P(10,75), P(540,75), P(540,440), P(10,440)]])
	this.extPressurePts = [walls.pts[0][0], walls.pts[0][1]];
	this.SAPExt = getLen(this.extPressurePts);
	this.forceInternal = 0;
	this.wallV = 0;
	this.updateListeners = {};//{run:this.updateRun, compress:this.updateCompress, expand:this.updateExpand, pause:this.updatePause};
	this.dataListeners = {};//{run:this.dataRun, pause:this.dataPause};
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
	this.g = 50*updateInterval/1000;
	var heaterX = 200;
	var heaterY = 400;
	var heaterWidth = 50;
	var heaterHeight = 30;
	
	this.dragWeights = new DragWeights([{name:'sml', count:15, weight:4}, 
									{name:'med', count:5, weight:12}, 
									{name:'lrg', count:2, weight:30}
									],
									walls.pts[0][2].y,
									function(){return walls.pts[0][0].y},
									myCanvas.height-15,
									Col(218, 187, 41),
									Col(150, 150, 150)
									);
	this.mass = function(){return this.dragWeights.pistonWeight};
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	walls.setup();
	this.minY = 25;
	this.maxY = walls.pts[0][2].y-75;
	addSpecies(["spc1", "spc3"]);
	collide.setup();
}

level4.prototype = {

	init: function(){
		this.addDots();
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();
		this.dragWeights.init();
		
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
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();
		showCurQ();
		emptyListener(this, "data");
		addListener(this, 'update', 'run', this.updateRun, this);
		addListener(this, "data", "run", this.dataRun, this);
		addListener(this, 'wallImpact', 'moving', this.onWallImpact, this);
		addListener(this, 'dotImpact', 'std', collide.impactStd, collide);
		this.graphs.pVSv = new Graph(575,8,400,300, "Volume", "Pressure");
		this.graphs.tVSv = new Graph(575,8+30+this.graphs.pVSv.height, 400, 300,"Volume", "Temperature");
		this.graphs.pVSv.addSet('pInt', 'P Int.', '#383eff', '#aaace6');
		this.graphs.pVSv.addSet('pExt', 'P Ext.', '#00ff29', '#a2e2ad');
		this.graphs.tVSv.addSet('t', 'Sys Temp', '#b70000', '#f89494');
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
		this.moveWalls();
		this.addGravity();	
		this.checkDotHits(); 
		this.checkWallHits();
		this.dragWeights.moveWeightsOnPiston();
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
		this.dragWeights.draw();
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
		where A = (abs(wallV)+1)^(const, maybe .1 to .3)
		leads to
		a = m1 + m1^2/(A^2m2)
		b = -2*vo1*m1^2/(A^2m2) - 2*vo2*m1/A^2
		c = m1^2*vo1^2/(A^2*m2) + 2*m1*vo2*vo1/A^2 + m2*(vo2/A)^2 - m1*vo1^2 - m2*vo2^2
		I recommend grouping squared terms in each block for faster computation
		v1 = (-b + (b^2 - 4*a*c)^.5)/2a
		v2 = (m1*vo1 + m2*vo2 - m1*v1)/(m2*A)
		*/
		
		if(line[0]==0 && line[1]==0){
			if(Math.abs(this.wallV)>1.0){
				var vo1 = dot.v.dy;
				var vo2 = this.wallV;
				var m1 = dot.m;
				var m2 = this.mass();
				var vo1Sqr = vo1*vo1;
				var vo2Sqr = vo2*vo2;
				
				var scalar = Math.pow(Math.abs(vo2), .1);
				var scalarSqr = scalar*scalar
				
				var a = m1*(1 + m1/(scalarSqr*m2));
				var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
				var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
				
				dot.v.dy = (-b + Math.pow(b*b - 4*a*c,.5))/(2*a);
				dot.y = dot.y+dot.r;
				this.wallV = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
			}else{
				var pt = walls.pts[line[0]][line[1]];
				var dotVo = dot.v.dy;
				var wallVo = this.wallV;
				dot.v.dy = (dotVo*(dot.m-this.mass())+2*this.mass()*wallVo)/(dot.m+this.mass());
				this.wallV = (wallVo*(this.mass()-dot.m)+2*dot.m*dotVo)/(this.mass()+dot.m);
				dot.y = pt.y+dot.r;			
			}
		}else{
			walls.impactStd(dot, wallUV, perpV);
			this.forceInternal += 2*dot.m*Math.abs(perpV);
		}
	},
	addDots: function(){
		//populate("spc1", 15, 15, myCanvas.width-400, myCanvas.height-150, 200, 4);
		//populate("spc2", 75, 75, myCanvas.width-400, myCanvas.height-150, 20, 4);
		//populate("spc3", 15, 15, myCanvas.width-400, myCanvas.height-150, 400, 4);		
		populate("spc1", 20, 80, 500, 300, 800, 300);
		populate("spc3", 20, 80, 500, 300, 600, 300);		
		//populate("spc2", 20, 80, 500, 300, 20, 300);
	},
	dataRun: function(){
		var SAPInt = getLen([walls.pts[0][1], walls.pts[0][2], walls.pts[0][3], walls.pts[0][4]])
		this.data.pInt.push(this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt));
		this.data.pExt.push(this.dataHandler.pressureExt(this.mass(), this.g, this.SAPExt));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volPolyWall());
		console.log('force internal ',this.forceInternal);
		this.forceInternal = 0;
		vLast = this.data.v[this.data.v.length-1];
		pIntLast = this.data.pInt[this.data.pInt.length-1];
		pExtLast = this.data.pExt[this.data.pExt.length-1];
		tLast = this.data.t[this.data.t.length-1];
		this.graphs.pVSv.addPt(vLast, pExtLast, 'pExt');
		this.graphs.pVSv.addPt(vLast, pIntLast, 'pInt');
		this.graphs.tVSv.addPt(vLast, tLast, 't');
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
		walls.setupWall(0);
	},
	clearGraphs: function(){
		for (var graph in this.graphs){
			this.graphs[graph].clear();
		}
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
