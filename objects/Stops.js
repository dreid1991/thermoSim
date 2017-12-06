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

function Stops(attrs){
	this.type = 'Stops';
	//assumes canvas of c.  I mean, where else would they be?
	this.handle = attrs.handle;
	this.stopWidth = 20;
	this.stopHeight = 5;
	this.boundToSet = undefined;
	var stopPt = attrs.stopPt;
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.pts = this.wall;
	this.canvasHandle = attrs.canvasHandle || 'main';
	if (stopPt.vol) {
		var width = this.pts[0].distTo(this.pts[1]);
		var length = stopPt.vol/(vConst*width);
		this.height = this.pts[2].y-length;
	} else if (stopPt.y) {
		this.height = stopPt.height;
	}
	this.willDraw = defaultTo(true, attrs.draw);
	
	if (this.willDraw) {
		this.draw = this.makeDrawFunc(this.height);
	}
	this.setupStd();	
	
	return this.init();
}
_.extend(Stops.prototype, objectFuncs, {
	makeDrawFunc: function(height){
        //just added stop width thing
		var pLeft = this.pts[3].copy().position({y:height-this.stopHeight});
		var pRight = this.pts[2].copy().position({y:height-this.stopHeight}).movePt({dx:-this.stopWidth});
		var stopWidth = this.stopWidth;
		var stopHeight = this.stopHeight;
		var dims = V(stopWidth, stopHeight);
		var borderColLocal = borderCol;
		return function(ctx){
			draw.fillRect(pLeft, dims, borderColLocal, ctx);
			draw.fillRect(pRight, dims, borderColLocal, ctx);
		}
	},
	init: function(){
		if (this.height>this.wall[0].y) {
			this.boundToSet = 'max';
		} else {
			this.boundToSet = 'min'
		}
		this.yBoundSave = this.wall.bounds[this.boundToSet];
		var settingObj = {};
		if (this.boundToSet == 'max') {
			walls[this.wallInfo].setBounds(undefined, this.height);
		} else if (this.boundToSet == 'min') {
			walls[this.wallInfo].setBounds(this.height, undefined);
		}
		if (this.willDraw) {
			canvasManager.addListener(this.canvasHandle, 'drawStops' + this.wallInfo, this.draw, this, 1);
		}
		return this;
	},
	remove: function(){
		if (window.walls && !walls.removed) {
			if (this.boundToSet == 'max') {
				walls[this.wallInfo].setBounds(undefined, this.yBoundSave);
			} else if (this.boundToSet == 'min') {
				walls[this.wallInfo].setBounds(this.yBoundSave, undefined);
			}
		}
		if (this.willDraw) {
			canvasManager.addListener(this.canvasHandle, 'drawStops' + this.wallInfo);
		}
		return this;
	},
}
)
