function Renderer() {

}

Renderer.prototype = {
	render: function(scene) {
		if (scene.type.indexOf('section') != -1) {
			currentSetupType = scene.type;
		} else {
			currentSetupType = scene.type + window[scene.type + 'Idx'];
		}
		if (!curLevel[currentSetupType + 'CleanUp'] && scene.type == 'prompt') {
			curLevel.makeListenerHolder('prompt' + promptIdx + 'CleanUp');
		}
		this.renderDots(scene.dots);
		this.renderWalls(scene.walls, scene);
		this.renderObjs(scene.objs);
		this.addRecording(scene.records);
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
	renderWalls: function(newWalls, scene) {
		var newWalls = defaultTo([], newWalls);
		if (scene.type == 'section') {
			window['walls'] = new WallHandler();
			walls = window['walls'];
		}
		for (var wallIdx=0; wallIdx<newWalls.length; wallIdx++) {
			var newWall = newWalls[wallIdx];
			walls.addWall(newWall);
		}	
	},
	renderObjs: function(objs) {
		objs = defaultTo([], objs);
		for (var objIdx=0; objIdx<objs.length; objIdx++) {
			var obj = objs[objIdx];
			var objFunc = window[obj.type]
			curLevel[obj.type + obj.handle] = new objFunc(obj.attrs);
		}
	},
	addRecording: function(data) {
		data = defaultTo([], data);
		for (var dataIdx=0; dataIdx<data.length; dataIdx++) {
			var entry = data[dataIdx];
			var func = WallMethods.getFunc.record(entry.data);
			if (func) {
				func.apply(walls[entry.wallHandle]);
			} else {
				console.log("Couldn't parse " + entry.data + " for wall " + entry.wallHandle);
			}
		}
	},
	addReadoutEntries: function(entries) {
		entries = defaultTo([], entries);
		for (var entryIdx=0; entryIdx<entries.length; entryIdx++) {
			var entry = entries[entryIdx];
			var func = WallMethods.getFunc.display(entry.data);
			if (func) {
				func.apply(walls[entry.wallHandle]);
			} else {
				console.log("Couldn't parse " + entry.data + " for wall " + entry.wallHandle);
			}			
		}
	},
	addListeners: function(listeners) {
		listener = defaultTo([], listeners);
		for (var listenerIdx=0; listenerIdx<listeners.length; listenerIdx++) {
			var listener = listeners[listenerIdx];
			new StateListener(listener); 
			//I don't think state listeners are ever referenced through curLevel., so I don't have to name them as keys in curLevel
		}
	},

}