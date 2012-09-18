function AuxPicture(imgPath) {
	this.type = 'AuxPicture';
	this.dims = this.getDims()
	this.bgCol = curLevel.bgCol;
	this.makeDiv()
	this.addImage(imgPath);
	this.addCleanUp();
}

_.extend(AuxPicture.prototype, AuxFunctions, objectFuncs, {//CONSISTANT PLEASE - FUNCS/FUNCTIONS
	makeDiv: function() {
		this.parentDiv = this.pickParentDiv('picture');
		this.parentDiv.html('');
		$(this.parentDiv).css("width", this.dims.dx);
		$(this.parentDiv).css("height", this.dims.dy);
		$(this.parentDiv).css("background-color", this.bgCol.hex);
		$(this.parentDiv).css("border-radius", 20);
		$(this.parentDiv).css("padding", 15);
	},
	addImage: function(imgPath) {
		$(this.parentDiv).append('<center><img src=' + imgPath + '></img></center');
	},
	remove: function() {
		$(this.parentDiv).removeAttr('style');
		this.parentDiv.html('');
		$(this.parentDiv).attr('filledWith', 'empty');
	}

}
)