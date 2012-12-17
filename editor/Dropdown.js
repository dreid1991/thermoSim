function Dropdown(tree, pos, dims, text, fillCol, hoverCol) {
	this.expanded = false;
	this.tree = tree;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.fillCol = fillCol.copy();
	this.hoverCol = hoverCol.copy();
	this.defineClickFuncs();
	this.button = new ArrowButton(this.tree, this, this.pos, undefined, this.clickFuncs, this.text, false);
	this.button.toObjectMode(false);
	this.button.pointArrows('down');
	this.items = [];
}

Dropdown.prototype = {
	defineClickFuncs: function() {
		this.clickFuncs = {
			object: {
				rect: function(){},
				arrows: this.clickArrows
			},
			tree: {
				rect: function(){console.log('Dropdown is in tree mode!')},
				arrows: function(){console.log('Dropdown is in tree mode!')}
			}
		}
	},
	clickArrows: function() {
		if (this.expanded) {
			this.contract();
		} else {
			this.expand();
		}
	},
}