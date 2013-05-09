/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
