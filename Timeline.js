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
		var id = this.curId;
		this.curId ++;
		return id;
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
		
		if (!this.inited) { //worry about force reset later
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
			this.applyWallsToMoments(timeline, moments, elems, sceneData.walls, 'walls', timestamp);
		
		}
		if (cutScene) {
			
		}
	},
	
	applyWallsToMoments: function(timeline, moments, elems, wallData, eventClass, timestampHead) {
		wallData = wallData ? wallData : [];
		for (var i=0; i<wallData.length; i++) {
			var id = timeline.takeNumber();
			var wallDatum = wallData[i];
			var cleanUpWith = wallDatum.cleanUpWith;
			var timestampTail = this.getTimestampTail(timestampHead, cleanUpWith);
			//to be called in context of the Event
			var spawn = function() {
				elems[this.id] = timeline.walls.addWall(wallDatum);
			}
			var remove = function() {
				var wall = elems[this.id];
				timeline.walls.removeWall(wall.handle);
				elems[this.id] = undefined;
			}
			//type (?), spawn, remove, id, boundType
			var eventHead = new Timeline.Event.Span(spawn, remove, id, 'head');
			var eventTail = new Timeline.Event.Span(spawn, remove, id, 'tail');
			var momentHead = this.getOrCreateMoment(moments, timestampHead);
			var momentTail = this.getOrCreateMoment(moments, timestampTail);
			
			momentHead.events.walls.push(eventHead);
			momentTail.events.walls.push(eventTail);
			
		}
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
	this.events = new Timeline.eventClassHolder();
	//I *think* we can group it into walls, generics, cmmds, setups .
	//setups may be able to be rolled into commands.  Setup will be like linking two objects that are added in an unknown order.  Not necessary for linking objects to walls since order is known.  
		//A point command would probably work.
	//Generics include any objects, listeners, graphs, etc.  Anything that will have spawn/remove.  If there are interdependancies, 
}

Timeline.Moment.prototype = {
	addEvent: function(eventClass, event) {
		if (this.events[eventClass]) {
			this.events[eventClass].push(event);
		} else {
			console.log('Bad event class ' + eventClass);
		}
	},
	
}

Timeline.eventClassHolder = function() {
	this.walls = [];
	this.objs = [];
	this.cmmds = [];

}

Timeline.Event = {
	Span: function(spawn, remove, id, boundType) {
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