function Renderer() {

}

Renderer.prototype = {
	render: function(scene) {
		if (!scene) return;
		
		if (typeof scene == 'function') return scene.apply(curLevel);
		
		scene = this.getAndEval(scene); //copying all objects, replacing GET tags with value and EVAL ing
		if (scene.type) {
			if (/section/i.test(scene.type)) {
				currentSetupType = scene.type;
			} else if (/prompt/i.test(scene.type)){
				currentSetupType = scene.type + window[scene.type + 'Idx'];
			} else {
				console.log ('scene.type of ' + scene.type + " is not valid.  Use 'section' or 'prompt'");
				console.trace();
			}
		}
		if (!curLevel[currentSetupType + 'CleanUp'] && scene.type == 'prompt') {
			curLevel.makeListenerHolder('prompt' + promptIdx + 'CleanUp');
		}
		this.renderDots(scene.dots || []);
		this.renderWalls(scene.walls || [], scene);
		this.renderObjs(scene.objs || []);
		this.dataRecord(scene.dataRecord || []);
		this.dataDisplay(scene.dataDisplay || []);
		this.addListeners(scene.listeners || []);
		this.addGraphs(scene.graphs || []);
		this.addRxns(scene.rxns || []);
		this.doCommands(scene.commands || []);
		

		
	
	},
	renderDots: function(dots) {
		var toPopulate = dots
		for (var popIdx=0; popIdx<toPopulate.length; popIdx++) {
			var curPop = toPopulate[popIdx];
			if (spcs[curPop.type || curPop.spcName]) { //converting to using spcName instead of type but don't want to break old content.  Will phase out.
				spcs[curPop.type || curPop.spcName].populate(curPop.pos, curPop.dims, curPop.count, curPop.temp, curPop.returnTo, curPop.tag);
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
			new objFunc(obj.attrs); //object is added to curLevel in stdSetup in objectFuncs
		}
	},
	dataRecord: function(data) {
		for (var dataIdx=0; dataIdx<data.length; dataIdx++) {
			var entry = data[dataIdx];
			walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase()](entry.attrs);
		}
	},
	dataDisplay: function(entries) {
		for (var entryIdx=0; entryIdx<entries.length; entryIdx++) {
			var entry = entries[entryIdx];
			walls[entry.wallInfo]['display' + entry.data.toCapitalCamelCase()](entry);
		}
	},
	addListeners: function(listeners) {
		for (var listenerIdx=0; listenerIdx<listeners.length; listenerIdx++) {
			var listener = listeners[listenerIdx];
			var foo = new StateListener(listener); 
			//I don't think state listeners are ever referenced through curLevel., so I don't have to name them as keys in curLevel
		}
	},
	addRxns: function(rxns) {
		for (var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++) {
			collide.addReaction(rxns[rxnIdx]);
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
	getAndEval: function(sceneElem) {
		if (typeof sceneElem == 'number') {
			return sceneElem;
		} else if (typeof sceneElem == 'string') {
			return evalText(addStored(sceneElem));
		} else if (typeof sceneElem == 'boolean') {
			return sceneElem;
		} else if (sceneElem instanceof Point) {
			var x = this.getAndEval(sceneElem.x);
			var y = this.getAndEval(sceneElem.y);
			return P(x, y);
		} else if (sceneElem instanceof Vector) {
			var dx = this.getAndEval(sceneElem.dx);
			var dy = this.getAndEval(sceneElem.dy);
			return V(dx, dy);
		} else if (sceneElem instanceof Color) {
			var r = this.getAndEval(sceneElem.r);
			var g = this.getAndEval(sceneElem.g);
			var b = this.getAndEval(sceneElem.b);
			return Col(r, g, b);
		} else if (sceneElem instanceof Array) {
			var newArr = [];
			for (var idx=0; idx<sceneElem.length; idx++) {
				newArr.push(this.getAndEval(sceneElem[idx]));
			}
			return newArr = newArr;
		} else if (sceneElem instanceof Object) {
			var newObj = {};
			for (var name in sceneElem) {
				newObj[name] = this.getAndEval(sceneElem[name])
			}
			return newObj;
		}
	}

/*
Listener store on satisfy: path, handle

*/
}