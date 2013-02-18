function CollideHandler(){
	this.spcs = spcs;
	this.defs = speciesDefs;
	this.tConst = tConst;
	this.cp = cp;
	this.cv = cv;
	this.rxns = {};
	this.setDefaultHandler({func:this.impactStd, obj:this});
	this.dotManager = dotManager;
	//console.log("Made supercollider");
}
_.extend(CollideHandler.prototype, ReactionHandler, toInherit.gridder, {
	setDefaultHandler: function(handler){
		var numSpcs = this.getNumSpcs();
		for (var i=0; i<numSpcs; i++){
			for (var j=i; j<numSpcs; j++){
				this[i + '-' + j] = handler; //has func and obj
				this.rxns[i + '-' + j] = [];
			}
		}
	
	},
	setHandler: function(aName, bName, handler){
		var idStr = this.getIdStr(this.defs[aName], this.defs[bName]);
		if (this.isIdStr(idStr)) {
			this[idStr] = handler;
		} else {
			console.log('bad spc names ' + aName + ' ' + bName);
		}
	},
	setHandleByIdStr: function(idStr, handler) {
		if (this.isIdStr(idStr)) {
			this[idStr] = handler;
		} else {
			console.log('bad id string ' + idStr);
		}
	},
	isIdStr: function(idStr) {
		return /^[0-9]+\-[0-9]+$/.test(idStr)
	},
	getNumSpcs: function(){
		var numSpcs = 0;
		for (var spcName in speciesDefs){
			numSpcs++;
		}
		return numSpcs;
	},
	check: function(){
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		this.grid = this.makeGrid();
		var grid = this.grid;

		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		var dots = dotManager.lists.ALLDOTS;
		
		for (var dotIdx=dots.length - 1; dotIdx>-1; dotIdx--) {
	
			var dot = dots[dotIdx];
			var gridX = Math.floor(dot.x/gridSize);
			var gridY = Math.floor(dot.y/gridSize);
			var doAdd = true;
			//hey - define x & y mins so I don't have to call each time?
			//In optimizing, DO NOT define min and max locally.  It slows things down a lot.
			gridLoop:
				for (var x=Math.max(gridX-1, 0), xCeil=Math.min(gridX+1, xSpan)+1; x<xCeil; x++){
					for (var y=Math.max(gridY-1, 0), yCeil=Math.min(gridY+1, ySpan)+1; y<yCeil; y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx--){
							var neighbor = grid[x][y][neighborIdx];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							if (dx*dx+dy*dy<=(dot.r+neighbor.r)*(dot.r+neighbor.r)) {
								var handler = this[Math.min(dot.idNum, neighbor.idNum) + '-' + Math.max(dot.idNum, neighbor.idNum)];
								var UVAB = V(neighbor.x-dot.x, neighbor.y-dot.y).UV();
								//YO YO - TRY INLINING ALL  OF THESE FUNCTIONS (THE VECTOR MATH) AND SEE IF IT MAKES IT FASTER.  
								if (handler.func.apply(handler.obj, [dot, neighbor, UVAB, dot.v.dotProd(UVAB), neighbor.v.dotProd(UVAB)])===false) {
									doAdd = false;
									grid[x][y].splice(neighborIdx, 1);
									break gridLoop;
								}
							}
						}
					}
				}
				
			if (gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows) {
				doAdd && grid[gridX][gridY].push(dot);
			} else {
				returnEscapist(dot);
				console.log("ball out of bounds");		
			}
		}
		
	},
	impactStd: function(a, b, UVAB, perpAB, perpBA){
		var perpABRes = (perpAB*(a.m-b.m)+2*b.m*perpBA)/(a.m+b.m);
		var perpBARes = (perpBA*(b.m-a.m)+2*a.m*perpAB)/(a.m+b.m);
		a.v.dx += UVAB.dx*(perpABRes-perpAB);
		a.v.dy += UVAB.dy*(perpABRes-perpAB);
		b.v.dx += UVAB.dx*(perpBARes-perpBA);
		b.v.dy += UVAB.dy*(perpBARes-perpBA);
		this.breakUp(a, b, UVAB);
		return true;
	},
	//HEY - TEST INLINING breakUp in impactStd - I mean, of course it's icky, but it's faster and who looks or works here anyway?
	breakUp: function(a, b, UVAB){
		var sumR = a.r+b.r;
		var aXNew = b.x - UVAB.dx*sumR;
		var aYNew = b.y - UVAB.dy*sumR;
		var bXNew = a.x + UVAB.dx*sumR;
		var bYNew = a.y + UVAB.dy*sumR;
		a.x = aXNew;
		a.y = aYNew;
		b.x = bXNew;
		b.y = bYNew;
	},
	setup: function(){
		this.gridSize = 2*this.getMaxR();
		this.numCols = Math.ceil(myCanvas.width/this.gridSize+1);
		this.numRows = Math.ceil(myCanvas.height/this.gridSize+1);
		this.xSpan = Math.floor(myCanvas.width/this.gridSize);
		this.ySpan = Math.floor(myCanvas.height/this.gridSize);
	},

	getMaxR: function(){
		var maxR = 0;
		for (var spcName in spcs){
			var spc = spcs[spcName];
			maxR = Math.max(maxR, spc.r);
		}
		return maxR;	
	},
}
)