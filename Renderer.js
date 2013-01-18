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
		this.renderDots(scene.dots || []);
		this.renderWalls(scene.walls || [], scene);
		this.renderObjs(scene.objs || []);
		this.addRecording(scene.records || []);
		this.addReadoutEntries(scene.readoutEntries || []);
		this.addListeners(scene.listeners || []);
		this.addGraphs(scene.graphs || []);
		this.doCommands(scene.commands || []);
		

		
	
	},
	renderDots: function(dots) {
		var toPopulate = dots
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
		if (newWalls.length) {
			if (scene['type'] == 'section') {
				window['walls'] = new WallHandler();
			}
			for (var wallIdx=0; wallIdx<newWalls.length; wallIdx++) {
				var newWall = newWalls[wallIdx];
				walls.addWall(newWall);
			}	
		}
	},
	renderObjs: function(objs) {
		for (var objIdx=0; objIdx<objs.length; objIdx++) {
			var obj = objs[objIdx];
			var objFunc = window[obj.type];
			curLevel[obj.type + obj.attrs.handle] = new objFunc(obj.attrs);
		}
	},
	addRecording: function(data) {
		for (var dataIdx=0; dataIdx<data.length; dataIdx++) {
			var entry = data[dataIdx];
			walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase()]();
		}
	},
	addReadoutEntries: function(entries) {
		for (var entryIdx=0; entryIdx<entries.length; entryIdx++) {
			var entry = entries[entryIdx];
			walls[entry.wallInfo]['display' + entry.data.toCapitalCamelCase()]();
		}
	},
	addListeners: function(listeners) {
		for (var listenerIdx=0; listenerIdx<listeners.length; listenerIdx++) {
			var listener = listeners[listenerIdx];
			new StateListener(listener); 
			//I don't think state listeners are ever referenced through curLevel., so I don't have to name them as keys in curLevel
		}
	},
	addGraphs: function(graphs) {
		for (var graphIdx=0; graphIdx<graphs.length; graphIdx++) {
			var graph = graphs[graphIdx];
			curLevel.graphs[graph.handle] = new window.Graphs[graph.type](graph);
			for (var setIdx=0; setIdx<graph.sets.length; setIdx++) {
				var set = graph.sets[setIdx];
				curLevel.graphs[graph.handle].addSet(set);
			}
		}
	},
	doCommands: function(cmmds) {
		for (var cmmdIdx=0; cmmdIdx<cmmds.length; cmmdIdx++) {
			var cmmd = cmmds[cmmdIdx];
			var obj = this.getObjFromStr(cmmd.obj, window);
			obj[cmmd.func](cmmd.attrs || {});
		}
	},
	getObjFromStr: function(objPath, curObj) {
		if (!objPath || objPath == '') {
			return curObj
		}
		var nextDir = /[^\.]{1,}/.exec(objPath)[0];
		objPath = objPath.slice(objPath.indexOf(nextDir) + nextDir.length, objPath.length);
		newObj = curObj[nextDir];
		if (newObj) {
			return this.getObjFromStr(objPath, newObj);
		} else {
			console.log('tried to get bad obj path ' + objPath + ' from object ' + curObj);
			console.trace();
			return  
		}
	},

}