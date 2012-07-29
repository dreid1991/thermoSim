//////////////////////////////////////////////////////////////////////////
//DRAG WEIGHTS
//////////////////////////////////////////////////////////////////////////

function DragWeights(weightDefs, zeroY, pistonY, binY, eBarX, weightCol, binCol, massInit, readout, wallInfo, wallHandler, obj){
	this.zeroY = zeroY;
	this.pistonY = pistonY;
	this.binY = binY;
	this.weightCol = weightCol;
	this.wallHandler = wallHandler;
	this.eBarCol = this.weightCol;
	this.wallIdx = walls.idxByInfo(wallInfo);
	this.wall = walls[this.wallIdx];
	this.eBar = {x:eBarX, scalar: .7};
	this.binCol = binCol;
	this.binHeight = 65;
	this.binSlant = 1.3;
	this.storeBinWidth = 110;
	this.storeBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.weightDimRatio = .5;
	this.weightScalar = 40;
	this.moveSpeed = 20;
	this.pistonMass = massInit;
	this.massChunkName = 'dragWeights';
	this.massInit = massInit
	this.eAdded = 0;
	this.pressure = this.getPressure();
	this.readout = readout;
	this.moveToDropOrders = [];
	this.moveToPistonOrders = [];
	this.weightsOnPiston = [];
	this.tempWeightDefs = weightDefs;
	this.flySpeed = 20;
	this.eBarFont = '12pt Calibri';
	this.eBarFontCol = Col(255,255,255);
	this.addStdReadoutEntries();
	var self = this;
	if(obj){
		addListener(obj, 'init', 'dragWeights', this.init, this);
	}

	this.wall.setMass(this.massChunkName, this.massInit);
	this.trackEnergy = true;
	this.trackMass = true;
	this.trackPressure = false;
	return this;
}

DragWeights.prototype = {
	init: function(){
		this.weightGroups = this.makeWeights(this.tempWeightDefs);
		this.bins = {};
		this.bins['store'] = this.makeStoreBins();
		this.bins['piston'] = this.makePistonBins();
		//this.dropAllstores();
		this.wall.moveInit();
		addListener(curLevel, 'update', 'moveWeightsOnPiston', this.moveWeightsOnPiston, this);
		walls.setSubWallHandler(this.wallIdx, 0, this.wallHandler);
		addListener(curLevel, 'update', 'drawDragWeights', this.draw, this);
		addListener(curLevel, 'mousedown', 'weights', this.mousedown, this);
		addListener(curLevel, 'reset', 'dragWeights', this.reset, this);
		this.dropAllIntoStores();
		delete this.tempWeightDefs;
		return this;
		
	},
	remove: function(){
		this.wall.moveStop();
		removeListener(curLevel, 'update', 'moveWalls');
		removeListener(curLevel, 'update', 'moveWeightsOnPiston');
		removeListener(curLevel, 'update', 'drawDragWeights');
		removeListener(curLevel, 'mousedown', 'weights');
		removeListener(curLevel, 'reset', 'dragWeights');
		if(this.trackEnergy){
			this.readout.removeEntry('eAdd');
		}
		if(this.trackMass){
			this.readout.removeEntry('mass');
		}
		if(this.trackPressure){
			this.readout.removeEntry('pressure');
		}
	},
	trackEnergyStart: function(){
		this.trackEnergy = true;
		if(!this.readout.entryExists('eAdd')){
			this.addEnergyEntry();
		}
		return this;
	},
	trackEnergyStop: function(){
		this.trackEnergy = false;
		this.readout.removeEntry('eAdd');
		return this;
	},
	trackMassStart: function(){
		this.trackMass = true;
		if(!this.readout.entryExists('mass')){
			this.addMassEntry();
		}
		return this;
	},
	trackMassStop: function(){
		this.trackMass = false;
		this.readout.removeEntry('mass');
		return this;
	},
	trackPressureStart: function(){
		this.trackPressure = true;
		if(!this.readout.entryExists('pressure')){
			this.addPressureEntry();	
		}
		return this;
	},
	trackPressureStop: function(){
		this.trackPressure = false;
		this.readout.removeEntry('pressure');	
		return this;
	},
	addStdReadoutEntries: function(){
		this.addEnergyEntry();
		this.addMassEntry();
	},
	addEnergyEntry: function(){
		this.readout.addEntry('eAdd', 'E Added:', 'kJ', this.eAdded, undefined, 1);
	},
	addMassEntry: function(){
		this.readout.addEntry('mass', 'Mass:', 'kg', this.pistonMass, undefined, 0);
	},
	addPressureEntry: function(){
		this.readout.addEntry('pressure', 'Pressure:', 'atm', this.pressure, undefined, 1); 
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
				weightGroup.weights.push(weight)
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
		bin.pts = this.getBinPts(posX);
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
	getBinPts: function(posX){
		var pts = []
		var thickness = 5;
		pts.push(P(posX - this.binSlant*this.storeBinWidth/2, this.binY - this.binHeight));
		pts.push(P(posX - this.storeBinWidth/2, this.binY));
		pts.push(P(posX + this.storeBinWidth/2, this.binY));
		pts.push(P(posX + this.binSlant*this.storeBinWidth/2, this.binY - this.binHeight));
		pts.push(P(posX + this.binSlant*this.storeBinWidth/2+thickness, this.binY - this.binHeight));
		pts.push(P(posX + this.storeBinWidth/2 + thickness, this.binY +thickness));
		pts.push(P(posX - this.storeBinWidth/2 - thickness, this.binY +thickness));
		pts.push(P(posX - this.binSlant*this.storeBinWidth/2 - thickness, this.binY - this.binHeight));
		pts.push(P(posX - this.binSlant*this.storeBinWidth/2, this.binY - this.binHeight));
		return pts;
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
		return function(){return walls[0][0].y-val}
	},
	dropAllIntoStores: function(){
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++){
				var weight = weightGroup.weights[weightIdx];
				if(weight.status=='piston'){
					weight.status = 'inTransit';
					weight.slot.isFull = false;
					this.takeOffPiston(weight);
					this.dropIntoBin(weight, 'store');
				}else if(weight.status!='store' && weight.status!='inTransit'){
					weight.status = 'inTransit';
					this.dropIntoBin(weight, 'store');
				}//NOTE - BLOCKS AREADY MOVING WILL NOT GET DROPPED. SHOULD ADD DESTINATION AND IF DEST==PISTON, DROP TO BIN
				
			}
		}
	},
	dropIntoBin: function(weight, binType){
		weight.status = 'inTransit';
		var dropSlotInfo = this.getDropSlot(weight.name, binType);
		var slot = dropSlotInfo.slot;
		slot.isFull = true;
		var slotIdNum = dropSlotInfo.id;
		var listenerName = 'moveWeight'+weight.name+binType+slotIdNum;
		addListener(curLevel, 'update', listenerName,
			function(){
				var slotY = slot.y();
				var UV = V(slot.x-weight.pos.x, slotY-weight.pos.y).UV();
				weight.pos.x = boundedStep(weight.pos.x, slot.x, UV.dx*this.moveSpeed);
				weight.pos.y = boundedStep(weight.pos.y, slotY, UV.dy*this.moveSpeed);
				if(this.weightArrived(weight, slot)){
					removeListener(curLevel, 'update', listenerName);
					weight.slot = slot;
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
				draw.fillRect(weights[weightIdx].pos, dims, this.weightCol, drawCanvas);
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
				var y = bin.y - this.binHeight+20;
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
			this.readout.tick(this.pistonMass, 'mass');
		}
		if(this.trackPressure){
			this.readout.tick(this.pressure, 'pressure');
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
			this.readout.tick(this.pistonMass, 'mass');
		}
		if(this.trackPressure){
			this.readout.tick(this.pressure, 'pressure');
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
				this.readout.tick(this.eAdded, 'eAdd');
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
}
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
//PISTON
//////////////////////////////////////////////////////////////////////////

function Piston(handle, wallInfo, pInit, obj){
	var self = this;
	this.p = pInit;
	this.slant = .07;
	this.drawCanvas = c;
	this.wallIdx = walls.idxByInfo(wallInfo);
	this.wall = walls[this.wallIdx];
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
	obj.mass = function(){return self.mass};
	this.wall.moveInit();
	walls.setSubWallHandler(this.wallIdx, 0, {func:obj.cPAdiabaticDamped, obj:obj});		
	this.obj = obj;
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
	},
	hide: function(){
		removeListener(curLevel, 'update', 'drawPiston'+this.handle);
		this.readout.hide();
	},
	setP: function(p){
		var pSetPt = p;
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
	setMass: function(){
		this.mass = this.p*this.width/(pConst*g);
		this.wall.setMass('piston' + this.handle, this.mass);
	},
	setReadoutY: function(){
		this.readout.position({y:this.pistonBottom.pos.y-2+this.y()});
	},
	trackWork: function(){
		var self = this;
		this.workTracker = new WorkTracker(
						'pistonWorkTracker',
						function(){return self.y()},
						this.width,
						function(){return self.mass},
						{readout:this.readout, idx:undefined}
						);
		this.workTracker.start();
	},
	trackWorkStart: function(){
		this.workTracker.start();
	},
	trackWorkStop: function(){
		this.workTracker.stop();
	},
	trackPressure: function(){
		this.addData('pressure', 'P:', this.p, 'atm');
		this.trackingP = new Boolean();
		this.trackingP = true;
	},
	trackPressureStart: function(){
		if(!this.trackingP){
			this.addData('pressure', 'P:', this.p, 'atm');
			this.trackingP = true;
		}
	},
	trackPressureStop: function(){
		this.removeData('pressure')
		this.trackingP = false;
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
		this.readout.hardUpdate(value, handle);
	},
	remove: function(){
		this.wall.moveStop();
		this.obj.mass = undefined;
		this.hide();
		removeListener(curLevel, 'update', 'moveWalls');
	}
}

//////////////////////////////////////////////////////////////////////////
//HEATER
//////////////////////////////////////////////////////////////////////////
function Heater(handle, pos, dims, rotation, tempMax, drawCanvas){
	/*
	dims.dx corresponds to long side w/ wires
	dims.dy corresponds to short side
	need to correlate Cp, Cv to get energy from temperature
	*/
	this.handle = handle;
	this.drawCanvas = drawCanvas;
	this.cornerRound = .2;
	this.temp = 0;
	this.tempMax = tempMax;
	this.pos = pos;
	this.dims = dims;
	this.rot = rotation;
	var colMax = Col(200,0,0);
	var colMin = Col(0,0,200);
	var colDefault = Col(100, 100, 100);
	this.draw = this.makeDrawFunc(colMin, colDefault, colMax);
	this.eAdded=0;
}

Heater.prototype = {
	setTemp: function(val){
		var sign = getSign(val)
		this.temp = sign*Math.min(this.tempMax,sign*val);
	},
	makeDrawFunc: function(colMin, colDefault, colMax){
		var pos = this.pos;
		var dims = this.dims;
		var rnd = this.cornerRound;
		var legThickness = 10;

		var center = this.pos.copy().movePt(dims.copy().mult(.5));
		this.bodyPts = getBodyPts(pos, dims, rnd);
		this.legPts = getLegPts(pos, dims, legThickness, center);
		rotatePts(this.bodyPts, center, this.rot);
		rotatePts(this.legPts[0], center, this.rot);
		rotatePts(this.legPts[1], center, this.rot);
		var colorSteps = getColorSteps(colMin, colDefault, colMax)
		var strokeCol = Col(0,0,0)
		var self = this;
		var bodyPts = this.bodyPts;
		var leg1 = this.legPts[0];
		var leg2 = this.legPts[1];
		var drawFunc = function(){
			var sign = getSign(self.temp);
			var steps = colorSteps[String(sign)];
			var fracToEnd = sign*self.temp/self.tempMax
			var curCol = colDefault.copy().adjust(steps[0]*fracToEnd, steps[1]*fracToEnd, steps[2]*fracToEnd);
			draw.fillPtsStroke(bodyPts, curCol, curCol, self.drawCanvas);
			draw.fillPtsStroke(leg1, colDefault, colDefault, self.drawCanvas);
			draw.fillPtsStroke(leg2, colDefault, colDefault, self.drawCanvas);
			
		}
		return drawFunc;
	},
	getBodyPts: function(pos, dims, rnd){
		var pts = new Array(8);
		pts[0] = pos.copy().movePt({						dy:dims.dy*rnd			});
		pts[1] = pos.copy().movePt({						dy:dims.dy*(1-rnd)		});
		pts[2] = pos.copy().movePt({dx:dims.dx*rnd,		dy:dims.dy				});
		pts[3] = pos.copy().movePt({dx:dims.dx*(1-rnd),	dy:dims.dy				});
		pts[4] = pos.copy().movePt({dx:dims.dx, 			dy:dims.dy*(1-rnd)		});
		pts[5] = pos.copy().movePt({dx:dims.dx, 			dy:dims.dy*rnd			});
		pts[6] = pos.copy().movePt({dx:dims.dx*(1-rnd)							});
		pts[7] = pos.copy().movePt({dx:dims.dx*rnd								});	
		return pts;
	},
	getLegPts: function(pos, dims, width, center){
		var legs = [new Array(4), new Array(4)];
		var leg = legs[0]
		leg[0] = pos.copy().movePt({dx:dims.dx*.25-width/2,	dy:dims.dy	});
		leg[1] = pos.copy().movePt({dx:-width/2,	dy:dims.dy+150	});
		leg[2] = pos.copy().movePt({dx:+width/2,	dy:dims.dy+150	});
		leg[3] = pos.copy().movePt({dx:dims.dx*.25+width/2,	dy:dims.dy	});
		
		for (var ptIdx=0; ptIdx<leg.length; ptIdx++){
			legs[1][ptIdx]=legs[0][ptIdx].copy()
		}
		mirrorPts(legs[1], center, V(0, 1));
		return legs;
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
	},
	setupWalls: function(){
		//legs don't go into collision - too little space between lines
		walls.addWall(this.bodyPts, {func:this.hit, obj:this});
	},
	hit: function(dot, line, wallUV, vPerp, perpUV){
		var vPar = dot.v.dotProd(wallUV);
		var tempOld = dot.temp();
		var tempNew = tempOld + this.temp;
		var vTotOld = dot.v.mag();
		var vTotNew = vTotOld*Math.sqrt(tempNew/tempOld);
		var vPerpNew = Math.sqrt(vTotNew*vTotNew - vPar*vPar);
		dot.v.dx = wallUV.dx*vPar + perpUV.dx*vPerpNew;
		dot.v.dy = wallUV.dy*vPar + perpUV.dy*vPerpNew;
		this.eAdded+=this.temp*R/N;
	},

}
//////////////////////////////////////////////////////////////////////////
//STOPS
//////////////////////////////////////////////////////////////////////////
function Stops(volume, wallInfo){
	//assumes canvas of c.  I mean, where else would they be?
	this.stopWidth = 20;
	this.stopHeight = 5;
	var wallsLocal = walls;
	this.wallIdx = wallsLocal.idxByInfo(wallInfo);
	this.pts = wallsLocal[this.wallIdx];
	var width = this.pts[0].distTo(this.pts[1]);
	var length = volume/(vConst*width);
	this.height = this.pts[2].y-length;

	this.draw = this.makeDrawFunc(this.height);
	return this;
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
		this.yMaxSave = curLevel.yMax;
		walls.setBounds(this.wallIdx, {yMax:this.height});
		addListener(curLevel, 'update', 'drawStops' + this.wallIdx, this.draw, '');
		return this;
	},
	remove: function(){
		walls.setBounds(this.wallIdx, {yMax:this.yMaxSave});
		removeListener(curLevel, 'update', 'drawStops' + this.wallIdx);
		return this;
	},
}
//////////////////////////////////////////////////////////////////////////
//STATE LISTENER
//////////////////////////////////////////////////////////////////////////
function StateListener(condition, checkList, tolerance, recordAtSatisfy, atSatisfyFunc){
	this.condition = condition;
	this.checkList = checkList;
	this.recordAtSatisfy = recordAtSatisfy;
	this.tolerance = .07;
	if(tolerance){
		this.tolerance = tolerance;
	}
	this.amSatisfied = false;
	this.atSatisfyFunc = atSatisfyFunc;
	this.init();
	return this;
}
StateListener.prototype = {
	init: function(){
		addListener(curLevel, 'data', 'StateListener' + this.condition,
			function(){
				var last = this.checkList[this.checkList.length-1];
				if(fracDiff(this.condition, last)<this.tolerance){
					this.amSatisfied = true;
					this.recordVals();
					if(this.atSatisfyFunc){
						this.atSatisfyFunc.func.apply(this.atSatisfyFunc.obj);
					}
					removeListener(curLevel, 'data', 'StateListener' + this.condition);
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
		return this.results;
	},
}