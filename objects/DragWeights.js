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

function DragWeights(attrs) {
	this.type = 'DragWeights';
	this.handle = 				attrs.handle;
	this.wallInfo = 			defaultTo(0, attrs.wallInfo);
	this.wall = 				walls[this.wallInfo];
	this.zeroY = 				defaultTo(this.wall[2].y, attrs.min);
	this.pistonPt =				defaultTo(this.wall[0], attrs.pistonPt); //this will not work with just data based levels.  If I want this, will need to store as {wallInfo, ptIdx}
	this.pistonOffset =			defaultTo(undefined, attrs.pistonOffset);
	this.wallHandler = 			defaultTo('cPAdiabaticDamped', attrs.compMode);
	this.storeBinY = 				defaultTo(myCanvas.height-15, attrs.storeBinY);
	this.blockCol = 			defaultTo(Col(224, 165, 75), attrs.blockCol);
	this.binCol = 				defaultTo(Col(150, 150, 150), attrs.binCol);
	
	attrs.pInit !== undefined ? this.massInit = this.pressureToMass(attrs.pInit) : this.massInit = this.pressureToMass(1);

	this.binHeight = 			defaultTo(45, attrs.binHeight);
	this.weightDimRatio = 		defaultTo(.5, attrs.weightDimRatio);
	this.moveSpeed =			defaultTo(20, attrs.moveSpeed);
	this.weightScalar = 		defaultTo(70, attrs.weightScalar);//specific volume
	this.displayText = 			defaultTo(true, attrs.displayText);
	this.imgSrc = 
	this.binSlant = 1.3;
	this.storeBinWidth = 110;
	this.storeBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.mass = this.massInit;
	this.img = this.makeImg('brickImg');
	this.massChunkName = 'dragWeights';
	this.weightsOnPiston = [];
	this.font = '12pt Calibri';
	this.fontCol = Col(255,255,255);
	this.binThickness = 5;
	this.canvasHandle = attrs.canvasHandle || 'main';
	this.trackingPts = [];
	this.wall.setMass(this.massChunkName, this.massInit);
	this.wall.recordPExt();
	this.wall.recordWork();
	this.wall.recordMass();
	
	this.weightGroups = this.makeWeightGroups(attrs.weightDefs);
	this.addWeights(this.weightGroups);
	this.setupStd();
	this.init(attrs.weightDefs);
    if (attrs.restartDatum != null) {
        this.handleRestart(attrs.restartDatum);
    }
}

_.extend(DragWeights.prototype, objectFuncs, compressorFuncs, {
	init: function(){
		
		this.bins = new DragWeights.Bins(this, this.wall, this.weightGroups, this.storeBinSpacing, this.pistonBinSpacing, this.blockSpacing, this.pistonOffset, this.pistonPt, this.storeBinWidth, this.pistonBinWidth, this.storeBinY  );
		this.savedWallHandler = this.wall.handlers[0];
		walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);
		if (!this.displayText) {
			this.draw = this.drawNoText;
		}
		canvasManager.addListener(this.canvasHandle, 'drawDragWeights' + this.wallInfo, this.draw, this, 1);
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
		canvasManager.removeListener(this.canvasHandle, 'drawDragWeights' + this.wallInfo);
		removeListener(curLevel, 'mousedown', 'weights' + this.wallInfo);
	},
    handleRestart: function(restartDatum) {
        //this may put some weights onto piston
        for (var groupName in restartDatum) {
            if ('piston' in restartDatum[groupName]) {
                var nPiston = restartDatum[groupName]['piston'];
                for (var i=0; i<nPiston; i++) {
					this.dropIntoBin(this.weights[grpName][i], 'piston', 'instant');
                }
            }

        }
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
			dims[weightDef.handle] = V(width, height);
		}
		if (maxWidth > adjBinWidth) {
			this.weightScalar = .99 * adjBinWidth * adjBinWidth * this.weightDimRatio / maxMass;
			return this.getWeightDims(weightDefs);
		}
		return dims;
	},
	
	addDefHandles: function(weightDefs) {
		for (var weightIdx=0; weightIdx<weightDefs.length; weightIdx++) {
			weightDefs[weightIdx].handle = 'grp' + weightIdx;
		}
	},
	assignMasses: function(weightDefs) {//pressure is the pressure per block
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			weightDef = weightDefs[groupIdx];
			weightDef.mass = this.pressureToMass(weightDef.pressure);
		}
	},
	makeWeightGroups: function(weightDefs){
		this.addDefHandles(weightDefs);
		var weightGroups = {};
		this.assignMasses(weightDefs);
		var weightDims = this.getWeightDims(weightDefs)
		for (var groupIdx=0; groupIdx<weightDefs.length; groupIdx++){
			var weightDef = weightDefs[groupIdx];
			var weightGroup = new DragWeights.WeightGroup(weightDef.handle, weightDef.pressure, weightDef.mass, weightDims[weightDef.handle], weightDef.count);
			weightGroups[weightGroup.handle] = weightGroup;
		}
		return weightGroups;
	},
	addWeights: function(weightGroups) {
		var weightId = 0;
		for (var groupHandle in weightGroups) {
			var weightGroup = weightGroups[groupHandle];
			for (var weightIdx=0; weightIdx<weightGroup.count; weightIdx++){
				weightGroup.weights.push(new DragWeights.Weight(P(300, 500), weightGroup.handle, '', weightId++));
			}		
		}
	},

//Some handy enternal functions below
	binIsEmpty: function(type, handle){
		var bin = this.bins[type][handle];
		var rows = bin.slots;
		for (rowIdx=0; rowIdx<rows.length; rowIdx++){
			var row = rows[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var slot = row[colIdx]
				if (slot.isFull) {
					return false;
				}
			}
			
		}
		return true;			
	},
	weightCount: function(type, handle){
		var bin = this.bins[type][handle];
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
	binIsFull: function(type, handle){
		var bin = this.bins[type][handle];
		var rows = bin.slots;
		for (rowIdx=0; rowIdx<rows.length; rowIdx++){
			var row = rows[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var slot = row[colIdx]
				if (!slot.isFull) {
					return false;
				}
			}
			
		}
		return true;
	},
	allEmpty: function(type){
		var allEmpty = true;
		for (var binHandle in this.bins[type]){
			allEmpty = Math.min(allEmpty, this.binIsEmpty(type, binHandle));
		}
		return allEmpty;
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
		var dropSlotInfo = this.getDropSlot(weight.groupHandle, binType);
		var slot = dropSlotInfo.slot;
		slot.isFull = true;
		weight.slot = slot;
		var slotIdNum = dropSlotInfo.id;
		if (special == 'instant') {
			this.dropInstant(weight, slot);
		} else {

			var uniqueNamePiece = weight.groupHandle + weight.id + 'endId' + this.wallInfo;
			var listenerName = 'moveWeight'+ uniqueNamePiece + binType+slotIdNum;
			if (removeListenerByName(curLevel, 'update', uniqueNamePiece)) {
				weight.slot.isFull = false;
				weight.slot = undefined;
			};
			
			addListener(curLevel, 'update', listenerName,
				function() {
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
	draw: function(ctx) {
		this.drawWeights(ctx);
		this.drawBins(ctx);
		this.drawBinLabels(ctx);
	},
	drawNoText: function(ctx) {
		this.drawWeights(ctx);
		this.drawBins(ctx);	
	},
	drawWeights: function(ctx){
		for (var group in this.weightGroups) {
			var weightGroup = this.weightGroups[group]
			var weights = weightGroup.weights;
			var dims = weightGroup.dims;
			if (this.img) {
				ctx.save();
				ctx.scale(dims.dx / this.img.width, dims.dy / this.img.height);
				for (var weightIdx=0; weightIdx<weights.length; weightIdx++) {
					ctx.drawImage(this.img, weights[weightIdx].pos.x * this.img.width / dims.dx, weights[weightIdx].pos.y * this.img.height/ dims.dy);
				}
				ctx.restore();
			} else {
				for (var weightIdx=0; weightIdx<weights.length; weightIdx++) {
					draw.fillRect(weights[weightIdx].pos, dims, this.blockCol, ctx);
				}
			}
		}
	},
	drawBins: function(ctx){
		for (var binType in this.bins) {
			var typeBins = this.bins[binType];
			for (var binSize in typeBins) {
				var bin = typeBins[binSize];
				if (bin.visible) {
					draw.fillPts(bin.pts, this.binCol, ctx);
				}
			}
		}
	},
	drawBinLabels: function(ctx){
		for (var binName in this.bins.store) {
			var bin = this.bins.store[binName];
			if (bin.visible) {
				var x = bin.x + this.storeBinWidth/2
				var y = bin.y - this.binHeight;
				var mass = this.weightGroups[binName].pressure;
				var text = mass + ' bar each';
				draw.text(text, P(x, y), this.font, this.fontCol, 'center', 0, ctx);
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
		this.dropIntoBin(selected, dest)
		delete this.origPos; //why is this here?
		selected.origPos = undefined;
		this.selected = undefined;

	},
	getDest: function(){
		var selected = this.selected;
		var blockHeight = this.weightGroups[selected.groupHandle].dims.dy;
		if(selected.cameFrom=='piston' || selected.pos.y+blockHeight>this.zeroY){
			return 'store';
		}else{
			return 'piston';
		}
	},
	pickup: function(weight) {
		weight.cameFrom = weight.status;
		weight.status = 'holding';
		var mousePos = mouseOffset(myCanvas);
		if (weight.slot!==undefined) {
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
			for (var weightIdx=0; weightIdx<group.weights.length; weightIdx++) {
				var weight = group.weights[weightIdx];
				var clickedOn = inRect(weight.pos, group.dims, myCanvas);
				if (clickedOn) {
					if (weight.status=='inTransit') {
						return weight;
					} else {
						if (this.isOnTop(weight)) {
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
		return mousePos.x>=weightPos.x && mousePos.x<=weightPos.x+dims.dx && mousePos.y<=weightPos.y && mousePos.y>=weightPos.y-dims.dy ;
	},
	isOnTop: function(weight){
		var slot = weight.slot;
		var bin = this.bins[slot.type][weight.groupHandle]
		var colIdx = slot.col;
		for (var rowIdx=slot.row+1; rowIdx<bin.slots.length; rowIdx++){
			var curSlot = bin.slots[rowIdx][colIdx]
			if (curSlot.isFull) {
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
	makeImg: function(srcId) {
		var srcElem = document.getElementById(srcId);
		if (srcElem == null) return false;
		var img = new Image();
		img.src = srcElem.src;
		return img;
		
	},
    restartChunk: function() {
        //just going to store weight statuses
        var byGrpName = {};
        for (var grpName in this.weightGroups) {
            var statuses = {};
            var weightGroup = this.weightGroups[grpName];
            for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++) {
                var weight = weightGroup.weights[weightIdx];
                var stat = weight.status;
                if (! (stat in statuses)) {
                    statuses[stat] = 0;
                }
                statuses[stat] ++;
            }
            byGrpName[grpName] = statuses;
        }
        return repr(byGrpName);

    }
})


DragWeights.Bins = function(dragWeights, wall, weightGroups, storeBinSpacing, pistonBinSpacing, blockSpacing, pistonOffset, pistonPt, storeBinWidth, pistonBinWidth, storeBinY) {
	
	this.piston = this.makePistonBins(dragWeights, wall, weightGroups, pistonBinWidth, pistonBinSpacing, pistonOffset, pistonPt, blockSpacing);
	
	this.store = this.makeStoreBins(dragWeights, wall, weightGroups, storeBinWidth, storeBinSpacing, storeBinY, blockSpacing);
}

DragWeights.Bins.prototype = {
	makePistonBins: function(dragWeights, wall, weightGroups, binWidth, binSpacing, pistonOffset, pistonPt, blockSpacing) {
		var center = (wall[0].x + wall[1].x)/2;
		var bins = {};
		var numGroups = countAttrs(weightGroups);
		var posX = center - binWidth*(numGroups-1)/2 - binSpacing*(numGroups-1)/2;
		for (var groupName in weightGroups){
			var weightGroup = weightGroups[groupName];
			bins[groupName] = new DragWeights.PistonBin(dragWeights, posX, weightGroup, pistonOffset, binWidth, blockSpacing, pistonPt, V(dragWeights.pistonBinWidth, dragWeights.binHeight), dragWeights.binSlant, dragWeights.binThickness);//this.makePistonBin(posX, weightGroup);
			posX += binWidth + binSpacing;
		}
		return bins;		
	},
	makeStoreBins: function(dragWeights, wall, weightGroups, binWidth, binSpacing, binY, blockSpacing) {
		var center = (wall[0].x + wall[1].x) / 2;
		var bins = {};
		var numGroups = countAttrs(weightGroups);
		var posX = center - binWidth * (numGroups - 1) / 2 - binSpacing * (numGroups - 1) / 2;
		for (var groupHandle in weightGroups) {
			var weightGroup = weightGroups[groupHandle];
			bins[groupHandle] = new DragWeights.StoreBin(P(posX, binY), weightGroup, binWidth, blockSpacing, weightGroup, V(dragWeights.storeBinWidth, dragWeights.binHeight), dragWeights.binSlant, dragWeights.binThickness); 
			posX += binWidth + binSpacing;
		}
		return bins;
	},
	
}

DragWeights.WeightGroup = function(handle, pressure, mass, dims, count) {
	this.handle = handle;
	this.pressure = pressure;
	this.mass = mass;
	this.dims = dims;
	this.weights = [];
	this.count = count;
}

DragWeights.Weight = function(pos, groupHandle, status, weightId) {
	this.pos = pos;
	this.groupHandle = groupHandle;
	this.status = status;
	this.id = weightId;
	this.cameFrom = undefined;
	this.origPos = undefined;
}

DragWeights.PistonBin = function(dragWeights, posX, weightGroup, pistonOffset, binWidth, blockSpacing, pistonPt, dims, binSlant, thickness) {
	this.pos;
	
	if (pistonOffset) {
		var xOffset = pistonOffset.dx
		this.pos = P(posX - binWidth/2, 0).movePt(V(xOffset, 0)).track({pt:pistonPt, noTrack: 'x', offset:{dy: pistonOffset.dy}}); 
	} else {
		this.pos = P(posX - binWidth/2, 0).track({pt: pistonPt, noTrack: 'x'});
	}
	this.pts = []; //should do something to draw piston bins if desired
	dragWeights.trackingPts.push(this.pos);
	this.slots = this.getSlots(dragWeights, this.pos, weightGroup, binWidth, blockSpacing);
	this.visible = false;
}

DragWeights.PistonBin.prototype = {
	getSlots: function(dragWeights, binPos, weightGroup, binWidth, blockSpacing) {
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(binWidth/(dims.dx + blockSpacing));
		var usedWidth = numCols * (dims.dx + blockSpacing);
		var unusedWidth = binWidth-usedWidth;
		startX = binPos.x + unusedWidth/2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var yOffset = blockSpacing;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var blockX = startX + blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				var pos = P(blockX, 0).track({pt:binPos, offset:{dy:-(yOffset+dims.dy)}, noTrack:'x'});
				dragWeights.trackingPts.push(pos);
				row.push(new DragWeights.Slot(false, pos, weightGroup.handle, 'piston', rowIdx, colIdx));
				blockX += dims.dx + blockSpacing;
			}
			slots.push(row);
			yOffset += dims.dy + blockSpacing;
		}
		return slots;
		
	},	
}

DragWeights.StoreBin = function(pos, bins, binWidth, blockSpacing, weightGroup, dims, binSlant, thickness) {
	this.pts = compressorFuncs.getBinPts(pos, binSlant, dims, thickness);
	this.pos = pos.copy().movePt(V(- dims.dx / 2, 0));
	this.slots = this.getSlots(this.pos, weightGroup, binWidth, blockSpacing);
	this.visible = true;
}

DragWeights.StoreBin.prototype = {
	getSlots: function(pos, weightGroup, binWidth, blockSpacing) {
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(binWidth/(dims.dx + blockSpacing));
		var usedWidth = numCols * (dims.dx + blockSpacing);
		var unusedWidth = binWidth - usedWidth;
		var blockPt = pos.copy();
		blockPt.x += unusedWidth / 2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var y = blockPt.y - blockSpacing - dims.dy;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var x = blockPt.x + blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				row.push(new DragWeights.Slot(false, P(x, y), weightGroup.handle, 'store', rowIdx, colIdx));
				x += dims.dx + blockSpacing;
			}
			slots.push(row);
			y -= dims.dy + blockSpacing;
		}
		return slots;
	}
}

DragWeights.Slot = function(isFull, pos, handle, type, row, col) {
	this.isFull = isFull;
	this.pos = pos;
	this.handle = handle;
	this.type = type;
	this.row = row;
	this.col = col;
}
