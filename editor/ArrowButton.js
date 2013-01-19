
function ArrowButton(tree, parent, posInit, dragFuncs, clickFuncs, labelText, isPlacerButton) {
	this.tree = tree;
	this.memberOf = [];
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
	} else {
		this.assignDragFuncs();
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
	//What I really should do is let you send a toTreeMode and toObjectMoe function.  Then the button would be mode flexible without sloppy things
	toTreeMode: function(move) {
		this.mode = 'tree';
		if (!this.dragFuncs || !this.dragFuncs[this.mode]) {
			this.assignClickFuncs();
		} else {
			this.assignDragFuncs();
		}
		if (this.arrowAngle = Math.PI) {
			this.pointArrows('right')
		}
	
	},
	toObjectMode: function(move) {
		
		this.mode = 'object';
		if (!this.dragFuncs || !this.dragFuncs[this.mode]) {
			this.assignClickFuncs();
		} else {
			this.assignDragFuncs();
		}
		if (move !== false) {
			if (this == this.tree.clickedButton || this == this.tree.editingButton) {
				this.tree.editingButton = this;
				this.tree.editingScene = this.parent;
				this.pointArrows('left');
				this.tree.editingButton = this;
				this.flyToPos(this.tree.buttonPosObjectModeSelected, 200);
				//this.flyToPos(P(0, 75));
			} else {
				//this.flyToPos(P(0, 75));
				this.flyToPos(P(-this.tree.buttonDims.dx-50, this.pos.y), 150);
			}
		}
	},
	hide: function() {
		this.rect.hide();
		this.innerRect.hide();
		if (this.label) {
			this.label.hide();
		}
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
		if (this.label) {
			this.label.show().toFront();
		}
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].show().toFront();
		}
	},
	assignClickFuncs: function() {
		if (this.clickFuncs) {
			this.rect.unclick(this.getClickFunc(this.rect));
			this.rect.click(this.clickFuncs[this.mode]['rect']);
			this.innerRect.unclick(this.getClickFunc(this.innerRect));
			this.innerRect.click(this.clickFuncs[this.mode]['arrows']);
			if (this.label) {
				this.label.unclick(this.getClickFunc(this.label))
				this.label.click(this.clickFuncs[this.mode]['rect']);
			}
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				this.arrows[arrowIdx].unclick(this.getClickFunc(this.label));
				this.arrows[arrowIdx].click(this.clickFuncs[this.mode]['arrows']);
			}
		}
	},
	getClickFunc: function(raphaelObj) {
		for (var eventIdx=0; eventIdx<raphaelObj.events.length; eventIdx++) {
			if (raphaelObj.events[eventIdx].name == 'click') {
				return raphaelObj.events[eventIdx].f;
			}
		}
	},
	assignDragFuncs: function() {
		if (this.dragFuncs) {
			this.rect.undrag();
			this.rect.drag(this.dragFuncs[this.mode].onMove, this.dragFuncs[this.mode].onStart, this.dragFuncs[this.mode].onEnd);
			this.innerRect.undrag();
			this.innerRect.drag(this.dragFuncs[this.mode].onMove, this.dragFuncs[this.mode].onStart, this.dragFuncs[this.mode].onEnd);
			if (this.label) {
				this.label.undrag();
				this.label.drag(this.dragFuncs[this.mode].onMove, this.dragFuncs[this.mode].onStart, this.dragFuncs[this.mode].onEnd);
			}
			for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
				this.arrows[arrowIdx].undrag();
				this.arrows[arrowIdx].drag(this.dragFuncs[this.mode].onMove, this.dragFuncs[this.mode].onStart, this.dragFuncs[this.mode].onEnd);
			
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
			'stroke-width': 0
			//'stroke-linejoin': 'round',
		});
		if (this.dragFuncs) {
			//rect.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
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
			//rect.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
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
				//arrow.drag(this.dragFuncs.tree.onMove, this.dragFuncs.tree.onStart, this.dragFuncs.tree.onEnd);
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
			var label = this.tree.paper.text(0, 0, tempText).attr({'text-anchor': 'start', 'font-size': this.tree.labelTextSize, fill: config.textCol.hex});
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
			if (this.dragFuncs && this.dragFuncs[this.mode]) {
				label.drag(this.dragFuncs[this.mode].onMove, this.dragFuncs[this.mode].onStart, this.dragFuncs[this.mode].onEnd);
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
		if (this.label) {
			this.label.remove();
		}
		for (var arrowIdx=0; arrowIdx<this.arrows.length; arrowIdx++) {
			this.arrows[arrowIdx].remove();
		}
		for (var memberIdx=0; memberIdx<this.memberOf; memberIdx++) {
			var list = this.memberOf[memberIdx];
			var idx = list.indexOf(this);
			if (idx!=-1) {
				list.splice(idx, 1);
			}
		}
	}
});