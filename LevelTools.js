LevelTools = {
	setStds: function(){
		this.addEqs();
		this.setDefaultPromptVals()
		this.graphs = {};
		this.makePromptCleanUpHolders(0);
		this.quiz = [];
		this.eUnits = 'kJ';
		this.bgCol = Col(5, 17, 26);
		this.wallCol = Col(255,255,255);
		this.numUpdates = 0;
		this.wallSpeed = defaultTo(1, this.wallSpeed);
		this.makeListenerHolders();
		dataHandler = new DataHandler();
		this.dataHandler = dataHandler;
		addListener(this, 'update', 'run', this.updateRun, this);
		addListener(this, 'data', 'run', this.dataRun, this);
		
		this.spcs = spcs;
	},
	addEqs: function(){
		for (var blockIdxLocal=0; blockIdxLocal<this.blocks.length; blockIdxLocal++) {
			var block = this.blocks[blockIdxLocal];
			for (var promptIdxLocal=0; promptIdxLocal<block.prompts.length; promptIdxLocal++) {
				var prompt = block.prompts[promptIdxLocal];
				var title = prompt.title;
				var text = prompt.text;
				var quiz = prompt.quiz;
				if(title){prompt.title = addEqs(title);}
				if(text){prompt.text = addEqs(text);}
				if (quiz) {
					for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
						var question = quiz[questionIdx];
						if (question.options){
							for (optionIdx=0; optionIdx<question.options.length; optionIdx++) {
								var option = question.options[optionIdx];
								for (optionElement in option) {
									var element = option[optionElement];
									if (typeof(element)=='string') {
										option[optionElement] = addEqs(element);
									}						
								}
							}
						}
					}
				}
			}
		}
	},

	move: function(){
		var spcLocal = this.spcs;
		for (var spcName in spcLocal){
			var dots = spcLocal[spcName].dots;
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				dots[dotIdx].x += dots[dotIdx].v.dx;
				dots[dotIdx].y += dots[dotIdx].v.dy;
			}
		}
	},
	checkDotHits: function(){
		collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},
	cutSceneStart: function(text, mode, quiz) {
		addListener(curLevel, 'prompt' + promptIdx + 'CleanUp', 'endCutScene',
			function() {
				this.cutSceneEnd()
			},
		this);
		
		this.inCutScene = true;
		$('#intText').html('');
		text = defaultTo('',text);
		
		this.pause();
		$('#dashRun').hide();
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
			this.appendQuiz(quiz, 'intText');
		}
		$('#canvasDiv').hide();
		$('#display').show();

		this.cutSceneDivShow();
		
	},
	appendQuiz: function(quiz, appendTo) {
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
		for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
			var question = quiz[questionIdx];
			if (question.type == 'text' || question.type == 'textSmall') {
				makeSubmitButton = true;
			}
			this.appendQuestion(question, appendTo, questionIdx, appendTo);
		}
		//Okay, this quiz structure needs work
		if (makeSubmitButton) {
			this.makeSubmitButton(appendTo);
		}
		$('button').button();
	},
	makeSubmitButton: function(appendTo) {
		var self = this;
		var onclickSubmit = function() {
			for (var questionIdx=0; questionIdx<self.quiz.length; questionIdx++) {
				var question = self.quiz[questionIdx];
				if (question.type=='text' || question.type=='textSmall') {
					var id = self.getTextAreaId(questionIdx);
					var submitted = $('#'+id).val();
					if (submitted.killWhiteSpace()!='') {
						store('userAnswerB'+blockIdx+'P'+promptIdx+'Q'+questionIdx, submitted);
						question.answerText(submitted);
						question.isAnswered = true;
						if (question.answer) {
							if (fracDiff(parseFloat(question.answer), parseFloat(submitted))<.05){
								question.correct = true;
							} else {
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
			//Hey - am not finished making it so you can cleany mix type of questions yet
			nextPrompt();
		}
		var idButton = 'textAreaSubmit';
		submitHTML = "<table border=0><tr><td width=75%></td><td><button id='" + idButton + "' class='noSelect'>Submit</button></td></tr></table>";
		$('#'+appendTo).html($('#'+appendTo).html() + submitHTML);
		buttonBind(idButton, onclickSubmit);
	},
	appendQuestion: function(question, appendTo, questionIdx, appendTo){
		question.answered = false;
		question.correct = false;
		if (question.type == 'buttons') {
			this.appendButtons(question, appendTo, questionIdx);
		} else if (question.type == 'multChoice') {
			this.appendMultChoice(question, appendTo, questionIdx);
		} else if (question.type == 'text') {
			this.appendTextBox(question, appendTo, 3, 60, question.units, questionIdx);
		} else if (question.type == 'textSmall') {
			this.appendTextBox(question, appendTo, 1, 6, question.units, questionIdx);
		}
		this.quiz[questionIdx] = question;
	},
	cutSceneDivShow: function() {
		$('#intText').show();
	},
	cutSceneText: function(text){
		$('#intText').html(text);
	},
	cutSceneEnd: function(){
		this.inCutScene = false;
		this.resume();
		$('#intText').html('');
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
	pause: function(){
		saveListener(this, 'update');
		saveListener(this, 'data');
		saveListener(this, 'wallMove');
		saveListener(this, 'mousedown');
		saveListener(this, 'mouseup');
		saveListener(this, 'mousemove');
		emptyListener(this, "update");
		emptyListener(this, "data");
		emptyListener(this, 'wallMove');
		emptyListener(this, 'mousedown');
		emptyListener(this, 'mouseup');
		emptyListener(this, 'mousemove');
	},//COULD ALSO DO LIKE 'SAVE/LOAD BY TYPE' FOR ANIM TEXT, ARROW
	resume: function(){
		loadListener(this, 'update');
		loadListener(this, 'data');
		loadListener(this, 'wallMove');
		loadListener(this, 'mousedown');
		loadListener(this, 'mouseup');
		loadListener(this, 'mousemove');
		emptySave(this, 'update');
		emptySave(this, 'data');
		emptySave(this, 'wallMove');
		emptySave(this, 'mousedown');
		emptySave(this, 'mouseup');
		emptySave(this, 'mousemove');
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
		//Hey - you are setting attrs of the question object.  This will alter the thing the blocks declaration.  I think that is okay, just letting you know
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
			buttonHTML += "<td><button id='" + ids[buttonIdx] + "' class='noSelect'>" + button.text + "</button></td>"
		}
		buttonHTML += "</tr></table></center>";
		$('#'+appendTo).html($('#intText').html() + buttonHTML);
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
				store('B'+blockIdx+'P'+promptIdx + 'Response', button.response);
			}
			if (button.func) {
				button.func();
			}
			question.isAnswered = true;
			question.correct = button.isCorrect;
			nextPrompt();		
		}

		buttonBind(id, onclickFunc);		
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
			multChoiceHTML += "<div id='"+ids[optionIdx]+"' class='multChoiceBlock'>"+option.text+"</div>";
		}
		$('#'+appendTo).html($('#'+appendTo).html() + multChoiceHTML);
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
				store('B'+blockIdx+'P'+promptIdx + 'Response', option.response);
			}
			if (option.func) {
				option.func();
			}
			question.correct = option.isCorrect;
			question.isAnswered = true;
			//do something to accomidate multiple questions at some point.  Not likely to have multiple now
			nextPrompt();
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
		textBoxHTML += '<br>';
		textBoxHTML += question.label;
		if (cols>20) {
			textBoxHTML += '<br>';
		}
		textBoxHTML += "<textarea id='"+idText+"' rows='" +rows+ "' cols='" +cols+ "' placeholder='"+boxText+"'></textarea>";
		if (question.units) {
			textBoxHTML += question.units;
		}
		$('#'+appendTo).html($('#'+appendTo).html() + textBoxHTML);
	},
	getTextAreaId: function(idx) {
		return 'textArea' + idx;
	},
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
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
		addListener(curLevel, 'data', 'run', function() {
			this.dataRunNoGraphs();
			addListener(curLevel, 'data', 'run', this.dataRun, this);
		},
		this);
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
				this.graphs[graphName].addLast();
			}
		}
	},
	updateRun: function(){
		this.move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
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
		//OOH - made load graphs by block/prompt idx
		for (var graphName in this.graphs) {
			var saveName = graphName + 'block' + blockIdx + 'prompt' + promptIdx;
			this.graphs[graphName].save(saveName);
		}
	},
	freezeAllGraphs: function(){
		for(var graphName in this.graphs){
			this.graphs[graphName].freeze();
		}
	},

/*
CONVERT THIS STUFF TO RECORD/DISPLAY
	track: function(handle, label, data, decPlaces, units){
		decPlaces = defaultTo(1, decPlaces);
		if(typeof(data)=='Array'){
			this.readout.addEntry(handle, label, units, data[data.length-1], undefined, decPlaces);
			addListener(curLevel, 'data', 'track'+handle,
				function(){
					this.readout.tick(handle, data[data.length-1]);
				},
			this);
		}else if (typeof(data)=='function'){
			this.readout.addEntry(handle, label, units, data(), undefined, decPlaces);
			addListener(curLevel, 'data', 'track'+handle,
				function(){
					this.readout.tick(handle, data());
				},
			this);		
		}
	},
	trackStop: function(handle){
		removeListener(curLevel, 'data', 'track' + handle);
	},
	trackExtentRxnStart: function(handle, rxnInfo){
		var spcsLocal = spcs;
		var NLOCAL = N;
		var initVals = new Array(rxnInfo.length);
		this.data['extent' + handle] = [];
		for (var compIdx=0; compIdx<rxnInfo.length; compIdx++){
			var compInfo = rxnInfo[compIdx];
			var initCount = spcsLocal[compInfo.spc].length;
			compInfo.init = initCount;

		}
		addListener(curLevel, 'data', 'trackExtentRxn' + handle,
			function(){
				var extent = Number.MAX_VALUE;
				for (var compIdx=0; compIdx<rxnInfo.length; compIdx++){
					var compInfo = rxnInfo[compIdx];
					var init = compInfo.init;
					var cur = spcsLocal[compInfo.spc].length;
					var coeff = compInfo.coeff;
					//HEY - coeff MUST BE NEGATIVE IF THING IS BEING CONSUMED
					extent = Math.min(extent, (cur-init)/(coeff*NLOCAL));
				}
				this.data['extent' + handle].push(extent);
			},
		this);
	},
	trackExtentRxnStop: function(handle){
		removeListener(curLevel, 'data', 'trackExtentRxn' + handle);
	},
	*/
	makeListenerHolders: function(){
		this.makeListenerHolder('update');
		this.makeListenerHolder('wallMove');
		this.makeListenerHolder('data');
		this.makeListenerHolder('mousedown');
		this.makeListenerHolder('mouseup');
		this.makeListenerHolder('mousemove');
		this.makeListenerHolder('init');
		this.makeListenerHolder('record');
		this.makeListenerHolder('blockCondition');
		this.makeListenerHolder('promptCondition');
		this.makeListenerHolder('blockCleanUp');
	},
	makeListenerHolder: function(name) {
		this[name + 'Listeners'] = {listeners:{}, save:{}};
		return this[name + 'Listeners'];
	},
	makePromptCleanUpHolders: function(newBlockIdx){
		var block = this.blocks[newBlockIdx];
		this.promptCleanUpHolders = new Array(block.prompts.length);
		for (var promptIdx=0; promptIdx<block.prompts.length; promptIdx++) {
			this.promptCleanUpHolders[promptIdx] = this.makeListenerHolder('prompt' + promptIdx + 'CleanUp');
		}
	},
	reset: function(){
		showPrompt(blockIdx, promptIdx, true);		
	},
	setDefaultPromptVals: function(){
		for (var blockIdxLocal=0; blockIdxLocal<this.blocks.length; blockIdxLocal++) {
			var block = this.blocks[blockIdxLocal];
			for (var promptIdxLocal=0; promptIdxLocal<block.prompts.length; promptIdxLocal++) {
				var prompt = block.prompts[promptIdxLocal];
				prompt.finished = false;
				prompt.title = defaultTo('', prompt.title);
				prompt.text = defaultTo('', prompt.text);	
			}
		}
	},

	blockConditions: function(){
		//ALERT NOT BUBBLING UP CORRECTLY.  IT GETS TO THIS FUNCTION FROM STATE LISTENERS BUT IS NOT RETURNED
		var didWin = 1;
		var alerts = {1:undefined, 0:undefined};
		var priorities = {1:0, 0:0};
		var conditions = this.blockConditionListeners.listeners
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
	blockCleanUp: function(){
		var listeners = this.blockCleanUpListeners.listeners;
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