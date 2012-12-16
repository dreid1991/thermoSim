function Renderer() {

}

Renderer.prototype = {
	render: function(scene) {
		currentSetupType = scene.type + window[scene.type + 'Idx'];
		
		this.renderDots(scene.dots);
		this.renderWall(scene.walls);
		this.renderObjs(scene.objs);
		this.addReadoutEntries(scene.readoutEntries);
		this.addListeners(scene.listeners);
		
		

		
	
	},
	renderDots: function(dots) {
		var toPopulate = defaultTo([], dots);
		for (var popIdx=0; popIdx<toPopulate.length; popIdx++) {
			var curPop = toPopulate[popIdx];
			if (spcs[curPop.type]) {
				spcs[curPop.type].populate(curPop.pos, curPop.dims, curPop.count, curPop.temp, curPop.returnTo, curPop.tag);
			} else {
				console.log('Trying to populate bad species type ' + curPop.type);
			}
		}	
	},
	renderWalls: function(walls) {
		var newWalls = defaultTo([], scene.walls);
		if (scene.type == 'section') {
			walls = new WallHandler();
		}
		for (var wallIdx=0; wallIdx<newWalls.length; wallIdx++) {
			var newWall = newWalls[wallIdx];
			walls.addWall({pts: newWall.pts, handler: newWall.handler, handle: newWall.handle, bound: newWall.bounds, vol: newWall.vol});
		}	
	},
	renderObjs: function(objs) {
		var newObjs = defaultTo([], scene.objs);
		for (var objIdx=0; objIdx<objs.length; objIdx++) {
			var obj = objs[objIdx];
			curLevel[obj.type + obj.handle] = new (window[obj.type](obj.attrs));
		}
	},
	addReadoutEntries: function(entries) {
		for (var entryIdx=0; entryIdx<entries.length; entryIdx++) {
			var entry = entries[entryIdx];
			walls[entry.wallHandle]['display' + entry.data](entry.readout);
		}
	},
	addListener: function(listeners) {
		
	},

}