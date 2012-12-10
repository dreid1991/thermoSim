function Tree(paper, pos) {
	this.paper = paper;
	this.pos = pos; //upper left corner of first section
	this.buttonDims = V(130, 30);
	this.innerRectDims = V(30, this.buttonDims.dy);
	this.circleOffset = V(80, 0);
	this.circleRad = 15;
	this.buttonSpacing = 10;
	this.displaceDist = 9;
	this.totalButtonHeight = this.buttonDims.dy + this.buttonSpacing;
	this.buttonPosObjectModeSelected = P(10, 10);
	this.labelIndent = 3;
	this.labelTextSize = 13;
	this.promptIndent = 30;
	this.rectRounding = 3;
	this.innerRectWidth = 25;
	this.arrowDims = V(17, 26);
	this.arrowThickness = 4;
	this.arrowSpacing = 3;
	this.arrowOffset = 5;
	this.numArrows = 2;
	this.snapDist = 5;
	this.placerBlockTolerance = 10; //how close placer block has to be before stuff starts moving out of the way
	this.bgCol = Col(255, 255, 255);
	this.rectCol = Col(0, 164, 255);//'#64a0c1';
	this.rectColHover = Col(0, 144, 224);//'#5c93b2';
	//this.rectColSelect = Col(82, 108, 122);//'#526c7a';
	//this.rectColStroke = Col(59, 68, 73);//'#3b4449';
	this.arrowCol = Col(255, 255, 255);
	//this.circleCol = Col(59, 68, 73);//Col(120, 180, 213);
	//this.circleColHover = Col(110, 170, 203);
	this.placerButtonPos = P(200, 300);
	this.defineSectionDragFuncs();
	this.definePromptDragFuncs();
	this.defineClickFuncs();
	this.defineBGRectDragFuncs();
	this.definePlacerRectFuncs();
	this.placerButton = this.makePlacerButton();
	this.bgRect = this.makeBGRect();
	this.clickedButton = undefined;
	this.sections = [];
}

Tree.prototype = {
	addSection: function(mousePos, section) {
		var pos = posOnPaper(mousePos, this.paper);
		var sectionIdx = this.getNewSectionIdx(pos);
		if (!section) {
		/*should make it send rectangle corner positions*/
			section = new TreeSection(this, pos/*GET A POINT FOR THE UPPER LEFT CORNER, NOT FOR MOUSEPOS*/, this.sectionDragFuncs,  this.promptDragFuncs, this.clickFuncs);
		}
		this.sections.splice(sectionIdx, 0, section);
		//for (var idx=sectionIdx+1; idx<this.sections.length; idx++) {
		//	this.sections[idx].idx++;
		//}
		this.moveAllToPositions('fly');
	},
	addPrompt: function(mousePos, prompt) {
		var pos = posOnPaper(mousePos, this.paper);
		var sectionIdx = this.getNewPromptSectionIdx(pos);
		this.sections[sectionIdx].addPrompt(pos, prompt);
		this.moveAllToPositions('fly');
	},
	toObjectMode: function() {
		this.placerButton.hide();
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			section.button.toObjectMode();
			var prompts = section.prompts;
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				prompts[promptIdx].button.toObjectMode();
			}
		}
	},
	toTreeMode: function() {
		this.placerButton.show();
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
	removeSection: function(sectionIdx) {
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
		this.sections[sectionIdx].removePrompt(promptIdx);
		this.moveAllToPositions('fly');
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
	getIdxsToDisplace: function(pos) {//with pos being an upper corner of the button
		var up, down;
		var y = this.pos.y;
		if (pos.y < this.pos.y) {
			up = undefined;
			down = {sectionIdx:0, promptIdx:-1};
			return {up: up, down: down};
		}
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			var prompts = section.prompts;
			if (pos.y >= y && pos.y < y + this.totalButtonHeight) {
				up = {sectionIdx:sectionIdx, promptIdx:-1};
				return {up: up, down: this.getToDisplaceDown(sectionIdx, -1, prompts)}
			}
			y += this.totalButtonHeight;
			
			for (var promptIdx=0; promptIdx<prompts.length; promptIdx++) {
				if (pos.y >= y && pos.y < y + this.totalButtonHeight) {
					up = {sectionIdx:sectionIdx, promptIdx:promptIdx};
					return {up: up, down: this.getToDisplaceDown(sectionIdx, promptIdx, prompts)};
				}
				y += this.totalButtonHeight;
			}
			
		}
	},
	getToDisplaceDown: function(sectionIdx, promptIdx, prompts) {
		if (prompts[promptIdx+1]) {
			return {sectionIdx:sectionIdx, promptIdx:promptIdx+1};
		} else if (this.sections[sectionIdx+1]) {
			return {sectionIdx:sectionIdx+1, promptIdx:-1};
		} else {
			return undefined;
		}
	},
	makePlacerButton: function() {
		var pos = this.placerButtonPos;
		var placer = new TreeSection(this, pos, this.placerRectDragFuncs, undefined, undefined, undefined, true);
		return placer;
	},
	makeBGRect: function() {
		var bgRect = this.paper.rect(0, 0, this.paper.width, this.paper.height);
		bgRect.attr({
			'stroke-width': 0,
			fill: this.bgCol.hex
		})
		bgRect.parent = this;
		bgRect.drag(this.bgRectDragFuncs.onMove, this.bgRectDragFuncs.onStart, this.bgRectDragFuncs.onEnd);
		bgRect.toBack();
		return bgRect;
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
	//drag and click functions are in context of the rect or circle.  this.parent will reference the button object.
	//yeah dawg, but pass the click functions down
	sectionDragStartTreeMode: function() {
		this.parent.posO = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.released = false;
		this.parent.tree.clickedButton = this.parent;
		this.parent.sectionIdx = this.parent.tree.getSectionIdx(this.parent.parent);
		this.parent.mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.sectionYs = this.parent.tree.getSectionYs();
	},
	sectionDragMoveTreeMode: function() {
		var mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		var dPos = this.parent.mousePos.VTo(mousePos);
		var distFromOSqr = this.parent.posO.VTo(mousePos).magSqr();
		if (distFromOSqr > this.parent.tree.snapDist*this.parent.tree.snapDist || this.parent.released) {
			this.parent.released = true;
			var sections = this.parent.tree.sections;
			var curSectionIdx = this.parent.sectionIdx;
			this.parent.parent.move(dPos);
			var pos = this.parent.pos;
			var sectionHeight = this.parent.parent.totalHeight();
			this.parent.mousePos.set(mousePos);
			var sectionYs = this.parent.sectionYs;
			for (var sectionIdx=0; sectionIdx<sectionYs.length; sectionIdx++) {
				var midPtY = sectionYs[sectionIdx] + sections[sectionIdx].totalHeight()/2;
				if (sectionIdx < curSectionIdx) {
					if (pos.y <= midPtY) {
						var newIdx= sectionIdx;
						break;
					}
				} else if (sectionIdx > curSectionIdx) {
					if (pos.y + sectionHeight >= midPtY) {
						var newIdx = sectionIdx;
						break;
					}
				}
			}
			
			if (newIdx !== undefined) {
				var oldIdx = this.parent.sectionIdx;
				var movingSection = sections[oldIdx];
				sections.splice(oldIdx, 1);
				sections.splice(newIdx, 0, movingSection);
				this.parent.sectionYs = this.parent.tree.getSectionYs();
				this.parent.tree.sections = sections;
				this.parent.sectionIdx = newIdx;
				this.parent.tree.moveAllToPositions('fly');
			}
		}
		
	},
	sectionDragEndTreeMode: function() {
		var didClickFunc = false;
		if (!this.parent.released && this.parent.clickFuncs) {
			didClickFunc = true;
			this.parent.clickFuncs[this.type][this.parent.mode].apply(this.parent);
		}
		this.parent.tree.clickedButton = undefined;
		this.parent.sectionIdx = undefined;
		this.parent.released = false;
		this.parent.posO = P(0, 0);
		this.parent.mousePos = P(0, 0);
		this.parent.sectionYs = [];
		if (!didClickFunc) {
			this.parent.tree.moveAllToPositions('fly');
		}
	},
	defineSectionDragFuncs: function() {
		this.sectionDragFuncs = {
			tree: {
				onStart: this.sectionDragStartTreeMode,
				onMove: this.sectionDragMoveTreeMode,
				onEnd: this.sectionDragEndTreeMode
			},
			object: {
				onStart: undefined,
				onMove: undefined,
				onEnd: undefined
			}
		}
		
	},
	//click functions go in here, dawg
	promptDragStartTreeMode: function() {
		this.parent.posO = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.released = false;
		this.parent.tree.clickedButton = this.parent;
		this.parent.promptIdx = this.parent.parent.section.getPromptIdx(this.parent.parent);
		this.parent.mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.sectionYs = this.parent.tree.getSectionYs();
		this.parent.sectionTop = this.parent.parent.section.pos.y;
		this.parent.sectionBottom = this.parent.sectionTop + this.parent.parent.section.totalHeight();
	},
	promptDragMoveTreeMode: function() {
		var mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		var dPos = V(mousePos.x - this.parent.mousePos.x, mousePos.y- this.parent.mousePos.y);
		var distFromOSqr = this.parent.posO.VTo(mousePos).magSqr();
		if (distFromOSqr > this.parent.tree.snapDist*this.parent.tree.snapDist || this.parent.released) {
			this.parent.released = true;
			this.parent.mousePos.set(mousePos);
			this.parent.parent.move(dPos);
			var prompts = this.parent.parent.section.prompts;
			var totalButtonHeight = this.parent.tree.totalButtonHeight;
			var pos = this.parent.pos;
			var topOfPrompts = this.parent.sectionTop + totalButtonHeight;
			var newIdx = Math.floor(((pos.y + totalButtonHeight/2 - topOfPrompts)/totalButtonHeight));
			var boundedIdx = Math.min(prompts.length-1, Math.max(-1, newIdx));
			var switchingBlock = newIdx != boundedIdx;
			if (newIdx != this.parent.promptIdx && !switchingBlock) {
				var movingPrompt = prompts[this.parent.promptIdx];
				newIdx = Math.max(0, newIdx); //because it can be -1, which is on the section button, but still in the section
				prompts.splice(this.parent.promptIdx, 1);
				prompts.splice(newIdx, 0, movingPrompt);
				this.parent.promptIdx = newIdx;
				this.parent.tree.moveAllToPositions('fly');
			} else if (switchingBlock) {
				
			}
		}
	},
	promptDragEndTreeMode: function() {
		var didClickFunc = false;
		if (!this.parent.released && this.parent.clickFuncs) {
			didClickFunc = true;
			this.parent.clickFuncs[this.type][this.parent.mode].apply(this.parent);
		}//might want to save these variables for use in the click function
		//also, if we're doing the click function, it means we didn't move any blocks, so we don't have to rearrange
		this.parent.tree.clickedButton = undefined;
		this.parent.promptIdx = undefined;
		this.parent.released = false;
		this.parent.mousePos = P(0, 0);
		this.parent.sectionYs = undefined;
		this.parent.sectionTop = undefined;
		this.parent.sectionBottom = undefined;	
		if (!didClickFunc) {
			this.parent.tree.moveAllToPositions('fly');
		}
	},
	definePromptDragFuncs: function() {
		this.promptDragFuncs = {
			tree: {
				onStart: this.promptDragStartTreeMode,
				onMove: this.promptDragMoveTreeMode,
				onEnd: this.promptDragEndTreeMode	
			},
			object: {
				onStart: undefined,
				onMove: undefined,
				onEnd: undefined
			}
		}
	},
	bgRectDragStart: function() {
		this.totalHeight = this.parent.totalHeight();
		this.mousePos = posOnPaper(globalMousePos, this.parent.paper);
	},
	bgRectDragMove: function() {
		var curMousePos = posOnPaper(globalMousePos, this.parent.paper);
		var dPos = this.mousePos.VTo(curMousePos);
		this.mousePos.set(curMousePos);
		var maxY = 50;
		var minY = this.parent.paper.height - this.totalHeight;
		this.parent.pos.y = Math.min(maxY, Math.max(minY, this.parent.pos.y + dPos.dy));
		this.parent.moveAllToPositions('snap');
		
	},
	bgRectDragEnd: function() {
		this.totalHeight = undefined;
		this.mousePos = P(0, 0);
	},
	defineBGRectDragFuncs: function() {
		this.bgRectDragFuncs = {
			onStart: this.bgRectDragStart,
			onMove: this.bgRectDragMove,
			onEnd: this.bgRectDragEnd
		}
	},
	placerRectDragStart: function() {
		this.parent.tree.clickedButton = this;
		this.parent.mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.displaced = undefined;
	},
	placerRectDragMove: function() {
		var buttonPos = this.parent.parent.pos;
		var curMousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		var dPos = this.parent.mousePos.VTo(curMousePos);
		this.parent.mousePos.set(curMousePos);
		this.parent.parent.move(dPos);
		if (this.parent.tree.inButtonColumn(buttonPos)) {
			var toDisplace = this.parent.tree.getIdxsToDisplace(buttonPos);
			if (!objectsEqual(toDisplace, this.parent.displaced)) {
				this.parent.tree.returnDisplaced(this.parent.displaced);
				this.parent.tree.displace(toDisplace);
				this.parent.displaced = toDisplace;
			}
		} else if (this.parent.displaced) {
			this.parent.tree.returnDisplaced(this.parent.displaced);
			this.parent.displaced = undefined;
		}
	},
	placerRectDragEnd: function() {
		var buttonPos = this.parent.parent.pos;
		this.parent.tree.clickedButton = undefined;
		if (this.parent.tree.inButtonColumn(buttonPos)) {
			if (this.parent.displaced) {
				if (this.parent.displaced.up == undefined) {
					this.parent.tree.addSection(buttonPos);
				} else if (this.parent.displaced.down && this.parent.displaced.down.promptIdx == -1 && this.parent.tree.inSectionColumn(buttonPos)) {
					this.parent.tree.addSection(buttonPos);
				} else if (this.parent.displaced.down == undefined && this.parent.tree.inSectionColumn(buttonPos)) {
					this.parent.tree.addSection(buttonPos);
				} else {
					this.parent.tree.addPrompt(buttonPos);
				}
			} else {
				this.parent.tree.addSection(buttonPos);
			}

		}
		this.parent.displaced = undefined;
		this.parent.mousePos = P(0, 0);
		this.parent.parent.move(this.parent.tree.placerButtonPos, 'snap');
	},
	displace: function(toDisplace) {
		for (var dir in toDisplace) {
			var buttonIdxs = toDisplace[dir];
			if (buttonIdxs) {
				if (buttonIdxs.promptIdx == -1) {
					this.sections[buttonIdxs.sectionIdx].button.displace(dir);
				} else {
					this.sections[buttonIdxs.sectionIdx].prompts[buttonIdxs.promptIdx].button.displace(dir);
				}
			}
		}		
	},
	returnDisplaced: function(displaced) {
		if (displaced) {
			for (var dir in displaced) {
				var buttonIdxs = displaced[dir];
				if (buttonIdxs) {
					if (buttonIdxs.promptIdx == -1) {
						this.sections[buttonIdxs.sectionIdx].button.toPos();
					} else {
						this.sections[buttonIdxs.sectionIdx].prompts[buttonIdxs.promptIdx].button.toPos();
					}
				}
			}
		}
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
	definePlacerRectFuncs: function() {
		this.placerRectDragFuncs = {
			tree: {
				onStart: this.placerRectDragStart,
				onMove: this.placerRectDragMove,
				onEnd: this.placerRectDragEnd
			}, 
			object: {
				onStart: undefined,
				onMove: undefined,
				onEnd: undefined
			}
		}
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
	
	moveAllToPositions: function(moveStyle) {
		var x = this.pos.x;
		var y = this.pos.y;
		for (var sectionIdx=0; sectionIdx<this.sections.length; sectionIdx++) {
			var section = this.sections[sectionIdx];
			if (section.button != this.clickedButton) {
				section.button.move(P(x, y), moveStyle);
				section.pos.set(P(x,y));
				y += this.totalButtonHeight;
				for (var promptIdx=0; promptIdx<section.prompts.length; promptIdx++) {
					var prompt = section.prompts[promptIdx];
					if (prompt.button != this.clickedButton) {
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
	},

}

function TreeSection(tree, posInit, sectionDragFuncs, promptDragFuncs, clickFuncs, isPlacer) {
	this.tree = tree;
	this.prompts = [];
	this.pos = posInit.copy();
	this.initSectionIdx = undefined; //for dragging
	this.mousePosInit = P(0, 0); //for dragging
	this.sectionYs = []; //for dragging
	this.sectionDragFuncs = sectionDragFuncs;
	this.promptDragFuncs = promptDragFuncs;
	this.clickFuncs = clickFuncs;
	this.isPlacer = isPlacer;
	this.button = new TreeButton(this.tree, this, this.pos, this.sectionDragFuncs, this.clickFuncs, isPlacer);
 
}

TreeSection.prototype = {
	addPrompt: function(cornerPos, prompt) {
		var newIdx = this.getNewPromptIdx(cornerPos);
		if (!prompt) {
			prompt = new TreePrompt(this.tree, this, cornerPos, this.promptDragFuncs, this.clickFuncs)
		}
		this.prompts.splice(newIdx, 0, prompt);
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
	toFront: function() {
		this.button.toFront();
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].toFront();
		}
	},
	move: function(moveOrder) {
		if (moveOrder instanceof Vector) {
			this.pos.movePt(moveOrder);
		} else {
			this.pos.set(moveOrder);
		}
		this.button.move(moveOrder);
		for (var promptIdx=0; promptIdx<this.prompts.length; promptIdx++) {
			this.prompts[promptIdx].move(moveOrder);
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
			this.prompts.splice(promptIdx, 1);
		} else {
			console.log('tried to remove prompt idx ' + promptIdx + ' from some section, which is not helpful at all.  It does not exist.');
			console.trace();
		}
	},
	totalHeight: function() {
		return this.tree.totalButtonHeight*(1+this.prompts.length);
	}
}

function TreePrompt(tree, section, posInit, dragFuncs, clickFuncs) {
	this.tree = tree;
	this.section = section;
	this.dragFuncs = dragFuncs;
	this.clickFuncs = clickFuncs;
	this.button = new TreeButton(this.tree, this, posInit, this.dragFuncs, this.clickFuncs);
}

TreePrompt.prototype = {
	getSection: function() {
		return this.section;
	},
	setSection: function(section) {
		this.section = section;
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
	move: function(v) {
		this.button.move(v);
	}
}

function TreeButton(tree, parent, posInit, dragFuncs, clickFuncs, labelText, isPlacerButton) {
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
	this.labelText = defaultTo(labelText, '');
	this.updateLabel(this.labelText);
	this.isPlacerButton = defaultTo(isPlacerButton, false);
	this.rect = this.makeRect();
	this.innerRect = this.makeInnerRect();
	this.arrows = this.makeArrows();
	this.arrowAngle = 0;//sorry about right/left, 0/180 use.  right -> 0, left -> 180.  Tossing angle around is nice for getting position without a bunch of ifs
}

TreeButton.prototype = {
	toTreeMode: function() {
		this.mode = 'tree';
		if (this.arrowAngle = 180) {
			this.pointArrows('right')
		}
	},
	hide: function() {
		this.rect.hide();
		this.innerRect.hide();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].hide();
		}
	},
	show: function() {
		this.rect.show().toFront();
		this.innerRect.show().toFront();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].show().toFront();;
		}		
	},
	toObjectMode: function() {
		this.mode = 'object';
		if (this == this.tree.clickedButton) {
			this.pointArrows('left');
			this.flyToPos(this.tree.buttonPosObjectModeSelected, 200);
			//this.flyToPos(P(0, 75));
		} else {
			//this.flyToPos(P(0, 75));
			this.flyToPos(P(-this.tree.buttonDims.dx-50, this.pos.y), 150);
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
		rect.transform('t' + pos.x + ',' + pos.y);
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
		rect.transform('t' + pos.x + ',' + pos.y);
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
			arrow.transform('t' + pos.x + ',' + pos.y);
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
	updateLabel: function(labelText) {
		//Yo yo, I am not strictly using this.labelText because I want that to be the untruncated text
		this.labelText = labelText;
		var pos = this.labelPos();
		if (this.label) {
			this.label.remove();
		}
		var maxWidth = this.tree.buttonDims.dx - this.tree.labelIndent - this.tree.innerRectDims.dx - 10;
		var tempText = '';
		var label = this.tree.paper.text(0, 0, tempText).attr({'text-anchor': 'start', 'font-size': this.tree.labelTextSize});
		var tooWide = false;
		for (var letterIdx=0; letterIdx<labelText.length; letterIdx++) {
			tempText = tempText + labelText[letterIdx];
			label.attr({'text': tempText});
			
			if (label.getBBox().width > maxWidth && letterIdx != labelText.length-1) {
				tooWide = true;
				break;
			}
		}
		if (tooWide) {
			label.attr({'text': tempText + '...'});
		}
		label.transform('t' + pos.x + ',' + pos.y);
		this.assignHover(label, 'rect', this.tree.rectColHover, this.tree.rectCol);
		if (this.dragFuncs) {
			label.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
		}
		label.parent = this;
		label.type = 'label';
		this.label = label;
	},
	assignHover: function(raphaelShape, toChange, hoverOnCol, hoverOffCol) {
		if (this.isPlacerButton) {
			raphaelShape.hover(this.hoverOnChangeAll, this.hoverOffChangeAll);
		} else {
			raphaelShape.hover(
				function() {
					this.parent[toChange].attr({fill:hoverOnCol.hex});
				},
				function() {
					this.parent[toChange].attr({fill:hoverOffCol.hex});
				}
			)
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
			this.arrowAngle = 180;
		} else if (dir == 'right') {
			this.arrowAngle = 0;
		}
		
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			var arrow = this.arrows[arrowIdx];
			var pos = this.arrowPos(arrowIdx);
			arrow.transform('t' + pos.x + ',' + pos.y + 'r' + this.arrowAngle + ',0,0');
			
		}
	},
	setParent: function(parent) {
		this.parent = parent;
	},
	move: function(moveOrder, type, time) {
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
	},
	groupToFront: function() {
		this.parent.toFront();
	},
	toFront: function() {
		this.rect.toFront();
		this.innerRect.toFront();
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
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				var arrowPos = this.arrowPos(arrowIdx);
				this.arrows[arrowIdx].transform('t' + arrowPos.x + ',' + arrowPos.y + 'r' + this.arrowAngle + ',0,0').toFront();
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
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				var arrowPos = this.arrowPos(arrowIdx);
				this.arrows[arrowIdx].animate({transform:'t' + arrowPos.x + ',' + arrowPos.y + 'r' + this.arrowAngle + ',0,0'}, time, 'ease-in-out').toFront();
				//this.arrows[arrowIdx].toFront();
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
		if (this.arrowAngle == 180) {
			x += this.tree.arrowDims.dx;
			y += this.tree.arrowDims.dy;
		}
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
	remove: function() {
		this.rect.remove();
		this.innerRect.remove();
		this.label.remove();
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].remove();
		}
	},
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
function posOnPaper(mousePos, paper) {
	return P(mousePos.x-paper._left, mousePos.y-paper._top);
}