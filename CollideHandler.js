function CollideHandler(){
	console.log("Made supercollider");
	this.handlers = {};
}
CollideHandler.prototype = {
	setDefaultHandler: function(handler){
		var numSpcs = 0;
		for (var spcName in speciesDefs){
			numSpcs++;
		}
		for (var i=0; i<numSpcs; i++){
			for (var j=i; j<numSpcs; j++){
				this.handlers[i + '-' + j] = handler; //has func and obj
			}
		}
	
	},
	setHandler: function(aName, bName, handler){
		var idA = speciesDefs[aName].idNum;
		var idB = speciesDefs[bName].idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		this.handlers[min + '-' + max] = handler;
	},
	check: function(){
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		var grid = this.makeGrid();
		for (var spcName in spcs){
			var spc = spcs[spcName];
			for (var dotIdx=0; dotIdx<spc.length; dotIdx++){
				var dot = spc[dotIdx];
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=0; neighborIdx<grid[x][y].length; neighborIdx++){
							var neighbor = grid[x][y][neighborIdx];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							var distSqr = dx*dx+dy*dy;
							var rSqr = (dot.r+neighbor.r)*(dot.r+neighbor.r);
							if(distSqr<=rSqr){
								var min = Math.min(dot.idNum, neighbor.idNum);
								var max = Math.max(dot.idNum, neighbor.idNum);
								var refStr = min + '-' + max;
								var handler = this.handlers[refStr];
								handler.func.apply(handler.obj, [dot, neighbor]);
							}
						}
					}
				}//OOH - do ORs instead so it doesn't have to check all if out of bounds
				if(gridX>=0 && gridY>=0 && gridX<grid.length && gridY<grid[0].length){
					grid[gridX][gridY].push(dot);
				}
				
			}
		}
	},
	impactStd: function(a, b){
		var UVAB = V(b.x-a.x, b.y-a.y).UV();
		var perpAB = a.v.dotProd(UVAB);
		var perpBA = b.v.dotProd(UVAB);
		var perpABRes = (perpAB*(a.m-b.m)+2*b.m*perpBA)/(a.m+b.m);
		var perpBARes = (perpBA*(b.m-a.m)+2*a.m*perpAB)/(a.m+b.m);
		a.v.dx += UVAB.dx*(perpABRes-perpAB);
		a.v.dy += UVAB.dy*(perpABRes-perpAB);
		b.v.dx += UVAB.dx*(perpBARes-perpBA);
		b.v.dy += UVAB.dy*(perpBARes-perpBA);
		this.breakUp(a, b, UVAB);
	},
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
	makeGrid: function(){
		var numCols = this.numCols;
		var numRows = this.numRows;
		var grid = new Array(numCols)
		for (var colIdx=0; colIdx<numCols; colIdx++){
			var col = new Array(numRows)
			for (var rowIdx=0; rowIdx<numRows;rowIdx++){
				col[rowIdx] = [];
			}
			grid[colIdx] = col;
		}
		return grid;
	},
	getMaxR: function(){
		var maxR = 0;
		for (var spcName in spcs){
			var spc = spcs[spcName];
			maxR = Math.max(maxR, spc.r);
		}
		return maxR;	
	}
}
