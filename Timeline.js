function Timeline() {
	this.sections = [];
	this.sectionIdx = undefined;
	
}

Timeline.prototype = {
	pushSection: function(sectionData) {
		this.sections.push(new Timeline.Section(this, sectionData));
	},
	clearCurrentSection: function() {
		if (this.sectionIdx !== undefined) 
			this.sections[this.sectionIdx].clear()
	},
	showSection: function(idx, promptIdx, forceRefresh) {
		if (this.sectionIdx != idx || forceRefresh) {
			this.clearCurrentSection();
			this.sectionIdx = idx;
			this.sections[idx].show(this.sectionIdx, promptIdx || 0);
		}
	}
}

Timeline.Section = function(timeline, sectionData) {
	this.timeline = timeline;
	this.inited = false
	this.promptIdx = 0;
	this.sectionData = sectionData;
	this.level = new LevelInstance();
	this.mainReadout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left', this.level);
	this.collide = new CollideHandler();
	this.walls = WallHandler();
	this.dotManager = new DotManager();
	this.dataHandler = new DataHandler();
	this.dataDisplayer = new DataDisplayer();
	this.buttonManager = new ButtonManager($('#buttonManager'));
	this.spcs = {};
	LevelTools.addSpcs(LevelData.spcDefs, this.spcs, this.dotManager);
	this.sliderList = [];
	this.dataDisplayer.setReadouts(this.level.readouts);
	this.collide.setSpcs(this.spcs);
	this.level.spcs = this.spcs;
	this.level.dataHandler = this.dataHandler;
}

Timeline.Section.prototype = {
	show: function(curSectionIdx, promptIdx) {
		this.pushToGlobal();
		if (!this.inited) { //worry about force reset later
			renderer.render(this.sectionData.sceneData);
			if (this.sectionData.prompts[promptIdx].sceneData) {
				renderer.render(this.sectionData.prompts[promptIdx].sceneData);
			}
		}
		
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
	clear: function() {
		$('#prompt').html('');
		$('#buttonManager').html('');
		for (var graphName in this.level.graphs) {
			var graph = this.level.graphs[graphName];
			graph.clearHTML();
		}
	}
}