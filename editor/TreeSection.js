
function TreeSection(tree, posInit, sectionDragFuncs, promptDragFuncs, clickFuncs, labelText, isPlacer, inheritedId) {
	this.tree = tree;
	this.prompts = [];
	this.sectionDragFuncs = sectionDragFuncs;
	this.promptDragFuncs = promptDragFuncs;
	this.clickFuncs = clickFuncs;
	this.labelText = labelText;
	this.isPlacer = isPlacer;
	this.pos = posInit.copy();
	this.button = new ArrowButton(this.tree, this, this.pos, this.sectionDragFuncs, this.clickFuncs, this.labelText, isPlacer);
	if (inheritedId === undefined) {
		this.id = data.getSectionId();
		this.register();
	} else {
		this.id = inheritedId;
	}
	if (!$('#' + this.id).length) {
		$('#objDiv').append(templater.div({attrs: {id: [this.id]}}));
	}
	this.sceneData = new SceneData($('#' + this.id));
	this.initSectionIdx = undefined; //for dragging
	this.mousePosInit = P(0, 0); //for dragging
	this.sectionYs = []; //for dragging
 
}
/*
For section, need to store: 
	list of prompts: ['p1', 'p3', ...]
	sectionDragFuncs
	promptDragFuncs
	clickFuncs
	isPlacer
	labelText - if button.haveUpdatedLabel, store, else undefined

	
	Yo yo, should do some kind of what meta-data each thing has for generalized getting.  Or maybe not since getting will only be done in one place and arguments are given in order, so I'll need to specify at some point anyway...
*/
TreeSection.prototype = {
	addElement: function(elem) {
		this.sceneData.addElement(elem);
	},
	addPrompt: function(cornerPos, prompt) {
		var newIdx = this.getNewPromptIdx(cornerPos);
		if (!prompt) {
			prompt = new TreePrompt(this.tree, this, cornerPos, this.promptDragFuncs, this.clickFuncs, '')
		}
		this.prompts.splice(newIdx, 0, prompt);
		var promptIds = this.getPromptIds();
		data.change(this.id + 'Prompts', promptIds);
	},
	loadPrompts: function(renderData, newPromptIds, editingId, pos, toRemove) {
		var oldPrompts = this.prompts;
		var newPrompts = [];
		var oldPromptIds = this.getPromptIds();
		for (var idIdx=0; idIdx<newPromptIds.length; idIdx++) {
			var promptId = newPromptIds[idIdx];
			var idxInOld = oldPromptIds.indexOf(promptId);
			var displayPos = pos.copy().movePt(V(this.tree.promptIndent, 0));
			if (promptId == editingId) {
				displayPos = this.buttonPosObjectModeSelected;
			}
			var labelText = renderData.get(promptId + 'LabelText'); //undefined if at default
			if (promptId == editingId) {
				displayPos = this.tree.buttonPosObjectModeSelected;
			}
			if (idxInOld != -1) {
				toRemove[promptId].remove = false;
				var newPrompt = oldPrompts[idxInOld];
				newPrompt.move(displayPos, 'snap');
			} else {
				var newPrompt = new TreePrompt(this.tree, this, displayPos, this.promptDragFuncs, this.clickFuncs, '', promptId);
			}
			if (promptId == editingId) {
				this.tree.editingButton = newPrompt.button;
			}
			if (labelText) {
				newPrompt.updateLabel(labelText, false, true);
			}
			pos.y += this.tree.totalButtonHeight;
			newPrompts.push(newPrompt);
		}		
		this.prompts = newPrompts;
	},
	register: function() {
		data.add(this.id + 'Prompts', []);
		data.add(this.id + 'SectionDragFuncs', this.sectionDragFuncs);
		data.add(this.id + 'PromptDragFuncs', this.promptDragFuncs);
		data.add(this.id + 'ClickFuncs', this.clickFuncs);
		if (this.button.haveUpdatedLabel) {
			data.add(this.id + 'LabelText', this.labelText);
		} else {
			data.add(this.id + 'LabelText', undefined);
		}
	},
	getPromptIds: function() {
		var ids = [];
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			ids.push(this.prompts[promptIdx].getId());
		}
		return ids;
	},
	getId: function() {
		return this.id;
	},
	hide: function() {
		this.button.hide();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].hide();
		}
	},
	show: function() {
		this.button.show();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].show();
		}
	},
	updateLabel: function(labelText, settingToDefault, isLoading) {
		this.labelText = labelText;
		this.button.updateLabel(labelText, settingToDefault, isLoading);
	},
	toFront: function() {
		this.button.toFront();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].toFront();
		}
	},
	move: function(moveOrder, type, time) {
		if (this.button.move(moveOrder, type, time)) {
			if (moveOrder instanceof Vector) {
				this.pos.movePt(moveOrder);
			} else {
				this.pos.set(moveOrder);
			}
		}
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].move(moveOrder, type, time);
		}
	},
	getNewPromptIdx: function(releasePos) {
		var y = this.pos.y + this.tree.totalButtonHeight;
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			if (y  > releasePos.y) {
				return promptIdx;
			}
			y += this.tree.totalButtonHeight;
		}		
		return this.prompts.length;
	},
	fadeOut: function() {
		this.button.fadeOut();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].fadeOut();
		}
	},
	fadeOutPrompt: function(promptIdx) {
		this.prompts[promptIdx].fadeOut();
		this.prompts.splice(promptIdx, 1);
	},
	getPromptIdx: function(prompt) {
		return this.prompts.indexOf(prompt);
	},
	remove: function() {
		this.button.remove();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].remove();
		}
		this.prompts = [];
	},
	removePrompt: function(promptIdx) {
		if (this.prompts[promptIdx]) {
			this.prompts[promptIdx].remove();
		} else {
			console.log('tried to remove prompt idx ' + promptIdx + ' from some section, which is not helpful at all.  It does not exist.');
			console.trace();
		}
	},
	totalHeight: function() {
		return this.tree.totalButtonHeight*(1+this.prompts.length);
	},
	totalWidth: function() {
		return this.tree.buttonDims.dx;
	}
}

