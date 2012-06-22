function Heater(x, y, width, height, tMin, tMax){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.tMin = tMin;
	this.tMax = tMax;
	this.t = (this.tMax+this.tMin)/2;
	this.col = Col(0, 0, 0);
	this.getCol();

	this.pts = this.getPts(this.x, this.y, this.width, this.height)
	walls.pts.push(this.pts);
}
Heater.prototype = {
	getPts: function(x, y, width, height){
		var pts = []
		pts.push(P(x+.2*width, y+height));
		pts.push(P(x+.8*width, y+height));
		pts.push(P(x+width, y+.8*height));
		pts.push(P(x+width, y+.2*height));
		pts.push(P(x+.8*width, y));
		pts.push(P(x+.2*width, y));
		pts.push(P(x, y+.2*height));
		pts.push(P(x, y+.8*height));
		return pts;	
	},
	getCol: function(){
		var percent = (this.t-this.tMin)/(this.tMax-this.tMin);
		this.col.r = 255*percent;
		this.col.g = 255*(.5-Math.abs(percent-.5))
		this.col.b = 255*(1-percent);
	},
	changeTemp: function(percent){
		this.t = this.tMin + (this.tMax-this.tMin)*percent;
		this.getCol();
	}

}
function Weight(xInit, yInit, dimRatio, weightMin, weightMax, weightInit){
	this.x = xInit;
	this.y = yInit-1;
	this.dimRatio = dimRatio;
	this.weightMin = weightMin;
	this.weightMax = weightMax;
	this.weight = weightInit
	this.scalar = 80;//was 8

	this.pts = [];
	this.getPts();
	this.col = Col(100,100,200);
}
Weight.prototype = {
	getPts: function(){
		var width = Math.sqrt(this.weight*this.scalar/this.dimRatio);
		var height = width*this.dimRatio;
		this.pts = [P(this.x-width/2,this.y), P(this.x+width/2,this.y), P(this.x+width/2, this.y-height), P(this.x-width/2, this.y-height)];
	},
	movePts: function(vector){
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			var pt = this.pts[ptIdx];
			pt.x+=vector.dx;
			pt.y+=vector.dy;
		}
	},
	move: function(vector){
		this.x+=vector.dx;
		this.y+=vector.dy;
		this.movePts(vector);
	},
	changeWeight: function(val){
		this.weight = val;
		this.getPts();
	},
}

function DragWeights(weightDefs, zeroY, pistonY, binY, eBarX, weightCol, binCol, g){
	this.zeroY = zeroY;
	this.pistonY = pistonY;
	this.binY = binY;
	this.weightCol = weightCol;
	this.eBarCol = this.weightCol;
	this.g = g;
	this.eBar = {x:eBarX, scalar: .7};
	this.binCol = binCol;
	this.binHeight = 70;
	this.binSlant = 1.3;
	this.dropBinWidth = 110;
	this.dropBinSpacing = 60;
	this.pistonBinWidth = 150;
	this.pistonBinSpacing = 15;
	this.blockSpacing = 2;
	this.weightDimRatio = .5;
	this.weightScalar = 40;
	this.moveSpeed = 20;
	this.pistonWeight = 20;
	this.moveToDropOrders = [];
	this.moveToPistonOrders = [];
	this.weightsOnPiston = [];
	this.tempWeightDefs = weightDefs;
	this.readoutFont = '13pt calibri';
	this.readoutFontCol = Col(255,255,255);
	this.readouts = this.makeReadouts([ {name:'eIn',   text:'E in: ', units:'u', initVal:0},
										{name:'eOut',  text:'E out: ', units:'u', initVal:0},
										{name:'delE',  text:'Sys. deltaE: ', units:'u', initVal:0},
										{name:'weight',text:'Weight: ', units:'kg', initVal:this.pistonWeight}
										],
										25);
}

DragWeights.prototype = {
	init: function(){
		this.weightGroups = this.makeWeights(this.tempWeightDefs);
		this.dropBins = this.makeDropBins();
		this.pistonBins = this.makePistonBins();
		this.dropAllInBins();
		addListener(curLevel, 'mousedown', 'weights', this.mousedown, this);
		this.writeWeight(this.pistonWeight);
		delete this.tempWeightDefs;
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
	makeReadouts: function(toMake, y){
		var readouts = {}
		var width = myCanvas.width-130;
		var spacing = Math.floor(width/(toMake.length-1))
		var xInit = 5;
		for (var toMakeIdx=0; toMakeIdx<toMake.length; toMakeIdx++){
			var makeOrder = toMake[toMakeIdx];
			var xPos = xInit + toMakeIdx*spacing;
			readouts[makeOrder.name] = this.makeReadout(makeOrder.name, makeOrder.text, P(xPos, y), makeOrder.initVal, makeOrder.units);
		}
		return readouts;
	},
	makeReadout: function(name, text, pos, val, units){
		return {name:name, text:text, pos:pos, initVal:val, val:val, units:units};
	},
	pistonMinusVal: function(val){
		return function(){return walls.pts[0][0].y - val}
	},
	dropAllInBins: function(){
		for (var group in this.weightGroups){
			var weightGroup = this.weightGroups[group];
			for (var weightIdx=0; weightIdx<weightGroup.weights.length; weightIdx++){
				var weight = weightGroup.weights[weightIdx];
				if(weight.status!='inBin'){
					if(weight.status=='onPiston'){
						weight.slot.isFull = false;
						this.takeOffPiston(weight);
					}
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
				var signX=1;
				var signY=1;
				if(dx!=0){
					var signX = Math.abs(dx)/dx;
				}
				if(dy!=0){
					var signY = Math.abs(dy)/dy;
				}
				var nextX = weight.pos.x + this.moveSpeed*dirUV.dx;
				var nextY = weight.pos.y + this.moveSpeed*dirUV.dy;
				weight.pos.x = signX*Math.min(signX*dest.x, signX*nextX);
				weight.pos.y = signY*Math.min(signY*dest.y, signY*nextY);
			}
			if(weight.pos.x == dest.x){
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
				var signX=1;
				var signY=1;
				if(dx!=0){
					var signX = Math.abs(dx)/dx;
				}
				if(dy!=0){
					var signY = Math.abs(dy)/dy;
				}
				var nextX = weight.pos.x + this.moveSpeed*dirUV.dx;
				var nextY = weight.pos.y + this.moveSpeed*dirUV.dy;		
				weight.pos.x = signX*Math.min(signX*dest.x, signX*nextX);
				weight.pos.y = signY*Math.min(signY*dest.y(), signY*nextY);	
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
		this.drawReadouts();
	},
	drawWeights: function(){
		c.fillStyle = "rgb(" + Math.floor(this.weightCol.r) + "," + Math.floor(this.weightCol.g) + "," + Math.floor(this.weightCol.b) + ")";
		for (var group in this.weightGroups){
			var weights = this.weightGroups[group].weights;
			var dims = this.weightGroups[group].dims;
			for (var weightIdx=0; weightIdx<weights.length; weightIdx++){
				var weight = weights[weightIdx];
				c.fillRect(weight.pos.x, weight.pos.y - dims.dy, dims.dx, dims.dy);
			}
			
		}
	},
	drawBins: function(){
		for (var binName in this.dropBins){
			var pts =  this.dropBins[binName].pts;
			draw.fillPts(pts, this.binCol, c);
		}
	},
	drawReadouts: function(){
		for (var readoutName in this.readouts){
			var readout = this.readouts[readoutName];
			var pos = readout.pos;
			var text = readout.text+readout.val+readout.units;
			draw.text(text, pos, this.readoutFont, this.readoutFontCol, 'left', 0, c);
		}
	},
	drawEBar: function(yStart, yEnd, mass){
		this.eBarY = Math.min(yStart, yEnd);
		var x1 = this.eBar.x - mass*this.eBar.scalar/2;
		var x2 = this.eBar.x + mass*this.eBar.scalar/2;
		var pts = [P(x1,yStart), P(x1,yStart), P(x1,yEnd), P(x2, yEnd), P(x2, yStart), P(x2,yStart)];
		draw.fillPts(pts,this.eBarCol, c);
	},
	drawEBarText: function(y, energy){
		c.font = '12pt Calibri';
		c.fillStyle = 'white';
		c.textAlign = 'center';
		this.eBar.eChange = energy
		c.fillText(this.eBar.eChange + ' u',this.eBar.x, y);
	},
	eBarUp: function(){
		yMin = this.pistonY();
		yBox = this.selected.pos.y;
		yMax = this.zeroY;
		yDraw = Math.min(yMax, Math.max(yBox, yMin))
		var dh = yMax-yDraw;
		var m = this.weightGroups[this.eBar.weight.name].mass;
		var g = this.g();
		this.drawEBarText(yDraw-15, round(m*g*dh/1000,1));
		this.drawEBar(yMax, yDraw, m);
	},
	eBarDown: function(){
		yMax = this.zeroY;
		var m = this.weightGroups[this.eBar.weight.name].mass;
		this.drawEBarText(this.eBar.yText, this.eBar.eChange);
		this.drawEBar(this.eBar.yMin, yMax, m);
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
			this.drawEBarText(this.eBar.yText, this.eBar.eChange);
			if(this.eBarY==this.zeroY){
				removeListener(curLevel, 'update', 'removeEBar');
				
				this.eBar.eChange = undefined;
				this.eBar.weight = undefined;
				this.eBar.initStatus = undefined;
				this.eBar.yMin = undefined;
				this.eBar.yText = undefined;
				
				
			}
		}
		
	},
	doEBarReadout: function(readoutName, change){
		var readout = this.readouts[readoutName];
		var init = readout.val;
		var setPt = init + change;
		this.tickReadout(init, setPt, readoutName);
	},
	resetReadouts: function(){
		for(var readoutName in this.readouts){
			var readout = this.readouts[readoutName];
			var curVal = readout.val;
			var setPt = readout.initVal;
			//readout.val = setPt;
			this.tickReadout(curVal, setPt, readoutName);
		}
	},
	tickReadout: function(init, setPt, readoutName){
		var step = (setPt - init)/10;
		if(step!=0){
			var readout = this.readouts[readoutName];
			var tickFunc = this.makeTickFunc(readout, step, setPt);
			if(!listenerExists(curLevel, 'update', readout.name)){
				addListener(curLevel, 'update', readout.name, tickFunc, '');
			}else{
				removeListener(curLevel, 'update', readout.name);
				addListener(curLevel, 'update', readout.name, tickFunc, '');
			}
		}
	},
	makeTickFunc: function(readout, step, setPt){
		return function(){
			var sign;
			if(step!=0){
				sign = Math.abs(step)/step;
			}
			var temp = readout.val*sign;
			var signSetPt = setPt*sign;
			temp+=step*sign;
			temp = round(sign*Math.min(temp, signSetPt),1);
			readout.val = temp;
			if(readout.val==setPt){
				removeListener(curLevel, 'update', readout.name);
			}
		}
	},
	floatText: function(){
		
	},
	putOnPiston: function(weight){
		this.weightsOnPiston.push(weight);
		this.pistonWeight+=this.weightGroups[weight.name].mass;
		weight.status = 'onPiston';
	},	
	takeOffPiston: function(weight){
		for (var idx=0; idx<this.weightsOnPiston.length; idx++){
			if(weight==this.weightsOnPiston[idx]){
				this.weightsOnPiston.splice([idx],1);
			}
		}
		var prevWeight = this.pistonWeight;
		this.pistonWeight-=this.weightGroups[weight.name].mass;
	},
	mousedown: function(){
		var clicked = this.getClicked();
		if(clicked){
			this.pickup(clicked);
			if(this.eBar.weight===undefined){
				if(this.selected.status=='inBin'){
					var eBarType = 'eBarUp';
					addListener(curLevel, 'update', eBarType, this.eBarUp, this);
					var self = this;
					this.eBar.weight = this.selected;
					this.eBar.initStatus = this.eBar.weight.status;
					
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
				if(this.selected.status=='onPiston'){
					var eBarType = 'eBarDown';
					addListener(curLevel, 'update', eBarType, this.eBarDown, this);
					var self = this;
					this.eBar.weight = this.selected;
					this.eBar.initStatus = this.eBar.weight.status;
					this.eBar.yMin = this.pistonY();
					var yText = this.eBar.yMin-15;
					this.eBar.yText = yText;
					var m = this.weightGroups[this.eBar.weight.name].mass;
					var g = this.g();
					var dh = this.eBar.yMin - this.zeroY;
					this.eBar.eChange = round(m*g*dh/1000,1);
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
		if(this.selected.status == 'onPiston'){
			this.doEBarReadout('eOut', Math.abs(this.eBar.eChange));
			this.doEBarReadout('delE', this.eBar.eChange);
			var mass = this.weightGroups[this.eBar.weight.name].mass;
			this.doEBarReadout('weight', -mass);
			this.dropIntoBin(this.selected);
		}else{
			if(this.selected.pos.y<this.pistonY()){
				this.doEBarReadout('eIn', Math.abs(this.eBar.eChange));
				this.doEBarReadout('delE', this.eBar.eChange);
				var mass = this.weightGroups[this.eBar.weight.name].mass;
				this.doEBarReadout('weight', mass);
				this.dropIntoPistonBin(this.selected)
			}else{
				this.dropIntoBin(this.selected)
			}
		}
		delete this.origPos;
		this.selected = undefined;

	},

	pickup: function(weight){
		
		if (weight.slot!==undefined){
			weight.slot.isFull = false;
		}
		if(weight.status=='onPiston'){
			this.takeOffPiston(weight);
		}
		delete weight.slot;
		this.selected = weight;
		this.origPos = {mouseX:mousePos.x, mouseY:mousePos.y, weightX:weight.pos.x, weightY:weight.pos.y};
	},
	getClicked: function(){
		for(var group in this.weightGroups){
			var group = this.weightGroups[group];
			for(var weightIdx=0; weightIdx<group.weights.length; weightIdx++){
				var weight = group.weights[weightIdx];
				if(this.mouseOnWeight(group.dims, weight.pos) && this.isOnTop(weight)){
					return weight;
				}
			}
		}
		return false
	},
	mouseOnWeight: function(dims, weightPos){
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
	writeWeight: function(){
		//$('#dashRun').html('PUT ELSEWHERE.  Current weight: ' + String(this.pistonWeight))
	}
}
