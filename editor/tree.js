function Tree(paper/*, pos*/) {
	this.paper = paper;
	this.someImage = new Image();
	this.someImage.src = 'undo.GIF';
	this.buttonDims = config.buttonDimsLarge;
	this.toPosTime = 250;
	this.innerRectDims = V(30, this.buttonDims.dy);
	this.buttonSpacing = 7;
	this.displaceDist = 9;
	this.transitionTime = 400;
	this.degToRad = 360/(2*Math.PI);
	this.panelDimsTop = V(this.paper.width, 2*this.buttonDims.dy+3*this.buttonSpacing);
	this.panelDimsBottom = V(this.paper.width, 50);
	this.pos = P(15, 10 + this.panelDimsTop.dy); //upper left corner of first section
	this.posO = this.pos.copy();
	this.totalButtonHeight = this.buttonDims.dy + this.buttonSpacing;
	this.buttonPosObjectModeSelected = P(this.buttonSpacing, this.panelDimsTop.dy-this.totalButtonHeight);
	this.elementAdderPos = P(this.panelDimsTop.dx - this.buttonSpacing - this.buttonDims.dx, this.panelDimsTop.dy-this.totalButtonHeight)
	this.labelIndent = config.labelIndent;
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
	this.populateElementAdder();
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
	this.elementAdder = new ElementAdder(this.paper, this, this.elementAdderPos, this.buttonDims, 'New Element', this.rectCol, this.rectColHover);
	this.elementAdder.hide();
	this.bgRect = this.makeBGRect();
	this.editingScene = undefined;
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
	toTreeMode: function() {
		var finalDims = V($('#treeWrapper').width(), $('#treeWrapper').height());
		this.paper.setSize(finalDims.dx, finalDims.dy);
		$('#treeDiv').animate({height: finalDims.dy + 'px'}, this.transitionTime);
		$('#objDiv').animate({height: 0 + 'px'}, this.transitionTime, function(){$('#objDiv').hide()});
		
		this.bgRect.show();
		this.elementAdder.hide();
		this.mode = 'tree';
		this.showBottomPanel();
		this.editingButton = undefined;
		this.editingScene = undefined;
		if (this.clickedButton) {
			this.addTopButton(this.clickedButton);
		}
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
		window.setTimeout(function() {
			tree.topButtons = [];
		}, this.toPosTime);
	},
	toObjectMode: function() {
		var self = this;
		this.bgRect.hide();
		var wrapperHeight = $('#treeWrapper').height();
		var treeHeightFinal = this.panelDimsTop.dy
		//$('#objDiv').css({top: '0px', height: '0px'});
		$('#objDiv').show();
		var objDivHeight = wrapperHeight - treeHeightFinal;
		//$('#objDiv').animate({height: heightFinal + 'px', top: 0 + 'px'}, this.transitionTime);
		$('#treeDiv').animate({height: this.panelDimsTop.dy + 'px'}, this.transitionTime, function() {
			self.paper.setSize(self.paper.width, treeHeightFinal);
		});
		$('#objDiv').animate({height: objDivHeight + 'px'}, this.transitionTime);
		//$('#treeDiv').hide();
		
		
		this.mode = 'object';
		this.hideBottomPanel();
		this.elementAdder.show();
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
		this.elementAdder.toFront();
		for (var topButtonIdx=0; topButtonIdx<this.topButtons.length; topButtonIdx++) {
			this.topButtons[topButtonIdx].toFront();
		}
	},
	addTopButton: function(button) {
		this.topButtons.push(button);
		button.memberOf.push(this.topButtons);
	},
	removeTopButton: function(button) {
		var idx = this.topButtons.indexOf(button);
		if (idx!=-1) {
			this.topButtons.splice(idx, 1);
		}
		var memberIdx = button.memberOf.indexOf(this.topButtons);
		if (memberIdx!=-1) {
			this.topButtons.splice(memberIdx, 1);
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
	populateElementAdder: function() {
	
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
		var undo = new Button(this.paper, pos, this.dirButtonDims, undefined, function(){data.undo()}, 'imgUndo');
		pos.movePt(V((this.dirButtonDims.dx + this.buttonSpacing), 0));
		var redo = new Button(this.paper, pos, this.dirButtonDims, undefined, function(){data.redo()}, 'imgRedo');
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
			fill: this.panelCol.hex,
			'stroke-width': 0
		})
		var top = this.paper.rect(0, 0, this.panelDimsTop.dx, this.panelDimsTop.dy).attr({
			fill: this.panelCol.hex,
			'stroke-width': 0
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
			tree: {
				rect: this.onClickRectTreeMode,
				arrows: this.onClickArrowsTreeMode
			},
			object: {
				rect: this.onClickRectObjectMode,
				arrows: this.onClickArrowsObjectMode
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
				section.button.move(P(x, y), moveStyle, this.toPosTime);
				section.pos.set(P(x,y));
				y += this.totalButtonHeight;
				for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
					var prompt = section.prompts[promptIdx];
					if (prompt.button != this.clickedButton && !prompt.button.inUse) {
						prompt.button.move(P(x+this.promptIndent, y), moveStyle, this.toPosTime);
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
	addElement: function(elem) {
		this.editingScene.addElement(elem);
	},

})





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
function posGlobal(pos, div) {
	try{
	var offset = $(div).offset();
	return P(pos.x + offset.left, pos.y + offset.top);
	}catch(e){console.trace()}
}