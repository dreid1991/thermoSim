function WallHandler(pts, handlers, handles, bounds, includes){
	var newWall = new Array(pts.length)
	_.extend(newWall, WallMethods.main, WallMethods.collideMethods);

	newWall.assemble(pts, handles, bounds, includes)
	
	if(handles.length!=pts.length){
		console.log('NAME YOUR WALLS');
	}

	if(handlers){
		newWall.doInitHandlers(handlers);
	}
	return newWall;
};
WallMethods = {
	main: {
		assemble: function(pts, handles, bounds, includes){
			includes = defaultTo([], includes);
			bounds = defaultTo([], bounds);
			for (var wallIdx=0; wallIdx<pts.length; wallIdx++){
				this.setWallVals(wallIdx, pts[wallIdx], handles[wallIdx], bounds[wallIdx], includes[wallIdx]);

			}
			this.setup();

		},
		setBounds: function(wallInfo, bounds){
			var wallBounds = this[this.idxByInfo(wallInfo)].bounds;
			for (var boundName in bounds){
				wallBounds[boundName] = bounds[boundName]
			}
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
		setHitMode: function(wallInfo, inputMode){
			var wallIdx = this.idxByInfo(wallInfo);
			this[wallIdx].hitMode = inputMode;
		},
		doInitHandlers: function(handlers){
			
			if (handlers instanceof Array){//NOTE - HANDLERS HAD BETTER BE THE SAME LENGTH AT walls.pts.  I AM ASSUMING IT IS.
				for (var handlerIdx=0; handlerIdx<handlers.length; handlerIdx++){
					if(handlers[handlerIdx] instanceof Array){
						var handlerArray = handlers[handlerIdx];
						for (var subHandlerIdx=0; subHandlerIdx<handlerArray.length; subHandlerIdx++){
							var subHandler = handlerArray[subHandlerIdx]
							this.setSubWallHandler(handlerIdx, subHandlerIdx, subHandler);
						}
					}else if(typeof handlers[handlerIdx] == 'string'){
						var handler = handlers[handlerIdx];
						this.setWallHandler(handlerIdx, handler)
					}
				}
			} else if(typeof handlers == 'string' || typeof handlers=='object'){
				this.setAllHandler(handlers);
			}else{
				console.log('YOU SEND POOR WALL HANDLERS.  THEY ARE NEITHER STRING NOR ARRAY');
			}
		},
		setAllHandler: function(handler){
			for(var wallIdx=0; wallIdx<this.length; wallIdx++){
				this.setWallHandler(wallIdx, handler);
			}
		},
		setWallHandler: function(wallInfo, handler){
			var wallIdx = this.idxByInfo(wallInfo);
			for (var subWallIdx=0; subWallIdx<this[wallIdx].length; subWallIdx++){
				this.setSubWallHandler(wallIdx, subWallIdx, handler);
			}
		},
		
		setSubWallHandler: function(wallInfo, subWallIdx, handler){
			var wallIdx = this.idxByInfo(wallInfo)
			if(typeof handler == 'string'){
				this[wallIdx+ '-' + subWallIdx] = {obj:this, func:this[handler]};
			}else if(typeof handler=='object'){
				this[wallIdx+ '-' + subWallIdx] = {obj:handler.obj, func: handler.func};
			}
		},
		setupWall: function(wallIdx){
			this[wallIdx].wallUVs = this.getWallUV(wallIdx);
			this[wallIdx].wallPerpUVs= this.getPerpUVs(wallIdx);
			this[wallIdx].wallGrids = this.getSubwallGrid(wallIdx);
		},
		setWallVals: function(wallIdx, pts, handle, bounds, include){
			bounds = defaultTo({yMin:30, yMax: 435}, bounds);
			include = defaultTo(1, include);
			this[wallIdx] = pts;
			this[wallIdx].handle = handle;
			this[wallIdx].include = include;
			this[wallIdx].hitMode = 'Std';
			this[wallIdx].v = 0;
			this[wallIdx].bounds = bounds;
			this.closeWall(this[wallIdx]);
			this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
			this[wallIdx].massChunks = {};
			this[wallIdx].forceInternal = 0;
			this[wallIdx].pLastRecord = turn;
			this[wallIdx].parent = this;
			this[handle] = this[wallIdx];
			_.extend(this[wallIdx], WallMethods.wall);	
		},
		addWall: function(pts, handler, handle, bounds, include){
			
			var newIdx = this.length;
			this.setWallVals(newIdx, pts, handle, bounds, include);
			this.setupWall(newIdx);
			this.setWallHandler(newIdx, handler);
		},
		setPtsInit: function(){
			for (var wallIdx=0; wallIdx<this.length; wallIdx++){
				this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
			}
		},
		restoreWall: function(wallIdx){
			var init = this[wallIdx].ptsInit;
			for (var ptIdx=0; ptIdx<init.length; ptIdx++){
				this[wallIdx][ptIdx] = init[ptIdx].copy();
			}
			this.setupWall(wallIdx);
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
				if(handle==this[idx].handle){
					return idx;
				}
			}
			console.log('Failed to get wall idx by handle\nHandle:'+handle);
			
		},
		idxByInfo: function(info){
			var wallIdx;
			if(parseFloat(info)!=info){
				return this.idxByHandle(info)
			}else{
				return info;
			}
		},
		removeWall: function(wallInfo){
			var wallIdx = this.idxByInfo(wallInfo);
			this[this[wallIdx].handle] = undefined;
			this.splice(wallIdx, 1);
			this.removeHandlers(wallIdx);
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
				perpUVs[wallUVIdx] = V(-wallUV.dy, wallUV.dx);
			}
			return perpUVs;
		},
		getWallUV: function(wallIdx){
			var wall = this[wallIdx];
			var numUVs = wall.length-1
			var wallUVs = new Array(numUVs);
			for (var ptIdx=0; ptIdx<numUVs; ptIdx++){
				var ptA = wall[ptIdx];
				var ptB = wall[ptIdx+1];
				wallUVs[ptIdx] = V(ptB.x-ptA.x, ptB.y-ptA.y).UV();
			}
			return wallUVs;
		},
		getSubwallGrid: function(wallIdx){
			var subwallGrid = new Array(this.numCols);
			for (var x=0; x<this.numCols; x++){ 
			var column = new Array(this.numRows);
				for (var y=0; y<this.numRows; y++){
					column[y] = (this.getSubwallsInGrid(wallIdx, x, y));
				}
				subwallGrid[x] = (column);
			}
			return subwallGrid;
			
			
		},
		getSubwallsInGrid: function(wallIdx, x, y){
			var subwallsInGrid = [];
			var wall = this[wallIdx];
			for (var ptIdx=0; ptIdx<wall.length-1; ptIdx++){
				if (this.isInBox(x, y, [wallIdx, ptIdx])){
					subwallsInGrid.push(ptIdx);
				}
			}
			return subwallsInGrid;
		},
		isInBox: function(x, y, pt){
			if (this.crossesLine(x, y, x+1, y, pt, "min") || this.crossesLine(x+1, y, x+1, y+1, pt, "max") || this.crossesLine(x+1, y+1, x, y+1, pt, "max") || this.crossesLine(x, y+1, x, y, pt, "min")){
				return true;
			};
			return false;
		},
		crossesLine: function(x1, y1, x2, y2, pt, type){
			x1*=this.gridDim;
			x2*=this.gridDim;
			y1*=this.gridDim;
			y2*=this.gridDim;
			pt1 = this[pt[0]][pt[1]];
			pt2 = this[pt[0]][pt[1]+1];
			var angleLine = this.getAngle(pt1.x, pt1.y, pt2.x, pt2.y);
			var anglePt1 = this.getAngle(pt1.x, pt1.y, x1, y1);
			var anglePt2 = this.getAngle(pt1.x, pt1.y, x2, y2);
			if (this.getBetweenAngle(angleLine, anglePt1, anglePt2)){
				if(x1==x2){
					return this.getBetweenPoint(x1, pt1.x, pt2.x, type);
				} else if (y1==y2){
					return this.getBetweenPoint(y1, pt1.y, pt2.y, type);
				}
			}
			return false;
		},
		getAngle: function(x1, y1, x2, y2){
			var angle = Math.atan2((y2-y1),(x2-x1))
			if(angle<0){
				angle+=2*Math.PI;
			}
			return angle;
		},
		getBetweenAngle: function(line, pt1, pt2){
			var big = Math.max(pt1, pt2);
			var small = Math.min(pt1, pt2);
			if (big >= line && line >= small){
				return true;
			} else if (big-small > Math.PI){
				if (line >= big || line <= small){
					return true;
				}
			}
			return false;
		},
		getBetweenPoint: function(gridPt, wallPt1, wallPt2, type){
			var gridDim = this.gridDim;
			if (Math.min(wallPt1, wallPt2) <= gridPt && gridPt <= Math.max(wallPt1, wallPt2)){
				return true;
			} else if (type=="min"){
				if (gridPt + gridDim >= wallPt1 && wallPt1 >= gridPt && gridPt + gridDim >= wallPt1 && wallPt1 >= gridPt){
					return true;
				}
			} else if (type=="max"){
				if(gridPt - gridDim >= wallPt1 && wallPt1 >= gridPt && gridPt - gridDim >= wallPt1 && wallPt1 >= gridPt){
					return true;
				}
			}
			return false;
		},

		check: function(){
			var gridDim = this.gridDim;
			var xSpan = this.xSpan;
			var ySpan = this.ySpan;
			var spcsLocal = spcs;
			for (var spcName in spcsLocal){
				var spc = spcsLocal[spcName];
				for (var dotIdx=0; dotIdx<spc.length; dotIdx++){
					var dot = spc[dotIdx];
					var checkedWalls = [];
					var gridX = Math.floor(dot.x/gridDim);
					var gridY = Math.floor(dot.y/gridDim);
					if(gridX>xSpan || gridX<0 || gridY>ySpan || gridY<0){
						returnEscapist(dot);
						console.log("ball out of bounds");				
					}
					else{
						for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
							for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
								
								for (var wallIdx=0; wallIdx<this.length; wallIdx++){
									var gridSquare = this[wallIdx].wallGrids[x][y];
									for (var lineIdx=0; lineIdx<gridSquare.length; lineIdx++){
										var line = gridSquare[lineIdx];
										if (!this.haveChecked([wallIdx, line], checkedWalls)){
											this.checkWallHit(dot, [wallIdx, line]);
											checkedWalls.push([wallIdx, line]);
										}
									}
								}
							}
						}
					}
				}
			}
		},
		checkWallHit: function(dot, line){
			var wallIdx = line[0];
			var subWallIdx = line[1];
			var wallPt = this[wallIdx][subWallIdx];
			var wallUV = this[wallIdx].wallUVs[subWallIdx];
			var perpUV = this[wallIdx].wallPerpUVs[subWallIdx]
			var dotVec = V(dot.x + dot.v.dx - perpUV.dx*dot.r - wallPt.x, dot.y + dot.v.dy - perpUV.dy*dot.r - wallPt.y);
			var distFromWall = perpUV.dotProd(dotVec);
			var perpV = -perpUV.dotProd(dot.v);
			var hitMode = this[line[0]].hitMode;
			if (distFromWall<0 && distFromWall>-30 && this.isBetween(dot, wallIdx, subWallIdx, wallUV)){
				this['didHit'+hitMode](dot, wallIdx, subWallIdx, wallUV, perpV, perpUV);
			}
		},
		isBetween: function(dot, wallIdx, subWallIdx, wallUV){
			var wallAdjust = dot.v.dotProd(wallUV);
			var xAdj = wallAdjust*wallUV.dx;
			var yAdj = wallAdjust*wallUV.dy;
			var wallPtA = P(walls[wallIdx][subWallIdx].x+xAdj, walls[wallIdx][subWallIdx].y+yAdj);
			var wallPtB = P(walls[wallIdx][subWallIdx+1].x+xAdj, walls[wallIdx][subWallIdx+1].y+yAdj);
			var reverseWallUV = V(-wallUV.dx, -wallUV.dy);
			var dotVecA = V(dot.x-wallPtA.x, dot.y-wallPtA.y);
			var dotVecB = V(dot.x-wallPtB.x, dot.y-wallPtB.y);
			return (dotVecA.dotProd(wallUV)>=0 && dotVecB.dotProd(reverseWallUV)>=0)
		},
		didHitStd: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV){
			var handler = this[wallIdx + '-' + subWallIdx];
			//this[handler](dot, wallIdx, subWallIdx, wallUV, perpV, perpUV);
			handler.func.apply(handler.obj,[dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);		
		},
		didHitArrow: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV){
			var vo = dot.v.copy();
			var handler = this[wallIdx + '-' + subWallIdx];
			//this[handler](dot, wallIdx, subWallIdx, wallUV, perpV, perpUV);
			handler.func.apply(handler.obj,[dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);
			var pos = P(dot.x, dot.y);
			var vf = dot.v.copy();
			var perpVf = -perpUV.dotProd(dot.v);
			this.drawArrow(pos, vo, vf, perpV, perpVf);  
		},
		haveChecked: function(wall, list){
			for (var listIdx=0; listIdx<list.length; listIdx++){
				if(list[listIdx][0]==wall[0] && list[listIdx][1]==wall[1]){
					return true;
				}
			}
			return false;
		},
		
		//One wall, assuming first/last points do not overlap
		totalArea: function(){
			var area=0;
			for (var wallIdx=0; wallIdx<this.length; wallIdx++){
				var uncutPts = this[wallIdx];
				var pts = uncutPts.slice(0,uncutPts.length-1);
				area+=this[wallIdx].include*this.area(pts);
			}
			return area;
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
				pt1 = pts[ptIdx-1];
				pt2 = pts[ptIdx];
				area += originPt.area(pt1, pt2);
			}
			return area;
		},

	
		////////////////////////////////////////////////////////////
		//EXTRAS
		////////////////////////////////////////////////////////////
		drawArrow: function(pos, vo, vf, perpVo, perpVf){
			var arrowPts = new Array(3);
			arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
			arrowPts[1] = pos.copy();
			arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
			var lifeSpan = 50;
			var arrowTurn = 0;
			var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
			var arrow = new Arrow(handle, arrowPts, Col(255,0,0),c).show(lifeSpan);


			var textPos = pos.copy().movePt(vf.mult(15));
			var delV = (Math.abs(perpVo)+Math.abs(perpVf))*pxToMS;
			animText.newAnim({pos:textPos}, 
					{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
					{text:'deltaV = '+round(delV,1)+'m/s', time:3000}
			);
		},	
	
	
	},
	////////////////////////////////////////////////////////////
	//WALL FUNCS
	////////////////////////////////////////////////////////////
	wall: {
		pExt: function(){
			var SA = this[1].x - this[0].x;
			return pConst*this.mass()*g/SA;
		},
		pInt: function(){
			var SA = this.surfArea();
			var pInt = pConst*this.forceInternal/((turn-this.pLastRecord)*SA);
			this.forceInternal = 0;
			this.pLastRecord = turn;
			return pInt;
		},
		surfArea: function(){
			var SA=0;
			for (ptIdx=0; ptIdx<this.length-1; ptIdx++){
				var pt = this[ptIdx];
				var ptNext = this[ptIdx+1];
				SA+=pt.distTo(ptNext);
			}
			
			return SA;
		},
		mass: function(){
			var totalMass = 0;
			for (var chunkName in this.massChunks){
				totalMass+=this.massChunks[chunkName];
			}
			return totalMass;
		},
		setMass: function(chunkName, value){
			this.massChunks[chunkName] = value;
			return this;
		},
		unsetMass: function(chunkName){
			if(!chunkName){
				for (var chunkName in this.massChunks){
					this.massChunks[chunkName] = undefined;
				}		
			}else{
				this.massChunks[chunkName] = undefined;
			}
			return this;
		},
		moveInit: function(){
			var gLocal = g;
			var yMax = this.bounds.yMax;
			var yMin = this.bounds.yMin;
			addListener(curLevel, 'update', 'moveWall'+this.handle,
				function(){
					var lastY = this[0].y
					var nextY;
					var unboundedY = lastY + this.v + .5*gLocal;
					var dyWeight = null;
					if(unboundedY>yMax || unboundedY<yMin){
						nextY = this.hitBounds(lastY, gLocal, yMin, yMax);
					}else{
						nextY = unboundedY;
						this.v += gLocal;

					}
					this[0].y = nextY;
					this[1].y = nextY;
					this[this.length-1].y = nextY;
					this.parent.setupWall(this.handle);		
				},
			this);
		},
		moveStop: function(){
			removeListener(curLevel, 'update', 'moveWall' + this.handle);
		},
		hitBounds: function(lastY, gLocal, yMin, yMax){
			
			//possible this should just be for lower bounds
			var tLeft = 1;
			var unboundedY = lastY + this.v*tLeft + .5*gLocal*tLeft*tLeft;
			var boundedY = Math.max(yMin, Math.min(yMax, unboundedY));
			var discr = this.v*this.v + 2*gLocal*(boundedY-lastY);
			if (boundedY==yMax){
				
				var tHit = (-this.v + Math.sqrt(discr))/gLocal;

			}else if (boundedY==yMin){
				
				var tHit = (-this.v - Math.sqrt(discr))/gLocal;
			}
			this.v+=gLocal*tHit;
			this.v*=-1;
			tLeft-=tHit;
			
			if(-2*this.v< tLeft*gLocal && this.v<0){
				var tBounce = Math.abs(2*this.v/gLocal);
				var numBounces = Math.floor(tLeft/tBounce);
				tLeft-=numBounces*tBounce;
			}
			var nextY = boundedY + this.v*tLeft + .5*gLocal*tLeft*tLeft;
	 
			
			this.v += gLocal*tLeft;
			
			return nextY;
		},
	
		border: function(wallPts, thickness, col, ptAdjusts){
			var drawCanvas = c;
			var pts = new Array(wallPts.length);
			var perpUVs = new Array(wallPts.length-1)
			var borderPts = [];
			var targetWallPts = this;
			var targetWallPerps = this.wallPerpUVs;
			for (var wallPtIdx=0; wallPtIdx<wallPts.length; wallPtIdx++){
				pts[wallPtIdx] = targetWallPts[wallPts[wallPtIdx]].copy();
			}
			for (var wallPtIdx=0; wallPtIdx<wallPts.length-1; wallPtIdx++){
				perpUVs[wallPtIdx] = targetWallPerps[wallPts[wallPtIdx]].copy().neg();
			}
			for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
				var pt = pts[ptIdx];
				//can give either vector or absolute position
				pt.movePt(ptAdjusts[ptIdx]);
				pt.position(ptAdjusts[ptIdx]);
				borderPts.push(pt);
			}
			var lastAdj = perpUVs[perpUVs.length-1].copy().mult(thickness)
			borderPts.push(pts[pts.length-1].copy().movePt(lastAdj));
			for (var ptIdx=pts.length-2; ptIdx>0; ptIdx-=1){
				var UVs = [perpUVs[ptIdx], perpUVs[ptIdx-1]];
				var pt = pts[ptIdx];
				borderPts.push(this.spacedPt(pt, UVs, thickness));
			}
			var firstAdj = perpUVs[0].mult(thickness)
			borderPts.push(pts[0].copy().movePt(firstAdj));
			borderPts.push(pts[0]);
			addListener(curLevel, 'update', 'drawBorder' + this.handle, 
				function(){
					draw.fillPts(borderPts, col, drawCanvas);
				}
			,'');
		},
		spacedPt: function(pt, UVs, thickness){
			var UV1 = UVs[0];
			var UV2 = UVs[1];
			var adjust = UV1.add(UV2)
			return pt.copy().movePt(adjust.mult(thickness));
		},
		removeBorder: function(){
			removeListener(curLevel, 'update', 'drawBorder' + this.handle);
		},
	},
	collideMethods:{
		cPAdiabaticDamped: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			/*
			To dampen wall speed , doing:
			1 = dot
			2 = wall
			m1vo1^2 + m2vo2^2 = m1v1^2 + m2v2^2
			m1vo1 + m2vo2 = m1v1 + A*m2v2
			where A = (abs(wallV)+1)^(const, maybe .1 to .3)
			leads to
			a = m1 + m1^2/(A^2m2)
			b = -2*vo1*m1^2/(A^2m2) - 2*vo2*m1/A^2
			c = m1^2*vo1^2/(A^2*m2) + 2*m1*vo2*vo1/A^2 + m2*(vo2/A)^2 - m1*vo1^2 - m2*vo2^2
			I recommend grouping squared terms in each block for faster computation
			v1 = (-b + (b^2 - 4*a*c)^.5)/2a
			v2 = (m1*vo1 + m2*vo2 - m1*v1)/(m2*A)
			*/
			var wall = this[wallIdx];
			var vo = dot.v.copy();
			var vo1 = dot.v.dy;
			var vo2 = wall.v;
			var m1 = dot.m;
			var m2 = wall.mass();
			
			if(Math.abs(vo2)>1.0){
				var vo1Sqr = vo1*vo1;
				var vo2Sqr = vo2*vo2;
				
				var scalar = Math.pow(Math.abs(vo2)+.1, .2);
				var scalarSqr = scalar*scalar
				
				var a = m1*(1 + m1/(scalarSqr*m2));
				var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
				var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
				
				dot.v.dy = (-b + Math.pow(b*b - 4*a*c,.5))/(2*a);
				dot.y = dot.y+dot.r;
				wall.v = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
			}else{
				var pt = walls[wallIdx][subWallIdx];
				dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
				wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
				dot.y = pt.y+dot.r;			
			}
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
		},	
		cPAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var wall = this[wallIdx];
			var vo = dot.v.copy();
			var vo1 = dot.v.dy;
			var vo2 = wall.v;
			var m1 = dot.m;
			var m2 = this.mass()	
			var pt = wall[subWallIdx];
			dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;		
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
		},
		staticAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			this.reflect(dot, wallUV, perpV);
			this[wallIdx].forceInternal += 2*dot.m*Math.abs(perpV);
		},
		cVIsothermal: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			dot.y+=perpUV.dy;
			this.reflect(dot, wallUV, perpV);
			this[wallIdx].forceInternal += 2*dot.m*Math.abs(perpV);
			//this is really not correct, but it's not in use yet, so...
		},
		cVAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var v = dot.v;
			v.dy = -v.dy + 2*walls[wallIdx].v;
			this[wallIdx].forceInternal += dot.m*(perpV + v.dy);
		},
		reflect: function(dot, wallUV, perpV){
			dot.v.dx -= 2*wallUV.dy*perpV;
			dot.v.dy += 2*wallUV.dx*perpV;
			dot.x -= wallUV.dy
			dot.y += wallUV.dx
		},
	},
}