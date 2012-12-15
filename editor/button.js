function Button (paper, pos, size, labelText, onClick, imgId, fillCol, fillColHover,  rounding) {
//Yo yo, button states are constant, no need to make attrs.  That is only for things that can get changed and you may need to edit/undo
	this.paper = paper;
	this.pos = pos.copy();
	if (size == 'large') {
		this.dims = config.buttonDimsLarge;
	} else if (size == 'medium') {
		this.dims = config.buttonDimsMedium;
	} else if (size == 'small') {
		this.dims = config.buttonDimsSmall;
	} else if (size instanceof Vector) {
		this.dims = size.copy();
	} else {
		console.log('Bad button dims sent to ' + labelText);
		console.trace();
	}
	
	this.fillCol = defaultTo(fillCol, config.buttonFillCol);
	this.fillColHover = defaultTo(fillColHover, config.buttonFillColHover);
	this.rounding = defaultTo(rounding, config.buttonRounding);
	this.onClick = onClick;
	this.rect = this.makeRect();
	if (labelText) {
		this.labelText = labelText;
		this.label = this.makeLabel();
	}
	if (imgId) {
		this.imagePadding = config.imagePadding;
		this.imgId = imgId;
		this.image = this.makeImage();
	}
}

_.extend(Button.prototype, assignHover, {
	makeRect: function() {
		var rect = this.paper.rect(0, 0, this.dims.dx, this.dims.dy, this.rounding).attr({
			'stroke-width': 0,
			fill: this.fillCol.hex
		});
		translateObj(rect, this.pos);
		rect.parent = this;
		this.assignHover(rect, 'rect', this.fillColHover, this.fillCol);
		rect.click(this.onClick);
		return rect;
	},
	makeLabel: function() {
		var textPos = this.pos.copy().movePt(this.dims.copy().mult(.5));
		var label = this.paper.text(0, 0, this.labelText).attr({'font-size': config.textSizeMed});
		translateObj(label, textPos);
		label.parent = this;
		this.assignHover(label, 'rect', this.fillColHover, this.fillCol);
		label.click(this.onClick);
		return label;
		
	},
	makeImage: function() {
		var imgDiv = $('#' + this.imgId)[0];
		var height = imgDiv.height;
		var width = imgDiv.width;
		var dims = V(width, height);
		dims = scaleDims(dims, this.dims, this.imagePadding);
		var pos = this.pos.copy().movePt(this.dims.copy().mult(.5)).movePt(dims.copy().mult(-.5));
		var raphaelImg = this.paper.image(imgDiv.src, pos.x, pos.y, dims.dx, dims.dy);
		raphaelImg.parent = this;
		this.assignHover(raphaelImg, 'rect', this.fillColHover, this.fillCol);
		raphaelImg.click(this.onClick);
		return raphaelImg;
	},
	remove: function() {
		this.action('remove');
	},
	move: function(moveOrder) {
		if (moveOrder instanceof Vector) {
			this.pos.movePt(moveOrder);
		} else if (moveOrder instanceof Point) {
			this.pos.set(moveOrder);
		} else {
			console.log('Bad move orders sent to ' + this.labelText);
		}
		translateObj(this.rect, this.pos);
		var imgAndLabelPos = this.pos.copy().movePt(this.dims.copy().mult(.5));
		if (this.label) {
			translateObj(this.label, imgAndLabelPos)
		}
		if (this.image) {
			translateObj(this.image, imgAndLabelPos)
			//YO YO, THIS IS NOT WORKING
		}
		
	},
	hide: function() {
		this.action('hide');
	},
	show: function() {
		this.action('show');
	},
	toFront: function() {
		this.action('toFront');
	},
	action: function(actionType) {
		this.rect[actionType]();
		if (this.label) {
			this.label[actionType]();
		}
		if (this.image) {
			this.image[actionType]();
		}
	}
})
	


