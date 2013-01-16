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
		if (scene['type'] == 'section') {
			window['walls'] = new WallHandler();
		}
		for (var wallIdx=0; wallIdx<newWalls.length; wallIdx++) {
			var newWall = newWalls[wallIdx];
			walls.addWall(newWall);
		}	
	},
	renderObjs: function(objs) {
		for (var objIdx=0; objIdx<objs.length; objIdx++) {
			var obj = objs[objIdx];
			var objFunc = window[obj.type];
			curLevel[obj.type + obj.handle] = new objFunc(obj.attrs);
		}
	},
	addRecording: function(data) {
		for (var dataIdx=0; dataIdx<data.length; dataIdx++) {
			var entry = data[dataIdx];
			walls[entry.wallHandle]['record' + entry.data]();
		}
	},
	addReadoutEntries: function(entries) {
		for (var entryIdx=0; entryIdx<entries.length; entryIdx++) {
			var entry = entries[entryIdx];
			walls[entry.wallHandle]['display' + entry.data]();
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
		// this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
							// axesInit:{x:{min:6, step:2}, y:{min:0, step:1}}});
		// this.graphs.pVSv.addSet({address:'pExt', label:'P Ext.', pointCol:Col(255,50,50), flashCol:Col(255,200,200),
								// data:{x:walls[0].data.v, y:walls[0].data.pExt}, trace:true});		
		// this.graphs.pVSv.addSet({address:'pInt', label:'P Int.', pointCol:Col(50,255,50), flashCol:Col(200,255,200),
								// data:{x:walls[0].data.v, y:walls[0].data.pInt}, trace:true});	
		//Need to make data be stored as strings, not reference
		for (var graphIdx=0; graphIdx<graphs.length; graphIdx++) {
			var graph = graphs[graphIdx];
			curLevel.graphs[graph.handle] = new graphs[graph.type](graph);
			for (var setIdx=0; setIdx<graph.sets.length; setIdx++) {
				var set = graph.sets[setIdx];
				curLevel.graphs[graph.handle].addSet(set);
			}
		}
	}

}