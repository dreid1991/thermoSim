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
		addSet: function(attrs){//address, label, pointCol, flashCol, data:{x:{wallInfo, data}, y:{same}}){
			var set = {};
			set.label = attrs.label;
			set.x = [];
			set.y = [];
			var xData = walls[attrs.data.x.wallInfo].getDataObj(attrs.data.x.data, attrs.data.x.attrs).src();
			var yData = walls[attrs.data.y.wallInfo].getDataObj(attrs.data.y.data, attrs.data.y.attrs).src();
			var data = {x: xData, y: yData};
			set.xInitDataIdx = data.x.length-1;
			set.yInitDataIdx = data.y.length-1;
			set.pointCol = attrs.pointCol;
			set.flashCol = attrs.flashCol;
			set.fillInPts = attrs.fillInPts;
			set.fillInPtsMin = defaultTo(5, attrs.fillInPtsMin);
			set.trace = defaultTo(false, attrs.trace);
			set.getLast = this.makePtDataGrabFunc(data);
			set.show = true;
			set.src = data;
			
			
			this.data[attrs.address] = set;
			
			if (set.trace) {
				set.traceStartX = set.src.x.length; 
				set.traceStartY = set.src.y.length;
				set.traceLastX = set.traceStartX;
				set.traceLastY = set.traceStartY;
			}
			set.ptDataIdxs = []; //Form of: [{x:xIdx, y:yIdx}...]
			
			
			this.makeLegendEntry(set, attrs.address);
			this.drawAllBG();
		},
		drawAllData: function(){
			this.graph.putImageData(this.bg, 0, 0);
			this.drawAxisVals();
			this.graphPts();
		},
		drawLastData: function(toDraw){
			for (var address in toDraw) {
				var newPtIdxs = toDraw[address];
				var set = this.data[address]
				for (var ptIdx=0; ptIdx<newPtIdxs.length; ptIdx++) {
					var newIdx = newPtIdxs[ptIdx];
					var xPt = set.x[newIdx];
					var yPt = set.y[newIdx];
					var ptCol = set.pointCol;
					if (set.trace) {
						this.trace(set, newIdx)
					}
					this.graphPt(xPt, yPt, ptCol);
				}
			
			}
		},
		addLast: function(){
			var toAdd = [];
			for (var address in this.data){
				var set = this.data[address];
				var newPt = set.getLast();
				newPt.address = address;
				if (newPt.isValid()) {
					var newDataIdx = {x:set.src.x.length-1, y:set.src.y.length-1};
					if (set.x.length>0) {
						var last = P(set.x[set.x.length-1], set.y[set.y.length-1]);
						var lastDataIdx = set.ptDataIdxs[set.ptDataIdxs.length-1];
						if (set.fillInPts) {
							var turnPtInfo = this.addPtsAtTurns(newPt, newDataIdx, last, lastDataIdx, set, address);
							toAdd = toAdd.concat(turnPtInfo.newPts);
							set.ptDataIdxs = set.ptDataIdxs.concat(turnPtInfo.dataIdxs);
						}
						
					}
					toAdd.push(newPt);
					set.ptDataIdxs.push(newDataIdx);
				}
			}

			this.addPts(toAdd);
		},
		addPtsAtTurns: function(a, aDataIdx, b, bDataIdx, set, address){
			var xDataRange = aDataIdx.x-bDataIdx.x;
			var yDataRange = aDataIdx.y-bDataIdx.y;
			if (xDataRange!=yDataRange) {
				return {newPts:[], dataIdxs:[]};//data points must correspond
			}
			var aCoord = this.valToCoord(a);
			var bCoord = this.valToCoord(b);
			//Input values aren't translated to pixel coordinates at this point.  
			//Am making conversion scalars so I don't have to call valToCoord for every point
			if (aCoord.x!=bCoord.x) {
				var xScale = Math.abs(aCoord.x-bCoord.x)/Math.abs(a.x-b.x);
			} else {
				var xScale = 1;
			}
			if (aCoord.y!=bCoord.y) {
				var yScale = Math.abs(aCoord.y-bCoord.y)/Math.abs(a.y-b.y);
			} else {
				yScale = 1;
			}
			var src = set.src;
			var perpUV = a.VTo(b).UV().perp();

			for (var dataIdx=xDataRange-1; dataIdx>0; dataIdx--) {
				var xIdx = bDataIdx.x + dataIdx;
				var yIdx = bDataIdx.y + dataIdx;
				var aToData = V(xScale*(src.x[xIdx]-a.x), yScale*(src.y[yIdx]-a.y));
				var dist = Math.abs(aToData.dotProd(perpUV));
				if (dist>set.fillInPtsMin) {
					var ptOverLine = P(src.x[xIdx], src.y[yIdx]);
					var edgePtInfo = this.getEdgePt({x:xIdx, y:yIdx}, bDataIdx, perpUV, ptOverLine, dist, a, src, xScale, yScale);
					if (!edgePtInfo) {
						break;
					}
					var edgeDataIdx = edgePtInfo.dataIdx;
					var edgePt = edgePtInfo.pt;
					edgePt.address = address;
					var restOfTurnPts = this.addPtsAtTurns(edgePt, edgeDataIdx, b, bDataIdx, set, address);
					return {newPts:[edgePt].concat(restOfTurnPts.newPts), dataIdxs:[edgeDataIdx].concat(restOfTurnPts.dataIdxs)};
				}
			}
			return {newPts: [], dataIdxs:[]};
			
		},
		getEdgePt: function(dataIdxsMax, dataIdxsMin, perpUV, lastPt, lastDist, a, src, xScale, yScale) {
			var dataRange = dataIdxsMax.x - dataIdxsMin.x;
			for (var dataIdx=dataRange-1; dataIdx>0; dataIdx--) {
				var xIdx = dataIdxsMin.x+dataIdx;
				var yIdx = dataIdxsMin.y+dataIdx;
				var aToData = V(xScale*(src.x[xIdx]-a.x), yScale*(src.y[yIdx]-a.y));
				var dist = Math.abs(aToData.dotProd(perpUV));
				if (dist < lastDist) {
					return {pt:lastPt, dataIdx:{x:xIdx+1, y:yIdx+1}};
				}
				lastPt = P(src.x[xIdx], src.y[yIdx]);
				lastDist = dist;
				
			}
			return undefined;
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
			var pt = this.valToCoord(P(xVal,yVal));
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

