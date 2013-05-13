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

function WallHandler(attrs){
	//a trap!  If you make it isothermal, you must specify a temperature to hold at in temps list
	if (attrs) {
		var newWall = new Array(attrs.pts.length);
	} else {
		var newWall = new Array();
	}
	_.extend(newWall, WallMethods.main, WallMethods.collideMethods);
	newWall.defaultCol = Col(255, 255, 255);
	if (attrs) {
		newWall.assemble(attrs);//pts, handles, bounds, includes, vols, shows, records)
		if (attrs.handles.length!=attrs.pts.length) {
			console.log('NAME YOUR WALLS');
		}
		if (attrs.handlers) {
			newWall.doInitHandlers(attrs.handlers);
		}
	}
	newWall.setup();
	return newWall;
};
WallMethods = {}

//////////////////////////////////////////////////////////////////////////
//MAIN
//////////////////////////////////////////////////////////////////////////	
WallMethods.main = {

	assemble: function(attrs){//pts, handles, bounds, vols, shows, records){
		this.removed = false;
		var pts = attrs.pts;
		var handles = attrs.handles;

					
		this.numWalls = pts.length;
		this.qArrowFill = Col(200, 0, 0);
		this.qArrowFillFinal = Col(100, 0, 0);
		this.qArrowStroke = Col(255, 255, 255);
		var bounds = defaultTo([], attrs.bounds);
		var vols = defaultTo([], attrs.vols);
		var shows = defaultTo([], attrs.shows);
		var records = defaultTo([], attrs.records);
		var tSets = defaultTo([], attrs.temps);
		for (var wallIdx=0; wallIdx<pts.length; wallIdx++){
			this.setWallVals(wallIdx, pts[wallIdx], handles[wallIdx], bounds[wallIdx], vols[wallIdx], shows[wallIdx], records[wallIdx], tSets[wallIdx]);

		}
		

	},
	setDefaultReadout: function(readout){
		this.defaultReadout = readout;
		return this;
	},
	unsetDefaultReadout: function(){
		this.defaultReadout = undefined;
		return this;
	},

	setup: function(){
		this.gridDim=20;
		this.xSpan = Math.floor(myCanvas.width/this.gridDim);
		this.ySpan = Math.floor(myCanvas.height/this.gridDim);
		this.numCols = Math.ceil(myCanvas.width/this.gridDim);
		this.numRows = Math.ceil(myCanvas.height/this.gridDim);
		for (var wallIdx=0; wallIdx<this.length; wallIdx++){
			this.setupWall(wallIdx);
		}
		
	},

	setAllHandler: function(handler){
		for(var wallIdx=0; wallIdx<this.length; wallIdx++){
			this.setWallHandler(wallIdx, handler);
		}
	},
	pareData: function() {
		for (var i=0; i<this.length; i++) {
			this[i].pareData();
		}
	},
	setWallHandler: function(wallInfo, handler){
		var wallIdx = this.idxByInfo(wallInfo);
		if (/isothermal/i.test(handler)) {
			this[wallIdx].isothermalInit()
		}
		for (var subWallIdx=0; subWallIdx<this[wallIdx].length; subWallIdx++){
			var subWall = this[wallIdx][subWallIdx];
			if (typeof handler == 'string') {
				this[wallIdx].handlers[subWallIdx] = {obj: this, func: this[handler]};
			} else if (typeof handler == 'object') {
				this[wallIdx].handlers[subWallIdx] = handler;
			}
			//this.setSubWallHandler(wallIdx, subWallIdx, handler);
		}
	},		
	setSubWallHandler: function(wallInfo, subWallIdx, handler) {
		var wallIdx = this.idxByInfo(wallInfo);
		if (typeof handler == 'string') {
			this[wallIdx][subWallIdx].isothermal = /isothermal/i.test(handler); 
			
			this[wallIdx].handlers[subWallIdx] = {obj: this, func: this[handler]};
		} else if (typeof handler == 'object') {
			this[wallIdx].handlers[subWallIdx] = handler;
		}		
	},
	getSubWallHandler: function(wallInfo, subWallIdx) {
		var wallIdx = this.idxByInfo(wallInfo);
		return this[wallIdx + '-' + subWallIdx];
	},
	setupWall: function(wallIdx){
		this[wallIdx].wallUVs = this.getWallUV(wallIdx);
		this[wallIdx].wallPerpUVs= this.getPerpUVs(wallIdx);// perp UVs point in
		this[wallIdx].wallGrids = this.scatterPts(wallIdx);
	},
	scatterPts: function(wallIdx){
		var grid = this.makeBlankGrid();
		var wall = this[wallIdx];
		wall.scatter = new Array(wall.length-1);
		var UVs = wall.wallUVs;
		var gridDim = this.gridDim;
		for (var wallIdx=0; wallIdx<wall.scatter.length; wallIdx++){
			var UV = UVs[wallIdx];
			var dist = wall[wallIdx].distTo(wall[wallIdx+1]);
			var numScatters = Math.ceil(dist/gridDim);
			var wallScatters = new Array(numScatters);
			var ptInit = wall[wallIdx];
			var gridXLast = -1;
			var gridYLast = -1;
			for (var ptIdx=0; ptIdx<numScatters; ptIdx++) {
				var newX = ptInit.x + UV.dx*gridDim*ptIdx;
				var newY = ptInit.y + UV.dy*gridDim*ptIdx;
				var gridX = Math.floor(newX/gridDim);
				var gridY = Math.floor(newY/gridDim);
				if (gridX!=gridXLast || gridY!=gridYLast) {
					grid[gridX][gridY].push(wallIdx);
				}
			}
		}
		return grid;
	},
	makeBlankGrid: function(){
		var wallGrid = new Array(this.numCols+1);
		for (var x=0; x<this.numCols+1; x++){ 
			var column = new Array(this.numRows+1);
			for (var y=0; y<this.numRows+1; y++){
				column[y] = [];
			}
			wallGrid[x] = (column);
		}
		return wallGrid;
	},
	setWallVals: function(wallIdx, pts, handle, bounds, vol, show, record, tSet, col, dotMgr, close, isothermalRate){
		bounds = {min: P(0, bounds && bounds.yMin ? bounds.yMin : 30), max: P(0, bounds && bounds.yMax ? bounds.yMax : 435)};
		this[wallIdx] = pts;
		_.extend(this[wallIdx], WallMethods.wall, WallMethods.wallDataHandler);	
		this[wallIdx].handle = handle;
		this[wallIdx].hitMode = 'Std';
		this[wallIdx].vs = this.makeWallVs(pts);
		this[wallIdx].bounds = bounds;
		this[wallIdx].dotManager = dotMgr || dotManager; //global gas dot manager
		if (vol) {
			this[wallIdx].setVol(vol);
		}
		this[wallIdx].col = defaultTo(this.defaultCol, col);
		this[wallIdx].show = defaultTo(true, show);
		if (close !== false) {
			this.closeWall(this[wallIdx]);
		}
		this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
		this[wallIdx].g = g;
		this[wallIdx].pConst = pConst;
		this[wallIdx].liquids = {};
		this[wallIdx].data = {};
		this[wallIdx].q = 0;
		this[wallIdx].handlers = [];
		this[wallIdx].pIntLen = 35;
		this[wallIdx].surfAreaAdj = {};
		this[wallIdx].eToAdd = 0;
		this[wallIdx].isothermal = false;
		this[wallIdx].removed = false;
		this[wallIdx].tSet = tSet;
		this[wallIdx].massChunks = {};
		this[wallIdx].forceInternal = 0;
		this[wallIdx].pLastRecord = turn;
		this[wallIdx].isothermalRate = defaultTo(1, isothermalRate);
		this[wallIdx].boundMaxHandlers = [];
		this[wallIdx].boundMinHandlers = [];
		this[wallIdx].mass = 0;
		this[wallIdx].Cp = this[wallIdx].setupCp();
		this[wallIdx].parent = this;
		makeListenerHolder(this[wallIdx], 'cleanUp');
		this[handle] = this[wallIdx];
		record = defaultTo(true, record);
		if (record) {	
			this[wallIdx].recordDefaults();
		}
	},

	addWall: function(attrs){
		this.numWalls++;
		var newIdx = this.length;
		this.setWallVals(newIdx, attrs.pts, attrs.handle, attrs.bounds, attrs.vol, attrs.show, attrs.record, attrs.temp, attrs.col, attrs.dotManager, attrs.close, attrs.isothermalRate);
		this.setupWall(newIdx);
		this.setWallHandler(newIdx, attrs.handler);
		if (attrs.border) this[newIdx].addBorder(attrs.border);
		if (attrs.hitMode) this[newIdx].setHitMode(attrs.hitMode);
		return this[newIdx];
		
	},
	makeWallVs: function(pts) {
		var vs = [];
		for (var i=0; i<pts.length; i++) {
			vs.push(V(0, 0));
		}
		vs.push(vs[0]);
		return vs;
	},
	setPtsInit: function(){
		for (var wallIdx=0; wallIdx<this.length; wallIdx++){
			this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
		}
	},
	copyWallPts: function(wall){
		var len = wall.length;
		var copy = new Array(len);
		for (var ptIdx=0; ptIdx<len; ptIdx++){
			copy[ptIdx] = wall[ptIdx].copy();
		}
		return copy;
	},
	idxByHandle: function(handle){
		
		for (var idx=0; idx<this.length; idx++){
			if (handle==this[idx].handle) {
				return idx;
			}
		}
		console.log('Failed to get wall idx by handle\nHandle:'+handle);
		
	},
	idxByInfo: function(info){
		var wallIdx;
		if (parseFloat(info)!=info) {
			return this.idxByHandle(info)
		} else {
			return info;
		}
	},
	remove: function(){
		for(var wallIdx=this.length-1; wallIdx>=0; wallIdx-=1){
			this.removeWall(wallIdx);
		}
		//Hey - if I want to remove just one wall when multiple are present, will need to remove wallMove by wall, but I don't think that case will happen
		this.removed = true;
		emptyListener(curLevel, 'wallMove');
	},
	removeWall: function(wallInfo){
		if (this[wallInfo]) {
			this.numWalls-=1;
			this[wallInfo].recordAllStop();
			this[wallInfo].cleanUp();
			this[wallInfo].removeBorder();
			this[wallInfo].removed = true;
			var wallIdx = this.idxByInfo(wallInfo);
			this[this[wallIdx].handle] = undefined;
			this.splice(wallIdx, 1);
			this.removeHandlers(wallIdx);
		}
	},
	removeHandlers: function(wallIdx){
		for (var itemName in this){
			if(itemName.indexOf(wallIdx + '-') != -1){
				this[itemName] = undefined;
			}
		}
	},
	closeWall: function(wall){
		wall.push(P(wall[0].x, wall[0].y))
	},
	getPerpUVs: function(wallIdx){
		var wallUVSet = this[wallIdx].wallUVs;
		var perpUVs = new Array(wallUVSet.length);
		for (var wallUVIdx=0; wallUVIdx<wallUVSet.length; wallUVIdx++){
			var wallUV = wallUVSet[wallUVIdx];
			perpUVs[wallUVIdx] = V(-wallUV.dy, wallUV.dx);//rotating clockwise 
		}
		return perpUVs;
	},
	getWallUV: function(wallIdx){
		var numUVs = this[wallIdx].length-1
		var wallUVs = new Array(numUVs);
		for (var ptIdx=0; ptIdx<numUVs; ptIdx++){
			var ptA = this[wallIdx][ptIdx];
			var ptB = this[wallIdx][ptIdx+1];
			wallUVs[ptIdx] = V(ptB.x-ptA.x, ptB.y-ptA.y).UV();
		}
		return wallUVs;
	},
	check: function(){
		var gridDim = this.gridDim;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		var dots = dotManager.lists.ALLDOTS; //global gas dot manager
	
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++){
			var dot = dots[dotIdx];
			var checkedWallIdxs = [];
			var checkedSubWallIdxs = [];
			var gridX = Math.floor(dot.x/gridDim);
			var gridY = Math.floor(dot.y/gridDim);
			gridLoop:
				for (var x=Math.max(gridX-1, 0), xCeil=Math.min(gridX+1, xSpan)+1; x<xCeil; x++){
					for (var y=Math.max(gridY-1, 0), yCeil=Math.min(gridY+1, ySpan)+1; y<yCeil; y++){
						
						for (var wallIdx=0; wallIdx<this.length; wallIdx++){
							var gridSquare = this[wallIdx].wallGrids[x][y];
							
							for (var lineIdx=0; lineIdx<gridSquare.length; lineIdx++){
								var line = gridSquare[lineIdx];
								if (this.haveChecked(wallIdx, line, checkedWallIdxs, checkedSubWallIdxs)===false){
									//add if hit, break out of this dot's loops
									if (this.checkWallHit(dot, this[wallIdx], this[wallIdx][line], line) === true) break gridLoop;
									checkedWallIdxs.push(wallIdx);
									checkedSubWallIdxs.push(line);
								}
							}
						}
					}
				}
		}
		
	},
	checkWallHit: function(dot, wall, wallPt, wallPtIdx){
		//doing all this new Point and Vector business to take out one function call
		var wallUV = wall.wallUVs[wallPtIdx];
		var perpUV = wall.wallPerpUVs[wallPtIdx];
		//this is to make the walls two-sided.  It sort of works
		// var dotToWall = new Vector(wallPt.x - dot.x, wallPt.y - dot.y);
		// var dotProdToWall = dotToWall.dx * perpUV.dx + dotToWall.dy * perpUV.dy;
		// var sign = Math.abs(dotProdToWall) / dotProdToWall;
		// if (sign * dotProdToWall < dot.r) {
			// //makes it so it definitely hits if we're closer than r
			// var dotProdNext = -dotProdToWall;
		// } else {
			// var dotEdgePt;
			// if (dotProdToWall >= 0) {
				// dotEdgePt = new Point(dot.x + perpUV.dx * dot.r, dot.y + perpUV.dy * dot.r)
			// } else {
				// dotEdgePt = new Point(dot.x - perpUV.dx * dot.r, dot.y - perpUV.dy * dot.r)
			// }
			// var wallANext = new Point(wallPt.x + wall.vs[wallPtIdx].dx, wallPt.y + wall.vs[wallPtIdx].dy);
			// var wallBNext = new Point(wall[wallPtIdx + 1].x + wall.vs[wallPtIdx + 1].dx, wall[wallPtIdx + 1].y + wall.vs[wallPtIdx + 1].dy);
			// var edgePtNext = new Point(dotEdgePt.x + dot.v.dx, dotEdgePt.y + dot.v.dy);
			// var dx = wallBNext.x - wallANext.x;
			// var dy = wallBNext.y - wallANext.y;
			// var mag = Math.sqrt(dx * dx + dy * dy);
			// //hello.  If you even change the direction that perp wall UVs are taken, this will break.
			// var dotToWallNext = new Vector(wallANext.x - edgePtNext.x, wallANext.y - edgePtNext.y);
			// var perpNext = new Vector(-dy / mag, dx / mag);
			// var dotProdNext = dotToWallNext.dx * perpNext.dx + dotToWallNext.dy * perpNext.dy;
		// }
		
		// if (dotProdToWall * dotProdNext <=0 && this.isBetween(dot, wall, wallPtIdx, wallUV)) {
	
			// var perpV = -perpUV.dx * dot.v.dx - perpUV.dy * dot.v.dy;
			// var dxo = dot.v.dx;
			// var dyo = dot.v.dy;
			// var tempo = dot.temp();
			// this['didHit' + wall.hitMode](dot, wall, wallPtIdx, wallUV, perpV, perpUV);
			// return true;
		// } else {
			// return false;
		// }
		
		
		var dotVec = V(dot.x + dot.v.dx - perpUV.dx*dot.r - wallPt.x, dot.y + dot.v.dy - perpUV.dy*dot.r - wallPt.y);
		var distFromWall = perpUV.dotProd(dotVec);
		var perpV = -perpUV.dotProd(dot.v);
		var hitMode = wall.hitMode;
		if (distFromWall<0 && distFromWall>-15 && this.isBetween(dot, wall, wallPtIdx, wallUV)){
			this['didHit'+hitMode](dot, wall, wallPtIdx, wallUV, perpV, perpUV);
			return true;
		}
		return false;
	},
	isBetween: function(dot, wall, wallPtIdx, wallUV){
		var wallAdjust = dot.v.dotProd(wallUV);
		var xAdj = wallAdjust*wallUV.dx;
		var yAdj = wallAdjust*wallUV.dy;
		var wallPtA = P(wall[wallPtIdx].x+xAdj, wall[wallPtIdx].y+yAdj);
		var wallPtB = P(wall[wallPtIdx+1].x+xAdj, wall[wallPtIdx+1].y+yAdj);
		var reverseWallUV = V(-wallUV.dx, -wallUV.dy);
		var dotVecA = V(dot.x-wallPtA.x, dot.y-wallPtA.y);
		var dotVecB = V(dot.x-wallPtB.x, dot.y-wallPtB.y);
		return dotVecA.dotProd(wallUV)>=0 && dotVecB.dotProd(reverseWallUV)>=0;
	},
	////////////////////////////////////////////////////////////
	//WALL HIT HANDLER WRAPPERS
	////////////////////////////////////////////////////////////		
	didHitStd: function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
		var handler = wall.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, wall, subWallIdx, wallUV, perpV, perpUV]);		
	},
	didHitArrowDV: function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
		var vo = dot.v.copy();
		var handler = wall.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, wall, subWallIdx, wallUV, perpV, perpUV]);
		var pos = P(dot.x, dot.y);
		var vf = dot.v.copy();
		var perpVf = -perpUV.dotProd(dot.v);
		this.drawArrowV(pos, vo, vf, perpV, perpVf);  
	},
	didHitArrowSpd: function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
		var vo = dot.v.copy();
		var handler = wall.handlers[subWallIdx];
		handler.func.apply(handler.obj, [dot, wall, subWallIdx, wallUV, perpV, perpUV]);
		var pos = P(dot.x, dot.y);
		var vf = dot.v.copy();
		var perpVf = -perpUV.dotProd(dot.v);
		this.drawArrowSpd(pos, vo, vf, perpV, perpVf);  
	},
	didHitGravity: function(dot, wall, subWallIdx, wallUV, perpV, perpUV) {
		var handler = wall.handlers[subWallIdx];
		if (wallUV.dx!=0) {
			var yo = dot.y;
			var dyo = dot.v.dy;
		}
		handler.func.apply(handler.obj, [dot, wall, subWallIdx, wallUV, perpV, perpUV])
		if (wallUV.dx!=0) {
			//v^2 = vo^2 + 2ax;
			var discrim = dot.v.dy*dot.v.dy + 2*gInternal * (dot.y-yo);
			if (discrim>=0) { 
				if (dot.v.dy>0) {
					dot.v.dy = Math.sqrt(discrim);
				} else {
					dot.v.dy = -Math.sqrt(discrim);
				}		
			} else { 
				//should not have gotten as far up as reflection over wall moved it     so dyFinal<0/
				//so basically I'm setting a new velocity (1e-7)and solving for the approptiate y
				dot.v.dy = -1.e-7;
				dot.y = (dot.v.dy*dot.v.dy - dyo*dyo)/(2*gInternal) + yo;
			}
		}
		
		
	},
	////////////////////////////////////////////////////////////
	//END
	////////////////////////////////////////////////////////////
	haveChecked: function(wallIdx, subWallIdx, wallIdxs, subWallIdxs) {
		for (var i=0; i<wallIdxs.length; i++){
			if (wallIdxs[i]==wallIdx && subWallIdxs[i]==subWallIdx) {
				return true;
			}
		}
		return false;
	},
	
	//One wall, assuming first/last points do not overlap
	wallVolume: function(wallInfo){
		return this.area(this[wallInfo].slice(0,this[wallInfo].length-1))*vConst;
	},
	area: function(pts){
		var area=0;
		var convexResults = this.isConvex(pts);
		var multiplier = convexResults.multiplier;
		var isConvex = convexResults.isConvex;
		if(isConvex){
			return this.areaConvex(pts);
		}else{
			var ptSets = this.splitConcave(pts, multiplier);
			area+=this.area(ptSets[0]);
			area+=this.area(ptSets[1]);
		}
		return area;
	},
	isConvex: function(pts){
		var multiplier = this.getMult(pts);
		for (var ptIdx=1; ptIdx<pts.length-1; ptIdx++){
			var abcs = this.abcs(pts, ptIdx);
			var angle = this.angleBetweenPts(abcs.a, abcs.b, abcs.c, multiplier);
			if (angle>Math.PI){
				return {isConvex:false, multiplier: multiplier};
			}
		}
		var angle = this.angleBetweenPts(pts[pts.length-2], pts[pts.length-1], pts[0], multiplier);
		var angle = this.angleBetweenPts(pts[pts.length-1], pts[0], pts[1], multiplier);
		if (angle>Math.PI){
			return {isConvex:false, multiplier: multiplier};
		}
		return {isConvex:true, multiplier: multiplier};
		
	},
	getMult: function(pts){
		var reqAngle = Math.PI*(pts.length-2);//interior angles of polygon
		var UVs = this.getAreaUVs(pts);
		var anglePositive = this.getIntAngles(pts, UVs, 1);
		var angleNegative = this.getIntAngles(pts, UVs, -1);
		if(round(anglePositive,2)==round(reqAngle,2)){
			return 1;
		} else if (round(angleNegative,2)==round(reqAngle,2)){
			return -1;
		}
	},
	getAreaUVs: function(pts){
		var UVs = new Array(pts.length);
		for (var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
			var a = pts[ptIdx];
			var b = pts[ptIdx+1];
			UVs[ptIdx] = a.VTo(b).UV();
		}
		var a = pts[pts.length-1];
		var b = pts[0];
		UVs[UVs.length] = a.VTo(b).UV();
		return UVs;
	},
	getIntAngles: function(pts, UVs, multiplier){
		var intAngle = 0;
		for (var ptIdx=1; ptIdx<pts.length-1; ptIdx++){
			intAngle += this.angleBetweenPts(pts[ptIdx-1], pts[ptIdx], pts[ptIdx+1], multiplier);
		}
		intAngle += this.angleBetweenPts(pts[pts.length-2], pts[pts.length-1], pts[0], multiplier);
		intAngle += this.angleBetweenPts(pts[pts.length-1], pts[0], pts[1], multiplier);
		return intAngle;
	},
	splitConcave: function(ptsOrig, multiplier){
		var pts = new Array(ptsOrig.length+2);
		for (var ptIdx=0; ptIdx<ptsOrig.length; ptIdx++){pts[ptIdx]=ptsOrig[ptIdx]};
		pts[pts.length-2] = ptsOrig[0];
		pts[pts.length-1] = ptsOrig[1];
		for (var ptIdx=1; ptIdx<pts.length-1; ptIdx++){
			var abcs = this.abcs(pts, ptIdx);
			var angle = this.angleBetweenPts(abcs.a, abcs.b, abcs.c, multiplier);
			if(angle>Math.PI){
				if(ptIdx==ptsOrig.length){
					ptIdx=0;
				}
				return this.splitAt(pts.slice(0, pts.length-2), ptIdx, multiplier);
			}
		}
	},
	splitAt: function(pts, ptIdx, multiplier){
		//setting >180 angle to idx 0
		var pts = pts.slice(ptIdx, pts.length).concat(pts.slice(0, ptIdx));
		var b = pts[0];
		for (var ptIdx=2; ptIdx<pts.length-1; ptIdx++){
			var c = pts[ptIdx];
			if(!this.crossesWall(b, c, pts)){
				var pts1 = pts.slice(0, ptIdx+1);
				var pts2 = pts.slice(0,1).concat(pts.slice(ptIdx, pts.length));
				return [pts1, pts2];
			}
		}
	},
	abcs: function(pts, centeredAt){
		return {a:pts[centeredAt-1], b:pts[centeredAt], c:pts[centeredAt+1]}
	},
	crossesWall: function(a, b, pts){
		var line = a.VTo(b);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			var p1;
			var p2;
			if(ptIdx==pts.length-1){
				p1 = pts[ptIdx];
				p2 = pts[0];
			}else{
				p1 = pts[ptIdx];
				p2 = pts[ptIdx+1];
			}
			if(this.linesCross({p1:a, p2:b}, {p1:p1, p2:p2})){
				return true;
			}
			
		}
		return false;
	},
	linesCross: function(a, b){
		var vA = a.p1.VTo(a.p2);
		var vB = b.p1.VTo(b.p2);
		var magA = vA.mag();
		var magB = vB.mag();
		var UVA = vA.UV();
		var UVB = vB.UV();
		var dir1 = this.getDist(a, b, UVA, UVB, 'p1');
		var dir2 = this.getDist(a, b, UVA.neg(), UVB.neg(), 'p2');
		dir1.da = round(dir1.da,5);
		dir1.db = round(dir1.db,5);
		dir2.da = round(dir2.da,5);
		dir2.db = round(dir2.db,5);
		magA = round(magA,5);
		magB = round(magB,5);
		if(dir1.da>=magA || dir1.db>=magB || dir2.da>=magA || dir2.db>=magB){
			return false;
		}
		return true;
	},
	getDist: function(line1, line2, UVA, UVB, from){
		var a;
		var b;
		if(from=='p1'){
			a = line1.p1;
			b = line2.p1;
		}else{
			a = line1.p2;
			b = line2.p2;
		}
		if(UVA.dx==0 && UVB.dx==0){
			return {da:Infinity, db:Infinity};
		} else if (UVA.dx==0){
			var dx = a.x-b.x;
			var magMovement = Math.abs(dx/UVB.dx)
			var hitPt = b.copy().movePt(UVB.copy().mult(magMovement));
			return {da: a.distTo(hitPt), db:b.distTo(hitPt)};
		} else if (UVB.dx==0){
			var dx = b.x-a.x;
			var magMovement = Math.abs(dx/UVA.dx);
			var hitPt = a.copy().movePt(UVA.copy().mult(magMovement));
			return {da: a.distTo(hitPt), db:b.distTo(hitPt)};		
		}
		if(UVA.dy==0 && UVB.dy==0){
			return {da:Infinity, db:Infinity};
		}else if(UVA.dy==0){
			var dy = a.y-b.y;
			var magMovement = Math.abs(dy/UVB.dy)
			var hitPt = b.copy().movePt(UVB.copy().mult(magMovement));
			return {da: a.distTo(hitPt), db:b.distTo(hitPt)};
		}else if(UVB.dy==0){
			var dy = b.y-a.y;
			var magMovement = Math.abs(dy/UVA.dy)
			var hitPt = a.copy().movePt(UVA.copy().mult(magMovement));
			return {da: a.distTo(hitPt), db:b.distTo(hitPt)};	
		}
		var denom = UVB.dx*UVA.dy/UVA.dx - UVB.dy;
		if(denom==0){
			return {da:Infinity, db:Infinity};
		}
		var num = b.y - a.y - UVA.dy*b.x/UVA.dx + a.x*UVA.dy/UVA.dx;
		var db = num/denom;
		var da = (b.x + UVB.dx*db - a.x)/UVA.dx;
		return {da:da, db:db};
	},
	angleBetweenPts: function(a, b, c, multiplier){
		var ab = a.VTo(b).UV()
		var ba = ab.copy().neg()
		var bc = b.VTo(c).UV()
		var center = ab.copy().add(bc).rotate(Math.PI/2*multiplier)
		var angleBA = Math.atan2(ba.dy, ba.dx);
		var angleBC = Math.atan2(bc.dy, bc.dx);
		var angleCenter = Math.atan2(center.dy, center.dx);
		return this.distBetweenAngles(angleBA, angleCenter) + this.distBetweenAngles(angleCenter, angleBC);
	},
	distBetweenAngles: function(a, b){
		if(a<0){a+=Math.PI*2;}
		if(b<0){b+=Math.PI*2;}
		var max = Math.max(a, b);
		var min = Math.min(a, b);
		var diff = max-min;
		if(diff>Math.PI){
			return 2*Math.PI - diff;
		}else{
			return diff;
		}
		
	},
	areaConvex: function(pts){
		var area = 0;
		var originPt = pts[0];
		for (var ptIdx=2; ptIdx<pts.length; ptIdx++){
			var pt1 = pts[ptIdx-1];
			var pt2 = pts[ptIdx];
			area += originPt.area(pt1, pt2);
		}
		return area;
	},


	////////////////////////////////////////////////////////////
	//EXTRAS
	////////////////////////////////////////////////////////////
	drawArrowV: function(pos, vo, vf, perpVo, perpVf){
		var arrowPts = new Array(3);
		arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
		arrowPts[1] = pos.copy();
		arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
		var lifespan = 50;
		var arrowTurn = 0;
		var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
		var arrow = new ArrowLine(handle, arrowPts, Col(255,0,0), lifespan, c);


		var textPos = pos.copy().movePt(vf.mult(15));
		var delV = (Math.abs(perpVo)+Math.abs(perpVf))*pxToMS;
		animText.newAnim({pos:textPos}, 
				{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
				{text:'deltaV = '+round(delV,1)+'m/s', time:3000}
		);
	},
	drawArrowSpd: function(pos, vo, vf, perpVo, perpVf){
		var arrowPts = new Array(3);
		arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
		arrowPts[1] = pos.copy();
		arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
		var lifespan = 50;
		var arrowTurn = 0;
		var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
		var arrow = new ArrowLine(handle, arrowPts, Col(255,0,0), lifespan, c);


		var textPos = pos.copy().movePt(vf.mult(15));
		var V = vf.mag()*pxToMS*.1;//MAYBE SEND DOT.  GET SPEED RIGHT WAY.
		animText.newAnim({pos:textPos}, 
				{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
				{text:'Speed = '+round(V,1)+'m/s', time:3000}
		);
	}	


}
