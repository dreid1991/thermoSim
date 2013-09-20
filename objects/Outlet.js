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
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset);
	this.arrows = [];
	this.pFloor = attrs.pressureFloor || 0;
	//should probably scale probability to leaving based on dist from pFloor
	this.pList = this.wall.getDataSrc('pInt');
	this.setupStd();
	this.init();
}

_.extend(Outlet.prototype, flowFuncs, objectFuncs, {
	init: function() {	
		this.addPts(); //sets this.pts
		this.wall.addPts(this.ptIdxs[1], this.pts);
		var subWallIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]) + (this.pts.length == 4 ? 2 : 1);
		this.arrows = this.addArrows(this.pts[1].VTo(this.pts[2]).UV().perp('cw'));
		walls.setSubWallHandler(this.wallInfo, subWallIdx, new Listener(this.hit, this));
	},
	hit: function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
		//using this so pFloor can be changed, should that become a thing
		var pressure = this.pList[this.pList.length - 1];
		var interpRange = Math.min(.75, .1 * this.pFloor);
		var chance = (pressure - this.pFloor + interpRange) / (2 * interpRange);
		if (Math.random() < chance) {
			return dotManager.remove(dot, true);
		} else {
			return WallMethods.collideMethods.reflect(dot, wallUV, perpV);
		}
	},
	remove: function() {
		this.arrows.map(function(arrow) {arrow.remove()});
	},
})