/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

LevelTools = {
	setStds: function(){
		this.graphs = {};
		this.bgCol = Col(5, 17, 26);
		this.wallCol = Col(255,255,255);
		this.numUpdates = 0;
		this.wallSpeed = defaultTo(1, this.wallSpeed);
		this.makeListenerHolders();
		this.auxs = {};
		this.attracting = false;
		this.gravitying = false;
		this.setUpdateRunListener();
		addListener(this, 'data', 'run', this.dataRun, this);

	},
	// foreachQuestion: function(cb, prompts, idObj) {
		// for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
			// var quiz = prompts[promptIdx].quiz;
			// if (quiz) {
				// for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
					// var question = quiz[questionIdx];
					// cb(question, idObj);
				// }
			// }
		// }
	// },
	// foreachPrompt: function(cb, section, idObj) {
		// var prompts = section.prompts;
		// if (!prompts) console.log('A section is missing prompts');
		
	// },
	addStoreAs: function(sections) {
		var storeAs=0;
		for (var sectionIdx=0; sectionIdx<sections.length; sectionIdx++) {
			var section = sections[sectionIdx];
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
	addImgsAndQuestionIds: function(sections, questionId) {
		for (var sectionIdx=0; sectionIdx<sections.length; sectionIdx++) {
			var section = sections[sectionIdx];
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
		return questionId;
	},
	transferObjCleanUp: function(sections) {
		for (var sectionIdx=0; sectionIdx<sections.length; sectionIdx++) {
			var section = sections[sectionIdx];
			if (section.sceneData) {
				this.transferObjDataCleanUp(section.sceneData.objs);
			}
			for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
				var prompt = section.prompts[promptIdx];
				if (prompt.sceneData) {
					this.transferObjDataCleanUp(prompt.sceneData.objs);
				}
			}
		}		
	},
	transferObjDataCleanUp: function(objData) {
		if (objData) {
			for (var i=0; i<objData.length; i++) {
				var objDatum = objData[i];
				if (objDatum.attrs.cleanUpWith && !objDatum.cleanUpWith) {
					objDatum.cleanUpWith = objDatum.attrs.cleanUpWith;
				}
			}
		}
	},
	addTriggerCleanUp: function(sections) {
		for (var sIdx=0; sIdx<sections.length; sIdx++) {
			var s = sections[sIdx];
			if (s.sceneData) {
				this.addTriggerDataCleanUp(s.sceneData.triggers);
			}
			for (var pIdx=0; pIdx<s.prompts.length; pIdx++) {
				var p = s.prompts[pIdx];
				if (p.sceneData) {
					this.addTriggerDataCleanUp(p.sceneData.triggers);
				}
			}
		}
	},
	addTriggerDataCleanUp: function(triggers) {
		triggers = triggers || [];
		for (var i=0; i<triggers.length; i++) {
			var trigger = triggers[i];
			if (!trigger.cleanUpWith) {
				if (trigger.requiredFor && trigger.requiredFor != 'now') {
					trigger.cleanUpWith = trigger.requiredFor;
				}
			}
		}
	},
	setDefaultPromptVals: function(sections){
		for (var sectionIdxLocal=0; sectionIdxLocal<sections.length; sectionIdxLocal++) {
			var section = sections[sectionIdxLocal];
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
			var spc = new Species(def.spcName, def.m, def.r, def.col, defIdx, def.cv, def.hF298, def.hVap298, def.sF298, def.antoineCoeffs, def.cpLiq, def.spcVolLiq, dotManager);
			target[def.spcName] = spc;
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

	update: function(){
		this.numUpdates++;
		turn++;
		this.updateRun();
		for (var updateListener in this.updateListeners){
			var listener = this.updateListeners[updateListener];
			listener.func.apply(listener.obj);
		}
		for (var wallMoveListener in this.wallMoveListeners){
			var listener = this.wallMoveListeners[wallMoveListener];
			listener.func.apply(listener.obj);
		}
	},
	updateData: function(){

		for (var dataListener in this.dataListeners){
			var listener = this.dataListeners[dataListener];
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
		}, 50);
	},
	dataRunNoGraphs: function() {
		for (var datum in this.recordListeners){
			var recordInfo = this.recordListeners[datum];
			recordInfo.func.apply(recordInfo.obj);
			//this.data[datum].pushNumber(recordInfo.func.apply(recordInfo.obj));
		}			
	},
	dataRun: function() {
		for (var datum in this.recordListeners){
			var recordInfo = this.recordListeners[datum];
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
		for (var wallIdx=0; wallIdx<walls.length; wallIdx++) {
			walls[wallIdx].setHitMode('Gravity');
		}
		this.setUpdateRunListener();

		//need to make add this as a span with gravityStop as the remove func
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
		//need to make add this as a span with gravityStop as the remove func
		this.attracting = true;
		attractor.setup();
		attractor.assignELastAll();
		this.setUpdateRunListener();
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
		makeListenerHolder(this, 'setup');
	},
}