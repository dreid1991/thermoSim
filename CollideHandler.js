function CollideHandler(){
	this.spcs = spcs;
	this.defs = speciesDefs;
	this.tConst = tConst;
	this.cP = cP;
	this.cV = cV;
	this.reactions = this.setupBlankReactions();
	console.log("Made supercollider");
}
CollideHandler.prototype = {
	setDefaultHandler: function(handler){
		var numSpcs = this.getNumSpcs();
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
	setupBlankReactions: function(){
		var reactions = {};
		var numSpcs = this.getNumSpcs();
		for (var i=0; i<numSpcs; i++){
			for (var j=i; j<numSpcs; j++){
				reactions[i + '-' + j] = []; 
			}
		}
		return reactions;
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
		//defining grid locally speeds up by ~250ms/500runs (1000->750)
		for (var spcName in this.spcs){
			var spc = spcs[spcName];
			for (var dotIdx=spc.length-1; dotIdx>-1; dotIdx-=1){
				var dot = spc[dotIdx];
				var gridX = Math.floor(dot.x/gridSize);
				var gridY = Math.floor(dot.y/gridSize);
				var doAdd = true;
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
									doAdd = false;;
								}
							}
						}
					}
				}
				if(doAdd && gridX>=0 && gridY>=0 && gridX<this.numCols && gridY<this.numRows){
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
	checkReact: function(a, b, UVAB, perpAB, perpBA, bX, bY){
		var idA = a.idNum;
		var idB = b.idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);		
		var rxns = this.reactions[min + '-' + max];
		var idxToReact = this.pickRxn(a, b, perpAB, perpBA, rxns);
		if(idxToReact!=-1){
			return !this.react(a, b, bX, bY, rxns[idxToReact]);
		} else{
			this.impactStd(a, b, UVAB, perpAB, perpBA);
		}

	},
	pickRxn: function(a, b, perpAB, perpBA, rxns){
		//HEY - THIS WILL NOT WORK.  YOU ARE NORMALIZING TO THE MAX DELTAH RXN.  THAT MEANS THAT THE MAX WILL NEVER HAPPEN.  
		//ALSO WHAT IF DELTAHRXN IS 0?
		var collideEnergy = this.collideEnergy(a, b, perpAB, perpBA)
		var maxDeltaHRxn = -Number.MAX_VALUE;
		var totalDeltaH = 0;
		var normalizedDeltaH = new Array(rxns.length);
		var aboveActiveE = new Array(rxns.length);
		var probMap = new Array(rxns.length);
		for (var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++){
			var rxn = rxns[rxnIdx];
			if(collideEnergy>rxn.activationE){
				maxDeltaHRxn = Math.max(rxn.deltaH, maxDeltaHRxn);
				totalDeltaH+=rxn.deltaH;
				aboveActiveE[rxnIdx] = true;
			}else{
				aboveActiveE[rxnIdx] = false;
			}
		}
		totalDeltaH-=rxns.length*maxDeltaHRxn;
		totalDeltaH*=-1;
		var curProbVal = 0;
		for (var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++){
			normalizedDeltaH[rxnIdx] = -(rxns[rxnIdx].deltaH - maxDeltaH);
		}
		if(totalDeltaH!=0){
			rndVal = Math.random()*totalDeltaH;
			var sumDeltaH = 0;
			for	(var rxnIdx=0; rxnIdx<rxns.length; rxnIdx++){
				sumDeltaH += normalizedDeltaH[rxnIdx]*aboveActiveE[rxnIdx];
				if(sumDeltaH>=rndVal){
					return rxnIdx;
				}
			}
		}else{
			return -1;
		}
		
		
	},
	react: function(a, b, bX, bY, rxn){
		
		if(rxn.reactants[a.name]){
			a.kill();
			var killedA = true;
		} else {
			var killedA = false;
		}
		if(rxn.reactants[b.name]){
			b.kill();
			var bGridSquare = this.grid[bX][bY];
			bGridSquare.splice(bGridSquare.indexOf(b), 1);			
		}

		var added = [];
		var avgX = (a.x + b.x)/2;
		var avgY = (a.y + b.y)/2;
		for (var prodIdx=0; prodIdx<rxn.products.length; prodIdx++){
			var product = rxn.products[prodIdx];
			var spc = this.spcs[rxn.product.spc];
			var def = this.defs[rxn.product.spc];
			for (var countIdx=0; countIdx<product.count; countIdx++){
				var dir = Math.random()*2*Math.PI;
				var v = V(Math.cos(dir), Math.sin(dir));
				var newDot = D(avgX + 2*v.dx, avgY + 2*v.dy, v, def.m, def.r, def.name, spc.idNum, product.tag, product.returnTo);
				spc.push(newDot);
				added.push(newDot);
			}
		}
		var tF = (a.temp() + b.temp() - rxn.deltaH/this.cV)/added.length;
		for(var addedIdx=0; addedIdx<added.length; addedIdx++){
			var dot = added[addedIdx];
			dot.setTemp(tF);
		}
		return killedA;
	},
	addReaction: function(spcAName, spcBName, activationE, deltaH, products, track){
		//deltaHRxn *= .8;
		//NOT converting from Cp of 5/2R to 4/2R to make the temp change in this be what it should be, I think
		//deltaHRxn converted to joules
		if(deltaHRxn.toString().toLowerCase().indexOf('kj')!=-1){
			deltaHRxn = parseFloat(deltaHRxn);
			deltaHRxn*=1000;
		}
		deltaHRxn = parseFloat(deltaHRxn);
		
		var spcA = this.spcs[spcAName];
		var spcB = this.spcs[spcBName];
		this.includeSpcs(spcAName, spcBName, products);
		var idA = spcA.idNum;
		var idB = spcB.idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		this.checkMassConserve(spcA, spcB, products);
		var rxnName = this.nameRxn(spcAName, spcBName, products);
		if(track){
			this.addTracking(spcAName, spcBName, products, rxnName);
		}
		var rxn = {reactants:{}, products:products};
		if(spcAName){
			rxn.reactants[spcAName] = true;
		}
		if(spcBName){
			rxn.reactants[spcBName] = true;
		}
		this.appendRxn(spcAName, spcBName, idA, idB, rxn);
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
	nameRxn: function(a, b, prods){
		var rxnName = '';
		if(a){rxnName+=a;}	
		if(b){rxnName+=b;}
		for(var prodIdx=0; prodIdx<prods.length; prodIdx++){
			var prod = prods[prodIdx];
			rxnName += prod.count + prod.spc;
		}
		return rxnName;
	},
	addTracking: function(a, b, prods, rxnName){
		var trackList = new Array(prods.length+2);
		trackList[0] = {spc:a, coeff:-1};
		trackList[1] = {spc:b, coeff:-1};
		
		for(var prodIdx=0; prodIdx<prods.length; prodIdx++){
			var prod = prods[prodIdx];
			trackList[prodIdx+2] = {spc:prod.spc, coeff:prod.count};
		}
		curLevel.trackExtentRxnStart(rxnName, trackList);
	},
	appendRxn: function(spcAName, spcBName, idA, idB, rxn){
		if(spcAName && spcBName){
			this.reactions[Math.min(idA, idB) + '-' + Math.max(idA, idB)].push(rxn);
		} else {
			var fixed = defaultTo(idA, idB);
			var numSpcs = this.getNumSpcs();
			for (var spcsIdx=0; spcIdx<numSpcs; spcIdx++){
				var min = Math.min(fixed, spcsIdx);
				var max = Math.max(fixed, spcsIdx);
				this.reactions[min + '-' + max].push(rxn);
			}
		}
	},
	removeReaction: function(spcAName, spcBName){
		var spcA = spcs[spcAName];
		var spcB = spcs[spcBName];
		var idA = spcA.idNum;
		var idB = spcB.idNum;
		var min = Math.min(idA, idB);
		var max = Math.max(idA, idB);
		var handler = this[min + '-' + max];
		removeListener(curLevel, 'data', 'trackExtentRxn' + handler.rxnName);
		handler = {func:this.impactStd, obj:this};
		return this;
	},
	removeAllReactions: function(){
		removeListenerByName(curLevel, 'data', 'trackExtentRxn');
		this.setDefaultHandler({func:this.impactStd, obj:this});
	},
	collideEnergy: function(a, b, perpAB, perpBA){
		return .5*(perpAB*perpAB*a.m + perpBA*perpBA*b.m)*this.tConst;
		//in temperature (kelvin)
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
