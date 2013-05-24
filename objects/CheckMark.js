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

function CheckMark(corner, dims, col, stroke, drawCanvas){
	var a = corner;
	var b = dims;
	var p1 = P(a.x			, a.y+b.dy*.6	);
	var p2 = P(a.x+b.dx*.4	, a.y+b.dy		);
	var p3 = P(a.x+b.dx		, a.y			);
	var p4 = P(a.x+b.dx*.35	, a.y+b.dy*.75	);
	var pts = [p1, p2, p3, p4];
	this.pts = pts;
	this.col = col;
	this.stroke = stroke;
	this.drawCanvas = drawCanvas;
}
CheckMark.prototype = {
	draw: function(){
		draw.fillPtsStroke(this.pts, this.col, this.stroke, this.drawCanvas);
	},
	setCanvas: function(canvas) {
		this.drawCanvas = canvas;
	}
}