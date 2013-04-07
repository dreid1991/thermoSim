function Timeline() {
	this.sections = [];
	
}

Timeline.prototype = {
	pushSection: function(sectionData) {
		this.sections.push(new Timeline.Section(sectionData));
	},
	showSection(idx) {
		this.sections[idx].init();
	}
}

Timeline.Section = function(sectionData) {
	this.sectionData = sectionData;
	this.mainReadout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left');
	this.level = new LevelInstance(this.mainReadout);
	this.collide = new CollideHandler();
	this.walls = WallHandler();
	this.dotManager = new DotManager();
	this.dataHandler = new DataHandler();
	this.dataDisplayer = new DataDisplayer();
	this.buttonManager = new ButtonManager();
	this.spcs = {};
	this.sliderList = [];
}

Timeline.Section.prototype = {
	init: function() {
		this.pushToGlobal();
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
		
	}
}