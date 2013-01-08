
assignHover = {
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
	}

}



SectionFuncs = {
	sectionDragStartTreeMode: function() {
		this.parent.sectionIds = this.parent.tree.getSectionIds();
		this.parent.posO = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.released = false;
		this.parent.tree.clickedButton = this.parent;
		this.parent.tree.activateReceptacles.apply(this.parent.tree, [this.parent])
		this.parent.sectionIdx = this.parent.tree.getSectionIdx(this.parent.parent);
		this.parent.mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.sectionYs = this.parent.tree.getSectionYs();
	},
	sectionDragMoveTreeMode: function() {
		var mousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		var dPos = this.parent.mousePos.VTo(mousePos);
		var distFromOSqr = this.parent.posO.VTo(mousePos).magSqr();
		if (distFromOSqr > this.parent.tree.snapDist*this.parent.tree.snapDist || this.parent.released) {
			this.parent.tree.checkReceptacles(this.parent);
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
		var tree = this.parent.tree;
		var oldSectionIds = this.parent.sectionIds;
		//dawg, I need to define tree because if this is a label and we updateLabel it changes the label object and parent gets nulled.  Also .attr({text... isn't working right after I make it.  Dunno why.
		var didClickFunc = false;
		if (this.parent.tree.onReleaseReceptacle.apply(this.parent.tree, [this.parent])) {
			if (!this.parent.released && this.parent.clickFuncs) {
				didClickFunc = true;
				this.parent.clickFuncs[this.parent.mode][this.type].apply(this.parent);
			}
			this.parent.sectionIdx = undefined;
			this.parent.released = false;
			this.parent.posO = P(0, 0);
			this.parent.mousePos = P(0, 0);
			this.parent.sectionYs = [];
		}
		tree.clickedButton = undefined;
		tree.setDefaultLabels();
		if (!didClickFunc) {
			tree.moveAllToPositions('fly');
		}
		var newSectionIds = tree.getSectionIds();
		if (!objectsEqual(oldSectionIds, newSectionIds)) {
			data.change('tSections', newSectionIds);
		}
	},
	defineSectionDragFuncs: function() {
		this.sectionDragFuncs = {
			tree: {
				onStart: this.sectionDragStartTreeMode,
				onMove: this.sectionDragMoveTreeMode,
				onEnd: this.sectionDragEndTreeMode
			},
			object: undefined
		}
		
	}

}

PromptFuncs = {
	promptDragStartTreeMode: function() {
	//CHECK IF promptIds GETS SET
		this.parent.promptIds = this.parent.parent.section.getPromptIds();
		this.parent.posO = posOnPaper(globalMousePos, this.parent.tree.paper);
		this.parent.released = false;
		this.parent.tree.clickedButton = this.parent;
		this.parent.tree.activateReceptacles.apply(this.parent.tree, [this.parent])
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
			this.parent.tree.checkReceptacles(this.parent);
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
		var section = this.parent.parent.section;
		var sectionId = section.id;
		var tree = this.parent.tree;
		var oldPromptIds = this.parent.promptIds;
		var didClickFunc = false;
		if (this.parent.tree.onReleaseReceptacle.apply(this.parent.tree, [this.parent])) {
			if (!this.parent.released && this.parent.clickFuncs) {
				didClickFunc = true;
				this.parent.clickFuncs[this.parent.mode][this.type].apply(this.parent);
			}//might want to save these variables for use in the click function
			//also, if we're doing the click function, it means we didn't move any blocks, so we don't have to rearrange
			this.parent.promptIdx = undefined;
			this.parent.released = false;
			this.parent.mousePos = P(0, 0);
			this.parent.sectionYs = undefined;
			this.parent.sectionTop = undefined;
			this.parent.sectionBottom = undefined;	
		}
		tree.clickedButton = undefined;
		tree.setDefaultLabels();
		if (!didClickFunc) {
			tree.moveAllToPositions('fly');
		}
		var newPromptIds = section.getPromptIds();
		if (!objectsEqual(oldPromptIds, newPromptIds)) {
			data.change(sectionId + 'Prompts', newPromptIds);
		}
	},
	definePromptDragFuncs: function() {
		this.promptDragFuncs = {
			tree: {
				onStart: this.promptDragStartTreeMode,
				onMove: this.promptDragMoveTreeMode,
				onEnd: this.promptDragEndTreeMode	
			},
			object: undefined
		}
	}

}

BGRectFuncs = {
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
	bgRectDragStart: function() {
		this.totalHeight = this.parent.totalHeight();
		this.mousePos = posOnPaper(globalMousePos, this.parent.paper);
	},
	bgRectDragMove: function() {
		var curMousePos = posOnPaper(globalMousePos, this.parent.paper);
		var dPos = this.mousePos.VTo(curMousePos);
		this.mousePos.set(curMousePos);
		var maxY = this.parent.posO.y;
		var minY = this.parent.paper.height - this.totalHeight - 2*this.parent.buttonDims.dy;
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
	}

}

PlacerRectFuncs = {
	makePlacerButton: function(draggable) {
		var dragFuncs;
		var pos = this.placerButtonPos;
		if (draggable) {
			dragFuncs = this.placerRectDragFuncs;
		}
		var placer = new TreeSection(this, pos, dragFuncs, undefined, undefined, 'New Block', true);
		return placer;
	},
	placerRectDragStart: function() {
		var tree = this.parent.tree;
		tree.clickedButton = this;
		this.parent.outline = tree.makeOutline.apply(tree, [P(this._.dx, this._.dy)]);
		this.parent.outlinePos = P(this._.dx, this._.dy);
		this.parent.mousePos = posOnPaper(globalMousePos, tree.paper);
		this.parent.displaced = undefined;
		this.parent.inColumn = tree.inButtonColumn(this.parent.pos);
	},
	placerRectDragMove: function() {
		var outlinePos, oldOutlinePos;
		var tree = this.parent.tree;
		var buttonPos = this.parent.parent.pos;
		var inColLast = this.parent.inColumn;
		var inCol = tree.inButtonColumn(buttonPos);
		if (this.parent.outlinePos) {
			oldOutlinePos = this.parent.outlinePos.copy();
		} 
		var outline = this.parent.outline;
		var curMousePos = posOnPaper(globalMousePos, this.parent.tree.paper);
		var dPos = this.parent.mousePos.VTo(curMousePos);
		this.parent.mousePos.set(curMousePos);
		this.parent.parent.move(dPos);
		if (inCol) {
			var toDisplace = tree.getIdxsToDisplace(buttonPos);
			if (!objectsEqual(toDisplace, this.parent.displaced)) {
				this.parent.tree.returnDisplaced(this.parent.displaced);
				this.parent.tree.displace(toDisplace);
				this.parent.displaced = toDisplace;
			}

		} else if (this.parent.displaced) {
			this.parent.tree.returnDisplaced(this.parent.displaced);
			this.parent.displaced = undefined;
		}
		this.parent.inColumn = inCol;
		if (inCol) {
			outlinePos = tree.getOutlinePos(buttonPos, toDisplace);
			if (!oldOutlinePos || !outlinePos.sameAs(oldOutlinePos)) {
				outline.animate({transform:'t' + outlinePos.x + ',' + outlinePos.y}, 250, 'ease-in-out').toFront();
				this.parent.outlinePos = outlinePos.copy();
				
			}			
		} else if (inColLast) {
			this.parent.outlinePos = undefined;
			this.parent.tree.fadeOut(outline);
			this.parent.outline = tree.makeOutline.apply(tree, [buttonPos]);			
		} else {
			outline.transform('t' + buttonPos.x + ',' + buttonPos.y);
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
		this.parent.outlinePos = P(0, 0);
		this.parent.tree.fadeOut(this.parent.outline);
		this.parent.outline = undefined;
		this.parent.displaced = undefined;
		this.parent.mousePos = P(0, 0);
		this.parent.parent.move(this.parent.tree.placerButtonPos, 'snap');
	},
	makeOutline: function(pos) {
		//call in context of tree
		var buttonDims = this.buttonDims;
		var outline = this.paper.rect(0, 0, buttonDims.dx, buttonDims.dy);//making outline be a section attribute
		outline.attr({'stroke-dasharray': '-'});
		outline.transform('t' + pos.x + ',' + pos.y);
		return outline;
	},
	getOutlinePos: function(pos, displaced) {
		var treePos = this.pos;
		var totalHeight = this.totalHeight();
		var indent = this.promptIndent;
		var buttonHeight = this.buttonDims.dy//or this.totalButtonHeight;
		var adjustment = buttonHeight/2;
		if (displaced) {
			if (!displaced.up) {//must be section above first section
				return treePos.copy().movePt(V(0, -adjustment));
			} else if (!displaced.down) {
				var yAdj = totalHeight - adjustment;
				if (this.inSectionColumn(pos)) {
					return treePos.copy().movePt(V(0, yAdj));
				} else {
					return treePos.copy().movePt(V(indent, yAdj));
				}
			} else {
				var posUp = this.getButtonPosFromIdxs(displaced.up);
				var posDown = this.getButtonPosFromIdxs(displaced.down);
				var y = (posUp.y + posDown.y)/2;
				if (displaced.down.promptIdx == -1 && this.inSectionColumn(pos)) { //then can be section
					var x = treePos.x;
				} else {
					var x = treePos.x + indent;
				}
				return P(x, y);
			}
		} else if (pos.y >= treePos.y + totalHeight) {
			return P(treePos.x, treePos.y + totalHeight);
		} else {
			return false;
		}
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
		this.staticsToFront();
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
	}

}

TrashFuncs = {
	trashOnHoverIn: function() {
		this.rect.attr({fill:this.tree.rectColHover.hex});
	},
	trashOnHoverOut: function() {
		this.rect.attr({fill:this.tree.bgCol.hex})
	},
	trashOnDropInto: function(button) {
		button.tree.fadeOutUnknown(button.parent);
		return false;
	}
}

ReceptacleFuncs = { //button has pos, parent has totalHeight, totalWidth, 
					//called in context of tree
	activateReceptacles: function(button) {
		button.hoveringOver = [];
		button.storedDims = V(button.parent.totalWidth(), button.parent.totalHeight());
		this.checkReceptacles(button);
	},
	checkReceptacles: function(button) {
		var newHoveringOver = this.getReceptaclesTouched(button);
		var difference = arrayDifference(button.hoveringOver, newHoveringOver);
		var toUnhover = difference.asNotInB;
		var toHover = difference.bsNotInA;
		button.hoveringOver = newHoveringOver;
		for (var unhoverIdx=0; unhoverIdx<toUnhover.length; unhoverIdx++) {
			toUnhover[unhoverIdx].onHoverOut();
		}
		for (var hoverIdx=0; hoverIdx<toHover.length; hoverIdx++) {
			toHover[hoverIdx].onHoverIn();
		}
	},
	getReceptaclesTouched: function(button) {
		var receptsTouched = [];
		for (var receptacleIdx=0; receptacleIdx<this.receptacles.length; receptacleIdx++) {
			var recept = this.receptacles[receptacleIdx];
			if (rectsOverlap({pos: recept.pos, dims: recept.dims}, {pos: button.pos, dims: button.storedDims})) {
				receptsTouched.push(recept);
			}
		}
		return receptsTouched;
	},
	onReleaseReceptacle: function(button) {
		
		this.deactivateReceptacles(button);
		if (button.hoveringOver.length>0) {
			return button.hoveringOver[button.hoveringOver.length-1].onDropInto(button);
		}
		button.hoveringOver = undefined;
		return true;
	},
	deactivateReceptacles: function(button) {
		button.storedDims = undefined;
		for (var unhoverIdx=0; unhoverIdx<button.hoveringOver.length; unhoverIdx++) {
			button.hoveringOver[unhoverIdx].onHoverOut();
		}
	}

}