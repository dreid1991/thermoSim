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
	this.graphRangeFrac = new GraphBase.Range(this.borderSpacing/this.dims.dx, .95, 1-this.borderSpacing/this.dims.dy, .05);
	//this.legendWidth = 80;
	this.gridSpacing = 40;
	this.numBins = 18;
	this.setNumGridLines();
	this.axisInit = new GraphBase.Range(axisInit.x.min, axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1), axisInit.y.min, axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1));
	//this.axisInit = {x:{min:axisInit.x.min, max:axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1)}, y:{min:axisInit.y.min, max:axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1)}};
	//this.axisRange = {x:{min:0, max:0}, y:{min:0, max:0}}; done in setStds
	this.resetRanges();
	this.stepSize = {x:0, y:0};
	
	var barCol = Col(255,100,0);
	this.setStds();
	this.drawAllBG();
}
/*
Good evening:  I am keeping histogram data in data.someName, not just data, even though there is only one for now.
Trying to make functions where base references data.someName as reusable as possible
and leaving open possibility of multiple sets (though that would probably look confusing)
*/
_.extend(GraphHist.prototype, AuxFunctions, GraphBase, 
	{
		addSet: function(attrs){
			var set = new GraphHist.Set(this, attrs.handle, attrs.data, attrs.barCol);
			this.data[set.handle] = set;
			this.drawAllBG();
		},
		drawAllData: function(){
			this.drawAllBG();
			if (this.bins) {
				this.drawAxisVals();
				this.graphBins();
			}
		},
		addLast: function(){//point of entry 
			var toAdd = [];
			var theOnlyAddress = '';
			var last;
			for (var address in this.data){
				theOnlyAddress = address;
				
			}
			var set = this.data[theOnlyAddress];
			set.addVal();
			this.makeBins(set);
			this.hasData = true;
		},
		plotData: function(vals){
			var theOnlyAddress = '';
			for(var address in this.data){
				theOnlyAddress = address;
			}
			this.data[theOnlyAddress].data.x = vals;
			this.makeBins(this.data[theOnlyAddress])
		},
		makeBins: function(set){
			this.valRange.x = this.getRange('x');
			this.setAxisBoundsX();
			this.bins = this.makeBinBlanks(set.data.x);
			this.populateBins(set.data.x);
			this.setYAxis();
			this.drawAllData();
		},
		makeBinBlanks: function(data){
			var bins =[];
			this.binWidth = round((this.valRange.x.max - this.valRange.x.min)/(this.numBins-1), 1);
			for (var binIdx=0; binIdx<this.numBins; binIdx++) {
				bins.push(0);
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
				
				draw.fillStrokeRect(ULCoord, dims, barCol, this.bgCol, this.graphDisplay);
			}
		},
		clear: function(){
			this.clearStd()
		},
	}
)

GraphHist.Set = function(graph, handle, dataExpr, barCol) {
	this.graph = graph;
	this.handle = handle || 'onlyData';
	this.data = new GraphHist.Data();
	this.dataFunc = new GraphHist.DataFunc(graph, dataExpr);
	this.barCol = barCol;
	this.visible = true;
}
GraphHist.Set.prototype = {
	addVal: function() {
		this.data.x = this.dataFunc.x();
	},
	recordStop: function(){},
	
}
GraphHist.Data = function() {
	this.x = [];
}
GraphHist.DataFunc = function(graph, expr) {
	this.x = graph.makeDataFunc(expr);
}
