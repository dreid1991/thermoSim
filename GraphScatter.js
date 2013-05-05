function GraphScatter(attrs) {
	this.active = true;
	this.handle = attrs.handle;
	this.dims = this.getDims();

	this.xLabel = attrs.xLabel;
	this.yLabel = attrs.yLabel;
	var axisInit = attrs.axesInit || attrs.axisInit;//sorry
	this.labelFontSize = 15;
	this.legendFontSize = 12;
	this.axisValFontSize = 11;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.legendFont = this.legendFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
	this.borderSpacing = 70;

	this.legendWidth = 80;
	attrs.axesFixed = attrs.axesFixed || {};
	this.axesFixed = {x: defaultTo(false, attrs.axesFixed.x), y: defaultTo(false, attrs.axesFixed.y)}
	this.graphRangeFrac = new GraphBase.Range(this.borderSpacing/this.dims.dx, (this.dims.dx - (this.legendWidth+8))/this.dims.dx, 1-this.borderSpacing/this.dims.dy, .05);
	this.makeReset = attrs.makeReset;
	this.setNumGridLinesAndSpacing(attrs.numGridLines); 
	this.axisInit = new GraphBase.Range(axisInit.x.min, axisInit.x.min + axisInit.x.step*(this.numGridLines.x-1), axisInit.y.min, axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1));


	this.resetRanges(); //val & axis ranges set in here
	this.stepSize = new GraphScatter.Coord(0, 0);
	

	this.setStds();
	this.layers.addLayer('flasher');
	this.layers.addLayer('marker');

	this.drawAllBG();
	
}
_.extend(GraphScatter.prototype, AuxFunctions, GraphBase, 
	{
		addSet: function(attrs){//address, label, pointCol, flashCol, data:{x:{wallInfo, data}, y:{same}}){
			var set = new GraphScatter.Set(this, attrs.handle, attrs.label, attrs.data, attrs.pointCol, attrs.flashCol, attrs.fillInPts, attrs.fillInPtsMin, attrs.trace, attrs.recording, attrs.showPts);

			this.data[attrs.handle] = set;
			
			this.makeLegendEntry(set, attrs.handle);
			this.drawAllBG();
		},
		drawAllData: function(){
			//redrawing the background is twice as fast as pasting it in
			this.drawAllBG();
			this.drawAxisVals();
			this.drawPts(false);
		},
		drawPts: function(justQueue){
			for (var setName in this.data) {
				var set = this.data[setName]
				set.drawPts(justQueue !== false);
			}
		},
		addLast: function(){ //point of entry
			var toAdd = [];
			for (var address in this.data){
				var set = this.data[address];
				if (set.recording) {
					set.trimNewData();
					set.enqueuePts();
				}
			}
			this.flushQueues(true, false);
			this.hasData = true;
		},
		getAxisBounds: function(){
			this.getXBounds();
			this.getYBounds();
		},

		graphPt: function(xVal, yVal, col){
			var pt = this.valToCoord(P(xVal,yVal));
			this.drawPtStd(pt, col);
		},

		drawPtStd: function(pt, col){
			this.drawPt(pt, col, this.characLen);
		},
		drawPt: function(pt, col, characLen, canvas){
			canvas = canvas || this.graphDisplay;
			var x = pt.x;
			var y = pt.y;
			var len = characLen;
			var pt1 = P(x-len, y);
			var pt2 = P(x, y-len);
			var pt3 = P(x+len, y);
			var pt4 = P(x, y+len);
			var pts = [pt1, pt2, pt3, pt4];
			draw.fillPtsStroke(pts, col, this.ptStroke, canvas);
		},
		reset: function(){
			this.resetStd()
		},
	}
)


GraphScatter.Set = function(graph, handle, label, dataExprs, pointCol, flashCol, fillInPts, fillInPtsMin, trace, recording, showPts) {
	this.graph = graph;
	this.handle = handle;
	this.label = label;
	this.data = new GraphScatter.Data();
	this.showPts = defaultTo(true, showPts);
	this.graphedPts = [];
	this.graphedPtIdxs = [];
	dataExprs = dataExprs || {};
	this.dataFuncs = new GraphScatter.DataFuncs(graph, dataExprs.x, dataExprs.y);
	this.pointCol = pointCol;
	this.flashCol = flashCol;
	this.fillInPts = defaultTo(true, fillInPts);
	this.fillInPtsMin = defaultTo(5, fillInPtsMin);
	this.trace = defaultTo(false, trace);
	this.visible = true;
	this.recordListenerName = this.graph.handle + this.handle.toCapitalCamelCase() + 'Record';
	//this.dataPtIdxs = []; //to be populated with Coords
	this.traceLastIdxs = new GraphScatter.Coord(0, 0);
	this.flashers = [];
	this.queuePts = [];
	this.queueIdxs = [];
	this.recording = defaultTo(true, recording);
	if (this.recording) this.recordStart();

}

GraphScatter.Set.prototype = {
	reset: function() {
		this.graphedPts.splice(0, this.graphedPts.length);
		this.graphedPtIdxs.splice(0, this.graphedPtIdxs.length);
		this.flashers.splice(0, this.flashers.length);
		this.queueIdxs.splice(0, this.queueIdxs.length);
		this.queuePts.splice(0, this.queuePts.length);
	},
	addVal: function() {
		this.data.x.push(this.dataFuncs.x());
		this.data.y.push(this.dataFuncs.y());
	},
	clearData: function() {
		this.queuePts.splice(0, this.queuePts.length);
		this.queueIdxs.splice(0, this.queueIdxs.length);
		this.data.clear();
	},
	enqueueData: function(data) {
		var initDataIdx = this.data.x.length;
		this.queuePts = this.queuePts.concat(data);
		this.addData(data);
		for (var i=initDataIdx; i<this.data.x.length; i++) {
			this.queueIdxs.push(P(i, i));
		}
		
	},
	addData: function(data) {
		this.data.addData(data);
		
	},
	recordStart: function() {
		addListener(curLevel, 'update', this.recordListenerName, function() {
			this.addVal();
		}, this);
	},
	recordStop: function() {
		removeListener(curLevel, 'update', this.recordListenerName);
	},
	trimNewData: function() {
		if (this.graphedPtIdxs.length) {
			var dataX = this.data.x;
			var dataY = this.data.y;
			var lastIdxX = this.graphedPtIdxs[this.graphedPtIdxs.length - 1].x;
			var lastIdxY = this.graphedPtIdxs[this.graphedPtIdxs.length - 1].y;
			var dDataIdxX = dataX.length - lastIdxX;//clean up thy one off's
			var dDataIdxY = dataY.length - lastIdxY;
			if (dDataIdxX != dDataIdxY) {
				return false;
			}
			var runs = this.findRuns(dataX, dataY, lastIdxY, lastIdxX, dDataIdxX);
			for (var i=runs.length - 1; i>=0; i--) {
				this.trimRun(dataX, dataY, runs[i]);
			}
		}
	},
	findRuns: function(dataX, dataY, lastIdxX, lastIdxY, dDataIdxX) {
		var Run = function(xStartIdx, yStartIdx, length) {
			this.xStartIdx = xStartIdx;
			this.yStartIdx = yStartIdx;
			this.length = length;
		}
		var runs = [];
		var curRunPts = [];
		var runUV = undefined;
		var runStartX = lastIdxX;
		var runStartY = lastIdxY;
		for (var i=0; i<dDataIdxX - 1; i++) {
			var pt = P(dataX[lastIdxX + i], dataY[lastIdxY + i]);
			if (curRunPts.length <= 1) {
				curRunPts.push(pt);
				if (curRunPts.length == 2) {
					runUV = curRunPts[0].VTo(curRunPts[1]).UV();
				}
			} else {
				var ptUV = curRunPts[curRunPts.length - 1].VTo(pt).UV();
				if (Math.abs(ptUV.dotProd(runUV)) > .99) {
					curRunPts.push(pt);
				} else {
					if (curRunPts.length >= 3) {
						runs.push(new Run(runStartX, runStartY, lastIdxX + i - runStartX, lastIdxY + i - runStartY));
					}
					curRunPts = [pt];
					runStartX = lastIdxX + i;
					runStartY = lastIdxY + i;
				}
			}
		}
		if (curRunPts.length >= 3) {
			runs.push(new Run(runStartX, runStartY, lastIdxX + i - runStartX, lastIdxY + i - runStartY));
		}	
		return runs;
	},
	trimRun: function(dataX, dataY, run) {
		var idxBoundA = P(dataX[run.xStartIdx], dataY[run.yStartIdx]);
		var idxBoundB = P(dataX[run.xStartIdx + run.length - 1], dataY[run.yStartIdx + run.length - 1]);
		var spaceBoundA = idxBoundA;
		var spaceBoundB = idxBoundB;
		var AB = spaceBoundA.VTo(spaceBoundB);
		var BA = spaceBoundB.VTo(spaceBoundA);
		var idxsBoundSpace = true;
		
		for (var i=1; i<run.length - 1; i++) {
			var pt = P(dataX[run.xStartIdx + i], dataY[run.yStartIdx + i]);
			if (idxsBoundSpace && (idxBoundA.VTo(pt).dotProd(AB) < 0 || idxBoundB.VTo(pt).dotProd(BA) < 0)) {
				idxsBoundSpace = false;	
			}
			if (AB.dotProd(spaceBoundA.VTo(pt)) < 0) {
				spaceBoundA = pt;
				AB = spaceBoundA.VTo(spaceBoundB)
			} else if (BA.dotProd(spaceBoundB.VTo(pt)) < 0) {
				spaceBoundB = pt;
				BA = spaceBoundB.VTo(spaceBoundA);
			}
		}
		var newX = [idxBoundA.x];
		var newY = [idxBoundA.y]
		if (spaceBoundA != idxBoundA) {
			newX.push(spaceBoundA.x);
			newY.push(spaceBoundA.y);
		}
		if (spaceBoundB != idxBoundB) {
			newX.push(spaceBoundB.x);
			newY.push(spaceBoundB.y);
		}
		newX.push(idxBoundB.x);
		newY.push(idxBoundB.y);
		var argsX = [run.xStartIdx, run.length].concat(newX);
		var argsY = [run.yStartIdx, run.length].concat(newY);
		Array.prototype.splice.apply(dataX, argsX);
		Array.prototype.splice.apply(dataY, argsY);
	},
	enqueuePts: function() {
		var newPt = this.data.pt();
		var newPts = [];
		var newDataIdxs = [];
		if (newPt.isValid()) {
			var newDataIdx = new GraphScatter.Coord(this.data.x.length - 1, this.data.y.length - 1);

			if (this.fillInPts && this.data.x.length && this.data.y.length && this.graphedPtIdxs.length) {
				var lastDataIdx = this.graphedPtIdxs[this.graphedPtIdxs.length-1];
				var lastPt = this.data.pt(lastDataIdx.x, lastDataIdx.y);
	
				var filledInPtsInfo = this.fillInPtsFunc(newPt, newDataIdx, lastPt, lastDataIdx, this.data);
				newPts = newPts.concat(filledInPtsInfo.newPts);
				newDataIdxs = newDataIdxs.concat(filledInPtsInfo.dataIdxs);
				
				
			}
			newPts.push(newPt);
			newDataIdxs.push(newDataIdx);
		
		}
		this.queuePts = this.queuePts.concat(newPts);
		this.queueIdxs = this.queueIdxs.concat(newDataIdxs);
	},
	fillInPtsFunc: function(a, aDataIdx, b, bDataIdx, data){
		var xDataRange = aDataIdx.x-bDataIdx.x;
		var yDataRange = aDataIdx.y-bDataIdx.y;
		if (xDataRange!=yDataRange) {
			return {newPts:[], dataIdxs:[]};//data points must correspond
		}
		var aCoord = this.graph.valToCoord(a);
		var bCoord = this.graph.valToCoord(b);
		//Input values aren't translated to pixel coordinates at this point.  
		//Am making conversion scalars so I don't have to call valToCoord for every point
		var scaling = this.graph.dataScaling();

		var perpUV = aCoord.VTo(bCoord).UV().perp();

		for (var dataIdx=xDataRange-1; dataIdx>0; dataIdx--) {
			var xIdx = bDataIdx.x + dataIdx;
			var yIdx = bDataIdx.y + dataIdx;
			var aToData = aCoord.VTo(this.graph.valToCoord(P(data.x[xIdx], data.y[yIdx])));
			var dist = Math.abs(aToData.dotProd(perpUV));
			if (dist>this.fillInPtsMin) {
				var ptOverLine = P(data.x[xIdx], data.y[yIdx]);
				var edgePtInfo = this.getEdgePt({x:xIdx, y:yIdx}, bDataIdx, perpUV, ptOverLine, dist, aCoord, data, scaling);
				if (!edgePtInfo) {
					break;
				}
				var edgeDataIdx = edgePtInfo.dataIdx;
				var edgePt = edgePtInfo.pt;
				var restOfTurnPts = this.fillInPtsFunc(edgePt, edgeDataIdx, b, bDataIdx, data);
				return {newPts:[edgePt].concat(restOfTurnPts.newPts), dataIdxs:[edgeDataIdx].concat(restOfTurnPts.dataIdxs)};
			}
		}
		return {newPts: [], dataIdxs:[]};
		
	},
	getEdgePt: function(dataIdxsMax, dataIdxsMin, perpUV, lastPt, lastDist, aCoord, data, scaling) {
		var dataRange = dataIdxsMax.x - dataIdxsMin.x;
		for (var dataIdx=dataRange-1; dataIdx>0; dataIdx--) {
			var xIdx = dataIdxsMin.x + dataIdx;
			var yIdx = dataIdxsMin.y + dataIdx;
			var aToData = aCoord.VTo(this.graph.valToCoord(P(data.x[xIdx], data.y[yIdx])));
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
		//this.queuePts.splice(0, this.queuePts.length);
		//this.queueIdxs.splice(0, this.queueIdxs.length);
		
	},
	updateRangeFromData: function(valRange) {
		var initIdx = this.queueIdxs[0] ? this.queueIdxs[0].x : 0;
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
		if (this.visible && (this.showPts || this.trace)) {
			var toDraw;
			var idxs = [];
			if (justQueue) {
				toDraw = this.queuePts;
				idxs = this.queueIdxs;
				
			} else {
				toDraw = this.graphedPts.concat(this.queuePts); 
				idxs = this.graphedPtIdxs.concat(this.queueIdxs);
			} 
			if (this.trace) {
				if (justQueue) {
					if (this.graphedPtIdxs.length) {
						this.drawTrace(this.graphedPtIdxs[this.graphedPtIdxs.length - 1].x, idxs[idxs.length - 1].x, this.graphedPtIdxs[this.graphedPtIdxs.length - 1].y, idxs[idxs.length - 1].y);
					}
				} else {
					this.drawTrace(idxs[0].x, idxs[idxs.length - 1].x, idxs[0].y, idxs[idxs.length - 1].y)
				}
			}
			if (this.showPts) {
				for (var ptIdx=0; ptIdx<toDraw.length; ptIdx++) {
					var x = toDraw[ptIdx].x;
					var y = toDraw[ptIdx].y;
					this.graph.graphPt(x, y, this.pointCol);
				
				}
			}
		}
	},
	flashInit: function(){
		if (this.visible && this.showPts) {
			for (var ptIdx=0; ptIdx<this.queuePts.length; ptIdx++) {
				var pt = this.queuePts[ptIdx];
				var pointCol = this.pointCol
				var flashCol = this.flashCol;
				var curCol = flashCol.copy();
				var imgCharacLen = 2 * this.graph.characLen * this.graph.flashMult;
				var len = this.graph.characLen * 2 * this.graph.flashMult + 2;
				var curCharacLen = this.graph.characLen * this.graph.flashMult;
				new GraphScatter.Flasher(pt, pointCol, flashCol, curCol, curCharacLen, imgCharacLen, this.graph.characLen, this.graph.flashMult, this.graph.flashRate, this.graph.graphDisplay, this.graph.layers, this.graph);
			}
		}
		
	},

	flushQueue: function() {
		this.graphedPts = this.graphedPts.concat(this.queuePts);
		this.graphedPtIdxs = this.graphedPtIdxs.concat(this.queueIdxs);
		this.queuePts.splice(0, this.queuePts.length);
		this.queueIdxs.splice(0, this.queueIdxs.length);
	},
	drawTrace: function(xMin, xMax, yMin, yMax) {
		
		if (xMax-xMin == yMax-yMin && xMin !== undefined && yMin !== undefined) {
			var numPts = xMax-xMin;
			var tracePts = [this.graph.valToCoord(P(this.data.x[xMin], this.data.y[yMin]))];
			for (var ptIdx=1; ptIdx<numPts+1; ptIdx++) {
				var pt = this.graph.valToCoord(P(this.data.x[xMin+ptIdx], this.data.y[yMin+ptIdx]));
				if (!pt.closeTo(tracePts[tracePts.length-1])) {
					tracePts.push(pt);
				}
			}
			draw.path(tracePts, this.pointCol, this.graph.graphDisplay);
		} else {
			console.log('Data count mismatch for tracing');
			console.trace();
		}
	},


}

GraphScatter.DataFuncs = function(graph, xExpr, yExpr) {
	this.x = graph.makeDataFunc(xExpr);
	this.y = graph.makeDataFunc(yExpr);
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
	},
	addData: function(data) {//takes list of points
		for (var i=0; i<data.length; i++) {
			this.x.push(data[i].x)
			this.y.push(data[i].y)
		}
	},
	toPts: function() {
		var pts = [];
		for (var i=0; i<this.x.length; i++) pts.push(this.x[i], this.y[i]);
		return pts;
	},
	clear: function() {
		this.x.splice(0, this.x.length);
		this.y.splice(0, this.y.length);
	
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

GraphScatter.Flasher = function(pt, pointCol, flashCol, curCol, curCharacLen, imgCharacLen, finalCharacLen, flashMult, flashRate, graphDisplay, layers, graph) {
	this.pt = pt;
	this.pointCol = pointCol;
	this.flashCol = flashCol;
	this.curCol = curCol;
	this.curCharacLen = curCharacLen;
	this.imgCharacLen = imgCharacLen;
	this.finalCharacLen = finalCharacLen;
	this.flashMult = flashMult;
	this.flashRate = flashRate;
	this.graphDisplay = graphDisplay;
	this.layers = layers;
	this.graph = graph;
	this.coordLast = this.graph.valToCoord(this.pt);
	this.advanceListenerHandle = this.addAdvanceListener();
	this.lifetime = 1 / this.flashRate;
	this.age = 0;
	layers.addItem('flasher', this);
}

GraphScatter.Flasher.prototype = {
	addAdvanceListener: function() {
		var handle = 'flashAdvance' + this.graph.handle + this.pt.x + this.pt.y
		addListener(curLevel, 'update', handle, function() { //handle needs 'flashAdvance' + this.graph.handle for removing
			this.advance();
		}, this)
		return handle;
	},
	draw: function() {
		this.coordLast = this.graph.valToCoord(this.pt);
		this.graph.drawPt(this.coordLast, this.curCol, this.curCharacLen, this.graphDisplay);		
	},
	remove: function() {
		this.layers.removeItem('flasher', this);
		removeListener(curLevel, 'update', this.advanceListenerHandle);
	},
	advance: function() {

		this.curCharacLen = stepTowards(this.curCharacLen, this.finalCharacLen, -this.finalCharacLen * this.flashMult * this.flashRate)
		var col = this.curCol;
		var newCol = Col(0,0,0);
		newCol.r = this.colStep('r');
		newCol.g = this.colStep('g');
		newCol.b = this.colStep('b');
		col.set(newCol);	
		if (this.age > this.lifetime + 1) this.remove();
		this.age ++;
	},

	colStep: function(col){
		var init = this.flashCol[col];
		var cur = this.curCol[col];
		var setPt = this.pointCol[col];
		var diff = setPt - init;
		var step = diff*this.graph.flashRate;
		return stepTowards(cur, setPt, step);	
	},

}