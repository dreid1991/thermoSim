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

function SceneNavigator() {

}
SceneNavigator.prototype = {
	showPrompt: function(newSectionIdx, newPromptIdx, forceReset){
		timeline.show(newSectionIdx, newPromptIdx, forceReset);
	},
	refresh: function() {
		timeline.refresh();
	},
	nextPrompt: function(forceAdvance, checkDirs){
		//the entry point for the submit button is submitAdvanceFunc in LevelTools
		checkDirs = defaultTo(true, checkDirs);
		var curSection = timeline.curSection();
		var curPrompt = timeline.curPrompt();
		var now = timeline.now();
        var willAdvance = Math.max(false, MANAGE_EXTENSIONS); 
        if (!willAdvance) {
            willAdvance = forceAdvance || this.checkWillAdvance();
        }
		if (willAdvance) {
			// if (curPrompt) {
				// curPrompt.finished = true;
			// }
			this.sendAnswersToCW(window.curLevel.quiz);
			if (checkDirs) {
				var dirExpr = this.checkDirections(curPrompt.directions);
			}
			instrs = dirExpr != undefined ? this.evalDirections(dirExpr) : {advance: true, killBranches: false};
		
			if (instrs.killBranches) {
				timeline.sections[timeline.sectionIdx].killBranches();
			}
			if (instrs.advance) {
				var nextIdxs = this.getNextIdxs();
				var now = timeline.now();
				if (nextIdxs.sectionIdx == now.sectionIdx && nextIdxs.promptIdx == Math.floor(now.promptIdx)) {
					timeline.surface(true);
				} else {
					this.showPrompt(nextIdxs.sectionIdx, nextIdxs.promptIdx);
				}
			}
			//return true;
		}
		//return false;
		
	},

	getNextIdxs: function() {
		var newSectionIdx = timeline.sectionIdx;
		var curSection = timeline.curSection();
		var newPromptIdx = Math.floor(curSection.promptIdx);
		if (newPromptIdx+1==curSection.sectionData.prompts.length) {
			if (newSectionIdx+1 < timeline.sections.length) {
				newSectionIdx++;
				newPromptIdx=0;
			}
		} else {
			newPromptIdx++;
		}
		return {sectionIdx: newSectionIdx, promptIdx:newPromptIdx};
	},
	checkDirections: function(dirs) {
		if (dirs) {
			var whereTo = dirs();
			if (whereTo) {
				return whereTo;
			}
		}
		return {advance: true, killBranches: true};
	},
	evalDirections: function(dirExpr) {
		var directionFuncs = {
			branchPromptsPreClean: function(prompts, killBranches) {
				prompts = prompts instanceof Array ? prompts : [prompts];
				timeline.sections[timeline.sectionIdx].branchPromptsPreClean(prompts);
				return {advance: true, killBranches: defaultTo(false, killBranches)};
			},
			branchPromptsPostClean: function(prompts, killBranches) {
				prompts = prompts instanceof Array ? prompts : [prompts];
				timeline.sections[timeline.sectionIdx].branchPromptsPostClean(prompts)
				return {advance: true, killBranches: defaultTo(false, killBranches)};
				//need to check if we are making a branch that already exists or not. If so, do nothing.  It not, kill branches and make new
			},
			branchSections: function(sections, killBranches) {
				sections = sections instanceof Array ? sections : [sections];
				timeline.sections[timeline.sectionIdx].branchSections(sections)
				return {advance: true, killBranches: defaultTo(false, killBranches)};
			},
			surface: function(forwards, killBranches) {
				timeline.surface(forwards);
				return {advance: false, killBranches: defaultTo(false, killBranches)};
			},
			advance: function() {
				return {advance: true, killBranches: true};
			}
			
		}
		with (directionFuncs) {
			return eval(dirExpr);
		}
	},
	getPrevIdxs: function() {
		var now = timeline.now();
		var curSectionIdx = now.sectionIdx;
		var newSectionIdx = curSectionIdx;
		var curPromptIdx = Math.ceil(now.promptIdx);
		var newPromptIdx = curPromptIdx;
		if (curPromptIdx==0) {
			if (curSectionIdx>0) {
				newSectionIdx--;
				newPromptIdx = timeline.sections[newSectionIdx].sectionData.prompts.length - 1;
			}
		} else {
			newPromptIdx--;
		}
		return {sectionIdx:newSectionIdx, promptIdx:newPromptIdx};
	},

	checkWillAdvance: function() {
		var nextIdxs = this.getNextIdxs();
		var newSectionIdx = nextIdxs.sectionIdx;
		var newPromptIdx = nextIdxs.promptIdx;
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
	sendAnswersToCW: function(quiz) {
		if (quiz) {
			quiz.sendAnswersToCW();
		}
	},
	prevPrompt: function(){
		var prevIdxs = this.getPrevIdxs();
		var now = timeline.now();
		if (prevIdxs.sectionIdx == now.sectionIdx && prevIdxs.promptIdx == now.promptIdx) {
			timeline.surface(false);
		} else {
			this.showPrompt(prevIdxs.sectionIdx, prevIdxs.promptIdx);
		}
	}


}

