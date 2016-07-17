/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
	this.logScale = attrs.logScale ? {x: defaultTo(false, attrs.logScale.x), y: defaultTo(false, attrs.logScale.y)} : {x: false, y: false};
	//if log 
	this.legendWidth = 80;
	attrs.axesFixed = attrs.axesFixed || {};
	this.axesFixed = {x: defaultTo(false, attrs.axesFixed.x), y: defaultTo(false, attrs.axesFixed.y)}
	this.graphRangeFrac = new GraphBase.Range(this.borderSpacing/this.dims.dx, (this.dims.dx - (this.legendWidth+8))/this.dims.dx, 1-this.borderSpacing/this.dims.dy, .05);
	this.makeReset = attrs.makeReset;
	this.setNumGridLinesAndSpacing(attrs.numGridLines); 
	this.axisInit = this.setAxesInit(axisInit, this.numGridLines);


	this.resetRanges(); //val & axis ranges set in here
	this.stepSize = new GraphScatter.Coord(0, 0);
	

	this.setStds();
	this.layers.addLayer('flasher');
	this.layers.addLayer('marker');

	this.drawAllBG();
	this.clickableDataSetListenerName = 'clickableDataSet' + this.handle;
    this.userMouseActive = false;
    this.handleClickable = null;
    this.clickTime = null; //time (gotten with Date.now() when mouseup last detected. Used for finding double click
    this.clickDataLen = 0; //used for recoding num clicked data points, because using mousemove may or may not register if using, say, a tablet
	
}
_.extend(GraphScatter.prototype, AuxFunctions, GraphBase, 
	{
		setAxesInit: function(axisInit, numGridLines) {
			var xMin, xMax, yMin, yMax;
			
			
			if (this.logScale.x) {
				var orderOfMagSpan = numGridLines.x - 1;
				yMin = Math.pow(10, Math.floor(Math.log(axisInit.x.min) / Math.LN10));
				yMax = min * Math.pow(10, orderOfMagSpan);
			} else {
				xMin = axisInit.x.min;
				xMax = xMin + axisInit.x.step * (numGridLines.x-1)
			}
			
			if (this.logScale.y) {
				var orderOfMagSpan = numGridLines.y - 1;
				yMin = Math.pow(10, Math.floor(Math.log(axisInit.y.min) / Math.LN10));
				yMax = yMin * Math.pow(10, orderOfMagSpan);

			} else {
				yMin = axisInit.y.min;
				yMax = yMin + axisInit.y.step*(numGridLines.y-1);
			}
			return new GraphBase.Range(xMin, xMax, yMin, yMax);
		},
		activateClickable: function() {
			var numClickables = 0;
            for (var handle in this.data) {
                var dataSet = this.data[handle];
				if (dataSet.clickable) {
					numClickables ++;
				}
			}
			if (numClickables > 1) {
				console.log("WARNING - MORE THAN ONE CLICKABLE SET FOR GRAPH " + graph.handle);
			}
            console.log(this.data);
            for (var handle in this.data) {
                var dataSet = this.data[handle];
				if (dataSet.clickable) {
                    this.handleClickable = handle;
                    
                
					addListener(curLevel, 'mouseup', this.clickableDataSetListenerName, this.mouseup, this);
				}
			}
	    },
		deactivateClickable: function() {
			removeListener(curLevel, 'mouseup', this.clickableDataSetListenerName); //mousemove and mouseup deactivate themselves if you move out of graph, so this is only one that can be active
	    },
        addMousePoint: function(posInDiv) {
            dataSetClickable = this.data[this.handleClickable];
            //now read through all points of snapToSets sets and pick closest.  If less than some dist away, snap to that pos, otherwise just go where you are now
            var minDistSqr = 50000;
            var minDistVal = null;
            snapToSets = dataSetClickable.snapToSets;
            for (var i=0; i<snapToSets.length; i++) {
                set = this.data[snapToSets[i]];
                for (var j=0; j<set.graphedPts.length; j++) {
                    var valPosInDiv = this.valToCoord(set.graphedPts[j]);
                    var distSqr = posInDiv.distSqrTo(valPosInDiv);
                    if (distSqr < minDistSqr) {
                        minDistVal = set.graphedPts[j];
                        minDistSqr = distSqr;
                    }
                }
            }
            if (minDistVal !== null && minDistSqr < 30*30) { //hardcoding in px value right now.
                dataSetClickable.data.addData([minDistVal]);
            } else {
                dataSetClickable.data.addData([this.coordToVal(posInDiv)]);
            }

        },
        mouseInGraph: function(posInDiv) {
            var ptOrigin = P(this.graphRangeFrac.x.min * this.dims.dx, this.graphRangeFrac.y.max * this.dims.dy);
            var width = this.dims.dx * (this.graphRangeFrac.x.max - this.graphRangeFrac.x.min);
            var height = this.dims.dy * (this.graphRangeFrac.y.min - this.graphRangeFrac.y.max);
            var ptUpper = P(ptOrigin.x + width, ptOrigin.y + height);
            return (posInDiv.x > ptOrigin.x && posInDiv.y > ptOrigin.y && posInDiv.x < ptUpper.x && posInDiv.y < ptUpper.y)
        },
		mouseup: function() {
            //var ka
            this.clickTime = Date.now();
            posInDiv = mouseOffsetDiv(this.parentDivId)
           
            if (this.mouseInGraph(posInDiv)) {
                //should add a thing to record current idx in case user mouses out
                this.data[this.handleClickable].resetToLen(this.clickDataLen);

                this.addMousePoint(posInDiv);
                this.addLastSingleSet(this.handleClickable, true);
                //this.drawPts(false);
                //add mousemove listener
                if (!this.userMouseActive) {
                    addListener(curLevel, 'mousemove', this.clickableDataSetListenerName, this.mousemove, this);
                    this.userMouseActive = true;
                }
                this.clickDataLen += 1;

            }

	    },
        mousemove: function() {
            posInDiv = mouseOffsetDiv(this.parentDivId);
            if (!this.mouseInGraph(posInDiv)) {
                this.data[this.handleClickable].reset(); 
                removeListener(curLevel, 'mousemove', this.clickableDataSetListenerName);
                this.drawAllBG();
                this.drawAllData();
                this.userMouseActive = false;
                this.clickDataLen = 0;
            } else {
            }
        },
		addSet: function(attrs){//address, label, pointCol, flashCol, data:{x:{wallInfo, data}, y:{same}}){
			if (!this.data[attrs.handle]) {
				var self = this;
				var set = new GraphScatter.Set(this, attrs.handle, attrs.label, attrs.data, attrs.pointCol, attrs.flashCol, attrs.fillInPts, attrs.fillInPtsMin, attrs.trace, attrs.recording, attrs.showPts, attrs.clickable, attrs.snapToSets);
				var ptCol = attrs.pointCol.copy();
				this.data[attrs.handle] = set;
				var drawFunc;
				if (attrs.trace && defaultTo(true, attrs.showPts)) {
					drawFunc = function(pos) {
						draw.line(pos.copy().movePt(V(-9, 0)), pos.copy().movePt(V(9, 0)), ptCol, self.graphDisplay);
						self.drawPtStd(pos, ptCol)
					}
				} else if (attrs.trace) {
					drawFunc = function(pos) {
						draw.line(pos.copy().movePt(V(-9, 0)), pos.copy().movePt(V(9, 0)), ptCol, self.graphDisplay);
					}
				} else {
					drawFunc = function(pos) {
						self.drawPtStd(pos, ptCol);
					}
				}
				this.makeLegendEntry(set, set.label, attrs.handle, drawFunc);
				this.drawAllBG();
				//loading values from level input into data set
				if (attrs.dataVals != undefined) {
					x = attrs.dataVals.x;
					y = attrs.dataVals.y;
					if (x != undefined && y != undefined && x.length == y.length) {
						for (var i=0; i<x.length; i++) {
							set.data.x = [x[i]];
							set.data.y = [y[i]];
							this.addLast(true);


						}
                        set.initialDataLen = x.length;


					}
				}

			}
		},

		setDataValid: function() {
			for (var setName in this.data) {
				this.data[setName].setDataValid();
			}
			for (var markerName in this.markers) {
				this.markers[markerName].setDataValid();
			}
			
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
		addLast: function(force){ //point of entry for adding data
			for (var setHandle in this.data){
				var set = this.data[setHandle];
				if ((set.recording || force) && set.dataValid) {
					if (set.fillInPts) {
						set.trimNewData();
					}
					set.enqueuePts();
				}
			}
			this.flushQueues(true, false);
			this.hasData = true;
		},
        addLastSingleSet(setHandle, force) { //used for user-clicked points.  
            var set = this.data[setHandle];
            if ((set.recording || force) && set.dataValid) {
                if (set.fillInPts) {
                    set.trimNewData();
                }
                set.enqueuePts();
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


GraphScatter.Set = function(graph, handle, label, dataExprs, pointCol, flashCol, fillInPts, fillInPtsMin, trace, recording, showPts, clickable, snapToSets) {
	this.graph = graph;
	this.handle = handle;
	this.label = label;
	this.data = new GraphScatter.Data();
	this.showPts = defaultTo(true, showPts);
	this.graphedPts = [];
	this.graphedPtIdxs = [];
	dataExprs = dataExprs || {};
	//if you don't want data added, just don't add .x .y attributes.  setValidData with say that the data is invalid and new points won't be added
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
	this.dataValid = true;
    //data set member variables for setting whether can create data sets through clicking on graph.  Only one set can be set as the 'clickable' one for a given graph.  We do a check of this when graph creates all the sets (in Timeline graph spawn function)
    this.clickable = defaultTo(false, clickable);
    this.snapToSets = defaultTo([], snapToSets);
    this.initialDataLen = 0; //this is the number of data points set by the input script.  These points will not be erased on reset
	if (this.recording) this.recordStart();

}

GraphScatter.Set.prototype = {
	reset: function() {
        this.resetToLen(this.initialDataLen);
        return this.initialDataLen;
	},
    resetToLen: function(x) {
		this.graphedPts.splice(x, this.graphedPts.length);
		this.graphedPtIdxs.splice(x, this.graphedPtIdxs.length);
        for (var i=0; i<this.flashers.length; i++) {
            this.flashers[i].remove(); //this takes care of splicing them
        }
	//	this.flashers.splice(0, this.flashers.length);
		this.queueIdxs.splice(0, this.queueIdxs.length);
		this.queuePts.splice(0, this.queuePts.length);
    },
	setDataValid: function() {
		try {
			var x = this.dataFuncs.x();
			var y = this.dataFuncs.y();
			this.dataValid = validNumber(x) !== false && validNumber(y) !== false ? true : false;
		} catch(e) {
			this.dataValid = false;
		}
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
			if (this.dataValid) this.addVal();
		}, this);
	},
	recordStop: function() {
		removeListener(curLevel, 'update', this.recordListenerName);
	},
	trimNewData: function() { //so we record data points with the update interval, but we graph new ones every data inverval.  This means we get a lot of new points we might have to graph every data intervals.  Often, these points all lie on a line.  This function removes points that all fall in a line (except the two ends of the line) so the graph looks cleaner
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
		if (this.visible && (this.showPts || this.trace) && (this.queuePts.length || this.graphedPts.length)) {
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
					if (this.graphedPtIdxs.length && idxs.length) {
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
				flasher = new GraphScatter.Flasher(pt, pointCol, flashCol, curCol, curCharacLen, imgCharacLen, this.graph.characLen, this.graph.flashMult, this.graph.flashRate, this.graph.graphDisplay, this.graph.layers, this.graph, this);
                this.flashers.push(flasher);
			}
		}
		
	},
    removeFlasher: function(flasher) {
        for (var i=0; i<this.flashers.length; i++) {
            if (this.flashers[i] == flasher) {
                this.flashers.splice(i, i+1);
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

GraphScatter.Flasher = function(pt, pointCol, flashCol, curCol, curCharacLen, imgCharacLen, finalCharacLen, flashMult, flashRate, graphDisplay, layers, graph, dataSet) {
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
    this.dataSet = dataSet;
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
	setDrawCanvas: function(drawCanvas) {
		this.graphDisplay = drawCanvas;
	},
	draw: function() {
		this.coordLast = this.graph.valToCoord(this.pt);
		this.graph.drawPt(this.coordLast, this.curCol, this.curCharacLen, this.graphDisplay);		
	},
	remove: function() {
		this.layers.removeItem('flasher', this);
        this.dataSet.removeFlasher(this);
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
