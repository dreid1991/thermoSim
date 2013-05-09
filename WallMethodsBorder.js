/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

WallMethods.Border = function (attrs) {
	this.wall = attrs.wall;
	this.type = attrs.type;
	this.yMin = attrs.yMin !== undefined ? attrs.yMin : this.wall[0].y;
	this.col = attrs.col || this.wall.col.copy().adjust(-100, -100, -100);
	this.thick = attrs.thickness || 5; //don't want to have value of zero anyway
	this.update = this.pickGenerator(this.type)
	this.update();
	this.removed = false;
}
//need to do yMin stuff still

//open means one with open top.  It will start at the second point and go to the last with potential adjustments on all the points
//end means it will always go to the last point
WallMethods.Border.prototype = {
	remove: function() {
		this.removed = true;
		removeListener(curLevel, 'update', this.listenerName);
	},
	pickGenerator: function(type) {
		if (type == 'open') {
			return this.genOpen();
		} else if (type == 'wrap') {
			return this.genWrap();
		}
	},	
	genOpen: function() {
		var yMin = this.yMin || this.wall[1].y;
		return this.genBorder(this.thick, this.col, 1, 'end', true);
		
	},
	genWrap: function() {
		return this.genBorder(this.thick, this.col, 0, 'end', false);
	},
	genBorder: function(thick, col, firstPt, lastPt, bluntEnds) {
		var self = this;
		var drawCanvas = c;
		this.listenerName = 'drawBorder' + this.wall.handle.toCapitalCamelCase();
		return function() {
			self.remove();
			var segments = self.genSegs(firstPt, lastPt, thick, bluntEnds);
			addListener(curLevel, 'update', self.listenerName, function() {
				for (var segIdx=0; segIdx<segments.length; segIdx++) {
					draw.fillPts(segments[segIdx], col, drawCanvas);
				}
			})
			self.removed = false;
		};
	},
	genSegs: function(firstPt, lastPt, thick, bluntEnds) {
		var segments = [];
		var firstPtIdx = firstPt;
		var lastPtIdx = lastPt == 'end' ? this.wall.length - 1 : lastPt;
		for (var ptIdx=firstPtIdx; ptIdx<lastPtIdx; ptIdx++) {
			var perpUV = this.wall.wallPerpUVs[ptIdx].copy().neg();
			var pt1 = this.wall[ptIdx].copy();
			var pt2 = this.wall[ptIdx + 1].copy();
			
			var prevPtIdx = this.wall[ptIdx - 1] ? ptIdx - 1 : this.wall.length-2;
			var nextPtIdx = ptIdx + 1 == lastPtIdx ? 0 : ptIdx + 1;
			var extendV1, extendV2;
			
			extendV1 = this.getExtendV(perpUV, prevPtIdx, firstPtIdx - 1, thick, bluntEnds);
			extendV2 = this.getExtendV(perpUV, nextPtIdx, 0, thick, bluntEnds);
			
			var pt3 = pt2.copy().movePt(extendV2);
			var pt4 = pt1.copy().movePt(extendV1);
			if (this.type == 'open') {
				if (ptIdx == firstPtIdx) {
					pt1.y = this.yMin;
					pt4.y = this.yMin
				} else if (ptIdx == lastPtIdx - 1) {
					pt2.y = this.yMin;
					pt3.y = this.yMin;
				}
			}
			segments.push([pt1, pt2, pt3, pt4]);
		}
		return segments;
		
	},
	getExtendV: function(perpUV, neighborPtIdx, boundaryPtIdx, thick, bluntEnds) {
		var neighborPerpUV = this.wall.wallPerpUVs[neighborPtIdx].copy().neg();
		var comboUV = bluntEnds && neighborPtIdx == boundaryPtIdx ? perpUV.copy() : neighborPerpUV.add(perpUV).UV();
		var perpComp = perpUV.dotProd(comboUV);
		thick /= perpComp;
		return comboUV.mult(thick);
	}
}