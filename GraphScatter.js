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
	//this.xStart = this.borderSpacing/this.dims.dx;
	//this.yStart = 1-this.borderSpacing/this.dims.dy;
	this.legendWidth = 80;
	//this.xEnd = (this.dims.dx - (this.legendWidth+8))/this.dims.dx;
	//this.yEnd = .05;
	this.graphRangeFrac = new GraphBase.Range(this.borderSpacing/this.dims.dx, (this.dims.dx - (this.legendWidth+8))/this.dims.dx, 1-this.borderSpacing/this.dims.dy, .05);
	this.gridSpacing = 40;
	
	this.setNumGridLines();
	this.axisInit = new GraphBase.Range(axisInit.x.min, axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1), axisInit.y.min, axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1));
	//this.axisRange = new this.Range(0, 0, 0, 0);
	this.data = {};
	this.legend = {};
	this.resetRanges(); //val & axis ranges set in here
	this.stepSize = new GraphScatter.Coord(0, 0);
	

	this.setStds();
	this.makeCanvas(this.dims);
	this.drawAllBG();
	
}
_.extend(GraphScatter.prototype, AuxFunctions, GraphBase, 
	{
		addSet: function(attrs){//address, label, pointCol, flashCol, data:{x:{wallInfo, data}, y:{same}}){
			var set = new GraphScatter.Set(this, attrs.handle, attrs.label, attrs.data, attrs.pointCol, attrs.flashCol, attrs.fillInPts, attrs.fillInPtsMin, attrs.trace);

			this.data[attrs.handle] = set;
			
			this.makeLegendEntry(set, attrs.handle);
			this.drawAllBG();
		},
		drawAllData: function(){
			this.graph.putImageData(this.bg, 0, 0);
			this.drawAxisVals();
			this.graphPts();
		},
		drawPts: function(justQueues){
			for (var setName in this.data) {
				var set = this.data[setName]
				set.drawQueue();
			}
		},
		addLast: function(){
			var toAdd = [];
			for (var address in this.data){
				var set = this.data[address];
				set.enqueuePts();
				//toAdd = toAdd.concat(set.getNewPts());				
			}
			//flushQueue or something
			this.flushQueues(true, false);
		},

		// plotData: function(xVals, yVals, address){
			// if (xVals.length==yVals.length && xVals.length>1){
				// this.data[address].x = xVals;
				// this.data[address].y = yVals;
				// this.valRange.x = this.getRange('x');
				// this.valRange.y = this.getRange('y');
				// this.getAxisBounds();
				// this.drawAllData();
			// } else if (xVals.length!=yVals.length){
				// console.log("xVals has ", xVals.length, "entries");
				// console.log("yVals has ", yVals.length, "entries");
				// console.log("UH-OH");
			// };
		// },

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


GraphScatter.Set = function(graph, handle, label, dataExprs, pointCol, flashCol, fillInPts, fillInPtsMin, trace) {
	this.graph = graph;
	this.handle = handle;
	this.label = label;
	this.data = new GraphScatter.Data();
	this.graphedPts = new GraphScatter.Data();
	this.dataFuncs = new GraphScatter.DataFuncs(graph, dataExprs.x, dataExprs.y);
	this.pointCol = pointCol;
	this.flashCol = flashCol;
	this.fillInPts = defaultTo(true, fillInPts);
	this.fillInPtsMin = defaultTo(5, fillInPtsMin);
	this.trace = defaultTo(false, trace);
	this.visible = true;
	this.recordListenerName = this.graph.handle + this.handle.toCapitalCamelCase() + 'Record';
	this.dataPtIdxs = []; //to be populated with Coords
	this.traceLastIdxs = new GraphScatter.Coord(0, 0);
	this.flashers = [];
	this.queuePts = [];
	this.queneIdxs = [];
	this.recordStart();
}

GraphScatter.Set.prototype = {
	addVal: function() {
		this.data.x.push(this.dataFuncs.x());
		this.data.y.push(this.dataFuncs.y());
	},
	recordStart: function() {
		addListener(curLevel, 'update', this.recordListenerName, function() {
			if (turn % 5 == 0) this.addVal();
		}, this);
	},
	recordStop: function() {
		removeListener(curLevel, 'update', this.recordListenerName);
	},
	enqueuePts: function() {
		var newPt = this.data.pt();
		var newPts = [];
		var newDataIdxs = [];
		//going to try not having address in points
		//newPt.address = address;
		if (newPt.isValid()) {
			var newDataIdx = new GraphScatter.Coord(this.data.x.length - 1, this.data.y.length - 1);
			//this.dataPtIdxs.push(newDataidx);
			if (this.fillInPts && this.data.x.length && this.data.y.length && this.dataPtIdxs.length) {
				var lastDataIdx = this.dataPtIdxs[this.dataPtIdxs.length-1];
				var lastPt = this.data.pt(lastDataIdx.x, lastDataIdx.y);
	
				var filledInPtsInfo = this.fillInPts(newPt, newDataIdx, lastPt, lastDataIdx, this.data);
				newPts = newPts.concat(fillInPtsInfo.newPts);
				newDataIdxs = newDataIdxs.concat(turnPtInfo.dataIdxs);
				
				
			}
			newPts.push(newPt);
			newDataIdxs.push(newDataIdx);
			//this.dataPtIdxs = this.dataPtIdxs.concat(newDataIdxs);
			
		}
		this.queuePts = this.queuePts.concat(newPts);
		this.queueIdxs = this.queneIdxs.concat(newDataIdxs);
	},
	fillInPts: function(a, aDataIdx, b, bDataIdx, data){
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
		var perpUV = a.VTo(b).UV().perp();

		for (var dataIdx=xDataRange-1; dataIdx>0; dataIdx--) {
			var xIdx = bDataIdx.x + dataIdx;
			var yIdx = bDataIdx.y + dataIdx;
			var aToData = V(xScale*(data.x[xIdx]-a.x), yScale*(data.y[yIdx]-a.y));
			var dist = Math.abs(aToData.dotProd(perpUV));
			if (dist>set.fillInPtsMin) {
				var ptOverLine = P(data.x[xIdx], data.y[yIdx]);
				var edgePtInfo = this.getEdgePt({x:xIdx, y:yIdx}, bDataIdx, perpUV, ptOverLine, dist, a, data, xScale, yScale);
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
	getEdgePt: function(dataIdxsMax, dataIdxsMin, perpUV, lastPt, lastDist, a, data, xScale, yScale) {
		var dataRange = dataIdxsMax.x - dataIdxsMin.x;
		for (var dataIdx=dataRange-1; dataIdx>0; dataIdx--) {
			var xIdx = dataIdxsMin.x+dataIdx;
			var yIdx = dataIdxsMin.y+dataIdx;
			var aToData = V(xScale*(data.x[xIdx]-a.x), yScale*(data.y[yIdx]-a.y));
			var dist = Math.abs(aToData.dotProd(perpUV));
			if (dist < lastDist) {
				return {pt:lastPt, dataIdx:{x:xIdx+1, y:yIdx+1}};
			}
			lastPt = P(data.x[xIdx], data.y[yIdx]);
			lastDist = dist;
			
		}
		return undefined;
	},
	updateRange: function(valRange) {
		if (this.trace) {
			this.updateRangeFromData(valRange)
		} else {
			this.updateRangeFromPts(valRange);
		}
		//this.queuePts.slice(0, this.queuePts.length);
		//this.queueIdxs.slice(0, this.queueIdxs.length);
		
	},
	updateRangeFromData: function(valRange) {
		var initIdx = this.queueIdxs[0].x;
		for (var i=initIdx; i<this.data.x.length; i++) {
			var x = this.data.x[i];
			var y = this.data.y[i];
			valRange.x.max = Math.max(valRange.x.max, x);
			valRange.x.min = Math.min(valRange.x.min, x);		
			valRange.y.max = Math.max(valRange.y.max, y);
			valRange.y.min = Math.min(valRange.y.min, y);
		}
	},
	updateRangeFromPts: function(valRange) {
		for (var i=0; i<this.queuePts.length; i++) {
			var x = this.queuePts[i].x;
			var y = this.queuePts[i].y;
			valRange.x.max = Math.max(valRange.x.max, x);
			valRange.x.min = Math.min(valRange.x.min, x);		
			valRange.y.max = Math.max(valRange.y.max, y);
			valRange.y.min = Math.min(valRange.y.min, y);			
		}
	},
	drawPts: function(justQueue) {
		var toDraw;
		if (justQueue) {
			toDraw = this.queuePts;
		} else {
			toDraw = this.graphedPts.concat(this.queuePts); 
		}
		for (var ptIdx=0; ptIdx<toDraw.length; ptIdx++) {
			var x = toDraw[ptIdx].x;
			var y = toDraw[ptIdx].y;
			this.graph.graphPt(x, y, this.pointCol);
		}
	},
	flashInit: function(){
		for (var ptIdx=0; ptIdx<this.queuePts.length; ptIdx++) {
			var pt = this.queuePts[ptIdx];
			var pos = this.valToCoord(pt);
			var xPt = pos.x;
			var yPt = pos.y;
			var pointCol = this.pointCol
			var flashCol = this.flashCol;
			var curCol = flashCol.copy();
			var imagePos = P(xPt - this.characLen * this.flashMult - 1, yPt - this.characLen * this.flashMult - 1);
			var len = this.characLen * 2 * this.flashMust + 2;
			var curCharacLen = this.characLen * this.flashMult;
			var imageData = this.graph.graph.getImageData(imagePos.x, imagePos.y, len, len);
			this.flashers.push(new GraphScatter.Flasher(pos, pointCol, flashCol, curCol, curCharacLen, imagePos, imageData));
		}
		if (this.flashers.length > 0) {
			addListener(curLevel, 'update', 'flash'+this.handle, this.flashRun, this);
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
			this.flashers.slice(0, this.flashers.length);
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
	flushQueue: function() {
		this.graphedPts = this.graphedPts.concat(this.queuePts);
		this.queuePts.slice(0, this.queuePts.length);
		this.queueIdxs.slice(0, this.queueIdxs.length);
	}
}

GraphScatter.DataFuncs = function(graph, xExpr, yExpr) {
	this.x = graph.makeDataFunc(xExpr);
	this.y = graph.makeDataFunc(yExpr);
}
GraphScatter.DataFuncs.prototype = {

}
GraphScatter.Data = function() {
	this.x = [];
	this.y = [];
}
GraphScatter.Data.prototype = {
	pt: function(idx) {
		if (idx === undefined) {
			return P(this.x[this.x.length - 1], this.y[this.y.length - 1]);
		}
		return P(this.x[idx], this.y[idx]);
	}
}

GraphScatter.Coord = function(x, y) {
	this.x = x;
	this.y = y;
}
GraphScatter.Coord.prototype = {
	copy: function() {
		return new GraphScatter.prototype.Coord(this.x, this.y);
	}
}
GraphScatter.Flasher = function(pos, pointCol, flashCol, curCol, curCharacLen, imagePos, imageData) {
	this.pos = pos;
	this.pointCol = pointCol;
	this.flashCol = flashCol;
	this.curCol = curCol;
	this.curCharacLen = curCharacLen;
	this.imagePos = imagePos;
	this.imageData = imageData;
}