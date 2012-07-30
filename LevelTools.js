
LevelTools = {
	makeCompArrow: function(wallInfo, compAttrs){
		var wallIdx = walls.idxByInfo(wallInfo);
		var compMode = compAttrs.mode;
		var bounds;
		if(compAttrs.bounds){
			bounds = compAttrs.bounds;	
		}else{
			bounds = {y:{min:this.yMin, max:this.yMax-50}};
		}
		var pos = walls[wallIdx][1].copy()
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
		listeners.onMove = function(){curLevel.changeWallSetPt(0, this.pos.y, compMode)};
		listeners.onUp = function(){};
		

		return new DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds).show();
	},
	changeWallSetPt: function(wallInfo, dest, compType){
		var wallIdx = walls.idxByInfo(wallInfo);
		var wall = walls[wallIdx]
		var wallMoveMethod;
		if(compType=='isothermal'){
			var wallMoveMethod = 'cVIsothermal';
		} else if (compType=='adiabatic'){
			var wallMoveMethod = 'cVAdiabatic';
		}
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var getY = function(){
			return walls[wallIdx][0].y;
		}
		
		var dist = dest-getY();
		if(dist!=0){
			var sign = getSign(dist);
			wall.v = this.wallSpeed*sign;
			walls.setSubWallHandler(wallIdx, 0, wallMoveMethod);
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, wall.v))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
						walls.setSubWallHandler(wallIdx, 0, 'staticAdiabatic');
						wall.v = 0;
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
	borderStd: function(min){
		walls['container'].border([1,2,3,4], 5, this.wallCol.copy().adjust(-100,-100,-100), [{y:min}, {}, {}, {y:min}]);
	},

	update: function(){
		this.numUpdates++;
		turn++;
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
	trackIntPressureStart: function(handle){
		this.data['pInt'+handle] = [];
		var dataList = this.data['pInt'+handle]
		var wall = walls[handle];
		wall.forceInternal = 0;
		wall.pLastRecord = turn;
		addListener(curLevel, 'data', 'trackIntPressure'+handle,
			function(){
				dataList.push(wall.pInt());
			},
		'');
		
	},
	trackIntPressureStop: function(handle){
		removeListener(curLevel, 'data', 'trackIntPressure'+handle);
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