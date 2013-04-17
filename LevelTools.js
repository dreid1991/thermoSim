LevelTools = {
	setStds: function(){
		this.graphs = {};
		//this.makePromptCleanUpHolders(0);
		this.bgCol = Col(5, 17, 26);
		this.wallCol = Col(255,255,255);
		this.numUpdates = 0;
		this.wallSpeed = defaultTo(1, this.wallSpeed);
		this.makeListenerHolders();
		
		this.attracting = false;
		this.gravitying = false;
		this.setUpdateRunListener();
		addListener(this, 'data', 'run', this.dataRun, this);

	},
	addStoreAs: function(levelData) {
		var storeAs=0;
		for (var sectionIdx=0; sectionIdx<levelData.mainSequence.length; sectionIdx++) {
			var section = levelData.mainSequence[sectionIdx];
			for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
				var prompt = section.prompts[promptIdx];
				if (prompt.quiz) {
					for (var questionIdx=0; questionIdx<prompt.quiz.length; questionIdx++) {
						var question = prompt.quiz[questionIdx];
						if (question.storeAs === undefined) {
							question.storeAs = 'questionAnswer' + String(storeAs);
						}
						storeAs ++;
					}
				}
			}
		}
	},
	addImgs: function(levelData) {
		var questionId = 0;
		for (var sectionIdx=0; sectionIdx<levelData.mainSequence.length; sectionIdx++) {
			var section = levelData.mainSequence[sectionIdx];
			if (!section.prompts) console.log('Section ' + sectionIdx + ' has no prompts!  Sections must have at least one prompt.');
			for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
				var title = prompt.title;
				var text = prompt.text;
				var quiz = prompt.quiz;
				if (title) prompt.title = interpreter.interpImgs(title);
				if (text) prompt.text = interpreter.interpImgs(title);
				if (quiz) {
					for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
						var question = quiz[questionIdx];
						if (!question.storeAs) question.storeAs = 'storeAs' + questionId;
						questionId ++;
						if (question.options) {
							for (optionIdx=0; optionIdx<question.options.length; optionIdx++) {
								var option = question.options[optionIdx];
								for (optionElement in option) {
									var element = option[optionElement];
									if (typeof(element) == 'string') {
										option[optionElement] = interpreter.interpImgs(element);
									}						
								}
							}
						}
					}
				}
			}
		}
	},
	setDefaultPromptVals: function(levelData){
		for (var sectionIdxLocal=0; sectionIdxLocal<levelData.mainSequence.length; sectionIdxLocal++) {
			var section = levelData.mainSequence[sectionIdxLocal];
			for (var promptIdxLocal=0; promptIdxLocal<section.prompts.length; promptIdxLocal++) {
				var prompt = section.prompts[promptIdxLocal];
				prompt.finished = false;
				prompt.title = defaultTo('', prompt.title);
				prompt.text = defaultTo('', prompt.text);	
			}
		}
	},
	addSpcs: function(defs, target, dotManager) {
		for (var defIdx=0; defIdx<defs.length; defIdx++) {
			var def = defs[defIdx];
			var spc = new Species(def.spcName, def.m, def.r, def.col, defIdx, def.cv, def.hF298, def.hVap298, def.antoineCoeffs, def.cpLiq, def.spcVolLiq, dotManager);
			target[def.spcName] = spc;
		}
	},
	addSceneDataTypes: function() {
		//will still need to add type if you're rendering a function.  
		for (var sIdx=0; sIdx<this.mainSequence.length; sIdx++) {
			var section = this.mainSequence[sIdx];
			if (section.sceneData) section.sceneData.type = 'section';
			if (!section.prompts) console.log('Section ' + sIdx + ' has no prompts!  Sections must have at least one prompt.');
			for (var pIdx=0; pIdx<section.prompts.length; pIdx++) {
				var prompt = section.prompts[pIdx];
				if (prompt.sceneData) prompt.sceneData.type = 'prompt';
			}
		}
	},
	move: function(){
		var spcLocal = this.spcs;
		for (var spcName in spcLocal) {
			var dots = spcLocal[spcName].dots;
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				dots[dotIdx].x += dots[dotIdx].v.dx;
				dots[dotIdx].y += dots[dotIdx].v.dy;
			}
		}
	},
	cutSceneStart: function(text, mode, quiz) {
		this.inCutScene = true;
		$('#intText').html('');
		text = defaultTo('',text);
		
		this.pause();
		$('#dashRunWrapper').hide();
		$('#buttonManager').hide();
		if (mode===true) {
			$('#dashCutScene').show();
			this.cutSceneText(text);
			$('#prompt').html('');
		} else if (mode=='intro') {
			$('#dashIntro').show();
			$('#base').hide();
			this.cutSceneText(text);
		} else if (mode=='outro') {
			$('#dashOutro').show();
			$('#base').hide();
			this.cutSceneText(text);
		}

		$('#canvasDiv').hide();
		$('#display').show();

		this.cutSceneDivShow();
		
	},
	cutSceneDivShow: function() {
		$('#intText').show();
	},
	cutSceneText: function(text){
		$('#intText').html(text);
	},
	showRunDivs: function() {
		$('#intText').html('');
		$('#dashRunWrapper').show();
		$('#buttonManager').show();
		$('#dashRun').show();
		$('#dashOutro').hide();
		$('#dashIntro').hide();
		$('#dashCutScene').hide();
		$('#nextPrevDiv').show();
		$('#base').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();	
	},
	cutSceneEnd: function(){
		this.inCutScene = false;
		this.resume();
		this.showRunDivs();
		$('#intText').html('');
	},
	pause: function(){
		this.updateStore = this.update;
		this.updateDataStore = this.updateData;
		this.update = function(){};
		this.updateData = function(){};
	},
	resume: function(){
		if (this.updateStore) this.update = this.updateStore;
		if (this.updateDataStore) this.updateData = this.updateDataStore;
	},

	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRunWrapper').hide();
		$('#dashOutro').hide();
		$('#dashCutScene').hide();
	},
	//is this used?
	borderStd: function(info){
		info = defaultTo({}, info);
		var wall = defaultTo(0, info.wallInfo);
		
		walls[wall].border([1,2,3,4], 5, this.wallCol.copy().adjust(-100,-100,-100), [{y:info.min}, {}, {}, {y:info.min}]);
	},

	update: function(){
		this.numUpdates++;
		turn++;
		this.updateRun();
		for (var updateListener in this.updateListeners.listeners){
			var listener = this.updateListeners.listeners[updateListener];
			listener.func.apply(listener.obj);
		}
		for (var wallMoveListener in this.wallMoveListeners.listeners){
			var listener = this.wallMoveListeners.listeners[wallMoveListener];
			listener.func.apply(listener.obj);
		}
	},
	updateData: function(){

		for (var dataListener in this.dataListeners.listeners){
			var listener = this.dataListeners.listeners[dataListener];
			listener.func.apply(listener.obj);
		}

		this.numUpdates = 0;
	},
	delayGraphs: function() {
		var self = this;
		window.setTimeout(function() {
			self.dataRunNoGraphs();
			addListener(curLevel, 'data', 'run', self.dataRun, self);
			//addListener(curLevel, 'update'/*'data'*/, 'runGraphs', self.dataRun, self);
		}, 250);
	},
	dataRunNoGraphs: function() {
		for (var datum in this.recordListeners.listeners){
			var recordInfo = this.recordListeners.listeners[datum];
			recordInfo.func.apply(recordInfo.obj);
			//this.data[datum].pushNumber(recordInfo.func.apply(recordInfo.obj));
		}			
	},
	dataRun: function() {
		for (var datum in this.recordListeners.listeners){
			var recordInfo = this.recordListeners.listeners[datum];
			recordInfo.func.apply(recordInfo.obj);
			//this.data[datum].pushNumber(recordInfo.func.apply(recordInfo.obj));
		}	
		for (var graphName in this.graphs) {
			if (this.graphs[graphName].active) {
				this.graphs[graphName].addLast();//Start here
			}
		}
	},
	setUpdateRunListener: function() {
		if (this.attracting && this.gravitying) {
			this.updateRun = this.updateRunAttractAndGravity;
		} else if (this.attracting) {
			this.updateRun = this.updateRunAttract;
		} else if (this.gravitying) {
			this.updateRun = this.updateRunGravity;
		} else { 
			this.updateRun = this.updateRunBasic;
		}
	},
	gravity: function(attrs) {
	
		this.gravitying = true;
		cleanUpWith = defaultTo('section', attrs.cleanUpWith);
		//YO YO - MAKE IT CLEAN UP
		//Problem with hitting wall, slowly loses energy.  Would need to do something similar to wall hitting its bounds
		for (var wallIdx=0; wallIdx<walls.length; wallIdx++) {
			walls[wallIdx].setHitMode('Gravity');
		}
		this.setUpdateRunListener();

		addListener(window['curLevel'], cleanUpWith + 'CleanUp', 'gravityStop', this.gravityStop, this);
	},
	gravityStop: function() {
		this.gravitying = false;
		this.setUpdateRunListener();


	},
	doGravity: function() {
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				dots[dotIdx].v.dy+=gInternal;
				dots[dotIdx].y+=.5*gInternal;
			}
		}
	},
	attract: function(attrs) {
		this.attracting = true;
		cleanUpWith = defaultTo('section', attrs.cleanUpWith);
		attractor.setup();
		attractor.assignELastAll();
		this.setUpdateRunListener();
		addListener(window['curLevel'], cleanUpWith + 'CleanUp', 'attractStop', this.attractStop, this);
	},
	attractStop: function() {
		this.attracting = false;
		attractor.zeroAllEnergies();
		this.setUpdateRunListener();
	},
	updateRunBasic: function() {
		this.move();
		collide.check();
		walls.check();
		this.drawRun();
	},
	updateRunGravity: function() {
		this.move();
		collide.check();
		this.doGravity();
		walls.check();
		this.drawRun();	
	},
	updateRunAttract: function() {
		this.move();
		collide.check();
		attractor.attract();
		walls.check();
		this.drawRun();
	},
	updateRunAttractAndGravity: function() {
		this.move();
		collide.check();
		attractor.attract();
		this.doGravity();
		walls.check();
		this.drawRun();		
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls);
	},
	resetGraphs: function(){
		for (var graphName in this.graphs){
			this.graphs[graphName].reset();
		}
	},
	removeGraph: function(graphName){
		this.graphs[graphName].remove();
		this.graphs[graphName] = undefined;
	},
	removeAllGraphs: function(){
		for (var graphName in this.graphs){
			this.removeGraph(graphName);
			delete this.graphs[graphName];
		}	
	},
	saveAllGraphs: function(){
		//OOH - made load graphs by section/prompt idx
		for (var graphName in this.graphs) {
			var saveName = graphName + 'section' + sectionIdx + 'prompt' + promptIdx;
			this.graphs[graphName].save(saveName);
		}
	},
	disableAllGraphs: function(){
		for(var graphName in this.graphs){
			this.graphs[graphName].disable();
		}
	},
	selectObj: function(type, handle) {
		if (/^wall$/i.test(type)) {
			return walls[handle] || console.log('Bad command wall handle ' + handle);
		} else {
			return this[this.key(type, handle)] || console.log('Bad command data: Type ' + type + ' and handle ' + handle);
		}
	},
	key: function(type, handle) {
		return type.toCamelCase() + handle.toCapitalCamelCase()
	},

	makeListenerHolders: function(){
		makeListenerHolder(this, 'update');
		makeListenerHolder(this, 'wallMove');
		makeListenerHolder(this, 'data');
		makeListenerHolder(this, 'mousedown');
		makeListenerHolder(this, 'mouseup');
		makeListenerHolder(this, 'mousemove');
		makeListenerHolder(this, 'init');
		makeListenerHolder(this, 'record');
		makeListenerHolder(this, 'sectionCondition');
		makeListenerHolder(this, 'promptCondition');
		makeListenerHolder(this, 'sectionCleanUp');
		makeListenerHolder(this, 'setup');
	},
	
	makePromptCleanUpHolders: function(sectionData){
		this.promptCleanUpHolders = new Array(sectionData.prompts.length);
		for (var promptIdx=0; promptIdx<sectionData.prompts.length; promptIdx++) {
			this.promptCleanUpHolders[promptIdx] = makeListenerHolder(this, 'prompt' + promptIdx + 'CleanUp');
		}
	},
	sectionConditions: function(){
		//ALERT NOT BUBBLING UP CORRECTLY.  IT GETS TO THIS FUNCTION FROM STATE LISTENERS BUT IS NOT RETURNED
		var didWin = 1;
		var alerts = {1:undefined, 0:undefined};
		var priorities = {1:0, 0:0};
		var conditions = this.sectionConditionListeners.listeners
		for (var conditionName in conditions) {
			var condition = conditions[conditionName]
			winResults = condition.func.apply(condition.obj); //returns didWin, alert, priority (high takes precidence);
			didWin = Math.min(didWin, winResults.didWin);
			if (winResults.alert) {
				var priority = defaultTo(0, winResults.priority);
				if (priority>=priorities[Number(winResults.didWin)]) {
					alerts[Number(winResults.didWin)] = winResults.alert;
				}
			}	
		}	
		return {didWin:didWin, alert:alerts[didWin]};
	},
	promptConditions: function(idx){
		var didWin = 1;
		var alerts = {1:undefined, 0:undefined};
		var priorities = {1:0, 0:0};
		var conditions = this.promptConditionListeners.listeners;
		for (var conditionName in conditions) {
			var condition = conditions[conditionName]
			winResults = condition.func.apply(condition.obj); //returns didWin, alert, priority (high takes precidence);
			didWin = Math.min(didWin, winResults.didWin);
			if (winResults.alert) {
				var priority = defaultTo(0, winResults.priority);
				if (priority>=priorities[Number(winResults.didWin)]) {
					alerts[Number(winResults.didWin)] = winResults.alert;
				}
			}	
		}	
		return {didWin:didWin, alert:alerts[didWin]};
	},
	sectionCleanUp: function(){
		var listeners = this.sectionCleanUpListeners.listeners;
		for (var listenerName in listeners) {
			var listener = listeners[listenerName];
			listener.func.apply(listener.obj);
		}
	},
	promptCleanUp: function(idx){
		var listeners = this['prompt' + idx + 'CleanUpListeners'].listeners;
		for (var listenerName in listeners) {
			var listener = listeners[listenerName];
			listener.func.apply(listener.obj);
		}
	},
}