function GraphScatter(attrs) {
	this.active = true;
	this.handle = attrs.handle;
	this.dims = this.getDims();
	//this.dims = V(width, height);
	this.xLabel = attrs.xLabel;
	this.yLabel = attrs.yLabel;
	var axisInit = attrs.axesInit;
	this.labelFontSize = 15;
	this.legendFontSize = 12;
	this.axisValFontSize = 11;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.legendFont = this.legendFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/this.dims.dx;
	this.yStart = 1-this.borderSpacing/this.dims.dy;
	this.legendWidth = 80;
	this.xEnd = (this.dims.dx - (this.legendWidth+8))/this.dims.dx;
	this.yEnd = .05;
	this.gridSpacing = 40;
	
	
	this.setNumGridLines();
	this.axisInit = {x:{min:axisInit.x.min, max:axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1)}, y:{min:axisInit.y.min, max:axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1)}};
	this.axisRange = {x:{min:0, max:0}, y:{min:0, max:0}};
	this.data = {};
	this.legend = {};
	this.resetRanges();
	this.stepSize = {x:0, y:0};
	

	this.setStds();
	this.makeCanvas(this.dims);
	this.drawAllBG();
	
}
_.extend(GraphScatter.prototype, AuxFunctions, GraphBase, 
	{
		addSet: function(attrs){//address, label, pointCol, flashCol, data){
			var set = {};
			set.label = attrs.label;
			set.x = [];
			set.y = [];
			set.xInitDataIdx = attrs.data.x.length-1;
			set.yInitDataIdx = attrs.data.y.length-1;
			set.pointCol = attrs.pointCol;
			set.flashCol = attrs.flashCol;
			set.trace = defaultTo(false, attrs.trace);
			set.getLast = this.makePtDataGrabFunc(attrs.data);
			set.show = true;
			set.src = attrs.data;
			
			
			this.data[attrs.address] = set;
			
			if (set.trace) {
				set.traceStartX = set.src.x.length; 
				set.traceStartY = set.src.y.length;
				set.traceLastX = set.traceStartX;
				set.traceLastY = set.traceStartY;
				set.ptDataIdxs = []; //Form of: [{x:xIdx, y:yIdx}...]
			}
			
			this.makeLegendEntry(set, attrs.address);
			this.drawAllBG();
		},
		drawAllData: function(){
			this.graph.putImageData(this.bg, 0, 0);
			this.drawAxisVals();
			this.graphPts();
		},
		drawLastData: function(toAdd){
			for (var addIdx=0; addIdx<toAdd.length; addIdx++){
				var set = this.data[toAdd[addIdx].address];
				if (set.show) {
					var xPt = set.x[set.x.length-1]
					var yPt = set.y[set.y.length-1]
					var pointCol = set.pointCol
					if (set.trace) {
						this.trace(set, set.x.length-1);
					}
					this.graphPt(xPt, yPt, pointCol);
				}
			}	
		},
		addLast: function(){
			var toAdd = [];
			for (var address in this.data){
				var set = this.data[address];
				if (set.trace) {
					set.ptDataIdxs.push({x:set.src.x.length-1, y:set.src.y.length-1});
				}
				toAdd.push(set.getLast(address));
			}
			if (this.ptsExist(toAdd)) { 
				this.addPts(toAdd);
			} else {
				for (var address in this.data){
					var set = this.data[address];
					set.pop();
				}
			}
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
			this.getXBounds();
			this.getYBounds();
		},


		graphPts: function(){
			for (var setName in this.data) {
				var set = this.data[setName];
				if (set.show) {
					var col = set.pointCol;
					for (var ptIdx=0; ptIdx<set.x.length; ptIdx++){
						var xVal = set.x[ptIdx];
						var yVal = set.y[ptIdx];
						this.graphPt(xVal, yVal, col);
						if (set.trace) {
							this.trace(set, ptIdx);
						}
					}
				}
				
			}
		},
		graphPt: function(xVal, yVal, col){
			var pt = this.translateValToCoord(P(xVal,yVal));
			this.drawPtStd(pt, col);
		},

		drawPtStd: function(pt, col){
			this.drawPt(pt, col, this.characLen);
		},
		drawPt: function(pt, col, characLen){
			var x = pt.x;
			var y = pt.y;
			var len = characLen;
			var pt1 = P(x-len, y);
			var pt2 = P(x, y-len);
			var pt3 = P(x+len, y);
			var pt4 = P(x, y+len);
			var pts = [pt1, pt2, pt3, pt4];
			draw.fillPtsStroke(pts, col, this.ptStroke, this.graph);
		},
		reset: function(){
			this.resetStd()
		},
	}
)

