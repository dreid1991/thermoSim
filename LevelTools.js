function LevelTools(){}
LevelTools.prototype = {
	makeCompArrow: function(data){
		var compMode = data.compMode;
		var bounds;
		if(data.bounds){
			bounds = data.bounds;	
		}else{
			bounds = {y:{min:this.minY, max:this.maxY}};
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
		

		return new DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds);
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
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
	},
	hideBase: function(){
		$('#base').hide();
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
	addGravity: function(){
		this.wallV += this.g;
	},
	clearGraphs: function(){
		for (var graphName in this.graphs){
			this.graphs[graphName].clear();
		}
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