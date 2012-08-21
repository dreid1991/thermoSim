getBinPts = {
	getBinPts: function(pos, slant, dims, thickness){
		var pts = []
		var thickness = defaultTo(5, thickness);
		pts.push(P(pos.x - slant*dims.dx/2, pos.y - dims.dy));
		pts.push(P(pos.x - dims.dx/2, pos.y));
		pts.push(P(pos.x + dims.dx/2, pos.y));
		pts.push(P(pos.x + slant*dims.dx/2, pos.y - dims.dy));
		pts.push(P(pos.x + slant*dims.dx/2+thickness, pos.y - dims.dy));
		pts.push(P(pos.x + dims.dx/2 + thickness, pos.y +thickness));
		pts.push(P(pos.x - dims.dx/2 - thickness, pos.y +thickness));
		pts.push(P(pos.x - slant*dims.dx/2 - thickness, pos.y - dims.dy));
		pts.push(P(pos.x - slant*dims.dx/2, pos.y - dims.dy));
		return pts;
	},
}
//////////////////////////////////////////////////////////////////////////
//DRAG WEIGHTS
//////////////////////////////////////////////////////////////////////////

function DragWeights(attrs){
	this.tempWeightDefs = 		attrs.weightDefs;
	this.wallInfo = 			defaultTo(0, attrs.wallInfo);
	this.wall = 				walls[this.wallInfo];
	this.zeroY = 				defaultTo(this.wall[2].y, attrs.min);
	this.pistonY = 				defaultTo(function(){return this.wall[0].y}, attrs.pistonY);
	this.wallHandler = 			defaultTo('cPAdiabaticDamped', attrs.compMode) + compAdj;
	this.readout = 				defaultTo(curLevel.readout, attrs.readout);
	this.binY = 				defaultTo(myCanvas.height-15, attrs.binY);
	this.eBar = 				{x:defaultTo(20, attrs.eBarX), scalar:.7};
	this.blockCol = 			defaultTo(Col(224, 165, 75), attrs.blockCol);
	this.binCol = 				defaultTo(Col(150, 150, 150), attrs.binCol);
	this.massInit = 			defaultTo(25, defaultTo(curLevel.massInit, attrs.massInit));
	this.binHeight = 			defaultTo(65, attrs.binHeight);
	this.weightDimRatio = 		defaultTo(.5, attrs.weightDimRatio);
	this.flySpeed =				defaultTo(20, attrs.flySpeed);
	
	if(!(this.tempWeightDefs instanceof Array)){
		//then is a total mass with count
		var mass = this.tempWeightDefs.mass/this.tempWeightDefs.count;
		this.tempWeightDefs = [{name:'onlyWeights', count:this.tempWeightDefs.count, mass:mass}]
	}
	
	
	this.eBarCol = this.blockCol;
	this.binSlant = 1.3;
	this.storeBinWidth = 110;
	this.storeBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.weightScalar = 40;//specific volume
	this.moveSpeed = 20;
	this.pistonMass = this.massInit;
	this.massChunkName = 'dragWeights';
	this.eAdded = 0;
	this.pressure = this.getPressure();
	this.weightsOnPiston = [];
	this.eBarFont = '12pt Calibri';
	this.eBarFontCol = Col(255,255,255);
	this.addStdReadoutEntries();
	this.binThickness = 5;
	var self = this;


	this.wall.setMass(this.massChunkName, this.massInit);
	this.trackEnergy = false;
	this.trackMass = true;
	this.trackPressure = false;
	return this.init();
}

_.extend(DragWeights.prototype, getBinPts, {
	init: function(){
		this.weightGroups = this.makeWeights(this.tempWeightDefs);
		this.bins = {};
		this.bins['store'] = this.makeStoreBins();
		this.bins['piston'] = this.makePistonBins();
		//this.dropAllstores();
		addListener(curLevel, 'update', 'moveWeightsOnPiston' + this.wallInfo, this.moveWeightsOnPiston, this);
		walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);
		addListener(curLevel, 'update', 'drawDragWeights' + this.wallInfo, this.draw, this);
		addListener(curLevel, 'mousedown', 'weights' + this.wallInfo, this.mousedown, this);
		addListener(curLevel, 'reset', 'dragWeights' + this.wallInfo, this.reset, this);
		this.wall.moveInit();
		this.dropAllIntoStores('instant');
		delete this.tempWeightDefs;
		return this;
		
	},
	remove: function(){
		this.wall.moveStop();
		removeListener(curLevel, 'update', 'moveWeightsOnPiston' + this.wallInfo);
		removeListener(curLevel, 'update', 'drawDragWeights' + this.wallInfo);
		removeListener(curLevel, 'mousedown', 'weights' + this.wallInfo);
		removeListener(curLevel, 'reset', 'dragWeights' + this.wallInfo);
		if(this.trackEnergy){
			this.readout.removeEntry('eAdd' + this.wallInfo);
		}
		if(this.trackMass){
			this.readout.removeEntry('mass' + this.wallInfo);
		}
		if(this.trackPressure){
			this.readout.removeEntry('pressure' + this.wallInfo);
		}
	},
	trackEnergyStart: function(){
		this.trackEnergy = true;
		if(!this.readout.entryExists('eAdd' + this.wallInfo)){
			this.addEnergyEntry();
		}
		return this;
	},
	trackEnergyStop: function(){
		this.trackEnergy = false;
		this.readout.removeEntry('eAdd' + this.wallInfo);
		return this;
	},
	trackMassStart: function(){
		this.trackMass = true;
		if(!this.readout.entryExists('mass' + this.wallInfo)){
			this.addMassEntry();
		}
		return this;
	},
	trackMassStop: function(){
		this.trackMass = false;
		this.readout.removeEntry('mass' + this.wallInfo);
		return this;
	},
	trackPressureStart: function(){
		this.trackPressure = true;
		if(!this.readout.entryExists('pressure' + this.wallInfo)){
			this.addPressureEntry();	
		}
		return this;
	},
	trackPressureStop: function(){
		this.trackPressure = false;
		this.readout.removeEntry('pressure' + this.wallInfo);	
		return this;
	},
	addStdReadoutEntries: function(){
		//this.addEnergyEntry();
		this.addMassEntry();
	},
	addEnergyEntry: function(){
		this.readout.addEntry('eAdd' + this.wallInfo, 'E Added:', 'kJ', this.eAdded, undefined, 1);
	},
	addMassEntry: function(){
		this.readout.addEntry('mass' + this.wallInfo, 'Mass:', 'kg', this.pistonMass, undefined, 0);
	},
	addPressureEntry: function(){
		this.readout.addEntry('pressure' + this.wallInfo, 'Pressure:', 'atm', this.pressure, undefined, 1); 
	},
	getWeightDims: function(weightDefs){
		var dims = {};
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			var weight = weightDefs[groupIdx];
			var name = weight.name;
			var width = Math.sqrt(weight.mass*this.weightScalar/this.weightDimRatio);
			var height = width*this.weightDimRatio;
			dims[name] = V(width, height);
		}
		return dims;
	},
	makeWeights: function(weightDefs){
		var weightGroups = {};
		var weightDims = this.getWeightDims(weightDefs)
		var weightId = 0;
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			var weightDef = weightDefs[groupIdx];
			var weightGroup = {}; 
			weightGroup.name = weightDef.name;
			weightGroup.dims = weightDims[weightGroup.name];
			weightGroup.mass = weightDef.mass;
			weightGroup.weights = [];
			for (var weightIdx=0; weightIdx<weightDef.count; weightIdx++){
				var weight = {};
				weight.pos = P(300,500);
				weight.name = weightDef.name;
				weight.status = '';
				weight.id = weightId;
				weightGroup.weights.push(weight)
				weightId++;
			}
			
			weightGroups[weightGroup.name] = weightGroup;
		}
		return weightGroups;
	},
	makeStoreBins: function(){

		var center = (this.wall[0].x + this.wall[1].x)/2;
		var bins = {};
		var numGroups = this.getNumGroups();
		var posX = center - this.storeBinWidth*(numGroups-1)/2 - this.storeBinSpacing*(numGroups-1)/2;
		for (var groupName in this.weightGroups){
			var weightGroup = this.weightGroups[groupName];
			bins[groupName] = this.makeStoreBin(posX, weightGroup);
			posX+=this.storeBinWidth + this.storeBinSpacing;
		}
		return bins;
	},
	makeStoreBin: function(posX, weightGroup){
		var bin = {}
		bin.pts = this.getBinPts(P(posX, this.binY), this.binSlant, V(this.storeBinWidth, this.binHeight), this.binThickness);
		bin.x = posX - this.storeBinWidth/2;
		bin.y = this.binY;
		bin.slots = this.getBinSlots(P(bin.x, bin.y), weightGroup);
		bin.visible = true;
		return bin;
	},
	makePistonBins: function(){

		var center = (this.wall[0].x + this.wall[1].x)/2;
		var bins = {};
		var numGroups = this.getNumGroups();
		var posX = center - this.pistonBinWidth*(numGroups-1)/2 - this.pistonBinSpacing*(numGroups-1)/2;
		for (var groupName in this.weightGroups){
			var weightGroup = this.weightGroups[groupName];
			bins[groupName] = this.makePistonBin(posX, weightGroup);
			posX+=this.pistonBinWidth + this.pistonBinSpacing;
		}
		return bins;	
	},
	makePistonBin: function(posX, weightGroup){
		var bin = {};
		bin.x = posX - this.pistonBinWidth/2;
		bin.y = this.pistonY();
		bin.slots = this.getPistonBinSlots(bin.x, weightGroup);
		bin.visible = false;
		return bin
	},

	getBinSlots: function(pt, weightGroup){
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(this.storeBinWidth/(dims.dx + this.blockSpacing));
		var usedWidth = numCols*(dims.dx+this.blockSpacing);
		var unusedWidth = this.storeBinWidth-usedWidth;
		pt.x+=unusedWidth/2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var y = pt.y - this.blockSpacing - dims.dy;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var x = pt.x + this.blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				fy = this.stationaryYFunc(y);
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, x, fy, weightGroup.name, 'store', rowIdx, colIdx));
				x += dims.dx+this.blockSpacing;
			}
			slots.push(row);
			y -= dims.dy+this.blockSpacing;
		}
		return slots;
		
	},
	stationaryYFunc: function(val){
		return function(){return val};
	},
	//HEY - GENERALIZE THESE TWO
	getPistonBinSlots: function(x, weightGroup){
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(this.pistonBinWidth/(dims.dx + this.blockSpacing));
		var usedWidth = numCols*(dims.dx+this.blockSpacing);
		var unusedWidth = this.pistonBinWidth-usedWidth;
		startX = x + unusedWidth/2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var yOffset = this.blockSpacing;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var blockX = startX + this.blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				var fy = this.pistonMinusVal(yOffset+dims.dy);
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, blockX, fy, weightGroup.name, 'piston', rowIdx, colIdx));
				blockX += dims.dx+this.blockSpacing;
			}
			slots.push(row);
			yOffset += dims.dy+this.blockSpacing;
		}
		return slots;
		
	},
	newSlot: function(isFull, x, fy, name, type, row, col){
		return {isFull:isFull, x:x, y:fy, name:name, type:type, row:row, col:col};
	},
	binIsFull: function(type, size){
		var bin = this.bins[type][size];
		var rows = bin.slots;
		for (rowIdx=0; rowIdx<rows.length; rowIdx++){
			var row = rows[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var slot = row[colIdx]
				if(!slot.isFull){
					return false;
				}
			}
			
		}
		return true;
	},
	binIsEmpty: function(type, size){
		var bin = this.bins[type][size];
		var rows = bin.slots;
		for (rowIdx=0; rowIdx<rows.length; rowIdx++){
			var row = rows[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var slot = row[colIdx]
				if(slot.isFull){
					return false;
				}
			}
			
		}
		return true;			
	},
	allEmpty: function(type){
		var allEmpty = new Boolean();
		allEmpty = true;
		for (var binName in this.bins[type]){
			allEmpty = Math.min(allEmpty, this.binIsEmpty(type, binName));
		}
		return allEmpty;
	},
	weightCount: function(type, size){
		var bin = this.bins[type][size];
		var rows = bin.slots;
		var count = 0;
		for (rowIdx=0; rowIdx<rows.length; rowIdx++){
			var row = rows[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var slot = row[colIdx]
				count+=slot.isFull;
			}
			
		}
		return count;
	},
	getPistonMass: function(){
		var totalMass=0;
		for (var weightName in this.weightGroups){
			var weightGroup = this.weightGroups[weightName];
			var weights = weightGroup.weights;
			var mass = weightGroup.mass;
			for(var weightIdx=0; weightIdx<weights.length; weightIdx++){
				if(weights[weightIdx].status=='piston'){totalMass+=mass};
			}
		}
		return totalMass+this.massInit;
	},
	getPressure: function(){
		
		return this.pistonMass*g*pConst/(this.wall[1].x-this.wall[0].x);
	},
	pistonMinusVal: function(val){
		var wall = this.wall
		return function(){return wall[0].y-val}
	},
	dropAllIntoStores: function(special){
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++){
				var weight = weightGroup.weights[weightIdx];
				if(weight.status=='piston'){
					weight.status = 'inTransit';
					weight.slot.isFull = false;
					this.takeOffPiston(weight);
					this.dropIntoBin(weight, 'store', special);
				}else if(weight.status!='store'/* && weight.status!='inTransit'*/){
					weight.status = 'inTransit';
					this.dropIntoBin(weight, 'store', special);
				}//NOTE - BLOCKS AREADY MOVING WILL NOT GET DROPPED. SHOULD ADD DESTINATION AND IF DEST==PISTON, DROP TO BIN
				
			}
		}
		return this;
	},
	dropAllIntoPistons: function(special){
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++){
				var weight = weightGroup.weights[weightIdx];
				if(weight.status=='store'){
					weight.status = 'inTransit';
					weight.slot.isFull = false;
					this.takeOffPiston(weight);
					this.dropIntoBin(weight, 'piston', special);
				}else if(weight.status!='piston'/* && weight.status!='inTransit'*/){
					weight.status = 'inTransit';
					this.dropIntoBin(weight, 'piston', special);
				}//NOTE - BLOCKS AREADY MOVING WILL NOT GET DROPPED. SHOULD ADD DESTINATION AND IF DEST==PISTON, DROP TO BIN
				
			}
		}
		return this;
	},
	dropIntoBin: function(weight, binType, special){
		weight.status = 'inTransit';
		var dropSlotInfo = this.getDropSlot(weight.name, binType);
		var slot = dropSlotInfo.slot;
		slot.isFull = true;
		
		var slotIdNum = dropSlotInfo.id;
		if(special=='instant'){
			weight.pos.x = slot.x;
			weight.pos.y = slot.y();
		}
		var uniqueNamePiece = weight.name+weight.id + 'endId' + this.wallInfo;
		var listenerName = 'moveWeight'+ uniqueNamePiece + binType+slotIdNum;
		if(removeListenerByName(curLevel, 'update', uniqueNamePiece)){
			weight.slot.isFull = false;
			weight.slot = undefined;
		};
		weight.slot = slot;
		addListener(curLevel, 'update', listenerName,
			function(){
				var slotY = slot.y();
				var UV = V(slot.x-weight.pos.x, slotY-weight.pos.y).UV();
				weight.pos.x = boundedStep(weight.pos.x, slot.x, UV.dx*this.moveSpeed);
				weight.pos.y = boundedStep(weight.pos.y, slotY, UV.dy*this.moveSpeed);
				if(this.weightArrived(weight, slot)){
					removeListener(curLevel, 'update', listenerName);
					//weight.slot = slot;
					weight.status = slot.type;
					if(weight.status=='piston'){
						this.putOnPiston(weight);
					}
				}
			},
		this);
	},
	weightArrived: function(weight, slot){
		return weight.pos.x==slot.x && weight.pos.y==slot.y();
	},
	getDropSlot: function(weightName, binType){
		var bin = this.bins[binType][weightName];
		for (var rowIdx=0; rowIdx<bin.slots.length; rowIdx++){
			var row = bin.slots[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var curSlot = bin.slots[rowIdx][colIdx];
				if(!curSlot.isFull){
					return {slot:curSlot, id:String(rowIdx)+String(colIdx)};
				}
			}
		}
		alert('BOX IS FULL!  WHY IS THIS HAPPENING?');
	},

	moveWeightsOnPiston: function(){
		for (var weightIdx=0; weightIdx<this.weightsOnPiston.length; weightIdx++){
			this.weightsOnPiston[weightIdx].pos.y = this.weightsOnPiston[weightIdx].slot.y();
		}
	},
	getNumGroups: function(){
		var count = 0;
		for (idx in this.weightGroups){
			count++;
		}
		return count;
	},
	draw: function(){
		this.drawWeights();
		this.drawBins();
		this.drawBinLabels()
	},
	drawWeights: function(){
		var drawCanvas = c;
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group]
			var weights = weightGroup.weights;
			var dims = weightGroup.dims;
			for (var weightIdx=0; weightIdx<weights.length; weightIdx++){
				draw.fillRect(weights[weightIdx].pos, dims, this.blockCol, drawCanvas);
			}
		}
	},
	drawBins: function(){
		var drawCanvas = c;
		for (var binType in this.bins){
			var typeBins = this.bins[binType];
			for(var binSize in typeBins){
				var bin = typeBins[binSize];
				if(bin.visible){
					draw.fillPts(bin.pts, this.binCol, drawCanvas);
				}
			}
		}
	},
	drawBinLabels: function(){
		for(var binName in this.bins.store){
			var bin = this.bins.store[binName];
			if(bin.visible){
				var x = bin.x + this.storeBinWidth/2
				var y = bin.y - this.binHeight+10;
				var mass = this.weightGroups[binName].mass;
				var text = mass + ' kg each';
				draw.text(text, P(x, y), this.eBarFont, this.eBarFontCol, 'center', 0, c);
			}
		}
	},
	drawEBar: function(m, dh){
		var yBottom = this.zeroY;
		var yTop = this.zeroY - dh;
		var corner = P(this.eBar.x - m*this.eBar.scalar/2, yTop);
		var dims = V(m*this.eBar.scalar, yBottom-yTop);
		draw.fillRect(corner, dims, this.eBarCol, c);
	},
	drawEBarText: function(m, energy){
		var rounded = round(energy,1)
		var text = this.eText(rounded)
		var x = this.eBar.x;
		var y = this.zeroY - energy/(workConst*g*m);
		var pos = P(x, y-15);
		draw.text(text, pos, this.eBarFont, this.eBarFontCol, 'center', 0, c);
	},
	eText: function(energy){
		return energy + ' ' + curLevel.eUnits;
	},

	shrinkEBar: function(){
		var assignedWeight = this.selected;
		var mass = this.weightGroups[assignedWeight.name].mass;
		var removeTime = 300;
		var curE = Math.abs(this.eBar.eChange);
		var ePerTurn = curE*updateInterval/removeTime;
		addListener(curLevel, 'update', 'shrinkEBar',
			function(){
				curE = Math.max(curE-ePerTurn, 0);
				var height = this.eToHeight(curE, mass);
				this.drawEBar(mass, height);
				if(curE==0){
					removeListener(curLevel, 'update', 'shrinkEBar');
				}
			},
		this);
	},


	putOnPiston: function(weight){
		this.weightsOnPiston.push(weight);
		weight.status = 'piston';
		this.pistonMass = this.getPistonMass();
		this.wall.setMass(this.massChunkName, this.pistonMass);
		this.pressure = this.getPressure();
		if(this.trackMass){
			this.readout.tick('mass' + this.wallInfo, this.pistonMass);
		}
		if(this.trackPressure){
			this.readout.tick('pressure' + this.wallInfo, this.pressure);
		}
	},	
	takeOffPiston: function(weight){
		for (var idx=0; idx<this.weightsOnPiston.length; idx++){
			if(weight==this.weightsOnPiston[idx]){
				this.weightsOnPiston.splice([idx],1);
			}
		}
		this.pistonMass = this.getPistonMass();
		this.wall.setMass(this.massChunkName, this.pistonMass);
		this.pressure = this.getPressure();
		if(this.trackMass){
			this.readout.tick('mass' + this.wallInfo, this.pistonMass);
		}
		if(this.trackPressure){
			this.readout.tick('pressure' + this.wallInfo, this.pressure);
		}
	},
	mousedown: function(){
		var clicked = this.getClicked();
		if(clicked){
			this.pickup(clicked);
			if(this.trackEnergy){
				if(this.selected.cameFrom=='store'){
					this.eBarFromBin();
				}
				if(this.selected.cameFrom=='piston'){
					this.eBarFromPiston();
				}
			}
			if(this.selected.cameFrom=='piston'){
				this.takeOffPiston(this.selected);
			}
			addListener(curLevel, 'mousemove', 'weights', this.mousemove, this)
			addListener(curLevel, 'mouseup', 'weights', this.mouseup, this)
		}

	},
	mousemove: function(){
		var mousePos = mouseOffset(myCanvas);
		var orig = this.selected.origPos
		var weightOrig = orig.weight;
		var mouseOrig = orig.mouse;
		var dx = mousePos.x - mouseOrig.x;
		var dy = mousePos.y - mouseOrig.y;
		var newX = weightOrig.x + dx;
		var newY = weightOrig.y + dy;
		this.selected.pos.x = newX;
		this.selected.pos.y = newY;
	},
	mouseup: function(){
		removeListener(curLevel, 'mousemove', 'weights');
		removeListener(curLevel, 'mouseup', 'weights');
		var dest = this.getDest();
		var energyChanged = new Boolean();
		var selected = this.selected;
		energyChanged = (selected.cameFrom=='piston' && dest=='store') || (selected.cameFrom=='store' && dest=='piston')
		if(energyChanged){
			this.eAdded+=this.eBar.eChange;
			if(this.trackEnergy){
				this.readout.tick('eAdd', this.eAdded);
				this.animText();
				this.shrinkEBar();
			}
		}	
		this.dropIntoBin(this.selected, dest)
		delete this.origPos;
		this.selected = undefined;

	},
	getDest: function(){
		var selected = this.selected;
		var blockHeight = this.weightGroups[selected.name].dims.dy;
		if(selected.cameFrom=='piston' || selected.pos.y+blockHeight>this.pistonY()){
			return 'store';
		}else{
			return 'piston';
		}
	},
	eBarFromBin: function(){
		var eBarType = 'FromBinHolding';
		addListener(curLevel, 'update', 'eBar' + eBarType,
			function(){
				var selected = this.selected;
				var m = this.weightGroups[selected.name].mass;
				this.eBar.eChange = this.getSelectedEnergy();
				var dh = Math.min(this.zeroY - this.pistonY(), Math.max(0, this.zeroY - selected.pos.y));
				this.drawEBar(m, dh);
				this.drawEBarText(m, this.eBar.eChange);
				
			},
		this);
		this.addRemoveEBarListener(eBarType)
	},
	eBarFromPiston: function(){
		var eBarType = 'FromPistonHolding';
		var m = this.weightGroups[this.selected.name].mass;
		var dh =this.pistonY() - this.zeroY;
		this.eBar.eChange = this.heightToE(dh, m);
		addListener(curLevel, 'update', 'eBar' + eBarType, 
			function(){
				this.drawEBar(m, Math.abs(dh));
				this.drawEBarText(m, this.eBar.eChange);
			},
		this);
		this.addRemoveEBarListener(eBarType)
	
	},
	addRemoveEBarListener: function(eBarType){
		addListener(curLevel, 'mouseup', 'removeEBar',
			function(){
				removeListener(curLevel, 'update', 'eBar' + eBarType);
				removeListener(curLevel, 'mouseup', 'removeEBar');
				;
			},
		this);
	},
	animText: function(){
		var destEntry = byAttr(this.readout.entries, 'eAdd', 'name');
		destPos = destEntry.pos.copy();
		destPos.x+=40;
		animText.newAnim({pos:P(this.eBar.x,this.pistonY()-15)},
			{pos:destPos, col:curLevel.bgCol},
			{text:this.eText(round(this.eBar.eChange,1))})
	},
	pickup: function(weight){
		weight.cameFrom = weight.status;
		weight.status = 'holding';
		var mousePos = mouseOffset(myCanvas);
		if (weight.slot!==undefined){
			weight.slot.isFull = false;
		}
		if(weight.status=='piston'){
			this.takeOffPiston(weight);
		}
		delete weight.slot;
		this.selected = weight;
		this.selected.origPos = {mouse:mousePos.copy(), weight:weight.pos.copy()};
	},
	getSelectedEnergy: function(){
		var selected = this.selected;
		var grpName = selected.name;
		var m = this.weightGroups[grpName].mass;
		var pos = selected.pos.copy();
		var dh = Math.min(this.zeroY - this.pistonY(), Math.max(0, this.zeroY - selected.pos.y));
		return this.heightToE(dh, m);		
	},
	getClicked: function(){
		for(var group in this.weightGroups){
			var group = this.weightGroups[group];
			for(var weightIdx=0; weightIdx<group.weights.length; weightIdx++){
				var weight = group.weights[weightIdx];
				var clickedOn = inRect(weight.pos, group.dims, myCanvas);
				if(clickedOn){
					if(weight.status=='inTransit'){
						return weight;
					}else{
						if(this.isOnTop(weight)){
							return weight;
						}
					}
				}
			}
		}
		return false
	},
	eToHeight: function(e, m){
		return e/(workConst*m*g);
	},
	heightToE: function(dh, m){
		return workConst*m*g*dh;
	},
	mouseOnWeight: function(dims, weightPos){
		var mousePos = mouseOffset(myCanvas);
		return mousePos.x>=weightPos.x && mousePos.x<=weightPos.x+dims.dx && mousePos.y<=weightPos.y && mousePos.y>=weightPos.y-dims.dy 
	},
	isOnTop: function(weight){
		var slot = weight.slot;
		var bin = this.bins[slot.type][weight.name]
		var colIdx = slot.col;
		for (var rowIdx=slot.row+1; rowIdx<bin.slots.length; rowIdx++){
			var curSlot = bin.slots[rowIdx][colIdx]
			if(curSlot.isFull==true){
				return false;
			}
		}
		return true;
	},
	mass: function(){
		return this.pistonMass;
	},
	reset: function(){
		this.dropAllIntoStores();
		this.eAdded=0;
		curLevel.wallV=0;
	}
})
//////////////////////////////////////////////////////////////////////////
//Pool
//////////////////////////////////////////////////////////////////////////
function Pool(attrs){
	attrs = defaultTo({}, attrs);
	this.bin = {};
	this.tube = {};
	this.tube.walls = {};
	this.tube.liquid = {};
	this.liquid = {};
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.rate = defaultTo(.15, attrs.rate);
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.mass = defaultTo(10, attrs.massInit);
	
	this.buttonFillId = defaultTo('buttonFill', attrs.fillButtonId);
	this.buttonDrainId = defaultTo('buttonDrain', attrs.drainButtonId);
	this.bindButtons();
	
	this.massChunkName = 'liquidMass' + defaultTo('', attrs.handle);
	this.wall.setMass(this.massChunkName, this.mass);	

	this.wallHandler = defaultTo('cPAdiabaticDamped', attrs.compMode) + compAdj;	
	walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);	
	
		
	
	this.bin.col = defaultTo(Col(150, 150, 150), attrs.binCol);
	this.bin.slant = defaultTo(1.3, attrs.binSlant);
	this.bin.width = 110;
	this.bin.widthUpper = this.bin.width*this.bin.slant;
	this.bin.height = 30;
	this.bin.thickness = defaultTo(5, attrs.binThickness);
	
	this.spcVol = 40; //specific volume
	this.liquid.col = defaultTo(Col(83, 87, 239), attrs.liquidCol);
	this.liquid.pts = this.getLiquidPts();
	this.bin.pts = this.getBinPts(P(0,0-this.bin.thickness), this.bin.slant, V(this.bin.width, this.bin.height), this.bin.thickness);
	this.binX = (this.wall[1].x+this.wall[0].x)/2;
	this.pistonY = function(){return this.wall[0].y};
	


	this.tube.speed = defaultTo(4, attrs.tubeSpeed);
	this.tube.walls.col = defaultTo(Col(175,175,175), attrs.tubeWallCol);
	this.tube.ID = 10; //inner diameter
	this.tube.OD = 20; //outer diameter
	var self = this;
	this.tube.liquid.y1 = function(){return -self.pistonY();};
	this.tube.liquid.y2 = undefined;
	this.tube.walls.y = undefined;
	this.tube.wallThickness = (this.tube.OD-this.tube.ID)/2
	this.tube.walls.xPts = this.getTubeXPts(this.tube.ID, this.tube.OD);
	this.tube.floor = this.tube.wallThickness+5;
	return this.init();
}

_.extend(Pool.prototype, getBinPts, {
	init: function(){	
		addListener(curLevel, 'update', 'drawPool', this.draw, this);
		this.wall.moveInit();	
	},
	bindButtons: function(){
		var self = this;
		$('#'+this.buttonFillId).mousedown(function(){self.buttonFillDown()});
		$('#'+this.buttonFillId).mouseup(function(){self.buttonFillUp()});
		
		$('#'+this.buttonDrainId).mousedown(function(){self.buttonDrainDown()});
		$('#'+this.buttonDrainId).mouseup(function(){self.buttonDrainUp()});
	},
	draw: function(){
		this.drawCanvas.save();
		this.drawCanvas.translate(this.binX, this.pistonY());
		draw.fillPts(this.bin.pts, this.bin.col, this.drawCanvas);
		draw.fillPts(this.liquid.pts, this.liquid.col, this.drawCanvas);
		this.drawCanvas.restore();		
	},
	drawTube: function(){
		var pistonY = this.pistonY();
		var y1Walls = -pistonY;
		var dyWalls = this.tube.walls.y - y1Walls;
		var y1Liq = this.tube.liquid.y1();
		this.dyLiq = this.tube.liquid.y2 - y1Liq;
		this.drawCanvas.save();
		this.drawCanvas.translate(this.binX, pistonY);
		draw.fillRect(P(this.tube.walls.xPts[0], y1Walls), V(this.tube.wallThickness, dyWalls), this.tube.walls.col, this.drawCanvas);
		draw.fillRect(P(this.tube.walls.xPts[1], y1Walls), V(this.tube.wallThickness, dyWalls), this.tube.walls.col, this.drawCanvas);
		draw.fillRect(P(-this.tube.walls.xPts[1], y1Liq), V(this.tube.ID, this.dyLiq), this.liquid.col, this.drawCanvas);
		this.drawCanvas.restore();				
		
	},
	getLiquidPts: function(){
		var dWidth = this.bin.widthUpper - this.bin.width;
		var height = this.mass*this.spcVol/(this.bin.width + (dWidth)/this.bin.height);
		var pts = new Array(4);
		var liquidDWidth = dWidth*height/this.bin.height;
		pts[0] = P(-this.bin.width/2, -this.bin.thickness);
		pts[1] = P(this.bin.width/2, -this.bin.thickness);
		pts[2] = P(this.bin.width/2 + liquidDWidth, -height-this.bin.thickness);
		pts[3] = P(-this.bin.width/2 - liquidDWidth, -height-this.bin.thickness);
		return pts;
	},
	getTubeXPts: function(ID, OD){
		var xPts = new Array(2);
		xPts[0] = -(ID/2 + this.tube.wallThickness); 
		xPts[1] = ID/2;
		return xPts;
	},
	buttonFillDown: function(){
		this.extendTubeFill();
	},
	buttonFillUp: function(){
		this.retractTube();
		
	},
	buttonDrainDown: function(){
		this.extendTubeDrain();
	},
	buttonDrainUp: function(){
		this.retractTube();
	},
	changeMassFunc: function(sign){
		console.log(sign);
		return function(){
			this.mass += sign*this.rate;
			this.liquid.pts = this.getLiquidPts();
			this.wall.setMass(this.massChunkName, this.mass);
		}
	},
	/*
	changeRects: function(onInit, listenerName, onRun, conditions, onEnd){
		onInit.apply(this);
		addListener(curLevel, 'update', listenerName, 
			function(){
				this.drawTube();
				onRun.apply(this);
				if(conditions.apply(this)){
					removeListener(curLevel, 'update', listenerName);
					onEnd.apply(this);
				}
			}
		,this)
	},
	The general case of the extensions and retractions below.  I end up just defining the cases when calling the functions instead of in functions.  Kind of icky to use
	*/
	extendTubeFill: function(){
		if(this.tube.liquid.y2==undefined && this.tube.walls.y==undefined){
			this.tube.liquid.y2 = -this.pistonY();
			this.tube.walls.y = -this.pistonY();			
		}

		removeListener(curLevel, 'update', 'retract');
		var tube = this.tube;
		var self = this;
		tube.liquid.y1 = function(){return -self.pistonY();};
		var thickness = this.tube.wallThickness
		addListener(curLevel, 'update', 'extendTube',
			function(){
				
				tube.walls.y+=this.tube.speed
				var tubeDown = -tube.walls.y <this.tube.floor;
				var liquidDown = -tube.liquid.y2 < this.tube.floor;	
				if(tubeDown){
					removeListener(curLevel, 'update', 'extendTube');
				}else if(tubeDown && liquidDown){
					removeListener(curLevel, 'update', 'extendTube');
					removeListener(curLevel, 'update', 'extendFluid');
					addListener(curLevel, 'update', 'changePoolMass', this.changeMassFunc(1), this);
				}
			}
		,this);
		addListener(curLevel, 'update', 'extendFluid',
				function(){
				tube.liquid.y2 += .8*this.tube.spped
				var tubeDown = -tube.walls.y <this.tube.floor;
				var liquidDown = -tube.liquid.y2 < this.tube.floor;				
				if(liquidDown){
					removeListener(curLevel, 'update', 'extendFluid');
				}else if(tubeDown && liquidDown){
					removeListener(curLevel, 'update', 'extendTube');
					removeListener(curLevel, 'update', 'extendFluid');				
					addListener(curLevel, 'update', 'changePoolMass', this.changeMassFunc(1), this);
				}
			},
		this);
		addListener(curLevel, 'update', 'drawTube', this.drawTube, this);
	},
	extendTubeDrain: function(){
		if(this.tube.liquid.y2==undefined && this.tube.walls.y==undefined){
			this.tube.liquid.y2 = -this.pistonY();
			this.tube.walls.y = -this.pistonY();			
		}
		removeListener(curLevel, 'update', 'retract');
		var tube = this.tube;
		tube.liquid.y1 = function(){return 0};
		tube.liquid.y2 = 0;
		var thickness = this.bin.thickness;
		addListener(curLevel, 'update', 'extendTube',
			function(){
				
				tube.walls.y += this.tube.speed;
				var tubeDown = -tube.walls.y < this.tube.floor;
				if(tubeDown){
					removeListener(curLevel, 'update', 'extendTube');
					this.liquidUp();
					addListener(curLevel, 'update', 'changePoolMass', this.changeMassFunc(-1), this);
				}
			}
		,this);
		addListener(curLevel, 'update', 'drawTube', this.drawTube, this);
	},
	liquidUp: function(){
		var tube = this.tube;
		tube.liquid.y1 = function(){return 0};
		tube.liquid.y2 = this.tube.floor;
		addListener(curLevel, 'update', 'liquidUp',
			function(){
				var dest = -this.pistonY();
				var liqY1 = tube.liquid.y1() -tube.speed;
				this.tube.liquid.y1 = function(){return liqY1};
				if(liqY1 < dest){
					removeListener(curLevel, 'update', 'liquidUp');
					addListener(curLevel, 'update', 'changeLiquidMass', this.changeMass(liquidSign), this);
				
				}
			}
		,this);			
	},
	retractTube: function(){
		removeListener(curLevel, 'update', 'extendTube');
		removeListener(curLevel, 'update', 'extendFluid');
		removeListener(curLevel, 'update', 'changeLiquidMass');
		removeListener(curLevel, 'update', 'liquidUp');
		var tube = this.tube;
		addListener(curLevel, 'update', 'retract',
			function(){
				var dest = -this.pistonY();
				var liqY1 = tube.liquid.y1() - tube.speed;
				tube.liquid.y1 = function(){return liqY1};
				tube.liquid.y2 -= tube.speed*1.5;
				tube.walls.y -= tube.speed;
				if(tube.liquid.y1() < dest && tube.liquid.y2 < dest && tube.walls.y < dest){
					removeListener(curLevel, 'update', 'retract');
					removeListener(curLevel, 'update', 'drawTube');
					this.tube.liquid.y2 = undefined;
					this.tube.walls.y = undefined;			
		
					
				}
			},
		this);
		
	},

})




//////////////////////////////////////////////////////////////////////////
//DRAG ARROW
//////////////////////////////////////////////////////////////////////////
function DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds){
	this.pos = pos;
	this.rotation = rotation;
	this.posInit = this.pos.copy()
	this.cols = cols;
	this.dims = dims
	this.name = name;
	this.listeners = listeners;
	this.drawCanvas = drawCanvas;
	this.canvasElement = canvasElement;
	this.bounds = bounds;
	if(this.bounds.x){
		if(!this.bounds.x.max){this.bounds.x.max = canvasElement.width - dims.dx;}
		if(!this.bounds.x.min){this.bounds.x.min = 0;}
	} else{
		this.bounds.x = {min:0, max:canvasElement.width - dims.dx};
	}
	if(this.bounds.y){
		if(!this.bounds.y.max){this.bounds.y.max = canvasElement.height - dims.dy;}
		if(!this.bounds.y.min){this.bounds.y.min = 0;}
	} else{
		this.bounds.y = {min:0, max:canvasElement.height - dims.dy};
	}
	this.pts = {};
	this.pts.outer = [];
	this.pts.inner = [];
	var width = this.dims.dx;
	var height = this.dims.dy;
	this.pts.outer.push(P(0,0));
	this.pts.outer.push(P(.9*width, -height/2));
	this.pts.outer.push(P(width, 0));
	this.pts.outer.push(P(.9*width, height/2));
	this.pts.outer.push(P(0,0));
	this.makeDrawFunc();
	this.clickListeners = this.makeListenerFuncs();
	return this;
}
DragArrow.prototype = {

	makeDrawFunc: function(){
		this.dirUV = V(Math.cos(this.rotation+Math.PI/2), Math.sin(this.rotation+Math.PI/2));
		this.draw = function(){};
		var self = this;
		var init = function(){
			self.drawCanvas.save();
			self.drawCanvas.translate(self.pos.x, self.pos.y);
			self.drawCanvas.rotate(self.rotation);
		}
		this.draw = extend(this.draw, init);
		if(this.cols.stroke){
			var strokeFill = function(){draw.fillPtsStroke(self.pts.outer, self.cols.outer, self.cols.stroke, self.drawCanvas)};
			this.draw = extend(this.draw, strokeFill);
		}else{
			var fill = function(){draw.fillPts(self.pts.outer, self.cols.outer, self.drawCanvas)};
			this.draw = extend(this.draw, fill);
		}
		if(this.cols.inner || this.cols.onClick){
			for (var ptIdx=0; ptIdx<this.pts.outer.length; ptIdx++){
				var newPt = this.pts.outer[ptIdx].copy().movePt({dx:-this.dims.dx/2}).scale(P(0,0),.6).movePt({dx:this.dims.dx/2});
				this.pts.inner.push(newPt)
			}
			if(this.cols.inner){
				this.cols.curInner = this.cols.inner;
			}else{
				this.cols.curInner = this.cols.outer;
			}
			
			var fill = function(){draw.fillPts(self.pts.inner, self.cols.curInner, self.drawCanvas)};
			this.draw = extend(this.draw, fill);
		}
		var restore = function(){self.drawCanvas.restore()};
		this.draw = extend(this.draw, restore);
	},
	
	makeListenerFuncs: function(){
		var listeners = this.listeners;
		var self = this;
		self.amSelected = new Boolean();
		if(listeners.onDown||listeners.onMove||listeners.onUp){
			var onClick = function(){}
			var onDown = function(){
				self.amSelected = self.checkSelected();
				if(self.amSelected){
					self.posInit = self.pos.copy();
					self.mouseInit = mouseOffset(self.canvasElement);
					onClick();
				}
			}
			if(self.cols.onClick){
				var changeInnerCol = function(){
					self.cols.curInner = self.cols.onClick
				}
				onClick = extend(onClick, changeInnerCol);
			}
			
			onClick = extend(onClick, function(){listeners.onDown.apply(self)});
			var onMove = this.makeMoveListenerFunc(self);
			onClick = extend(onClick, onMove)

			if(listeners.onUp){
				var onUp = this.makeUpListenerFunc(self);
				onClick = extend(onClick, onUp)
			}
			return onDown;
		}

	},
	makeMoveListenerFunc: function(self){
		var listeners = self.listeners;
		var moveFunc = function(){
			var mousePos = mouseOffset(self.canvasElement);
			var dMouseX = mousePos.x - self.mouseInit.x;
			var dMouseY = mousePos.y - self.mouseInit.y;
			var mouseDist = V(dMouseX, dMouseY);
			var arrowDist = mouseDist.dotProd(self.dirUV);
			var unBoundedX = self.posInit.x + (arrowDist*Math.cos(self.rotation+Math.PI/2));
			var unBoundedY = self.posInit.y + (arrowDist*Math.sin(self.rotation+Math.PI/2));
			self.pos.x = Math.max(self.bounds.x.min, Math.min(unBoundedX, self.bounds.x.max));
			self.pos.y = Math.max(self.bounds.y.min, Math.min(unBoundedY, self.bounds.y.max));
		}
		if(listeners.onMove){
			moveFunc = extend(moveFunc, function(){listeners.onMove.apply(self)});
		}
		var addMoveListeners = function(){addListener(curLevel, 'mousemove', 'dragArrow'+self.name, moveFunc, '')};
		
		var removeMoveListeners = function(){
			addListener(curLevel, 'mouseup', 'dragArrow'+self.name+'RemoveMove',
				function(){
					removeListener(curLevel, 'mousemove', 'dragArrow'+self.name);
					removeListener(curLevel, 'mouseup', 'dragArrow'+self.name+'RemoveMove');
				},
			'');
		}

		var toReturn = function(){
			addMoveListeners();
			
			removeMoveListeners();
		}
		
		return toReturn;
	},
	makeUpListenerFunc: function(self){
		var upFunc = function(){
			addListener(curLevel, 'mouseup', 'mouseup'+self.name, function(){self.listeners.onUp.apply(self)}, '');
			addListener(curLevel, 'mouseup', 'mouseup'+self.name+'remove', 
				function(){
					removeListener(curLevel, 'mouseup', 'mouseup'+self.name);
					removeListener(curLevel, 'mouseup', 'mouseup'+self.name+'remove');
				},
			'');
		}

		if(self.cols.onClick){
			var revertCols = function(){};
			if(self.cols.inner){
				revertCols = extend(revertCols, function(){self.cols.curInner = self.cols.inner;});
			}else{
				revertCols = extend(revertCols, function(){self.cols.curInner = self.cols.outer;});
			}
			var revertColsListener = function(){
				addListener(curLevel, 'mouseup', 'revertCols'+self.name,
					function(){
						revertCols();
						removeListener(curLevel, 'mouseup', 'revertCols'+self.name);
					},
				'');
			}
			upFunc = extend(upFunc, revertColsListener)
		}
	
		
		return upFunc;
	},
	show: function(){
		addListener(curLevel, 'mousedown', 'dragArrow'+this.name, this.clickListeners, '');
		addListener(curLevel, 'update', 'drawDragArrow'+this.name, this.draw, '');
		return this;
	},
	hide: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.name);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.name);	
		return this;
	},
	reset: function(){
		this.pos = this.posInit.copy();
		removeListener(curLevel, 'update', 'moveWall');
		return this;
	},
	remove: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.name);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.name);
		delete this;//DOESN'T DO ANYTHING
	},
	checkSelected: function(){
		var mousePos = mouseOffset(this.canvasElement);
		var unRotated = mousePos.rotate(this.pos, -this.rotation);
		var ULCorner = this.pos.copy().movePt({dy:-this.dims.dy/2});
		return ptInRect(ULCorner, this.dims, unRotated);
	},
}
//////////////////////////////////////////////////////////////////////////
//COMP ARROW
//////////////////////////////////////////////////////////////////////////
function CompArrow(attrs){
	//YOU WERE HERE
	var wallInfo = defaultTo(0, attrs.wallInfo);
	var speed = defaultTo(1.5, attrs.speed);
	var compMode = defaultTo('adiabatic', attrs.compMode);
	compMode += compAdj;
	var makeStops = defaultTo(true, attrs.stops);
	var bounds = defaultTo({y:{min:30, max:350}}, attrs.bounds);
	var wall = walls[wallInfo];
	var pos = wall[1].copy()
	var rotation = 0;
	var cols = {};
	cols.outer = Col(44, 118, 172);
	cols.onClick = Col(44, 118, 172);
	cols.inner = curLevel.bgCol.copy();
	var dims = V(25, 15);
	var handle = 'volDragger' + defaultTo('', attrs.handle);
	var drawCanvas = c;
	var canvasElement = canvas;
	var listeners = {};
	if(makeStops){
		this.stops = new Stops({stopPt:{height:bounds.y.max}, wallInfo:wallInfo});
	}
 
	listeners.onDown = function(){};
	listeners.onMove = function(){wall.changeSetPt(this.pos.y, compMode, speed)};
	listeners.onUp = function(){};
	this.dragArrow = new DragArrow(pos, rotation, cols, dims, handle, drawCanvas, canvasElement, listeners, bounds).show();
	return this;
}
CompArrow.prototype = {
	remove: function(){
		this.dragArrow.remove();
		if(this.stop){
			this.stops.remove();
		}
	},
}

//////////////////////////////////////////////////////////////////////////
//PISTON
//////////////////////////////////////////////////////////////////////////

function Piston(attrs){
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.pMin = defaultTo(2, attrs.min);
	this.pMax = defaultTo(15, attrs.max);
	this.p = defaultTo(2, attrs.init);
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	if(attrs.slider){
		this.slider = attrs.slider;
		this.setSliderVal();
	}
	this.slant = .07;
	this.trackingP = false;
	this.wall = walls[this.wallInfo];
	this.left = this.wall[0].x;
	this.width = this.wall[1].x-this.left;
	var myWall = this.wall
	this.y = function(){return myWall[0].y};
	this.height = 500;
	this.setMass();
	this.draw = this.makeDrawFunc(this.height, this.left, this.width);
	this.dataSlotFont = '12pt Calibri';
	this.dataSlotFontCol = Col(255,255,255);
	this.pStep = .05;
	var readoutLeft = this.left + this.width*this.slant;
	var readoutRight = this.left + this.width - this.width*this.slant;
	var readoutY = this.pistonBottom.pos.y-2+this.y();
	var readoutFont = '12pt calibri';
	var readoutFontCol = Col(255, 255, 255);
	this.readout = new Readout('pistonReadout', readoutLeft, readoutRight, readoutY, readoutFont, readoutFontCol, undefined, 'center');
	this.wall.moveInit();
	walls.setSubWallHandler(this.wallInfo, 0, 'cPAdiabaticDamped' + compAdj);		
	return this.show();
}

Piston.prototype = {
	makeDrawFunc: function(height, left, pistonWidth){
		var shaftThickness = 30;
		var shaftLength = height - 45;
		var plateTopHeight = 35;
		var plateThickness = 10;

		this.pistonTop = this.makeTop(left, pistonWidth, shaftThickness, shaftLength, height, plateTopHeight, plateThickness);
		
		var plateTopY = -height + shaftLength
		
		var plateBottomY = plateTopY + plateTopHeight;
		
		this.pistonBottom = this.makePlateBottom(P(left, plateBottomY), V(pistonWidth, plateThickness));
		

		
		
		
		var self = this;
		var drawFunc = function(){
			if(self.readout){
				self.setReadoutY();
			}
			self.drawCanvas.save();
			self.drawCanvas.translate(0, self.y());
			draw.fillPts(self.pistonTop.pts, self.pistonTop.col, self.drawCanvas);
			draw.fillRect(self.pistonBottom.pos, self.pistonBottom.dims, self.pistonBottom.col, self.drawCanvas);
			self.drawCanvas.restore();
		}
		return drawFunc;
	},
	makeTop: function(left, pistonWidth, shaftThickness, length, yInit, plateHeight, plateThickness){
		var slant = this.slant;
		var slantLeft = slant;
		var slantRight = 1-slant;
		var pts = new Array(14);
		var shaftX = left + pistonWidth/2 - shaftThickness/2;
		var shaftY = -yInit;
		var shaftPos = P(shaftX, shaftY);
		var col = Col(150, 150, 150);
		var dims = V(pistonWidth, plateHeight)
		var platePos = shaftPos.copy().movePt({dy:length}).position({x:left});;
		pts[0] = P(platePos.x,							platePos.y+dims.dy+1);
		pts[1] = P(platePos.x+dims.dx*slantLeft, 		platePos.y);
		pts[2] = P(shaftPos.x-dims.dx*slantLeft,		platePos.y);
		pts[3] = P(shaftPos.x,							platePos.y-5*dims.dy*slantLeft);
		pts[4] = P(shaftPos.x,							shaftPos.y);
		pts[5] = P(shaftPos.x + shaftThickness,			shaftPos.y);
		pts[6] = P(shaftPos.x + shaftThickness,			platePos.y-5*dims.dy*slantLeft);
		pts[7] = P(shaftPos.x + shaftThickness+dims.dx*slantLeft,			platePos.y);
		pts[8] = P(platePos.x+dims.dx*slantRight, 		platePos.y);
		pts[9] = P(platePos.x+dims.dx, 					platePos.y+dims.dy+1);
		pts[10] = P(platePos.x+dims.dx-plateThickness,			platePos.y+dims.dy+1);
		pts[11] = P(platePos.x+dims.dx*slantRight-plateThickness, platePos.y+plateThickness);
		pts[12] = P(platePos.x+dims.dx*slantLeft+plateThickness, 	platePos.y+plateThickness);
		pts[13] = P(platePos.x+plateThickness,					platePos.y+dims.dy+1);
		var col = Col(150, 150, 150);
		return {pts:pts, col:col};
	},
	makePlateBottom: function(pos, dims){
		var col = Col(100, 100, 100);
		dims.adjust(0,1);
		return {pos:pos, dims:dims, col:col};
	},
	show: function(){
		addListener(curLevel, 'update', 'drawPiston'+this.handle, this.draw, '');
		this.readout.show();
		return this;
	},
	hide: function(){
		removeListener(curLevel, 'update', 'drawPiston'+this.handle);
		this.readout.hide();
	},
	setPressure: function(sliderVal){
		var pSetPt = (this.pMax - this.pMin)*sliderVal/100 + this.pMin
		var dp = pSetPt - this.p;
		addListener(curLevel, 'update', 'piston'+this.handle+'adjP', 
			function(){
				this.p = boundedStep(this.p, pSetPt, this.pStep);
				this.setMass();			
				if(this.trackingP){
					this.setDataVal(this.p, 'pressure');
				}
				if(round(this.p,2)==pSetPt){
					removeListener(curLevel, 'update', 'piston'+this.handle+'adjP');
				}
			},
			this);
	},
	setSliderVal: function(){
		var sliderVal = 100*(this.p - this.pMin)/(this.pMax-this.pMin);
		$('#'+this.slider).slider('option', {value:sliderVal});
	},
	setMass: function(){
		this.mass = this.p*this.width/(pConst*g);
		this.wall.setMass('piston' + this.handle, this.mass);
	},
	setReadoutY: function(){
		this.readout.position({y:this.pistonBottom.pos.y-2+this.y()});
	},
	trackWorkStart: function(){
		this.wall.trackWorkStart(this.readout, 1)
		return this;
	},
	trackWorkStop: function(){
		this.wall.trackWorkStop();
		return this;
	},
	trackPressureStart: function(){
		if(!this.trackingP){
			this.addData('pressure', 'P:', this.p, 'atm');
			this.trackingP = true;
		}
		return this;
	},
	trackPressureStop: function(){
		this.removeData('pressure')
		this.trackingP = false;
		return this;
	},
	reset: function(){
		//this.dataHandler.slots.work.value = 0;
	},
	addData: function(handle, label, value, units){
		this.readout.addEntry(handle, label, units, value, undefined, 1);
	},
	removeData: function(handle){
		this.readout.removeEntry(handle);
	},
	setDataVal: function(value, handle){
		this.readout.hardUpdate(handle, value);
	},
	remove: function(){
		this.wall.moveStop();
		this.wall.unsetMass('piston' + this.handle);
		this.hide();
		removeListener(curLevel, 'update', 'moveWalls');
	}
}

//////////////////////////////////////////////////////////////////////////
//HEATER
//////////////////////////////////////////////////////////////////////////
function Heater(attrs){
	/*
	dims.dx corresponds to long side w/ wires
	dims.dy corresponds to short side
	*/
	this.dims = defaultTo(V(100,40), attrs.dims);
	if(attrs.wallInfo){
		this.pos = this.centerOnWall(attrs.wallInfo, this.dims);
	}else{
		this.pos = attrs.pos;
	}
	this.handle = defaultTo('heaty', attrs.handle);
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.cornerRound = .2;
	this.temp = defaultTo(0, attrs.init);
	this.tempMax = defaultTo(35, attrs.max);
	this.tempMin = -this.tempMax;
	this.rot = defaultTo(0, attrs.rotation);
	if(attrs.slider){
		this.slider = attrs.slider;
		this.setSliderVal(this.temp);
	}
	this.center = this.pos.copy().movePt(this.dims.copy().mult(.5));
	var colMax = Col(200,0,0);
	var colMin = Col(0,0,200);
	var colDefault = Col(100, 100, 100);
	this.draw = this.makeDrawFunc(colMin, colDefault, colMax);
	this.wallPts = this.pos.roundedRect(this.dims, .3, 'ccw');
	this.eAdded=0;
	return this.init();
}

Heater.prototype = {
	setTemp: function(val){		
		this.temp = .02*(val-50)*this.tempMax
	},
	setSliderVal: function(){
		var sliderVal = this.temp/(.02*this.tempMax)+50;
		$('#'+this.slider).slider('option', {value:sliderVal});
	},
	makeDrawFunc: function(colMin, colDefault, colMax){
		var pos = this.pos;
		var dims = this.dims;
		var rnd = this.cornerRound;
		this.pts = this.getPts(pos, dims);
		rotatePts(this.pts, this.center, this.rot);
		var colorSteps = this.getColorSteps(colMin, colDefault, colMax)
		var self = this;
		var pts = this.pts;
		var drawFunc = function(){
			var sign = getSign(self.temp);
			var steps = colorSteps[String(sign)];
			var fracToEnd = sign*self.temp/self.tempMax
			var curCol = colDefault.copy().adjust(steps[0]*fracToEnd, steps[1]*fracToEnd, steps[2]*fracToEnd);
			draw.path(pts, curCol, self.drawCanvas);
		}
		return drawFunc;
	},
	centerOnWall: function(wallInfo, dims){
		var wall = walls[wallInfo];
		var center = (wall[3].x + wall[2].x)/2;
		var floor = wall[2].y;
		var floorSpacing = 30;
		var x = center - dims.dx/2;
		var y = floor - floorSpacing - dims.dy;
		return P(x, y);
	},
	getPts: function(pos, dims, rnd){
		var pts = new Array();
		var circlePos = pos.copy().movePt({dy:dims.dy/2});
		
		var forwardDx = dims.dy/2+2.5;
		var backwardDx = dims.dy/2-2.5;
		var numElipses = Math.floor((dims.dx-2*forwardDx)/(2*(forwardDx - backwardDx)));
		pts.push(circlePos.copy().movePt({dy:200}));
		pts.push(circlePos.copy());
		pts = pts.concat(this.halfElipse(circlePos, forwardDx, dims.dy/2, 0, 5));
		circlePos.movePt({dx:2*forwardDx});
	
		for (var elipseIdx=0; elipseIdx<numElipses; elipseIdx++){
			pts = pts.concat(this.halfElipse(circlePos, backwardDx, dims.dy/2, Math.PI, 5));
			circlePos.movePt({dx:-2*backwardDx});
			pts = pts.concat(this.halfElipse(circlePos, forwardDx, dims.dy/2, 0, 5));
			circlePos.movePt({dx:2*forwardDx});
		}
		
		pts.push(circlePos.copy());
		pts.push(circlePos.copy().movePt({dy:200}));
		this.endX = pts[pts.length-1].x;
		this.dims = V(this.endX-this.pos.x, dims.dy);
		this.center = this.pos.copy().movePt(this.dims.copy().mult(.5));
		return pts;
	},
	halfElipse: function(start, rx, ry, rot, numPts){
		//hey - this goes UP TO the point to complete the half circle
		var numPts = defaultTo(5, numPts);
		var pts = new Array(numPts);
		var rotPerPt = Math.PI/(numPts);
		var center = start.x + rx;
		var arcRot = Math.PI;
		for (var ptIdx=0; ptIdx<numPts; ptIdx++){
			var x = center + rx*Math.cos(arcRot);
			var y = start.y + ry*Math.sin(arcRot);
			pts[ptIdx] = P(x, y);
			arcRot += rotPerPt;
		}
		rotatePts(pts, start, rot);
		return pts;
	},
	getColorSteps: function(min, def, max){
		var steps = {};
		var down = [min.r-def.r, min.g-def.g, min.b-def.b];
		var up = [max.r-def.r, max.g-def.g, max.b-def.b];
		steps['-1']=down;
		steps['1']=up;
		return steps;
	},
	init: function(){
		addListener(curLevel, 'update', 'drawHeater'+this.handle, this.draw, '');
		this.setupWalls()
		this.eAdded=0;
		return this;
	},
	setupWalls: function(){
		//legs don't go into collision - too little space between lines
		walls.addWall(this.wallPts, {func:this.hit, obj:this}, 'heater' + this.handle, undefined, -1, undefined, false);
	},
	hit: function(dot, wallIdx, subWallIdx, wallUV, vPerp, perpUV){
		walls.reflect(dot, wallUV, vPerp);
		if(this.temp!=0){
			var tempOld = dot.temp();
			var tempNew = Math.max(tempOld + this.temp, 50);
			dot.setTemp(tempNew);
			this.eAdded+=(tempNew-tempOld)*cv/N*JtoKJ;
		}
	},
	remove: function(){
		removeListener(curLevel, 'update', 'drawHeater'+this.handle);
		walls.removeWall('heater' + this.handle);
	}
}
//////////////////////////////////////////////////////////////////////////
//STOPS
//////////////////////////////////////////////////////////////////////////
function Stops(attrs){
	//assumes canvas of c.  I mean, where else would they be?
	this.stopWidth = 20;
	this.stopHeight = 5;
	var stopPt = attrs.stopPt;
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.pts = walls[this.wallInfo];
	
	if(stopPt.volume){
		var width = this.pts[0].distTo(this.pts[1]);
		var length = stopPt.volume/(vConst*width);
		this.height = this.pts[2].y-length;
	}else if (stopPt.height){
		this.height = stopPt.height;
	}

	this.draw = this.makeDrawFunc(this.height);
	return this.init();
}
Stops.prototype = {
	makeDrawFunc: function(height){
		var pLeft = this.pts[3].copy().position({y:height});
		var pRight = this.pts[2].copy().position({y:height}).movePt({dx:-this.stopWidth});
		var stopWidth = this.stopWidth;
		var stopHeight = this.stopHeight;
		var dims = V(stopWidth, stopHeight);
		var borderColLocal = borderCol;
		return function(){
			draw.fillRect(pLeft, dims, borderColLocal, c);
			draw.fillRect(pRight, dims, borderColLocal, c);
		}
	},
	init: function(){
		this.yMaxSave = walls[this.wallInfo].bounds.yMax;
		walls.setBounds(this.wallInfo, {yMax:this.height});
		addListener(curLevel, 'update', 'drawStops' + this.wallInfo, this.draw, '');
		return this;
	},
	remove: function(){
		walls.setBounds(this.wallInfo, {yMax:this.yMaxSave});
		removeListener(curLevel, 'update', 'drawStops' + this.wallInfo);
		return this;
	},
}
//////////////////////////////////////////////////////////////////////////
//STATE LISTENER
//////////////////////////////////////////////////////////////////////////
function StateListener(attrs){
	this.condition = attrs.condition;
	this.checkAgainst = attrs.checkAgainst;//can be func that returns value or list
	this.recordAtSatisfy = defaultTo({}, attrs.recordAtSatisfy);
	this.tolerance = defaultTo(.05, attrs.tolerance);
	this.atSatisfyFunc = defaultTo(undefined, attrs.atSatisfyFunc);

	this.amSatisfied = false;

	return this.init();
}
StateListener.prototype = {
	init: function(){
		var handle = 'StateListener' + this.condition + Math.round(Math.random()*10000);
		addListener(curLevel, 'data', handle,
			function(){
				if(this.checkAgainst instanceof Array){
					var last = this.checkAgainst[this.checkAgainst.length-1];
				} else {
					var last = this.checkAgainst();
				}
				if(fracDiff(this.condition, last)<this.tolerance){
					this.amSatisfied = true;
					this.recordVals();
					if(this.atSatisfyFunc){
						this.atSatisfyFunc.func.apply(this.atSatisfyFunc.obj);
					}
					removeListener(curLevel, 'data', handle);
				}
			},
		this);
	},
	recordVals: function(){
		this.results = {}
		for (var recordName in this.recordAtSatisfy){
			var sourceList = this.recordAtSatisfy[recordName];
			this.results[recordName] = sourceList[sourceList.length-1];
		}
	},
	isSatisfied: function(){
		return this.amSatisfied;
	},
	getResults: function(){
		if(this.results){
			return this.results;
		}else{
			return 'no results from ' + this.condition + 'listener yet';
		}
	},
}