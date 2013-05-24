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
	this.nodeMass = attrs.nodeMass || 100;
	var center = initPos.copy().movePt(V(initRadius, initRadius));
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
	this.cellMemberTag = this.innerWall.handle;
	this.assignWallHandlers(this.guideNodes, this.innerWall, this.outerWall, this.parentWallMemberTag, this.cellMemberTag);
	this.wallMoveListenerName = this.addWallMoveListener(this.guideNodes, this.innerWall, this.outerWall, this.handle, thickness);
	this.dotId = timeline.takeNumber();
	this.addDots(center, this.innerWall, attrs.dots, attrs.temp, this.dotId, this.cellMemberTag);
	this.expelForeignDots(center, this.outerWall, this.cellMemberTag, window.dotManager.lists.ALLDOTS);
	window.dotMigrator.migrateDots(window.dotManager.get({tag:this.parentWallMemberTag}), [this.parentWallMemberTag], [this.outerWall.handle]);
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
		for (var i=0; i<guideNodes.length; i++) {//OY - MAKE SURE YOU MEAN guideNodes[i].prev FOR THE OUTER WALL
			this.assignWallHandler(innerWall, guideNodes[i].innerWallIdx, outerWall, guideNodes[i].outerWallIdx, guideNodes[i], guideNodes[i].next, cellMemberTag, parentWallMemberTag);
			this.assignWallHandler(outerWall, guideNodes[i].outerWallIdx, innerWall, guideNodes[i].innerWallIdx, guideNodes[i].next, guideNodes[i], parentWallMemberTag, cellMemberTag);
		}
	},
	assignWallHandler: function(self, selfIdx, opposite, oppositeIdx, nodeA, nodeB, selfTag, oppositeTag) {
		var reflect = WallMethods.collideMethods.reflect;
		var hitFunc = function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
			
			if (dot.tag == selfTag) {
				
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
				
				var vLineDot_I = perpV + vWallToDot_I;
				
				var vWallTrans_I = -.5 * (vNodeAPerp_I + vNodeBPerp_I);
				
				var vNodeARel_I = vNodeAPerp_I + vWallTrans_I;
				var vNodeBRel_I = vNodeBPerp_I + vWallTrans_I;
				
				var IWall = nodeA.m * centerNodeANodeB.distSqrTo(nodeA.pos) + nodeB.m * centerNodeANodeB.distSqrTo(nodeB.pos);
				var distCenterP = centerNodeANodeB.VTo(P(dot.x, dot.y)).dotProd(wallUV);
				
				var j = -2 * vLineDot_I / (1/dot.m + 1/(nodeA.m + nodeB.m) + distCenterP * distCenterP / IWall);
				
				dot.v.dx -= perpUV.dx * j / dot.m;
				dot.v.dy -= perpUV.dy * j / dot.m;
				
				// var omegaA_I = vNodeARel_I / (.5 * distNodeANodeB);
				// var omegaA_F = omegaA_I - distCenterP * j / IWall;
				// var vNodeARel_F = omegaA_F * .5 * distNodeANodeB;
				//inlined above three lines into one below
				var vNodeARel_F = (vNodeARel_I / (.5 * distNodeANodeB) - distCenterP * j / IWall) * .5 * distNodeANodeB;
				
				var vNodeBRel_F = -vNodeARel_F;
				vWallTrans_F = vWallTrans_I - j / (nodeA.m + nodeB.m);
				
				var vNodeA_F = -(vWallTrans_F - vNodeARel_F);
				var vNodeB_F = -(vWallTrans_F - vNodeBRel_F);
				

				nodeA.v.dx += perpUV.dx * vNodeA_F;
				nodeA.v.dy += perpUV.dy * vNodeA_F;
				nodeB.v.dx += perpUV.dx * vNodeB_F;
				nodeB.v.dy += perpUV.dy * vNodeB_F;
				
				dot.x += perpUV.dx;
				dot.y += perpUV.dy;
				
			} else if (dot.tag == oppositeTag) {
				var handler = opposite.handlers[oppositeIdx];
				handler.func.apply(handler.obj, [dot, opposite, oppositeIdx, opposite.wallUVs[oppositeIdx], -dot.v.dotProd(opposite.wallPerpUVs[oppositeIdx]), opposite.wallPerpUVs[oppositeIdx]]);
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
	addDots: function(center, innerWall, toAdd, temp, elemId, tagAndReturnTo) {
		for (var spcName in toAdd) {
			var spc = window.spcs[spcName];
			if (!spc) console.log('Bad species name sent to cell: ' + spcName);
			var spcDots = [];
			var numToAdd = toAdd[spcName];
			var numPerRightTriangle = Math.floor(toAdd[spcName] / (2 * innerWall.length));
			for (var ptIdx=0; ptIdx<innerWall.length - 1; ptIdx++) {
				var a = innerWall[ptIdx];
				var b = innerWall[ptIdx + 1];
				var bisector = center.VTo(a).add(center.VTo(b)).UV();
				
				this.populateRightTriangle(center, a, a.avg(b), numPerRightTriangle, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
				this.populateRightTriangle(center, b, a.avg(b), numPerRightTriangle, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
				numToAdd -= 2 * numPerRightTriangle;
				
			}
			this.populateRightTriangle(center, a, a.avg(b), numToAdd, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
			
		}
	},
	populateRightTriangle: function(center, a, rightAnglePt, count, spc, temp, flatUV, tagAndReturnTo, elemId, spcName) {
		var perpUV = flatUV.copy().perp('cw');
		if (rightAnglePt.VTo(a).dotProd(perpUV) < 0) {
			perpUV = flatUV.copy().perp('ccw');
		}
		var dots = [];
		var UV = center.UVTo(rightAnglePt);
		var yMax = rightAnglePt.distTo(a);
		var xLen = center.distTo(rightAnglePt);
		for (var i=0; i<count; i++) {
			var xVal = Math.sqrt(Math.random()) * xLen; //weighting towards outside
			var yVal = Math.random() * yMax * xVal / xLen;
			var dotX = center.x + UV.dx * xVal;
			var dotY = center.y + perpUV.dy * yVal;
			var dir = V(Math.random(), Math.random()).UV();
			dots.push(new Dot(dotX, dotY, dir, spcName, tagAndReturnTo, elemId, tagAndReturnTo));
			dots[dots.length - 1].setTemp(temp); 
		}
		window.dotManager.add(dots);
		
		
		
	},
	expelForeignDots: function(center, outerWall, cellDotTag, dots) {
		var perpUVPairs = [];
		var zeroPerpDir, onePerpDir;
		var centerA = center.VTo(outerWall[0]);
		var centerB = center.VTo(outerWall[1]);
		
		var perpACW = centerA.perp('cw');
		var perpBCCW = centerB.perp('ccw');
		//is that even right?
		if (Math.abs(Math.atan2(perpACW.dy, perpACW.dx) - Math.atan2(perpBCCW.dy, perpBCCW.dx)) < Math.PI) {
			zeroPerpDir = 'cw';
			onePerpDiR = 'ccw';
		} else {
			zeroPerpDir = 'ccw';
			onePerpDiR = 'cw';
		}
		
		for (var i=0; i<outerWall.length - 1; i++) {
			perpUVPairs.push([center.VTo(outerWall[i]).UV().perp(zeroPerpDir), center.VTo(outerWall[i + 1]).UV().perp(onePerpDir)]);
		}
		
		for (var i=0; i<dots.length; i++) {
			this.checkExpelDot(dots[i], outerWall, perpUVPairs);
		}
		
	},
	checkExpelDot: function(dot, outerWall, perpUVPairs) {
		for (var i=0; i<perpUVPairs; i++) {
			var dotPos = new Point(dot.x, dot.y);
			if (outerWall[i].VTo(dotPos).dotProd(perpUVPairs[i][0]) > 0 && outerWall[i + 1].VTo(dotPos).dotProd(perpUvPairs[i][1]) > 0) {
				
			}
		}
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

