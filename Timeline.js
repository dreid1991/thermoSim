function Timeline() {
	//cloning return jquery reference rather than deepcopy if done before page fully loaded
	this.buttonManagerBlank = document.getElementById('buttonManager').outerHTML;
	this.dashRunBlank = document.getElementById('dashRun').outerHTML;
	
	this.sections = [];
	this.sectionIdx = undefined;
	
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
	show: function(sectionIdx, promptIdx, forceRefresh) {
		var changingSection = this.sectionIdx != sectionIdx;
		var changingPrompt = changingSection || promptIdx != this.sections[sectionIdx].promptIdx;
		if (changingPrompt || forceRefresh) {
			this.sections[sectionIdx].cleanUpPrompt();
		}
		if (changingSection || forceRefresh) {
			this.clearCurrentSection();
			this.sectionIdx = sectionIdx;
			//going to assume prompts are shown in sequential order for now
			this.sections[sectionIdx].showSection(this.sectionIdx);
		}
		if (changingPrompt || forceRefresh) {
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
	}
}

Timeline.Section = function(timeline, sectionData, buttonManagerBlank, dashRunBlank) {
//need to make clean up listeners still
	this.timeline = timeline;
	this.inited = false
	this.promptIdx;
	this.sectionData = sectionData;
	this.level = new LevelInstance();
	this.mainReadout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left', this.level);
	this.collide = new CollideHandler();
	this.walls = WallHandler();
	this.dotManager = new DotManager();
	this.dataHandler = new DataHandler();
	this.dataDisplayer = new DataDisplayer();
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
	}
}