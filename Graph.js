function Graph(name, width, height, xLabel, yLabel, pointColor, flashColor){
	this.width = width;
	this.height = height;
	this.xLabel = xLabel;
	this.yLabel = yLabel;
	this.labelFontSize = 15;
	this.legendFontSize = 12;
	this.axisValFontSize = 11;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.legendFont = this.legendFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
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
	this.bgCol = Col(5, 17, 26);
	this.gridCol = Col(72,72,72);
	this.textCol = Col(255, 255, 255);
	this.pointCol = pointColor;
	this.flashSize = 1.5;
	this.graphBoundCol = Col(255,255,255);
	this.ptStroke = Col(0,0,0);
	this.rectSideLen = 8;
	this.triSideLen = Math.sqrt(Math.pow(this.rectSideLen, 2)/2);
	
	//this.graph = Raphael(x, y, this.width, this.height);
	this.makeCanvas(name);
	this.drawAllBG();

}
Graph.prototype = {
	makeCanvas: function(name){
		var str = "<div class='graphSpacer'></div><div id = '" + name + "div'><canvas id ='" + name + "Graph' width=" + this.width + " height=" + this.height+ "></canvas></div>"
		var canvasDiv = $(str);
		$('#graphs').append(canvasDiv);
		var graphCanvas = document.getElementById(name+'Graph');
		this.graph = graphCanvas.getContext('2d');
		
		
	},	
	addSet: function(address, label, pointCol, flashCol){
		var set = {};
		set.label = label;
		set.x = [];
		set.y = [];
		set.pointCol = pointCol;
		set.flashCol = flashCol;
		this.makeLegendEntry(set, address);
		this.data[address] = set;
		this.drawAllBG();
	},
	makeLegendEntry: function(set, address){
		var x = this.width-this.legendWidth+5;
		var y = 30;
		for (var entryIdx in this.legend){
			y+=30;
		}
		var legendEntry = {};
		legendEntry.text = {text:set.label, x:x+10, y:y+this.legendFontSize/2};
		
		legendEntry.pt = {x:x, y:y, col:set.pointCol}
		this.legend[address] = legendEntry;
		this.drawAllBG();
	},
	drawAllBG: function(){
		this.drawBGRect();
		this.drawGrid();
		this.drawBounds();
		this.drawLegend();
		this.drawLabels(this.xLabel, this.yLabel);
		this.bg = this.graph.getImageData(0, 0, this.width, this.height);
	},
	drawAllData: function(){
		this.graph.putImageData(this.bg, 0, 0);
		this.drawAxisVals();
		this.graphPts();
	},
	drawLegend: function(){
		for (var legendName in this.legend){
			var legend = this.legend[legendName];
			var text = legend.text;
			var pt = legend.pt;
			var font = this.legendFont
			draw.text(text.text, P(text.x, text.y),  this.legendFont, this.textCol, 'left', 0, this.graph);
			this.drawPt(pt.x, pt.y, pt.col);
		}
	},
	drawBGRect: function(){
		this.graph.fillStyle = "rgb(200,50,50)";
		draw.roundedRect(P(0,0), V(this.width, this.height), 20, this.bgCol, this.graph); 
	},
	drawBounds: function(){
		var ptOrigin = P(this.xStart*this.width, this.yStart*this.height);
		var width = this.width*(this.xEnd-this.xStart);
		var height = this.height*(this.yEnd - this.yStart);
		var dims = V(width, height);
		draw.strokeRect(ptOrigin, dims, this.graphBoundCol, this.graph);
	},
	removeBounds: function(){
		this.graphBounds.remove();
	},
	drawGrid: function(){
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var x = this.xStart*this.width + this.gridSpacing*xGridIdx;
			var yEnd = this.yEnd*this.height;
			var yAxis = this.yStart*this.height + this.hashMarkLen;
			var p1 = P(x, yAxis);
			var p2 = P(x, yEnd);
			draw.line(p1, p2, this.gridCol, this.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var y = this.yStart*this.height - this.gridSpacing*yGridIdx;
			var xEnd = this.xEnd*this.width;
			var xAxis = this.xStart*this.width - this.hashMarkLen;
			var p1 = P(xAxis, y);
			var p2 = P(xEnd, y);			
			draw.line(p1, p2, this.gridCol, this.graph);
		}
		
	},
	drawLabels: function(xLabel, yLabel){
		var xLabelPos = P(this.width*(this.xStart+this.xEnd)/2, Math.min(this.height*this.yStart+50, this.height-20))
		var yLabelPos = P(Math.max(this.width*this.xStart-50, 20),this.height*(this.yStart+this.yEnd)/2)
		xLabelPos.y+=this.labelFontSize/2;
		yLabelPos.y+=this.labelFontSize/2;
		draw.text(xLabel, xLabelPos, this.labelFont, this.textCol, 'center',  0, this.graph);
		draw.text(yLabel, yLabelPos, this.labelFont, this.textCol, 'center', -Math.PI/2, this.graph);
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
			this.valRange.x = this.getRange('x');
			this.valRange.y = this.getRange('y');
			this.getAxisBounds();
			this.drawAllData();
		} else{
			var xPt = data.x[data.x.length-1]
			var yPt = data.y[data.y.length-1]
			var pointCol = data.pointCol
			this.graphPt(xPt, yPt, pointCol);
		}
		
		//this.flash(data.pts[data.pts.length-1], data.pointCol, data.flashCol);
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
			this.drawAllData();
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
		for (var xGridIdx=0; xGridIdx<this.numXGridLines; xGridIdx++){
			var xPos = this.xStart*this.width + this.gridSpacing*xGridIdx;
			var yPos = this.yStart*this.height + this.hashMarkLen + 10 + this.axisValFontSize/2;
			var text = String(round(this.axisRange.x.min + this.stepSize.x*xGridIdx, 1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', 0, this.graph);
		}
		for (var yGridIdx=0; yGridIdx<this.numYGridLines; yGridIdx++){
			var yPos = this.yStart*this.height - this.gridSpacing*yGridIdx;
			var xPos = this.xStart*this.width - this.hashMarkLen - 10;
			var text = String(round(this.axisRange.y.min + this.stepSize.y*yGridIdx,1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', -Math.PI/2, this.graph);
		}		
		
	},
	graphPts: function(){
		for (var set in this.data){
			var data = this.data[set];
			var col = data.pointCol;
			for (var ptIdx=0; ptIdx<data.x.length; ptIdx++){
				var xVal = data.x[ptIdx];
				var yVal = data.y[ptIdx];
				this.graphPt(xVal, yVal, col);
			}
		}
	},
	graphPt: function(xVal, yVal, col){
		var xRange = this.axisRange.x.max-this.axisRange.x.min;
		var yRange = this.axisRange.y.max-this.axisRange.y.min;
		var xPt = Math.abs(this.xEnd-this.xStart)*this.width*(xVal-this.axisRange.x.min)/xRange + this.xStart*this.width;
		var yPt = this.height - (1-this.yStart)*this.height - Math.abs(this.yEnd-this.yStart)*this.height*(yVal-this.axisRange.y.min)/yRange;
		this.drawPt(xPt, yPt, col);
	},
	drawPt: function(x, y, col){
		var len = this.triSideLen;
		var pt1 = P(x-len, y);
		var pt2 = P(x, y-len);
		var pt3 = P(x+len, y);
		var pt4 = P(x, y+len);
		var pts = [pt1, pt1, pt2, pt3, pt4];
		draw.fillPtsStroke(pts, col, this.ptStroke, this.graph);
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
}