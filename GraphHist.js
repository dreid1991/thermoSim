function GraphHist(attrs){
	this.active = true;
	this.handle = attrs.handle;
	this.dims = this.getDims();
	this.xLabel = attrs.xLabel;
	this.yLabel = attrs.yLabel;
	this.labelFontSize = 15;
	this.axisValFontSize = 11;
	var axisInit = attrs.axesInit;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/this.dims.dx;
	this.yStart = 1-this.borderSpacing/this.dims.dy;
	this.legendWidth = 80;
	this.xEnd = .95;
	this.yEnd = .05;
	this.gridSpacing = 40;
	this.numBins = 18;
	this.setNumGridLines();
	
	this.axisInit = {x:{min:axisInit.x.min, max:axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1)}, y:{min:axisInit.y.min, max:axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1)}};
	this.axisRange = {x:{min:0, max:0}, y:{min:0, max:0}};
	this.data = {};
	this.legend = {};
	this.resetRanges();
	this.stepSize = {x:0, y:0};
	
	var barCol = Col(255,100,0);
	this.setStds();
	var canvasData = this.makeCanvas(this.dims);
	this.drawAllBG();
	//this.addSet('only', barCol, data);
}
/*
Good evening:  I am keeping histogram data in data.someName, not just data, even though there is only one for now.
Trying to make functions where base references data.someName as reusable as possible
and leaving open possibility of multiple sets (though that would probably look confusing)
*/
_.extend(GraphHist.prototype, AuxFunctions, GraphBase, 
	{
		addSet: function(attrs){
			//just using set.x
			//histogram will curently only accept lists in the data object
			var xData = walls[attrs.data.x.wallInfo].getDataObj(attrs.data.x.data, attrs.data.x.attrs).src();
			var set = {};
			set.x = [];
			set.y = [];
			set.barCol = attrs.barCol;
			set.getLast = this.makeHistDataGrabFunc(xData);
			this.data.theData = set;
			this.drawAllBG();
		},
		drawAllData: function(){
			this.graph.putImageData(this.bg, 0, 0);
			this.drawAxisVals();
			this.graphBins();
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
			this.data[theOnlyAddress].x = last.data;
			this.makeBins(theOnlyAddress);
		},
		plotData: function(vals){
			var theOnlyAddress = '';
			for(var address in this.data){
				theOnlyAddress = address;
			}
			this.data[theOnlyAddress].x = vals;
			this.makeBins(theOnlyAddress)
		},
		// getAxisBounds: function(){
			// this.getXBounds();
			// this.getYBounds();
		// },
		makeBins: function(theOnlyAddress){
			this.valRange.x = this.getRange('x');
			this.setAxisBoundsX();
			this.bins = this.makeBinBlanks(this.data[theOnlyAddress].x);
			this.populateBins(this.data[theOnlyAddress].x);
			this.setYAxis();
			this.drawAllData();
		},
		makeBinBlanks: function(data){
			var bins =[];
			this.binWidth = round((this.valRange.x.max - this.valRange.x.min)/(this.numBins-1), 1);
			for (var binIdx=0; binIdx<this.numBins; binIdx++) {
				bins.push(0);
				//min = this.valRange.x.min + this.binWidth*binIdx;
				//bins[String(min)] = 0; 
			}
			return bins;
		},
		populateBins: function(data){
			for (var dataIdx=0; dataIdx<data.length; dataIdx++){
				var min = this.valRange.x.min;
				var val = data[dataIdx];
				var binIdx = Math.floor((val-min)/this.binWidth);
				this.bins[binIdx] ++;
			}
		},
		setYAxis: function(){
			var maxCount = 0;
			for (var binIdx=0; binIdx<this.bins.length; binIdx++) {
				maxCount = Math.max(this.bins[binIdx], maxCount);
			}
			this.valRange.y.min=0;
			this.valRange.y.max = maxCount;
			this.setAxisBoundsY();
		},
		graphBins: function(){
			var theData;
			for (var dataName in this.data){
				theData = dataName;
			}
			var barCol = this.data[theData].barCol
			for (var binIdx=0; binIdx<this.bins.length; binIdx++) {
				var xULPt = this.binWidth * binIdx;
				var yULPt = this.bins[binIdx];
				var xLRPt = this.binWidth * (binIdx + 1);
				var yLRPt = 0;
				var ULCoord = this.valToCoord(P(xULPt,yULPt));
				var LRCoord = this.valToCoord(P(xLRPt,yLRPt));
				var dims = ULCoord.VTo(LRCoord);
				
				draw.fillStrokeRect(ULCoord, dims, barCol, this.bgCol, this.graph);
			}
		},
		clear: function(){
			this.clearStd()
		},
	}
)

