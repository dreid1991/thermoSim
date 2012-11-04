function Attractor() {
	//energy = k1*e^(-k2*r)*r^2
	//f = de/dr = k2*r*e^(-k2*r)*(2-k2*x)
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
	},
	attract: function() {
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
							var dist = Math.sqrt(dx*dx+dy*dy);
							//hey - all this funny business with the dist and UV is so I can get the dist and UV with but one square root
							var UV = V(dx, dy);
							UV.dx/=dist;
							UV.dy/=dist;
							dist*=pxToE;
							var exp = Math.exp(-this.k2*dist);
							var f = -this.k1*dist*exp*(2-this.k2*dist);
							var dVDot = UV.copy().mult(-f/dot.m);
							var dVNeigh = UV.mult(f/neighbor.m);
							dot.v.add(dVDot);
							neighbor.v.add(dVNeigh);
							var pe = this.k1*exp*dist*dist;
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
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			for (var dotIdx=0; dotIdx<dots.length;dotIdx++) {
				var dot = dots[dotIdx];
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
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
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
		}
	},
	/*
	exactDebtInit: function(dot, newTemp) {
		dot.eDebt = dot.eDebt + newTemp*2;
		var eDebtInit = dot.eDebt;
		console.log('Starting e debt');
		if (dot.eDebtListenerName) {
			removeListener(curLevel, 'update', dot.eDebtListenerName);
		}
		dot.eDebtListenerName = 'exactDebt' + dot.idNum + dot.x + dot.y;
		addListener(curLevel, 'update', dot.eDebtListenerName, function() {
			var temp = this.temp();
			var ammtToExact = Math.max(0, Math.min(temp-.01, Math.min(.01*eDebtInit, this.eDebt)));
			this.eDebt-=ammtToExact;
			this.setTemp(temp-ammtToExact);
			if (this.eDebt<=0) {
				this.eDebt = 0;
				this.eDebtListenerName = undefined;
				removeListener(curLevel, 'update', dot.eDebtlistenerName);
			}
		}, dot);	
	
	},
	*/
	assignELastAll: function() {
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
							var dist = pxToE*V(dx, dy).mag();
							var pe = this.k1*Math.exp(-this.k2*dist)*dist*dist;
							dot.peLast += pe;
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