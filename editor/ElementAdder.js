function ElementAdder(paper, tree, pos, buttonDims, labelText, rectCol, rectColHover) {
	this.elementOrder = [	'wall', 
						'dots', 
						'readoutEntry', 
						'listener', 
						'weights', 
						'piston', 
						'sandbox', 
						'compArrow', 
						'heater', 
						'stops', 
						'tempChanger',
						'RMSChanger'//,
						//'arrowStatic',
				]
	this.paper = paper;
	this.tree = tree;
	this.pos = pos.copy();
	this.buttonDims = buttonDims.copy();
	this.labelText = labelText;
	this.rectCol = rectCol.copy();
	this.rectColHover = rectColHover.copy();
	this.elementMd = elementMd;
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
		var dropdown = new Dropdown(this.paper, this.tree, this.pos, this.buttonDims, this.labelText, this.rectCol, this.rectColHover);
		for (var idx=0; idx<this.elementOrder.length; idx++) {
			var element = this.elementMd[this.elementOrder[idx]];
			dropdown.addItem(element.labelText, function() {
				console.log('woo!');
			});
		}
		return dropdown;
	},
}