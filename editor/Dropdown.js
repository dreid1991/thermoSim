function Dropdown(paper, tree, pos, dims, text, fillCol, hoverCol) {
	this.textSize = config.textSizeMed;
	this.expanded = false;
	this.tree = tree;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.text = text;
	this.itemDims = V(dims.dx, this.textSize*1.5);
	this.fillCol = fillCol.copy();
	this.hoverCol = hoverCol.copy();
	this.defineClickFuncs();
	this.button = new ArrowButton(this.tree, this, this.pos, undefined, this.clickFuncs, this.text, true);
	this.button.toObjectMode(false);
	this.button.pointArrows('down');
	this.items = [];
}

Dropdown.prototype = {
	addItem: function(labelText, onClick) {
		var pos = this.pos.copy().movePt(V(0, this.dims.dy + this.items.length*this.itemDims.dy -4));
		this.items.push(new DropdownItem(this.paper, pos, this.itemDims, labelText, onClick, this.fillCol, this.hoverCol));
	},
	click: function() {
		if (this.expanded) {
			this.contract();
		} else {
			this.expand();
		}
	},
	expand: function() {
		for (var itemIdx=0; itemIdx<this.items.length; itemIdx++) {
			this.items[itemIdx].show();
		}
		//this.bottomRound.show();
	},
	contract: function() {
		for (var itenIdx=0; itemIdx<this.items.length; itemIdx++) {
			this.items[itemIdx].hide();
		}
		this.buottomRound.hide();
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
		this.clickFuncs = {
			object: {
				rect: this.click,
				arrows: this.click
			},
			tree: {
				rect: function(){console.log('Dropdown is in tree mode!')},
				arrows: function(){console.log('Dropdown is in tree mode!')}
			}
		}
	},

}

function DropdownItem(paper, pos, dims, labelText, onClick, fillCol, hoverCol) {
	this.paper = paper;
	this.labelText = labelText;
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
		var rect = this.paper.rect(0, 0, this.dims.dx, this.dims.dy, config.buttonRounding).attr({'stroke-width':0, fill:this.fillCol.hex});
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
		var label = this.paper.text(0, 0, this.labelText).attr({'font-size': this.tree.labelTextSize});
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