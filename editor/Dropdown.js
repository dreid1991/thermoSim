function Dropdown(paper, tree, handle, pos, dims, text, fillCol, hoverCol) {
	this.paper = paper;
	this.textSize = config.textSizeMed;
	this.handle = handle;
	this.expanded = false;
	this.tree = tree;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.text = text;
	this.itemDims = V(dims.dx, this.textSize*1.7);
	this.mouseOutPadding = 30;
	this.fillCol = fillCol.copy();
	this.hoverCol = hoverCol.copy();
	this.textSize = config.textSizeMed;
	this.defineClickFuncs();
	this.button = new ArrowButton(this.tree, this, this.pos, undefined, this.clickFuncs, this.text, true);
	this.button.toObjectMode(false);
	this.button.pointArrows('down');
	this.items = [];
	this.dropdownDiv = this.makeDropdownDiv();
	this.dropdownPaper = this.makeDropdownPaper();
	$(this.dropdownDiv).hide();
	this.bottomRound = this.makeBottomRound();
	//this.bottomRound.hide();
}

Dropdown.prototype = {
	addItem: function(labelText, onClick) {
		
		var pos = P(0, 0).movePt(V(0, this.items.length*this.itemDims.dy-1));
		
		this.items.push(new DropdownItem(this.dropdownPaper, pos, this.itemDims, this.textSize, labelText, onClick, this.fillCol, this.hoverCol));
		//this.items[this.items.length-1].hide();
		
		$(this.dropdownDiv).css({height: this.items.length*this.itemDims.dy + config.buttonRounding})
		this.dropdownPaper.setSize($(this.dropdownDiv).width(), $(this.dropdownDiv).height())
		
		translateObj(this.bottomRound, pos.copy().movePt(V(0, this.itemDims.dy-config.buttonRounding)));
	},
	expand: function() {
		this.expanded = true;
		this.setupMouseOut()

		var paperPos = posGlobal(this.pos.copy().movePt(V(0, this.dims.dy)), $('#treeDiv'));
		/*$(this.dropdownDiv).css({
			top: paperPos.y,
			left: paperPos.x
		});*/
		$(this.dropdownDiv).show();
	},
	contract: function() {
		this.expanded = false;
		$(document).unbind('mousemove', this.hoverFunc);
		this.hoverFunc = undefined;
		/*
		for (var itemIdx=0; itemIdx<this.items.length; itemIdx++) {
			this.items[itemIdx].hide();
		}
		this.bottomRound.hide();
		*/
		$(this.dropdownDiv).hide();
	},
	makeDropdownDiv: function() {
		var paperPos = this.pos.copy().movePt(V(0, this.dims.dy));//posGlobal(this.pos.copy().movePt(V(0, this.dims.dy)), $('#treeDiv'));
		var dropdownDiv = $('<div></div>')
		$('#treeWrapper').append(dropdownDiv);	
		$(dropdownDiv).css({
			position: 'absolute', 
			left: paperPos.x, 
			top: paperPos.y,
			width: this.dims.dx,
			'z-index': 3,
			height: 0
		})
		$(dropdownDiv).attr('id', this.handle);
		return $('#' + this.handle)[0];
	},
	makeDropdownPaper: function() {
		return Raphael(this.handle, $('#' + this.handle).width(), $('#' + this.handle).height());
	},
	makeHoverFunc: function(self, pos, dims) {
		return function() {
			var mousePos = posOnPaper(globalMousePos, self.paper);
			if (mousePos.x < pos.x || mousePos.x > pos.x+dims.dx || mousePos.y < pos.y || mousePos.y > pos.y+dims.dy){
				self.contract();
			}
		}
	},
	setupMouseOut: function() {
		var dropdownDims = V(this.dims.dx, this.dims.dy + this.items.length*this.itemDims.dy);
		var pos = posGlobal(this.pos, $('#treeDiv'));
		this.hoverFunc = this.makeHoverFunc(this, pos, dropdownDims);
		$(document).mousemove(this.hoverFunc);
	},
	makeBottomRound: function() {
		var round = this.dropdownPaper.rect(0, 0, this.dims.dx, config.buttonRounding*2, config.buttonRounding);
		round.attr({
			'stroke-width': 0,
			fill: this.fillCol.hex
		})
		translateObj(round, P(0, 0).movePt(V(0, this.dims.dy-config.buttonRounding)));
		return round;
	},
	toFront: function() {
		this.button.toFront();
	},
	show: function() {
		this.button.show();
	},
	hide: function() {
		if (this.expanded) {
			this.contract();
		}
		this.button.hide();
	},
	defineClickFuncs: function() {
		var dropdown = this;
		var click = function() {
			if (dropdown.expanded) {
				dropdown.contract();
			} else {
				dropdown.expand();
			}
		}
		this.clickFuncs = {
			object: {
				rect: click,
				arrows: click
			},
			tree: {
				rect: function(){console.log('Dropdown is in tree mode!')},
				arrows: function(){console.log('Dropdown is in tree mode!')}
			}
		}
	}

}

function DropdownItem(paper, pos, dims, textSize, labelText, onClick, fillCol, hoverCol) {
	this.paper = paper;
	this.labelText = labelText;
	this.textSize = textSize;
	this.labelIndent = config.labelIndent;
	this.onClick = onClick;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.fillCol = fillCol.copy();
	this.fillColHover = hoverCol.copy();
	this.rect = this.makeRect();
	this.label = this.makeLabel();
}

DropdownItem.prototype = {
	show: function() {
		this.rect.show().toFront();
		this.label.show().toFront();
	},
	hide: function() {
		this.rect.hide();
		this.label.hide();
	},
	getLabelText: function() {
		
	},
	makeRect: function() {
		var rect = this.paper.rect(0, 0, this.dims.dx, this.dims.dy).attr({'stroke-width':0, fill:this.fillCol.hex});
		translateObj(rect, this.pos);
		rect.hover(
			function() {this.attr({fill:this.parent.fillColHover.hex})},
			function() {this.attr({fill:this.parent.fillCol.hex})}
		);
		rect.parent = this;
		rect.click(this.onClick);
		return rect;
	},
	makeLabel: function() {
		var labelPos = this.pos.copy().movePt(V(this.labelIndent, this.dims.dy/2+this.textSize/2));
		var label = this.paper.text(0, 0, this.labelText).attr({'font-size': this.textSize, 'text-anchor': 'start', fill: config.textCol.hex});
		translateObj(label, labelPos);
		label.hover(
			function() {this.parent.rect.attr({fill:this.parent.fillColHover.hex})},
			function() {this.parent.rect.attr({fill:this.parent.fillCol.hex})}		
		);
		label.parent = this;
		label.click(this.onClick);
		return label;
	}
}