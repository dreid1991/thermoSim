function ElementAdder(paper, tree, pos, buttonDims, labelText, rectCol, rectColHover) {
	this.elementMD = elementMD;
	this.elems = [	this.elementMD.wall, 
						this.elementMD.dots, 
						this.elementMD.readoutEntry, 
						this.elementMD.listener, 
						this.elementMD.weights, 
						this.elementMD.piston, 
						this.elementMD.sandbox, 
						this.elementMD.compArrow, 
						this.elementMD.heater, 
						this.elementMD.stops, 
						this.elementMD.tempChanger,
						this.elementMD.RMSChanger//,
						//'arrowStatic',
				]
	this.paper = paper;
	this.tree = tree;
	this.pos = pos.copy();
	this.buttonDims = buttonDims.copy();
	this.labelText = labelText;
	this.rectCol = rectCol.copy();
	this.rectColHover = rectColHover.copy();
	this.elememtAttrs = elementAttrs;
	this.dropdown = this.makeDropdown();
	
	
}

ElementAdder.prototype = {
	show: function() {
		this.dropdown.show();
	},
	hide: function() {
		this.dropdown.hide();
	},
	toFront: function() {
		this.dropdown.toFront();
	},
	makeDropdown: function() {
		var dropdown = new Dropdown(this.paper, this.tree, 'elementAdder', this.pos, this.buttonDims, this.labelText, this.rectCol, this.rectColHover);
		for (var idx=0; idx<this.elems.length; idx++) {
			var elem = this.elems[idx];
			dropdown.addItem(elem({returnLabel: 'true'}), this.makeClickFunc(elem));
		}
		return dropdown;
	},
	makeClickFunc: function (elem) {
		var tree = this.tree
		return function() {
			tree.addElement(elem);
		}
	}
}