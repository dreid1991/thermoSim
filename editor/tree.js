function Tree(paper/*, pos*/) {
	this.paper = paper;
	this.someImage = new Image();
	this.someImage.src = 'undo.GIF';
	this.buttonDims = config.buttonDimsLarge;
	this.innerRectDims = V(30, this.buttonDims.dy);
	this.buttonSpacing = 7;
	this.displaceDist = 9;
	this.degToRad = 360/(2*Math.PI);
	this.panelDimsTop = V(this.paper.width, 2*this.buttonDims.dy+3*this.buttonSpacing);
	this.panelDimsBottom = V(this.paper.width, 50);
	this.pos = P(15, 10 + this.panelDimsTop.dy); //upper left corner of first section
	this.posO = this.pos.copy();
	this.totalButtonHeight = this.buttonDims.dy + this.buttonSpacing;
	this.buttonPosObjectModeSelected = P(this.buttonSpacing, this.panelDimsTop.dy-this.totalButtonHeight);
	this.objSelectorPos = P(this.panelDimsTop.dx - this.buttonSpacing - this.buttonDims.dx, this.panelDimsTop.dy-this.totalButtonHeight)
	this.labelIndent = 3;
	this.labelTextSize = config.textSizeMed;
	this.promptIndent = 30;
	this.rectRounding = config.buttonRounding;
	this.innerRectWidth = 25;
	this.arrowDims = V(17, 26);
	this.arrowThickness = 4;
	this.arrowSpacing = 3;
	this.arrowOffset = 5;
	this.numArrows = 2;
	this.snapDist = 5;
	this.edgePadding = 10;//dist placer rect is from edge
	this.placerBlockTolerance = 10; //how close placer block has to be before stuff starts moving out of the way
	this.bgCol = Col(255, 255, 255);
	this.panelCol = Col(230, 230, 230);//do a gradient, yo
	this.arrowCol = Col(255, 255, 255);
	this.rectCol = config.buttonFillCol;
	this.rectColHover = config.buttonFillColHover;//'#5c93b2';
	//this.rectColSelect = Col(82, 108, 122);//'#526c7a';
	//this.rectColStroke = Col(59, 68, 73);//'#3b4449';
	this.objSelector = new Dropdown(this, this.objSelectorPos, this.buttonDims, 'New object', this.rectCol, this.rectColHover);
	this.populateObjSelector();
	this.mode = 'tree';
	//this.circleCol = Col(59, 68, 73);//Col(120, 180, 213);
	//this.circleColHover = Col(110, 170, 203);
	this.placerButtonPos = P(this.paper.width - this.buttonDims.dx - this.edgePadding, this.paper.height - this.buttonDims.dy - this.edgePadding);
	this.trashPos = this.placerButtonPos.copy().movePt(V(-160, 0));
	this.defineSectionDragFuncs();
	this.definePromptDragFuncs();
	this.defineClickFuncs();
	this.defineBGRectDragFuncs();
	this.definePlacerRectFuncs();
	this.panels = this.makePanels();
	this.placerButtonBG = this.makePlacerButton(false);
	this.placerButton = this.makePlacerButton(true);
	this.bgRect = this.makeBGRect();
	this.editingButton = undefined; //the one getting working on while in object mode
	this.clickedButton = undefined;
	this.receptacles = [this.makeTrash(this.trashPos)];
	this.dirButtonDims = config.buttonDimsSmall;
	this.dirButtons = this.makeDirButtons();
	this.sections = [];
	this.topButtons = []; //for fading buttons and such.  Is placed on top after statics
	data.add('tSections', []);
	data.add('tMode', 'tree');
}

/*
For tree, need to store:
	sections: ['s1', 's4', 's2'...]
	mode: - maybe not?  Actually, maybe so
*/

_.extend(Tree.prototype, SectionFuncs, PromptFuncs, BGRectFuncs, PlacerRectFuncs, TrashFuncs, ReceptacleFuncs,  {
	addSection: function(mousePos, section) {
		var pos = posOnPaper(mousePos, this.paper);
		var sectionIdx = this.getNewSectionIdx(pos);
		var label = '';
		var section = new TreeSection(this, pos, this.sectionDragFuncs,  this.promptDragFuncs, this.clickFuncs, label);
		
		this.sections.splice(sectionIdx, 0, section);
		this.setDefaultLabels();
		var sectionIds = this.getSectionIds();
		data.change('tSections', sectionIds);
		this.moveAllToPositions('fly');
	},
	getSectionIds: function() {
		var ids = [];
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			ids.push(this.sections[sectionIdx].getId());
		}
		return ids;
	},
	addPrompt: function(mousePos, prompt) {
		var pos = posOnPaper(mousePos, this.paper);
		var sectionIdx = this.getNewPromptSectionIdx(pos);
		this.sections[sectionIdx].addPrompt(pos, prompt);
		this.setDefaultLabels();
		this.moveAllToPositions('fly');
	},
	toObjectMode: function() {
		this.bgRect.hide();
		this.mode = 'object';
		this.hideBottomPanel()
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			section.button.toObjectMode();
			var prompts = section.prompts;
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				prompts[promptIdx].button.toObjectMode();
			}
		}
	},
	staticsToFront: function() {
		this.panels.bottom.toFront();
		this.panels.top.toFront();
		this.placerButtonBG.toFront();
		this.placerButton.toFront();
		for (var receptIdx=0; receptIdx<this.receptacles.length; receptIdx++) {
			this.receptacles[receptIdx].toFront();
		}
		this.dirButtons.redo.toFront();
		this.dirButtons.undo.toFront();
		//for (var buttonIdx
		for (var topButtonIdx=0; topButtonIdx<this.topButtons.length; topButtonIdx++) {
			this.topButtons[topButtonIdx].toFront();
		}
	},
	addTopButton: function(button) {
		this.topButtons.push(button);
	},
	removeTopButton: function(button) {
		var idx = this.topButtons.indexOf(button);
		if (idx!=-1) {
			this.topButtons.splice(idx, 1);
		}
	},
	hideBottomPanel: function() {
		this.panels.bottom.hide();
		//this.baseRects[1].hide()
		this.placerButtonBG.hide();
		this.placerButton.hide();
		this.hideReceptacles();	
	},
	showBottomPanel: function() {
		this.panels.bottom.show();
		//this.baseRects[1].show();
		//for (var buttonIdx=0; buttonIdx<this.buttons.length; buttonIdx++) {
		//	this.buttons[buttonIdx].sohw();
		//}
		this.placerButtonBG.show();
		this.placerButton.show();
		this.showReceptacles();
	},
	toTreeMode: function() {
		this.bgRect.show();
		this.mode = 'tree';
		this.showBottomPanel();
		this.editingButton = undefined;
		this.unclickButton();
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			section.button.toTreeMode();
			var prompts = section.prompts;
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				prompts[promptIdx].button.toTreeMode();
			}
		//to object mode moves each button.  to tree mode gets moved by the moveAllToPositions function.  This is an acceptable inconsistancy because the buttons don't individually know where to go in to tree mode
		}
		
		this.moveAllToPositions('fly');
	},
	load: function(renderData) {
		var x, y;
		y = this.pos.y;
		if (this.mode == 'tree') {
			x = this.pos.x;
		} else if (this.mode == 'object') {
			x = -this.buttonDims.dx - 50;
		}
		var pos = P(x, y);
		var sectionIds = renderData.get('tSections');
		if (this.editingButton) {
			var editingId = this.editingButton.parent.getId();
		}
		this.editingButton = undefined;
		var oldSectionIds = this.getSectionIds();
		var toRemove = this.makeToRemove(oldSectionIds);
		this.loadSections(renderData, sectionIds, editingId, pos, oldSectionIds, toRemove);
		this.removeUnused(toRemove);
		this.setDefaultLabels();
		if (this.mode == 'object' && this.editingButton == undefined) { //then uh oh, the one we were working on was removed!
			this.toTreeMode();
		} 
		this.staticsToFront();
		if (this.editingButton) {
			this.editingButton.toObjectMode();
			this.editingButton.toFront();
		}		
	},
	loadSections: function(renderData, newSectionIds, editingId, pos, oldSectionIds, toRemove) {
		var oldSections = this.sections;
		var newSections = [];
		
		for (var idIdx=0; idIdx<newSectionIds.length; idIdx++) {
			var sectionId = newSectionIds[idIdx];
			var idxInOld = oldSectionIds.indexOf(sectionId);
			var displayPos = pos;
			if (sectionId == editingId) {
				displayPos = this.buttonPosObjectModeSelected;
			}
			var labelText = renderData.get(sectionId + 'LabelText'); //undefined if at default
			if (sectionId == editingId) {
				displayPos = this.buttonPosObjectModeSelected;
			}
			if (idxInOld != -1) {
				toRemove[sectionId].remove = false
				var newSection = oldSections[idxInOld];
				newSection.move(displayPos, 'snap');
			} else {
				var sectionDragFuncs = renderData.get(sectionId + 'SectionDragFuncs');
				var promptDragFuncs = renderData.get(sectionId + 'PromptDragFuncs');
				var clickFuncs = renderData.get(sectionId + 'ClickFuncs');		
				var newSection = new TreeSection(this, displayPos, sectionDragFuncs, promptDragFuncs, clickFuncs, '', false, sectionId)				
			}
			if (labelText) {
				newSection.updateLabel(labelText, false, true);
			}
			if (sectionId == editingId) {
				this.editingButton = newSection.button;
			}
			var newPromptIds = renderData.get(sectionId + 'Prompts');
			pos.y += this.totalButtonHeight;
			newSection.loadPrompts(renderData, newPromptIds, editingId, pos, toRemove);
			newSections.push(newSection);
		}
		this.sections = newSections;
		

	},
	makeToRemove: function() {
		var toRemove = {};
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			toRemove[this.sections[sectionIdx].getId()] = {remove: true, obj: this.sections[sectionIdx]};
			var prompts = this.sections[sectionIdx].prompts;
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				toRemove[prompts[promptIdx].getId()] = {remove: true, obj: prompts[promptIdx]};
			}
		}
		return toRemove;
	},
	populateObjSelector: function() {
	
	},
	removeUnused: function(toRemove) {
		for (var id in toRemove) {
			if (toRemove[id].remove) {
				toRemove[id].obj.button.remove();
				//Yo yo, later will have to make like a JUST THE BUTTON, NOT CHILDREN thing if there's other data besides the button associated with a thing, which there will be.
			}
		}
	},
	removeSections: function() {
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			this.sections[sectionIdx].remove();
		}
		this.sections = [];
	},
	setDefaultLabels: function() {
		var sectionLabel, label;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			sectionLabel = 'Section ' + (sectionIdx+1);
			this.sections[sectionIdx].updateLabel(sectionLabel, true);
			var prompts = this.sections[sectionIdx].prompts;
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				label = sectionLabel + ' prompt ' + (promptIdx+1);
				prompts[promptIdx].updateLabel(label, true);
			}
		
		}
	},
	makeDirButtons: function() { 
		var pos = P(this.buttonSpacing, this.buttonSpacing);
		var redo = new Button(this.paper, pos, this.dirButtonDims, undefined, function(){data.redo()}, 'imgRedo');
		pos.movePt(V((this.dirButtonDims.dx + this.buttonSpacing), 0));
		var undo = new Button(this.paper, pos, this.dirButtonDims, undefined, function(){data.undo()}, 'imgUndo');
		return {undo: undo, redo: redo};
	},
	//for these two remove functions, can send idxs or just the object you want to remove.  Type-safe my foot
	//all removing is done through these two.
	showReceptacles: function() {
		for (var receptIdx=0; receptIdx<this.receptacles.length; receptIdx++) {
			this.receptacles[receptIdx].show();
		}
	},
	hideReceptacles: function() {
		for (var receptIdx=0; receptIdx<this.receptacles.length; receptIdx++) {
			this.receptacles[receptIdx].hide();
		}
	},
	makePanels: function() {
		var bottom = this.paper.rect(0, this.paper.height - this.panelDimsBottom.dy, this.panelDimsBottom.dx, this.panelDimsBottom.dy).attr({
			fill: this.panelCol.hex
		})
		var top = this.paper.rect(0, 0, this.panelDimsTop.dx, this.panelDimsTop.dy).attr({
			fill: this.panelCol.hex
		})
		return {bottom:bottom, top:top}
	},
	removeSection: function(sectionIdx) {
		if (sectionIdx instanceof TreeSection) {
			sectionIdx = this.sections.indexOf(sectionIdx);
		}
		if (this.sections[sectionIdx]) {
			this.sections[sectionIdx].remove();
			this.sections.splice(sectionIdx, 1);
			this.moveAllToPositions('fly');
		} else {
			console.log('tried to remove section idx ' + sectionIdx + '.  Does not exist.');
			console.trace();
		}
	
	},
	removePrompt: function(sectionIdx, promptIdx) {
		if (sectionIdx instanceof TreePrompt) {
			var prompt = sectionIdx;
			for (var sectionIdx=0; sectionIdx<this.section.length; sectionIdx++) {
				promptIdx = this.sections[sectionIdx].prompts.indexOf(prompt);
				if (promptIdx != -1) {
					break;
				}
			}
		}
		this.sections[sectionIdx].removePrompt(promptIdx);
		this.moveAllToPositions('fly');
	},
	removeUnknown: function(button) {
		if (button instanceof TreeSection) {
			this.removeSection(button);
		} else if (button instanceof TreePrompt) {
			this.removePrompt(button);
		} else {
			console.log('Tried to remove a MYSTERIOUS OBJECT!');
			console.trace();
		}
	},
	fadeOutSection: function(sectionIdx) {
		if (sectionIdx instanceof TreeSection) {
			sectionIdx = this.sections.indexOf(sectionIdx);
		}
		if (this.sections[sectionIdx]) {
			this.sections[sectionIdx].fadeOut();
			this.sections.splice(sectionIdx, 1);
			this.moveAllToPositions('fly');
		} else {
			console.log('tried to remove section idx ' + sectionIdx + '.  Does not exist.');
			console.trace();
		}
	
	},
	fadeOutPrompt: function(sectionIdx, promptIdx) {
		if (sectionIdx instanceof TreePrompt) {
			var prompt = sectionIdx;
			for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
				promptIdx = this.sections[sectionIdx].prompts.indexOf(prompt);
				if (promptIdx != -1) {
					break;
				}
			}
		}
		this.sections[sectionIdx].fadeOutPrompt(promptIdx);
		this.moveAllToPositions('fly');
	},
	fadeOutUnknown: function(button) {
		if (button instanceof TreeSection) {
			this.fadeOutSection(button);
		} else if (button instanceof TreePrompt) {
			this.fadeOutPrompt(button);
		} else {
			console.log('Tried to fade out a MYSTERIOUS OBJECT!');
			console.trace();
		}	
	},
	unclickButton: function() {
		this.clickedButton = undefined;
	},
	getNewSectionIdx: function(pos) {
		var y = this.pos.y;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var sectionHeight = this.sections[sectionIdx].totalHeight();
			if (y > pos.y) {
				return sectionIdx;
			}
			y += sectionHeight;
		}
		return this.sections.length;
	},
	getNewPromptSectionIdx: function(pos) {
		var y = this.pos.y;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var sectionHeight = this.sections[sectionIdx].totalHeight();
			if (y + sectionHeight>pos.y) {
				return sectionIdx;
			}
			y += sectionHeight;
		}
		return this.sections.length-1;
	},
	getButtonPos: function(button) {
		//yo yo, your context may be off here.  Haven't decided who's calling it yet.  Probably button.
		var y = this.pos.y;
		var x = this.pos.x;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			if (this.sections[sectionIdx].button == button) {
				return P(x, y);
			}
			y += this.totalButtonHeight;
			for (var promptIdx=0; promptIdx<this.sections[sectionIdx].prompts.length; promptIdx++) {
				if (this.sections[sectionIdx].prompts[promptIdx].button == button) {
					return P(x + this.promptIndent, y);
				}
				y += this.totalButtonHeight;
			}
		}
	},
	getButtonPosFromIdxs: function(idxs) { //idxs being sectionIdx, promptIdx, with promptIdx = -1 if it's for the section
		var button;
		if (idxs.promptIdx == -1) {
			button = this.sections[idxs.sectionIdx].button;
		} else {
			button = this.sections[idxs.sectionIdx].prompts[idxs.promptIdx].button;
		}
		return this.getButtonPos(button);
	},
	getSectionIdx: function(section) {
		return this.sections.indexOf(section);
	},
	totalHeight: function() {
		var totalHeight = 0;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			totalHeight += this.sections[sectionIdx].totalHeight();
		}
		return totalHeight;
	},

	fadeOut: function(obj, time) {
		time = defaultTo(time, 250);
		obj.animate({opacity:0}, time, undefined, function(){this.remove()});
	},
	inButtonColumn: function(pos) {
		var maxX = this.pos.x + this.buttonDims.dx + this.promptIndent + this.placerBlockTolerance;
		var minX = this.pos.x - this.placerBlockTolerance;
		return pos.x + this.buttonDims.dx > minX && pos.x < maxX;
	},
	inSectionColumn: function(pos) {
		var maxX = this.pos.x + this.promptIndent;
		return pos.x < maxX;
	},

	defineClickFuncs: function() {
		this.clickFuncs = {
			rect: {
				tree: this.onClickRectTreeMode,
				object: this.onClickRectObjectMode
			},
			arrows: {
				tree: this.onClickArrowsTreeMode,
				object: this.onClickArrowsObjectMode
			}
		}
	},
	onClickRectTreeMode: function() {
		console.log("I'm a rectangle!");
	},
	onClickRectObjectMode: function() {
		console.log("I'm a rectangle!");
	},
	onClickArrowsObjectMode: function() {
		this.parent.tree.toTreeMode();
	},
	onClickArrowsTreeMode: function() {
		this.parent.tree.toObjectMode();
	},
	getSectionYs: function() {
		var y = this.pos.y;
		var ys = [];
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			ys.push(y);
			y += this.totalButtonHeight * (1 + this.sections[sectionIdx].prompts.length);
		}
		return ys;
	},
	makeTrash: function() {
		return new Receptacle(this, this.trashPos, this.buttonDims, 'Trash', this.trashOnHoverIn, this.trashOnHoverOut, this.trashOnDropInto);
	},
	moveAllToPositions: function(moveStyle) {
		var x = this.pos.x;
		var y = this.pos.y;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			if (section.button != this.clickedButton && !section.button.inUse) {
				section.button.move(P(x, y), moveStyle);
				section.pos.set(P(x,y));
				y += this.totalButtonHeight;
				for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
					var prompt = section.prompts[promptIdx];
					if (prompt.button != this.clickedButton && !prompt.button.inUse) {
						prompt.button.move(P(x+this.promptIndent, y), moveStyle);
					}
					y += this.totalButtonHeight;
				}
			} else {
				y += this.sections[sectionIdx].totalHeight();
			}
		}
		if (this.clickedButton) {
			this.clickedButton.groupToFront();
		}
		this.staticsToFront();
	},

})

function TreeSection(tree, posInit, sectionDragFuncs, promptDragFuncs, clickFuncs, labelText, isPlacer, inheritedId) {
	this.tree = tree;
	this.prompts = [];
	this.pos = posInit.copy();
	this.initSectionIdx = undefined; //for dragging
	this.mousePosInit = P(0, 0); //for dragging
	this.sectionYs = []; //for dragging
	this.sectionDragFuncs = sectionDragFuncs;
	this.promptDragFuncs = promptDragFuncs;
	this.clickFuncs = clickFuncs;
	this.labelText = labelText;
	this.isPlacer = isPlacer;
	this.button = new ArrowButton(this.tree, this, this.pos, this.sectionDragFuncs, this.clickFuncs, this.labelText, isPlacer);
	if (inheritedId === undefined) {
		this.id = data.getSectionId();
		this.register();
	} else {
		this.id = inheritedId;
	}
 
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

/*
For prompt, need to store:
	labelText - if button.haveChangedLabel, store, else undefined
	
*/

function TreePrompt(tree, section, posInit, dragFuncs, clickFuncs, labelText, inheritedId) {
	this.tree = tree;
	this.section = section;
	this.dragFuncs = dragFuncs;
	this.clickFuncs = clickFuncs;
	this.labelText = labelText;
	this.button = new ArrowButton(this.tree, this, posInit, this.dragFuncs, this.clickFuncs);
	if (inheritedId === undefined) {
		this.id = data.getPromptId();
		this.register();
	} else {
		this.id = inheritedId;
	}
}

TreePrompt.prototype = {
	getSection: function() {
		return this.section;
	},
	getId: function() {
		return this.id;
	},
	register: function() {
		if (this.button.haveUpdatedLabel) {
			data.add(this.id + 'LabelText', this.labelText);
		} else {
			data.add(this.id + 'LabelText', undefined);
		}
	},
	fadeOut: function() {
		this.button.fadeOut();
	},
	setSection: function(section) {
		this.section = section;
	},
	updateLabel: function(labelText, settingToDefault, isLoading) {
		this.button.updateLabel(labelText, settingToDefault, isLoading);
	},
	totalHeight: function() {
		return this.tree.totalButtonHeight;
	},
	totalWidth: function() {
		return this.tree.buttonDims.dx;
	},
	hide: function() {
		this.button.hide();
	},
	show: function() {
		this.button.show();
	},
	toFront: function() {
		this.button.toFront();
	},
	remove: function() {
		this.button.remove();
	},
	move: function(moveOrder, type, time) {
		this.button.move(moveOrder, type, time);
	}
}


var assignHover = {
	assignHover: function(raphaelShape, toChange, hoverOnCol, hoverOffCol) {
		if (this.isPlacerButton) {
			raphaelShape.hover(this.hoverOnChangeAll, this.hoverOffChangeAll);
		} else {
			raphaelShape.hover(
				function() {
					this.parent[toChange].attr({fill:hoverOnCol.hex});
				},
				function() {
					try{this.parent[toChange].attr({fill:hoverOffCol.hex});
					} catch(e) {console.log('Hovering out of removed shape')};
				}
			)
		}
	},

}


function ArrowButton(tree, parent, posInit, dragFuncs, clickFuncs, labelText, isPlacerButton) {
	this.tree = tree;
	this.mode = 'tree';
	this.pos = posInit.copy();
	this.dragFuncs = dragFuncs;
	this.clickFuncs = clickFuncs;
	this.released = false;
	this.posO = P(0,0);
	this.sectionIdx = Number();
	this.mousePos = P(0,0);
	this.sectionYs = [];
	this.parent = parent;
	this.labelText = undefined;
	this.isPlacerButton = defaultTo(isPlacerButton, false);
	this.rect = this.makeRect();
	this.innerRect = this.makeInnerRect();
	this.arrows = this.makeArrows();
	this.haveUpdatedLabel = false;
	this.updateLabel(labelText, true);
	this.inUse = false;
	if (!this.dragFuncs) { // click is taken care of in drag funcs. 
		this.assignClickFuncs() 
	}
	/*
		click funcs formatted as 
		{
			rect: {
				tree:
				object:
			}
			arrows: {
				tree:
				object:
			}
		}
	*/
	this.arrowAngle = 0;//sorry about right/left, 0/180 use.  right -> 0, left -> 180.  Tossing angle around is nice for getting position without a bunch of ifs
}

_.extend(ArrowButton.prototype, assignHover, {
	toTreeMode: function() {
		this.mode = 'tree';
		if (!this.dragFuncs) {
			this.assignClickFuncs();
		}
		if (this.arrowAngle = Math.PI) {
			this.pointArrows('right')
		}
	},
	hide: function() {
		this.rect.hide();
		this.innerRect.hide();
		this.label.hide();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].hide();
		}
	},
	setUse: function(use) {
		this.inUse = use;
	},
	show: function() {
		this.rect.show().toFront();
		this.innerRect.show().toFront();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].show().toFront();
		}
		this.label.show().toFront();
	},
	toObjectMode: function() {
		this.mode = 'object';
		if (!this.dragFuncs) {
			this.assignClickFuncs();
		}
		if (this == this.tree.clickedButton || this == this.tree.editingButton) {
			this.tree.editingButton = this;
			this.pointArrows('left');
			this.tree.editingButton = this;
			this.flyToPos(this.tree.buttonPosObjectModeSelected, 200);
			//this.flyToPos(P(0, 75));
		} else {
			//this.flyToPos(P(0, 75));
			this.flyToPos(P(-this.tree.buttonDims.dx-50, this.pos.y), 150);
		}
	},
	assignClickFuncs: function() {
		if (this.clickFuncs) {
			this.rect.click(this.clickFuncs[this.mode]['rect']);
			this.innerRect.click(this.clickFuncs[this.mode]['arrows']);
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				this.arrows[arrowIdx].click(this.clickFuncs[this.mode]['arrows']);
			}
		}
	},
	displace: function(dir) {
		var dy;
		if (dir == 'up') {
			dy = -this.tree.displaceDist;
		} else if (dir == 'down') {
			dy = this.tree.displaceDist;
		}
		this.move(V(0, dy), 'fly', 300);
	},
	toPos: function() {
		var pos = this.tree.getButtonPos(this);
		this.move(pos, 'fly', 300);
	},
	makeRect: function() {
		var rect = this.tree.paper.rect(0, 0, this.tree.buttonDims.dx, this.tree.buttonDims.dy, this.tree.rectRounding);
		rect.attr({
			fill: this.tree.rectCol.hex,
			//stroke: this.tree.rectColStroke.hex,
			'stroke-width': 0,
			//'stroke-linejoin': 'round',
		});
		if (this.dragFuncs) {
			rect.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
		}
		this.assignHover(rect, 'rect', this.tree.rectColHover, this.tree.rectCol)

		var pos = this.rectPos();
		translateObj(rect, pos);
		rect.parent = this;
		rect.type = 'rect';
		return rect;
	},
	makeInnerRect: function() {
		var rect = this.tree.paper.rect(0, 0, this.tree.innerRectDims.dx, this.tree.innerRectDims.dy, this.tree.rectRounding);
		rect.attr({
			fill: this.tree.rectCol.hex,
			'stroke-width': 0
			
		});
		if (this.dragFuncs) {
			rect.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
		}
		this.assignHover(rect, 'innerRect', this.tree.rectColHover, this.tree.rectCol);

		var pos = this.innerRectPos();
		translateObj(rect, pos);
		rect.parent = this;
		rect.type = 'arrows';
		return rect;
	},

	makeArrows: function() {
		var tree = this.tree;
		var path = this.makeArrowPath();
		var arrows = [];
		for (var arrowIdx=0; arrowIdx<this.tree.numArrows; arrowIdx++) {
			var pos = this.arrowPos(arrowIdx);
			var arrow = this.tree.paper.path(path);
			translateObj(arrow, pos);
			arrow.attr({
				fill: this.tree.arrowCol.hex,
				'stroke-width': 0
			})
			this.assignHover(arrow, 'innerRect', this.tree.rectColHover, this.tree.rectCol);

			if (this.dragFuncs) {
				arrow.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
			}
			arrow.parent = this;
			arrow.type = 'arrows';
			arrows.push(arrow);
		}
		return arrows;
		
	},
	updateLabel: function(labelText, settingToDefault, isLoading) {
		//Yo yo, I am not strictly using this.labelText because I want that to be the untruncated text
		if (settingToDefault && this.haveUpdatedLabel) {
			return;
		} else if (!isLoading && ((labelText != this.labelText && !settingToDefault) || (!settingToDefault && !this.haveUpdateLabel))) {
			data.change(this.parent.id + 'LabelText', labelText);
			this.haveUpdatedLabel = true;
		} else if (!settingToDefault) {
			this.haveUpdateLabel = true;
		}
		if (labelText != this.labelText) {
			this.labelText = labelText;
			var pos = this.labelPos();
			if (this.label) {
				this.label.remove();
			}
			var maxWidth = this.tree.buttonDims.dx - this.tree.labelIndent - this.tree.innerRectDims.dx - 5;
			var tempText = '';
			var label = this.tree.paper.text(0, 0, tempText).attr({'text-anchor': 'start', 'font-size': this.tree.labelTextSize});
			var tooWide = false;
			
			for (var letterIdx=labelText.length; letterIdx>=0; letterIdx--) {
				tempText = labelText.slice(0, letterIdx);
				label.attr({'text': tempText});
				
				if (label.getBBox().width > maxWidth) {
					tooWide = true;
				} else {
					break;
				}
			}
			if (tooWide) {
				label.attr({'text': tempText + '...'});
			}
			translateObj(label, pos);
			this.assignHover(label, 'rect', this.tree.rectColHover, this.tree.rectCol);
			if (this.dragFuncs) {
				label.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
			}
			label.parent = this;
			label.type = 'label';
			this.label = label;
		}
	},

	hoverOnChangeAll: function() {
		this.parent.innerRect.attr({fill:this.parent.tree.rectColHover.hex});
		this.parent.rect.attr({fill:this.parent.tree.rectColHover.hex})
	},
	hoverOffChangeAll: function() {
		this.parent.innerRect.attr({fill:this.parent.tree.rectCol.hex});
		this.parent.rect.attr({fill:this.parent.tree.rectCol.hex})
	},
	pointArrows: function(dir) {// 'left', 'right'
		if (dir == 'left') {
			this.arrowAngle = Math.PI;
		} else if (dir == 'right') {
			this.arrowAngle = 0;
		} else if (dir == 'down') {
			this.arrowAngle = Math.PI/2; 
		}
		var innerRectCenter = this.innerRectPos().movePt(this.tree.innerRectDims.copy().mult(.5));
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			var arrow = this.arrows[arrowIdx];
			var arrowPos = this.arrowPos(arrowIdx).rotate(innerRectCenter, this.arrowAngle);
			//arrowCenter.rotate(innerRectCenter, this.arrowAngle);
			arrow.transform('r' + this.arrowAngle*this.tree.degToRad + ',0,0T' + arrowPos.x + ',' + arrowPos.y);
			
		}
	},
	setParent: function(parent) {
		this.parent = parent;
	},
	move: function(moveOrder, type, time) {
		if (!this.inUse) {
			if (moveOrder instanceof Vector) {
				var pos = P(this.pos.x + moveOrder.dx, this.pos.y + moveOrder.dy);
			} else { //is point
				var pos = moveOrder;
			}
			if (type == 'fly') {
				this.flyToPos(pos, time);
			} else {
				this.snapToPos(pos);
			}
			return true;
		} else {
			return false;
		}
	},
	groupToFront: function() {
		this.parent.toFront();
	},
	toFront: function() {
		this.rect.toFront();
		this.innerRect.toFront();
		this.label.toFront();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].toFront();
		}
	},
	snapToPos: function(pos) {
		if (!pos.sameAs(this.pos)) {
			this.pos.set(pos);
			var rectPos = this.rectPos();
			var innerRectPos = this.innerRectPos();
			var labelPos = this.labelPos();
			this.rect.transform('t' + rectPos.x + ',' + rectPos.y).toFront();
			this.innerRect.transform('t' + innerRectPos.x + ',' + innerRectPos.y).toFront();
			this.label.transform('t' + labelPos.x + ',' + labelPos.y).toFront();

			var innerRectCenter = this.innerRectPos().movePt(this.tree.innerRectDims.copy().mult(.5));
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				var arrowPos = this.arrowPos(arrowIdx).rotate(innerRectCenter, this.arrowAngle);
				this.arrows[arrowIdx].transform('r' + this.arrowAngle*this.tree.degToRad + ',0,0T' + arrowPos.x + ',' + arrowPos.y).toFront();
			}
		}
			
	},
	flyToPos: function(pos, time) {
		time = defaultTo(time, 250);
		if (!pos.sameAs(this.pos)) {
			this.pos.set(pos);
			var rectPos = this.rectPos();
			var innerRectPos = this.innerRectPos();
			var labelPos = this.labelPos();
			this.rect.animate({transform:'t' + rectPos.x + ',' + rectPos.y}, time, 'ease-in-out').toFront();;
			this.innerRect.animate({transform:'t' + innerRectPos.x + ',' + innerRectPos.y}, time, 'ease-in-out').toFront();
			this.label.animate({transform:'t' + labelPos.x + ',' + labelPos.y}, time, 'ease-in-out').toFront();
			
			var innerRectCenter = this.innerRectPos().movePt(this.tree.innerRectDims.copy().mult(.5));
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				var arrowPos = this.arrowPos(arrowIdx).rotate(innerRectCenter, this.arrowAngle);
				this.arrows[arrowIdx].animate({transform:'r' + this.arrowAngle*this.tree.degToRad + ',0,0T' + arrowPos.x + ',' + arrowPos.y}, time, 'ease-in-out').toFront();
				
			}
		}
	},
	rectPos: function() {
		return this.pos.copy();
	},
	innerRectPos: function() {
		return P(this.pos.x + this.tree.buttonDims.dx - this.tree.innerRectDims.dx, this.pos.y);
	},
	arrowPos: function(arrowIdx) {//dirPointed assumes right
		var x = this.pos.x + this.tree.buttonDims.dx - this.tree.innerRectDims.dx + this.tree.arrowOffset + arrowIdx*(this.tree.arrowSpacing + this.tree.arrowThickness);
		var y = this.pos.y + (this.tree.buttonDims.dy - this.tree.arrowDims.dy)/2;
		//if (this.arrowAngle == 180) {
		//	x += this.tree.arrowDims.dx;
		//	y += this.tree.arrowDims.dy;
		//}
		return P(x, y);
	},
	labelPos: function() {
		return this.pos.copy().movePt(V(this.tree.labelIndent, this.tree.buttonDims.dy/2));
	},
	makeArrowPath: function() {
		var pts = [];
		var width = this.tree.arrowDims.dx;
		var height = this.tree.arrowDims.dy;
		var thickness = this.tree.arrowThickness;
		pts.push(P(0, 0));
		pts.push(P(thickness, 0));
		pts.push(P(width, height/2));
		pts.push(P(thickness, height));
		pts.push(P(0, height));
		pts.push(P(width-thickness, height/2));
		return makePath(pts, true);
	},
	fadeOut: function() {
		this.tree.addTopButton(this);
		this.setUse(false);
		this.fadeObj(this.rect);
		this.fadeObj(this.innerRect);
		this.fadeObj(this.label);

		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.fadeObj(this.arrows[arrowIdx]);
		}		
		
	},
	fadeObj: function(obj, time) {
		time = defaultTo(time, 250);
		obj.drag(undefined, undefined, undefined);
		obj.hover(undefined, undefined);
		obj.animate({opacity:0}, time, undefined, function() {this.parent.tree.removeTopButton(this.parent); this.remove();});
	},
	remove: function() {
		this.rect.remove();
		this.innerRect.remove();
		this.label.remove();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].remove();
		}
	},
});


function Receptacle(tree, pos, dims, labelText, onHoverIn, onHoverOut, onDropInto) {//yo yo, need to send dims
	this.tree = tree;
	this.pos = pos;
	this.labelText = labelText;
	this.dims = dims;
	this.rect = this.makeRect();
	this.label = this.makeLabel();
	this.onHoverIn = onHoverIn;
	this.onHoverOut = onHoverOut;
	this.onDropInto = onDropInto;
}

Receptacle.prototype = {
	makeRect: function() {
		var rect = this.tree.paper.rect(0, 0, this.dims.dx, this.dims.dy, this.tree.rectRounding);	
		translateObj(rect, this.pos);
		rect.attr({
			fill: this.tree.panelCol.hex,
			stroke: this.tree.rectCol.hex,
		})
		return rect;
	},
	toFront: function() {
		this.rect.toFront();
		this.label.toFront();
	},
	show: function() {
		this.rect.show();
		this.label.show();
	},
	hide: function() {
		this.rect.hide();
		this.label.hide();
	},
	makeLabel: function() {
		var pos = P(this.pos.x + this.tree.buttonDims.dx/2, this.pos.y + this.tree.buttonDims.dy/2);
		var label = this.tree.paper.text(0, 0, this.labelText).attr({'font-size': this.tree.labelTextSize});
		translateObj(label, pos);
		return label;
	},

}

function translateObj(obj, pos) {
	return obj.transform('t' + pos.x + ',' + pos.y);
}
function makePath(pts, closePath) {//closePath defaults to true
	var path = 'M' + pts[0].x + ',' + pts[0].y;
	for (var ptIdx=1; ptIdx<pts.length; ptIdx++) {
		path += 'L' + pts[ptIdx].x + ',' + pts[ptIdx].y;
	}
	if (closePath || closePath===undefined) {
		path += 'Z';
	}
	return path;
}

function defaultTo(val, defaultVal) {
	if (val === undefined) {
		return defaultVal;
	}
	return val;
}
function objectsEqual(a, b) {
	return Math.min(objectsEqualInDirection(a, b), objectsEqualInDirection(b, a));
	
}
function rectsOverlap(a, b) {//{pos:, dims:}
	return (((a.pos.x <= b.pos.x && a.pos.x + a.dims.dx >= b.pos.x) || (b.pos.x <= a.pos.x && b.pos.x + b.dims.dx >= a.pos.x)) &&
		    ((a.pos.y <= b.pos.y && a.pos.y + a.dims.dy >= b.pos.y) || (b.pos.y <= a.pos.y && b.pos.y + b.dims.dy >= a.pos.y)));
	
}
function scaleDims(fit, fitsInTo, paddingFrac) {
	paddingFrac = defaultTo(paddingFrac, 0);
	fit = fit.copy();
	var ratio = Math.min(fitsInTo.dx/fit.dx, fitsInTo.dy/fit.dy) * (1-paddingFrac);
	return fit.mult(ratio);
}
function objectsEqualInDirection(a, b) {
	for (var alet in a) {
		if (b && b.hasOwnProperty(alet)) {
			if (typeof a[alet] == 'object') {
				if (!objectsEqual(a[alet], b[alet])) {
					return false;
				}
			} else {
				if (a[alet] != b[alet]) {
					return false;
				}
			}
		} else {
			return false;
		}
	}
	return true;
}
function arrayDifference(a, b) {
	var asNotInB = [];
	var bsNotInA = [];
	for (var aIdx=0; aIdx<a.length; aIdx++) {
		if (b.indexOf(a[aIdx]) == -1) {
			asNotInB.push(a[aIdx]);
		}
	}
	for (var bIdx=0; bIdx<b.length; bIdx++) {
		if (a.indexOf(b[bIdx]) == -1) {
			bsNotInA.push(b[bIdx]);
		}
	}
	return {asNotInB:asNotInB, bsNotInA:bsNotInA};
}
function posOnPaper(mousePos, paper) {
	return P(mousePos.x-paper._left, mousePos.y-paper._top);
}