//////////////////////////////////////////////////////////////////////////
//DRAG WEIGHTS
//////////////////////////////////////////////////////////////////////////

function DragWeights(weightDefs, zeroY, pistonY, binY, eBarX, weightCol, binCol, g, massInit, readout, obj){
	this.zeroY = zeroY;
	this.pistonY = pistonY;
	this.binY = binY;
	this.weightCol = weightCol;
	this.eBarCol = this.weightCol;
	this.g = g;
	this.eBar = {x:eBarX, scalar: .7};
	this.binCol = binCol;
	this.binHeight = 65;
	this.binSlant = 1.3;
	this.dropBinWidth = 110;
	this.dropBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.weightDimRatio = .5;
	this.weightScalar = 40;
	this.moveSpeed = 20;
	this.pistonMass = massInit;
	this.massInit = massInit
	this.eAdded = 0;
	this.readout = readout;
	this.moveToDropOrders = [];
	this.moveToPistonOrders = [];
	this.weightsOnPiston = [];
	this.tempWeightDefs = weightDefs;
	this.flySpeed = 20;
	this.eBarFont = '12pt Calibri';
	this.eBarFontCol = Col(255,255,255);
	this.addReadoutEntries();
	if(obj){
		addListener(obj, 'init', 'dragWeights', this.init, this);
	}
}

DragWeights.prototype = {
	init: function(){
		this.weightGroups = this.makeWeights(this.tempWeightDefs);
		this.dropBins = this.makeDropBins();
		this.pistonBins = this.makePistonBins();
		//this.dropAllInBins();
		addListener(curLevel, 'mousedown', 'weights', this.mousedown, this);
		addListener(curLevel, 'reset', 'dragWeights', this.reset, this);
		delete this.tempWeightDefs;
		
	},
	addReadoutEntries: function(){
		this.readout.addEntry('eAdd', 'E Added:', 'kJ', 0, undefined, 1);
		this.readout.addEntry('weight', 'Weight:', 'kg', this.pistonMass, undefined, 0);
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
	makeDropBins: function(){
		var bins = {};
		var numGroups = this.getNumGroups();
		var posX = myCanvas.width/2 - this.dropBinWidth*(numGroups-1)/2 - this.dropBinSpacing*(numGroups-1)/2;
		for (var groupName in this.weightGroups){
			var weightGroup = this.weightGroups[groupName];
			bins[groupName] = this.makeDropBin(posX, weightGroup);
			posX+=this.dropBinWidth + this.dropBinSpacing;
		}
		return bins;
	},
	makeDropBin: function(posX, weightGroup){
		var bin = {}
		bin.pts = this.getBinpts(posX);
		bin.x = posX - this.dropBinWidth/2;
		bin.y = this.binY;
		bin.slots = this.getBinSlots(P(bin.x, bin.y), weightGroup);
		return bin;
	},
	makePistonBins: function(){
		var bins = {};
		var numGroups = this.getNumGroups();
		var posX = myCanvas.width/2 - this.pistonBinWidth*(numGroups-1)/2 - this.pistonBinSpacing*(numGroups-1)/2;
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
		return bin
	},
	getBinpts: function(posX){
		var pts = []
		var thickness = 5;
		pts.push(P(posX - this.binSlant*this.dropBinWidth/2, this.binY - this.binHeight));
		pts.push(P(posX - this.dropBinWidth/2, this.binY));
		pts.push(P(posX + this.dropBinWidth/2, this.binY));
		pts.push(P(posX + this.binSlant*this.dropBinWidth/2, this.binY - this.binHeight));
		pts.push(P(posX + this.binSlant*this.dropBinWidth/2+thickness, this.binY - this.binHeight));
		pts.push(P(posX + this.dropBinWidth/2 + thickness, this.binY +thickness));
		pts.push(P(posX - this.dropBinWidth/2 - thickness, this.binY +thickness));
		pts.push(P(posX - this.binSlant*this.dropBinWidth/2 - thickness, this.binY - this.binHeight));
		pts.push(P(posX - this.binSlant*this.dropBinWidth/2, this.binY - this.binHeight));
		return pts;
	},
	getBinSlots: function(pt, weightGroup){
		var numSlots = weightGroup.weights.length;
		var dims = weightGroup.dims;
		var numCols = Math.floor(this.dropBinWidth/(dims.dx + this.blockSpacing));
		var usedWidth = numCols*(dims.dx+this.blockSpacing);
		var unusedWidth = this.dropBinWidth-usedWidth;
		pt.x+=unusedWidth/2;
		var numRows = Math.ceil(numSlots/numCols);
		var slots = [];
		var y = pt.y - this.blockSpacing;
		for (var rowIdx=0; rowIdx<numRows; rowIdx++){
			var row = [];
			var x = pt.x + this.blockSpacing;
			for (var colIdx=0; colIdx<numCols; colIdx++){
				
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, x, y, weightGroup.name, 'dropBins', rowIdx, colIdx));
				x += dims.dx+this.blockSpacing;
			}
			slots.push(row);
			y -= dims.dy+this.blockSpacing;
		}
		return slots;
		
	},
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
				var fy = this.pistonMinusVal(yOffset);
				var isFull = new Boolean();
				var isFull = false;
				row.push(this.newSlot(isFull, blockX, fy, weightGroup.name, 'pistonBins', rowIdx, colIdx));
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
		var bin = this[type+'Bins'][size];
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
		var bin = this[type+'Bins'][size];
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
		for (var binName in this[type + 'Bins']){
			allEmpty = Math.min(allEmpty, this.binIsEmpty(type, binName));
		}
		return allEmpty;
	},
	weightCount: function(type, size){
		var bin = this[type+'Bins'][size];
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
	pistonMinusVal: function(val){
		return function(){return walls.pts[0][0].y - val}
	},
	dropAllInBins: function(){
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++){
				var weight = weightGroup.weights[weightIdx];
				if(weight.status=='onPiston'){
					weight.slot.isFull = false;
					this.takeOffPiston(weight);
					this.dropIntoBin(weight);
				}else if(weight.status=='' ){
					this.dropIntoBin(weight);
				}
				
			}
		}
	},
	dropIntoBin: function(weight){
		var slot = this.getDropSlot(weight.name, 'dropBins');
		slot.isFull = true;
		weight.slot = slot;
		this.addMoveOrder(weight, 'moveToDrop');
	},
	dropIntoPistonBin: function(weight){
		if (weight.slot!==undefined){
			weight.slot.isFull = false;
		}
		var slot = this.getDropSlot(weight.name, 'pistonBins');
		slot.isFull = true;
		weight.slot = slot;
		this.addMoveOrder(weight, 'moveToPiston');
	},
	getDropSlot: function(weightName, binType){
		var bin = this[binType][weightName];
		for (var rowIdx=0; rowIdx<bin.slots.length; rowIdx++){
			var row = bin.slots[rowIdx];
			for (var colIdx=0; colIdx<row.length; colIdx++){
				var curSlot = bin.slots[rowIdx][colIdx];
				if(!curSlot.isFull){
					return curSlot;
				}
			}
		}
		alert('BOX IS FULL!  WHY IS THIS HAPPENING?');
	},
	
	addMoveOrder: function(weight,orderType){	
		if(orderType=='moveToPiston'){
			this.eBar.finalStatus = 'onPiston';
		}
		if(orderType=='moveToDrop'){
			this.eBar.finalStatus = 'inBin';
		}
		if(curLevel.updateListeners[orderType]===undefined){
			addListener(curLevel, 'update', orderType, this[orderType], this)
		}
		this[orderType+ 'Orders'].push({weight:weight});
	},
	moveToDrop: function(){
		for (var orderIdx=this.moveToDropOrders.length-1; orderIdx>=0; orderIdx-=1){
			var order = this.moveToDropOrders[orderIdx];
			var weight = order.weight;
			var dest = weight.slot;
			var dx = dest.x-weight.pos.x;
			var dy = dest.y-weight.pos.y;
			if(dx!=0 || dy!=0){
				var dirUV = V(dx,dy).UV();
				weight.pos.x = boundedStep(weight.pos.x, dest.x, dirUV.dx*this.moveSpeed);
				weight.pos.y = boundedStep(weight.pos.y, dest.y, dirUV.dy*this.moveSpeed);

			}
			if(weight.pos.x == dest.x && weight.pos.y == dest.y){
				weight.status = 'inBin';
				this.moveToDropOrders.splice(orderIdx,1);
			}
		}
		if(this.moveToDropOrders.length==0){
			removeListener(curLevel, 'update', 'moveToDrop');
		}
	},
	moveToPiston: function(){
		for (var orderIdx = this.moveToPistonOrders.length-1; orderIdx>=0; orderIdx-=1){
			var order = this.moveToPistonOrders[orderIdx];
			var weight = order.weight;
			var dest = weight.slot;

			var dx = dest.x-weight.pos.x;
			var dy = dest.y()-weight.pos.y;
			if (dx!=0 || dy!=0){
				var dirUV = V(dx,dy).UV();
				weight.pos.x = boundedStep(weight.pos.x, dest.x, this.moveSpeed*dirUV.dx);
				weight.pos.y = boundedStep(weight.pos.y, dest.y(), this.moveSpeed*dirUV.dy);
			}
			if(weight.pos.x == dest.x && weight.pos.y == dest.y()){
				this.moveToPistonOrders.splice(orderIdx,1);
				this.putOnPiston(weight);
			}
		}
		if(this.moveToPistonOrders.length==0){
			removeListener(curLevel, 'update', 'moveToPiston');
		}
		
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
		for (var group in this.weightGroups){
			var weights = this.weightGroups[group].weights;
			var dims = this.weightGroups[group].dims;
			for (var weightIdx=0; weightIdx<weights.length; weightIdx++){
				var weight = weights[weightIdx];
				var y = weight.pos.y-dims.dy;
				var pos = P(weight.pos.x, y)
				draw.fillRect(pos, dims, this.weightCol, c);
			}
		}
	},
	drawBins: function(){
		for (var binName in this.dropBins){
			var pts =  this.dropBins[binName].pts;
			draw.fillPts(pts, this.binCol, c);
		}
	},
	drawBinLabels: function(){
		for(var binName in this.dropBins){
			var bin = this.dropBins[binName];
			var x = bin.x + this.dropBinWidth/2
			var y = bin.y - this.binHeight+20;
			var mass = this.weightGroups[binName].mass;
			var text = mass + ' kg each';
			draw.text(text, P(x, y), this.eBarFont, this.eBarFontCol, 'center', 0, c);
		}
	},
	drawEBar: function(yBottom, yTop, mass){
		this.eBarY = yTop;
		var corner = P(this.eBar.x - mass*this.eBar.scalar/2, this.eBarY);
		var dims = V(mass*this.eBar.scalar, yBottom-yTop);
		draw.fillRect(corner, dims, this.eBarCol, c);
	},
	drawEBarText: function(pos, energy){
		this.eBar.eChange = energy
		var rounded = round(this.eBar.eChange,1)
		var text = this.eText(rounded)
		draw.text(text, pos, this.eBarFont, this.eBarFontCol, 'center', 0, c);
	},
	eText: function(energy){
		return energy + ' ' + curLevel.eUnits;
	},
	eBarUp: function(){
		yMin = this.pistonY();
		yBox = this.selected.pos.y;
		yMax = this.zeroY;
		yDraw = Math.min(yMax, Math.max(yBox, yMin))
		var dh = yMax-yDraw;
		var m = this.weightGroups[this.eBar.weight.name].mass;
		var g = this.g();
		this.drawEBarText(P(this.eBar.x, yDraw-15), workConst*m*g*dh);
		this.drawEBar(yMax, yDraw, m);
	},
	eBarDown: function(){
		yBottom = this.zeroY;
		var m = this.weightGroups[this.eBar.weight.name].mass;
		this.drawEBarText(P(this.eBar.x, this.eBar.yText), this.eBar.eChange);
		this.drawEBar(yBottom,this.eBar.yTop, m);
	},
	removeEBar: function(){
		if(this.eBar.finalStatus==this.eBar.initStatus){
			removeListener(curLevel, 'update', 'removeEBar');
			this.eBar.eChange = undefined;
			this.eBar.weight = undefined;	
			this.eBar.initStatus = undefined;
		} else{
			this.eBarY = Math.min(this.eBarY + 2*this.moveSpeed, this.zeroY);
			this.drawEBar(this.zeroY, this.eBarY, this.weightGroups[this.eBar.weight.name].mass)
			//this.drawEBarText(P(this.eBar.x, this.eBar.yText), this.eBar.eChange);
			if(this.eBarY==this.zeroY){
				removeListener(curLevel, 'update', 'removeEBar');
				
				this.eBar.eChange = undefined;
				this.eBar.weight = undefined;
				this.eBar.initStatus = undefined;
				this.eBar.yTop = undefined;
				this.eBar.yText = undefined;
			}
		}
		
	},
	doEBarReadout: function(readoutName, setPt){
		//var readout = byAttr(this.readout.entries, readoutName, 'name')
		
		this.readout.tick(setPt, readoutName);
		
	},

	putOnPiston: function(weight){
		this.weightsOnPiston.push(weight);
		this.pistonMass+=this.weightGroups[weight.name].mass;
		weight.status = 'onPiston';
	},	
	takeOffPiston: function(weight){
		for (var idx=0; idx<this.weightsOnPiston.length; idx++){
			if(weight==this.weightsOnPiston[idx]){
				this.weightsOnPiston.splice([idx],1);
			}
		}
		weight.status = 'inTransit'
		var prevWeight = this.pistonMass;
		this.pistonMass-=this.weightGroups[weight.name].mass;
	},
	mousedown: function(){
		var clicked = this.getClicked();
		if(clicked && clicked.status!='inTransit'){
			this.pickup(clicked);
			if(this.eBar.weight===undefined){
				if(this.selected.cameFrom=='inBin'){
					var eBarType = 'eBarUp';
					addListener(curLevel, 'update', eBarType, this.eBarUp, this);
					var self = this;
					this.eBar.weight = this.selected;
					this.eBar.initStatus = this.eBar.weight.cameFrom;
					addListener(curLevel, 'mouseup', 'switchToRemove', 
						function(){	
							removeListener(curLevel, 'update', eBarType);
							removeListener(curLevel, 'mouseup', 'switchToRemove');
							addListener(curLevel, 'update', 'removeEBar', self.removeEBar, self);
							var yText = self.pistonY()-15;
							self.eBar.yText = yText;
						}, 
					self);
				}
				if(this.selected.cameFrom=='onPiston'){
					var eBarType = 'eBarDown';
					addListener(curLevel, 'update', eBarType, this.eBarDown, this);
					var self = this;
					this.eBar.weight = this.selected;
					this.eBar.initStatus = this.eBar.weight.cameFrom;
					this.eBar.yTop = this.pistonY();
					var yText = this.eBar.yTop-15;
					this.eBar.yText = yText;
					var m = this.weightGroups[this.eBar.weight.name].mass;
					var g = this.g();
					var dh = this.eBar.yTop - this.zeroY;
					this.eBar.eChange = workConst*m*g*dh;
					addListener(curLevel, 'mouseup', 'switchToFall',
						function(){
							removeListener(curLevel, 'update', eBarType);
							removeListener(curLevel, 'mouseup', 'switchToFall');
							addListener(curLevel, 'update', 'removeEBar', self.removeEBar, self);
						},
					'');
				}
			}
			addListener(curLevel, 'mousemove', 'weights', this.mousemove, this)
			addListener(curLevel, 'mouseup', 'weights', this.mouseup, this)
		}

	},
	mousemove: function(){
		var mousePos = mouseOffset(myCanvas);
		var dx = mousePos.x - this.origPos.mouseX;
		var dy = mousePos.y - this.origPos.mouseY;
		var newX = this.origPos.weightX + dx;
		var newY = this.origPos.weightY + dy;
		this.selected.pos.x = newX;
		this.selected.pos.y = newY;
	},
	mouseup: function(){
		removeListener(curLevel, 'mousemove', 'weights');
		removeListener(curLevel, 'mouseup', 'weights');
		if(this.selected.cameFrom == 'onPiston'){
			this.eAdded+=this.eBar.eChange;
			this.doEBarReadout('eAdd', this.eAdded);
			var mass = this.weightGroups[this.eBar.weight.name].mass;
			
			this.doEBarReadout('weight', this.pistonMass);
			this.animText()
			this.dropIntoBin(this.selected);
		}else{
			if(this.selected.pos.y<this.pistonY()){
				this.eAdded+=this.eBar.eChange;
				this.doEBarReadout('eAdd', this.eAdded);
				var mass = this.weightGroups[this.eBar.weight.name].mass
				this.doEBarReadout('weight', this.pistonMass+mass);
				this.animText();
				this.dropIntoPistonBin(this.selected)
			}else{
				this.dropIntoBin(this.selected)
			}
		}
		delete this.origPos;
		this.selected = undefined;

	},
	animText: function(){
		var destEntry = byAttr(this.readout.entries, 'eAdd', 'name');
		destPos = destEntry.pos.copy();
		destPos.x+=40;
		animText({pos:P(this.eBar.x,this.pistonY()-15), size: 13, rotation:0, col:Col(255,255,255)},
			{pos:destPos, col:curLevel.bgCol, size:10},
			'calibri', this.eText(round(this.eBar.eChange,1)), 'center', 300, c)
	},
	pickup: function(weight){
		weight.cameFrom = weight.status;
		var mousePos = mouseOffset(myCanvas);
		if (weight.slot!==undefined){
			weight.slot.isFull = false;
		}
		if(weight.status=='onPiston'){
			this.takeOffPiston(weight);
		}
		delete weight.slot;
		this.selected = weight;
		this.origPos = {mouseX:mousePos.x, mouseY:mousePos.y, weightX:weight.pos.x, weightY:weight.pos.y};
		
		weight.status = 'inTransit';
	},
	getClicked: function(){
		for(var group in this.weightGroups){
			var group = this.weightGroups[group];
			for(var weightIdx=0; weightIdx<group.weights.length; weightIdx++){
				var weight = group.weights[weightIdx];
				if(inRect(P(weight.pos.x, weight.pos.y-group.dims.dy), group.dims, myCanvas) && this.isOnTop(weight)){
					return weight;
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
		var bin = this[slot.type][weight.name]
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
		this.dropAllInBins();
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
	},
	hide: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.name);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.name);	
	},
	reset: function(){
		this.pos = this.posInit.copy();
		removeListener(curLevel, 'update', 'moveWall');
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

function Piston(handle, height, y, xLeftInit, width, drawCanvas, pInit, g, obj){
	var self = this;
	this.y = y;
	this.p = pInit;
	this.g = g;
	this.slant = .07;
	
	this.left = xLeftInit;
	this.width = width;
	this.setMass();
	this.drawCanvas = drawCanvas;
	this.draw = this.makeDrawFunc(height, this.left, this.width);
	this.dataSlotFont = '12pt Calibri';
	this.dataSlotFontCol = Col(255,255,255);
	this.pStep = .05;
	var readoutLeft = this.left + this.width*this.slant;
	var readoutRight = this.left + this.width - this.width*this.slant;
	var readoutY = this.pistonBottom.pos.y-2+this.y();
	var readoutFont = '12pt calibri';
	var readoutFontCol = Col(255, 255, 255);
	this.readout = new Readout(readoutLeft, readoutRight, readoutY, readoutFont, readoutFontCol, undefined, 'center');
	obj.mass = function(){return self.mass};
}

Piston.prototype = {
	makeDrawFunc: function(height, left, pistonWidth){
		var shaftThickness = 30;
		var shaftLength = height - 45;
		var plateTopHeight = 35;
		var plateThickness = 10;

		this.pistonTop = this.makeTop(left, pistonWidth, shaftThickness, shaftLength, height, plateTopHeight, plateThickness);
		
		var plateTopY = -height + shaftLength
		
		//this.plateTop = this.makePlateTop(P(left, plateTopY), V(pistonWidth, plateTopHeight), plateThickness)
		
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
		this.mass = this.p*this.width/(pConst*this.g());
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
						function(){return self.g()},
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
		this.dataHandler.slots.work.value = 0;
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
}

//////////////////////////////////////////////////////////////////////////
//HEATER
//////////////////////////////////////////////////////////////////////////
function Heater(handle, pos, dims, rotation, tempMax, drawCanvas){
	//dims.dx corresponds to long side w/ wires
	//dims.dy corresponds to short side
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
	this.draw = this.makeDrawFunc(colMin, colDefault, colMax)
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
		var pipeThickness = 10;
		var pT = pipeThickness;
		var center = this.pos.copy().movePt(dims.copy().mult(.5));
		this.pts = new Array(16);
		this.pts[0] = pos.copy().movePt({dx:dims.dx*rnd									});
		this.pts[1] = pos.copy().movePt({dx:dims.dx*(1-rnd)								});
		this.pts[2] = pos.copy().movePt({dx:dims.dx, 			dy:dims.dy*rnd			});
		this.pts[3] = pos.copy().movePt({dx:dims.dx, 			dy:dims.dy*(1-rnd)		});
		this.pts[4] = pos.copy().movePt({dx:dims.dx*(1-rnd),	dy:dims.dy				});
		this.pts[5] = pos.copy().movePt({dx:dims.dx*.75+pT/2,	dy:dims.dy				});
		this.pts[6] = pos.copy().movePt({dx:dims.dx*.75+pT/2,	dy:dims.dy+150			});
		this.pts[7] = pos.copy().movePt({dx:dims.dx*.75-pT/2,	dy:dims.dy+150			});
		this.pts[8] = pos.copy().movePt({dx:dims.dx*.75-pT/2,	dy:dims.dy				});
		this.pts[9] = pos.copy().movePt({dx:dims.dx*.25+pT/2,	dy:dims.dy				});
		this.pts[10] = pos.copy().movePt({dx:dims.dx*.25+pT/2,	dy:dims.dy+150			});
		this.pts[11] = pos.copy().movePt({dx:dims.dx*.25-pT/2,	dy:dims.dy+150			});
		this.pts[12] = pos.copy().movePt({dx:dims.dx*.25-pT/2,	dy:dims.dy				});
		this.pts[13] = pos.copy().movePt({dx:dims.dx*rnd,		dy:dims.dy				});
		this.pts[14] = pos.copy().movePt({						dy:dims.dy*(1-rnd)		});
		this.pts[15] = pos.copy().movePt({						dy:dims.dy*rnd			});
		rotatePts(this.pts, center, this.rot);
		var colorSteps = this.getColorSteps(colMin, colDefault, colMax)
		var strokeCol = Col(0,0,0)
		var self = this;
		var drawFunc = function(){
			var sign = getSign(self.temp);
			var steps = colorSteps[String(sign)];
			var fracToEnd = sign*self.temp/self.tempMax
			var curCol = colDefault.copy().adjust(steps[0]*fracToEnd, steps[1]*fracToEnd, steps[2]*fracToEnd);
			draw.fillPtsStroke(self.pts, curCol, curCol, self.drawCanvas);
		}
		return drawFunc;
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
	},
	setupWalls: function(){
		//walls.addWall(this.pts,
	}


}