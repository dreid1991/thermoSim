/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function DragWeights(attrs){
	//Can probably remove energy bar stuff
	this.type = 'DragWeights';
	this.handle = 				attrs.handle;
	this.tempWeightDefs = 		attrs.weightDefs;
	this.wallInfo = 			defaultTo(0, attrs.wallInfo);
	this.wall = 				walls[this.wallInfo];
	this.zeroY = 				defaultTo(this.wall[2].y, attrs.min);
	this.pistonPt =				defaultTo(this.wall[0], attrs.pistonPt); //this will not work with just data based levels.  If I want this, will need to store as {wallInfo, ptIdx}
	this.pistonOffset =			defaultTo(undefined, attrs.pistonOffset);
	this.wallHandler = 			defaultTo('cPAdiabaticDamped', attrs.compMode);
	this.binY = 				defaultTo(myCanvas.height-15, attrs.binY);
	this.blockCol = 			defaultTo(Col(224, 165, 75), attrs.blockCol);
	this.binCol = 				defaultTo(Col(150, 150, 150), attrs.binCol);
	
	attrs.pInit !== undefined ? this.massInit = this.pressureToMass(attrs.pInit) : this.massInit = this.pressureToMass(1);

	this.binHeight = 			defaultTo(45, attrs.binHeight);
	this.weightDimRatio = 		defaultTo(.5, attrs.weightDimRatio);
	this.moveSpeed =			defaultTo(20, attrs.moveSpeed);
	this.weightScalar = 		defaultTo(70, attrs.weightScalar);//specific volume
	this.displayText = 			defaultTo(true, attrs.displayText);
	
	this.binSlant = 1.3;
	this.storeBinWidth = 110;
	this.storeBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.mass = this.massInit;
	this.massChunkName = 'dragWeights';
	this.weightsOnPiston = [];
	this.font = '12pt Calibri';
	this.fontCol = Col(255,255,255);
	this.binThickness = 5;
	
	this.trackingPts = [];
	this.wall.setMass(this.massChunkName, this.massInit);
	this.wall.recordPExt();
	this.wall.recordWork();
	this.wall.recordMass();
	
	this.setupStd();
	return this.init();
}

_.extend(DragWeights.prototype, objectFuncs, compressorFuncs, {
	init: function(){
		this.weightGroups = this.makeWeights(this.tempWeightDefs);
		this.bins = {};
		this.bins.store = this.makeStoreBins();
		this.bins.piston = this.makePistonBins();
		//this.dropAllstores();
		this.savedWallHandler = this.wall.handlers[0];
		walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);
		if (!this.displayText) {
			this.draw = this.drawNoText;
		}
		addListener(curLevel, 'update', 'drawDragWeights' + this.wallInfo, this.draw, this);
		this.enable();
		this.wall.moveInit();
		this.dropAllIntoBins('instant');
		delete this.tempWeightDefs;
		return this;
		
	},
	remove: function(){
		this.wall.moveStop();
		this.trackingPts.map(function(pt) {pt.trackStop();});
		this.trackingPts.splice(0, this.trackingPts.length);
		walls.setSubWallHandler(walls.indexOf(this.wall), 0, this.savedWallHandler);
		removeListener(curLevel, 'update', 'drawDragWeights' + this.wallInfo);
		removeListener(curLevel, 'mousedown', 'weights' + this.wallInfo);
	},
	getWeightDims: function(weightDefs){
		var dims = {};
		var adjBinWidth = this.storeBinWidth - this.blockSpacing;
		var maxWidth = 0;
		var maxMass = 0;
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			var weightDef = weightDefs[groupIdx];

			var width = Math.sqrt(weightDef.mass*this.weightScalar/this.weightDimRatio);
			
			if (Math.max(width, maxWidth) > maxWidth) {
				maxMass = weightDef.mass;
				maxWidth = width;
			}
			var height = width*this.weightDimRatio;
			dims[weightDef.name] = V(width, height);
		}
		if (maxWidth > adjBinWidth) {
			this.weightScalar = .99 * adjBinWidth * adjBinWidth * this.weightDimRatio / maxMass;
			return this.getWeightDims(weightDefs);
		}
		return dims;
	},
	
	nameWeights: function(weightDefs) {
		for (var weightIdx=0; weightIdx<weightDefs.length; weightIdx++) {
			weightDefs[weightIdx].name = 'grp' + weightIdx;
		}
	},
	assignMasses: function(weightDefs) {//pressure is the pressure per block
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			weightDef = weightDefs[groupIdx];
			weightDef.mass = this.pressureToMass(weightDef.pressure);
		}
	},
	makeWeights: function(weightDefs){
		this.nameWeights(weightDefs);
		var weightGroups = {};
		this.assignMasses(weightDefs);
		var weightDims = this.getWeightDims(weightDefs)
		var weightId = 0;
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			var weightDef = weightDefs[groupIdx];
			var weightGroup = {}; 
			weightGroup.name = weightDef.name;
			weightGroup.dims = weightDims[weightGroup.name];
			weightGroup.pressure = weightDef.pressure;
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
		if (this.pistonOffset) {
			var xOffset = this.pistonOffset.dx
			bin.pos = P(posX - this.pistonBinWidth/2, 0).movePt({dx:xOffset}).track({pt:this.pistonPt, noTrack:'x', offset:{dy:this.pistonOffset.dy}});
		} else {
			bin.pos = P(posX - this.pistonBinWidth/2, 0).track({pt:this.pistonPt, noTrack:'x'});
		}
		this.trackingPts.push(bin.pos);
		bin.slots = this.getPistonBinSlots(bin.pos, weightGroup);
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
				var pos = P(x, y);
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, pos, weightGroup.name, 'store', rowIdx, colIdx));
				x += dims.dx+this.blockSpacing;
			}
			slots.push(row);
			y -= dims.dy+this.blockSpacing;
		}
		return slots;
		
	},
	//HEY - GENERALIZE THESE TWO
	getPistonBinSlots: function(binPos, weightGroup){
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(this.pistonBinWidth/(dims.dx + this.blockSpacing));
		var usedWidth = numCols*(dims.dx+this.blockSpacing);
		var unusedWidth = this.pistonBinWidth-usedWidth;
		startX = binPos.x + unusedWidth/2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var yOffset = this.blockSpacing;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var blockX = startX + this.blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				var pos = P(blockX, 0).track({pt:binPos, offset:{dy:-(yOffset+dims.dy)}, noTrack:'x'});
				this.trackingPts.push(pos);
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, pos, weightGroup.name, 'piston', rowIdx, colIdx));
				blockX += dims.dx+this.blockSpacing;
			}
			slots.push(row);
			yOffset += dims.dy+this.blockSpacing;
		}
		return slots;
		
	},
	newSlot: function(isFull, pos, name, type, row, col){
		return {isFull:isFull, pos:pos, name:name, type:type, row:row, col:col};
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
		for (var weightName in this.weightGroups) {
			var weightGroup = this.weightGroups[weightName];
			var weights = weightGroup.weights;
			var mass = weightGroup.mass;
			for (var weightIdx=0; weightIdx<weights.length; weightIdx++) {
				if (weights[weightIdx].status=='piston') totalMass+=mass;
			}
		}
		return totalMass+this.massInit;
	},
	dropAllIntoBins: function(special){
		for (var group in this.weightGroups) {
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++) {
				var weight = weightGroup.weights[weightIdx];
				if (weight.status=='piston') {
					weight.status = 'inTransit';
					weight.slot.isFull = false;
					this.takeOffPiston(weight);
					this.dropIntoBin(weight, 'store', special);
				} else if(weight.status!='store'/* && weight.status!='inTransit'*/) {
					weight.status = 'inTransit';
					this.dropIntoBin(weight, 'store', special);
				}//NOTE - BLOCKS AREADY MOVING WILL NOT GET DROPPED. SHOULD ADD DESTINATION AND IF DEST==PISTON, DROP TO BIN
				
			}
		}
		return this;
	},
	dropAllOntoPiston: function(special){
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
		var self = this;
		weight.status = 'inTransit';
		var dropSlotInfo = this.getDropSlot(weight.name, binType);
		var slot = dropSlotInfo.slot;
		slot.isFull = true;
		weight.slot = slot;
		var slotIdNum = dropSlotInfo.id;
		if (special == 'instant') {
			this.dropInstant(weight, slot);
		} else {

			var uniqueNamePiece = weight.name+weight.id + 'endId' + this.wallInfo;
			var listenerName = 'moveWeight'+ uniqueNamePiece + binType+slotIdNum;
			if (removeListenerByName(curLevel, 'update', uniqueNamePiece)) {
				weight.slot.isFull = false;
				weight.slot = undefined;
			};
			
			addListener(curLevel, 'update', listenerName,
				function(){
					var slotPos = slot.pos;
					var UV = V(slotPos.x-weight.pos.x, slotPos.y-weight.pos.y).UV();
					if (validNumber(UV.dx) !== false && validNumber(UV.dy) !== false) {
						weight.pos.x = stepTowards(weight.pos.x, slotPos.x, UV.dx*this.moveSpeed);
						weight.pos.y = stepTowards(weight.pos.y, slotPos.y, UV.dy*this.moveSpeed);
					}
					if (this.weightArrived(weight, slot)) {
						removeListener(curLevel, 'update', listenerName);
						//weight.slot = slot;
						self.placeWeight(weight, slot);
					}
				},
			this);
		}
	},
	placeWeight: function(weight, slot) {
		weight.status = slot.type;
		if (weight.status=='piston') {
			this.putOnPiston(weight, slot);
		}
	},
	dropInstant: function(weight, slot) {
		weight.pos = slot.pos.copy();
		this.placeWeight(weight, slot);
	},
	weightArrived: function(weight, slot){
		return weight.pos.sameAs(slot.pos);
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
	getNumGroups: function(){
		var count = 0;
		for (idx in this.weightGroups){
			count++;
		}
		return count;
	},
	draw: function() {
		this.drawWeights();
		this.drawBins();
		this.drawBinLabels();
	},
	drawNoText: function() {
		this.drawWeights();
		this.drawBins();	
	},
	drawWeights: function(){
		var drawCanvas = c;
		for (var group in this.weightGroups) {
			var weightGroup = this.weightGroups[group]
			var weights = weightGroup.weights;
			var dims = weightGroup.dims;
			for (var weightIdx=0; weightIdx<weights.length; weightIdx++) {
				draw.fillRect(weights[weightIdx].pos, dims, this.blockCol, drawCanvas);
			}
		}
	},
	drawBins: function(){
		var drawCanvas = c;
		for (var binType in this.bins) {
			var typeBins = this.bins[binType];
			for (var binSize in typeBins) {
				var bin = typeBins[binSize];
				if (bin.visible) {
					draw.fillPts(bin.pts, this.binCol, drawCanvas);
				}
			}
		}
	},
	drawBinLabels: function(){
		for (var binName in this.bins.store) {
			var bin = this.bins.store[binName];
			if (bin.visible) {
				var x = bin.x + this.storeBinWidth/2
				var y = bin.y - this.binHeight;
				var mass = this.weightGroups[binName].pressure;
				var text = mass + ' bar each';
				draw.text(text, P(x, y), this.font, this.fontCol, 'center', 0, c);
			}
		}
	},
	putOnPiston: function(weight, slot){
		this.weightsOnPiston.push(weight);
		weight.pos.track({pt:slot.pos, noTrack:'x'});
		this.trackingPts.push(weight.pos);
		weight.status = 'piston';
		this.mass = this.getPistonMass();
		this.wall.setMass(this.massChunkName, this.mass);
	},	
	takeOffPiston: function(weight){
		for (var idx=0; idx<this.weightsOnPiston.length; idx++) {
			if (weight==this.weightsOnPiston[idx]) {
				this.weightsOnPiston.splice([idx],1);
			}
		}
		weight.pos.trackStop();
		this.trackingPts.splice(this.trackingPts.indexOf(weight.pos), 1);
		this.mass = this.getPistonMass();
		this.wall.setMass(this.massChunkName, this.mass);
	},
	mousedown: function(){
		var clicked = this.getClicked();
		if (clicked) {
			this.pickup(clicked);
			if (this.selected.cameFrom=='piston') {
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
		var selected = this.selected;
		this.dropIntoBin(this.selected, dest)
		delete this.origPos;
		this.selected = undefined;

	},
	getDest: function(){
		var selected = this.selected;
		var blockHeight = this.weightGroups[selected.name].dims.dy;
		if(selected.cameFrom=='piston' || selected.pos.y+blockHeight>this.zeroY){
			return 'store';
		}else{
			return 'piston';
		}
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
		return this.mass;
	},
	disable: function() {
		removeListener(curLevel, 'mousedown', 'weights' +this.wallInfo);
		this.enabled = false;
	},
	enable: function() {
		addListener(curLevel, 'mousedown', 'weights' + this.wallInfo, this.mousedown, this);
		this.enabled = true;
	},
})