function LevelTools(){}
LevelTools.prototype = {
	makeCompArrow: function(compAttrs){
		var compMode = compAttrs.mode;
		var bounds;
		if(compAttrs.bounds){
			bounds = compAttrs.bounds;	
		}else{
			bounds = {y:{min:this.yMin, max:this.yMax}};
		}
		var pos = walls.pts[0][1].copy()
		var rotation = 0;
		var cols = {};
		cols.outer = Col(247, 240,9);
		cols.onClick = Col(247, 240,9);
		cols.inner = this.bgCol;
		var dims = V(25, 15);
		var name = 'volDragger';
		var drawCanvas = c;
		var canvasElement = canvas;
		var listeners = {};
		listeners.onDown = function(){};
		listeners.onMove = function(){curLevel.changeWallSetPt(this.pos.y, compMode)};
		listeners.onUp = function(){};
		

		return new DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds).show();
	},
	changeWallSetPt: function(dest, compType){
		var wall = walls.pts[0]
		var wallMoveMethod;
		if(compType=='isothermal'){
			var wallMoveMethod = this.cVIsothermal;
		} else if (compType=='adiabatic'){
			var wallMoveMethod = this.cVAdiabatic;
		}
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var getY = function(){
			return walls.pts[0][0].y;
		}
		
		var dist = dest-getY();
		if(dist!=0){
			var sign = getSign(dist);
			this.wallV = this.wallSpeed*sign;
			walls.setSubWallHandler(0, 0, {func:wallMoveMethod, obj:this});
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, this.wallV))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
						walls.setSubWallHandler(0, 0, {func:this.staticAdiabatic, obj:this});
						this.wallV = 0;
					}
				},
			this);
		}
	},
	checkDotHits: function(){
		collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},
	cutSceneStart: function(text, mode){
		this.pause();
		$('#dashRun').hide();
		if(!mode){
			$('#dashCutScene').show();
		}else if(mode=='intro'){
			$('#dashIntro').show();
			$('#base').hide();
		}else if(mode=='outro'){
			$('#dashOutro').show();
			$('#base').hide();
		}
		$('#canvasDiv').hide();
		$('#display').show();
		if(text){
			$('#intText').html(text);
		}
		$('#intText').show();
		
	},
	cutSceneText: function(text){
		$('#intText').html(text);
	},
	cutSceneEnd: function(){
		this.resume();
		$('#intText').html('');
		$('#dashRun').show();
		$('#dashOutro').hide();
		$('#dashIntro').hide();
		$('#dashCutScene').hide();
		$('#base').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();	
	},
	pause: function(){
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, "update");
		emptyListener(this, "data");
	},//COULD ALSO DO LIKE 'SAVE/LOAD BY TYPE' FOR ANIM TEXT, ARROW
	resume: function(){
		loadListener(this, 'update');
		loadListener(this, 'data');
	},
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
		$('#dashCutScene').hide();
	},
	moveWalls: function(){
		var wall = walls.pts[0];
		var lastY = wall[0].y
		var nextY;
		var unboundedY = lastY + this.wallV + .5*this.g;
		var dyWeight = null;
		if(unboundedY>this.yMax || unboundedY<this.yMin){
			nextY = this.hitBounds(lastY);
		}else{
			nextY = unboundedY;
			this.wallV += this.g;

		}
		wall[0].y = nextY;
		wall[1].y = nextY;
		wall[wall.length-1].y = nextY;
		walls.setupWall(0);
		
	},
	hitBounds: function(lastY){
		//possible this should just be for lower bounds
		var tLeft = 1;
		var unboundedY = lastY + this.wallV*tLeft + .5*this.g*tLeft*tLeft;
		var boundedY = Math.max(this.yMin, Math.min(this.yMax, unboundedY));
		var discr = this.wallV*this.wallV + 2*this.g*(boundedY-lastY);
		if (boundedY==this.yMax){
			
			var tHit = (-this.wallV + Math.sqrt(discr))/this.g;

		}else if (boundedY==this.yMin){
			
			var tHit = (-this.wallV - Math.sqrt(discr))/this.g;
		}
		this.wallV+=this.g*tHit;
		this.wallV*=-1;
		tLeft-=tHit;
		
		if(-2*this.wallV< tLeft*this.g && this.wallV<0){
			var tBounce = Math.abs(2*this.wallV/this.g);
			var numBounces = Math.floor(tLeft/tBounce);
			tLeft-=numBounces*tBounce;
		}
		var nextY = boundedY + this.wallV*tLeft + .5*this.g*tLeft*tLeft;
 
		
		this.wallV += this.g*tLeft;//had 2* here.  Didn't make sense
		
		return nextY;
	},
	update: function(){
		this.numUpdates++;
		for (var updateListener in this.updateListeners.listeners){
			var listener = this.updateListeners.listeners[updateListener]
			listener.func.apply(listener.obj);
		}
	},
	addData: function(){
		for (var dataListener in this.dataListeners.listeners){
			var listener = this.dataListeners.listeners[dataListener];
			listener.func.apply(listener.obj);
		}
		this.numUpdates = 0;
		this.forceInternal = 0;
	},
	updateRun: function(){
		move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
	},
	clearGraphs: function(){
		for (var graphName in this.graphs){
			this.graphs[graphName].clear();
		}
	},
	removeGraph: function(graphName){
		this.graphs[graphName].remove();
		this.graphs[graphName] = undefined;
	},
	removeAllGraphs: function(){
		for (var graphName in this.graphs){
			this.removeGraph(graphName);
			delete this.graphs[graphName];
		}	
	},
	trackVolumeStart: function(decPlaces){
		if(decPlaces===undefined){
			decPlaces = 1;
		}
		this.readout.addEntry('vol', 'Volume:', 'L', dataHandler.volume(), undefined, decPlaces);
		addListener(curLevel, 'update', 'trackVolume',
			function(){
				this.readout.hardUpdate(dataHandler.volume(), 'vol');
			},
		this);
	},
	trackVolumeStop: function(){
		this.readout.removeEntry('vol');
		removeListener(curLevel, 'update', 'trackVolume');
	},
	trackTempStart: function(decPlaces){
		if(decPlaces===undefined){
			decPlaces = 0;
		}
		this.readout.addEntry('temp', 'Temp:', 'K', this.data.t[this.data.t.length-1], undefined, decPlaces);
		addListener(curLevel, 'data', 'trackTemp',
			function(){
				this.readout.tick(this.data.t[this.data.t.length-1], 'temp');
			},
		this);	
	},
	trackTempStop: function(){
		this.readout.removeEntry('temp');
		removeListener(curLevel, 'data', 'trackTemp');
	},
	makeListeners: function(){
		this.updateListeners = {listeners:{}, save:{}};
		this.dataListeners = {listeners:{}, save:{}};
		this.mousedownListeners = {listeners:{}, save:{}};
		this.mouseupListeners = {listeners:{}, save:{}};
		this.mousemoveListeners = {listeners:{}, save:{}};
		this.resetListeners = {listeners:{}, save:{}};
		this.initListeners = {listeners:{}, save:{}};		
	},
}