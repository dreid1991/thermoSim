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

function CompArrow(attrs){
	this.type = 'CompArrow';
	var wallInfo = defaultTo(0, attrs.wallInfo);
	var speed = defaultTo(1.5, attrs.speed);
	var compMode = defaultTo('adiabatic', attrs.compMode);
	var makeStops = defaultTo(true, attrs.stops);
	var bounds = defaultTo({y:{min:30, max:350}}, attrs.bounds);
	this.wall = walls[wallInfo];
	var rotation = 0;
	var cols = {};
	cols.outer = Col(44, 118, 172);
	cols.onClick = Col(44, 118, 172);
	cols.inner = curLevel.bgCol.copy();
	var dims = V(25, 15);
	var handle = 'volDragger' + defaultTo('', attrs.handle);
	var drawCanvas = c;
	var canvasElement = canvas;
	var listeners = {};
	if (makeStops) {
		this.stops = new Stops({stopPt:{height:bounds.y.max}, wallInfo:wallInfo});
	}
	var wall = this.wall;
	listeners.onDown = function(){};
	listeners.onMove = function(){wall.changeSetPt(this.pos.y, compMode, speed)};
	listeners.onUp = function(){};
	this.dragArrowFunc = this.makeDragArrowFunc(this.wall, rotation, cols, dims, handle, drawCanvas, canvasElement, listeners, bounds);
	this.dragArrow = this.dragArrowFunc();
	this.setupStd();
	
	return this;
}
_.extend(CompArrow.prototype, objectFuncs, {
	remove: function(){
		this.dragArrow.remove();
		if(this.stop){
			this.stops.remove();
		}
	},
	makeDragArrowFunc: function(wall, rotation, cols, dims, handle, drawCanvas, canvasElement, listeners, bounds) {
		return function () {
			var pos = wall[1].copy();
			return new DragArrow(pos, rotation, cols, dims, handle, drawCanvas, canvasElement, listeners, bounds).show();
		}
	},
	enable: function() {
		this.dragArrow.setPos(this.wall[1].copy());
		this.dragArrow.show();
		this.enabled = true;
	},
	disable: function() {
		this.dragArrow.hide();
		this.enabled = false;
	}
}
)