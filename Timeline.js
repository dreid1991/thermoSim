//need to interp all this stuff before rendering, yo
function Timeline(parent, buttonManagerBlank, isSectionsBranch, isPromptsBranch) { //make it so it can inherit blanks as well
	this.parent = parent;
	//cloning return jquery reference rather than deepcopy if done before page fully loaded
	this.buttonManagerBlank = buttonManagerBlank || document.getElementById('buttonManager').outerHTML;
	this.isSectionsBranch = isSectionsBranch || false;
	this.isPromptsBranch = isPromptsBranch || false;
	this.sections = [];
	this.sectionIdx = undefined;
	this.curId = 0;
	this.elems = [];
	this.suspended = false;
}

Timeline.prototype = {
	curSection: function() {
		return this.sections[this.sectionIdx];
	},
	curPrompt:function() {
		return this.sections[this.sectionIdx].curPrompt();
	},
	pushSection: function(sectionData) {
		this.sections.push(new Timeline.Section(this, sectionData, this.buttonManagerBlank));
	},
	clearCurrentSection: function() {
		if (this.sectionIdx !== undefined) 
			this.sections[this.sectionIdx].clear()
	},
	now: function() {
		return {sectionIdx: this.sectionIdx, promptIdx: this.sections[this.sectionIdx].promptIdx};
	},
	nowTime: function() {
		return {sectionIdx: this.sectionIdx, promptIdx: Math.floor(this.sections[this.sectionIdx].time)};
	},
	surface: function(forwards) {
		forwards = defaultTo(true, forwards);
		if (this.parent) {
			if (this.isSectionsBranch) {
				this.curSection().cleanUpPrompt(forwards);
				this.clearCurrentSection();
			} else if (this.isPromptsBranch) {
				this.curSection().cleanUpPrompt(forwards);
			}
			this.parent.catchSurface(this, forwards);
		}
	},
	catchSurface: function(caughtTimeline, forwards) {
		window.timeline = this;
		timeline.suspended = false;
		this.curSection().pushToGlobal();
		if (caughtTimeline.isSectionsBranch) {
			this.curSection().restoreHTML();
		}
		//if (!this.sections[this.steppingTowards.sectionIdx].inited) this.sections[this.steppingTowards.sectionIdx].inited = true;
		if (forwards) {
			sceneNavigator.nextPrompt(true, false);
		} else {
			sceneNavigator.prevPrompt();
		}
		//this.show(this.steppingTowards.sectionIdx, this.steppingTowards.promptIdx, false, true);
	},
	findElemBoundsByHandle: function(handle) {
		var matches = [];
		var matchedSectionIdx;
		var i, j, moments, events, elemDatum, wallIdx, objIdx, cmmdIdx;
		//will not work for dots, have no handle
		checkLoop: 
			for (i=0; i<this.sections.length; i++) {
				moments = this.sections[i].moments;
				for (j=0; j<moments.length; j++) {
					events = moments[j].events;
					for (wallIdx=0; wallIdx<events.walls.length; wallIdx++) {
						if (handle == events.walls[wallIdx].elemDatum.handle) {
							matches.push(moments[j].timestamp);
							matchedSectionIdx = i;
							if (matches.length == 2) break checkLoop;
						}
					}
					for (objIdx=0; objIdx<events.objs.length; objIdx++) {
						if (events.objs[objIdx].elemDatum.handle) {
							if (events.objs[objIdx].elemDatum.handle == handle) {
								matches.push(moments[j].timestamp);
								matchedSectionIdx = i;
								if (matches.length == 2) break checkLoop;
							}
						} else if (events.objs[objIdx].elemDatum.attrs) {
							if (events.objs[objIdx].elemDatum.attrs.handle == handle) {
								matches.push(moments[j].timestamp);
								matchedSectionIdx = i;
								if (matches.length == 2) break checkLoop;
							}
						}
					}
					for (cmmdIdx=0; cmmdIdx<events.cmmds.length; cmmdIdx++) {
						if (handle == events.cmmds[cmmdIdx].elemDatum.handle) {
							matches.push(moments[j].timestamp);
							matchedSectionIdx = i;
							if (matches.length == 2) break checkLoop;
						}
					}
				}
			}
		matches.push(matchedSectionIdx);
		return matches;
	},
	show: function(sectionIdx, promptIdx, refreshing, forceShowPrompt) {
		//this.steppingTowards = {sectionIdx: sectionIdx, promptIdx: promptIdx};
		var changingSection = this.sectionIdx != sectionIdx;
		var changingPrompt = changingSection || promptIdx != this.sections[sectionIdx].promptIdx || forceShowPrompt;
		// if (changingPrompt || refreshing) {
			// this.sections[sectionIdx].cleanUpPrompt();
		// }
		if (changingSection && this.sectionIdx !== undefined) {
			this.sections[this.sectionIdx].cleanUpPrompt(sectionIdx > this.sectionIdx);
		}

		if (changingSection || refreshing) {
			this.clearCurrentSection();
			this.sectionIdx = sectionIdx;
			//going to assume prompts are shown in sequential order for now
			this.sections[sectionIdx].showSection(this.sectionIdx);
		}
		if (changingPrompt || refreshing) {
			this.sections[sectionIdx].showPrompt(promptIdx);
		}
	},
	addOnce: function(sectionIdx, promptIdx, when, eventClass, func) {
		sectionIdx = sectionIdx == 'now' ? this.sectionIdx : sectionIdx;
		this.sections[sectionIdx].addOnce(promptIdx, when, eventClass, func);

	},
	refresh: function() {
		var curPromptIdx = this.sections[this.sectionIdx].promptIdx;
		var curSection = this.sections[this.sectionIdx];
		var conditionMgr = curSection.conditionManager;
		var newSectionInstance = new Timeline.Section(this, curSection.sectionData, this.buttonManagerBlank, conditionMgr);
		//curSection.cleanUpPrompt();
		curSection.clear();
		this.sections.splice(this.sectionIdx, 1, newSectionInstance);
		this.show(this.sectionIdx, curPromptIdx, true);
	},
	takeNumber: function() {
		return this.curId ++;
	},

}

Timeline.Section = function(timeline, sectionData, buttonManagerBlank, conditionManager) {
//need to make clean up listeners still
	this.timeline = timeline;
	this.inited = false
	this.promptIdx = -1;
	this.time = -2;
	this.branches = [];
	this.sectionData = sectionData;
	this.moments = [];
	this.populateMoments(timeline, timeline.elems, this.moments, this.sectionData);
	this.moments = _.sortBy(this.moments, function(moment) {return moment.timestamp});
	//sort moments here
	this.level = new LevelInstance();
	this.mainReadout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left', this.level);
	this.dotManager = new DotManager();
	this.collide = new CollideHandler(this.dotManager);
	this.walls = WallHandler();
	this.dataHandler = new DataHandler();
	this.dataDisplayer = new DataDisplayer();
	
	this.conditionManager = conditionManager ? conditionManager.stripForInheritance() : new ConditionManager();
	this.activationEnergySpcChanger = new ActivationEnergySpcChanger(this.collide);
	this.buttonManager = new ButtonManager('buttonManager');
	this.spcs = {};
	LevelTools.addSpcs(LevelData.spcDefs, this.spcs, this.dotManager);
	this.sliderList = [];
	this.dataDisplayer.setReadouts(this.level.readouts);
	this.collide.setSpcs(this.spcs);
	this.level.spcs = this.spcs;
	this.level.dataHandler = this.dataHandler;
	this.buttonMangerClone;
	this.buttonManagerBlank = buttonManagerBlank;
	this.dashRunId = 'dashRun' + (window.dashRunId++);
	this.dashRun = $('#dashRunBlank').clone(true).attr('id', this.dashRunId);
	$('#dashRunWrapper').append(this.dashRun);
}

Timeline.Section.prototype = {
	showSection: function(curSectionIdx) {
		//this.replaceDiv($('#dashRunWrapper'), $('#dashRun'), this.dashRunClone || this.dashRunBlank);
		this.dashRun.show();
		this.dashRun.attr('id', 'dashRun');
		this.dashRun.addClass('active');
		this.replaceDiv($('#buttonManagerWrapper'), $('#buttonManager'), this.buttonManagerClone || this.buttonManagerBlank);
		this.pushToGlobal();

		if (!this.inited) {
			this.stepTo(-1);
			this.promptIdx = -1;
			this.inited = true;
		} else {
			this.restoreAuxs();
			this.restoreGraphs();
		}
	},
	restoreHTML: function() {
		this.dashRun.show();
		this.dashRun.attr('id', 'dashRun');
		this.dashRun.addClass('active');
		this.replaceDiv($('#buttonManagerWrapper'), $('#buttonManager'), this.buttonManagerClone || this.buttonManagerBlank);
		this.restoreGraphs();
		this.restoreAuxs();
	},
	showPrompt: function(promptIdx) {
		//should all be rolled into moments now
		var destTime = this.getTimestamp(promptIdx, 'headHTML');
		var suspended = this.stepTo(destTime);
		if (suspended) {
			this.timeline.suspended = true;
			this.promptIdx = Math.floor(this.time) + .5;
		} else {
			this.promptIdx = promptIdx;
		}

	},
	stepTo: function(dest) {
		var suspended = false;
		var from = this.time;
		var moments = this.moments;
		//hey, all the 1e-4 business is to indicate that I'm going past the last moment I want to hit.  1e-5 is to account for rounding error
		if (dest > this.time || /*Math.floor(this.time) == Math.floor(dest + 1e-4) && */ (dest < this.time && !/headhtml/i.test(this.getTimestampType(dest)))) {
			var curMom = this.momentAt(this.time);
			if (curMom) curMom.fire(this.time, dest);
			if (curMom) this.time += dest > this.time ? 1e-4 : -1e-4;
			while (dest != this.time) {
				var nextMom = this.nextTowardsDest(this.time, dest);
				if (!nextMom) break;
				
				var preCleanBranchTimestamp = this.getTimestamp(Math.floor(nextMom.timestamp), 'branchPreClean');
				var postCleanBranchTimestamp = this.getTimestamp(Math.floor(nextMom.timestamp), 'branchPostClean');
				//var from = this.time;
				this.time = nextMom.timestamp;
				nextMom.fire(from, dest);
				if (Math.abs(nextMom.timestamp - preCleanBranchTimestamp) < 1e-5 || Math.abs(nextMom.timestamp - postCleanBranchTimestamp) < 1e-5) {
					suspended = true;
					break;
				}
			}
		} else if (dest < this.time) {
			//step back to (dest).9
			//then jump to (dest).1 for setup, then (dest).2 for html
			//avoids unnecessary cutscene entering/exiting
			var curMom = this.momentAt(this.time);
			if (curMom) curMom.fire(this.time, dest);
			if (curMom) this.time -= 1e-4;
			var reAddElemsDest = this.getTimestamp(Math.floor(dest), 'branchPreClean');
			while (reAddElemsDest != this.time) {
				var nextMom = this.nextTowardsDest(this.time, reAddElemsDest);
				if (!nextMom) break;
				var preCleanBranchTimestamp = this.getTimestamp(Math.floor(nextMom.timestamp), 'branchPreClean');
				var postCleanBranchTimestamp = this.getTimestamp(Math.floor(nextMom.timestamp), 'branchPostClean');
				//var from = this.time;
				this.time = nextMom.timestamp;
				nextMom.fire(from, dest);
				
				if (Math.abs(nextMom.timestamp - preCleanBranchTimestamp) < 1e-5 || Math.abs(nextMom.timestamp - postCleanBranchTimestamp) < 1e-5) {
					//this.steppingTowards = dest;
					suspended = true;
					break;
				}				
				

			}
			//maybe only do this if not entering branch
			//THIS BEHAVIOR MUST BE RESTRICTED TO IF WE'RE ENTERING A SECTION
			if (!suspended) {
				this.time = this.getTimestamp(Math.floor(dest + 1e-4), 'setup') - 1e-4;
			
				while (dest != this.time) {
					var nextMom = this.nextMoment(this.time);
					if (!nextMom) break;
					var from = this.time;
					this.time = nextMom.timestamp;
					nextMom.fire(from, dest);
				}			
			} //this will probably need work.  It may not make any sense at all!  How could I know?
		}
		return suspended;

	},
	nextTowardsDest: function(cur, dest) {
		var curMoment = this.momentAt(cur);
		if (curMoment) {
			var idx = this.moments.indexOf(curMoment);
			dest < cur ? idx -- : idx ++;
			var nextMoment = this.moments[idx];
			if (nextMoment && Math.abs(nextMoment.timestamp - cur) <= Math.abs(dest - cur)) {
				return this.moments[idx];
			}
		} else {
			if (cur < dest) {
				for (var i=0; i<this.moments.length; i++) {
					var moment = this.moments[i];
					if (moment.timestamp > cur) {
						if (moment.timestamp <= dest) {
							return moment;
						}
						break;
					}

				}
			} else if (dest < cur) {
				for (var i=this.moments.length-1; i>=0; i--) {
					var moment = this.moments[i];
					if (moment.timestamp < cur) {
						if (moment.timestamp >= dest) {
							return moment;
						}
						break;
					}
				}	
			}
		}

		return undefined;
	},
	nextMoment: function(cur) {
		//cur need not be on moment
		for (var i=0; i<this.moments.length; i++) {
			if (this.moments[i].timestamp > cur) return this.moments[i];
		}
		return undefined;
	},
	momentAt: function(time) {
		for (var i=0; i<this.moments.length; i++) {
			if (Math.abs(this.moments[i].timestamp - time) < 1e-5) { //can have imprecise adding.  Don't want it to mess up stamps
				return this.moments[i];
			}
		}
	},
	cleanUpPrompt: function(forward) {
		//only to be called when leaving a section;
		var destTime;
		if (forward) {
			destTime = this.getTimestamp(this.sectionData.prompts.length - 1, 'tail');
		} else {
			destTime = this.getTimestamp(0, 'head') - 1e-4; 
		}
		
		this.stepTo(destTime);
		this.time = destTime;
	},
	spliceInMoment: function(moment) {
		for (var i=0; i<this.moments.length; i++) {
			if (this.moments[i].timestamp > moment.timestamp) {
				this.moments.splice(i, 0, moment);
				break;
			}
		}
	},
	branchPromptsPreClean: function(prompts) {
		var timestamp = this.getTimestamp(Math.floor(this.time), 'branchPreClean');
		this.branchPrompts(prompts, timestamp);
	},
	branchPromptsPostClean: function(prompts) {
		var timestamp = this.getTimestamp(Math.floor(this.time), 'branchPostClean');
		this.branchPrompts(prompts, timestamp);
	},
	branchPrompts: function(prompts, timestamp) {
		var self = this;
		this.killBranchMoments();
		var moment = new Timeline.Moment(timestamp);
		var curTimeline = this.timeline;
		
		var cmmd = new Timeline.Command('point', function() {
			var promptIdx = Math.floor(timestamp);
			//self.time += 1e-4;
			if (self.branches[promptIdx] && self.branches[promptIdx].id == prompts.id) {
				window.timeline = self.branches[promptIdx].timeline;
				timeline.sections[0].pushToGlobal();
				
				var now = timeline.now()
				timeline.show(now.sectionIdx, now.promptIdx, false, true);
			} else {
				var branchTimeline = new Timeline(curTimeline, undefined, false, true);
				self.branches[promptIdx] = new Timeline.Branch(branchTimeline, prompts.id);
				branchTimeline.pushSection({prompts: prompts});
				branchTimeline.sections[0].inheritState(self);
				//this makes it so we don't have to call showSection, which would replace the html
				branchTimeline.sectionIdx = 0;
				branchTimeline.inited = true;
				window.timeline = branchTimeline;
				branchTimeline.sections[0].pushToGlobal();
				branchTimeline.show(0, 0);
			}	
			
			
		}, undefined, false, false, undefined);
		
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		moment.events.cmmds.push(new Timeline.Event.Point(this, this.timeline.elems, cmmd, spawn, this.timeline.takeNumber(), false, false, moment));
		this.spliceInMoment(moment);
	},
	branchSections: function(sections) {
		var self = this;
		this.killBranchMoments();
		var timestamp = this.getTimestamp(Math.floor(this.time), 'branchPostClean');
		var moment = new Timeline.Moment(timestamp);
		var curTimeline = this.timeline;
		var cmmd = new Timeline.Command('point', function() {
			var promptIdx = Math.floor(self.time);
			if (self.branches[promptIdx] && self.branches[promptIdx].id == sections.id) {
				self.timeline.clearCurrentSection();
				window.timeline = self.branches[promptIdx].timeline;
				timeline.sections[timeline.sectionIdx].pushToGlobal();
				timeline.sections[timeline.sectionIdx].showSection();
				//timeline.showHTML();//this doesn't actually exist
				var now = timeline.now()
				//will have cleaned up prompt on surfacing
				timeline.show(now.sectionIdx, now.promptIdx, false, true);
			} else {
				var branchTimeline = new Timeline(curTimeline, curTimeline.buttonManagerBlank, true, false);
				for (var i=0; i<sections.length; i++) {
					branchTimeline.pushSection(sections[i]);
				}
				self.branches[self.promptIdx] = new Timeline.Branch(branchTimeline, sections.id);
				//don't need to clear prompt, that will be taken care of when we resume
				self.timeline.clearCurrentSection();
				//self.time += 1e-4;
				window.timeline = branchTimeline;
				branchTimeline.show(0, 0);
			}
		}, undefined, false, false, undefined);
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		moment.events.cmmds.push(new Timeline.Event.Point(this, this.timeline.elems, cmmd, spawn, this.timeline.takeNumber(), false, false, moment));
		this.spliceInMoment(moment);
	},
	killBranches: function() {
		this.killBranchMoments();
		this.branches[this.promptIdx] = undefined;

	},
	killBranchMoments: function() {
		var preCleanTimestamp = this.getTimestamp(Math.floor(this.time), 'branchPreClean');
		var postCleanTimestamp = this.getTimestamp(Math.floor(this.time), 'branchPostClean');
		var preMom = this.momentAt(preCleanTimestamp);
		var postMom = this.momentAt(postCleanTimestamp);
		if (preMom) {
			this.moments.splice(this.moments.indexOf(preMom), 1);
		}
		if (postMom) {
			this.moments.splice(this.moments.indexOf(postMom), 1);
		}	
	},
	curPrompt: function() {
		return this.sectionData.prompts[this.promptIdx];
	},
	replaceDiv: function(wrapper, current, clone) {
		if (current.length) 
			current.remove();
		wrapper.append(clone);
	},
	inheritState: function(section) {
		this.level = section.level;
		this.collide = section.collide;
		this.walls = section.walls;
		this.dotManager = section.dotManager;
		this.spcs = section.spcs;
		this.dataDisplayer = section.dataDisplayer;
		this.sliderList = section.sliderList;
		this.buttonManager = section.buttonManager;
		this.dataHandler = section.dataHandler;
		this.activationEnergySpcChanger = section.activationEnergySpcChanger;
		//not inheriting condition manager.  That is prompt index specific and not really part of the state
	},
	pushToGlobal: function() {
		window.curLevel = this.level;
		window.collide = this.collide;
		window.walls = this.walls;
		window.dotManager = this.dotManager;
		window.spcs = this.spcs;
		window.dataDisplayer = this.dataDisplayer;
		window.sliderList = this.sliderList;
		window.buttonManager = this.buttonManager;
		window.dataHandler = this.dataHandler;
		window.activationEnergySpcChanger = this.activationEnergySpcChanger;
		window.conditionManager = this.conditionManager;

	},
	restoreAuxs: function() {
		for (var auxName in this.level.auxs) {
			var aux = this.level.auxs[auxName];
			aux.restoreHTML();
		}
	},
	restoreGraphs: function() {
		for (var graphName in this.level.graphs) {
			var graph = this.level.graphs[graphName];
			graph.restoreHTML();
			graph.drawAllData();
		}
	},
	clear: function() {
		if (this.inited) {
			$('#prompt').html('');
			this.buttonManagerClone = $('#buttonManager').clone(true);
			$('#buttonManager').html('');
			$('#baseHeader').html('')
			this.dashRun.attr('id', this.dashRunId);
			this.dashRun.removeClass('active');
			this.dashRun.hide();
			//this.dashRunClone = $('#dashRun').clone(true);
			//$('#dashRun').remove();
			for (var graphName in this.level.graphs) {
				var graph = this.level.graphs[graphName];
				graph.clearHTML();
			}
			for (var auxName in this.level.auxs) {
				var aux = this.level.auxs[auxName];
				aux.clearHTML();
			}
		}
	},
	//MAKE THESE ACCESSABLE IN TIMELINE
	addCmmdSpan: function(prompt, cmmdInput) {
		promptIdx = prompt == 'now' ? this.promptIdx : prompt;
		var timestampHead = this.getTimestamp(promptIdx, 'setup');
		var id = this.timeline.takeNumber();
		
		if (typeof cmmdInput == 'string' || typeof cmmdInput == 'function') {
			cmmd = new Timeline.Command('span', cmmdInput, undefined, true, false);
		} else {
			cmmd = new Timeline.Command('span', cmmdInput.spawn, cmmdInput.remove, false, cmmdInput.once, cmmdInput.cleanUpWith);
		}
		this.timeline.elems[id] = cmmd;
		this.applyCmmdSpan(this.timeline, this.moments, this.timeline.elems, cmmd, 'cmmds', cmmd.once, timestampHead, id);

	},

	addCmmdPoint: function(prompt, when, func, oneWay, once) { //public func.  Test settings a heater's liquid
		//make this be point with once argument
		promptIdx = prompt == 'now' ? this.promptIdx : prompt;
		var id = this.timeline.takeNumber();
		var timestamp = this.getTimestamp(promptIdx, when || 'setup');
		var cmmd = new Timeline.Command('point', func, undefined, oneWay, once);
		this.timeline.elems[id] = cmmd;
		this.applyCmmdPoint(this.timeline, this.moments, this.timeline.elems, cmmd, 'cmmds', once, timestamp, id);
	},
	populateMoments: function(timeline, elems, moments, sectionData) {
		moments.push(new Timeline.Moment(-2)); //dummy moment to start on

		this.addSceneDataToMoments(timeline, elems, moments, sectionData.sceneData, -1, undefined);
		var prompts = sectionData.prompts;
		for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
			if (prompts[promptIdx].sceneData) this.addSceneDataToMoments(timeline, elems, moments, prompts[promptIdx].sceneData, promptIdx);
		}
		this.populateHTMLMoments(timeline, elems, moments, sectionData);
	},
	populateHTMLMoments: function(timeline, elems, moments, sectionData) {
		var prompts = sectionData.prompts;
		for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
			var prompt = prompts[promptIdx];
			var timestampHead = this.getTimestamp(promptIdx, 'headHTML');
			this.populatePromptHTML(prompt, timestampHead, timeline, elems, moments, promptIdx);
		}
	},
	populatePromptHTML: function(prompt, timestampHead, timeline, elems, moments, promptIdx) {
		var section = this;
		var timestampTail, id, spawnFunc, removeFunc, cmmd;
		if (prompt.cutScene) {
			id = timeline.takeNumber();
		
			spawnFunc = function() {
				var interpedText = interpreter.interp(prompt.text);
				section.level.cutSceneStart(interpedText, prompt.cutScene)
			};
			removeFunc = function() {
				section.level.cutSceneEnd()
				//$('#nextPrevDiv').show();
			};
			if (prompt.quiz) {
				spawnFunc = extend(spawnFunc, function() {
					$('#base').hide();
					section.level.quiz = quizRenderer.render(prompt.quiz, $('#intText'));
				});
				removeFunc = extend(removeFunc, function() {
					$('#base').show();
					section.level.quiz = undefined;
				});
			}
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, false, 'cmmds');
		} else {
			id = timeline.takeNumber();
			spawnFunc = function() {
				var interpedText = interpreter.interp(prompt.text);
				$('#prompt').html(defaultTo('', templater.div({innerHTML: interpedText})));
				if (prompt.quiz) 
					section.level.quiz = quizRenderer.render(prompt.quiz, $('#prompt'));	
			};
			removeFunc = function() {
				$('#prompt').html('');
				section.level.quiz = undefined;
			};
		
			
			
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, false, 'cmmds');
		}
		if (prompt.quiz) { 
			var spawnFunc, removeFunc;
			id = timeline.takeNumber();
			spawnFunc = function() {$('#nextPrevDiv').hide();};
			removeFunc = function() {$('#nextPrevDiv').show();};
			
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, false, 'cmmds');
		}
		if (prompt.title) {
			id = timeline.takeNumber();
			spawnFunc = function() {$('#baseHeader').html(prompt.title)};
			removeFunc = function() {$('#baseHeader').html('')};
			cmmd = new Timeline.Command('span', spawnFunc, removeFunc);
			timestampTail = this.getTimestamp(promptIdx, 'tailHTML');
			this.pushSpan(elems, cmmd, Timeline.stateFuncs.cmmds.spawn, Timeline.stateFuncs.cmmds.remove, id, moments, timestampHead, timestampTail, false, 'cmmds');			
		}
		var arrangeHTMLSpawn = function() {
			interpreter.renderMath();
			section.buttonManager.arrangeGroupWrappers();
			section.buttonManager.arrangeAllGroups();
			section.buttonManager.setButtonWidth();			
		}
		var arrangeHTMLCmmd = new Timeline.Command('point', arrangeHTMLSpawn, undefined, true);

		this.pushPoint(moments, elems, timeline.takeNumber(), arrangeHTMLCmmd, Timeline.stateFuncs.cmmds.spawn, true, 'cmmds', false, timestampHead);


	},
	addSceneDataToMoments: function(timeline, elems, moments, sceneData, timestamp) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		if (sceneData) {
			//will be able to interp all of these data nuggets before rendering
			this.applySpanToMoments(timeline, moments, elems, sceneData.walls, 'walls', timestamp, Timeline.stateFuncs.walls.spawn, Timeline.stateFuncs.walls.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dots, 'dots', timestamp, Timeline.stateFuncs.dots.spawn, Timeline.stateFuncs.dots.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.objs, 'objs', timestamp, Timeline.stateFuncs.objs.spawn, Timeline.stateFuncs.objs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dataRecord, 'objs', timestamp, Timeline.stateFuncs.dataRecord.spawn, Timeline.stateFuncs.dataRecord.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.dataReadouts, 'objs', timestamp, Timeline.stateFuncs.dataReadouts.spawn, Timeline.stateFuncs.dataReadouts.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.triggers, 'objs', timestamp, Timeline.stateFuncs.triggers.spawn, Timeline.stateFuncs.triggers.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.graphs, 'objs', timestamp, Timeline.stateFuncs.graphs.spawn, Timeline.stateFuncs.graphs.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.rxns, 'objs', timestamp, Timeline.stateFuncs.rxns.spawn, Timeline.stateFuncs.rxns.remove);
			this.applySpanToMoments(timeline, moments, elems, sceneData.buttonGroups, 'objs', timestamp, Timeline.stateFuncs.buttonGrps.spawn, Timeline.stateFuncs.buttonGrps.remove);
			this.applyCmmdsToMoments(timeline, moments, elems, sceneData.cmmds, 'cmmds', timestamp);

		}
	},
	applySpanToMoments: function(timeline, moments, timelineElems, elemData, eventClass, timestampHead, spawnFunc, removeFunc) {
		elemData = elemData ? elemData : [];
		for (var i=0; i<elemData.length; i++) {
			var id = timeline.takeNumber();
			var elemDatum = elemData[i];
			var cleanUpWith = elemDatum.cleanUpWith;
			var timestampTail = this.getTimestamp(cleanUpWith || timestampHead, 'tail');

			this.pushSpan(timelineElems, elemDatum, spawnFunc, removeFunc, id, moments, timestampHead, timestampTail, false, eventClass);


		}
	},
	applyCmmdsToMoments: function(timeline, moments, timelineElems, cmmds, eventClass, timestampHead) {
		var cmmd;
		cmmds = cmmds ? cmmds : [];
		for (var i=0; i<cmmds.length; i++) {
			var cmmdInput = cmmds[i];
			
			if (typeof cmmdInput == 'string' || typeof cmmdInput == 'function') {
			
				cmmd = new Timeline.Command('point', cmmdInput, undefined, true, false);
			} else {
				cmmd = new Timeline.Command(cmmdInput.type, cmmdInput.spawn, cmmdInput.remove, defaultTo(true, cmmdInput.oneWay), cmmdInput.once);
			}
			if (/span/i.test(cmmd.type)) {
				this.applyCmmdSpan(timeline, moments, timelineElems, cmmd, eventClass, cmmd.once, timestampHead);
			} else if (/point/i.test(cmmd.type)) {
				this.applyCmmdPoint(timeline, moments, timelineElems, cmmd, eventClass, cmmd.once, timestampHead);
			} else {
				console.log('Bad command')
				console.log(cmmd);
				console.log('Must be string or have type of "span" or "point"');
			}
		}
	},
	applyCmmdSpan: function(timeline, moments, timelineElems, cmmd, eventClass, once, timestampHead, id) {
		var id = id === undefined ? timeline.takeNumber() : id;
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		var remove = Timeline.stateFuncs.cmmds.remove;
		var cleanUpWith = cmmd.cleanUpWith;
		var timestampTail = this.getTimestamp(cleanUpWith || timestampHead, 'tail');

		this.pushSpan(timelineElems, cmmd, spawn, remove, id, moments, timestampHead, timestampTail, once, 'cmmds');
	},
	applyCmmdPoint: function(timeline, moments, timelineElems, cmmd, eventClass, once, timestamp, id) {
		var id = id === undefined ? timeline.takeNumber() : id;
		var spawn = Timeline.stateFuncs.cmmds.spawn;
		var oneWay = defaultTo(true, cmmd.oneWay);
		this.pushPoint(moments, timelineElems, id, cmmd, spawn, oneWay, eventClass, once, timestamp);
	},
	pushSpan: function(timelineElems, elemDatum, spawn, remove, id, moments, timestampHead, timestampTail, once, eventClass) {
		var momentHead = this.getOrCreateMoment(moments, timestampHead);
		var momentTail = this.getOrCreateMoment(moments, timestampTail);
		//need to disable partner
		var eventHead = new Timeline.Event.Span(this, timelineElems, elemDatum, spawn, remove, id, 'head', once, momentHead);
		var eventTail = new Timeline.Event.Span(this, timelineElems, elemDatum, spawn, remove, id, 'tail', once, momentTail);
		eventHead.partner = eventTail;
		eventTail.partner = eventHead;

		momentHead.events[eventClass].push(eventHead);
		momentTail.events[eventClass].push(eventTail);		
	},
	pushPoint: function(moments, timelineElems, id, elemDatum, spawn, oneWay, eventClass, once, timestamp) {
		var moment = this.getOrCreateMoment(moments, timestamp);
		var event = new Timeline.Event.Point(this, timelineElems, elemDatum, spawn, id, oneWay, once, moment);
		moment.events[eventClass].push(event);
	},
	getTimestamp: function(time, when) {
		var timeAdj;
		if (/tailhtml/i.test(when)) {
			timeAdj = .8;
		} else if (/tail/i.test(when)) {
			timeAdj = .9;
		} else if (/setup/i.test(when)) {
			timeAdj = .1;
		} else if (/headhtml/i.test(when)) {
			timeAdj = .2;
		} else if (/head/i.test(when)) {
			timeAdj = 0;
		} else if (/branchPreClean/i.test(when)) {
			timeAdj = .85;
		} else if (/branchPostClean/i.test(when)) {
			timeAdj = .95;
		}

		var idx = this.parseIntegerTimeIdx(time);

		if (idx == -1 && when == 'tail') {
			return Infinity;
		} else {
			return idx + timeAdj;

		}
	},
	getTimestampType: function(timestamp) {
		if (timestamp % 1 == .8) {
			return 'tailhtml';
		} else if (Math.abs(timestamp % 1 - .9) <1e-5) {
			return 'tail';
		} else if (Math.abs(timestamp % 1 - .1) <1e-5) {
			return 'setup';
		} else if (Math.abs(timestamp % 1 - .2) <1e-5) {
			return 'headhtml';
		} else if (Math.abs(timestamp % 1 - .0) <1e-5) {
			return 'head';
		} else if (Math.abs(timestamp % 1 - .85) <1e-5) {
			'branchPreClean';
		} else if (Math.abs(timestamp % 1 - .15) <1e-5) {
			'branchPostClean';
		}
	},
	parseIntegerTimeIdx: function(time) {
		if (typeof time == 'string') {
			if (/section/i.test(time)) {
				return -1;
			} else {
				var str = /[0-9]+/.exec(time);
				if (str !== '') {
					return Number(str);
				} else {
					console.log('Bad time code: ' + time);
				}
			}
		} else {
			return time;
		}	
	},
	getOrCreateMoment: function(moments, timestamp) {
		for (var i=0; i<moments.length; i++) {
			if (moments[i].timestamp == timestamp) return moments[i];
		}
		moments.push(new Timeline.Moment(timestamp));
		return moments[moments.length - 1];
	},
}


Timeline.stateFuncs = {
	walls: {
		spawn: function(section, elems, id, datum) {
			elems[id] = section.walls.addWall(datum);
		},
		remove: function(section, elems, id) {
			var wall = elems[id];
			if (wall) section.walls.removeWall(wall.handle);
			elems[id] = undefined;		
		}
	},
	dots: {
		spawn: function(section, elems, id, datum) {
			section.spcs[datum.spcName].populate(datum.pos, datum.dims, datum.count, datum.temp, datum.tag, id, datum.returnTo);
			elems[id] = 'dots';
		},
		remove: function(section, elems, id) {
			section.dotManager.removeByAttr('elemId', id);
			elems[id] = undefined;
		}
	},
	objs: {
		spawn: function(section, elems, id, datum) {
			var objFunc = window[datum.type];
			if (!objFunc) console.log('Bad object type ' + datum.type);
			elems[id] = new objFunc(datum.attrs);
		},
		remove: function(section, elems, id) {
			var obj = elems[id];
			if (obj) obj.remove();
			elems[id] = undefined;
		}
	},
	dataRecord: {
		spawn: function(section, elems, id, entry) {
			if (/collisions/i.test(entry.data)) {
				section.collide.recordCollisions();
			} else {
				section.walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase()](entry.attrs);
			}
			elems[id] = entry;
		},
		remove: function(section, elems, id) {
			var entry = elems[id];
			if (/collisions/i.test(entry.data)) {
				section.collide.recordCollisionsStop();
			} else {
				section.walls[entry.wallInfo]['record' + entry.data.toCapitalCamelCase() + 'Stop'](entry.attrs)
			}
			elems[id] = undefined;
		}
	},
	dataReadouts: {
		spawn: function(section, elems, id, datum) {
			var displayEntry = section.dataDisplayer.addEntry(datum);
			elems[id] = displayEntry;
		},
		remove: function(section, elems, id) {
			var displayEntry = elems[id];
			displayEntry.remove();
			elems[id] = undefined;
		}
	},
	triggers: {
		spawn: function(section, elems, id, datum) {
			elems[id] = new window.Trigger(datum);
		},
		remove: function(section, elems, id) {
			var trigger = elems[id];
			trigger.remove();
			elems[id] = undefined;
		}
	},
	graphs: {
		spawn: function(section, elems, id, graphDatum) {
			var graph = new window.Graphs[graphDatum.type](graphDatum);
			for (var setIdx=0; setIdx<graphDatum.sets.length; setIdx++) {
				var set = graphDatum.sets[setIdx];
				graph.addSet(set);
			}
			section.level.graphs[graphDatum.handle] = graph;
			elems[id] = graph;
		},
		remove: function(section, elems, id) {
			var graph = elems[id];
			graph.remove();
			elems[id] = undefined;
		}		
	},
	rxns: {
		spawn: function(section, elems, id, rxnDatum) {
			var rxn = section.collide.addReaction(rxnDatum);
			elems[id] = rxn;
		},
		remove: function(section, elems, id) {
			var rxn = elems[id];
			rxn.remove();
			elems[id] = undefined;
		}		
	},
	buttonGrps: {
		spawn: function(section, elems, id, grpDatum) {
			section.buttonManager.addGroup(grpDatum.handle, grpDatum.label, grpDatum.prefIdx, grpDatum.isRadio, grpDatum.isToggle);
			if (grpDatum.buttons) {
				for (var i=0; i<grpDatum.buttons.length; i++) {
					var buttonDatum = grpDatum.buttons[i];
					section.buttonManager.addButton(grpDatum.handle, buttonDatum.handle, buttonDatum.label, buttonDatum.exprs, buttonDatum.prefIdx, buttonDatum.isDown);
				}
			} else {
				console.log('Button group ' + grpDatum.handle + ' has no buttons.  Just thought you should know.  This object is logged below.');
				console.log(grpDatum);
			}
			elems[id] = grpDatum;
		},
		remove: function(section, elems, id) {
			var grpDatum = elems[id];
			section.buttonManager.removeGroup(grpDatum.handle);
			elems[id] = undefined;
		}
	},
	cmmds: {
		spawn: function(section, elems, id, cmmd) {
			var spawnExpr = cmmd.spawn;
			elems[id] = cmmd;
			if (spawnExpr) {
				with (DataGetFuncs) {
					if (typeof spawnExpr == 'function') {
						spawnExpr();
					} else if (typeof spawnExpr == 'string') {
						eval('(' + spawnExpr + ')');	
					} else if (spawnExpr instanceof Array) {
						var expr = spawnExpr.join(';') + ';';
						eval('(' + expr + ')');
					}
				}
			}
		},
		remove: function(section, elems, id) {
			var cmmd = elems[id];
			elems[id] = undefined;
			// if (!cmmd) {
				// console.log('omg no command');
			// }
			var removeExpr = cmmd.remove;
			if (removeExpr) {
				with (DataGetFuncs) {
					if (typeof removeExpr == 'function') {
						removeExpr();
					} else if (typeof removeExpr == 'string') {
						eval('(' + removeExpr + ')');	
					} else if (removeExpr instanceof Array) {
						var expr = removeExpr.join(';') + ';';
						eval('(' + expr + ')');
					}
				}
			}			
		}
	}

}

// can have one-time, point, and span commands, I guess
// point should only apply when going forward 
Timeline.Moment = function(timestamp) {
	this.timestamp = timestamp;
	this.events = new Timeline.EventClassHolder();
	//I *think* we can group it into walls, generics, cmmds, setups .
	//setups may be able to be rolled into commands.  Setup will be like linking two objects that are added in an unknown order.  Not necessary for linking objects to walls since order is known.  
		//A point command would probably work.
	//Generics include any objects, listeners, graphs, etc.  Anything that will have spawn/remove.  If there are interdependancies, 
}

Timeline.Moment.prototype = {
	fire: function(from, to) {
		this.fireSpans(this.events.dots, from, to);
		this.fireSpans(this.events.walls, from, to);
		this.fireSpans(this.events.objs, from, to);
		this.fireCmmds(this.events.cmmds, from, to);
	},
	fireSpans: function(spans, from, to) {
		for (var i=0; i<spans.length; i++) {
			this.fireSpan(spans[i], from, to);
		}
	},
	fireSpan: function(span, from, to) {
		if (span.active) {
			var elemDatum = getAndEval(span.elemDatum);
			if (span.boundType == 'head') {
				if (from < to && from < this.timestamp && to < span.partner.moment.timestamp) {
					span.spawn(span.section, span.timelineElems, span.id, elemDatum);
				} else if (to < from && to < this.timestamp && from <= span.partner.moment.timestamp) {
					span.remove(span.section, span.timelineElems, span.id);
					if (span.once) {
						span.active = false;
						span.partner.active = false;
					}
				}
			} else if (span.boundType == 'tail') {
				if (to > from && from >= span.partner.moment.timestamp) {
					span.remove(span.section, span.timelineElems, span.id);
					if (span.once) 
						span.active = false;
				} else if (to < from && to >= span.partner.moment.timestamp) {
					span.spawn(span.section, span.timelineElems, span.id, elemDatum);
				}
			}
		}
	},
	fireCmmds: function(cmmds, from, to) {
		var elemDatum;
		for (var i=0; i<cmmds.length; i++) {
			var event = cmmds[i];
			if (event instanceof Timeline.Event.Span) {
				this.fireSpans([event], from, to)
			} else if (event instanceof Timeline.Event.Point) {
				if (((from < this.timestamp && this.timestamp <= to) || (to <= this.timestamp && this.timestamp < from)) && (event.elemDatum.oneWay ? from < to : true) && event.active) {
					elemDatum = getAndEval(event.elemDatum);
					event.spawn(event.section, event.timelineElems, event.id, elemDatum);
					if (event.once) {
						event.active = false;
					}
				}
			}
		}
	}
}

Timeline.Command = function(type, spawn, remove, oneWay, once, cleanUpWith) {
	this.type = type;
	this.spawn = spawn;
	this.remove = remove;
	this.oneWay = oneWay;
	this.once = once;
	this.cleanUpWith = cleanUpWith;
}

Timeline.EventClassHolder = function() {
	this.walls = [];
	this.dots = [];
	this.objs = [];
	this.cmmds = [];

}

Timeline.Event = {
	Span: function(section, timelineElems, elemDatum, spawn, remove, id, boundType, once, moment) {
		this.section = section;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.remove = remove;
		this.id = id;
		this.boundType = boundType;
		this.moment = moment;
		this.once = once;
		this.active = true;
		this.parnter;
	},
	Point: function(section, timelineElems, elemDatum, spawn, id, oneWay, once, moment) {
		this.section = section;
		this.timelineElems = timelineElems;
		this.elemDatum = elemDatum;
		this.spawn = spawn;
		this.id = id;
		this.oneWay = oneWay;
		this.moment = moment;
		this.once = once;
		this.active = true;
	},

}
Timeline.Branch = function(timeline, id) {
	this.timeline = timeline;
	this.id = id;
}