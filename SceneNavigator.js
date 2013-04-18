function SceneNavigator() {

}
SceneNavigator.prototype = {
	showPrompt: function(newSectionIdx, newPromptIdx, forceReset){
		timeline.show(newSectionIdx, newPromptIdx, forceReset);
	},
	refresh: function() {
		timeline.refresh();
	},
	nextPrompt: function(forceAdvance){
		//the entry point for the submit button is submitAdvanceFunc in LevelTools
		var curSection = timeline.curSection();
		var curPrompt = timeline.curPrompt();
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
		var newSectionIdx = timeline.sectionIdx;
		var curSection = timeline.curSection();
		var newPromptIdx = curSection.promptIdx;
		if (newPromptIdx+1==curSection.sectionData.prompts.length) {
			if (newSectionIdx+1 < timeline.sections.length) {
				newSectionIdx++;
				newPromptIdx=0;
			}
		} else {
			newPromptIdx++;
		}
		return {newSectionIdx:newSectionIdx, newPromptIdx:newPromptIdx};
	},

	getPrevIdxs: function() {
		var curSectionIdx = timeline.sectionIdx;
		var newSectionIdx = curSectionIdx;
		var curSection = timeline.curSection();
		var curPromptIdx = curSection.promptIdx;
		var newPromptIdx = curPromptIdx;
		if (curPromptIdx==0) {
			if (curSectionIdx>0) {
				newSectionIdx--;
				newPromptIdx = timeline.sections[newSectionIdx].sectionData.prompts.length - 1;
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

		var changingSection = timeline.sectionIdx!=newSectionIdx;
		var conditionsMet = 0;
		var curPrompt = timeline.curPrompt();
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
		var quiz = curLevel.quiz;
		if (quiz) {
			if (!quiz.allAnswered()) {
				alert("You haven't answered all the questions.");
				return false;
			} else if (!quiz.allCorrect()) {
				quiz.fireAlertWrong();
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	},

	prevPrompt: function(){
		var prevIdxs = this.getPrevIdxs();
		this.showPrompt(prevIdxs.newSectionIdx, prevIdxs.newPromptIdx);
	}


}