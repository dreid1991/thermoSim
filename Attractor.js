function Attractor() {
	this.gridSize = 20;
	this.numCols = Math.ceil(myCanvas.width/this.gridSize+1);
	this.numRows = Math.ceil(myCanvas.height/this.gridSize+1);
	this.xSpan = Math.floor(myCanvas.width/this.gridSize);
	this.ySpan = Math.floor(myCanvas.height/this.gridSize);
}

_.extend(Attractor.prototype, gridder, {
	attract: function() {
		var moveIdx = 0;
		var moveVs = this.makeMoveVs();
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		//could sum up net attr on each dot then add in seperate loop.  Could also not.  Not sure which is faster
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				var dot = dots[dotIdx];
				dot.attractMoveIdx = moveIdx;
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = (dot.x-neighbor.x) - (dot.r + neighbor.r);
							var dy = (dot.y-neighbor.y) - (dot.r + neighbor.r);
							var dEff = dx*dx+dy*dy+1//adding one so I don't get near-infinite forces.  Maybe undo.  w/e for now
							if (dEff>1) {
								var UV = V(dx, dy).UV(); //dot TO neighbor
								var f = 1/dEff; //some const based on charges
								var dVDot = UV.dotProd(f/dot.m);
								var dVNeigh = UV.dotProd(f/neighbor.m);
								dot.v.dx+=dVDot.dx;
								dot.v.dy+=dVDot.dy;
								neighbor.v.dx+=dVNeighbor.dx;
								neightbor.v.dy+=dVNeighbor.dy;
								moveVs[dot.attractMoveIdx].dx += dVDot.dx*.5;
								moveVs[dot.attractMoveIdx].dy += dVDot.dy*.5;
								moveVs[neighbor.attractMoveIdx].dx += dVNeigh.dx*.5;
								moveVs[neighbor.attractMoveIdx].dy += dVNeigh.dy*.5;
								//then after all this, go through and add move Vs to dot position
							}
						}
					}
				}	
				moveIdx++;
			}
		
		}
	},
	makeMoveVs: function() {
		var moveVs = new Array(this.dotManager.count);
		for (var idx=0; idx<moveV.length; idx++) {
			moveVs[idx] = V(0,0);
		}
		return moveVs;
	}

}
)