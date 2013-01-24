function MenuRenderer() {
	this.frameDiv = $('#objDiv');
	this.typeDivs = this.makeTypeDivs();
	$(this.frameDiv).append(this.typeDivs);//?
}

MenuRenderer.prototype = {
	makeTypeDivs: function() {
		//wall
		//dots
		//objects
		//listener
		//readoutentry
		//record
		//command
	}

}