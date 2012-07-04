function GraphBase(parent){
	this.G = parent;
	this.checkMarkOversize = 3;
};
GraphBase.prototype = {
	makeCanvas: function(name, dims){
		var str = "<div class='graphSpacer noSelect'></div><div id = '" + name + "div'><canvas id ='" + name + "Graph' width=" + dims.dx + " height=" + dims.dy+ " class='noSelect'></canvas></div>"
		var canvasDiv = $(str);
		$('#graphs').append(canvasDiv);
		
		this.graphHTMLElement = document.getElementById(name+'Graph');
		this.graph = this.graphHTMLElement.getContext('2d');
		return {graph:this.graph, HTMLElement:this.graphHTMLElement};
	},
	makeCheck: function(address, legend, toggleCol){
		var entry = legend[address];
		var oversize = this.G.checkMarkOversize;
		var checkPt = entry.togglePos.copy();
		var checkDims = entry.toggleDims.copy();
		checkPt.x-=oversize;
		checkPt.y-=oversize;
		checkDims.dx+=2*oversize;
		checkDims.dy+=2*oversize;	
		return new CheckMark(checkPt, checkDims, toggleCol, Col(0,0,0), this.G.graph);
	},
	drawAllBG: function(){
		this.drawBGRect();
		this.drawGrid();
		this.drawBounds();
		this.drawLegend();
		this.drawLabels();
		this.G.bg = this.graph.getImageData(0, 0, this.G.dims.dx, this.G.dims.dy);
	},	
	drawBGRect: function(){
		draw.roundedRect(P(0,0), V(this.G.dims.dx, this.G.dims.dy), 20, this.G.bgCol, this.G.graph); 
	},
	drawGrid: function(){
		for (var xGridIdx=0; xGridIdx<this.G.numGridLines.x; xGridIdx++){
			var x = this.G.xStart*this.G.dims.dx + this.G.gridSpacing*xGridIdx;
			var yEnd = this.G.yEnd*this.G.dims.dy;
			var yAxis = this.G.yStart*this.G.dims.dy + this.G.hashMarkLen;
			var p1 = P(x, yAxis);
			var p2 = P(x, yEnd);
			draw.line(p1, p2, this.G.gridCol, this.G.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.G.numGridLines.y; yGridIdx++){
			var y = this.G.yStart*this.G.dims.dy - this.G.gridSpacing*yGridIdx;
			var xEnd = this.G.xEnd*this.G.dims.dx;
			var xAxis = this.G.xStart*this.G.dims.dx - this.G.hashMarkLen;
			var p1 = P(xAxis, y);
			var p2 = P(xEnd, y);			
			draw.line(p1, p2, this.G.gridCol, this.G.graph);
		}
	},
	drawBounds: function(){
		var ptOrigin = P(this.G.xStart*this.G.dims.dx, this.G.yStart*this.G.dims.dy);
		var width = this.G.dims.dx*(this.G.xEnd-this.G.xStart);
		var height = this.G.dims.dy*(this.G.yEnd - this.G.yStart);
		var dims = V(width, height);
		draw.strokeRect(ptOrigin, dims, this.G.graphBoundCol, this.G.graph);
	},
	drawLabels: function(){
		var xLabelPos = P(this.G.dims.dx*(this.G.xStart+this.G.xEnd)/2, Math.min(this.G.dims.dy*this.G.yStart+50, this.G.dims.dy-20))
		var yLabelPos = P(Math.max(this.G.dims.dx*this.G.xStart-50, 20),this.G.dims.dy*(this.G.yStart+this.G.yEnd)/2)
		xLabelPos.y+=this.G.labelFontSize/2;
		yLabelPos.y+=this.G.labelFontSize/2;
		draw.text(this.G.xLabel, xLabelPos, this.G.labelFont, this.G.textCol, 'center',  0, this.G.graph);
		draw.text(this.G.yLabel, yLabelPos, this.G.labelFont, this.G.textCol, 'center', -Math.PI/2, this.G.graph);
	},
	drawLegend: function(){
		for (var entryName in this.G.legend){
			var entry = this.G.legend[entryName];
			var text = entry.text;
			var pt = entry.pt;
			this.drawLegendToggle(entryName);
			var font = this.G.legendFont
			draw.text(text.text, P(text.x, text.y),  this.G.legendFont, this.G.textCol, 'left', 0, this.G.graph);
			this.G.drawPtStd(pt.x, pt.y, pt.col);
		}
	},
	rangeIsSame: function(a, b){
		return !(a.max!=b.max || a.min!=b.min);
	},
	setAxisBounds: function(oldRange){
		var a = this.G.axisInit;
		var b = this.G.valRange;
		if(!(a.x.min<b.x.min && a.x.max>b.x.max)){
			if(!this.rangeIsSame(oldRange.x, this.G.valRange.x)){
				this.getXBounds();
			}
		} else{
			this.setAxisToInit('x');
		}
		if(!(a.y.min<b.y.min && a.y.max>b.y.max)){
			if(!this.rangeIsSame(oldRange.y, this.G.valRange.y)){
				this.getYBounds();
			}
		} else{
			this.setAxisToInit('y');
		}		
	},
	setAxisToInit: function(axis){
		var curRange = this.G.axisRange[axis];
		var init = this.G.axisInit[axis];
		var numGridLines = this.G.numGridLines[axis];
		curRange.min = init.min;
		curRange.max = init.max;
		var range = curRange.max-curRange.min;
		this.G.stepSize[axis] = range/(numGridLines-1);
	},
	getXBounds: function(){
		var rangeX = this.G.valRange.x.max-this.G.valRange.x.min;
		if(rangeX!=0){
			var unroundStepX = rangeX/(this.G.numGridLines.x-2);
			var expStepX = Math.pow(10, Math.floor(log10(unroundStepX)))
			this.G.stepSize.x = Math.ceil(unroundStepX/expStepX)*expStepX;
			this.G.axisRange.x.min = Math.floor(this.G.valRange.x.min/this.G.stepSize.x)*this.G.stepSize.x;
			this.G.axisRange.x.max = this.G.axisRange.x.min + (this.G.numGridLines.x-1)*this.G.stepSize.x;
		}else{
			this.G.axisRange.x.min = Math.floor(this.G.valRange.x.min);
			this.G.stepSize.x = .2;
			this.G.axisRange.x.max = this.G.axisRange.x.min + this.G.stepSize.x*this.G.numGridLines.x;	
		}
	},
	getYBounds: function(){
		var rangeY = Math.abs(this.G.valRange.y.max-this.G.valRange.y.min);
		if(rangeY!=0){
			var unroundStepY = rangeY/(this.G.numGridLines.y-2);
			var expStepY = Math.pow(10, Math.floor(log10(unroundStepY)))
			this.G.stepSize.y = Math.ceil(unroundStepY/expStepY)*expStepY;
			this.G.axisRange.y.min = Math.floor(this.G.valRange.y.min/this.G.stepSize.y)*this.G.stepSize.y;
			this.G.axisRange.y.max = this.G.axisRange.y.min + (this.G.numGridLines.y-1)*this.G.stepSize.y;
		}else{
			this.G.axisRange.y.min = Math.floor(this.G.valRange.y.min);
			this.G.stepSize.y = .2;
			this.G.axisRange.y.max = this.G.axisRange.y.min + this.G.stepSize.y*this.G.numGridLines.y;	
			
		}
	},
	drawAxisVals: function(){
		for (var xGridIdx=0; xGridIdx<this.G.numGridLines.x; xGridIdx++){
			var xPos = this.G.xStart*this.G.dims.dx + this.G.gridSpacing*xGridIdx;
			var yPos = this.G.yStart*this.G.dims.dy + this.G.hashMarkLen + 10 + this.G.axisValFontSize/2;
			var text = String(round(this.G.axisRange.x.min + this.G.stepSize.x*xGridIdx, 1));
			draw.text(text, P(xPos,yPos), this.G.axisValFont, this.G.textCol, 'center', 0, this.G.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.G.numGridLines.y; yGridIdx++){
			var yPos = this.G.yStart*this.G.dims.dy - this.G.gridSpacing*yGridIdx;
			var xPos = this.G.xStart*this.G.dims.dx - this.G.hashMarkLen - 10;
			var text = String(round(this.G.axisRange.y.min + this.G.stepSize.y*yGridIdx,1));
			draw.text(text, P(xPos,yPos), this.G.axisValFont, this.G.textCol, 'center', -Math.PI/2, this.G.graph);
		}		
	},
	drawLegendToggle: function(entryName){
		var entry = this.G.legend[entryName];
		draw.fillStrokeRect(entry.togglePos, entry.toggleDims, this.G.gridCol, this.G.toggleCol, this.graph);
		var dataSet = this.G.data[entryName];
		if(dataSet.show){
			this.G.legend[entryName]['check'].draw();
		}
	},
	makeLegendEntry: function(set, address){
		var x = this.G.dims.dx-this.G.legendWidth+5;
		var y = 30;
		for (var entryIdx in this.G.legend){
			y+=35;
		}
		var legendEntry = {};
		legendEntry.text = {text:set.label, x:x+10, y:y+this.G.legendFontSize/2};
		legendEntry.pt = {x:x, y:y, col:set.pointCol}
		var togglePos = P(this.G.dims.dx-18, y-5);
		var toggleDims = V(13, 13);
		legendEntry.togglePos = togglePos;
		legendEntry.toggleDims = toggleDims;
		var self = this.G;
		legendEntry.toggle = function(){
								if($('#graphs').is(':visible') && inRect(togglePos, toggleDims, self.graphHTMLElement)){
									if(set.show){
										set.show = false;
										self.flashers = [];
										removeListener(curLevel, 'update', 'flash'+self.name);
										self.base.drawAllBG();
										self.drawAllData();
									}else{
										set.show = true;
										self.flashers = [];
										removeListener(curLevel, 'update', 'flash'+self.name);
										self.base.drawAllBG();
										self.drawAllData();
									}
								}
							};
							
		addListener(curLevel, 'mouseup', 'toggle'+address, legendEntry.toggle, '');
		this.G.legend[address] = legendEntry;
		this.G.legend[address]['check'] = this.makeCheck(address, this.G.legend, this.G.toggleCol);
		this.drawAllBG();
	},
	getRange: function(axis){
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		for (var set in this.G.data){
			var data = this.G.data[set][axis];
			for (var dataIdx=0; dataIdx<data.length; dataIdx++){
				var datum = data[dataIdx];
				min = Math.min(min, datum);
				max = Math.max(max, datum);
			}
		}
		return {min:min, max:max};
	},
	clear: function(){
		for (var set in this.G.data){
			var data = this.G.data[set];
			for(var dataBit in data){
				if(dataBit instanceof Array){
					data[dataBit]=[];
				}
			}
		}
		this.G.flashers = [];
		removeListener(curLevel, 'update', 'flash'+this.G.name);
		this.graph.putImageData(this.G.bg, 0, 0);
		this.resetRanges();
	},	
	resetRanges: function(){
		this.G.axisRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
		this.G.valRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
	},
	makePtDataGrabFunc: function(paths){
		return function(address){
			var data = paths.data;
			var xPtr = paths.x;
			var yPtr = paths.y;
			var xData = data[xPtr];
			var yData = data[yPtr];
			var xLast = xData[xData.length-1];
			var yLast = yData[yData.length-1];
			return {x:xLast, y:yLast, address:address};
		}
	},
	translateValToCoord: function(val, axis){
		var range = this.G.axisRange[axis].max - this.G.axisRange[axis].min;
		var coord;
		if(axis=='x'){
			coord = this.G.gridSpacing*(this.G.numGridLines.x-1)*(val-this.G.axisRange.x.min)/range + this.G.xStart*this.G.dims.dx;
		}else if(axis=='y'){
			coord = this.G.dims.dy - (this.G.gridSpacing*(this.G.numGridLines.y-1)*(val-this.G.axisRange.y.min)/range + (1-this.G.yStart)*this.G.dims.dy);
		}
		return coord;
	},
	flashInit: function(pts){
		this.flashers = [];
		for (var flashIdx=0; flashIdx<pts.length; flashIdx++){
			var pt = pts[flashIdx];
			if(this.G.data[pt.address].show){
				var x = this.translateValToCoord(pt.x, 'x');
				var y = this.translateValToCoord(pt.y, 'y');
				var pos = P(x, y);
				var pointCol = this.G.data[pt.address].pointCol;
				var flashCol = this.G.data[pt.address].flashCol;
				var curCol = Col(flashCol.r, flashCol.g, flashCol.b);
				var imagePos = P(x - this.G.characLen*this.G.flashMult-1, y - this.G.characLen*this.G.flashMult-1);
				var len = this.G.characLen*2*this.G.flashMult+2;
				var curCharacLen = this.G.characLen*this.G.flashMult;
				var imageData = this.graph.getImageData(imagePos.x, imagePos.y, len, len);
				this.flashers.push({pos:pos, pointCol:pointCol, flashCol:flashCol, curCol:curCol, curCharacLen:curCharacLen, imagePos:imagePos, imageData:imageData});
			}
		}
		if(this.flashers.length>0){
			addListener(curLevel, 'update', 'flash'+this.G.name, this.flashRun, this);
		}
	},
	flashRun: function(){
		this.eraseFlashers();

		for (var flasherIdx=0; flasherIdx<this.flashers.length; flasherIdx++){
			var flasher = this.flashers[flasherIdx];
			this.G.drawPt(flasher.pos.x, flasher.pos.y, flasher.curCol, flasher.curCharacLen);
			this.flasherNextStep(flasher);
		}
		if(this.doneFlashing()){
			
			removeListener(curLevel, 'update', 'flash'+this.G.name);
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
		flasher.curCharacLen = boundedStep(flasher.curCharacLen, this.G.characLen, -this.G.characLen*this.G.flashMult*this.G.flashRate)
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
		var step = diff*this.G.flashRate;
		return boundedStep(cur, setPt, step);	
	},
	doneFlashing: function(){
		var amDone = new Boolean();
		amDone = true;
		for (var flasherIdx=0; flasherIdx<this.flashers.length; flasherIdx++){
			var flasher = this.flashers[flasherIdx];
			var la = flasher.curCharacLen;
			var lb = this.G.characLen;
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