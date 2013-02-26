function AuxImage(attrs) {
	this.type = 'AuxImage';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.handle = attrs.handle;
	this.imgFunc = attrs.imgFunc;
	this.slotNum = attrs.slotNum;
	this.dims = this.getDims()
	this.bgCol = curLevel.bgCol;
	this.makeDiv(this.slotNum)
	this.addImage(this.imgFunc);
	this.setupStd();
}

_.extend(AuxImage.prototype, AuxFunctions, objectFuncs, {//CONSISTANT PLEASE - FUNCS/FUNCTIONS
	makeDiv: function(slotNum) {
		this.parentDiv = this.pickParentDiv('picture', slotNum);
		this.parentDiv.html('');
		$(this.parentDiv).css({width: this.dims.dx, height: this.dims.dy, 'background-color': this.bgCol.hex, 'border-radius': 20, padding: 0});
	},
	addImage: function(imgPath) {
		var self = this;
		var imgObj = parseImgFunc(imgPath, true);
		if (!imgObj.attrs) imgObj.attrs = {};
		imgObj.attrs.id = [this.type + this.handle];
		$(this.parentDiv).append(templater.img(imgObj));
		var img = $('#' + imgObj.attrs.id[0]);
		$(img).load(function() {
			var parentDims = V(self.parentDiv.width(), self.parentDiv.height());
			var origImgDims = V(img.width(), img.height());
			var scaleX = Math.min(origImgDims.dx, parentDims.dx) / origImgDims.dx;
			var scaleY = Math.min(origImgDims.dy, parentDims.dy) / origImgDims.dy;
			var scaleFactor = Math.min(scaleX, scaleY);
			var imgDims = origImgDims.copy().mult(scaleFactor);
			var imgPos = P(parentDims.dx/2 - imgDims.dx/2, parentDims.dy/2 - imgDims.dy/2);
			
			$(img).css({position: 'absolute', left: imgPos.x, top: imgPos.y, width: imgDims.dx, height: imgDims.dy});
		})
			
		
	},
	remove: function() {
		this.cleanUpParent();

	}

})