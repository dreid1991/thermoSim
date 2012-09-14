function GraphBlank (parentDiv) {
	this.dims = this.getGraphDims();
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/this.dims.dx;
	this.yStart = 1-this.borderSpacing/this.dims.dy;
	this.legendWidth = 80;
	this.xEnd = (this.dims.dx - (this.legendWidth+8))/this.dims.dx;
	this.yEnd = .05;
	this.gridSpacing = 40;

	this.setNumGridLines();


	this.setStds();
	this.handle = 'blank' + Math.round(Math.random()*100000);//FIX THIS. MAKE IT BE UNIQUE.  HAVE LIKE LIST OF GRAPH HANDLES
	this.parentDiv = parentDiv;
	this.makeCanvasNoReset(this.dims, parentDiv);
	this.parentDiv.attr('filledWith', 'blank');
	this.drawBGBlank()
}

_.extend(GraphBlank.prototype, GraphBase,
{
	drawBGBlank: function() {
		this.graph.save();
		this.drawBGRect();
		this.graph.globalAlpha = .2;
		this.drawGrid();
		this.drawBounds();
		this.graph.restore();
	},	

}
	
)	
