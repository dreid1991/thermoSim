function Attractor() {
	//energy = k1*e^(-k2*r)*r^2
	//f = de/dr = k2*r*e^(-k2*r)*(2-k2*x)
	//new e = -a*((b/(R+.97b))^8 - (b/(R+.97b))^5
	//new f = -a*(5b^5/(.97b+R)^6 - 8*b^8/(.97*b+R)^9
	//a~300
	//b~50
	this.eDebt = 0;
	this.k1 = .5;
	this.k2 = .07;
}

_.extend(Attractor.prototype, toInherit.gridder, {
	setup: function() {
		this.gridSize = 30;
		this.numCols = Math.ceil(myCanvas.width/this.gridSize+1);
		this.numRows = Math.ceil(myCanvas.height/this.gridSize+1);
		this.xSpan = Math.floor(myCanvas.width/this.gridSize);
		this.ySpan = Math.floor(myCanvas.height/this.gridSize);
		this.dotManager = dotManager;
		return this;
	},
	attract: function() {
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		var dots = dotMagnager.lists.ALLDOTS;
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			var dot = dots[dotIdx];
			if (dot.attractStr>0) {
				dot.tempLast = dot.temp();
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = (dot.x-neighbor.x)
							var dy = (dot.y-neighbor.y)
							var dist = Math.sqrt(dx*dx+dy*dy);
							//hey - all this funny business with the dist and UV is so I can get the dist and UV with but one square root
							var UV = V(dx, dy);
							UV.dx/=dist;
							UV.dy/=dist;
							dist = Math.max(0, dist-dot.r-neighbor.r)*pxToE;
							var str = dot.attractStrs[neighbor.idNum];
							var attrRad = (dot.attractRad+neighbor.attractRad)/2;
							var radFifth = attrRad*attrRad*attrRad*attrRad*attrRad;
							var denomFifth = (.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist);
							var f = -str*(5*radFifth/(denomFifth*(.97*attrRad+dist)) - 8*radFifth*attrRad*attrRad*attrRad/(denomFifth*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)));
							var dVDot = UV.copy().mult(f/dot.m);
							var dVNeigh = UV.mult(-f/neighbor.m);
							dot.v.add(dVDot);
							neighbor.v.add(dVNeigh);
							var pe = -str*(radFifth*attrRad*attrRad*attrRad/(denomFifth*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)) - (radFifth/denomFifth));
							dot.peCur += pe;
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
		var dots = dotManager.lists.ALLDOTS;
		for (var dotIdx=0; dotIdx<dots.length;dotIdx++) {
			var dot = dots[dotIdx];
			if (dot.attractStr>0){
				var newTemp = dot.tempLast + dot.peCur - dot.peLast;
				if (newTemp<0) {
					this.eDebt+=(10 - newTemp);
					newTemp=10;
				} 
				dot.setTemp(newTemp);
				dot.peLast = dot.peCur;
				dot.peCur = 0;
			}
		}
		if (this.eDebt>0) {
			this.exactDebt();
		}
	},
	exactDebt: function() {
		//yo yo, combine this with adjust E.
		//console.log('exacting debt');
		var minTemp = .3*dataHandler.avgTemp();
		var dots = dotManager.lists.ALLDOTS;
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			var dot = dots[dotIdx];
			var dotTemp = dot.temp();
			if (dotTemp>minTemp) {
				var deltaTemp = Math.min(Math.min(dotTemp-minTemp, 5), this.eDebt);
				this.eDebt-=deltaTemp;
				//console.log('from ' + dotTemp + ' to ' + (dotTemp-deltaTemp));
				dot.setTemp(dotTemp - deltaTemp);
				if (this.eDebt<=0) {
					return;
				}
			}
		}
		
	},
	zeroAllEnergies: function() {
		var dots = dotManager.lists.ALLDOTS;
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			dots[dotIdx].peLast = 0;
			dots[dotIdx].keLast = 0;
			dots[dotIdx].tempLast = 0;
		}
		
	},
	assignELastAll: function() {
		var grid = this.makeGrid();
		var gridSize = this.gridSize;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		var dots = dotManager.lists.ALLDOTS;

		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			var dot = dots[dotIdx];
			if (dot.attrStr>0) {
				dot.tempLast = dot.temp();
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = (dot.x-neighbor.x)
							var dy = (dot.y-neighbor.y)
							var dist = pxToE*V(dx, dy).mag();
							
							dist = Math.max(0, dist-dot.r-neighbor.r)*pxToE;
							var str = dot.attractStrs[neighbor.idNum];
							var attrRad = (dot.attractRad+neighbor.attractRad)/2;
							var radFifth = attrRad*attrRad*attrRad*attrRad*attrRad;
							var denomFifth = (.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist);
							var pe = -str*(radFifth*attrRad*attrRad*attrRad/(denomFifth*(.97*attrRad+dist)*(.97*attrRad+dist)*(.97*attrRad+dist)) - (radFifth/denomFifth));
							dot.peLast += pe;
							neighbor.peLast += pe;
							
						}
					}
				}
				grid[gridX][gridY].push(dot);
			}
		}
	},
})