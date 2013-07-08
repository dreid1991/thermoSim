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

function Outlet(attrs) {
	this.arrowDims = V(15, 20);
	this.arrowFill = Col(200, 0, 0);	
	this.arrowStroke = Col(100, 100, 100);
	this.type = 'Outlet';
	this.handle = attrs.handle;
	//if depth is 0, just have it not add any pointsa
	this.width = defaultTo(30, attrs.width);
	this.depth = defaultTo(20, attrs.depth) || 20; //can't be zero, need to set a wall handler
	this.fracOpen = defaultTo(1, attrs.fracOpen);
	this.makePts = this.depth;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset);
	this.arrows = [];
	this.setupStd();
	this.init();
}

_.extend(Outlet.prototype, flowFuncs, objectFuncs, {
	init: function() {	
		this.addPts();
		if (this.makePts) {
			this.wall.addPts(this.ptIdxs[1], this.pts);
		}
		var subWallIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]) + 2;
		this.arrows = this.addArrows(this.pts[1].VTo(this.pts[2]).UV().perp('cw'));
		walls.setSubWallHandler(this.wallInfo, subWallIdx, 'outlet');
	},
	remove: function() {
		this.arrows.map(function(arrow) {arrow.remove()});
	},
})