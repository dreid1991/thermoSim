LevelTools = {
	setStds: function(){
		this.declarePrompts();
		this.addEqs();
		this.setDefaultPromptVals()
		this.graphs = {};
		this.eUnits = 'kJ';
		this.bgCol = Col(5, 17, 26);
		this.wallCol = Col(255,255,255);
		this.numUpdates = 0;
		this.wallSpeed = defaultTo(1, this.wallSpeed);
		this.makeListeners();
		this.promptIdx = -1;
		this.blockIdx = -1;
		this.data = {};
		dataHandler = new DataHandler();
		this.dataHandler = dataHandler;
		addListener(this, 'update', 'run', this.updateRun, this);
		addListener(this, 'data', 'run', this.dataRun, this);
		collide.setDefaultHandler({func:collide.impactStd, obj:collide})
		this.spcs = spcs;
	},
	addEqs: function(){
		for(var promptIdx=0; promptIdx<this.prompts.length; promptIdx++){
			var prompt = this.prompts[promptIdx];
			var title = prompt.title;
			var text = prompt.text;
			var quiz = prompt.quiz;
			if(title){prompt.title = addEqs(title);}
			if(text){prompt.text = addEqs(text);}
			if(quiz && quiz.options){
				for(optionIdx=0; optionIdx<quiz.options.length; optionIdx++){
					var option = quiz.options[optionIdx];
					for(optionElement in option){
						var element = option[optionElement];
						if(typeof(element)=='string'){
							option[optionElement] = addEqs(element);
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
	cutSceneStart: function(text, mode, quiz){
		this.inCutScene = true;
		$('#intText').html('');
		text = defaultTo('',text);
		
		this.pause();
		$('#dashRun').hide();
		if(mode===true && !quiz){
			$('#dashCutScene').show();
			$('#intText').html(text);
			$('#prompt').html('');
		}else if(mode=='intro'){
			$('#dashIntro').show();
			$('#base').hide();
			$('#intText').html(text);
		}else if(mode=='outro'){
			$('#dashOutro').show();
			$('#base').hide();
			$('#intText').html(text);
		}else if(quiz){
			$('#dashCutScene').show();
			$('#base').hide();
			this.appendQuiz(text, quiz, 'intText');
			
		}
		/*Hey, so if there's a quiz, I want to just pass the text along to the quiz handlers
		so if I do quiz stuff not in the cutscene, I want the text handling to be done the same way.
		Having two things capable of doing that seems weird
		
		*/
		$('#canvasDiv').hide();
		$('#display').show();

		$('#intText').show();
		
	},
	appendQuiz: function(text, quiz, appendTo){
		if(quiz.type == 'buttons') {
			this.appendButtons(text, quiz, appendTo)
		} else if (quiz.type == 'multChoice') {
			this.appendMultChoice(text, quiz, appendTo);
		} else if (quiz.type == 'text') {
			this.appendTextBox(text, quiz, appendTo, 3, 60);
		} else if (quiz.type == 'textSmall') {
			this.appendTextBox(text, quiz, appendTo, 1, 6);
		}
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
		$('#submitDiv').show();
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
	},
	/*
	type: 'buttons'
	options:list of buttons with: 	buttonId, text, isCorrect
			can have: 				func, message
	*/
	appendButtons: function(text, quiz, appendTo){
		var buttonHTML = '';
		var buttons = quiz.options;
		buttonHTML += defaultTo('', text);
		buttonHTML += "<br><center><table border='0'><tr>";
		for (var buttonIdx=0; buttonIdx<buttons.length; buttonIdx++){
			var button = buttons[buttonIdx];
			buttonHTML += "<td><button id='" + defaultTo(button.text.killWhiteSpace(), button.buttonId) + "' class='noSelect'>" + button.text + "</button></td>"
		}
		buttonHTML += "</tr></table></center>";
		$('#'+appendTo).html($('#intText').html() + buttonHTML);
		$('button').button();
		this.attachButtonListeners(buttons);
	},
	attachButtonListeners: function(buttons){
		for (var buttonIdx=0; buttonIdx<buttons.length; buttonIdx++){
			var button = buttons[buttonIdx];
			this.attachButtonListener(button);

		}		
	},
	attachButtonListener: function(button){
		var id = defaultTo(button.text.killWhiteSpace(), button.buttonId);
		var func = defaultTo(function(){}, button.func);
		if(button.message){
			func = extend(func, function(){alert(button.message)});
		}
		if (button.response) {
			store('block'+curLevel.blockIdx+'Prompt'+curLevel.promptIdx + 'Response', button.response);
		}
		if(button.isCorrect){
			func = extend(func, nextPrompt);
		}
		condFunc = 
			function(){
				var condResults = curLevel.conditions();
				if (condResults.didWin) {
					if (condResults.alert) {
						alert(condResults.alert);
					}
					func.apply(curLevel);
				} else {
					if (condResults.alert) {
						alert(condResults.alert);
					}
				}
			}
		buttonBind(id, condFunc);		
	},
	/*
	type: 'multChoice'
	list of options wit:	 text, isCorrect
	each option can have:	 message
	*/
	appendMultChoice: function(text, quiz, appendTo){
		var options = quiz.options
		var multChoiceHTML = "";
		multChoiceHTML += defaultTo('', text);
		multChoiceHTML += "<p></p><table width=100%<tr><td width=10%></td><td>";
		var idOptionPairs = new Array(options.length);
		for (var optionIdx=0; optionIdx<options.length; optionIdx++){
			var option = options[optionIdx];
			var divId = optionIdx;
			var uniqueTag = 0
			//while($('#response ' +divId + 'tag' +uniqueTag)){
			//	uniqueTag++;
			//}
			divId = 'response' + divId + 'tag' + uniqueTag;
			multChoiceHTML += "<div id='"+divId+"' class='multChoiceBlock'>"+option.text+"</div>";
			idOptionPairs[optionIdx] = {id:divId, option:option};
		}
		$('#'+appendTo).html($('#'+appendTo).html() + multChoiceHTML);
		this.bindMultChoiceFuncs(idOptionPairs);
	},
	bindMultChoiceFuncs: function(idOptionPairs){
		for (var optionIdx=0; optionIdx<idOptionPairs.length; optionIdx++){
			var id = idOptionPairs[optionIdx].id;
			var option = idOptionPairs[optionIdx].option;
			this.bindMultChoiceFunc(id, option);
		}
	},
	bindMultChoiceFunc: function(id, option){
		var checkFunc = function(){
			if(curLevel.conditions().didWin){
				if (option.message) {
					alert(option.message);
				}
				if (option.response) {
					store('block'+curLevel.blockIdx+'Prompt'+curLevel.promptIdx + 'Response', option.response);
				}
				if (option.isCorrect) {
					nextPrompt();
				}
			}
		}
		$('#'+id).click(checkFunc);
		$('#'+id).hover(
			function(){$(this).css('background-color', hoverCol.hex)}, 
			function(){$(this).css('background-color', 'transparent')}
		);
	},
	/*
	type: 'text'
	can have:			text, messageRight, messageWrong, answer, units
	*/
	appendTextBox: function(text, quiz, appendTo, rows, cols, units){
		var textBoxHTML = '';
		var boxText = defaultTo('Type your answer here.', quiz.text);
		textBoxHTML += text;
		textBoxHTML += '<br>';
		textBoxHTML += "<textarea id='answerTextArea' rows='" +rows+ "' cols='" +cols+ "' placeholder='"+boxText+"'></textarea>";
		if (quiz.units) {
			textBoxHTML += quiz.units;
		}
		textBoxHTML += "<table border=0><tr><td width=75%></td><td><button id='textAreaSubmit' class='noSelect'>Submit</button></td></tr></table></p>";
		var checkFunc = function() {
			if (curLevel.conditions().didWin) {
				if (quiz.answer) {
					var submitted = $('#answerTextArea').val();
					if(fracDiff(parseFloat(quiz.answer), parseFloat(submitted))<.05){
						if(quiz.messageRight){
							alert(quiz.messageRight);
						}
						store('userAnswerBlock'+curLevel.blockIdx+'Prompt'+curLevel.promptIdx, submitted);
						nextPrompt();
					}else{
						if(quiz.messageWrong){
							alert(quiz.messageWrong);
						}
					}
				}else{
					store('userAnswerBlock'+curLevel.blockIdx+'Prompt'+curLevel.promptIdx, submitted);
					nextPrompt();
				}
			}
		}
		$('#'+appendTo).html($('#'+appendTo).html() + textBoxHTML);
		$('button').button();
		buttonBind('textAreaSubmit', checkFunc);
	},
	/*
	conditions: function(){
		var prompt = this.prompts[this.promptIdx];
		var conditions = defaultTo(this['block'+this.blockIdx+'Conditions'], prompt.conditions);
		if(!conditions){
			return true;
		}else{
			var condResult = conditions.apply(this);
			
			if(condResult.alert){
				alert(condResult.alert);
			}
			return condResult.result;
		}
	
	},
	*/
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
	dataRun: function(){
		for (var datum in this.recordListeners.listeners){
			var recordInfo = this.recordListeners.listeners[datum];
			recordInfo.func.apply(recordInfo.obj);
			//this.data[datum].pushNumber(recordInfo.func.apply(recordInfo.obj));
		}	
		for(var graphName in this.graphs){
			if(this.graphs[graphName].active){
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
		for(var graphName in this.graphs){
			var saveName = graphName + 'block' + this.blockIdx + 'prompt' + this.promptIdx;
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
	makeListeners: function(){
		this.updateListeners = {listeners:{}, save:{}};
		this.wallMoveListeners = {listeners:{}, save:{}};
		this.dataListeners = {listeners:{}, save:{}};
		this.mousedownListeners = {listeners:{}, save:{}};
		this.mouseupListeners = {listeners:{}, save:{}};
		this.mousemoveListeners = {listeners:{}, save:{}};
		this.resetListeners = {listeners:{}, save:{}};
		this.initListeners = {listeners:{}, save:{}};	
		this.recordListeners = {listeners:{}, save:{}};
		this.conditionListeners = {listeners:{}, save:{}};
		this.cleanUpListeners = {listeners:{}, save:{}};
	},
	reset: function(){
		
		var curPrompt = this.prompts[this.promptIdx];
		if(curPrompt.cleanUp){
			curPrompt.cleanUp();
		}	
		this.cleanUp();
		
		dotManager.clearAll();	
		this.removeAllGraphs();
		for (resetListenerName in this.resetListeners.listeners){
			var func = this.resetListeners.listeners[resetListenerName].func;
			var obj = this.resetListeners.listeners[resetListenerName].obj;
			func.apply(obj);
		}
		
		if(this['block'+this.blockIdx+'Start']){
			this['block'+this.blockIdx+'Start']()
		}		

		
	},
	setDefaultPromptVals: function(){
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++){
			var prompt = this.prompts[promptIdx];
			prompt.finished = false;
			prompt.title = defaultTo('', prompt.title);
			prompt.text = defaultTo('', prompt.text);
		}
	},

	conditions: function(){
		//ALERT NOT BUBBLING UP CORRECTLY.  IT GETS TO THIS FUNCTION FROM STATE LISTENERS BUT IS NOT RETURNED
		var didWin = 1;
		var alerts = {1:undefined, 0:undefined};
		var priorities = {1:0, 0:0};
		for (var conditionName in this.conditionListeners.listeners){
			var condition = this.conditionListeners.listeners[conditionName]
			winResults = condition.func.apply(condition.obj); //returns didWin, alert, priority (high takes precidence);
			didWin = Math.min(didWin, winResults.didWin);
			if(winResults.alert){
				var priority = defaultTo(0, winResults.priority);
				if(priority>=priorities[Number(winResults.didWin)]){
					alerts[Number(winResults.didWin)] = winResults.alert;
				}
			}	
		}	
		return {didWin:didWin, alert:alerts[didWin]};
	},
	cleanUp: function(){
		for (var cleanUpListener in this.cleanUpListeners.listeners){
			var listener = this.cleanUpListeners.listeners[cleanUpListener];
			listener.func.apply(listener.obj);
		}
	},
}