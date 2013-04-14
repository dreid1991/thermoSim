//should make a 'spew timeline' function that prints out everything.  Would be le handy for debugging
//will want to step up to x.1 to include setup.  If x.1 doesn't exist, it will stop at x
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
	addOnce: function(sectionIdx, promptIdx, when, eventClass, func) {
		sectionIdx = sectionIdx == 'now' ? this.sectionIdx : sectionIdx;
		this.sections[sectionIdx].addOnce(promptIdx, when, eventClass, func);
		
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
	this.time = -2;
	this.sectionData = sectionData;
	this.moments = [];
	this.populateMoments(timeline, timeline.elems, this.moments, this.sectionData);
	this.moments = _.sortBy(this.moments, function(moment) {return moment.timestamp});
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
			this.promptIdx = 0; // just make time idx
			this.stepTo(-1);
			// this.level.makePromptCleanUpHolders(this.sectionData); //to be depracated
			// renderer.render(this.sectionData.sceneData);
			// if (this.sectionData.prompts[promptIdx].sceneData) {
				// renderer.render(this.sectionData.prompts[promptIdx].sceneData);
			// }
			// this.inited = true;
		} else {
			this.restoreGraphs();
		}
	},
	showPrompt: function(promptIdx) {
		//should all be rolled into moments now
		var dest = this.getTimeStamp(promptIdx, 'headHTML');
		this.stepTo(dest);
		// this.promptIdx = promptIdx;
		// var prompt = this.sectionData.prompts[promptIdx];
		// if (prompt.sceneData)
			// renderer.render(prompt.sceneData);
		// if (!prompt.quiz)
			// $('#nextPrevDiv').show();
		// var interpedText = interpreter.interp(prompt.text);
		// if (prompt.cutScene) {
			// this.level.cutSceneStart(interpedText, prompt.cutScene, prompt.quiz);
		// } else {
			// $('#prompt').html(defaultTo('', templater.div({innerHTML: interpedText})));
			// if (prompt.quiz) 
				// this.level.appendQuiz(prompt.quiz, $('#prompt'));
			// this.level.cutSceneEnd();
		// }
		// $('#baseHeader').html(prompt.title);
		// execListeners(this.level.setupListeners.listener);
		// emptyListener(this.level, 'setup');
		// interpreter.renderMath();
		// buttonManager.arrangeGroupWrappers();
		// buttonManager.arrangeAllGroups();
		// buttonManager.setButtonWidth();	
		
	},
	stepTo: function(dest) {
		var moments = this.moments;
		while (this.time != dest) {
			var moment = this.nextMoment(this.time, dest);
			moment.fire(this.time);
			this.time = moment.timestamp;
		}
	},
	nextMoment: function(cur, dest) {
		var curMoment = this.momentAt(cur);
		var idx = this.moments.indexOf(curMoment);
		dest < cur ? idx -- : idx ++;
		var nextMoment = this.moments[idx];
		if (nextMoment && Math.abs(nextMoment.timestamp - cur) <= Math.abs(dest - cur)) {
			return this.moments[idx];
		}
		return undefined;
	},
	momentAt: function(time) {
		for (var i=0; i<this.moments.length; i++) {
			if (this.moments[i].timestamp == time) return this.moments[i];
		}
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
	addOnce: function(promptIdx, when, eventClass, func) { //public func.  Test settings a heater's liquid
		promptIdx = prompt == 'now' ? this.promptIdx : promptIdx;
		var id = this.timeline.takeNumber();
		var timestamp = this.getTimestamp(promptIdx, 'setup');
		var cmmd = {type: 'once', spawn: func}
		this.pushOnce(this.timeline, this.moments, this.timeline.elems, id, cmmd, func, eventClass, timestamp);
	},
	populateMoments: function(timeline, elems, moments, sectionData) {
		moments.push(new Timeline.Moment(-2)); //dummy moment to start on

		this.addSceneDataToMoments(timeline, elems, moments, sectionData.sceneData, -1, undefined);
		var prompts = sectionData.prompts;
		for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
			if (prompts[promptIdx].sceneData) this.addSceneDataToMoments(timeline, elems, moments, prompts[promptIdx].sceneData, promptIdx);
		}
		this.populateHTMLMoments(timeline, elems, moments, sectionData);
	},
	populateHTMLMoments: function(timeline, elems, moments, sectionData) {
		var prompts = sectionData.prompts;
		for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
			var prompt = prompts[promptIdx];
			var timestampHead = this.getTimestamp(promptIdx, 'headHTML');
			this.populatePromptHTML(prompt, timestampHead, timeline, elems, moments);
		}
	},
	populatePromptHTML: function(prompt, timestampHead, timeline, elems, moments) {
		var timestampTail, id, spawnFunc, removeFunc, cmmd;
		if (prompt.cutScene) {
			id = timeline.takeNumber();
			spawnFunc = function() {
				var interpedText = interpreter.interp(prompt.text);
				$('#nextPrevDiv').hide();
				timeline.level.cutSceneStart(interpedText, prompt.curScene, prompt.quiz)
			};
			removeFunc = function() {
				timeline.level.cutSceneEnd()
				$('#nextPrevDiv').show();
			};
			cmmd = new Timeline.Command(timeline, elems, 'span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(timeline, elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, 'cmmds');
		} else {
			id = timeline.takeNumber();
			spawnFunc = function() {
				var interpedText = interpreter.interp(prompt.text);
				$('#prompt').html(defaultTo('', templater.div({innerHTML: interpedText})));
				if (prompt.quiz) 
					timeline.level.appendQuiz(prompt.quiz, $('#prompt'));		
			}
			removeFunc = function() {
				$('#prompt').html('');
			}
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(timeline, elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, 'cmmds');
		}
		
		if (prompt.title) {
			id = timeline.takeNumber();
			spawnFunc = function() {$('#baseHeader').html(prompt.title)};
			removeFunc = function() {$('#baseHeader').html('')};
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(timeline, elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, 'cmmds');			
		}
		var arrangeHTMLSpawn = function() {
			interpreter.renderMath();
			timeline.buttonManager.arrangeGroupWrappers();
			timeline.buttonManager.arrangeAllGroups();
			timeline.buttonManager.setButtonWidth();			
		}
		var arrangeHTMLCmmd = new Timeline.Command('point', arrangeHTMLSpawn, undefined, true);
	
		this.pushPoint(timeline, moments, elems, timeline.takeNumber(), arrangeHTMLCmmd, Timeline.stateFuncs.cmmds.spawn, true, 'cmmds', timestampHead);

		
	},
	addSceneDataToMoments: function(timeline, elems, moments, sceneData, timestamp) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		if (sceneData) {
			//will be able to interp all of these data nuggets before rendering
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'walls', timestamp, Timeline.stateFuncs.walls.spawn, Timeline.stateFuncs.walls.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dots, 'dots', timestamp, Timeline.stateFuncs.dots.spawn, Timeline.stateFuncs.dots.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.objs, 'objs', timestamp, Timeline.stateFuncs.objs.spawn, Timeline.stateFuncs.objs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dataRecord, 'objs', timestamp, Timeline.stateFuncs.dataRecord.spawn, Timeline.stateFuncs.dataRecord.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dataReadouts, 'objs', timestamp, Timeline.stateFuncs.dataReadouts.spawn, Timeline.stateFuncs.dataReadouts.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.triggers, 'objs', timestamp, Timeline.stateFuncs.triggers.spawn, Timeline.stateFuncs.triggers.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.graphs, 'objs', timestamp, Timeline.stateFuncs.graphs.spawn, Timeline.stateFuncs.graphs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.rxns, 'objs', timestamp, Timeline.stateFuncs.rxns.spawn, Timeline.stateFuncs.rxns.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.buttonGroups, 'objs', timestamp, Timeline.stateFuncs.buttonGrps.spawn, Timeline.stateFuncs.buttonGrps.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.buttons, 'objs', timestamp, Timeline.stateFuncs.buttons.spawn, Timeline.stateFuncs.buttons.remove);
			this.applyCmmdsToMoments(timeline, moments, elems, sceneData.cmmds, 'cmmds', timestamp);
			
		}
	},
	applySpanToMoments: function(timeline, moments, timelineElems, elemData, eventClass, timestampHead, spawnFunc, removeFunc) {
		elemData = elemData ? elemData : [];
		for (var i=0; i<elemData.length; i++) {
			var id = timeline.takeNumber();
			var elemDatum = elemData[i];
			var cleanUpWith = elemDatum.cleanUpWith;
			var timestampTail = this.getTimestamp(cleanUpWith || timestampHead, 'tail');

			this.pushSpan(timeline, timelineElems, elemDatum, spawnFunc, removeFunc, id, moments, timestampHead, timestampTail, eventClass);

			
		}
	},
	applyCmmdsToMoments: function(timeline, moments, timelineElems, cmmds, eventClass, timestampHead) {
		var cmmd;
		cmmds = cmmds ? cmmds : [];
		for (var i=0; i<cmmds.length; i++) {
			var cmmdInput = cmmds[i];
			if (typeof cmmdInput == 'string' || typeof cmmdInput == 'function') {
				cmmd = new Timeline.Command('point', cmmdInput, undefined, true);
			} else {
				cmmd = new Timeline.Command(cmmdInput.type, cmmdInput.spawn, cmmdInput.remove, cmmdInput.oneWay);
			}
			if (/span/i.test(cmmd.type)) {
				this.applyCmmdSpan(timeline, moments, timelineElems, cmmd, eventClass, timestampHead);
			} else if (/point/i.test(cmmd.type)) {
				this.applyCmmdPoint(timeline, moments, timelineElems, cmmd, eventClass, timestampHead);
			} else if (/once/i.test(cmmd.type)) {
				this.applyCmmdOnce(timeline, moments, timelineElems, cmmd, eventClass, timestampHead);
			} else {
				console.log('Bad command')
				console.log(cmmd);
				console.log('Must be string or have type of "span", "point", or "once"');
			}
		}
	},
	applyCmmdSpan: function(timeline, moments, timelineElems, cmmd, eventClass, timestampHead) {
		var id = timeline.takeNumber();
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		var remove = Timeline.stateFuncs.cmmds.remove;
		var cleanUpWith = cmmd.cleanUpWith;
		var timestampTail = this.getTimestamp(cleanUpWith || timestampHead, 'tail');
		
		this.pushSpan(timeline, timelineElems, cmmd, spawn, remove, id, moments, timestampHead, timestampTail, 'cmmds');
	},
	applyCmmdPoint: function(timeline, moments, timelineElems, cmmd, eventClass, timestamp) {
		var id = timeline.takeNumber();
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		var oneWay = defaultTo(true, cmmd.oneWay);
		this.pushPoint(timeline, moments, timelineElems, id, cmmd, spawn, oneWay, eventClass, timestamp);
	},
	applyCmmdOnce: function(timeline, moments, timelineElems, cmmd, eventClass, timestamp) {
		var id = timeline.takeNumber();
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		this.pushOnce(timeline, moments, timelineElems, id, cmmd, spawn, eventClass, timestamp);
	},
	pushSpan: function(timeline, timelineElems, elemDatum, spawn, remove, id, moments, timestampHead, timestampTail, eventClass) {
		var momentHead = this.getOrCreateMoment(moments, timestampHead);
		var momentTail = this.getOrCreateMoment(moments, timestampTail);
		var eventHead = new Timeline.Event.Span(timeline, timelineElems, elemDatum, spawn, remove, id, 'head', momentHead);
		var eventTail = new Timeline.Event.Span(timeline, timelineElems, elemDatum, spawn, remove, id, 'tail', momentTail);
		
		momentHead.events[eventClass].push(eventHead);
		momentTail.events[eventClass].push(eventTail);		
	},
	pushPoint: function(timeline, moments, timelineElems, id, elemDatum, spawn, oneWay, eventClass, timestamp) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		var event = new Timeline.Event.Point(timeline, timelineElems, elemDatum, spawn, id, oneWay, moment);
		moment.events[eventClass].push(event);
	},
	pushOnce: function(timeline, moment, timelineElems, id, elemDatum, spawn, eventClass, timestamp) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		var event = new Timeline.Event.Once(timeline, timelineElems, elemDatum, spawn, id, moment);
		moment.events[eventClass].push(event);
	},
	getTimestamp: function(time, when) {
		var timeAdj;
		if (/tailhtml/i.test(when)) {
			timeAdj = .8;
		} else if (/tail/i.test(when)) {
			timeAdj = .9;
		} else if (/setup/i.test(when)) {
			timeAdj = .1;
		} else if (/headhtml/i.test(when)) {
			timeAdj = .2;
		} else if (/head/.test(when)) {
			timeAdj = 0;
		}
		
		var idx = this.parseIntegerTimeIdx(time);
		
		if (idx == -1 && when == 'tail') {
			return Infinity;
		} else {
			return idx + timeAdj;
		
		}
	},
	parseIntegerTimeIdx: function(time) {
		if (typeof time == 'string') {
			if (/section/i.test(time)) {
				return -1;
			} else {
				var str = /[0-9]+/.exec(time);
				if (str !== '') {
					return Number(str);
				} else {
					console.log('Bad time code: ' + time);
				}
			}
		} else {
			return time;
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


Timeline.stateFuncs = {
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
	},
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
	},
	dataReadouts: {
		spawn: function(timeline, elems, id, datum) {
			var displayEntry = timeline.dataDisplayer.addEntry(datum);
			elems[id] = displayEntry;
		},
		remove: function(timeline, elems, id) {
			var displayEntry = elems[id];
			displayEntry.remove();
			elems[id] = undefined;
		}
	},
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
	},
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
		spawn: function(timeline, elems, id, btnDatum) {
			timeline.buttonManager.addButton(btnDatum.groupHandle, btnDatum.handle, btnDatum.label, btnDatum.exprs, btnDatum.prefIdx, btnDatum.isDown, btnDatum.cleanUpWith);
			elems[id] = btnDatum;
		},
		remove: function(timeline, elems, id) {
			var btnDatum = elems[id];
			timeline.buttonManager.removeButton(btnDatum.groupHandle, btnDatum.handle);
			elems[id] = undefined;
		}
	},	
	cmmds: {
		spawn: function(timeline, elems, id, cmmd) {
			var spawnExpr = cmmd.spawn;
			elems[id] = cmmd;
			if (spawnExpr) {
				with (DataGetFuncs) {
					if (typeof spawnExpr == 'function') {
						spawnExpr();
					} else if (typeof spawnExpr == 'string') {
						eval('(' + spawnExpr + ')');	
					} else if (spawnExpr instanceof Array) {
						var expr = spawnExpr.join(';') + ';';
						eval('(' + expr + ')');
					}
				}
			}
		},
		remove: function(timeline, elems, id) {
			var cmmd = elems[id];
			elems[id] = undefined;
			var removeExpr = cmmd.remove;
			if (removeExpr) {
				with (DataGetFuncs) {
					if (typeof removeExpr == 'function') {
						removeExpr();
					} else if (typeof removeExpr == 'string') {
						eval('(' + removeExpr + ')');	
					} else if (removeExpr instanceof Array) {
						var expr = removeExpr.join(';') + ';';
						eval('(' + expr + ')');
					}
				}
			}			
		}
	}

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
	fire: function(from, to) {
		this.fireSpans(this.events.walls, from, to);
		this.fireSpans(this.events.dots, from, to);
		this.fireSpans(this.events.objs, from, to);
		this.fireCmmds(this.events.cmmds, from, to);
	},
	fireSpans: function(spans, from, to) {
		if (to == this.timestamp) {
			this.fireSpansEntering(spans, from);
		} else if (from == this.timestamp) {
			this.fireSpansExiting(spans, to);
		}
	},
	fireSpansEntering: function(spans, from) {
		for (var i=0; i<spans.length; i++) {
			var span = spans[i];
			if (span.boundType == 'head') {
				span.spawn(span.timeline, span.timelineElems, span.id, span.elemDatum);
			} else if (span.boundType == 'tail') {
				span.remove(span.timeline, span.timelineElems, span.id);
			}
		}
	},
	fireSpansExiting: function(spans, to) {
		for (var i=0; i<spans.length; i++) {
			var span = spans[i];
			if (span.boundType == 'tail') {
				span.spawn(span.timeline, span.timelineElems, span.id, span.elemDatum);
			} else if (span.boundType == 'head') {
				span.remove(span.timeline, span.timelineElems, span.id);
			}
		}		
	},
	fireCmmds: function(cmmds, from, to) {
		for (var i=0; i<cmmds.length; i++) {
			var event = cmmds[i];
			if (event instanceof Timeline.Event.Span) {
				this.fireSpans([event], from, to)
			} else if (event instanceof Timeline.Event.Point) {
				if (to == this.timestamp && event.elemDatum.oneWay ? from < to : true) {
					event.spawn(event.timeline, event.timelineElems, event.id, event.elemDatum);
				}
			} else if (event instanceof Timeline.Event.Once) {
				if (!event.fired) {
					event.spawn(event.timeline, event.timelineElems, event.id, event.elemDatum);
					event.fired = true;
				}
			}
		}
	}
}

Timeline.Command = function(type, spawn, remove, oneWay) {
	this.type = type;
	this.spawn = spawn;
	this.remove = remove;
	this.oneWay = oneWay;
}

Timeline.EventClassHolder = function() {
	this.walls = [];
	this.dots = [];
	this.objs = [];
	this.cmmds = [];

}

Timeline.Event = {
	Span: function(timeline, timelineElems, elemDatum, spawn, remove, id, boundType, moment) {
		this.timeline = timeline;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.remove = remove;
		this.id = id;
		this.boundType = boundType;
		this.moment = moment;
	},
	Point: function(timeline, timelineElems, elemDatum, spawn, id, oneWay, moment) {
		this.timeline = timeline;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.id = id;
		this.oneWay = oneWay;
		this.moment = moment;
	},
	Once: function(timeline, timeElems, elemDatum, spawn, id, moment) {
		this.timeline = timeline;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.id = id;
		this.fired = false;
		this.moment = moment;
	}
}

