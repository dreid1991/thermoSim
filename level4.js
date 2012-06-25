function level4(){
	
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
	this.extPressurePts = [walls.pts[0][0], walls.pts[0][1]];
	this.SAPExt = getLen(this.extPressurePts);
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
	
	this.g = 50*updateInterval/1000;
	this.dragWeights = this.makeDragWeights();
	this.mass = function(){return this.dragWeights.pistonWeight};
	//this.heater = new Heater(heaterX, heaterY, heaterWidth, heaterHeight, 50, 300)
	walls.setup();
	this.minY = 60;
	this.maxY = walls.pts[0][2].y-75;
	addSpecies(['spc1', 'spc3']);
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
		this.graphs.pVSv.addSet('pExt', 'P Ext.', Col(0,255,0), Col(200,255,200),
								function(){
									var pLast = self.data.pExt[self.data.pExt.length-1];
									var vLast = self.data.v[self.data.v.length-1];
									var address = 'pExt';
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
	makeDragWeights: function(){
		var dragWeights = new DragWeights([{name:'sml', count:15, mass:4}, 
									{name:'med', count:6, mass:10}, 
									{name:'lrg', count:2, mass:30}
									],
									walls.pts[0][2].y,
									function(){return walls.pts[0][0].y},
									myCanvas.height-15,
									20,
									Col(218, 187, 41),
									Col(150, 150, 150),
									function(){return curLevel.g}//This may not work.  curLevel if does not
									);
		return dragWeights;
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
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
		//draw.fillPts(walls.pts[1], this.heater.col, c);
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
				
				var scalar = Math.pow(Math.abs(vo2)+.1, .2);
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
		populate("spc1", 35, 80, 460, 350, 800, 250);
		populate("spc3", 35, 80, 460, 350, 600, 250);		
		//populate("spc2", 35, 80, 460, 300, 20, 250);
	},
	dataRun: function(){
		var SAPInt = getLen([walls.pts[0][1], walls.pts[0][2], walls.pts[0][3], walls.pts[0][4]])
		this.data.pInt.push(this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt));
		this.data.pExt.push(this.dataHandler.pressureExt(this.mass(), this.g, this.SAPExt));
		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		console.log(this.data.v[this.data.v.length-1]);
		this.forceInternal = 0;
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		
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
