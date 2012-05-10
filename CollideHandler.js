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
				for (var x=-1; x<=1; x++){
					for (var y=-1; y<=1; y++){
						try{
							for (var neighborIdx=0; neighborIdx<this.grid[gridX+x][gridY+y].length; neighborIdx++){
								var neighborAddress = this.grid[gridX+x][gridY+y][neighborIdx];
								var neighbor = spcs[neighborAddress[0]].dots[neighborAddress[1]];
								var dx = dot.x-neighbor.x;
								var dy = dot.y-neighbor.y;
								var distSqr = dx*dx+dy*dy;
								var rSqr = (dot.r+neighbor.r)*(dot.r+neighbor.r);
								if(distSqr<=rSqr){
									curLevel.onDotImpact(dot, neighbor);
								}
							}
						}catch(e){
							//console.log("wee");
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
		var UVBA = V(a.x-b.x, a.y-b.y).UV();
		var perpAB = a.v.dotProd(UVAB);
		var perpBA = b.v.dotProd(UVBA);
		var dvA = Math.sqrt(b.m/a.m)*perpBA;
		var dvB = Math.sqrt(a.m/b.m)*perpAB;
		a.v.dx += UVBA.dx*dvA - UVAB.dx*perpAB;
		a.v.dy += UVBA.dy*dvA - UVAB.dy*perpAB;
		b.v.dx += UVAB.dx*dvB - UVBA.dx*perpBA;
		b.v.dy += UVAB.dy*dvB - UVBA.dy*perpBA;
		this.breakUp(a, b, UVAB, UVBA);
	},
	breakUp: function(a, b, UVAB, UVBA){
		var sumR = a.r+b.r;
		var aXNew = b.x + UVBA.dx*sumR;
		var aYNew = b.y + UVBA.dy*sumR;
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
		for (var defIdx=0; defIdx<speciesDefs.length; defIdx++){
			var spc = speciesDefs[defIdx];
			maxR = Math.max(maxR, spc.r);
		}
		return maxR;	
	}
}
