function SceneNavigator() {

}
SceneNavigator.prototype = {
	showPrompt: function(newSectionIdx, newPromptIdx, forceReset){
		var newSection = window['curLevel'].sections[newSectionIdx];
		var newPrompt = newSection.prompts[newPromptIdx];
		var changedSection = newSectionIdx!=sectionIdx;
		var promptIdxsToClean = this.getpromptIdxsToClean(newSectionIdx, newPromptIdx);
		
		promptIdxsToClean.map(function(value, idx){
			curLevel.promptCleanUp(idx);
		})
		
		
		//emptyListener(curLevel, 'promptCleanUp');
		emptyListener(curLevel, 'promptCondition');
		if (changedSection) {
			curLevel.makePromptCleanUpHolders(newSectionIdx);
		}
		if (changedSection || forceReset) {
			curLevel.saveAllGraphs();
			curLevel.freezeAllGraphs();
			curLevel.removeAllGraphs();
			dotManager.clearAll();		

			curLevel.sectionCleanUp();
			
			emptyListener(curLevel, 'sectionCleanUp');
			emptyListener(curLevel, 'sectionCondition');
			//attn - once setup is out of use, remove the condition that checks for it
			if (newSection.setup) {
				renderer.render(newSection.setup);
			} else {
				renderer.render(newSection.sceneData);
			}

			
			addListener(curLevel, 'sectionCleanUp', 'removeArrowAndText',
				function(){
					removeListenerByName(curLevel, 'update', 'drawArrow');
					removeListenerByName(curLevel, 'update', 'animText');
				},
			this);
			curLevel.delayGraphs();
		}
		if (newPrompt.setup) {
			renderer.render(newPrompt.setup);
		} else {
			renderer.render(newPrompt.sceneData);
		}
		
		if (!newPrompt.quiz) {
			$('#nextPrevDiv').show();
		}
		sectionIdx = newSectionIdx;
		promptIdx = newPromptIdx;
		var renderText = interpreter.interp(newPrompt.text);
		if (newPrompt.cutScene) {	
			window.curLevel.cutSceneStart(renderText, newPrompt.cutScene, newPrompt.quiz)
		} else {
			if (newPrompt.quiz) {
				var quiz = newPrompt.quiz;
				//$('#nextPrevDiv').hide();
				$('#prompt').html(defaultTo('', templater.div({innerHTML: renderText})));
				window['curLevel'].appendQuiz(newPrompt.quiz, $('#prompt'))
			} else {
				$('#prompt').html(templater.div({innerHTML: renderText}));
			}
		}
		$('#baseHeader').html(newPrompt.title);
		this.execListeners(curLevel.setupListeners.listeners);
		emptyListener(curLevel, 'setup');
		interpreter.renderMath();


	},
	getpromptIdxsToClean: function(newSectionIdx, newPromptIdx) {
				//attn please - this only works for going forwards
		//would need to make like an 'added by' tag for backwards to work
		var curSection = window['curLevel'].sections[sectionIdx];
		if (newSectionIdx>sectionIdx || (sectionIdx==newSectionIdx && newPromptIdx>promptIdx)) {
			var cleanUps = []
			for (var pIdx=promptIdx; pIdx<curSection.prompts.length; pIdx++) {
				cleanUps.push(pIdx);
			}
			return cleanUps;
		} else {
			return [promptIdx];
		}
	},
	execListeners: function(listeners) {
		for (var name in listeners) {
			var listener = listeners[name];
			listener.func.apply(listener.obj);
		}
	},

	nextPrompt: function(forceAdvance){
		//the entry point for the submit button is submitAdvanceFunc in LevelTools
		var curSection = window['curLevel'].sections[sectionIdx];
		var curPrompt = defaultTo({}, curSection.prompts[promptIdx]);
		var willAdvance = forceAdvance || this.checkWillAdvance();

		if (willAdvance) {
			if (curPrompt) {
				curPrompt.finished = true;
			}
			var nextIdxs = this.getNextIdxs()
			this.showPrompt(nextIdxs.newSectionIdx, nextIdxs.newPromptIdx);
			return true;
		}
		return false;
		
	},

	getNextIdxs: function() {
		var newSectionIdx = sectionIdx;
		var newPromptIdx = promptIdx;
		var curSection = window['curLevel'].sections[sectionIdx];
		if (promptIdx+1==curSection.prompts.length) {
			if (sectionIdx+1 < window['curLevel'].sections.length) {
				newSectionIdx++;
				newPromptIdx=0;
			}
		} else {
			newPromptIdx++;
		}
		return {newSectionIdx:newSectionIdx, newPromptIdx:newPromptIdx};
	},

	getPrevIdxs: function() {
		var newSectionIdx = sectionIdx;
		var newPromptIdx = promptIdx;
		if (promptIdx==0) {
			if (sectionIdx>0) {
				newSectionIdx--;
				newPromptIdx=window['curLevel'].sections[newSectionIdx].prompts.length-1;
			}
		} else {
			newPromptIdx--;
		}
		return {newSectionIdx:newSectionIdx, newPromptIdx:newPromptIdx};
	},

	checkWillAdvance: function() {
		var nextIdxs = this.getNextIdxs();
		var newSectionIdx = nextIdxs.newSectionIdx;
		var newPromptIdx = nextIdxs.newPromptIdx;
		var willAdvance = 1;
		willAdvance = Math.min(willAdvance, this.checkWillAdvanceConditions(newSectionIdx, newPromptIdx));
		if (willAdvance) {
			willAdvance = Math.min(willAdvance, this.checkWillAdvanceQuiz());
		}
		return willAdvance;
	},

	checkWillAdvanceConditions: function(newSectionIdx, newPromptIdx){

		var changingSection = sectionIdx!=newSectionIdx;
		var conditionsMet = 0;
		var curPrompt = defaultTo({}, curLevel.sections[sectionIdx].prompts[promptIdx]);
		var curFinished = defaultTo(false, curPrompt.finished);
		
		conditionsMet = Math.max(conditionsMet, curFinished);
		if (!conditionsMet) {
			var promptResults = curLevel.promptConditions();
			if (promptResults.didWin) {
				if (changingSection) {
					var sectionResults = curLevel.sectionConditions();
					if (sectionResults.didWin) {
						conditionsMet = 1;
					} else {
						conditionsMet = 0;
						alertValid(sectionResults.alert);
					}
				} else {
					conditionsMet = 1;
				}
			} else {
				conditionsMet = 0;
				alertValid(promptResults.alert);
			}
		}
		return conditionsMet;
	},



	checkWillAdvanceQuiz: function(){
		//isCorrect will alert for wrong answers and maybe for no answer (if text box, I guess)
		var allCorrect = 1;
		var quiz = curLevel.quiz;
		if (quiz && quiz.length>0) {
			if (!quiz.allAnswered()) {
				alert("You haven't answered all the questions");
				return 0;
			} else {
				for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
					var question = quiz[questionIdx];
					allCorrect = Math.min(allCorrect, question.isCorrect());
				}
				return allCorrect;
			}
		} else {
			return allCorrect;
		}	
		
	},

	prevPrompt: function(){
		var prevIdxs = this.getPrevIdxs();
		this.showPrompt(prevIdxs.newSectionIdx, prevIdxs.newPromptIdx);
	}


}