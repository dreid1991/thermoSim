function Dropdown(paper, tree, pos, dims, text, fillCol, hoverCol) {
	this.paper = paper;
	this.textSize = config.textSizeMed;
	this.expanded = false;
	this.tree = tree;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.text = text;
	this.itemDims = V(dims.dx, this.textSize*1.7);
	this.fillCol = fillCol.copy();
	this.hoverCol = hoverCol.copy();
	this.textSize = config.textSizeMed;
	this.defineClickFuncs();
	this.button = new ArrowButton(this.tree, this, this.pos, undefined, this.clickFuncs, this.text, true);
	this.button.toObjectMode(false);
	this.button.pointArrows('down');
	this.bottomRound = this.makeBottomRound();
	this.bottomRound.hide();
	this.items = [];
}

Dropdown.prototype = {
	addItem: function(labelText, onClick) {
		var pos = this.pos.copy().movePt(V(0, this.dims.dy + this.items.length*this.itemDims.dy-1));
		this.items.push(new DropdownItem(this.paper, pos, this.itemDims, this.textSize, labelText, onClick, this.fillCol, this.hoverCol));
		this.items[this.items.length-1].hide();
		translateObj(this.bottomRound, pos.copy().movePt(V(0, this.itemDims.dy-config.buttonRounding)));
	},
	expand: function() {
		this.expanded = true;
		for (var itemIdx=0; itemIdx<this.items.length; itemIdx++) {
			this.items[itemIdx].show();
		}
		this.bottomRound.show();
	},
	contract: function() {
		this.expanded = false;
		for (var itemIdx=0; itemIdx<this.items.length; itemIdx++) {
			this.items[itemIdx].hide();
		}
		this.bottomRound.hide();
	},
	makeBottomRound: function() {
		var round = this.paper.rect(0, 0, this.dims.dx, config.buttonRounding*2, config.buttonRounding);
		round.attr({
			'stroke-width': 0,
			fill: this.fillCol.hex
		})
		translateObj(round, this.pos.copy().movePt(V(0, this.dims.dy-config.buttonRounding)));
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
	},

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
		var labelPos = this.pos.copy().movePt(V(this.labelIndent, this.dims.dy/2));
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