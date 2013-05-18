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
	var thickness = 10;
	this.nodeMass = attrs.nodeMass || 40;
	var numCorners = 8;
	var initRadius = attrs.rad;
	var membraneColor = attrs.col;
	var initDots = attrs.dots; //will need to work out timeline integration somehow OR just have dots clean up with membrane.  I don't think there are many reasonable cases where that will cause problems
	this.guideNodes = this.makeGuideNodes(initPos, initRadius, numCorners, this.nodeMass);
	var outerWallPts = this.makeOuterWallPts(this.guideNodes, thickness);
	var innerWallPts = this.makeInnerWallPts(this.guideNodes, thickness);
	this.outerWall = walls.addWall({pts: outerWallPts, handle: this.handle + 'outer', handler: 'staticAdiabatic', show: true, record: false, col: Col(0, 255, 0)});
	this.innerWall = walls.addWall({pts: innerWallPts, handle: this.handle + 'inner', handler: 'staticAdiabatic', show: true, record: false, col: Col(255, 0,0 )});
	this.innerWall.hitThreshold = -10;
	this.outerWall.hitThreshold = -10;
	this.parentWallMemberTag = attrs.parentWallHandle;
	this.cellMemberTag = 'cell' + this.handle.toCapitalCamelCase();
	this.assignWallHandlers(this.guideNodes, this.innerWall, this.outerWall, this.parentWallMemberTag, this.cellMemberTag);
	this.setupStd();
}

_.extend(Cell.prototype, objectFuncs, {
	makeGuideNodes: function(pos, radius, numCorners, nodeMass) {
		center = pos.copy().movePt(V(radius, radius));
		var guideNodes = [];
		var angle = 0;
		var anglePerStep = 2 * Math.PI / numCorners;
		for (var i=0; i<numCorners; i++) {
			var nodePos = P(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
			guideNodes.push(new Cell.GuideNode(nodePos, nodeMass));
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
		var wallPtIdx = 0;
		var node = guideNodes[0];
		while (wallPtIdx < guideNodes.length) {
			node.prev.outerWallIdx = wallPtIdx;
			var fromNext = node.next.pos.VTo(node.pos).perp('ccw');
			var toPrev = node.pos.VTo(node.prev.pos).perp('ccw');
			var wallPtPos = node.pos.copy().movePt(fromNext.add(toPrev).UV().mult(thickness / 2));
			pts.push(wallPtPos);
			wallPtIdx++;
			node = node.prev;
		}
		return pts;
		
	},
	makeInnerWallPts: function(guideNodes, thickness) {
		var pts = [];
		var wallPtIdx = 0;
		var node = guideNodes[0];
		while(wallPtIdx < guideNodes.length) {
			node.innerWallIdx = wallPtIdx;
			var fromPrev = node.prev.pos.VTo(node.pos).perp('ccw');
			var toNext = node.pos.VTo(node.next.pos).perp('ccw');
			var wallPtPos = node.pos.copy().movePt(fromPrev.add(toNext).UV().mult(thickness / 2));
			pts.push(wallPtPos);			
			wallPtIdx++;
			node = node.next;
		}

		return pts;	
	},
	assignWallHandlers: function(guideNodes, innerWall, outerWall, parentWallMemberTag, cellMemberTag) {
		for (var i=0; i<guideNodes.length; i++) {
			this.assignWallHandler(innerWall, guideNodes[i].innerWallIdx, outerWall, guideNodes[i].outerWallIdx, guideNodes[i], guideNodes[i].next, cellMemberTag, parentWallMemberTag);
			this.assignWallHandler(outerWall, guideNodes[i].outerWallIdx, innerWall, guideNodes[i].innerWallIdx, guideNodes[i], guideNodes[i].next, parentWallMemberTag, cellMemberTag);
		}
		
		// for (var wallIdx=0; wallIdx<walls.length; wallIdx++) {
			// var wall = walls[wallIdx];
			// for (var i=0; i<wall.length - 1; i++) {
				
				// var nodeA = _.find(guideNodes, function(node) {node.innerWallIdx == i});
				// var nodeBWallIdx = i == wall.length - 2 ? 0 : i + 1;
				// var nodeB = _.find(guideNodes, function(node) {node.innerWallIdx == nodeBWallIdx});
				// this.assignWallHandler(wall.handle, i, nodeA, nodeB);
			// }
		// }
	},
	assignWallHandler: function(self, selfIdx, opposite, oppositeIdx, nodeA, nodeB, selfTag, oppositeTag) {
		var reflect = WallMethods.collideMethods.reflect;
		var hitFunc = function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
			
			if (dot.tag == selfTag) {
				reflect(dot, wallUV, perpV);
			} else if (dot.tag == oppositeTag) {
				var handler = opposite.handlers[oppositeIdx];
				handler.func.apply(handler.obj, [dot, opposite, oppositeIdx, opposite.wallUVs[oppositeIdx], -perpV, opposite.wallPerpUVs[oppositeIdx]]);
			}
		}
		walls.setSubWallHandler(self.handle, selfIdx, {func: hitFunc, obj: this});
	},
	//setSubWallHandler: function(wallInfo, subWallIdx, handler) {
	remove: function() {
		
	},


});

Cell.GuideNode = function(pos, mass) {
	this.pos = pos;
	//maybe give it its wall pts too
	this.next = undefined;
	this.prev = undefined;
	this.m = mass;
	this.v = V(0, 0);
	this.innerWallIdx = undefined;
	this.outerWallIdx = undefined;
}

Cell.GuideNode.prototype = {

}

