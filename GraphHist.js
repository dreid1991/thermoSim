function GraphScatter(name, width, height, xLabel, yLabel, axisInit){
	this.base = new GraphBase(this);
	this.name = name;
	this.dims = V(width, height);
	this.xLabel = xLabel;
	this.yLabel = yLabel;
	this.labelFontSize = 15;
	this.axisValFontSize = 11;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/width;
	this.yStart = 1-this.borderSpacing/height;
	this.legendWidth = 80;
	this.xEnd = .95;
	this.yEnd = .05;
	this.gridSpacing = 40;
	this.hashMarkLen = 10;
	this.numBins = 8;
	var numGridLinesX = Math.ceil(this.dims.dx*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing);
	var numGridLinesY = Math.ceil(this.dims.dy*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing);
	this.numGridLines = {x:numGridLinesX, y:numGridLinesY};
	this.axisInit = {x:{min:axisInit.x.min, max:axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1)}, y:{min:axisInit.y.min, max:axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1)}};
	this.axisRange = {x:{min:0, max:0}, y:{min:0, max:0}};
	this.data = {};
	this.legend = {};
	this.base.resetRanges();
	this.stepSize = {x:0, y:0};
	this.bgCol = curLevel.bgCol
	this.gridCol = Col(72,72,72);
	
	this.textCol = Col(255, 255, 255);
	this.graphBoundCol = Col(255,255,255);
	this.ptStroke = Col(0,0,0);

	var canvasData = this.base.makeCanvas(this.name, this.dims);
	this.graph = canvasData.graph;
	this.graphHTMLElement = canvasData.HTMLElement;
	this.base.drawAllBG();
	addListener(curLevel, 'reset', 'clearGraph'+name, this.clear, this);
}
/*Good evening:  I am keeping histogram data in data.someName, not just data, even though there is only one for now.
Trying to make functions where base references data.someName as reusable as possible
and leaving open possibility of multiple sets (though that would probably look confusing)
*/
GraphScatter.prototype = {
	addSet: function(address, label, barCol, dataPath){
		var set = {};
		set.label = label;
		set.x = [];
		set.y = [];
		set.pointCol = pointCol;
		set.flashCol = flashCol;
		set.getLast = this.base.makeHistDataGrabFunc(dataPath);
		this.data[address] = set;
		this.base.drawAllBG();
	},
	drawAllData: function(){
		this.graph.putImageData(this.bg, 0, 0);
		this.base.drawAxisVals();
		this.graphPts();
	},
	drawLastData: function(toAdd){
		for (var addIdx=0; addIdx<toAdd.length; addIdx++){
			var dataSet = this.data[toAdd[addIdx].address];
			if(dataSet.show){
				var xPt = dataSet.x[dataSet.x.length-1]
				var yPt = dataSet.y[dataSet.y.length-1]
				var pointCol = dataSet.pointCol
				this.graphPt(xPt, yPt, pointCol);
			}
		}	
	},


	addLast: function(){
		var toAdd = [];
		var theOnlyAddress = '';
		var last;
		for (var address in this.data){
			theOnlyAddress = address;
			last = this.data[theOnlyAddress].getLast();
		}
		this.data[theOnlyAddress].x = this.data[theOnlyAddress].x.concat(last);
		this.makeBins;
	},

	plotData: function(vals){
		var theOnlyAddress = '';
		for(var address in this.data){
			theOnlyAddress = address;
		}
		this.data[theOnlyAddress].x = vals;
		this.makeBins()
	},
	getAxisBounds: function(){
		this.base.getXBounds();
		this.base.getYBounds();
	},
	makeBins: function(){
		this.valRange.x = this.base.getRange('x');
		this.base.setAxisBoundsX();
		this.bins = this.makeBins(this.data[theOnlyAddress].x);
		this.populateBins(this.data[theOnlyAddress].x);
		this.drawAllData();
	},
	makeBinBlanks: function(data, numBins){
		var bins = {};
		this.binWidth = round((this.axisRange.max - this.axisRange.min)/(this.numBins+1),1);
		for(var binIdx=0; binIdx<bins.length; binIdx++){
			min = this.axisRange.min + binWidth*binIdx;
			bins[String(min)] = 0;
		}
		return bins;
	},
	populateBins: function(data){
		for (var dataIdx=0; dataIdx<data.length; dataIdx++){
			var min = this.axisRange.min;
			var val = data[dataIdx];
			var binIdx = Math.floor((val-min)/this.binWidth)*this.binWidth;
			this.bins[String(binIdx)]++;
		}
	}
	graphPts: function(){
		for (var setName in this.data){
			var dataSet = this.data[setName];
				if(dataSet.show){
					var col = dataSet.pointCol;
					for (var ptIdx=0; ptIdx<dataSet.x.length; ptIdx++){
						var xVal = dataSet.x[ptIdx];
						var yVal = dataSet.y[ptIdx];
						this.graphPt(xVal, yVal, col);
				}
			}
		}
	},
	graphPt: function(xVal, yVal, col){
		var xPt = this.base.translateValToCoord(xVal, 'x');
		var yPt = this.base.translateValToCoord(yVal, 'y');
		this.drawPtStd(xPt, yPt, col);
	},

	drawPtStd: function(x, y, col){
		this.drawPt(x, y, col, this.characLen);
	},
	drawPt: function(x, y, col, characLen){
		var len = characLen;
		var pt1 = P(x-len, y);
		var pt2 = P(x, y-len);
		var pt3 = P(x+len, y);
		var pt4 = P(x, y+len);
		var pts = [pt1, pt2, pt3, pt4];
		draw.fillPtsStroke(pts, col, this.ptStroke, this.graph);
	},



	clear: function(){
		this.base.clear()
	},
}


