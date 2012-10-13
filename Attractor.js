function Attractor() {

}

_.extend(Attractor.prototype, toInherit.gridder, {
	setup: function() {
		this.gridSize = 30;
		this.numCols = Math.ceil(myCanvas.width/this.gridSize+1);
		this.numRows = Math.ceil(myCanvas.height/this.gridSize+1);
		this.xSpan = Math.floor(myCanvas.width/this.gridSize);
		this.ySpan = Math.floor(myCanvas.height/this.gridSize);
		this.dotManager = dotManager;
	},
	attract: function() {
		var moveIdx = 0;
		var moveVs = this.makeMoveVs();
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
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
							//WRONG
							var dx = (dot.x-neighbor.x)
							var dy = (dot.y-neighbor.y)
							//
							var dEff = dx*dx+dy*dy+1//adding one so I don't get near-infinite forces.  Maybe undo.  w/e for now
							if (dEff>1) {
								var UV = V(dx, dy).UV(); //dot TO neighbor
								var f = 1/dEff; //some const based on charges
								var dVDot = UV.copy().mult(-f/dot.m);
								var dVNeigh = UV.mult(f/neighbor.m);
								dot.v.add(dVDot);
								neighbor.v.add(dVNeigh);
								moveVs[dot.attractMoveIdx].add(V(dVDot.dx*.5, dVDot.dy*.5));
								moveVs[neighbor.attractMoveIdx].add(V(dVNeigh.dx*.5, dVNeigh.dy*.5));
							}
						}
					}
				}
				grid[gridX][gridY].push(dot);
				moveIdx++;
			}
		
		}
		this.applyMoveVs(moveVs);
	},
	applyMoveVs: function(moveVs) {
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				dots[dotIdx].x += moveVs[dots[dotIdx].attractMoveIdx].dx;
				dots[dotIdx].y += moveVs[dots[dotIdx].attractMoveIdx].dy;
			}
		}		
	},
	makeMoveVs: function() {
		var moveVs = new Array(this.dotManager.count);
		for (var idx=0; idx<moveVs.length; idx++) {
			moveVs[idx] = V(0,0);
		}
		return moveVs;
	}

}
)