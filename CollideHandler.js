function CollideHandler(){
	this.spcs = spcs;
	console.log("Made supercollider");
}
CollideHandler.prototype = {
	setDefaultHandler: function(handler){
		var numSpcs = 0;
		for (var spcName in speciesDefs){
			numSpcs++;
		}
		for (var i=0; i<numSpcs; i++){
			for (var j=i; j<numSpcs; j++){
				this[i + '-' + j] = handler; //has func and obj
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
		this.grid = this.makeGrid();
		var grid = this.grid;
		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		for (var spcName in this.spcs){
			var spc = spcs[spcName];
			for (var dotIdx=spc.length-1; dotIdx>-1; dotIdx-=1){
				var dot = spc[dotIdx];
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
					for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
						for (var neighborIdx=grid[x][y].length-1; neighborIdx>-1; neighborIdx-=1){
							var neighbor = grid[x][y][neighborIdx];
							var dx = dot.x-neighbor.x;
							var dy = dot.y-neighbor.y;
							if(dx*dx+dy*dy<=(dot.r+neighbor.r)*(dot.r+neighbor.r)){
								var handler = this[Math.min(dot.idNum, neighbor.idNum) + '-' + Math.max(dot.idNum, neighbor.idNum)];
								var UVAB = V(neighbor.x-dot.x, neighbor.y-dot.y).UV();
								if(!handler.func.apply(handler.obj, [dot, neighbor, UVAB, dot.v.dotProd(UVAB), neighbor.v.dotProd(UVAB), x, y])){
									break;
								}
							}
						}
					}
				}
				if(gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows){
					grid[gridX][gridY].push(dot);
				}
				
				
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
	},
	addReaction: function(spcAName, spcBName, activationE, deltaHRxn, products){
		deltaHRxn *= .8;
		//converting from Cp of 5/2R to 4/2R to make the temp change in this be what it should be, I think
		var spcsLocal = this.spcs;
		var spcA = spcsLocal[spcAName];
		var spcB = spcsLocal[spcBName];
		this.includeSpcs(spcAName, spcBName, products);
		var idA = spcA.idNum;
		var idB = spcB.idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		var defsLocal = speciesDefs;
		var NLocal = N;
		var cVLocal = cV;
		var tConstLocal = tConst;
		this.checkMassConserve(spcA, spcB, products);
		var func = function(a, b, UVAB, perpAB, perpBA, bX, bY){
			var collideEnergy = this.collideEnergy(a, b, perpAB, perpBA);
			if(collideEnergy>activationE){
				var spcA = spcsLocal[a.name];
				var spcB = spcsLocal[b.name];
				var idxA = spcA.indexOf(a);
				spcA.splice(idxA, 1);
				var idxB = spcB.indexOf(b);
				
				spcB.splice(idxB, 1);
				var bGridSquare = this.grid[bX][bY];
				bGridSquare.splice(bGridSquare.indexOf(b), 1);
				var added = [];
				var avgX = (a.x + b.x)/2;
				var avgY = (a.y + b.y)/2;
				for (var prodIdx=0; prodIdx<products.length; prodIdx++){
					var product = products[prodIdx];
					var spc = spcsLocal[product.spc];
					var def = defsLocal[product.spc];
					for (var countIdx=0; countIdx<product.count; countIdx++){
						var dir = Math.random()*2*Math.PI;
						var v = V(Math.cos(dir), Math.sin(dir));
						var newDot = D(avgX + 2*v.dx, avgY + 2*v.dy, v, def.m, def.r, def.name, spc.idNum, product.tag, product.returnTo);
						spc.push(newDot);
						added.push(newDot);
					}
				}
				//YOUR ENERGIES ARE NOT WORKING
				//var eToAdd = deltaHRxn*added.length/NLocal;
				var e = (a.KE() + b.KE())*tConstLocal*cVLocal/NLocal + deltaHRxn/NLocal;
				var ePerDot = e/added.length;
				for(var addedIdx=0; addedIdx<added.length; addedIdx++){
					var dot = added[addedIdx];
					dot.setEnergy(ePerDot);
				}
					
				
				return false;
			}else{
				this.impactStd(a, b, UVAB, perpAB, perpBA);
			}
		}
		this[min + '-' + max] = {func:func, obj:this};
	},
	includeSpcs: function(a, b, prods){
		var nameList = new Array(prods.length + 2);
		nameList[0] = a;
		nameList[1] = b;
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++){
			nameList[prodIdx+2] = prods[prodIdx].spc;
		}
		addSpecies(nameList);
	},
	removeReaction: function(spcAName, spcBName){
		var spcA = spcs[spcAName];
		var spcB = spcs[spcBName];
		var idA = spcA.idNum;
		var idB = spcB.idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		this[min + '-' + max] = {func:this.impactStd, obj:this};
		return this;
	},
	removeAllReactions: function(){
		this.setDefaultHandler({func:this.impactStd, obj:this});
	},
	collideEnergy: function(a, b, perpAB, perpBA){
		return .5*(perpAB*perpAB*a.m + perpBA*perpBA*b.m)*tConst*cV/N;
	},
	checkMassConserve: function(a, b, products){
		var massIn = a.m + b.m;
		var massOut = 0;
		for (var prodIdx=0; prodIdx<products.length; prodIdx++){
			massOut += spcs[products[prodIdx].spc].m*products[prodIdx].count;
		}
		if(massIn!=massOut){
			console.log('YOUR ATTENTION PLEASE: MASS IS NOT CONSERVED IN THE REACTION BETWEEN ' + a.name + ' AND ' + b.name);
		}
	},
}
