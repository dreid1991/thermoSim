
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