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
		var now = timeline.now();
		var willAdvance = forceAdvance || this.checkWillAdvance();
		var amAdvancing = true;
		if (willAdvance) {
			// if (curPrompt) {
				// curPrompt.finished = true;
			// }
			var dirExpr = this.checkDirections(curPrompt.directions);
			
			if (dirExpr) {
				amAdvancing = this.execDirections(dirExpr)
			} 
			//this needs works
			if (amAdvancing) {
				var nextIdxs = this.getNextIdxs();
				var now = timeline.now();
				timeline[timeline.sectionIdx].killBranches();
				for (nextIdxs.sectionIdx == now.sectionIdx && nextIdxs.promptIdx == now.promptIdx) {
					timeline.surface(true);
				} else {
					this.showPrompt(nextIdxs.newSectionIdx, nextIdxs.newPromptIdx);
				}
			}
			//return true;
		}
		//return false;
		
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
	checkDirections: function(dirs) {
		if (dirs) {
			var curPrompt = timeline.curPrompt();
			var whereTo = dirs(curPrompt);
			if (whereTo) {
				return whereTo;
			}
		}
		return undefined;
	},
	execDirections: function(dirExpr) {
		var directionFuncs = {
			branchPromptsPreClean: function(prompts) {
				prompts = prompts instanceof Array ? prompts : [prompts];
				timeline[timeline.sectionIdx].branchPromptsPreClean(prompts);
				return true;
			},
			branchPromptsPostClean: function(prompts) {
				prompts = prompts instanceof Array ? prompts : [prompts];
				timeline[timeline.sectionIdx].branchPromptsPostClean(prompts)
				return true;
				//need to check if we are making a branch that already exists or not. If so, do nothing.  It not, kill branches and make new
			},
			branchSections: function(sections) {
				sections = sections instanceof Array ? sections : [sections];
				timeline[timeline.sectionIdx].branchSections(sections)
				return true;
			},
			surface: function() {
				timeline.surface();
				return false;
			},
			advance: function() {
				timeline[timeline.sectionIdx].killBranches();
				return true;
			}
			
		}
		with (directionFuncs) {
			return dirExpr();
		}
	},
	getPrevIdxs: function() {
		var now = timeline.now();
		var curSectionIdx = now.sectionIdx;
		var newSectionIdx = curSectionIdx;
		var curPromptIdx = now.promptIdx;
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
		//not checked when going backwards
		var changingSection = timeline.sectionIdx!=newSectionIdx;
		var now = timeline.now();
		var promptMet = conditionManager.canAdvance(now.promptIdx);
		var sectionMet = true;
		if (changingSection && promptMet) {
			sectionMet = conditionManager.canAdvance(-1);
		}
		
		return Math.min(promptMet, sectionMet);
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
		var now = timeline.now();
		if (prevIdxs.sectionIdx == now.sectionIdx && prevIdxs.promptIdx == now.promptIdx) {
			timeline.surface(false);
		} else {
			this.showPrompt(prevIdxs.newSectionIdx, prevIdxs.newPromptIdx);
		}
	}


}