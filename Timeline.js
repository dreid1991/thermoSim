//should make a 'spew timeline' function that prints out everything.  Would be le handy for debugging
function Timeline() {
	//cloning return jquery reference rather than deepcopy if done before page fully loaded
	this.buttonManagerBlank = document.getElementById('buttonManager').outerHTML;
	this.dashRunBlank = document.getElementById('dashRun').outerHTML;
	this.sections = [];
	this.sectionIdx = undefined;
	this.curId = 0;
	this.elems = [];
	
}

Timeline.prototype = {
	curSection: function() {
		return this.sections[this.sectionIdx];
	},
	curPrompt:function() {
		return this.sections[this.sectionIdx].curPrompt();
	},
	pushSection: function(sectionData) {
		this.sections.push(new Timeline.Section(this, sectionData, this.buttonManagerBlank, this.dashRunBlank));
	},
	clearCurrentSection: function() {
		if (this.sectionIdx !== undefined) 
			this.sections[this.sectionIdx].clear()
	},
	show: function(sectionIdx, promptIdx, refreshing) {
		var changingSection = this.sectionIdx != sectionIdx;
		var changingPrompt = changingSection || promptIdx != this.sections[sectionIdx].promptIdx;
		if (changingPrompt || refreshing) {
			this.sections[sectionIdx].cleanUpPrompt();
		}
		if (changingSection || refreshing) {
			this.clearCurrentSection();
			this.sectionIdx = sectionIdx;
			//going to assume prompts are shown in sequential order for now
			this.sections[sectionIdx].showSection(this.sectionIdx);
		}
		if (changingPrompt || refreshing) {
			this.sections[sectionIdx].showPrompt(promptIdx);
		}
	},
	refresh: function() {
		var curPromptIdx = this.sections[this.sectionIdx].promptIdx;
		var curSection = this.sections[this.sectionIdx];
		var newSectionInstance = new Timeline.Section(this, curSection.sectionData, this.buttonManagerBlank, this.dashRunBlank);
		curSection.cleanUpPrompt();
		curSection.clear();
		this.sections.splice(this.sectionIdx, 1, newSectionInstance);
		this.show(this.sectionIdx, curPromptIdx, true);
	},
	takeNumber: function() {
		return this.curId ++;
	},
}

Timeline.Section = function(timeline, sectionData, buttonManagerBlank, dashRunBlank) {
//need to make clean up listeners still
	this.timeline = timeline;
	this.inited = false
	this.promptIdx;
	this.sectionData = sectionData;
	this.moments = [];
	this.populateMoments(timeline, timeline.elems, this.moments, this.sectionData);
	//sort moments here
	this.level = new LevelInstance();
	this.mainReadout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left', this.level);
	this.collide = new CollideHandler();
	this.walls = WallHandler();
	this.dotManager = new DotManager();
	this.dataHandler = new DataHandler();
	this.dataDisplayer = new DataDisplayer();
	this.thresholdEnergySpcChanger = new ThresholdEnergySpcChanger(this.collide);
	this.buttonManager = new ButtonManager('buttonManager');
	this.spcs = {};
	LevelTools.addSpcs(LevelData.spcDefs, this.spcs, this.dotManager);
	this.sliderList = [];
	this.dataDisplayer.setReadouts(this.level.readouts);
	this.collide.setSpcs(this.spcs);
	this.level.spcs = this.spcs;
	this.level.dataHandler = this.dataHandler;
	this.buttonMangerClone;
	this.buttonManagerBlank = buttonManagerBlank;
	this.dashRunClone;
	this.dashRunBlank = dashRunBlank;
}

Timeline.Section.prototype = {
	showSection: function(curSectionIdx) {
		this.replaceDiv($('#dashRunWrapper'), $('#dashRun'), this.dashRunClone || this.dashRunBlank);
		this.replaceDiv($('#buttonManagerWrapper'), $('#buttonManager'), this.buttonManagerClone || this.buttonManagerBlank);
		this.pushToGlobal();
		
		if (!this.inited) {
			this.promptIdx = 0;
			this.level.makePromptCleanUpHolders(this.sectionData); //to be depracated
			renderer.render(this.sectionData.sceneData);
			if (this.sectionData.prompts[promptIdx].sceneData) {
				renderer.render(this.sectionData.prompts[promptIdx].sceneData);
			}
			this.inited = true;
		} else {
			this.restoreGraphs();
		}
	},
	showPrompt: function(promptIdx) {
		//going to go with rendering everything for now
		this.promptIdx = promptIdx;
		var prompt = this.sectionData.prompts[promptIdx];
		if (prompt.sceneData)
			renderer.render(prompt.sceneData);
		if (!prompt.quiz)
			$('#nextPrevDiv').show();
		var interpedText = interpreter.interp(prompt.text);
		if (prompt.cutScene) {
			this.level.cutSceneStart(interpedText, prompt.cutScene, prompt.quiz);
		} else {
			$('#prompt').html(defaultTo('', templater.div({innerHTML: interpedText})));
			if (prompt.quiz) 
				this.level.appendQuiz(prompt.quiz, $('#prompt'));
			this.level.cutSceneEnd();
		}
		$('#baseHeader').html(prompt.title);
		execListeners(this.level.setupListeners.listener);
		emptyListener(this.level, 'setup');
		interpreter.renderMath();
		buttonManager.arrangeGroupWrappers();
		buttonManager.arrangeAllGroups();
		buttonManager.setButtonWidth();	
		
	},
	cleanUpPrompt: function() {
		if (this.promptIdx !== undefined && this.inited) {
			var listeners = this.level['prompt' + this.promptIdx + 'CleanUpListeners'].listeners;
			execListeners(listeners);
		}
	},
	curPrompt: function() {
		return this.sectionData.prompts[this.promptIdx];
	},
	replaceDiv: function(wrapper, current, clone) {
		if (current.length) 
			current.remove();
		wrapper.append(clone);
	},
	pushToGlobal: function() {
		window.curLevel = this.level;
		window.collide = this.collide;
		window.walls = this.walls;
		window.dotManager = this.dotManager;
		window.spcs = this.spcs;
		window.dataDisplayer = this.dataDisplayer;
		window.sliderList = this.sliderList;
		window.buttonManager = this.buttonManager;
		window.dataHandler = this.dataHandler;
		window.thresholdEnergySpcChanger = this.thresholdEnergySpcChanger;
		
	},
	restoreGraphs: function() {
		for (var graphName in this.level.graphs) {
			var graph = this.level.graphs[graphName];
			graph.restoreHTML();
			graph.drawAllData();
		}
	},
	clear: function() {
		if (this.inited) {
			$('#prompt').html('');
			$('#buttonManager').html('');
			this.dashRunClone = $('#dashRun').clone(true);
			$('#dashRun').remove();
			for (var graphName in this.level.graphs) {
				var graph = this.level.graphs[graphName];
				graph.clearHTML();
			}
		}
	},
	populateMoments: function(timeline, elems, moments, sectionData) {
		moments.push(new Timeline.Moment(-2)); //dummy moment to start on

		this.addSceneDataToMoments(timeline, elems, moments, sectionData.sceneData, -1, undefined);
	},
	addSceneDataToMoments: function(timeline, elems, moments, sceneData, timestamp, cutScene) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		if (sceneData) {
			//will be able to interp all of these data nuggets before rendering
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'walls', timestamp, Timeline.stateFuncs.walls.spawn, Timeline.stateFuncs.walls.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'dots', timestamp, Timeline.stateFuncs.dots.spawn, Timeline.stateFuncs.dots.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.objs.spawn, Timeline.stateFuncs.objs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.dataRecord.spawn, Timeline.stateFuncs.dataRecord.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.dataReadouts.spawn, Timeline.stateFuncs.dataReadouts.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.triggers.spawn, Timeline.stateFuncs.triggers.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.graphs.spawn, Timeline.stateFuncs.graphs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.rxns.spawn, Timeline.stateFuncs.rxns.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.buttonGrps.spawn, Timeline.stateFuncs.buttonGrps.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'objs', timestamp, Timeline.stateFuncs.buttons.spawn, Timeline.stateFuncs.buttons.remove);
			//commands are not necessarily spans.  Handle them differently, yo
			
		}
		if (cutScene) {
			
		}
	},
	//HEY - generalize apply by making it take event class and like 'spawn' class, so the function branches at the point where it makes the add and remove functions
	applySpanToMoments: function(timeline, moments, timelineElems, elemData, eventClass, timestampHead, spawnFunc, removeFunc) {
		elemData = elemData ? elemData : [];
		for (var i=0; i<elemData.length; i++) {
			var id = timeline.takeNumber();
			var elemDatum = elemData[i];
			var cleanUpWith = elemDatum.cleanUpWith;
			var timestampTail = this.getTimestampTail(timestampHead, cleanUpWith);

			this.pushSpan(timeline, timelineElems, elemDatum, spawnFunc, removeFunc, id, moments, timestampHead, timestampTail, eventClass);

			
		}
	},

	pushSpan: function(timeline, timelineElems, elemDatum, spawn, remove, id, moments, timestampHead, timestampTail, eventClass) {
		var eventHead = new Timeline.Event.Span(timeline, timelineElems, elemDatum, spawn, remove, id, 'head');
		var eventTail = new Timeline.Event.Span(timeline, timelineElems, elemDatum, spawn, remove, id, 'tail');
		var momentHead = this.getOrCreateMoment(moments, timestampHead);
		var momentTail = this.getOrCreateMoment(moments, timestampTail);
		
		momentHead.events[eventClass].push(eventHead);
		momentTail.events[eventClass].push(eventTail);		
	},

	getTimestampTail: function(timestamp, cleanUpWith) {
		if (cleanUpWith == undefined) {
			if (timestamp == -1) {
				return Infinity;
			} else {
				return timestamp + .9;
			}
		
		} else if (/section/i.test(cleanUpWith)) {
			return Infinity;
		} else if (/prompt/i.test(cleanUpWith)) {
			var idxToCleanWith = /[0-9]+/.exec(cleanUpWith)[0];
			if (idxToCleanWith !== '') {
				return Number(idxToCleanWith) + .9;
			} else {
				console.log('Bad clean up with ' + cleanUpWith);
			}
		}
	},
	getOrCreateMoment: function(moments, timestamp) {
		for (var i=0; i<moments.length; i++) {
			if (moments[i].timestamp == timestamp) return moments[i];
		}
		moments.push(new Timeline.Moment(timestamp));
		return moments[moments.length - 1];
	},
}
// can have one-time, point, and span commands, I guess
// point should only apply when going forward 
Timeline.Moment = function(timestamp) {
	this.timestamp = timestamp;
	this.events = new Timeline.EventClassHolder();
	//I *think* we can group it into walls, generics, cmmds, setups .
	//setups may be able to be rolled into commands.  Setup will be like linking two objects that are added in an unknown order.  Not necessary for linking objects to walls since order is known.  
		//A point command would probably work.
	//Generics include any objects, listeners, graphs, etc.  Anything that will have spawn/remove.  If there are interdependancies, 
}

Timeline.Moment.prototype = {

	
}

Timline.stateFuncs = {
	walls: {
		spawn: function(timeline, elems, id, datum) {
			elems[id] = timeline.walls.addWall(wallDatum);
		},
		remove: function(timeline, elems, id) {
			var wall = elems[id];
			if (wall) timeline.walls.removeWall(wall.handle);
			elems[id] = undefined;		
		}
	},
	dots: {
		spawn: function(timeline, elems, id, datum) {
			timeline.spcs[dotDatum.spcName].populate(dotDatum.pos, dotDatum.dims, dotDatum.count, dotDatum.temp, id, dotDatum.returnTo, dotDatum.tag);
		},
		remove: function(timeline, elems, id) {
			timeline.dotManager.removeByAttr('elemId', id);
		}
	}
	objs: {
		spawn: function(timeline, elems, id, datum) {
			var objFunc = window[datum.type];
			if (!objFunc) console.log('Bad object type ' + datum.type);
			elems[id] = new objFunc(datum.attrs);
		},
		remove: function(timeline, elems, id) {
			var obj = elems[id];
			if (obj) obj.remove();
			elems[id] = undefined;
		}
	},
	dataRecord: {
		spawn: function(timeline, elems, id, entry) {
			if (/collisions/i.test(entry.data)) {
				timeline.collide.recordCollisions();
			} else {
				timeline.walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase()](entry.attrs);
			}
			elems[id] = entry;
		},
		remove: function(timeline, elems, id) {
			var entry = elems[id];
			if (/collisions/i.test(entry.data)) {
				timeline.collide.recordCollisionsStop();
			} else {
				timeline.walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase() + 'Stop'](entry.attrs)
			}
			elems[id] = undefined;
		}
	}
	dataDisplay: {
		spawn: function(timeline, elems, id, datum) {
			var displayEntry = timeline.dataDisplayer.addEntry(datum);
			elems[id] = displayEntry;
		},
		remove: function(timeline, elems, id) {
			var displayEntry = elems[id];
			displayEntry.remove();
			elems[id] = undefined;
		}
	}
	triggers: {
		spawn: function(timeline, elems, id, datum) {
			elems[id] = new window.Trigger(datum);
		},
		remove: function(timeline, elems, id) {
			var trigger = elems[id];
			trigger.remove();
			elems[id] = undefined;
		}
	},
	graphs: {
		spawn: function(timeline, elems, id, graphDatum) {
			var graph = new window.Graphs[graphDatum.type](graphDatum);
			for (var setIdx=0; setIdx<graphDatum.sets.length; setIdx++) {
				var set = graphDatum.sets[setIdx];
				graph.addSet(set);
			}
			timeline.level.graphs[graphDatum.handle] = graph;
			elems[id] = graph;
		},
		remove: function(timeline, elems, id) {
			var graph = elems[id];
			graph.remove();
			elems[id] = undefined;
		}		
	}
	rxns: {
		spawn: function(timeline, elems, id, rxnDatum) {
			var rxn = timeline.collide.addReaction(rxnDatum);
			elems[id] = rxn;
		},
		remove: function(timeline, elems, id) {
			var rxn = elems[id];
			rxn.remove();
			elems[id] = undefined;
		}		
	},
	buttonGrps: {
		spawn: function(timeline, elems, id, grpDatum) {
			timeline.buttonManager.addGroup(grpDatum.handle, grpDatum.label, grpDatum.prefIdx, grpDatum.isRadio, grpDatum.isToggle, grpDatum.cleanUpWith);
			elems[id] = grpDatum;
		},
		remove: function(timeline, elems, id) {
			var grpDatum = elems[id];
			timeline.buttonManager.removeGroup(grpDatum.handle);
			elems[id] = undefined;
		}
	},
	buttons: {
		spawn: function(timeline, elems, id, grpDatum) {
			timeline.buttonManager.addGroup(grpDatum.handle, grpDatum.label, grpDatum.prefIdx, grpDatum.isRadio, grpDatum.isToggle, grpDatum.cleanUpWith);
			elems[id] = grpDatum;
		},
		remove: function(timeline, elems, id) {
			var grpDatum = elems[id];
			timeline.buttonManager.removeGroup(grpDatum.handle);
			elems[id] = undefined;
		}
	},	

}

Timeline.EventClassHolder = function() {
	this.walls = [];
	this.dots = [];
	this.objs = [];
	this.cmmds = [];

}

Timeline.Event = {
	Span: function(timeline, timelineElems, elemDatum, spawn, remove, id, boundType) {
		this.timeline = timeline;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.remove = remove;
		this.id = id;
		this.boundType = boundType;
	},
	Point: function(  ) {
	
	},
	Once: function( ) {
	
	}
}