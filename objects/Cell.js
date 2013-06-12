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
	this.nodeMass = attrs.nodeMass || 700;
	var initRadius = attrs.rad;
	this.canvasHandle = attrs.canvasHandle || 'main';
	var center = initPos.copy().movePt(V(initRadius, initRadius));
	var numCorners = Math.max(3, attrs.numCorners) || 8;
	this.membraneColor = attrs.col;
	this.sideLenMin = 15;
	this.energyTransferMax = .5;
	this.guideNodes = this.makeGuideNodes(initPos, initRadius, numCorners, this.nodeMass);
	var outerWallPts = this.makeOuterWallPts(this.guideNodes, thickness);
	var innerWallPts = this.makeInnerWallPts(this.guideNodes, thickness);
	this.outerWall = walls.addWall({pts: outerWallPts, handle: 'cell' + this.handle.toCapitalCamelCase() + 'Outer', handler: 'staticAdiabatic', show: false, record: false, col: Col(255, 255, 255)});
	this.innerWall = walls.addWall({pts: innerWallPts, handle: 'cell' + this.handle.toCapitalCamelCase() + 'Inner', handler: 'staticAdiabatic', show: false, record: true, col: Col(255, 255, 255)});
	this.innerWall.hitThreshold = -10;
	this.outerWall.hitThreshold = -10;
	this.parentWallMemberTag = attrs.parentWallHandle;
	this.cellMemberTag = this.innerWall.handle;
	var innerChanceTransport = attrs.innerChanceTransport || {};
	var outerChanceTransport = attrs.outerChanceTransport || {};
	this.fillInUnspecdSpcs(innerChanceTransport);
	this.fillInUnspecdSpcs(outerChanceTransport);
	this.assignWallHandlers(this.guideNodes, this.innerWall, this.outerWall, this.parentWallMemberTag, this.cellMemberTag, this.energyTransferMax, innerChanceTransport, outerChanceTransport, thickness);
	this.wallUpdateListenerName = this.addWallUpdateListener(this.guideNodes, this.innerWall, this.outerWall, this.handle, thickness, this.sideLenMin, attrs.boundingCorner, attrs.boundingVector, this.wallColor);
	this.drawListenerName = this.addDrawListener(this.guideNodes, this.innerWall, this.outerWall, this.membraneColor, this.canvasHandle);
	this.dotId = timeline.takeNumber();
	this.addDots(center, this.innerWall, attrs.dots || {}, attrs.temp, this.dotId, this.cellMemberTag);
	this.energyToTransfer = 0;
	this.energyBank = 0;
	this.energyBankMax = 20;
	//transfer heat out => val > 0
	this.calcHeatTransferListenerName = 'calcHeatTrans' + this.handle;
	this.setupCalcHeatTransfer(this.calcHeatTransferListenerName, this.innerWall, walls[attrs.parentWallHandle]);
	window.dotMigrator.migrateDots(window.dotManager.get({tag:this.parentWallMemberTag}), [this.parentWallMemberTag], [this.outerWall.handle]);
	this.setupStd();
}

_.extend(Cell.prototype, objectFuncs, {
	makeGuideNodes: function(pos, radius, numCorners, nodeMass) {
		center = pos.copy().movePt(V(radius, radius));
		var guideNodes = [];
		var angle = 0;
		var nativeAngle = Math.PI * (numCorners - 2) / numCorners;
		var anglePerStep = 2 * Math.PI / numCorners;
		for (var i=0; i<numCorners; i++) {
			var nodePos = P(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
			guideNodes.push(new Cell.GuideNode(nodePos, nodeMass, nativeAngle));
			angle += anglePerStep;
		}
		for (var i=0; i<guideNodes.length; i++) {
			guideNodes[i].prev = i == 0 ? guideNodes[guideNodes.length - 1] : guideNodes[i - 1];
			guideNodes[i].next = i == guideNodes.length - 1 ? guideNodes[0] : guideNodes[i + 1];
		}
		return guideNodes;
	},
	fillInUnspecdSpcs: function(chanceTransport) {
		//this is so we're type-safe.  JIT compilers throw away machine code if there's a type change 
		for (var i=0; i<LevelData.spcDefs.length; i++) {
			var spcName = LevelData.spcDefs[i].spcName;
			if (chanceTransport[spcName] === undefined) {
				chanceTransport[spcName] = 0;
			}
		}
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
		while (wallPtIdx < guideNodes.length) {
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
	assignWallHandlers: function(guideNodes, innerWall, outerWall, parentWallMemberTag, cellMemberTag, energyTransferMax, innerChanceTransport, outerChanceTransport, membraneThickness) {
		for (var i=0; i<guideNodes.length; i++) {//OY - MAKE SURE YOU MEAN guideNodes[i].prev FOR THE OUTER WALL
			this.assignWallHandler(innerWall, guideNodes[i].innerWallIdx, outerWall, guideNodes[i].outerWallIdx, guideNodes[i], guideNodes[i].next, cellMemberTag, parentWallMemberTag, -1, energyTransferMax, innerChanceTransport, membraneThickness);
			this.assignWallHandler(outerWall, guideNodes[i].outerWallIdx, innerWall, guideNodes[i].innerWallIdx, guideNodes[i].next, guideNodes[i], parentWallMemberTag, cellMemberTag, 1, energyTransferMax, outerChanceTransport, membraneThickness);
		}
	},
	assignWallHandler: function(self, selfIdx, opposite, oppositeIdx, nodeA, nodeB, selfTag, oppositeTag, energyTransferSign, energyTransferMax, chanceTransport, membraneThickness) {
		var reflect = WallMethods.collideMethods.reflect;
		var hitFunc = function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
			
			if (dot.tag == selfTag) {
				if (Math.random() < chanceTransport[dot.spcName]) {
				//if (3 * activeEs[dot.spcName] < Math.abs(perpV) * perpV * dot.m * dot.cvKinetic * dot.tConst) { //3 is 1.5 / .5.  1.5 is from 2d->3d, .5 is just from KE eqn
					this.transferDot(dot, oppositeTag, perpUV, membraneThickness);
				} else {
					var distNodeANodeB = wallUV.dx * (nodeB.pos.x - nodeA.pos.x) + wallUV.dy * (nodeB.pos.y - nodeA.pos.y);//nodeA.pos.VTo(nodeB.pos).dotProd(wallUV);
					var distNodeADot = wallUV.dx * (dot.x - nodeA.pos.x) + wallUV.dy * (dot.y - nodeA.pos.y);//nodeA.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
					var distNodeBDot = -wallUV.dx * (dot.x - nodeB.pos.x) - wallUV.dy * (dot.y - nodeB.pos.y);//-nodeB.pos.VTo(P(dot.x, dot.y)).dotProd(wallUV);
					
					var centerNodeANodeB = new Point(nodeA.pos.x + wallUV.dx * distNodeANodeB * .5, nodeA.pos.y + wallUV.dy * distNodeANodeB * .5);//nodeA.pos.copy().movePt(wallUV.copy().mult(distNodeANodeB * .5));
					
					var fracA = distNodeADot / distNodeANodeB;
					var fracB = distNodeBDot / distNodeANodeB;
					
					vecNodeAPerp = perpUV.copy().mult(nodeA.v.dotProd(perpUV));
					vecNodeBPerp = perpUV.copy().mult(nodeB.v.dotProd(perpUV));
					
					nodeA.v.dx -= vecNodeAPerp.dx;
					nodeA.v.dy -= vecNodeAPerp.dy;
					nodeB.v.dx -= vecNodeBPerp.dx;
					nodeB.v.dy -= vecNodeBPerp.dy;				
					
					var vNodeAPerp_I = vecNodeAPerp.dx * perpUV.dx + vecNodeAPerp.dy * perpUV.dy;//vecNodeAPerp.dotProd(perpUV);
					var vNodeBPerp_I = vecNodeBPerp.dx * perpUV.dx + vecNodeBPerp.dy * perpUV.dy;//vecNodeBPerp.dotProd(perpUV);
					
					//var vWallToDot_I = (1 - fracA) * vNodeAPerp_I + (1 - fracB) * vNodeBPerp_I;
					//vWallToDot inlined
					var vLineDot_I = perpV + (1 - fracA) * vNodeAPerp_I + (1 - fracB) * vNodeBPerp_I;
					
					var vWallTrans_I = -.5 * (vNodeAPerp_I + vNodeBPerp_I);
					
					var vNodeARel_I = vNodeAPerp_I + vWallTrans_I;
					var vNodeBRel_I = vNodeBPerp_I + vWallTrans_I;
					
					var IWall = nodeA.m * centerNodeANodeB.distSqrTo(nodeA.pos) + nodeB.m * centerNodeANodeB.distSqrTo(nodeB.pos);
					//centerNodeANodeB.VTo(P(dot.x, dot.y)).dotProd(wallUV); inlined
					var distCenterP = wallUV.dx * (dot.x - centerNodeANodeB.x) + wallUV.dy * (dot.y - centerNodeANodeB.y)
					
					var j = -2 * vLineDot_I / (1 / dot.m + 1 / (nodeA.m + nodeB.m) + distCenterP * distCenterP / IWall);
					
					dot.v.dx -= perpUV.dx * j / dot.m;
					dot.v.dy -= perpUV.dy * j / dot.m;
					
					// var omegaA_I = vNodeARel_I / (.5 * distNodeANodeB);
					// var omegaA_F = omegaA_I - distCenterP * j / IWall;
					// var vNodeARel_F = omegaA_F * .5 * distNodeANodeB;
					//inlined above three lines into one below
					var vNodeARel_F = (vNodeARel_I / (.5 * distNodeANodeB) - distCenterP * j / IWall) * .5 * distNodeANodeB;
					
					//var vNodeBRel_F = -vNodeARel_F;
					vWallTrans_F = vWallTrans_I - j / (nodeA.m + nodeB.m);
					
					var vNodeA_F = -(vWallTrans_F - vNodeARel_F);
					var vNodeB_F = -(vWallTrans_F + vNodeARel_F);
					

					nodeA.v.dx += perpUV.dx * vNodeA_F;
					nodeA.v.dy += perpUV.dy * vNodeA_F;
					nodeB.v.dx += perpUV.dx * vNodeB_F;
					nodeB.v.dy += perpUV.dy * vNodeB_F;
					
					dot.x += perpUV.dx;
					dot.y += perpUV.dy;
					//now doing eneregy transfer stuff.  all in one big function because this needs to be fast.  sorry.
					
					var energyToTransfer = energyTransferSign * this.energyToTransfer;
					if (energyToTransfer > 0) {
						var energyAdded = Math.min(energyToTransfer, Math.min(this.energyBank, energyTransferMax))
						dot.addEnergy(energyAdded);
						this.energyBank -= energyAdded;
						this.energyToTransfer -= energyAdded * energyTransferSign;
					} else {
						var energyRemoved = Math.min(this.energyBank - energyToTransfer, Math.min(this.energyBankMax - this.energyBank, Math.min(energyTransferMax, Math.max(0, (dot.temp() - 10) * dot.cv))));
						dot.addEnergy(-energyRemoved);
						this.energyBank += energyRemoved;
					}
				}
				
			} else if (dot.tag == oppositeTag) {
				var handler = opposite.handlers[oppositeIdx];
				handler.func.apply(handler.obj, [dot, opposite, oppositeIdx, opposite.wallUVs[oppositeIdx], -dot.v.dotProd(opposite.wallPerpUVs[oppositeIdx]), opposite.wallPerpUVs[oppositeIdx]]);
			}
		}
		walls.setSubWallHandler(self.handle, selfIdx, {func: hitFunc, obj: this});
	},
	transferDot: function(dot, targetWallHandle, perpUV, membraneThickness) {
		var dist = 2 * dot.r + membraneThickness;
		dot.x -= dist * perpUV.dx;
		dot.y -= dist * perpUV.dy;
		dotManager.changeDotWall(dot, targetWallHandle);
	},
	addWallUpdateListener: function(nodes, innerWall, outerWall, handle, thickness, sideLenMin, boundingCorner, boundingVector) {
		var xMin = boundingCorner.x;
		var xMax = boundingCorner.x + boundingVector.dx;
		var yMin = boundingCorner.y;
		var yMax = boundingCorner.y + boundingVector.dy;
		
		addListener(curLevel, 'wallMove', 'moveCell' + this.handle.toCapitalCamelCase(), function() {
			var innerWallPtIdx = 0;
			var outerWallPtIdx = outerWall.length - 2;
			
			for (var i=0; i<nodes.length; i++) {
				nodes[i].pos.x += nodes[i].v.dx;
				nodes[i].pos.y += nodes[i].v.dy;
				nodes[i].v.dx *= .995;
				nodes[i].v.dy *= .995;
				
				if (outerWall[nodes[i].prev.outerWallIdx].x < xMin) {
					nodes[i].pos.x += 2;
					nodes[i].v.dx = Math.abs(nodes[i].v.dx);
					for (var j=0; j<nodes.length; j++) {
						nodes[j].v.dx += .5;
					}
				} else if (outerWall[nodes[i].prev.outerWallIdx].x > xMax) {
					nodes[i].pos.x -= 2;
					nodes[i].v.dx = -Math.abs(nodes[i].v.dx);
					for (var j=0; j<nodes.length; j++) {
						nodes[j].v.dx -= .5;
					}
				}
				if (outerWall[nodes[i].prev.outerWallIdx].y < yMin) {
					nodes[i].pos.y += 2;
					nodes[i].v.dy = Math.abs(nodes[i].v.dy);
					for (var j=0; j<nodes.length; j++) {
						nodes[j].v.dy += .5;
					}
				} else if (outerWall[nodes[i].prev.outerWallIdx].y > yMax) {
					nodes[i].pos.y -= 2;
					nodes[i].v.dy = -Math.abs(nodes[i].v.dy);
					for (var j=0; j<nodes.length; j++) {
						nodes[j].v.dy -= .5;
					}
				}
			}
			for (var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				var perpFromPrev = node.prev.pos.UVTo(node.pos).perp('cw');
				var perpFromNext = node.next.pos.UVTo(node.pos).perp('ccw')
				var UVPointingOut = perpFromPrev.add(perpFromNext).UV();
				this.addAngleForce(node, node.prev, node.next, new Vector(-UVPointingOut.dx, -UVPointingOut.dy));
				this.addExpansionForce(node, node.next, sideLenMin);
				
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
		}, this)
	},
	addAngleForce: function(node, prev, next, UVPointingIn) {
		var angle = this.angleBetweenPts(node.pos, prev.pos, next.pos, UVPointingIn);
		node.v.dx -= 3 * UVPointingIn.dx * (angle - node.nativeAngle)
		node.v.dy -= 3 * UVPointingIn.dy * (angle - node.nativeAngle) 
	},
	addExpansionForce: function(a, b, sideLenMin) {
		var vec = a.pos.VTo(b.pos);
		var magSqr = vec.magSqr();
		if (magSqr < sideLenMin * sideLenMin) {
			var UV = vec.UV();
			b.v.dx += UV.dx * .2;
			b.v.dy += UV.dy * .2;
			
			a.v.dx -= UV.dx * .2;
			a.v.dy -= UV.dy * .2;
		}
	},
	angleBetweenPts: function(corner, a, b, UVPointingIn){
		var anglePointingIn = Math.atan2(UVPointingIn.dy, UVPointingIn.dx);
		var cornerA = corner.VTo(a);
		var cornerB = corner.VTo(b);
		var angleA = Math.atan2(cornerA.dy, cornerA.dx);
		var angleB = Math.atan2(cornerB.dy, cornerB.dx);
		
		return this.distBetweenAngles(angleA, anglePointingIn) + this.distBetweenAngles(anglePointingIn, angleB);
	},
	distBetweenAngles: function(a, b){
		if (a<0) a+=Math.PI*2;
		if (b<0) b+=Math.PI*2;
		var diff = Math.max(a, b) - Math.min(a, b);
		if (diff>Math.PI) {
			return 2*Math.PI - diff;
		} else {
			return diff;
		}
		
	},
	addDrawListener: function(nodes, innerWall, outerWall, membraneColor, canvasHandle) {
		canvasManager.addListener(canvasHandle, 'drawCell' + this.handle, function(ctx) {
			for (var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				var pts = [innerWall[node.innerWallIdx], innerWall[node.next.innerWallIdx], outerWall[node.outerWallIdx], outerWall[node.prev.outerWallIdx]];
				draw.fillPts(pts, membraneColor, ctx);
			}
		}, this, 1);
	},
	setupCalcHeatTransfer: function(listenerName, innerWall, parentWall) {
		var tempInner = innerWall.getDataSrc('temp');
		var tempParent = parentWall.getDataSrc('temp');
		
		addListener(curLevel, 'update', listenerName, function() {
			var CpInner = innerWall.Cp();
			var CpParent = parentWall.Cp();
			var tempEquil = (CpInner * tempInner[tempInner.length - 1] + CpParent * tempParent[tempParent.length - 1]) / (CpInner + CpParent);
			this.energyToTransfer = (tempEquil - tempParent[tempParent.length - 1]) * CpParent;
		}, this);
		
	},
	addDots: function(center, innerWall, toAdd, temp, elemId, tagAndReturnTo) {
		for (var spcName in toAdd) {
			var spc = window.spcs[spcName];
			if (!spc) console.log('Bad species name sent to cell: ' + spcName);
			var spcDots = [];
			var numToAdd = toAdd[spcName];
			var numPerRightTriangle = Math.floor(toAdd[spcName] / (2 * (innerWall.length - 1)));
			for (var ptIdx=0; ptIdx<innerWall.length - 1; ptIdx++) {
				var a = innerWall[ptIdx];
				var b = innerWall[ptIdx + 1];
				var bisector = center.VTo(a.avg(b)).UV();
				
				this.populateRightTriangle(center, a, a.avg(b), numPerRightTriangle, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
				this.populateRightTriangle(center, b, a.avg(b), numPerRightTriangle, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
				numToAdd -= 2 * numPerRightTriangle;
				
			}
			this.populateRightTriangle(center, a, a.avg(b), numToAdd, spc, temp, bisector, tagAndReturnTo, elemId, spcName);
			
		}
	},
	populateRightTriangle: function(center, a, rightAnglePt, count, spc, temp, flatUV, tagAndReturnTo, elemId, spcName) {
		var perpUV = flatUV.copy().perp('cw');; 
		if (rightAnglePt.VTo(a).dotProd(perpUV) < 0) {
			perpUV = flatUV.copy().perp('ccw');
		} 
		var dots = [];
		var yMax = rightAnglePt.distTo(a);
		var xLen = center.distTo(rightAnglePt);
		for (var i=0; i<count; i++) {
			var xVal = Math.sqrt(Math.random()) * xLen; //weighting towards outside
			var yVal = Math.random() * yMax * xVal / xLen;
			var dotX = center.x + flatUV.dx * xVal + perpUV.dx * yVal;
			var dotY = center.y + flatUV.dy * xVal + perpUV.dy * yVal;
			var dir = V(Math.random() - .5, Math.random() - .5).UV();
			dots.push(new Dot(dotX, dotY, dir, spcName, tagAndReturnTo, elemId, tagAndReturnTo));
			dots[dots.length - 1].setTemp(temp); 
		}
		window.dotManager.add(dots);
		
		
		
	},
	remove: function() {
		walls.removeWall(this.innerWall.handle);
		walls.removeWall(this.outerWall.handle);
		dotManager.removeByAttr('elemId', this.dotId);
		removeListener(curLevel, 'update',  'moveCell' + this.handle.toCapitalCamelCase());
		canvasManager.removeListener(this.canvasHandle, 'drawCell' + this.handle);
	},


});

Cell.GuideNode = function(pos, mass, nativeAngle) {
	this.pos = pos;
	this.next = undefined;
	this.prev = undefined;
	this.v = V(0, 0);
	this.m = mass;
	this.innerWallIdx = undefined;
	this.outerWallIdx = undefined;
	this.nativeAngle = nativeAngle;
}

Cell.GuideNode.prototype = {

}

