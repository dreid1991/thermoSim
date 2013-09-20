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
				this[wallIdx].handlers[subWallIdx] = new Listener(this[handler], this);
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
			//wall handlers are addressed by string
			this[wallIdx].handlers[subWallIdx] = new Listener(this[handler], this);
		} else if (typeof handler == 'object') {
			this[wallIdx].handlers[subWallIdx] = handler;
		}		
	},
	getSubWallHandler: function(wallInfo, subWallIdx) {
		var wallIdx = this.idxByInfo(wallInfo);
		return this[wallIdx].handlers[subWallIdx];
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
		this[wallIdx].hitMode = 'didHitStd';
		this[wallIdx].vs = this.makeWallVs(pts); //this is only used for piston/compression arrow stuff.  Cell uses guide node velocities
		this[wallIdx].bounds = bounds;
		this[wallIdx].dotManager = dotMgr || dotManager; //global gas dot manager
		if (vol) {
			this[wallIdx].setVol(vol);
		}
		this[wallIdx].col = defaultTo(this.defaultCol, col);
		this[wallIdx].show = defaultTo(true, show);
		if (close !== false) {
			this.closeWall(this[wallIdx]);
			this[wallIdx].closed = true;
		} else {
			this[wallIdx].closed = false;
		}
		
		this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
		this[wallIdx].g = g;
		this[wallIdx].pConst = pConst;
		this[wallIdx].liquids = {};
		this[wallIdx].data = {};
		this[wallIdx].q = 0;
		this[wallIdx].hitThreshold = 15;
		this[wallIdx].handlers = [];
		this[wallIdx].pIntLen = 35;
		this[wallIdx].surfAreaAdj = {};
		this[wallIdx].eToAdd = 0;
		this[wallIdx].isLiquid = false;
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
		if (typeof info != 'number') {
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
									if (this[wallIdx].checkWallHit(dot, line) === true) break gridLoop;
									checkedWallIdxs.push(wallIdx);
									checkedSubWallIdxs.push(line);
								}
							}
						}
					}
				}
		}
		
	},

	


	haveChecked: function(wallIdx, subWallIdx, wallIdxs, subWallIdxs) {
		for (var i=0; i<wallIdxs.length; i++){
			if (wallIdxs[i]==wallIdx && subWallIdxs[i]==subWallIdx) {
				return true;
			}
		}
		return false;
	},
	getWallsByHandles: function(handles) {
		var grabbed = []
		for (var i=0; i<handles.length; i++) {
			var next = this[handles[i]];
			if (next) 
				grabbed.push(next);
			else
				console.log('Bad wall handle ' + handles[i]);
		}
		return grabbed;
	},
	//One wall, assuming first/last points do not overlap
	wallVolume: function(wallInfo){
		return this.area(this[wallInfo].slice(0,this[wallInfo].length-1)) * vConst;
	},
	area: function(pts){
		var area = 0;
		var convexResults = this.isConvex(pts);
		if (convexResults.isConvex) {
			return this.areaConvex(pts);
		} else if (pts.length > 3) { //three points in a row returns concave, but that ain't no concave polygon
			var ptSets = this.splitConcave(pts, convexResults.multiplier);
			area += this.area(ptSets[0]);
			area += this.area(ptSets[1]);
			
		}
		return area;
	},
	isConvex: function(pts){
		var ConvexResult = function(isConvex, multiplier) {
			this.isConvex = isConvex;
			this.multiplier = multiplier;
		}
	
		var multiplier = this.getMult(pts);
		for (var ptIdx=1; ptIdx<pts.length-1; ptIdx++){
			var abcs = this.abcs(pts, ptIdx);
			var angle = this.angleBetweenPts(abcs.a, abcs.b, abcs.c, multiplier);
			if (angle > Math.PI) {
				return new ConvexResult(false, multiplier);
			}
		}
		var angle = this.angleBetweenPts(pts[pts.length-2], pts[pts.length-1], pts[0], multiplier);
		var angle = this.angleBetweenPts(pts[pts.length-1], pts[0], pts[1], multiplier);
		if (angle > Math.PI) {
			return new ConvexResult(false, multiplier);
		}
		return new ConvexResult(true, multiplier);
		
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
		for (var ptIdx=0; ptIdx<ptsOrig.length; ptIdx++) pts[ptIdx] = ptsOrig[ptIdx];
		pts[pts.length-2] = ptsOrig[0];
		pts[pts.length-1] = ptsOrig[1];
		for (var ptIdx=1; ptIdx<pts.length-1; ptIdx++) {
			var abcs = this.abcs(pts, ptIdx);
			var angle = this.angleBetweenPts(abcs.a, abcs.b, abcs.c, multiplier);
			if (angle > Math.PI) {
				if (ptIdx == ptsOrig.length) {
					ptIdx = 0;
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
			if (this.linesCross(a, b, p1, p2)) {
				return true;
			}//{p1:a, p2:b}, {p1:p1, p2:p2}
			
		}
		return false;
	},
	linesCross: function(aP1, aP2, bP1, bP2){
		var vA = aP1.VTo(aP2);
		var vB = bP1.VTo(bP2);
		var magA = vA.mag();
		var magB = vB.mag();
		var UVA = vA.UV();
		var UVB = vB.UV();
		var dir1 = this.getDist(aP1, aP2, bP1, bP2, UVA, UVB, 'p1');
		var dir2 = this.getDist(aP1, aP2, bP1, bP2, UVA.neg(), UVB.neg(), 'p2');
		dir1.dx = round(dir1.dx,5);
		dir1.dy = round(dir1.dy,5);
		dir2.dx = round(dir2.dx,5);
		dir2.dy = round(dir2.dy,5);
		magA = round(magA,5);
		magB = round(magB,5);
		return !(dir1.dx>=magA || dir1.dy>=magB || dir2.dx>=magA || dir2.dy>=magB);

	},
	getDist: function(aP1, aP2, bP1, bP2, UVA, UVB, from){
		if (from=='p1') {
			var a = aP1
			var b = bP1;
		} else {
			var a = aP2;
			var b = bP2;
		}
		if (UVA.dx==0 && UVB.dx==0) {
			return new Vector(Infinity, Infinity);
		} else if (UVA.dx==0) {
			var dx = a.x-b.x;
			var magMovement = Math.abs(dx/UVB.dx)
			var hitPt = b.copy().movePt(UVB.copy().mult(magMovement));
			return new Vector(a.distTo(hitPt), b.distTo(hitPt));
		} else if (UVB.dx==0) {
			var dx = b.x-a.x;
			var magMovement = Math.abs(dx/UVA.dx);
			var hitPt = a.copy().movePt(UVA.copy().mult(magMovement));
			return new Vector(a.distTo(hitPt), b.distTo(hitPt));		
		}
		if (UVA.dy==0 && UVB.dy==0) {
			return new Vector(Infinity, Infinity);
		} else if(UVA.dy==0) {
			var dy = a.y-b.y;
			var magMovement = Math.abs(dy/UVB.dy)
			var hitPt = b.copy().movePt(UVB.copy().mult(magMovement));
			return new Vector(a.distTo(hitPt), b.distTo(hitPt));
		} else if(UVB.dy==0) {
			var dy = b.y-a.y;
			var magMovement = Math.abs(dy/UVA.dy)
			var hitPt = a.copy().movePt(UVA.copy().mult(magMovement));
			return new Vector(a.distTo(hitPt), b.distTo(hitPt));
		}
		var denom = UVB.dx*UVA.dy/UVA.dx - UVB.dy;
		if (denom==0) {
			return new Vector(Infinity, Infinity);
		}
		var num = b.y - a.y - UVA.dy*b.x / UVA.dx + a.x*UVA.dy / UVA.dx;
		var db = num / denom;
		var da = (b.x + UVB.dx*db - a.x) / UVA.dx;
		return new Vector(da, db);
	},
	angleBetweenPts: function(a, b, c, multiplier){
		var ab = a.VTo(b).UV()
		var ba = ab.copy().neg()
		var bc = b.VTo(c).UV()
		var center = ab.copy().add(bc).perp(multiplier == 1 ? 'cw' : 'ccw');
		var angleBA = Math.atan2(ba.dy, ba.dx);
		var angleBC = Math.atan2(bc.dy, bc.dx);
		var angleCenter = Math.atan2(center.dy, center.dx);
		return this.distBetweenAngles(angleBA, angleCenter) + this.distBetweenAngles(angleCenter, angleBC);
	},
	distBetweenAngles: function(a, b){
		if (a < 0) a+=Math.PI*2;
		if (b < 0) b+=Math.PI*2;
		var diff = Math.max(a, b) - Math.min(a, b);
		if (diff > Math.PI) {
			return 2*Math.PI - diff;
		} else {
			return diff;
		}
		
	},
	areaConvex: function(pts){
		var area = 0;
		var originPt = pts[0];
		for (var ptIdx=2; ptIdx<pts.length; ptIdx++) {
			var pt1 = pts[ptIdx-1];
			var pt2 = pts[ptIdx];
			area += originPt.area(pt1, pt2);
		}
		return area;
	},





}
