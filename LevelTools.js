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
	addImgs: function(levelData) {
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
		// addListener(window['curLevel'], 'prompt' + promptIdx + 'CleanUp', 'endCutScene',
			// function() {
				// this.cutSceneEnd()
			// },
		// this);
		
		this.inCutScene = true;
		$('#intText').html('');
		text = defaultTo('',text);
		
		this.pause();
		$('#dashRunWrapper').hide();
		$('#buttonManager').hide();
		if (mode===true && !quiz) {
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
		} else if (quiz) {
			$('#dashCutScene').show();
			$('#base').hide();
			this.cutSceneText(text);
			this.appendQuiz(quiz, $('#intText'));
		}
		$('#canvasDiv').hide();
		$('#display').show();

		this.cutSceneDivShow();
		
	},
	appendQuiz: function(quiz, appendTo) {
		$(appendTo).append(templater.br());
		var wrapperHTML = templater.div({attrs: {id: ['quizWrapper']}, style: {display: 'inline-block'}});
		var contentHTML = templater.div({attrs: {id: ['quizContent'], 'class': ['niceFont', 'whiteFont']}});
		var footerHTML = templater.div({attrs: {id: ['quizFooter']}});

		$(appendTo).append(wrapperHTML);
		var wrapper = $('#quizWrapper');
		$(quizWrapper).append(contentHTML);
		$(quizWrapper).append(footerHTML);
		
		var content = $('#quizContent');
		var footer = $('#quizFooter');
		
		var makeSubmitButton = false;
		this.quiz = new Array(quiz.length);
		this.quiz.allAnswered = function() {
			for (var qIdx=0; qIdx<this.length; qIdx++) {
				if (!this[qIdx].isAnswered) {
					return 0;
				}
			}
			return 1;
		}
		var hideDir = true;
		for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
			var question = quiz[questionIdx];
			if (question.type == 'text' || question.type == 'textSmall') {
				var submitAdvance = true;
			} else if (question.type == 'setVals') {
				var submitSetVal = true;
				hideDir = false;
			}
			this.appendQuestion(question, content, questionIdx);
		}
		//Okay, this quiz structure needs work
		hideDir ? $('#nextPrevDiv').hide() : $('#nextPrevDiv').show()
		if (submitAdvance) {
			this.makeSubmitButton(footer, this.submitAdvanceFunc(), 'Submit');
		} else if (submitSetVal) {
			this.makeSubmitButton(footer, this.submitSetValFunc(), 'Set values');
		}
	},
	makeSubmitButton: function(appendTo, func, text) {
		var self = this;
		var onclickSubmit = func;
		var idButton = 'textAreaSubmit';
		var submitHTML = templater.button({attrs:{id: [idButton]}, style: {'float': 'right'}, innerHTML: text});
		$(appendTo).append(submitHTML);
		$('#' + idButton).click(onclickSubmit);
		addJQueryElems($('#' + idButton), 'button');
	},
	submitAdvanceFunc: function() {
		var self = this;
		return function() {
			self.storeText();
			//Hey - am not finished making it so you can cleany mix type of questions yet
			sceneNavigator.nextPrompt();
		}	
	},
	submitSetValFunc: function() {
		var self = this;
		return function() {
			self.storeText();
			S(sectionIdx, promptIdx, true);
		}
	},
	storeText: function() {
		for (var questionIdx=0; questionIdx<this.quiz.length; questionIdx++) {
			var question = this.quiz[questionIdx];
			if (question.type=='text' || question.type=='textSmall' || question.type == 'setVals') {
				var id = this.getTextAreaId(questionIdx);
				var storeAs = $('#' + id).attr('storeAs');
				var submitted = $('#' + id).val();
				if (submitted.killWhiteSpace() != '') {
					if (storeAs === undefined) storeAs = 'ansS'+sectionIdx+'P'+promptIdx+'Q'+questionIdx;
					store(storeAs, submitted);
					question.answerText(submitted);
					question.isAnswered = true;
					if (question.answer) {
						if (fracDiff(parseFloat(question.answer), parseFloat(submitted))<.05){
							question.correct = true;
						} else {
							if (question.messageWrong) {
								alert(interpreter.interpInput(question.messageWrong));
							}
							question.correct = false;
						}
					} else {
						question.correct = true;
					}
				} else {
					question.correct = false;
					question.isAnswered = false
				}
			}
		
		}	
	},
	appendQuestion: function(question, appendTo, questionIdx){
		question.answered = false;
		question.correct = false;
		if (question.type == 'buttons') {
			this.appendButtons(question, appendTo, questionIdx);
		} else if (question.type == 'multChoice') {
			this.appendMultChoice(question, appendTo, questionIdx);
		} else if (question.type == 'text') {
			this.appendTextBox(question, appendTo, 3, 50, question.units, questionIdx);
		} else if (question.type == 'textSmall') {
			this.appendTextBox(question, appendTo, 1, 10, question.units, questionIdx);
		} else if (question.type == 'setVals') {
			this.appendTextBox(question, appendTo, 1, 10, question.units, questionIdx);
		}
		this.quiz[questionIdx] = question;
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
	questionIsCorrect: function() {
		return this.correct;
	},
	/*
	type: 'buttons'
	options:list of buttons with: 	buttonId, text, isCorrect
			can have: 				func, message
	*/
	appendButtons: function(question, appendTo, questionIdx){
		var buttonHTML = '';
		//Hey - you are setting attrs of the question object.  This will alter the thing the sections declaration.  I think that is okay, just letting you know
		question.isAnswered = false;
		question.isCorrect = this.questionIsCorrect;//function() {
			//return question.correct;
		//}
		var buttons = question.options;
		buttonHTML += "<br><center><table border='0'><tr>";
		var ids = new Array(buttons.length);
		for (var buttonIdx=0; buttonIdx<buttons.length; buttonIdx++){
			var button = buttons[buttonIdx];
			ids[buttonIdx] = defaultTo('question' + questionIdx + 'option' + buttonIdx, button.buttonId);
			buttonHTML += "<td>" + templater.button({attrs:{id: [ids[buttonIdx]]}, innerHTML:button.text}) + "</td>";
		}
		buttonHTML += "</tr></table></center>";
		$(appendTo).append(buttonHTML);
		this.bindButtonListeners(question, buttons, ids);
	},
	bindButtonListeners: function(question, buttons, ids){
		for (var buttonIdx=0; buttonIdx<buttons.length; buttonIdx++){
			var button = buttons[buttonIdx];
			this.bindButtonListener(question, button, ids[buttonIdx]);

		}		
	},
	bindButtonListener: function(question, button, id){
		var onclickFunc = function() {
			if (button.message) {
				alert(button.message);
			}
			if (button.response) {
				store('B'+sectionIdx+'P'+promptIdx + 'Response', button.response);
			}
			if (button.func) {
				button.func();
			}
			question.isAnswered = true;
			question.correct = button.isCorrect;
			sceneNavigator.nextPrompt();		
		}
		$('#' + id).click(onclickFunc);
	},
	/*
	type: 'multChoice'
	list of options with:	 text, isCorrect
	each option can have:	 message
	*/
	appendMultChoice: function(question, appendTo, questionIdx){
		question.answerIs = false;
		question.isCorrect = this.questionIsCorrect;//function() {
			//return question.correct;
		//}		
		var options = question.options
		var multChoiceHTML = "";
		multChoiceHTML += "<br><table width=100%<tr><td width=10%></td><td>";
		var ids = new Array(options.length);
		for (var optionIdx=0; optionIdx<options.length; optionIdx++){
			var option = options[optionIdx];
			var divId = optionIdx;
			ids[optionIdx] = 'question' + questionIdx + 'option' + optionIdx;
			multChoiceHTML += templater.div({attrs: {id: [ids[optionIdx]], class: ['multChoiceBlock']}, innerHTML: option.text})
		}
		$(appendTo).append(multChoiceHTML);
		this.bindMultChoiceFuncs(question, options, ids);
	},
	bindMultChoiceFuncs: function(question, options, ids){
		for (var optionIdx=0; optionIdx<options.length; optionIdx++) {
			this.bindMultChoiceFunc(question, options[optionIdx], ids[optionIdx]);
		}
	},
	bindMultChoiceFunc: function(question, option, id){
		var onclickFunc = function() {
			if (option.message) {
				alert(option.message);
			}
			if (option.response) {
				store('B'+sectionIdx+'P'+promptIdx + 'Response', option.response);
			}
			question.correct = option.isCorrect;
			question.isAnswered = true;
			//do something to accomidate multiple questions at some point.  Not likely to have multiple now
			sceneNavigator.nextPrompt();
		}
		$('#'+id).click(onclickFunc);
		$('#'+id).hover(
			function(){$(this).css('background-color', hoverCol.hex)}, 
			function(){$(this).css('background-color', 'transparent')}
		);
	},
	/*
	type: 'text'
	can have:			text, messageRight, messageWrong, answer, units
	*/
	appendTextBox: function(question, appendTo, rows, cols, units, questionIdx){
		var textBoxHTML = '';
		question.answerIs = false;
		question.answerText = function(text) {
			question.answerTextSubmitted = text;
		}
		question.isCorrect = this.questionIsCorrect;
		question.label = defaultTo('', question.label);
		var idText = this.getTextAreaId(questionIdx);
		var boxText = defaultTo('Type your answer here.', question.text);
		
		var textareaAttrs = {id: [idText], rows: [rows], cols: [cols] , placeholder: [boxText]};
		if (question.storeAs) textareaAttrs.storeAs = [question.storeAs];
		textareaHTML = templater.textarea({attrs: textareaAttrs});
		
		var textBoxHTML = (question.preText === undefined ? '' : (interpreter.interp(question.preText) + templater.br())) + templater.table({attrs: {'class': ['niceFont', 'whiteFont']}, innerHTML:
			templater.tr({innerHTML:
				templater.td({innerHTML:
					question.label
				}) +
				templater.td({innerHTML:
					'&#32;&#32;'
				}) +
				templater.td({innerHTML:
					textareaHTML
				}) +
				templater.td({innerHTML:
					question.units || ''
				})
			})
		})

		$(appendTo).append(textBoxHTML);
	},
	getTextAreaId: function(idx) {
		return 'textArea' + idx;
	},
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRunWrapper').hide();
		$('#dashOutro').hide();
		$('#dashCutScene').hide();
	},
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
	dataRun: function(){
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