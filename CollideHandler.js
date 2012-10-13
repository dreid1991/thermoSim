function CollideHandler(){
	this.spcs = spcs;
	this.defs = speciesDefs;
	this.tConst = tConst;
	this.cp = cp;
	this.cv = cv;
	this.rxns = {};
	this.setDefaultHandler({func:this.impactStd, obj:this});
	this.dotManager = dotManager;
	console.log("Made supercollider");
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
		var idA = speciesDefs[aName].idNum;
		var idB = speciesDefs[bName].idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		this[min + '-' + max] = handler;
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
		var spcLens = {};
		for (var spcName in this.spcs) {
			spcLens[spcName] = this.spcs[spcName].dots.length;
		};
		//predetermining lengths to prevent rxn prods from reacting again on same turn.  Could make things slow
		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		for (var spcName in this.spcs){
			var dots = this.spcs[spcName].dots;
			for (var dotIdx=spcLens[spcName]-1; dotIdx>=0; dotIdx--) {
				var dot = dots[dotIdx];
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				var doAdd = true;
				//hey - define x & y mins so I don't have to call each time?
				gridLoop:
					for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
						for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
							for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
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
					if (doAdd) {
						grid[gridX][gridY].push(dot);
					}
				} else {
					returnEscapist(dot);
					console.log("ball out of bounds");		
				}
				/*
				if (doAdd && gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows) {
					grid[gridX][gridY].push(dot);
				}
				*/
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