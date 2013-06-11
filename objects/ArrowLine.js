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

function ArrowLine(handle, pts, col, lifespan, canvasHandle){
	this.handle = handle;
	var rotate = .5;
	this.pts = {line:pts, arrow: new Array(3)}
	this.col = col;
	this.canvasHandle = typeof canvasHandle === 'string' ? canvasHandle : 'main';
	var ptLast = this.pts.line[this.pts.line.length-1];
	var ptNextLast = this.pts.line[this.pts.line.length-2];
	var dirBack = ptLast.VTo(ptNextLast).UV();
	var dirSide1 = dirBack.copy().rotate(rotate);
	var dirSide2 = dirBack.copy().rotate(-rotate);

	this.pts.arrow[0] = ptLast.copy().movePt(dirSide1.mult(10));
	this.pts.arrow[1] = ptLast;
	this.pts.arrow[2] = ptLast.copy().movePt(dirSide2.mult(10));
	return this.show(lifespan);
}	

ArrowLine.prototype = {
	draw: function(ctx){
		var shaft = this.pts.line;
		for (var ptIdx=0; ptIdx<shaft.length-1; ptIdx++) {
			draw.line(shaft[ptIdx], shaft[ptIdx+1], this.col, ctx);
		}
		var arrow = this.pts.arrow;
		
		draw.line(arrow[0], arrow[1], this.col, ctx);
		draw.line(arrow[1], arrow[2], this.col, ctx);
	},
	show: function(lifespan){//in ms
		var turn = 0;
		canvasManager.addListener(this.canvasHandle, 'drawArrow' + this.handle, this.draw, this, 2);
		addListener(curLevel, 'update', 'updateArrow' + this.handle, this.makeDrawFunc(lifespan), this)
		return this;
	},
	makeDrawFunc: function(lifespan){
		var turn = 0;
		var self = this;
		var drawListener = function(){
			self.draw();
		}
		
		if (lifespan !== undefined) {
			return function() {
				if (turn++ >= lifespan) {
					canvasManager.removeListener(this.canvasHandle, 'drawArrow' + this.handle);
					removeListener(curLevel, 'update', 'updateArrow' + this.handle);
				}
			}
		} else {
			return function(){};
		}
	},
	hide: function(){
		canvasManager.removeListener(this.handleHandle, 'drawArrow' + this.handle);
		removeListener(curLevel, 'update', 'updateArrow' + this.handle);
	}
}