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
	var numCorners = 4;
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
	this.wallMoveListenerName = this.addWallMoveListener(this.guideNodes, this.innerWall, this.outerWall, this.handle, thickness);
	this.setupStd();
	this.guideNodes[2].v.dy = -1.3;
	this.guideNodes[2].v.dx = -1.3;
	this.guideNodes[3].v.dy = -1;
	this.guideNodes[3].v.dx = -1;
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
		for (var i=0; i<guideNodes.length; i++) {//OY - MAKE SURE YOU MEAN guideNodes[i].prev FOR THE OUTER WALL
			this.assignWallHandler(innerWall, guideNodes[i].innerWallIdx, outerWall, guideNodes[i].outerWallIdx, guideNodes[i], guideNodes[i].next, cellMemberTag, parentWallMemberTag);
			this.assignWallHandler(outerWall, guideNodes[i].outerWallIdx, innerWall, guideNodes[i].innerWallIdx, guideNodes[i].next, guideNodes[i], parentWallMemberTag, cellMemberTag);
		}
	},
	assignWallHandler: function(self, selfIdx, opposite, oppositeIdx, nodeA, nodeB, selfTag, oppositeTag) {
		var reflect = WallMethods.collideMethods.reflect;
		var hitFunc = function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
			
			if (dot.tag == selfTag) {
				//am writing super slow code just to test physics.  will optimize after I check that it works
				
				// var distNodeANodeB = nodeA.pos.VTo(nodeB.pos).dotProd(wallUV);
				// var distNodeADot = nodeA.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				// var distNodeBDot = -nodeB.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				// var fracA = distNodeADot / distNodeANodeB;
				// var fracB = distNodeBDot / distNodeANodeB;
				
				// var vNodeAPerp_I = -nodeA.v.dotProd(perpUV);
				// var vNodeBPerp_I = -nodeB.v.dotProd(perpUV);
				
				// var centerNodeANodeB = nodeA.pos.copy().movePt(wallUV.copy().mult(distNodeANodeB * .5));
				// var vWallToDot_I = perpUV.copy().mult((1 - fracA) * vNodeAPerp_I + (1 - fracB) * vNodeBPerp_I);
				
				// var vecCenterToDot = centerNodeANodeB.VTo(P(dot.x, dot.y));
				
				// var vecAB = dot.v.copy().sub(vWallToDot_I);
				// var IWall = nodeA.m * centerNodeANodeB.distSqrTo(nodeA.pos) + nodeB.m * centerNodeANodeB.distSqrTo(nodeB.pos);
				
				// var j = -2 * vecAB.dotProd(perpUV) / (1 / dot.m + 1 / (nodeA.m + nodeB.m) + Math.pow(vecCenterToDot.perpDotProd(perpUV), 2) / IWall);
				
				// dot.v.add(perpUV.copy().mult(j / dot.m));
				
				
				
				
				var distNodeANodeB = nodeA.pos.VTo(nodeB.pos).dotProd(wallUV);
				var distNodeADot = nodeA.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				var distNodeBDot = -nodeB.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				
				var centerNodeANodeB = nodeA.pos.copy().movePt(wallUV.copy().mult(distNodeANodeB * .5));
				
				var fracA = distNodeADot / distNodeANodeB;
				var fracB = distNodeBDot / distNodeANodeB;
				
				vecNodeAPerp = perpUV.copy().mult(nodeA.v.dotProd(perpUV));
				vecNodeBPerp = perpUV.copy().mult(nodeB.v.dotProd(perpUV));
				
				nodeA.v.dx -= vecNodeAPerp.dx;
				nodeA.v.dy -= vecNodeAPerp.dy;
				nodeB.v.dx -= vecNodeBPerp.dx;
				nodeB.v.dy -= vecNodeBPerp.dy;				
				
				var vNodeAPerp_I = vecNodeAPerp.dotProd(perpUV);
				var vNodeBPerp_I = vecNodeBPerp.dotProd(perpUV);
				
				
				var vWallToDot_I = (1 - fracA) * vNodeAPerp_I + (1 - fracB) * vNodeBPerp_I;
									//was minus in old approach
				var vLineDot_I = perpV + vWallToDot_I;
				
				var vWallTrans_I = .5 * (vNodeAPerp_I + vNodeBPerp_I);
				
				var vNodeARel_I = vNodeAPerp_I - vWallTrans_I;
				var vNodeBRel_I = vNodeBPerp_I - vWallTrans_I;
				
				var IWall = nodeA.m * Math.pow(centerNodeANodeB.distTo(nodeA.pos), 2) + nodeB.m * Math.pow(centerNodeANodeB.distTo(nodeB.pos), 2);
				var distCenterP = centerNodeANodeB.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				
				var j = -2 * vLineDot_I / (1/dot.m + 1/(nodeA.m + nodeB.m) + distCenterP * distCenterP / IWall);
				
				vecNodeAPerp.dx += perpUV.dx * vNodeARel_I;
				vecNodeAPerp.dy += perpUV.dy * vNodeARel_I;
				//subtracting out relative velocities so I can add back in the final relative velocities
				vecNodeBPerp.dx += perpUV.dx * vNodeBRel_I;
				vecNodeBPerp.dy += perpUV.dy * vNodeBRel_I;
				
				dot.v.dx -= perpUV.dx * j / dot.m;
				dot.v.dy -= perpUV.dy * j / dot.m;
				
				
				//var vWallTrans_F = vWallTrans_I - j / (nodeA.m + nodeB.m);
				
				var omegaA_I = vNodeARel_I / (.5 * distNodeANodeB);
				var omegaA_F = omegaA_I + distCenterP * j / IWall;
				var vNodeARel_F = omegaA_F * .5 * distNodeANodeB;
				
				var vNodeBRel_F = -vNodeARel_F;

				vecNodeAPerp.dx -= perpUV.dx * vNodeARel_F;
				vecNodeAPerp.dy -= perpUV.dy * vNodeARel_F;
				
				vecNodeBPerp.dx -= perpUV.dx * vNodeBRel_F;
				vecNodeBPerp.dy -= perpUV.dy * vNodeBRel_F;

				vecNodeAPerp.dx += perpUV.dx * j / (nodeA.m + nodeB.m);
				vecNodeAPerp.dy += perpUV.dy * j / (nodeA.m + nodeB.m);

				vecNodeBPerp.dx += perpUV.dx * j / (nodeA.m + nodeB.m);
				vecNodeBPerp.dy += perpUV.dy * j / (nodeA.m + nodeB.m);			

				nodeA.v.dx += vecNodeAPerp.dx;
				nodeA.v.dy += vecNodeAPerp.dy;
				nodeB.v.dx += vecNodeBPerp.dx;
				nodeB.v.dy += vecNodeBPerp.dy;
				
			} else if (dot.tag == oppositeTag) {
				var handler = opposite.handlers[oppositeIdx];
				handler.func.apply(handler.obj, [dot, opposite, oppositeIdx, opposite.wallUVs[oppositeIdx], -perpV, opposite.wallPerpUVs[oppositeIdx]]);
			}
		}
		walls.setSubWallHandler(self.handle, selfIdx, {func: hitFunc, obj: this});
	},
	addWallMoveListener: function(nodes, innerWall, outerWall, handle, thickness) {
		addListener(curLevel, 'wallMove', 'moveCell' + this.handle.toCapitalCamelCase(), function() {
			var innerWallPtIdx = 0;
			var outerWallPtIdx = outerWall.length - 2;
			for (var i=0; i<nodes.length; i++) {
				nodes[i].pos.x += nodes[i].v.dx;
				nodes[i].pos.y += nodes[i].v.dy;
			}
			for (var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				var perpFromPrev = node.prev.pos.VTo(node.pos).perp('cw');
				var perpFromNext = node.next.pos.VTo(node.pos).perp('ccw')
				var UVPointingOut = perpFromPrev.add(perpFromNext).UV();
				outerWall[node.outerWallIdx + 1].x = node.pos.x + UVPointingOut.dx * thickness / 2;
				outerWall[node.outerWallIdx + 1].y = node.pos.y + UVPointingOut.dy * thickness / 2;
				
				innerWall[node.innerWallIdx].x = node.pos.x - UVPointingOut.dx * thickness / 2;
				innerWall[node.innerWallIdx].y = node.pos.y - UVPointingOut.dy * thickness / 2;
			}
			outerWall[0].x = outerWall[outerWall.length - 1].x;
			outerWall[0].y = outerWall[outerWall.length - 1].y;
			
			innerWall[innerWall.length - 1].x = innerWall[0].x;
			innerWall[innerWall.length - 1].y = innerWall[0].y;
			window.walls.setupWall(walls.indexOf(innerWall));
			window.walls.setupWall(walls.indexOf(outerWall));
		})
	},
	remove: function() {
	},


});

Cell.GuideNode = function(pos, mass) {
	this.pos = pos;
	this.next = undefined;
	this.prev = undefined;
	this.v = V(0, 0);
	this.m = mass;
	this.innerWallIdx = undefined;
	this.outerWallIdx = undefined;
}

Cell.GuideNode.prototype = {

}

