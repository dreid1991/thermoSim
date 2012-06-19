function Graph(x, y, width, height, xLabel, yLabel, pointColor, flashColor){
	this.width = width;
	this.height = height;
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/width;
	this.yStart = 1-this.borderSpacing/height;
	this.legendWidth = 80;
	this.xEnd = (this.width - (this.legendWidth+8))/this.width;
	this.yEnd = .05;
	this.gridSpacing = 40;
	this.hashMarkLen = 10;
	this.numXGridLines = Math.ceil(this.width*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing);
	this.numYGridLines = Math.ceil(this.height*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing);
	this.axisVals = [];
	this.data = {};
	this.legend = {};
	this.resetRanges();
	this.stepSize = {x:0, y:0};
	this.gridCol = "#484848";
	this.textCol = "white";
	this.pointCol = pointColor;
	this.flashSize = 1.5;
	this.graphBoundCol = "white";
	this.rectSideLen = 8;
	this.axisLabelFontSize = 15;
	this.axisValFontSize = 11;
	this.graph = Raphael(x, y, this.width, this.height);
	this.drawBGRect()
	this.drawBounds()
	this.drawGrid();
	this.drawLabels(xLabel, yLabel);
}
Graph.prototype = {
	addSet: function(address, label, pointCol, flashCol){
		var set = {};
		set.label = label;
		set.x = [];
		set.y = [];
		set.pts = [];
		set.pointCol = pointCol;
		set.flashCol = flashCol;
		this.makeLegendEntry(set, address);
		this.data[address] = set;
	},
	makeLegendEntry: function(set, address){
		var x = this.width-this.legendWidth;
		var y = 30;
		for (var entryIdx in this.legend){
			y+=30;
		}
		var legendEntry = {};
		legendEntry.text = this.graph.text(x+9, y, set.label);
		legendEntry.text.attr({'text-anchor':'start', 
								'fill':this.textCol, 
								'font-size':this.axisLabelFontSize});
		legendEntry.pt = this.draw(x, y, set.pointCol);
		this.legend[address] = legendEntry;
	},
	drawBGRect: function(){
		this.bgRect = this.graph.rect(0,0,this.width,this.height,10);
		this.bgRect.attr("fill","#05111a");
	},
	drawBounds: function(){
		var ptOrigin = P(this.xStart*this.width, this.yStart*this.height);
		var ptYAxis = P(this.xStart*this.width, this.yEnd*this.height);
		var ptXAxis = P(this.xEnd*this.width, this.yStart*this.height);
		//var path = "M"+String(ptOrigin.x)+","+String(ptOrigin.y)+"L"+String(ptXAxis.x)+","+String(ptXAxis.y)+"L"+String(ptXAxis.x)+","+String(ptYAxis.y)+"L"+String(ptYAxis.x)+","+String(ptYAxis.y)+"L"+String(ptOrigin.x)+","+String(ptOrigin.y);
		var path = [P(ptOrigin.x, ptOrigin.y), P(ptXAxis.x,ptXAxis.y), P(ptXAxis.x, ptYAxis.y), P(ptYAxis.x, ptYAxis.y), P(ptOrigin.x,ptOrigin.y)]
		this.graphBounds = this.graph.path(makePath(path));
		this.graphBounds.attr("stroke",this.graphBoundCol);
	},
	removeBounds: function(){
		this.graphBounds.remove();
	},
	drawGrid: function(){
		this.xGrid = [];
		this.yGrid = [];
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var xPos = String(this.xStart*this.width + this.gridSpacing*xGridIdx);
			var yEnd = String(this.yEnd*this.height);
			var yAxis = String(this.yStart*this.height + this.hashMarkLen);
			this.xGrid.push(this.graph.path(makePath([P(xPos,yAxis),P(xPos,yEnd)])));
			this.xGrid[this.xGrid.length-1].attr("stroke",this.gridCol);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var yPos = String(this.yStart*this.height - this.gridSpacing*yGridIdx);
			var xEnd = String(this.xEnd*this.width);
			var xAxis = String(this.xStart*this.width - this.hashMarkLen);
			this.yGrid.push(this.graph.path(makePath([P(xAxis, yPos), P(xEnd, yPos)])));
			this.yGrid[this.yGrid.length-1].attr("stroke",this.gridCol);
		}
		
	},
	removeGrid: function(){
		for (var gridIdx=0; gridIdx<this.xGrid.length; gridIdx++){
			this.xGrid[gridIdx].remove();
		}
		for (var gridIdx=0; gridIdx<this.yGrid.length; gridIdx++){
			this.yGrid[gridIdx].remove();
		}
		this.xGrid = null;
		this.yGrid = null;
	},
	drawLabels: function(xLabel, yLabel){
		var xLabelPos = P(this.width*(this.xStart+this.xEnd)/2, Math.min(this.height*this.yStart+50, this.height-20))
		var yLabelPos = P(Math.max(this.width*this.xStart-50, 20),this.height*(this.yStart+this.yEnd)/2)
		this.xLabel = this.graph.text(xLabelPos.x, xLabelPos.y, xLabel);
		this.yLabel = this.graph.text(yLabelPos.x, yLabelPos.y, yLabel);
		this.yLabel.rotate(-90);
		this.xLabel.attr("fill",this.textCol);
		this.yLabel.attr("fill",this.textCol);
		this.xLabel.attr("font-size",this.axisLabelFontSize);	
		this.yLabel.attr("font-size",this.axisLabelFontSize);	
	},
	addPt: function(x, y, address){
		var data = this.data[address]
		data.x.push(x);
		data.y.push(y);
		var oldRange = {x:{min:this.valRange.x.min, max:this.valRange.x.max}, y:{min:this.valRange.y.min, max:this.valRange.y.max}};
		this.valRange.x.max = Math.max(this.valRange.x.max, x);
		this.valRange.x.min = Math.min(this.valRange.x.min, x);		
		this.valRange.y.max = Math.max(this.valRange.y.max, y);
		this.valRange.y.min = Math.min(this.valRange.y.min, y);
		
		var mustRedraw = !this.rangeIsSame(oldRange, this.valRange);
		
		if(mustRedraw){
			this.getAxisBounds();
			this.drawAxisVals();
			this.graphPts();		
		} else{
			var xPt = data.x[data.x.length-1]
			var yPt = data.y[data.y.length-1]
			var pointCol = data.pointCol
			data.pts.push(this.graphPt(xPt, yPt, pointCol));
		}
		this.flash(data.pts[data.pts.length-1], data.pointCol, data.flashCol);
	},
	rangeIsSame: function(a, b){
		return !(a.x.max!=b.x.max || a.x.min!=b.x.min || a.y.max!=b.y.max || a.y.min!=b.y.min);
	},
	plotData: function(xVals, yVals, address){
		if (xVals.length==yVals.length && xVals.length>1){
			this.data[address].x = xVals;
			this.data[address].y = yVals;
			this.valRange.x = this.getRange('x');
			this.valRange.y = this.getRange('y');
			this.getAxisBounds();
			this.drawAxisVals();
			this.graphPts();
		} else if (xVals.length!=yVals.length){
			console.log("xVals has ", xVals.length, "entries");
			console.log("yVals has ", yVals.length, "entries");
			console.log("UH-OH");
		};
	},
	getAxisBounds: function(){		
		var rangeX = this.valRange.x.max-this.valRange.x.min;
		if(rangeX!=0){
			var unroundStepX = rangeX/(this.numXGridLines-1);
			var expStepX = Math.pow(10, Math.floor(log10(unroundStepX)))
			this.stepSize.x = Math.ceil(unroundStepX/expStepX)*expStepX;
			this.axisRange.x.min = Math.floor(this.valRange.x.min/this.stepSize.x)*this.stepSize.x;
			this.axisRange.x.max = this.axisRange.x.min + this.numXGridLines*this.stepSize.x;
		}else{
			this.axisRange.x.min = Math.floor(this.valRange.x.min);
			this.stepSize.x = .2;
			this.axisRange.x.max = this.axisRange.x.min + this.stepSize.x*this.numXGridLines;	
		}
		
		var rangeY = Math.abs(this.valRange.y.max-this.valRange.y.min);
		if(rangeY!=0){
			var unroundStepY = rangeY/(this.numYGridLines-1);
			var expStepY = Math.pow(10, Math.floor(log10(unroundStepY)))
			this.stepSize.y = Math.ceil(unroundStepY/expStepY)*expStepY;
			this.axisRange.y.min = Math.floor(this.valRange.y.min/this.stepSize.y)*this.stepSize.y;
			this.axisRange.y.max = this.axisRange.y.min + this.numYGridLines*this.stepSize.y;
		}else{
			this.axisRange.y.min = Math.floor(this.valRange.y.min);
			this.stepSize.y = .2;
			this.axisRange.y.max = this.axisRange.y.min + this.stepSize.y*this.numYGridLines;	
			
		}
	},
	drawAxisVals: function(){
		this.removeAxisVals();
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var xPos = this.xStart*this.width + this.gridSpacing*xGridIdx;
			var yPos = this.yStart*this.height + this.hashMarkLen + 10;
			var val = String(round(this.axisRange.x.min + this.stepSize.x*xGridIdx, 1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var yPos = this.yStart*this.height - this.gridSpacing*yGridIdx;
			var xPos = this.xStart*this.width - this.hashMarkLen - 10;
			var val = String(round(this.axisRange.y.min + this.stepSize.y*yGridIdx,1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
			last.rotate(-90);
		}		
		
	},
	removeAxisVals: function(){
		for (var valIdx=0; valIdx<this.axisVals.length; valIdx++){
			val = this.axisVals[valIdx];
			val.remove();
		}
		this.axisVals = [];
	},
	graphPts: function(){
		this.removePts();
		for (var set in this.data){
			var data = this.data[set];
			var col = data.pointCol;
			for (var ptIdx=0; ptIdx<data.x.length; ptIdx++){
				var xVal = data.x[ptIdx];
				var yVal = data.y[ptIdx];
				data.pts.push(this.graphPt(xVal, yVal, col));
			}
		}
	},
	graphPt: function(xVal, yVal, col){
		var xRange = this.axisRange.x.max-this.axisRange.x.min;
		var yRange = this.axisRange.y.max-this.axisRange.y.min;
		var xPt = Math.abs(this.xEnd-this.xStart)*this.width*(xVal-this.axisRange.x.min)/xRange + this.xStart*this.width;
		var yPt = this.height - (1-this.yStart)*this.height - Math.abs(this.yEnd-this.yStart)*this.height*(yVal-this.axisRange.y.min)/yRange;
		return this.draw(xPt, yPt, col);
	},
	draw: function(x, y, col){
		var halfSideLen = this.rectSideLen/2;
		var pt = this.graph.rect(x-halfSideLen, y-halfSideLen, this.rectSideLen, this.rectSideLen,1);
		pt.attr("fill",col);
		var trans = 'r45,'+x+','+y;
		pt.transform(trans);
		return pt;
	},
	flash: function(pt, pointCol, flashCol){
		var height = pt.attrs.height;
		var width = pt.attrs.width;
		var changeDim = (this.flashSize-1)*height/2;
		var x = pt.attrs.x;
		var y = pt.attrs.y;
		pt.attr({x:x-changeDim, y:y-changeDim, height:this.flashSize*height, width:this.flashSize*width, fill:flashCol})
		var anim = this.animToNorm(x, y, width, height, pointCol)
		pt.animate(anim);
		pt.attr({x:x, y:y, width:width, height:height, fill:pointCol});
	},
	animToNorm: function(x, y, width, height, pointCol){
		return Raphael.animation({x:x, y:y, width:width, height:height, fill:pointCol}, .15e3);
	},
	removePts: function(){
		for (var set in this.data){
			var pts = this.data[set].pts;
			for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
				pts[ptIdx].remove();
			}
			this.data[set].pts = []
		}
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
	resetRanges: function(){
		this.axisRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
		this.valRange = {x:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}, y:{min:Number.MAX_VALUE, max:-Number.MAX_VALUE}};
	},
	clear: function(){
		for (var set in this.data){
			var data = this.data[set];
			data.x = [];
			data.y = [];
			
		}
		this.removePts();
		this.resetRanges();
	},
	remove: function(){
		this.removePts();
		this.removeAxisVals();
		this.xLabel.remove();
		this.yLabel.remove();
		this.removeGrid();
		this.removeBounds();
		this.bgRect.remove();
		this.graph.remove();
	},

}