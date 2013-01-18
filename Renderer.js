function Renderer() {

}

Renderer.prototype = {
	render: function(scene) {
		if (scene.type) {
			if (/section/.test(scene.type)) {
				currentSetupType = scene.type;
			} else if (/prompt/.test(scene.type)){
				currentSetupType = scene.type + window[scene.type + 'Idx'];
			} else {
				console.log ('what is a scene.type of ' + scene.type + '?');
				console.trace();
			}
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
			var foo = new StateListener(listener); 
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
			var obj = getObjFromPath(cmmd.path, window);
			obj[cmmd.func](cmmd.attrs || {});
		}
	},

/*
Listener store on satisfy: path, handle

*/
}