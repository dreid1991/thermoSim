function AuxPicture(imgPath) {
	this.type = 'AuxPicture';
	this.cleanUpWith = 'block'//make take attrs, make an option
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
		$(this.parentDiv).css("width", this.dims.dx)
			.css("height", this.dims.dy)
			.css("background-color", this.bgCol.hex)
			.css("border-radius", 20)
			.css("padding", 0);
	},
	addImage: function(imgPath) {
		$(this.parentDiv).append('<center><img src=' + imgPath + '></img></center');
	},
	remove: function() {
		this.cleanUpParent();

	}

}
)