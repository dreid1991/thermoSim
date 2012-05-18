function CollideHandler(){
	console.log("Made supercollider");
}
CollideHandler.prototype = {
	check: function(){
		this.grid = $.extend(true,[],this.gridBlank);
		for (var spcIdx=0; spcIdx<spcs.length; spcIdx++){
			var spc = spcs[spcIdx];
			for (var dotIdx=0; dotIdx<spc.dots.length; dotIdx++){
				var dot = spc.dots[dotIdx];
				var gridX = Math.floor(dot.x/this.gridSize);
				var gridY = Math.floor(dot.y/this.gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, this.xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, this.ySpan); y++){
						for (var neighborIdx=0; neighborIdx<this.grid[x][y].length; neighborIdx++){
							var neighborAddress = this.grid[x][y][neighborIdx];
							var neighbor = spcs[neighborAddress[0]].dots[neighborAddress[1]];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							var distSqr = dx*dx+dy*dy;
							var rSqr = (dot.r+neighbor.r)*(dot.r+neighbor.r);
							if(distSqr<=rSqr){
								curLevel.onDotImpact(dot, neighbor);
							}
						}
					}
				}
				if(gridX>=0 && gridY>=0 && gridX<this.grid.length && gridY<this.grid[0].length){
					this.grid[gridX][gridY].push([spcIdx, dotIdx]);
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
		this.gridBlank = this.makeGrid();
		this.xSpan = Math.floor(myCanvas.width/this.gridSize);
		this.ySpan = Math.floor(myCanvas.height/this.gridSize);
	},
	makeGrid: function(){
		var grid = [];
		for (var colIdx=0; colIdx<myCanvas.width/this.gridSize+1; colIdx++){
			var col = []
			for (var rowIdx=0; rowIdx<myCanvas.height/this.gridSize+1;rowIdx++){
				col.push([]);
			}
			grid.push(col);
		}
		return grid;
	},
	getMaxR: function(){
		var maxR = 0;
		for (var spcIdx=0; spcIdx<spcs.length; spcIdx++){
			var spc = spcs[spcIdx];
			maxR = Math.max(maxR, spc.r);
		}
		return maxR;	
	}
}
