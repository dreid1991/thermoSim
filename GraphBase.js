GraphBase = {

	setStds: function(){
		this.hashMarkLen = 10;
		this.checkMarkOversize = 3;
		this.bgCol = curLevel.bgCol;
		this.gridCol = Col(72,72,72);
		this.toggleCol = Col(255,255,255);
		
		this.textCol = Col(255, 255, 255);
		this.flashMult = 1.5;
		this.flashRate = .1;
		this.graphBoundCol = Col(255,255,255);
		this.integralCol = Col(150, 150, 150);
		this.integralAlpha = .5;
		this.ptStroke = Col(0,0,0);
		this.rectSideLen = 8;
		//characLen, characteristic length, is the radius of the shape being used
		this.characLen = Math.sqrt(Math.pow(this.rectSideLen, 2)/2);		
	},
	setNumGridLines: function() {
		var numGridLinesX = Math.ceil(this.dims.dx*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing);
		var numGridLinesY = Math.ceil(this.dims.dy*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing);
		this.numGridLines = {x:numGridLinesX, y:numGridLinesY};
	},
	makeCanvas: function(dims, parentDiv) {
		var self = this;
		this.buttonId = this.handle + 'reset';
		if (!parentDiv){
			this.parentDiv = this.pickParentDiv('graph');
		} else {
			this.parentDiv = parentDiv;
		}
		this.parentDiv.html('');
		this.parentDivId = $(this.parentDiv).attr('id');
		var html = templater.canvas({
			attrs: {
				id: [this.handle + 'Graph'],
				class: ['noSelect'],
				width: [dims.dx],
				height: [dims.dy]
			},
		})
		html += templater.button({
			attrs: {
				id: [this.buttonId]
			},
			style: {
				position: 'absolute',
				right: '.5em',
				bottom: '.5em'
			},
			innerHTML: templater.img({
				attrs: {
					src: ['img/refresh.gif']
				}
				})
			});
			
		var canvasDiv = $(html);
		
		$(this.parentDiv).append(canvasDiv);
		addJQueryElems($('#' + this.buttonId), 'button');
		$('#' + this.buttonId).click(function(){self.reset()})
		this.graphHTMLElement = document.getElementById(this.handle+'Graph');
		this.graph = this.graphHTMLElement.getContext('2d');
		
	},
	makeCanvasNoReset: function(dims, parentDiv) {
		var self = this;
		this.buttonId = this.handle + 'reset';
		if (!parentDiv){
			this.parentDiv = this.pickParentDiv('graph');
		} else {
			this.parentDiv = parentDiv;
		}
		this.parentDiv.html('');
		this.parentDivId = $(this.parentDiv).attr('id');
		var html = templater.canvas({
			attrs: {
				id: [this.handle + 'Graph'],
				class: ['noSelect'],
				width: [dims.dx],
				height: [dims.dy]
			},
		})
		var canvasDiv = $(str);
		
		$(this.parentDiv).append(canvasDiv);
		this.graphHTMLElement = document.getElementById(this.handle+'Graph');
		this.graph = this.graphHTMLElement.getContext('2d');	
	},

	remove: function(){
		this.freeze();
		removeListener(curLevel, 'update', 'flash' + this.handle);
		removeSave(curLevel, 'update', 'flash' + this.handle);
		this.cleanUpParent();
		return this;
	},
	unfreeze: function(){
		this.active = true;
		return this;
	},
	freeze: function(){
		this.active = false;
		return this;
	},
	trace: function(set, ptIdx) {
		if (ptIdx>0) {
			var ptsToTrace = this.getPtsToTrace(set, ptIdx);
		}
	},
	getPtsToTrace: function(set, ptIdx) {
		var xDataIdxInit = set.ptDataIdxs[ptIdx-1].x;
		var xDataIdxFinal = set.ptDataIdxs[ptIdx].x;
		
		var yDataIdxInit = set.ptDataIdxs[ptIdx-1].y;
		var yDataIdxFinal = set.ptDataIdxs[ptIdx].y;
		
		if (xDataIdxFinal-xDataIdxInit == yDataIdxFinal-yDataIdxInit) {
			var numPts = xDataIdxFinal-xDataIdxInit;
			var tracePts = [this.valToCoord(P(set.src.x[xDataIdxInit], set.src.y[yDataIdxInit]))];
			for (var ptIdx=1; ptIdx<numPts+1; ptIdx++) {
				var pt = this.valToCoord(P(set.src.x[xDataIdxInit+ptIdx], set.src.y[yDataIdxInit+ptIdx]));
				if (!pt.closeTo(tracePts[tracePts.length-1])) {
					tracePts.push(pt);
				}
			}
			this.drawTrace(set, tracePts);
		} else {
			console.log('Data count mismatch for tracing');
			console.trace();
		}
	},

	drawTrace: function(set, tracePts) {
		draw.path(tracePts, set.pointCol, this.graph);
	},
	integrate: function(set){
		this.data[set].integralPts = this.getIntegralPts(set);
		this.drawIntegral(set);
		return this;
	},
	getIntegralPts: function(set){
		var xPts = this.data[set].src.x;
		var yPts = this.data[set].src.y;
		var integralPts = new Array(xPts.length);
		for(var ptIdx=0; ptIdx<xPts.length; ptIdx++){
			integralPts[ptIdx] = this.valToCoord(P(xPts[ptIdx], yPts[ptIdx]));
		}
		//this.makeIntegralBeFunction(integralPts);
		//HEY - YOU SHOULD *PROBABLY* MAKE A THING THAT MAKES POINTS ABOVE OTHERS REMOVE THE LOWER POINT SO IT LOOKS LIKE WE INTEGRATED A FUNCTION
		var yMax = this.yStart*this.dims.dy;
		var lastX = integralPts[integralPts.length-1].x;
		var firstX = integralPts[0].x;
		integralPts.push(P(lastX, yMax));
		integralPts.push(P(firstX, yMax));
		return integralPts;
		
	},
	drawIntegral: function(set){
		var pts = this.data[set].integralPts;
		draw.fillPtsAlpha(pts, this.integralCol, this.integralAlpha, this.graph);
		this.graphPts();
	},

	save: function(saveName){
	
		var saveName = defaultTo('graph'+this.handle, saveName);
		saveName = unique(saveName, stored);
		this.dataSave = {};
		for (var set in this.data){
			this.dataSave[set] = {pts:{}, src:{}};
			this.dataSave[set].pts.x = deepCopy(this.data[set].x);
			this.dataSave[set].pts.y = deepCopy(this.data[set].y);
			if(this.data[set].xInitDataIdx){
				this.dataSave[set].src.x = deepCopy(this.data[set].src.x);//.splice(this.data[set].xInitDataIdx, this.data[set].src.x.length);
			}//THIS DEMANDS ATTENTION.  FIX START IDX
			if(this.data[set].yInitDataIdx){
				this.dataSave[set].src.y = deepCopy(this.data[set].src.y);//.splice(this.data[set].yInitDataIdx, this.data[set].src.y.length);
			}
		}
		store(saveName, this);
		return saveName;
	},
	load: function(){
		//if(!$('#' + this.handle + 'GraphDiv').length){
			this.makeCanvas(this.dims);
		//}
		var toAdd = []
		for (var set in this.data){
			this.data[set].x = [];
			this.data[set].y = [];
			this.data[set].src.x = deepCopy(this.dataSave[set].src.x);
			this.data[set].src.y = deepCopy(this.dataSave[set].src.y);
						
			var toAdd = toAdd.concat(this.setsToPts(this.dataSave[set].pts.x, this.dataSave[set].pts.y, set));
		
		}
		this.addPts(toAdd, false, true);
		return this;
	},
	setsToPts: function(x, y, setName){
		var pts = new Array(x.length);
		for(var ptIdx=0; ptIdx<x.length; ptIdx++){
			pts[ptIdx] = {x:x[ptIdx], y:y[ptIdx], address:setName};
		}
		return pts;
	},
	makeCheck: function(address, legend, toggleCol){
		var entry = legend[address];
		var oversize = this.checkMarkOversize;
		var checkPt = entry.togglePos.copy();
		var checkDims = entry.toggleDims.copy();
		checkPt.x-=oversize;
		checkPt.y-=oversize;
		checkDims.dx+=2*oversize;
		checkDims.dy+=2*oversize;	
		return new CheckMark(checkPt, checkDims, toggleCol, Col(0,0,0), this.graph);
	},
	drawAllBG: function(){
		this.drawBGRect();
		this.drawGrid();
		this.drawBounds();
		if(this.legend){
			this.drawLegend();
		}
		this.drawLabels();
		this.bg = this.graph.getImageData(0, 0, this.dims.dx, this.dims.dy);
	},	
	drawBGRect: function(){
		draw.roundedRect(P(0,0), V(this.dims.dx, this.dims.dy), 20, this.bgCol, this.graph); 
	},
	drawGrid: function(){
		for (var xGridIdx=0; xGridIdx<this.numGridLines.x; xGridIdx++){
			var x = this.xStart*this.dims.dx + this.gridSpacing*xGridIdx;
			var yEnd = this.yEnd*this.dims.dy;
			var yAxis = this.yStart*this.dims.dy + this.hashMarkLen;
			var p1 = P(x, yAxis);
			var p2 = P(x, yEnd);
			draw.line(p1, p2, this.gridCol, this.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.numGridLines.y; yGridIdx++){
			var y = this.yStart*this.dims.dy - this.gridSpacing*yGridIdx;
			var xEnd = this.xEnd*this.dims.dx;
			var xAxis = this.xStart*this.dims.dx - this.hashMarkLen;
			var p1 = P(xAxis, y);
			var p2 = P(xEnd, y);			
			draw.line(p1, p2, this.gridCol, this.graph);
		}
	},
	drawBounds: function(){
		var ptOrigin = P(this.xStart*this.dims.dx, this.yStart*this.dims.dy);
		var width = this.dims.dx*(this.xEnd-this.xStart);
		var height = this.dims.dy*(this.yEnd - this.yStart);
		var dims = V(width, height);
		draw.strokeRect(ptOrigin, dims, this.graphBoundCol, this.graph);
	},
	drawLabels: function(){
		var xLabelPos = P(this.dims.dx*(this.xStart+this.xEnd)/2, Math.min(this.dims.dy*this.yStart+50, this.dims.dy-20))
		var yLabelPos = P(Math.max(this.dims.dx*this.xStart-50, 20),this.dims.dy*(this.yStart+this.yEnd)/2)
		xLabelPos.y+=this.labelFontSize/2;
		yLabelPos.y+=this.labelFontSize/2;
		draw.text(this.xLabel, xLabelPos, this.labelFont, this.textCol, 'center',  0, this.graph);
		draw.text(this.yLabel, yLabelPos, this.labelFont, this.textCol, 'center', -Math.PI/2, this.graph);
	},
	drawLegend: function(){
		for (var entryName in this.legend){
			var entry = this.legend[entryName];
			var text = entry.text;
			var pt = entry.pt;
			this.drawLegendToggle(entryName);
			var font = this.legendFont
			draw.text(text.text, P(text.x, text.y),  this.legendFont, this.textCol, 'left', 0, this.graph);
			this.drawPtStd(pt, pt.col);
		}
	},
	addPts: function(toAdd, flash, mustRedraw){
		mustRedraw = defaultTo(false, mustRedraw);
		flash = defaultTo(true, flash);
		var val = this.valRange;
		var oldValRange = {x:{min:val.x.min, max:val.x.max}, y:{min:val.y.min, max:val.y.max}};
		var toDraw = {};
		for (var addIdx=0; addIdx<toAdd.length; addIdx++) {
			var address = toAdd[addIdx].address;
			var x = toAdd[addIdx].x;
			var y = toAdd[addIdx].y;
			var dataSet = this.data[address]
			if (!toDraw[address]) {
				toDraw[address] = [];
			}
			if (dataSet.show) {
				toDraw[address].push(dataSet.x.length);
			}
			dataSet.x.push(x);
			dataSet.y.push(y);
			this.valRange.x.max = Math.max(this.valRange.x.max, x);
			this.valRange.x.min = Math.min(this.valRange.x.min, x);		
			this.valRange.y.max = Math.max(this.valRange.y.max, y);
			this.valRange.y.min = Math.min(this.valRange.y.min, y);
		}
		var old = this.axisRange;
		var oldAxisRange = {x:{min:old.x.min, max:old.x.max}, y:{min:old.y.min, max:old.y.max}};
		this.setAxisBounds(oldValRange);
		if (!this.rangeIsSame(oldAxisRange.x, this.axisRange.x) || !this.rangeIsSame(oldAxisRange.y, this.axisRange.y)) {
			mustRedraw = true;
		}
		
		if (mustRedraw) {
			this.drawAllData();
		} else {
			this.drawLastData(toDraw);

		}
		if (flash) {
			this.flashInit(toDraw);
		}
	},
	rangeIsSame: function(a, b){
		return !(a.max!=b.max || a.min!=b.min);
	},
	setAxisBounds: function(oldRange){
		this.setAxisBoundsX(oldRange);
		this.setAxisBoundsY(oldRange);
	},
	setAxisBoundsX: function(oldRange){
		var a = this.axisInit;
		var b = this.valRange;	
		if(!(a.x.min<b.x.min && a.x.max>b.x.max)){
			if(oldRange){
				if(!this.rangeIsSame(oldRange.x, this.valRange.x)){
					this.getXBounds();
				}
			} else{
				this.getXBounds();
			}
		} else{
			this.setAxisToInit('x');
		}
	},
	setAxisBoundsY: function(oldRange){
		var a = this.axisInit;
		var b = this.valRange;	
		if(!(a.y.min<b.y.min && a.y.max>b.y.max)){
			if(oldRange){
				if(!this.rangeIsSame(oldRange.y, this.valRange.y)){
					this.getYBounds();
				}
			} else{
				this.getYBounds();
			}
		} else{
			this.setAxisToInit('y');
		}		
	},
	setAxisToInit: function(axis){
		var curRange = this.axisRange[axis];
		var init = this.axisInit[axis];
		var numGridLines = this.numGridLines[axis];
		curRange.min = init.min;
		curRange.max = init.max;
		var range = curRange.max-curRange.min;
		this.stepSize[axis] = range/(numGridLines-1);
	},
	getXBounds: function(){
		var rangeX = this.valRange.x.max-this.valRange.x.min;
		var newBounds = {min: undefined, max: undefined};
		var newStepSize;
		//axes cannot shrink.  
		if (rangeX!=0) {
			var unroundStepX = rangeX / (this.numGridLines.x-2);
			var expStepX = Math.pow(10, Math.floor(Math.log10(unroundStepX)))
			newStepSize = Math.ceil(unroundStepX / expStepX) * expStepX;
			newBounds.min = Math.floor(this.valRange.x.min / newStepSize) * newStepSize;
			newBounds.max = newBounds.min + (this.numGridLines.x - 1) * newStepSize;
			//this.stepSize.x = Math.ceil(unroundStepX/expStepX)*expStepX;
			//this.axisRange.x.min = Math.floor(this.valRange.x.min/this.stepSize.x)*this.stepSize.x;
			//this.axisRange.x.max = this.axisRange.x.min + (this.numGridLines.x-1)*this.stepSize.x;
		} else {
			newStepSize = .2;
			newBounds.min = Math.floor(this.valRange.x.min);
			newBounds.max = newBounds.min + newStepSize * this.numGridLines.x;
			// this.axisRange.x.min = Math.floor(this.valRange.x.min);
			// this.stepSize.x = .2;
			// this.axisRange.x.max = this.axisRange.x.min + this.stepSize.x*this.numGridLines.x;	
		}
		if (newBounds.min < this.axisRange.x.min || newBounds.max > this.axisRange.x.max) {
			this.axisRange.x.min = newBounds.min;
			this.axisRange.x.max = newBounds.max;
			this.stepSize.x = newStepSize;
		}
	},
	getYBounds: function(){
		var rangeY = Math.abs(this.valRange.y.max-this.valRange.y.min);
		var newBounds = {min: undefined, max: undefined};
		var newStepSize;
		if (rangeY!=0) {
			var unroundStepY = rangeY / (this.numGridLines.y-2);
			var expStepY = Math.pow(10, Math.floor(Math.log10(unroundStepY)))
			newStepSize = Math.ceil(unroundStepY / expStepY) * expStepY;
			newBounds.min = Math.floor(this.valRange.y.min / newStepSize) * newStepSize;
			newBounds.max = newBounds.min + (this.numGridLines.y-1) * newStepSize;
		} else {
			newBounds.min = Math.floor(this.valRange.y.min);
			newStepSize = .2;
			newBounds.max = this.axisRange.y.min + newStepSize * this.numGridLines.y;	
		}
		if (newBounds.min < this.axisRange.y.min || newBounds.max > this.axisRange.y.max) {
			this.axisRange.y.min = newBounds.min;
			this.axisRange.y.max = newBounds.max;
			this.stepSize.y = newStepSize;
		}
	},
	drawAxisVals: function(){
		for (var xGridIdx=0; xGridIdx<this.numGridLines.x; xGridIdx++){
			var xPos = this.xStart*this.dims.dx + this.gridSpacing*xGridIdx;
			var yPos = this.yStart*this.dims.dy + this.hashMarkLen + 10 + this.axisValFontSize/2;
			var text = String(round(this.axisRange.x.min + this.stepSize.x*xGridIdx, 1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', 0, this.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.numGridLines.y; yGridIdx++){
			var yPos = this.yStart*this.dims.dy - this.gridSpacing*yGridIdx;
			var xPos = this.xStart*this.dims.dx - this.hashMarkLen - 10;
			var text = String(round(this.axisRange.y.min + this.stepSize.y*yGridIdx,1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', -Math.PI/2, this.graph);
		}		
	},
	drawLegendToggle: function(entryName){
		var entry = this.legend[entryName];
		draw.fillStrokeRect(entry.togglePos, entry.toggleDims, this.gridCol, this.toggleCol, this.graph);
		var dataSet = this.data[entryName];
		if (dataSet.show) {
			this.legend[entryName]['check'].draw();
		}
	},
	makeLegendEntry: function(set, address){
		var x = this.dims.dx-this.legendWidth+5;
		var y = 30;
		for (var entryIdx in this.legend){
			y+=35;
		}
		var legendEntry = {};
		legendEntry.text = {text:set.label, x:x+10, y:y+this.legendFontSize/2};
		legendEntry.pt = {x:x, y:y, col:set.pointCol}
		var togglePos = P(this.dims.dx-18, y-5);
		var toggleDims = V(13, 13);
		legendEntry.togglePos = togglePos;
		legendEntry.toggleDims = toggleDims;
		var self = this;
		legendEntry.toggle = function(){
								if (ptInRect(togglePos, toggleDims, mouseOffsetDiv(self.parentDivId))) {
									if (set.show) {
										set.show = false;
										self.flashers = [];
										removeListener(curLevel, 'update', 'flash'+self.handle);
										self.drawAllBG();
										self.drawAllData();
									} else {
										set.show = true;
										self.flashers = [];
										removeListener(curLevel, 'update', 'flash'+self.handle);
										self.drawAllBG();
										self.drawAllData();
									}
								}
							};
							
		addListener(curLevel, 'mouseup', 'toggle'+address, legendEntry.toggle, '');
		this.legend[address] = legendEntry;
		this.legend[address]['check'] = this.makeCheck(address, this.legend, this.toggleCol);
		this.drawAllBG();
	},
	getRange: function(axis){
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		for (var set in this.data){
			var data = this.data[set][axis];
			for (var dataIdx=0; dataIdx<data.length; dataIdx++){
				var datum = data[dataIdx];
				min = Math.min(min, datum);
				max = Math.max(max, datum);
			}
		}
		return {min:min, max:max};
	},
	resetStd: function(){
		for (var set in this.data){
			var set = this.data[set];
			for(var dataBitName in set){
				var dataBit = set[dataBitName];
				if(dataBit instanceof Array){
					set[dataBitName]=[];
				}
			}
			if (set.trace) {
				set.traceStartX = set.src.x.length;
				set.traceStartY = set.src.y.length;
				set.traceLastX = set.traceStartX;
				set.traceLastY = set.traceStartY;
				set.ptDataIdxs = [];
			}
		}
		this.flashers = [];
		removeListener(curLevel, 'update', 'flash'+this.name);
		this.graph.putImageData(this.bg, 0, 0);
		this.resetRanges();
	},	
	resetRanges: function(){
		this.axisRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
		this.valRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
	},
	makePtDataGrabFunc: function(data){
		return function(){
			var xLast = data.x[data.x.length-1];
			var yLast = data.y[data.y.length-1];
			return P(xLast, yLast);
		}
	},
	ptsExist: function(pts){
		for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			if(pt.x===undefined || pt.y===undefined || isNaN(pt.x) || isNaN(pt.y)){
				return false;
			}
		}
		return true;
	},
	makeHistDataGrabFunc: function(data){
		return function(address){
			return {address:address, data:data[data.length-1]};
		}
	},
	valToCoord: function(val){
		var rangeX = this.axisRange.x.max - this.axisRange.x.min;
		var rangeY = this.axisRange.y.max - this.axisRange.y.min;
		var x = this.gridSpacing*(this.numGridLines.x-1)*(val.x-this.axisRange.x.min)/rangeX + this.xStart*this.dims.dx;
		var y = this.dims.dy - (this.gridSpacing*(this.numGridLines.y-1)*(val.y-this.axisRange.y.min)/rangeY + (1-this.yStart)*this.dims.dy);
		return P(x,y);
	},
	flashInit: function(toDraw){
		this.flashers = [];
		for (var address in toDraw) {
			var newPtIdxs = toDraw[address];
			var set = this.data[address];
			for (var ptIdx=0; ptIdx<newPtIdxs.length; ptIdx++) {
				var newIdx = newPtIdxs[ptIdx];
				var val = P(set.x[newIdx], set.y[newIdx]);
				var pos = this.valToCoord(val);
				var xPt = pos.x;
				var yPt = pos.y;
				var pointCol = set.pointCol;
				var flashCol = set.flashCol;
				var curCol = Col(flashCol.r, flashCol.g, flashCol.b);
				var imagePos = P(xPt - this.characLen*this.flashMult-1, yPt - this.characLen*this.flashMult-1);
				var len = this.characLen*2*this.flashMult+2;
				var curCharacLen = this.characLen*this.flashMult;
				var imageData = this.graph.getImageData(imagePos.x, imagePos.y, len, len);
				this.flashers.push({pos:pos, pointCol:pointCol, flashCol:flashCol, curCol:curCol, curCharacLen:curCharacLen, imagePos:imagePos, imageData:imageData});
			}
			if (this.flashers.length>0) {
				addListener(curLevel, 'update', 'flash'+this.handle, this.flashRun, this);
			}
		}
	},
	flashRun: function(){
		this.eraseFlashers();

		for (var flasherIdx=0; flasherIdx<this.flashers.length; flasherIdx++){
			var flasher = this.flashers[flasherIdx];
			this.drawPt(flasher.pos, flasher.curCol, flasher.curCharacLen);
			this.flasherNextStep(flasher);
		}
		if (this.doneFlashing()) {
			
			removeListener(curLevel, 'update', 'flash'+this.handle);
			this.eraseFlashers();
			this.flashers = undefined;
		}
	},
	eraseFlashers: function(){
		for (var flasherIdx=0; flasherIdx<this.flashers.length; flasherIdx++){
			var flasher = this.flashers[flasherIdx];
			this.graph.putImageData(flasher.imageData, flasher.imagePos.x, flasher.imagePos.y);
		}
	},
	flasherNextStep: function(flasher){
		flasher.curCharacLen = boundedStep(flasher.curCharacLen, this.characLen, -this.characLen*this.flashMult*this.flashRate)
		var col = flasher.curCol;
		var newCol = Col(0,0,0);
		newCol.r = this.flashColStep(flasher, 'r');
		newCol.g = this.flashColStep(flasher, 'g');
		newCol.b = this.flashColStep(flasher, 'b');
		col.set(newCol);
	},
	flashColStep: function(flasher, col){
		var init = flasher.flashCol[col];
		var cur = flasher.curCol[col];
		var setPt = flasher.pointCol[col];
		var diff = setPt - init;
		var step = diff*this.flashRate;
		return boundedStep(cur, setPt, step);	
	},
	doneFlashing: function(){
		var amDone = new Boolean();
		amDone = true;
		for (var flasherIdx=0; flasherIdx<this.flashers.length; flasherIdx++){
			var flasher = this.flashers[flasherIdx];
			var la = flasher.curCharacLen;
			var lb = this.characLen;
			var ra = flasher.curCol.r;
			var rb = flasher.pointCol.r;		
			var ga = flasher.curCol.g;
			var gb = flasher.pointCol.g;		
			var ba = flasher.curCol.b;
			var bb = flasher.pointCol.b;
			if(la!=lb || ra!=rb || ga!=gb || ba!=bb){
				amDone = false;
			}
		}
		return amDone;
	},
	
}