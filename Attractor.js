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
		var k = 500;
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				var dot = dots[dotIdx];
				dot.tempLast = dot.temp();
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = (dot.x-neighbor.x)
							var dy = (dot.y-neighbor.y)
							//var dist = Math.max(Math.sqrt(dx*dx+dy*dy) - dot.r - neighbor.r, 1)  //will blow up if dist==0.  UNLIKELY
							var dist = Math.sqrt(dx*dx+dy*dy);
							//hey - all this funny business with the dist and UV is so I can get the dist and UV with but one square root
							if (dist>1+neighbor.r+dot.r) {
								var UV = V(dx, dy);
								UV.dx/=dist;
								UV.dy/=dist;
								dist-=dot.r+neighbor.r;
								dist*=pxToE;
								var f = k/(dist*dist);
								//var UV = V(dx, dy).UV(); //neighbor to dot
								var sign = getSign(dot.v.dx);
								var dVDot = UV.copy().mult(-f/dot.m);
								var dVNeigh = UV.mult(f/neighbor.m);
								dot.v.add(dVDot);
								neighbor.v.add(dVNeigh);
							}
							
							dist = Math.max(dist, pxToE);
							var pe = k/(dist) 
							dot.peCur += pe; //(k)/((n-1)(R^(n-1)))
							neighbor.peCur += pe;							

						
						}
					}
				}
				grid[gridX][gridY].push(dot);
			}
		
		}
		this.adjustE();
	},
	adjustE: function() {
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length;dotIdx++) {
				var dot = dots[dotIdx];
				var newTemp = dot.tempLast + dot.peCur - dot.peLast;
				if (newTemp<0) {
					//dot.v.mult(-1);
					newTemp*=-1;
					this.exactDebtInit(dot, newTemp);
				} 
				dot.setTemp(newTemp);
				dot.peLast = dot.peCur;
				dot.peCur = 0;
			}
		}
	},
	exactDebtInit: function(dot, newTemp) {
		dot.eDebt = newTemp*2;
		if (dot.eDebtListenerName) {
			removeListener(curLevel, 'update', dot.eDebtListenerName);
		}
		dot.eDebtlistenerName = 'exactDebt' + dot.idNum + dot.x + dot.y;
		addListener(curLevel, 'update', dot.eDebtlistenerName, function() {
			var temp = this.temp();
			var ammtToExact = Math.max(0, Math.min(temp-.01, Math.min(.1*newTemp, this.eDebt)));
			this.eDebt-=ammtToExact;
			this.setTemp(temp-ammtToExact);
			if (this.eDebt<=0) {
				this.eDebt = 0;
				this.eDebtListenerName = undefined;
				removeListener(curLevel, 'update', dot.eDebtlistenerName);
			}
		}, dot);	
	},
	assignELastAll: function() {
		var k = 500;
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				var dot = dots[dotIdx];
				dot.tempLast = dot.temp();
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = (dot.x-neighbor.x)
							var dy = (dot.y-neighbor.y)
							var dist = pxToE * Math.max(Math.sqrt(dx*dx+dy*dy) - dot.r - neighbor.r, 1)  //will blow up if dist==0.  UNLIKELY
							var pe = k/(dist)
							dot.peLast += pe; //(k)/((n-1)(R^(n-1)))
							neighbor.peLast += pe;
							
						}
					}
				}
				grid[gridX][gridY].push(dot);
			}
		
		}		
	},
}
)