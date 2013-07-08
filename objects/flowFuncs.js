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

var flowFuncs = {
	getPts: function(a, b, UV, perp, fracOffset) {
		var distAB = a.VTo(b).mag();
		var widthFrac = this.width/(distAB);
		this.fracOffset = Math.max(Math.min(this.fracOffset, 1 - widthFrac/2), widthFrac/2);
		var aOffset = fracOffset - widthFrac;
		var bOffset = fracOffset + widthFrac;
		var pt1 = a.copy().fracMoveTo(b, aOffset);
		var pt4 = a.copy().fracMoveTo(b, bOffset);
		var pt2 = pt1.copy().movePt(perp.copy().neg().mult(this.depth));
		var pt3 = pt4.copy().movePt(perp.copy().neg().mult(this.depth));
		return [pt1, pt2, pt3, pt4];
	},
	addPts: function() {
		var aIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]);
		var bIdx = Math.max(this.ptIdxs[0], this.ptIdxs[1]);
		var a = this.wall.getPt(aIdx).copy();
		var b = this.wall.getPt(bIdx).copy();
		this.perp = this.wall.getPerpUV(aIdx);
		var UV = this.wall.getUV(aIdx);
		this.pts = this.getPts(a, b, UV, this.perp, this.fracOffset);
	},
	addArrows: function(UV, type) {
		var arrows = [];
		var width = this.width;
		var arrowCount = this.width > 30 ? 2 : 1;
		var pos = this.pts[1].copy();
		pos.movePt(UV.copy().neg().mult(this.arrowDims.dy/3));
		var ptVec = this.pts[1].VTo(this.pts[2]);
		var stepAdvance = ptVec.copy().UV().copy().mult(ptVec.mag()/(arrowCount + 1));
		for (var ctIdx=0; ctIdx<arrowCount; ctIdx++) {
			pos.movePt(stepAdvance);
			arrows.push(new ArrowStatic({pos: pos, dims: this.arrowDims, UV: UV.copy(), handle: this.handle + 'Idx' + ctIdx, fill: this.arrowFill, stroke: this.arrowStroke, cleanUpWith: this.cleanUpWith}));
		}
		return arrows;
	}
}