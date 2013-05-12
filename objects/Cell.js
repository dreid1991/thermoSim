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

function Cell(attrs) {
	this.type = 'Cell';
	this.handle = attrs.handle;
	var initPos = attrs.pos; // upper left corner
	var thickness = attrs.thickness || 30;
	var numCorners = 8;
	var initRadius = attrs.rad;
	var membraneColor = attrs.col;
	var initDots = attrs.dots; //will need to work out timeline integration somehow OR just have dots clean up with membrane.  I don't think there are many reasonable cases where that will cause problems
	this.guideNodes = this.makeGuideNodes(initPos, initRadius, numCorners);
	var outerWallPts = this.makeOuterWallPts(this.guideNodes, thickness);
	var innerWallPts = this.makeInnerWallPts(this.guideNodes, thickness);
	this.innerWall = walls.addWall({pts: innerWallPts, handle: this.handle + 'inner', handler: 'staticAdiabatic', show: true, record: false, col: Col(255, 0,0 )});
	this.outerWall = walls.addWall({pts: outerWallPts, handle: this.handle + 'outer', handler: 'staticAdiabatic', show: true, record: false, col: Col(0, 255, 0)});
}

_.extend(Cell.prototype, objectFuncs, {
	makeGuideNodes: function(pos, radius, numCorners) {
		center = pos.copy().movePt(V(radius, radius));
		var guideNodes = [];
		var angle = 0;
		var anglePerStep = 2 * Math.PI / numCorners;
		for (var i=0; i<numCorners; i++) {
			var nodePos = P(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
			guideNodes.push(new Cell.GuideNode(nodePos));
			angle += anglePerStep;
		}
		for (var i=0; i<guideNodes.length; i++) {
			guideNodes[i].prev = i == 0 ? guideNodes[guideNodes.length - 1] : guideNodes[i - 1];
			guideNodes[i].next = i == guideNodes.length - 1 ? guideNodes[0] : guideNodes[i + 1];
		}
		return guideNodes;
	},
	makeOuterWallPts: function(guideNodes, thickness) {
		var pts = [];
		var ptIdx = 0;
		for (var i=guideNodes.length-1; i>=0; i--) {
			var guideNode = guideNodes[i];
			guideNode.innerWallIdx = i;
			var fromNext = guideNode.next.pos.VTo(guideNode.pos).perp('ccw');
			var toPrev = guideNode.pos.VTo(guideNode.prev.pos).perp('ccw');
			var wallPtPos = guideNode.pos.copy().movePt(fromNext.add(toPrev).UV().mult(thickness / 2));
			pts.push(wallPtPos);
		}
		return pts;
		
	},
	makeInnerWallPts: function(guideNodes, thickness) {
		var pts = [];
		for (var i=0; i<guideNodes.length; i++) {
			var guideNode = guideNodes[i];
			guideNode.outerWallIdx = i;
			var fromPrev = guideNode.prev.pos.VTo(guideNode.pos).perp('ccw');
			var toNext = guideNode.pos.VTo(guideNode.next.pos).perp('ccw');
			var wallPtPos = guideNode.pos.copy().movePt(fromPrev.add(toNext).UV().mult(thickness / 2));
			pts.push(wallPtPos);			
		}

		return pts;	
	},
	remove: function() {
		
	},


});

Cell.GuideNode = function(pos) {
	this.pos = pos;
	//maybe give it its wall pts too
	this.next = undefined;
	this.prev = undefined;
	this.innerWallIdx = undefined;
	this.outerWallIdx = undefined;
}

Cell.GuideNode.prototype = {

}