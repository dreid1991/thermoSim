function Dropdown(tree, pos, dims, text, fillCol, hoverCol) {
	this.tree = tree;
	this.pos = pos.copy();
	this.dims = dims.copy();
	this.fillCol = fillCol.copy();
	this.hoverCol = hoverCol.copy();
	this.defineClickFuncs();
	this.button = new ArrowButton(this.tree, this, this.pos, undefined, this.clickFuncs, this.text, false);
	this.items = [];
}

Dropdown.prototype = {
	defineClickFuncs: function() {
		this.clickFuncs = {
			object: {
				rect: function(){},
				arrows: function(){}
			},
			tree: {
				rect: function(){},
				arrows: function(){}
			}
		}
	},
	clickFunc: function() {
		
	},
}