function WallHandler(attrs){//pts, handlers, handles, bounds, includes, vols, shows, records, temps){//records is a verb, like what the wall records.  Defaults to recording q, pint, t, v
	//a trap!  If you make it isothermal, you must specify a temperature to hold at in temps list
	if (attrs) {
		var newWall = new Array(attrs.pts.length);
	} else {
		var newWall = new Array();
	}
	_.extend(newWall, WallMethods.main, WallMethods.collideMethods);
	addListener(curLevel, 'sectionCleanUp', 'walls', newWall.remove, newWall)
	newWall.cVIsothermal32 = newWall.cVIsothermal;
	if (attrs) {//Yo yo, you can just do new WallHander() and then add walls
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
WallMethods = {
//////////////////////////////////////////////////////////////////////////
//MAIN
//////////////////////////////////////////////////////////////////////////	
	main: {
		assemble: function(attrs){//pts, handles, bounds, includes, vols, shows, records){
			this.removed = false;
			var pts = attrs.pts;
			var handles = attrs.handles;

						
			this.numWalls = pts.length;
			this.qArrowFill = Col(200, 0, 0);
			this.qArrowFillFinal = Col(100, 0, 0);
			this.qArrowStroke = Col(255, 255, 255);
			var includes = defaultTo([], attrs.includes);
			var bounds = defaultTo([], attrs.bounds);
			var vols = defaultTo([], attrs.vols);
			var shows = defaultTo([], attrs.shows);
			var records = defaultTo([], attrs.records);
			var tSets = defaultTo([], attrs.temps);
			for (var wallIdx=0; wallIdx<pts.length; wallIdx++){
				this.setWallVals(wallIdx, pts[wallIdx], handles[wallIdx], bounds[wallIdx], includes[wallIdx], vols[wallIdx], shows[wallIdx], records[wallIdx], tSets[wallIdx]);

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
				console.log('YOU SEND POOR WALL HANDLERS.  THEY ARE NEITHER STRING NOR ARRAY NOR OBJECT');
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
				this[wallIdx + '-' + subWallIdx] = {obj:this, func:this[handler]};
				if(handler.toLowerCase().indexOf('isothermal')!=-1){
					this[wallIdx].isothermalInit();
				} else {
					this[wallIdx][subWallIdx].isothermal = false;
				}
			}else if(typeof handler=='object'){
				this[wallIdx + '-' + subWallIdx] = handler;
				if(handler.isothermal){
					this[wallIdx].isothermalInit();
				} else {
					this[wallIdx][subWallIdx].isothermal = false;
				}
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
		setWallVals: function(wallIdx, pts, handle, bounds, include, vol, show, record, tSet){
			bounds = defaultTo({yMin:30, yMax: 435}, bounds);
			include = defaultTo(1, include);
			this[wallIdx] = pts;
			_.extend(this[wallIdx], WallMethods.wall);	
			this[wallIdx].handle = handle;
			this[wallIdx].include = include;
			this[wallIdx].hitMode = 'Std';
			this[wallIdx].v = 0;
			this[wallIdx].bounds = bounds;
			if(vol){
				this[wallIdx].setVol(vol);
			}
			this[wallIdx].show = defaultTo(true, show);
			this.closeWall(this[wallIdx]);
			this[wallIdx].ptsInit = this.copyWallPts(this[wallIdx]);
			this[wallIdx].g = g;
			this[wallIdx].pConst = pConst;
			this[wallIdx].data = {};
			this[wallIdx].data['pInt'] = new Array();
			this[wallIdx].data['pExt'] = new Array();
			this[wallIdx].data['t'] = new Array();
			this[wallIdx].data['RMS'] = new Array(); // m/s
			this[wallIdx].data['v'] = new Array();
			this[wallIdx].data['m'] = new Array();
			this[wallIdx].data['work'] = new Array(); // kj
			this[wallIdx].data['q'] = new Array(); //kj
			this[wallIdx].recordingTemp = {val: false};
			this[wallIdx].recordingPInt = {val: false};
			this[wallIdx].recordingPExt = {val: false};
			this[wallIdx].recordingVol = {val: false};
			this[wallIdx].recordingWork = {val: false};
			this[wallIdx].recordingMass = {val: false};
			this[wallIdx].recordingQ = {val: false};
			this[wallIdx].recordingRMS = {val: false};
			this[wallIdx].displayingTemp = {val: false};
			this[wallIdx].displayingPInt = {val: false};
			this[wallIdx].displayingPExt = {val: false};
			this[wallIdx].displayingVol = {val: false};
			this[wallIdx].displayingWork = {val: false};
			this[wallIdx].displayingMass = {val: false};
			this[wallIdx].displayingQ = {val: false};
			this[wallIdx].displayingRMS = {val: false};
			this[wallIdx].q = 0;
			this[wallIdx].pIntLen = 35;
			this[wallIdx].eToAdd = 0;
			this[wallIdx].isothermal = false;
			this[wallIdx].tSet = tSet;
			this[wallIdx].massChunks = {};
			this[wallIdx].forceInternal = 0;
			this[wallIdx].pLastRecord = turn;
			this[wallIdx].mass = 0;
			this[wallIdx].parent = this;
			this[handle] = this[wallIdx];
			record = defaultTo(true, record);
			if(record){	
				this[wallIdx].recordDefaults();
			}
		},

		addWall: function(attrs){
			this.numWalls++;
			var newIdx = this.length;
			this.setWallVals(newIdx, attrs.pts, attrs.handle, attrs.bounds, attrs.include, attrs.vol, attrs.show, attrs.record, attrs.temp);
			this.setupWall(newIdx);
			this.setWallHandler(newIdx, attrs.handler);
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
		remove: function(){
			for(var wallIdx=this.length-1; wallIdx>=0; wallIdx-=1){
				this.removeWall(wallIdx);
			}
			//Hey - if I want to remove just one wall when multiple are present, will need to remove wallMove by wall, but I don't think that case will happen
			this.removed = true;
			emptyListener(curLevel, 'wallMove');
		},
		removeWall: function(wallInfo){
			this.numWalls-=1;
			this[wallInfo].recordAllStop();
			this[wallInfo].displayAllStop();
			if(this[wallInfo].bordered){
				this[wallInfo].removeBorder();
			}
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
			var spcsLocal = spcs;
			for (var spcName in spcsLocal){
				var spc = spcsLocal[spcName].dots;
				for (var dotIdx=0; dotIdx<spc.length; dotIdx++){
					var dot = spc[dotIdx];
					var checkedWalls = [];
					var gridX = Math.floor(dot.x/gridDim);
					var gridY = Math.floor(dot.y/gridDim);
					//HEY - DO TESTING TO FIGURE OUT IF SHOULD DEFINED Math.min(gridspot...) OR CALCULATE EACH TIME
					for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
						for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
							
							for (var wallIdx=0; wallIdx<this.length; wallIdx++){
								var gridSquare = this[wallIdx].wallGrids[x][y];

								for (var lineIdx=0; lineIdx<gridSquare.length; lineIdx++){
									var line = gridSquare[lineIdx];
									if (this.haveChecked([wallIdx, line], checkedWalls)===false){
										//add if hit, break out of this dot's loops
										this.checkWallHit(dot, [wallIdx, line]);
										checkedWalls.push([wallIdx, line]);
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
		////////////////////////////////////////////////////////////
		//WALL HIT HANDLER WRAPPERS
		////////////////////////////////////////////////////////////		
		didHitStd: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV) {
			var handler = this[wallIdx + '-' + subWallIdx];
			handler.func.apply(handler.obj, [dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);		
		},
		didHitArrow: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV) {
			var vo = dot.v.copy();
			var handler = this[wallIdx + '-' + subWallIdx];
			handler.func.apply(handler.obj, [dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);
			var pos = P(dot.x, dot.y);
			var vf = dot.v.copy();
			var perpVf = -perpUV.dotProd(dot.v);
			this.drawArrowV(pos, vo, vf, perpV, perpVf);  
		},
		didHitArrowSpd: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV) {
			var vo = dot.v.copy();
			var handler = this[wallIdx + '-' + subWallIdx];
			handler.func.apply(handler.obj, [dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);
			var pos = P(dot.x, dot.y);
			var vf = dot.v.copy();
			var perpVf = -perpUV.dotProd(dot.v);
			this.drawArrowSpd(pos, vo, vf, perpV, perpVf);  
		},
		didHitGravity: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV) {
			var handler = this[wallIdx + '-' + subWallIdx];
			if (wallUV.dx!=0) {
				var yo = dot.y;
				var dyo = dot.v.dy;
			}
			handler.func.apply(handler.obj, [dot, wallIdx, subWallIdx, wallUV, perpV, perpUV])
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
					//should not have gotten as far up as reflection over wall moved it     so dyFinal>0/
					//so basically I'm setting a new velocity (1e-7)and solving for the approptiate y
					dot.v.dy = -1.e-7;
					dot.y = (dot.v.dy*dot.v.dy - dyo*dyo)/(2*gInternal) + yo;
				}
			}
			
			
		},
		////////////////////////////////////////////////////////////
		//END
		////////////////////////////////////////////////////////////
		haveChecked: function(wall, list) {
			for (var listIdx=0; listIdx<list.length; listIdx++){
				if (list[listIdx][0]==wall[0] && list[listIdx][1]==wall[1]) {
					return true;
				}
			}
			return false;
		},
		
		//One wall, assuming first/last points do not overlap
		totalVolume: function(){
			var area=0;
			for (var wallIdx=0; wallIdx<this.length; wallIdx++){
				area+=this[wallIdx].include*this.wallArea(wallIdx);
			}
			return area*vConst;
		},
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
	
	
	},
//////////////////////////////////////////////////////////////////////////
//WALL
//////////////////////////////////////////////////////////////////////////
	wall: {
		reset: function(){
			var init = this.ptsInit;
			for (var ptIdx=0; ptIdx<init.length; ptIdx++){
				this[ptIdx].x = init[ptIdx].x;
				this[ptIdx].y = init[ptIdx].y;//Must copy by value to keep point object the same since things follow the points
			}
			this.forceInternal = 0;
			this.v = 0;
			this.parent.setupWall(this.parent.indexOf(this));
		},
		setVol: function(vol){
			var setY = this.volToY(vol)
			this[0].position({y:setY});
			this[1].position({y:setY});
		},
		volToY: function(vol) {
			var width = this[2].distTo(this[3]);
			var height = vol/(vConst*width);
			//WHAT IS THIS?
			var extendUV = this[2].VTo(this[3]).UV().perp('cw');
			return this[2].y - height;
		},



		changeSetPt: function(dest, compType, speed){
			if(compType.indexOf('isothermal')!=-1){
				var wallMoveMethod = 'cVIsothermal';
			} else if (compType.indexOf('adiabatic')!=-1){
				var wallMoveMethod = 'cVAdiabatic';
			}
			removeListener(curLevel, 'wallMove', 'cV' + this.handle);
			var setY = function(curY){
				this[0].y = curY;
				this[1].y = curY;
				this[this.length-1].y = curY;
			}
			var y = this[0].y
			var dist = dest-y;
			if (dist!=0) {
				var sign = getSign(dist);
				this.v = speed*sign;
				this.parent.setSubWallHandler(this.handle, 0, wallMoveMethod + compAdj);
				addListener(curLevel, 'wallMove', 'cV' + this.handle,
					function(){
						var y = this[0].y
						setY.apply(this, [boundedStep(y, dest, this.v)])
						this.parent.setupWall(this.handle);
						if(round(y,2)==round(dest,2)){
							removeListener(curLevel, 'wallMove', 'cV' + this.handle);
							this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
							this.v = 0;
						}
					},
				this);
			}		
		},
		releaseWithBounds: function(lowBound, highBound, handler, funcOnFinish) {
			this.moveStop();
			removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
			removeListener(curLevel, 'wallMove', 'cP' + this.handle);
			this.parent.setSubWallHandler(this.handle, 0, handler);
			lowBound = defaultTo(0, lowBound)
			highBound = defaultTo(Number.MAX_VALUE, highBound);
			var gLocal = g;
			var bounds = this.bounds;
			addListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle,
				function(){
					var lastY = this[0].y
					var nextY;
					var unboundedY = lastY + this.v + .5*gLocal;
					var dyWeight = null;
					if (unboundedY<lowBound || unboundedY>highBound) {
						this.moveStop();
						this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
						if (unboundedY<lowBound) {
							funcOnFinish(lowBound);
							nextY = lowBound;
						} else {
							funcOnFinish(highBound);
							nextY = highBound;
						}
					} else if(unboundedY>bounds.yMax || unboundedY<bounds.yMin) {
						nextY = this.hitBounds(lastY, gLocal, bounds.yMin, bounds.yMax);
					} else {
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
		moveInit: function(){
			var gLocal = g;
			var bounds = this.bounds;
			addListener(curLevel, 'wallMove', 'cP' + this.handle,
				function(){
					var lastY = this[0].y
					var nextY;
					var unboundedY = lastY + this.v + .5*gLocal;
					var dyWeight = null;
					if(unboundedY>bounds.yMax || unboundedY<bounds.yMin){
						nextY = this.hitBounds(lastY, gLocal, bounds.yMin, bounds.yMax);
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
			this.v = 0;
			removeListener(curLevel, 'wallMove', 'cP' + this.handle);
			removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
		},
		hitBounds: function(lastY, gLocal, yMin, yMax){
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

		setHitMode: function(inputMode){
			this.hitMode = inputMode;
		},
		setDefaultReadout: function(readout){
			this.defaultReadout = readout;
			return this;
		},
		unsetDefaultReadout: function(){
			this.defaultReadout = undefined;
			return this;
		},
		setTemp: function(temp){
			this.tSet = temp;
		},
		isothermalInit: function(){
			this.eToAdd = 0;
			if(this.parent.numWalls>1){
				var countFunc = dataHandler.countFunc({tag:this.handle})
			}else{
				var countFunc = dataHandler.countFunc();
			}		
			if(!this.isothermal){
				addListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle,
					function(){
						var tLast = defaultTo(this.tSet, this.data.t[this.data.t.length-1]);
						var dt = this.tSet - tLast;
						this.eToAdd = cv*countFunc()*dt/N;
					},
				this);
			}
			for (var lineIdx=0; lineIdx<this.length; lineIdx++){
				this[lineIdx].isothermal = true;
			}
			this.isothermal = true;
		
		},
		isothermalStop: function(){
			this.isothermal = false;
			removeListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle);
		},
		pExt: function(){
			var SA = this[1].x - this[0].x;
			return this.pConst*this.mass*this.g/SA;
		},
		pInt: function(){
			var SA = this.surfArea();
			var pInt = this.pConst*this.forceInternal/((turn-this.pLastRecord)*SA);
			this.forceInternal = 0;
			this.pLastRecord = turn;
			this.pIntList[this.pIntIdx] = pInt;
			this.pIntIdx++;
			if (this.pIntIdx==this.pIntLen) {
				this.pIntIdx=0;
			}
			return this.pIntList.average();
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
		updateMass: function() {
			var totalMass = 0;
			for (var chunkName in this.massChunks){
				totalMass+=this.massChunks[chunkName];
			}
			this.mass = totalMass;			
		},
		setMass: function(chunkName, value){
			this.massChunks[chunkName] = value;
			this.updateMass();
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
			this.updateMass();
			return this;
		},

	
		border: function(wallPts, thickness, col, ptAdjusts){
			this.bordered = true;
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
			this.bordered = false;
			removeListener(curLevel, 'update', 'drawBorder' + this.handle);
		},
		
		recordDefaults: function(){
			this.recordTemp();
			this.recordPInt();
			this.recordVol();
			this.recordQ();
		},
		recordTemp: function() {
			this.recordingTemp.val = true;
			//if (this.parent.numWalls>1) {
				var tempFunc = dataHandler.tempFunc({tag:this.handle})
			//}else{
			//	var tempFunc = dataHandler.tempFunc();
			//}		
			recordData('t' + this.handle, this.data.t, tempFunc, this, 'update');
			return this;
		},
		recordRMS: function() {
			if (this.recordingTemp.val) {
				this.recordingRMS.val = true;
				//HEY - I AM ASSUMING THAT IF YOU GET RMS, IT IS OF ONE TYPE OF MOLECULE
				if (this.parent.numWalls>1) {
					var tag = this.handle;
				} else {
					tag = undefined;
				}			
				var mass = this.getRMSMass(tag);
				var RMSFunc = function() {
					var temp = this.data.t[this.data.t.length-1];
					return Math.sqrt(3000*KB*temp*ACTUALN/mass)
				}
				recordData('RMS' + this.handle, this.data.RMS, RMSFunc, this, 'update');
			} else {
				console.log('Tried to record RMS of wall ' + this.handle + ' while not recording temp.  Will not record.');
			}
			return this;
		},
		getRMSMass: function(tag) {
			if (tag) {
				for (var spc in spcs) {
					var dots = spcs[spc].dots;
					for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
						if (tag) {
							if (dots[dotIdx].tag == tag) {
								return dots[dotIdx].m;
							}
						} else {
							return dots[dotIdx].m;
						}
					}
				}
			}
		},
		recordPInt: function() {
			this.recordingPInt.val = true;
			this.pIntList = new Array();
			this.pIntIdx = 0;
			recordData('pInt' + this.handle, this.data.pInt, this.pInt, this, 'update');
			return this;
		},
		recordPExt: function() {
			this.recordingPExt.val = true;
			recordData('pExt' + this.handle, this.data.pExt, this.pExt, this, 'update');
			return this;
		},
		recordVol: function() {
			this.recordingVol.val = true;
			recordData('v' + this.handle, this.data.v, function(){return this.parent.wallVolume(this.handle)}, this, 'update');
			return this;
		},
		recordWork: function() {
			if (!this.recordingWork.val) {
				this.recordingWork.val = true;
				this.work = 0;
				var LTOM3LOCAL = LtoM3;
				var PCONSTLOCAL = pConst;
				var PUNITTOPALOCAL = PUNITTOPA;
				var VCONSTLOCAL = vConst;
				var JTOKJLOCAL = JtoKJ;
				var trackPt = this[0];
				var width = this[1].x-this[0].x;
				var heightLast = trackPt.y;
				//Attention - at some point, employ some trickyness to first add a listener for first turn that records zero, then add real listener that uses func below. 
				//this will work after first turn since volume is _always_ recorded before work (vol is added as default to wall, work is added later by objects)
				var self = this;
				
				var calcWork = function() {
					var len = self.data.v.length;
					var dV = LTOM3LOCAL*(self.data.v[len-1] - self.data.v[len-2])
					if (dV != undefined) {
						var p = self.pExt()*PUNITTOPALOCAL;
						self.work -= JTOKJLOCAL*p*dV;
						heightLast = trackPt.y;
						return self.work;
					} else {
						self.work = 0;
						return 0;
					}
				}

				recordData('work' + this.handle, this.data.work, calcWork, this, 'update');
			}
			return this;
		},
		recordMass: function() {
			if (!this.recordingMass.val) {
				this.recordingMass.val = true;
				recordData('mass' + this.handle, this.data.m, function(){return this.mass}, this, 'update');	
			}
			return this;			
		},
		recordQ: function() {
			if (!this.recordingQ.val) {
				this.recordingQ.val = true;
				recordData('q' + this.handle, this.data.q, function(){return this.q}, this, 'update');
			}
			return this;
		},
		recordStop: function(isRecording, str) {
			isRecording.val = false;
			recordDataStop(str + this.handle);
		},
		//if I want to generalize stop *and* use the closure compiler, need to make isRecording object
		recordAllStop: function(){
			if(this.recordingTemp.val){this.recordStop(this.recordingTemp, 't');};
			if(this.recordingPInt.val){this.recordStop(this.recordingPInt, 'pInt');};
			if(this.recordingPExt.val){this.recordStop(this.recordingPExt, 'pExt');};
			if(this.recordingVol.val){this.recordStop(this.recordingVol, 'v');};
			if(this.recordingWork.val){this.recordStop(this.recordingWork, 'work');};
			if(this.recordingMass.val){this.recordStop(this.recordingMass, 'mass');};
			if(this.recordingQ.val){this.recordStop(this.recordingQ, 'q');};
			if(this.recordingRMS.val){this.recordStop(this.recordingRMS, 'RMS');};
			return this;
		},	
		resetWork: function(){
			this.work = 0;
			return this;
		},
		resetQ: function(){
			this.q = 0;
			return this;
		},
		//HEY - YOU SHOULD _PROBABLY_ MAKE A FUNCTION THAT DOES THESE DISPLAY THINGS GIVEN SOME INPUTS.  I MEAN, THIS IS A LOT OF NEARLY IDENTICAL CODE
		displayWork: function(readoutHandle, label, decPlaces) {
			if (this.recordingWork.val && !this.displayingWork.val) {
				this.displayingWork.val = true;
				decPlaces = defaultTo(1, decPlaces);
				var dataSet = this.data.work;
				label = defaultTo('Work:', label);
				this.workReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.workReadout.addEntry('work' + this.handle, label, 'kJ', firstVal, undefined, decPlaces);
				addListener(curLevel, 'update', 'displayWork' + this.handle,
					function(){
						this.workReadout.hardUpdate('work' + this.handle, dataSet[dataSet.length-1]);
					},
				this);	
				this.addCleanUpIfPrompt('displayWork', this.displayWorkStop);
			} else {
				console.log('Tried to display work of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;
		},
		displayTemp: function(readoutHandle, label, decPlaces, smooth){
			if (this.recordingTemp.val && !this.displayingTemp.val) {
				this.displayingTemp.val = true;
				decPlaces = defaultTo(0, decPlaces);
				var dataSet = this.data.t;
				label = defaultTo('Temp:', label);
				this.tempReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if (!validNumber(firstVal)) {
					firstVal = 0;
				}
				this.tempReadout.addEntry('temp' + this.handle, label, 'K', firstVal, undefined, decPlaces);
				if (!smooth) {
					addListener(curLevel, 'update', 'displayTemp' + this.handle,
						function() {
							this.tempReadout.hardUpdate('temp' + this.handle, dataSet[dataSet.length-1]);
						},
					this);	
				} else {
					addListener(curLevel, 'update', 'displayTemp' + this.handle,
						function() {
							var sum = 0;
							for (var tempIdx=dataSet.length-5; tempIdx<dataSet.length; tempIdx++) {
								sum += dataSet[tempIdx];
							}
							this.tempReadout.hardUpdate('temp' + this.handle, sum*=.2);
						},
					this);
				}
				this.addCleanUpIfPrompt('displayTemp', this.displayTempStop);
			}else{
				console.log('Tried to display temp of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;
		},
		displayTempSmooth: function(readoutHandle, label, decPlaces) {
			return this.displayTemp(readoutHandle, label, decPlaces, true);
		},
		displayPInt: function(readoutHandle, label, decPlaces){
			if(this.recordingPInt.val && !this.displayingPInt.val){
				this.displayingPInt.val = true;
				decPlaces = defaultTo(1, decPlaces);
				var dataSet = this.data.pInt;
				label = defaultTo('Pint:', label);
				this.pIntReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if (!validNumber(firstVal)) {
					firstVal = 0;
				}
				this.pIntReadout.addEntry('pInt' + this.handle, label, 'bar', firstVal, undefined, decPlaces);
				addListener(curLevel, 'update', 'displayPInt'+this.handle,
					function(){
						this.pIntReadout.hardUpdate('pInt' + this.handle, dataSet[dataSet.length-1]);
					},
				this);
				this.addCleanUpIfPrompt('displayPInt', this.displayPIntStop);
			}else{
				console.log('Tried to display pInt of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;
		},
		displayPExt: function(readoutHandle, label, decPlaces){
			if(this.recordingPExt.val && !this.displayingPExt.val){
				this.displayingPExt.val = true;
				decPlaces = defaultTo(1, decPlaces);
				var dataSet = this.data.pExt;
				label = defaultTo('Pext:', label);
				this.pExtReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.pExtReadout.addEntry('pExt' + this.handle, label, 'bar', firstVal, undefined, decPlaces);
				var lastVal = 0;
				addListener(curLevel, 'update', 'displayPExt'+this.handle,
					function(){
						var curVal = dataSet[dataSet.length-1];
						if(curVal!=lastVal){
							this.pExtReadout.tick('pExt' + this.handle, curVal);
							lastVal = curVal;
						}
						
					},
				this);
				this.addCleanUpIfPrompt('displayPExt', this.displayPExtStop);
			}else{//OR ALREADY DISPLAYING - MAKE ERROR MESSAGES FOR TRYING TO DISPLAY WHILE ALREADY DISPLAYING
				console.log('Tried to display pExt of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;
		},
		displayVol: function(readoutHandle, label, decPlaces){
			if(this.recordingVol.val && !this.displayingVol.val){
				this.displayingVol.val = true;
				decPlaces = defaultTo(1, decPlaces);
				var dataSet = this.data.v;
				label = defaultTo('Volume:', label);
				this.volReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.volReadout.addEntry('vol' + this.handle, label, 'L', firstVal, undefined, decPlaces);
				addListener(curLevel, 'update', 'displayVolume' + this.handle,
					function(){
						this.volReadout.hardUpdate('vol' + this.handle, dataSet[dataSet.length-1]);
					},
				this);
				this.addCleanUpIfPrompt('displayVol', this.displayVolStop);
			}else{
				console.log('Tried to display volume of wall ' + this.handle + ' while not recording.  Will not display.');			
			}
			return this;
		},
		displayMass: function(readoutHandle, label, decPlaces){
			if(this.recordingMass.val && !this.displayingMass.val){
				this.displayingMass.val = true;
				decPlaces = defaultTo(0, decPlaces);
				var dataSet = this.data.m;
				label = defaultTo('Mass:', label);
				this.massReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.massReadout.addEntry('mass' + this.handle, label, 'kg', firstVal, undefined, decPlaces);
				var lastVal = 0;
				addListener(curLevel, 'update', 'displayMass' + this.handle,
					function(){
						var curVal = dataSet[dataSet.length-1];
						if(curVal!=lastVal){
							this.massReadout.hardUpdate('mass' + this.handle, curVal);
							lastVal = curVal;
						}
					},
				this);
				this.addCleanUpIfPrompt('displayMass', this.displayMassStop);
			}else{
				console.log('Tried to display mass of wall ' + this.handle + ' while not recording.  Will not display.');			
			}
			return this;			
		},
		displayQ: function(readoutHandle, label, decPlaces){
			if (this.recordingQ.val && !this.displayingQ.val) {
				this.displayingQ.val = true;
				decPlaces = defaultTo(1, decPlaces);
				var dataSet = this.data.q;
				label = defaultTo('Q:', label);
				this.qReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.qReadout.addEntry('q' + this.handle, label, 'kJ', firstVal, undefined, decPlaces);
				var lastVal = 0;
				addListener(curLevel, 'update', 'displayQ'+this.handle,
					function(){
						var curVal = dataSet[dataSet.length-1];
						if(curVal!=lastVal){
							this.qReadout.hardUpdate('q' + this.handle, curVal);
							lastVal = curVal;
						}
						
					},
				this);
				this.addCleanUpIfPrompt('displayQ', this.displayQStop);

			}else{
				console.log('Tried to display q of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;
		},
		displayRMS: function(readoutHandle, label, decPlaces) {
			if(this.recordingRMS.val && !this.displayingRMS.val){
				this.displayingRMS.val = true;
				var decPlaces = defaultTo(0, decPlaces);
				var dataSet = this.data.RMS;
				label = defaultTo('RMS:', label);
				this.RMSReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
				var firstVal = dataSet[dataSet.length-1];
				if(!validNumber(firstVal)){
					firstVal = 0;
				}
				this.RMSReadout.addEntry('RMS' + this.handle, label, 'm/s', firstVal, undefined, decPlaces);
				addListener(curLevel, 'data', 'displayRMS' + this.handle,
					function(){
						this.RMSReadout.tick('RMS' + this.handle, dataSet[dataSet.length-1]);
					},
				this);	
				this.addCleanUpIfPrompt('displayRMS', this.displayRMSStop);
			}else{
				console.log('Tried to display RMS of wall ' + this.handle + ' while not recording.  Will not display.');
			}
			return this;		
		
		},
		displayQArrowsRate: function(threshold){
			if (this.recordingQ.val && !this.displayingQArrowsRate.val && !this.displayingQArrowsAmmt.val) {
				this.displayingQArrowsRate.val = true;
				this.idxLastArrow = Math.max(0, this.data.q.length-1);
				this.qArrowThreshold = defaultTo(threshold, .3);
				addListener(curLevel, 'update', 'checkForDisplayArrows' + this.handle, this.checkDisplayArrows, this);
			} else {
				console.log('Tried to display q arrowsRate for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
				console.trace();
			}
		},
		displayQArrowsAmmt: function(qMax) {
			if (this.recordingQ.val && !this.displayingQArrowsRate.val && !this.displayingQArrowsAmmt.val) {
				this.displayingQArrowsAmmt.val = true;
				this.qArrowsAmmtInit(defaultTo(3, qMax));
			} else {
				console.log('Tried to display q arrowsAmmt for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
				console.trace();	
				
			}
		},
		addCleanUpIfPrompt: function(displayType, func) {
			if (currentSetupType.indexOf('prompt') != -1) {
				addListener(curLevel, currentSetupType + 'CleanUp', displayType + this.handle, func, this);
			}			
		},
		displayVolStop: function(){
			this.displayingVol = false;
			this.volReadout.removeEntry('vol' + this.handle);
			removeListener(curLevel, 'update', 'displayVolume' + this.handle);
			return this;
		},
		displayPIntStop: function(){
			this.displayingPInt = false;
			removeListener(curLevel, 'data', 'displayPInt'+this.handle);
			this.pIntReadout.removeEntry('pInt' + this.handle);
			return this;
		},
		displayPExtStop: function(){
			this.displayingPExt = false;
			removeListener(curLevel, 'update', 'displayPExt'+this.handle);
			this.pExtReadout.removeEntry('pExt' + this.handle);
			return this;
		},
		displayWorkStop: function(){
			this.displayingWork = false;
			this.workReadout.removeEntry('work' + this.handle);
			removeListener(curLevel, 'update', 'displayWork'+this.handle);
			return this;
		},
		displayTempStop: function(){
			this.displayingTemp = false;
			removeListener(curLevel, 'update', 'displayTemp' + this.handle)
			this.tempReadout.removeEntry('temp' + this.handle);
			return this;
		},
		displayMassStop: function(){
			this.displayingMass = false;
			removeListener(curLevel, 'data', 'displayMass' + this.handle)
			this.massReadout.removeEntry('mass' + this.handle);	
			return this;			
		},
		displayQStop: function(){
			this.displayingQ = false;
			removeListener(curLevel, 'data', 'displayQ' + this.handle);
			this.qReadout.removeEntry('q' + this.handle);
			return this;
		},
		displayQArrowsRateStop: function(){
			this.displayingQArrowsRate = false;
			removeListener(curLevel, 'update', 'checkDisplayArrows' + this.handle);
			removeListenerByName(curLevel, 'update', 'ArrowFly');
			return this;
		},
		displayQArrowsAmmtStop: function() {
			this.displayingQArrowsAmmt = false;
			for (var arrowIdx=0; arrowIdx<this.qArrowsAmmt.length; arrowIdx++) {
				this.qArrowsAmmt[arrowIdx].remove();
			}
			removeListener(curLevel, 'update', this.handle + 'updateQAmmtArrows');
		},
		displayRMSStop: function(){
			this.displayingRMS = false;
			removeListener(curLevel, 'data', 'displayRMS' + this.handle)
			this.RMSReadout.removeEntry('RMS' + this.handle);
			return this;
		},

		displayAllStop: function(){
			if(this.displayingVol){this.displayVolStop();};
			if(this.displayingPInt){this.displayPIntStop();};
			if(this.displayingPExt){this.displayPExtStop();};
			if(this.displayingWork){this.displayWorkStop();};
			if(this.displayingTemp){this.displayTempStop();};
			if(this.displayingMass){this.displayMassStop();};
			if(this.displayingQ){this.displayQStop();};
			if(this.displayingQArrowsRate){this.displayQArrowsRateStop();};
			if(this.displayingQArrowAmmt){this.displayQArrowsAmmtStop();};
			if(this.displayingRMS){this.displayRMSStop();};
			return this;
		},
		resetQ: function() {
			this.q = 0;
			if (this.displayingQArrowsAmmt) {
				this.displayQArrowsAmmtStop();
				this.displayQArrowsAmmt(this.qArrowAmmtMax);
			}
		},
		resetWork: function() {
			this.work = 0;
		},
		qArrowsAmmtInit: function(qMax) {
			this.qArrowAmmtMax = qMax;
			var lengthMin = 15;
			var lengthMax = 80;
			var widthMin = 70
			var widthMax = 90;
			var col = Col(175, 0, 0);
			var width = 40;
			var fracFromEdge = .25;
			var startingDims = V(30, 10);
			var pos1 = this[3].copy().fracMoveTo(this[2], fracFromEdge);
			var pos2 = this[3].copy().fracMoveTo(this[2], 1-fracFromEdge);
			var UV = pos2.VTo(pos1).perp('cw').UV();
			pos1.movePt(UV.copy().mult(5));
			pos2.movePt(UV.copy().mult(5));
			var arrow1 = new ArrowStatic({pos:pos1, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});
			var arrow2 = new ArrowStatic({pos:pos2, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});

			var redrawThreshold = qMax/(lengthMax-lengthMin);
			this.qArrowsAmmt = [arrow1, arrow2];
			var dirLast = 'out';
			qLast = this.q;
			this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
			if (this.q>=0) {
				dirLast = 'in';
				this.flipAmmtArrows(this.qArrowsAmmt);
			}
			addListener(curLevel, 'update', this.handle + 'updateQAmmtArrows', 
				function() {
					if (Math.abs(this.q - qLast) > redrawThreshold) {
						if (this.q<0) {
							dir = 'out';
						} else {
							dir = 'in';
						}
						this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
						if (dirLast != dir) {
							this.flipAmmtArrows(this.qArrowsAmmt);
							dirLast = dir;
						}
						qLast = this.q;
					}
				},
			this);
		},
		flipAmmtArrows: function(arrows) {
			for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
				var arrow = arrows[arrowIdx];
				var UV = angleToUV(arrow.getAngle()).mult(1);
				arrow.move(UV.mult(arrow.getDims().dx));
				arrow.rotate(Math.PI);
			}
		},
		setAmmtArrowDims: function(arrows, lMin, lMax, wMin, wMax, q, qMax) {
			for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
				var arrow = arrows[arrowIdx];
				var dimso = arrow.getDims();
				var percent = Math.abs(this.q)/qMax;
				var l = lMin + (lMax-lMin)*percent;
				var w = wMin + (wMax-wMin)*percent;
				arrow.size(V(l, w));
				if (q>0) {
					arrow.move(V(0, l-dimso.dx));
				}
			}
		},
		checkDisplayArrows: function(){
			var dQ = this.data.q[this.data.q.length-1] - this.data.q[this.idxLastArrow];
			if (Math.abs(dQ)>this.qArrowThreshold) {
				this.populateArrows(dQ);
				this.idxLastArrow = turn;
			}
		},
		populateArrows: function(dQ){
			var rotations = {'-1':'cw', '1':'ccw'};
			var dist = 30;
			var fill = this.parent.qArrowFill;
			var fillFinal = this.parent.qArrowFillFinal;
			var stroke = this.parent.qArrowStroke;
			var qList = this.data.q;
			var heatTransSign = getSign(dQ);
			var UVRot = rotations[heatTransSign];
			this.idxLastArrow = this.data.q.length-1;
			var dims = V(110*Math.abs(dQ), 170*Math.abs(dQ));//big numbers from adjusting to q per turn so if I change interval, size of arrows doesn't change
			var dimsFinal = dims.copy();
			dimsFinal.dx *= 1.4;
			dimsFinal.dy *= .85;
			var offset = {'-1':0, '1':-dimsFinal.dx-dist};
			if (dims.dx>7 || dims.dy>7) {
				for (var lineIdx=0; lineIdx<this.length-1; lineIdx++) {
					if (this[lineIdx].isothermal) {
						var len = this[lineIdx].distTo(this[lineIdx+1]);
						var numArrows = Math.round(len/150);
						var pxStep = len/(numArrows+1);
						var distAlongLine = pxStep;
						for (var arrowIdx=0; arrowIdx<numArrows; arrowIdx++){
							var pos = this[lineIdx].copy().movePt(this.wallUVs[lineIdx].copy().mult(distAlongLine)).movePt(this.wallPerpUVs[lineIdx].copy().mult(offset[heatTransSign]));
							new ArrowFly({pos:pos, 
											dist:dist, 
											UV:this.wallUVs[lineIdx].copy().perp(UVRot), 
											fill:fill, 
											fillFinal:fillFinal, 
											stroke:stroke,
											dims:dims,
											dimsFinal:dimsFinal,
											lifespan:3500
										});
							distAlongLine += pxStep;
						}	
					}
				}
			}
			 
		}
		
	},
//////////////////////////////////////////////////////////////////////////
//COLLIDE METHODS
//////////////////////////////////////////////////////////////////////////
	collideMethods:{
	//32 denotes converting from cv of R to 3/2 R
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
			var m2 = wall.mass;
			var absWallV = Math.abs(vo2);
			
			if (absWallV > 1) {
				var vo1Sqr = vo1*vo1;
				var vo2Sqr = vo2*vo2;
				//var scalar = Math.pow(Math.abs(vo2)+.1, .2);
				var scalar = .0017*absWallV*absWallV*absWallV - .0281*absWallV*absWallV + .205*absWallV + .8466;
				//polynomial fit to above function for fasterness.
				var scalarSqr = scalar*scalar;
				
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
		cPAdiabaticDamped32: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var KEo = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var wall = this[wallIdx];
			var vo = dot.v.copy();
			var vo1 = dot.v.dy;
			var vo2 = wall.v;
			var m1 = dot.m;
			var m2 = wall.mass;
			var absWallV = Math.abs(vo2);
			
			if (absWallV > 1) {
				var vo1Sqr = vo1*vo1;
				var vo2Sqr = vo2*vo2;
				//var scalar = Math.pow(Math.abs(vo2)+.1, .2);
				var scalar = .0017*absWallV*absWallV*absWallV - .0281*absWallV*absWallV + .205*absWallV + .8466;
				//polynomial fit to above function for fasterness.
				var scalarSqr = scalar*scalar;
				
				var a = m1*(1 + m1/(scalarSqr*m2));
				var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
				var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
				
				dot.v.dy = (-b + Math.sqrt(b*b - 4*a*c))/(2*a);
				dot.y = dot.y+dot.r;
				wall.v = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
			} else {
				var pt = walls[wallIdx][subWallIdx];
				dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
				wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
				dot.y = pt.y+dot.r;			
			}
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
			var KEf = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var ratio = Math.sqrt((KEo + 2*(KEf - KEo)/3)/KEf);
			dot.v.dx*=ratio;
			dot.v.dy*=ratio;
		},	
		cPAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var wall = this[wallIdx];
			var vo = dot.v.copy();
			var vo1 = dot.v.dy;
			var vo2 = wall.v;
			var m1 = dot.m;
			var m2 = wall.mass;	
			var pt = wall[subWallIdx];
			dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;		
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
		},
		cPAdiabatic32: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var KEo = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var wall = this[wallIdx];
			var vo = dot.v.copy();
			var vo1 = dot.v.dy;
			var vo2 = wall.v;
			var m1 = dot.m;
			var m2 = wall.mass;
			var pt = wall[subWallIdx];
			dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;		
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
			var KEf = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var ratio = Math.sqrt((KEo + 2*(KEf - KEo)/3)/KEf);
			dot.v.dx*=ratio;
			dot.v.dy*=ratio;
		},
		staticAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			this.reflect(dot, wallUV, perpV);
			this[wallIdx].forceInternal += 2*dot.m*Math.abs(perpV);
		},
		cVIsothermal: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var eAddSign = getSign(this[wallIdx].eToAdd);
			var inTemp = dot.temp();
			var eToAddMax = eAddSign*Math.min(1, eAddSign*this[wallIdx].eToAdd);
			var eToAdd = eAddSign*Math.min(eAddSign*eToAddMax, cv*(inTemp-Math.min(inTemp, 20))/N);
			this[wallIdx].eToAdd-=eToAdd;
			var outTemp = inTemp + eToAdd*N/cv;
			var spdRatio = Math.sqrt(outTemp/inTemp);
			var outPerpV = perpV*spdRatio;
			this.reflect(dot, wallUV, perpV);
			dot.v.dx*=spdRatio;
			dot.v.dy*=spdRatio;
			this[wallIdx].forceInternal += dot.m*(Math.abs(perpV) + Math.abs(outPerpV));
			this[wallIdx].q += eToAdd*JtoKJ;
		},
		//cVIsothermal32 defined in init function
		cVAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var v = dot.v;
			v.dy = -v.dy + 2*walls[wallIdx].v;
			this[wallIdx].forceInternal += dot.m*(perpV + v.dy);
		},
		cVAdiabatic32: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
			var KEo = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var v = dot.v;
			v.dy = -v.dy + 2*walls[wallIdx].v;
			this[wallIdx].forceInternal += dot.m*(perpV + v.dy);
			var KEf = .5*dot.m*(dot.v.dx*dot.v.dx + dot.v.dy*dot.v.dy);
			var ratio = Math.sqrt((KEo + 2*(KEf - KEo)/3)/KEf);
			dot.v.dx*=ratio;
			dot.v.dy*=ratio;
		},
		reflect: function(dot, wallUV, perpV){
			dot.v.dx -= 2*wallUV.dy*perpV;
			dot.v.dy += 2*wallUV.dx*perpV;
			dot.x -= wallUV.dy
			dot.y += wallUV.dx
		}
		/*
		reflectChangeSpd: function(dot, wallUV, perpVIn, perpVOut){
			dot.v.dx -= wallUV.dy*perpVIn + wallUV.dy*perpVOut;
			dot.v.dy += wallUV.dx*perpVIn + wallUV.dx*perpVOut;
			dot.x -= wallUV.dy
			dot.y += wallUV.dx		
		},
		*/
	}
}