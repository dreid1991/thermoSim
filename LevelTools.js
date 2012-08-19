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

	changeWallSetPt: function(wallInfo, dest, compType, speed){
		var wallIdx = walls.idxByInfo(wallInfo);
		var wall = walls[wallIdx]
		var wallMoveMethod;
		if(compType.indexOf('isothermal')!=-1){
			var wallMoveMethod = 'cVIsothermal';
		} else if (compType.indexOf('adiabatic')!=-1){
			var wallMoveMethod = 'cVAdiabatic';
		}
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var y = wall[0].y
		var dist = dest-y;
		if(dist!=0){
			var sign = getSign(dist);
			var speed = defaultTo(this.wallSpeed, speed);
			wall.v = speed*sign;
			walls.setSubWallHandler(wallIdx, 0, wallMoveMethod + compAdj);
			addListener(curLevel, 'update', 'moveWall'+wallInfo,
				function(){
					var y = wall[0].y
					setY(boundedStep(y, dest, wall.v))
					walls.setupWall(wallIdx);
					if(round(y,2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall' + wallInfo);
						walls.setSubWallHandler(wallIdx, 0, 'staticAdiabatic');
						wall.v = 0;
					}
				},
			this);
		}
	},
	move: function(){
		var spcLocal = this.spcs;
		for (var spcName in spcLocal){
			var dots = spcLocal[spcName];
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
		if(quiz.type == 'buttons'){
			this.appendButtons(text, quiz, appendTo)
		}else if (quiz.type == 'multChoice'){
			this.appendMultChoice(text, quiz, appendTo);
		}else if (quiz.type == 'text'){
			this.appendTextBox(text, quiz, appendTo);
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
		emptyListener(this, "update");
		emptyListener(this, "data");
	},//COULD ALSO DO LIKE 'SAVE/LOAD BY TYPE' FOR ANIM TEXT, ARROW
	resume: function(){
		loadListener(this, 'update');
		loadListener(this, 'data');
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
			buttonHTML += "<td><button id='" + button.buttonId + "' class='noSelect'>" + button.text + "</button></td>"
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
		var id = button.buttonId;
		var func = defaultTo(function(){}, button.func);
		if(button.message){
			func = extend(func, function(){alert(button.message)});
		}
		if(button.isCorrect){
			func = extend(func, nextPrompt);
		}
		condFunc = 
			function(){
				if(curLevel.checkConditions()){
					func.apply(curLevel);
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
			if(curLevel.checkConditions()){
				if(option.message){
					alert(option.message);
				}
				if(option.isCorrect){
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
	can have:			text, messageRight, messageWrong, answer
	*/
	appendTextBox: function(text, quiz, appendTo){
		var textBoxHTML = '';
		var boxText = defaultTo('Type your answer here.', quiz.text);
		textBoxHTML += text;
		textBoxHTML += '<br>';
		textBoxHTML += "<textarea id='answerTextArea' rows='3' cols='60'>" + boxText + "</textarea>";
		textBoxHTML += "<table border=0><tr><td width=75%></td><td><button id='textAreaSubmit' class='noSelect'>Submit</button></td></tr></table></p>";
		var checkFunc = function(){
			if(curLevel.checkConditions()){
				if(quiz.answer){
					var submitted = $('#answerTextArea').val();
					if(fracDiff(parseFloat(quiz.answer), parseFloat(submitted))<.05){
						if(quiz.messageRight){
							alert(quiz.messageRight);
						}
						nextPrompt();
					}else{
						if(quiz.messageWrong){
							alert(quiz.messageWrong);
						}
					}
				}else{
					nextPrompt();
				}
			}
		}
		$('#'+appendTo).html($('#'+appendTo).html() + textBoxHTML);
		$('button').button();
		buttonBind('textAreaSubmit', checkFunc);
	},
	checkConditions: function(){
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
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
		$('#dashCutScene').hide();
	},
	borderStd: function(info){
		info = defaultTo({}, info);
		var wall = defaultTo('container', info.wallInfo);
		
		walls[wall].border([1,2,3,4], 5, this.wallCol.copy().adjust(-100,-100,-100), [{y:info.min}, {}, {}, {y:info.min}]);
	},

	update: function(){
		this.numUpdates++;
		turn++;
		for (var updateListener in this.updateListeners.listeners){
			var listener = this.updateListeners.listeners[updateListener]
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
			this.data[datum].push(recordInfo.func.apply(recordInfo.obj));
		}	
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},
	updateRun: function(){
		this.move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	
	updateGraphs: function(){
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
	},
	clearGraphs: function(){
		for (var graphName in this.graphs){
			this.graphs[graphName].clear();
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
	trackVolumeStart: function(decPlaces){
		decPlaces = defaultTo(1, decPlaces);
		this.readout.addEntry('vol', 'Volume:', 'L', dataHandler.volume(), undefined, decPlaces);
		addListener(curLevel, 'update', 'trackVolume',
			function(){
				this.readout.hardUpdate('vol',dataHandler.volume());
			},
		this);
	},
	trackVolumeStop: function(){
		this.readout.removeEntry('vol');
		removeListener(curLevel, 'update', 'trackVolume');
	},
	trackIntPressureStart: function(handle){
		this.data['pInt'+handle] = [];
		var dataList = this.data['pInt'+handle]
		var wall = walls[handle];
		wall.forceInternal = 0;
		wall.pLastRecord = turn;
		addListener(curLevel, 'data', 'trackIntPressure'+handle,
			function(){
				dataList.push(wall.pInt());
			},
		'');
		
	},
	trackIntPressureStop: function(handle){
		removeListener(curLevel, 'data', 'trackIntPressure'+handle);
	},
	trackTempStart: function(handle, label, dataSet, decPlaces){
		decPlaces = defaultTo(0, decPlaces);
		dataSet = defaultTo(this.data.t, dataSet);
		label = defaultTo('Temp:', label);
		handle = defaultTo('temp', handle);
		this.readout.addEntry(handle, label, 'K', dataSet[dataSet.length-1], undefined, decPlaces);
		addListener(curLevel, 'data', 'trackTemp' + handle,
			function(){
				this.readout.tick(handle, dataSet[dataSet.length-1]);
			},
		this);	
	},
	trackTempStop: function(handle){
		handle = defaultTo('temp', handle)
		this.readout.removeEntry(handle);
		removeListener(curLevel, 'data', 'trackTemp' + handle);
	},
	trackStart: function(handle, label, data, decPlaces, units){
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
	makeListeners: function(){
		this.updateListeners = {listeners:{}, save:{}};
		this.dataListeners = {listeners:{}, save:{}};
		this.mousedownListeners = {listeners:{}, save:{}};
		this.mouseupListeners = {listeners:{}, save:{}};
		this.mousemoveListeners = {listeners:{}, save:{}};
		this.resetListeners = {listeners:{}, save:{}};
		this.initListeners = {listeners:{}, save:{}};	
		this.recordListeners = {listeners:{}, save:{}};
	},
	reset: function(){
		
		var curPrompt = this.prompts[this.promptIdx];
		if(this['block'+this.blockIdx+'CleanUp']){
			this['block'+this.blockIdx+'CleanUp']()
		}
		if(curPrompt.cleanUp){
			curPrompt.cleanUp();
		}	
		for (var spcName in spcs){
			spcs[spcName].depopulate();
		}		
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
	}
}