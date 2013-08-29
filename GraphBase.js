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

GraphBase = {

	setStds: function(){
		window.storedGraphs[this.handle] = this;
		window.curLevel.graphs[this.handle] = this; //also set in timeline, but is child of liquid or something, doesn't go through timeline add graph funcs
		//also - this overwrites the phase diagram's entry in curLevel.  I *think* that's alright because it makes it so one can add sets and stuff. Phase is just kind of a wrapper anyway
		this.hashMarkLen = 10;
		this.checkMarkOversize = 3;
		this.bgCol = curLevel.bgCol;
		this.gridCol = Col(72,72,72);
		this.toggleCol = Col(255,255,255);
		this.data = {};
		this.legend = {};
		this.markers = {};
		this.textCol = Col(255, 255, 255);
		this.flashMult = 1.5;
		this.flashRate = .1;
		this.graphBoundCol = Col(255,255,255);
		this.integralCol = Col(150, 150, 150);
		this.integralAlpha = .5;
		this.ptStroke = Col(0,0,0);
		this.rectSideLen = 8;
		//characLen, characteristic length, is the radius of the shape being used
		this.characLen = Math.sqrt(Math.pow(this.rectSideLen, 2)/2);	
		this.buttonId = this.handle + 'Reset';
		this.graphId = this.handle + 'Graph';
		this.parentDiv = this.pickParentDiv('graph');
		this.parentDivId = $(this.parentDiv).attr('id');
		this.makeReset = defaultTo(true, this.makeReset);
		var canvasDisplay = this.makeCanvas(this.dims, this.parentDiv, this.handle + 'Graph', this.makeReset, this.handle + 'Button');
		this.graphDisplayHTMLElement = canvasDisplay.HTMLElem;
		this.graphDisplay = canvasDisplay.canvas;
		this.layers = new GraphBase.Layers();
		this.wrapperId;
		this.initDrawLayers();
		this.hasData = false;
	},
	makeDataFunc: function(expr) {
		with (DataGetFuncs) {
			if (exprHasReturn(expr)) {
				return eval('(function(){' + expr + '})');
			} else {
				return eval('(function(){return ' + expr + '})')
			
			}
		}
	},
	initDrawLayers: function() {
		addListener(curLevel, 'update', 'drawLayers' + this.handle, this.drawLayers, this);
	},
	setNumGridLinesAndSpacing: function(numGridLines) {
		var numLinesX, numLinesY, spacingX, spacingY;
		numGridLines = numGridLines ? numGridLines : {};
		if (numGridLines.x) {
			numLinesX = numGridLines.x;
			spacingX = this.getGridSpacing(numLinesX, this.graphRangeFrac.x, this.dims.dx)
		} else {
			spacingX = 40;
			numLinesX = Math.ceil(this.dims.dx*(Math.abs(this.graphRangeFrac.x.max-this.graphRangeFrac.x.min))/spacingX)
		}
		if (numGridLines.y) {
			numLinesY = numGridLines.y;
			spacingY = this.getGridSpacing(numLinesY, this.graphRangeFrac.y, this.dims.dy);
		} else {
			spacingY = 40;
			numLinesY = Math.ceil(this.dims.dy*(Math.abs(this.graphRangeFrac.y.max-this.graphRangeFrac.y.min))/spacingY);
		}
		this.numGridLines = P(numLinesX, numLinesY);
		this.gridSpacing = P(spacingX, spacingY);
		
	},
	makeCanvas: function(dims, parentDiv, graphId, makeButton, buttonId) {
		var self = this;
		
		parentDiv.html('');
		var html = templater.canvas({
			attrs: {
				id: [graphId],
				class: ['noSelect'],
				width: [dims.dx],
				height: [dims.dy]
			},
		})
		if (makeButton) {
			html += templater.button({
				attrs: {
					id: [buttonId]
				},
				style: {
					position: 'absolute',
					right: '.5em',
					bottom: '.5em'
				},
				innerHTML: templater.img({
					attrs: {
						src: [window.IMGPATHPREFIX + 'img/refresh.gif']
					}
					})
			});
		}
			
		var canvasDiv = $(html);
		
		$(parentDiv).append(canvasDiv);
		if (makeButton) {
			addJQueryElems($('#' + buttonId), 'button');
			$('#' + buttonId).click(function(){self.reset()})
		}
		var HTMLElem = document.getElementById(graphId);
		var canvas =  HTMLElem.getContext('2d');
		return {HTMLElem: HTMLElem, canvas: canvas};

		
	},
	restoreHTML: function() {
		var parentEmpty = this.parentDivEmpty();
		if (!parentEmpty) {
			this.parentDiv = this.pickParentDiv('graph');
			this.parentDivId = $(this.parentDiv).attr('id');	
		}
		var canvasDisplay = this.makeCanvas(this.dims, this.parentDiv, this.handle + 'Graph', this.makeReset, this.handle + 'Button');
		this.graphDisplayHTMLElement = canvasDisplay.HTMLElem;
		this.graphDisplay = canvasDisplay.canvas;
		this.layers.setDrawCanvas(this.graphDisplay);
		if (this.legend) {
			for (var legendEntry in this.legend) {
				this.legend[legendEntry].setCanvas(this.graphDisplay);
				this.legend[legendEntry].toggleActivate();
			}
		}
	},
	clearHTML: function() {
		this.cleanUpParent();
	},
	remove: function(){
		this.disable();
		removeListener(curLevel, 'update', 'drawLayers' + this.handle);
		removeListenerByName(curLevel, 'update', 'flashAdvance' + this.handle);
		this.layers.removeAll();
		this.cleanUpParent();
		return this;
	},
	enable: function(addPt){
		for (var setName in this.data) this.data[setName].recordStart();
		this.active = true;
		if (addPt) {
			for (var setName in this.data) this.data[setName].addVal();
			this.addLast();
		}
		return this;
	},
	disable: function(){
		for (var setName in this.data) this.data[setName].recordStop();
		this.active = false;
		return this;
	},

	integrate: function(set){
		this.data[set].integralPts = this.getIntegralPts(set);
		this.drawIntegral(set);
		return this;
	},
	getIntegralPts: function(set){
		var xPts = this.data[set].src.x;
		var yPts = this.data[set].src.y;
		var integralPts = new Array(xPts.length);
		for(var ptIdx=0; ptIdx<xPts.length; ptIdx++){
			integralPts[ptIdx] = this.valToCoord(P(xPts[ptIdx], yPts[ptIdx]));
		}
		//this.makeIntegralBeFunction(integralPts);
		//HEY - YOU SHOULD *PROBABLY* MAKE A THING THAT MAKES POINTS ABOVE OTHERS REMOVE THE LOWER POINT SO IT LOOKS LIKE WE INTEGRATED A FUNCTION
		var yMax = this.yStart*this.dims.dy;
		var lastX = integralPts[integralPts.length-1].x;
		var firstX = integralPts[0].x;
		integralPts.push(P(lastX, yMax));
		integralPts.push(P(firstX, yMax));
		return integralPts;
		
	},
	// drawIntegral: function(set){
		// var pts = this.data[set].integralPts;
		// draw.fillPtsAlpha(pts, this.integralCol, this.integralAlpha, this.graphAssignments.display);
		// this.graphPts();
	// },
	setData: function(setHandle, data) {
		var set = this.data[setHandle];
		if (set) 
			set.setData(data);
		else 
			console.log('Bad set handle ' + setHandle);
	},
	drawAllBG: function(){
		this.drawBGRect();
		this.drawGrid();
		this.drawBounds();
		if(this.legend){
			this.drawLegend();
		}
		this.drawLabels();
	},	
	drawBGRect: function(){
		draw.roundedRect(P(0,0), V(this.dims.dx, this.dims.dy), 20, this.bgCol, this.graphDisplay); 
	},
	drawGrid: function(){
		var xVal = this.axisRange.x.min / 10;
		for (var xGridIdx=0; xGridIdx<this.numGridLines.x; xGridIdx++) {
			if (this.logScale.x) {
				xVal *= 10;
			} else {
				var xVal = this.axisRange.x.min + this.stepSize.x * xGridIdx;
			}
			var pos = this.valToCoord(P(xVal, 1));
			var x = pos.x//this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * xGridIdx;
			var yEnd = this.graphRangeFrac.y.max * this.dims.dy;
			var yAxis = this.graphRangeFrac.y.min * this.dims.dy + this.hashMarkLen;
			var p1 = P(x, yAxis);
			var p2 = P(x, yEnd);
			draw.line(p1, p2, this.gridCol, this.graphDisplay);
		}
		var yVal = this.axisRange.y.min / 10;
		for (var yGridIdx=0; yGridIdx<this.numGridLines.y; yGridIdx++){
			if (this.logScale.y) {
				yVal *= 10;
			} else {
				var yVal = this.axisRange.y.min + this.stepSize.y * yGridIdx;//this.graphRangeFrac.y.min * this.dims.dy - this.gridSpacing.y *yGridIdx;
			}
			var pos = this.valToCoord(P(1, yVal));
			var y = pos.y;
			var xEnd = this.graphRangeFrac.x.min * this.dims.dx;
			var xAxis = this.graphRangeFrac.x.max * this.dims.dx - this.hashMarkLen;
			var p1 = P(xAxis, y);
			var p2 = P(xEnd, y);			
			draw.line(p1, p2, this.gridCol, this.graphDisplay);
		}
	},
	drawBounds: function(){
		var ptOrigin = P(this.graphRangeFrac.x.min * this.dims.dx, this.graphRangeFrac.y.max * this.dims.dy);
		var width = this.dims.dx * (this.graphRangeFrac.x.max - this.graphRangeFrac.x.min);
		var height = this.dims.dy * (this.graphRangeFrac.y.min - this.graphRangeFrac.y.max);
		var dims = V(width, height);
		draw.strokeRect(ptOrigin, dims, this.graphBoundCol, this.graphDisplay);
	},
	drawLabels: function(){
		var xLabelPos = P(this.dims.dx * (this.graphRangeFrac.x.min + this.graphRangeFrac.x.max) / 2, Math.min(this.dims.dy * this.graphRangeFrac.y.min + 50, this.dims.dy-20))
		var yLabelPos = P(Math.max(this.dims.dx * this.graphRangeFrac.x.min - 50, 20), this.dims.dy * (this.graphRangeFrac.y.min + this.graphRangeFrac.y.max) / 2)
		xLabelPos.y+=this.labelFontSize/2;
		yLabelPos.y+=this.labelFontSize/2;
		draw.text(this.xLabel, xLabelPos, this.labelFont, this.textCol, 'center',  0, this.graphDisplay);
		draw.text(this.yLabel, yLabelPos, this.labelFont, this.textCol, 'center', -Math.PI/2, this.graphDisplay);
	},
	drawLegend: function(){
		for (var entryName in this.legend){
			var entry = this.legend[entryName].draw();
		}
	},
	
	drawMarkers: function() {
		for (var markerName in this.markers) {
			this.markers[markerName].draw();
		}
	},
	clearData: function(setHandle, redraw) {
		var set = this.data[setHandle];
		if (set) set.clearData();
		if (redraw) this.drawAllData();
	},
	enqueueData: function(setHandle, data) {
		var set = this.data[setHandle];
		if (set) set.enqueueData(data);
	},
	updateRange: function() {
		var oldValRange = this.valRange.copy();
		for (var setName in this.data) {
			this.data[setName].updateRange(this.valRange);
		}
		
		this.setAxisBounds(oldValRange);
	},
	flushQueues: function(flash, mustRedraw){
		mustRedraw = defaultTo(false, mustRedraw);
		flash = defaultTo(true, flash);
		var oldValRange = this.valRange.copy();
		var toDraw = {};
		
		for (var setName in this.data) {
			var set = this.data[setName];
			if (set.visible) set.updateRange(this.valRange);
		}

		var oldAxisRange = this.axisRange.copy();
		this.setAxisBounds(oldValRange);
		if (!this.rangeIsSame(oldAxisRange.x, this.axisRange.x) || !this.rangeIsSame(oldAxisRange.y, this.axisRange.y)) {
			mustRedraw = true;
		}
		if (mustRedraw) {
			this.drawAllData();
		} else {
			this.drawPts();
		}

		if (flash) {
			this.flashInit();
		}
		for (var setName in this.data) this.data[setName].flushQueue();
		this.drawLayers();
	},

	drawLayers: function(force) {
		//redrawing all data is hugely faster than erasing flashers with get/put image data.  get/put took ~25% of a core for two markers.  Redrawing is fast.
		if ((turn % 2 || force ) && this.hasData && this.layers.count) {
			this.drawAllData();
			for (var layerIdx=0; layerIdx<this.layers.layers.length; layerIdx++) {
				var layer = this.layers.layers[layerIdx];
				for (var itemIdx=0; itemIdx<layer.length; itemIdx++) {
					layer[itemIdx].draw();
				}
			}
		}
	},
	flashInit: function() {
		for (var setName in this.data) {
			this.data[setName].flashInit();
		}
	},
	rangeIsSame: function(a, b){
		return !(a.max!=b.max || a.min!=b.min);
	},
	getGridSpacing: function(numGridLines, bounds, canvasDim) {
		var graphDim = canvasDim * Math.abs(bounds.max - bounds.min);
		var spacing = 20;
		graphDim -= spacing;
		return graphDim / (numGridLines - 1);
		
	},
	setAxisBounds: function(oldRange){
		this.setAxisBoundsX(oldRange);
		this.setAxisBoundsY(oldRange);
	},
	setAxisBoundsX: function(oldRange){
		var a = this.axisInit;
		var b = this.valRange;	
		if (!(a.x.min<b.x.min && a.x.max>b.x.max) && !this.axesFixed.x) {
			if (oldRange) {
				if (!this.rangeIsSame(oldRange.x, this.valRange.x)) {
					this.getXBounds();
				}
			} else {
				this.getXBounds();
			}
		} else {
			this.setAxisToInit('x');
		}
	},
	setAxisBoundsY: function(oldRange){
		var a = this.axisInit;
		var b = this.valRange;	
		if (!(a.y.min<b.y.min && a.y.max>b.y.max) && !this.axesFixed.y) {
			if (oldRange) {
				if (!this.rangeIsSame(oldRange.y, this.valRange.y)) {
					this.getYBounds();
				}
			} else {
				this.getYBounds();
			}
		} else {
			this.setAxisToInit('y');
		}		
	},
	setAxisToInit: function(axis){
		var curRange = this.axisRange[axis];
		var init = this.axisInit[axis];
		var numGridLines = this.numGridLines[axis];
		curRange.min = init.min;
		curRange.max = init.max;
		var range = curRange.max-curRange.min;
		this.stepSize[axis] = range/(numGridLines-1);
	},
	getXBounds: function(){
		var rangeX = this.valRange.x.max-this.valRange.x.min;
		var newBounds = {min: undefined, max: undefined};
		var newStepSize;
		//axes cannot shrink.  
		if (rangeX!=0) {
			if (this.logScale.x) {
				var orderOfMagSpan = this.numGridLines.x - 1;
				var min = Math.pow(10, Math.floor(Math.log(this.valRange.x.min) / Math.LN10));
				var max = min * Math.pow(10, orderOfMagSpan);
				newBounds.min = min;
				newBounds.max = max;
				newStepSize = 1;
			} else {
				var unroundStepX = rangeX / (this.numGridLines.x-2);
				var expStepX = Math.pow(10, Math.floor(Math.log10(unroundStepX)))
				newStepSize = Math.ceil(unroundStepX / expStepX) * expStepX;
				newBounds.min = Math.floor(this.valRange.x.min / newStepSize) * newStepSize;
				newBounds.max = newBounds.min + (this.numGridLines.x - 1) * newStepSize;	
			}
			//this.stepSize.x = Math.ceil(unroundStepX/expStepX)*expStepX;
			//this.axisRange.x.min = Math.floor(this.valRange.x.min/this.stepSize.x)*this.stepSize.x;
			//this.axisRange.x.max = this.axisRange.x.min + (this.numGridLines.x-1)*this.stepSize.x;
		} else {
			newStepSize = .2;
			newBounds.min = Math.floor(this.valRange.x.min);
			newBounds.max = newBounds.min + newStepSize * this.numGridLines.x;
			// this.axisRange.x.min = Math.floor(this.valRange.x.min);
			// this.stepSize.x = .2;
			// this.axisRange.x.max = this.axisRange.x.min + this.stepSize.x*this.numGridLines.x;	
		}
		if (newBounds.min < this.axisRange.x.min || newBounds.max > this.axisRange.x.max) {
			this.axisRange.x.min = newBounds.min;
			this.axisRange.x.max = newBounds.max;
			this.stepSize.x = newStepSize;
		}
	},
	getYBounds: function(){
		var rangeY = Math.abs(this.valRange.y.max-this.valRange.y.min);
		var newBounds = {min: undefined, max: undefined};
		var newStepSize;
		if (rangeY!=0) {
			if (this.logScale.y) {
				var orderOfMagSpan = this.numGridLines.y - 1;
				var min = Math.pow(10, Math.floor(Math.log(this.valRange.y.min) / Math.LN10));
				var max = min * Math.pow(10, orderOfMagSpan);
				newBounds.min = min;
				newBounds.max = max;
				newStepSize = 1;
			} else {
				var unroundStepY = rangeY / (this.numGridLines.y-2);
				var expStepY = Math.pow(10, Math.floor(Math.log10(unroundStepY)))
				newStepSize = Math.ceil(unroundStepY / expStepY) * expStepY;
				newBounds.min = Math.floor(this.valRange.y.min / newStepSize) * newStepSize;
				newBounds.max = newBounds.min + (this.numGridLines.y-1) * newStepSize;
			}
		} else {
			newBounds.min = Math.floor(this.valRange.y.min);
			newStepSize = .2;
			newBounds.max = newBounds.min + newStepSize * this.numGridLines.y;	
		}
		if (newBounds.min < this.axisRange.y.min || newBounds.max > this.axisRange.y.max) {
			this.axisRange.y.min = newBounds.min;
			this.axisRange.y.max = newBounds.max;
			this.stepSize.y = newStepSize;
		}
	},
	drawAxisVals: function() {
		if (this.stepSize.x > 0 && this.stepSize.y > 0) {
			var evalXOnX = function(graphRangeFrac, dims, gridSpacing, lineIdx, hashMarkLen, axisValFontSize) {
				return graphRangeFrac.x.min * dims.dx + gridSpacing.x * lineIdx
			}
			var evalYOnX = function(graphRangeFrac, dims, gridSpacing, lineIdx, hashMarkLen, axisValFontSize) {
				return graphRangeFrac.y.min * dims.dy + hashMarkLen + 10 + axisValFontSize / 2;
			}
			var evalXOnY = function(graphRangeFrac, dims, gridSpacing, lineIdx, hashMarkLen, axisValFontSize) {
				return graphRangeFrac.x.min * dims.dx - hashMarkLen - 10;
			}
			var evalYOnY = function(graphRangeFrac, dims, gridSpacing, lineIdx, hashMarkLen, axisValFontSize) {
				return graphRangeFrac.y.min * dims.dy - gridSpacing.y * lineIdx;
			}
			this.drawSingleAxisVals(this.numGridLines.x, this.graphRangeFrac, this.axisRange.x, this.logScale.x, this.stepSize.x, evalXOnX, evalYOnX);
			this.drawSingleAxisVals(this.numGridLines.y, this.graphRangeFrac, this.axisRange.y, this.logScale.y, this.stepSize.y, evalXOnY, evalYOnY);
		
		}
	},
	drawSingleAxisVals: function(numGridLines, graphRangeFrac, axisRange, logScale, stepSize, evalX, evalY) {
		var oversizeEntries = false;
		var showNextEntry = true;
		for (var lineIdx=0; lineIdx<numGridLines; lineIdx++) {
			var x = evalX(graphRangeFrac, this.dims, this.gridSpacing, lineIdx, this.hashMarkLen, this.axisValFontSize);
			var y = evalY(graphRangeFrac, this.dims, this.gridSpacing, lineIdx, this.hashMarkLen, this.axisValFontSize);
			var text;
			if (logScale) {
				text = this.numToAxisVal(axisRange.min * Math.pow(10, lineIdx));
			} else {
				text = this.numToAxisVal(axisRange.min + stepSize * lineIdx, 1);
			}
			oversizeEntries = oversizeEntries || text.length > 3;
			
			if (oversizeEntries) 
				showNextEntry = !showNextEntry;
			
			if (showNextEntry) 
				draw.text(text, P(x, y), this.axisValFont, this.textCol, 'center', 0, this.graphDisplay);
		}
	},
	makeLegendEntry: function(set, label, handle, drawMarker) {
		var x = this.dims.dx-this.legendWidth+5;
		var y = 30;
		for (var entryIdx in this.legend){
			y += 35;
		}
		var legendEntry = new GraphBase.LegendEntry(this, set, label, x, y, this.legendFontSize, this.dims, this.toggleCol, this.legendFont, this.textCol, drawMarker);
		legendEntry.toggleActivate();
		
		this.legend[handle] = legendEntry;
		this.drawAllBG();
	},
	numToAxisVal: function(x) {
		if ((Math.abs(x) <= .1 || Math.abs(x) >= 1000) && x != 0) {
			return x.toExponential();
		} else {
			return x.toFixed(1);
		}
	},
	getRange: function(axis){
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		for (var set in this.data){
			var data = this.data[set].data[axis];
			for (var dataIdx=0; dataIdx<data.length; dataIdx++){
				var datum = data[dataIdx];
				min = Math.min(min, datum);
				max = Math.max(max, datum);
			}
		}
		return {min:min, max:max};
	},

	resetStd: function(){
		for (var setName in this.data) this.data[setName].reset();

		removeListener(curLevel, 'update', 'flash'+this.name);
		this.drawAllBG();
		this.resetRanges();
		this.hasData = false;
	},	
	resetRanges: function(){
		this.axisRange = new GraphBase.Range(Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE);
		this.valRange = new GraphBase.Range(Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE);
	},
	ptsExist: function(pts){
		for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			if(pt.x===undefined || pt.y===undefined || isNaN(pt.x) || isNaN(pt.y)){
				return false;
			}
		}
		return true;
	},
	valToCoord: function(val) {
		var x, y;
		if (this.logScale.x) {
			x = this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * (this.numGridLines.x - 1) * Math.log(val.x / this.axisRange.x.min) / Math.log(this.axisRange.x.max / this.axisRange.x.min);
		} else {
			var rangeX = this.axisRange.x.max - this.axisRange.x.min;
			x = this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * (this.numGridLines.x - 1) * (val.x - this.axisRange.x.min) / rangeX; 
		}
		if (this.logScale.y) {
			y = this.dims.dy - (1 - this.graphRangeFrac.y.min) * this.dims.dy - this.gridSpacing.y * Math.log(val.y / this.axisRange.y.min) / Math.LN10;
		} else {
			var rangeY = this.axisRange.y.max - this.axisRange.y.min;
			//y = this.dims.dy - (this.gridSpacing.y * (this.numGridLines.y - 1) * (val.y - this.axisRange.y.min) / rangeY + (1 - this.graphRangeFrac.y.min) * this.dims.dy);
			y = this.dims.dy - (1 - this.graphRangeFrac.y.min) * this.dims.dy - this.gridSpacing.y * (this.numGridLines.y - 1) * (val.y - this.axisRange.y.min) / rangeY;
		}
		return P(x,y);
	},
	dataScaling: function() {
		var dx = this.gridSpacing.x / this.stepSize.x;
		var dy = this.gridSpacing.y / this.stepSize.y;
		return V(dx, dy);
	},
	checkMark: function(pos, dims, oversize, fillCol, drawCanvas) {
		var strokeCol = Col(0, 0, 0);
		pos.x -= oversize;
		pos.y -= oversize;
		dims.dx += 2 * oversize;
		dims.dy += 2 * oversize;
		return new CheckMark(pos, dims, fillCol, strokeCol, drawCanvas);
	},
	
	addMarker: function(attrs){
		if (attrs.handle) {
			attrs.graphDisplay = this.graphDisplay;
			//attrs.graphData = this.graphData
			attrs.graph = this;
			attrs.layers = this.layers;
			this.markers[attrs.handle] = new GraphBase.Marker(attrs);
		} else {
			console.log('Tried to add a graph marker for ' + this.handle + ' with no handle.  Add a handle.');
		}
	},

	
}

GraphBase.LegendEntry = function(graph, set, text, x, y, fontSize, graphDims, toggleCol, font, textCol, drawMarker) {
	this.graph = graph;
	this.set = set;
	this.pos = P(x, y);
	this.font = font;
	this.textCol = textCol;
	this.toggleCol = toggleCol;
	this.text = text;
	this.textPos = P(x + 10, y + fontSize / 2);
	this.fontSize = fontSize;
	this.boxPos = P(graphDims.dx - 18, y - 5); //whatever, will look at later
	this.boxDims = V(13, 13);
	this.mouseListenerName = 'toggle' + this.graph.handle.toCapitalCamelCase() + this.set.handle.toCapitalCamelCase();
	this.drawMarker = drawMarker;
	this.checkMark = graph.checkMark(this.boxPos.copy(), this.boxDims.copy(), graph.checkMarkOversize, graph.toggleCol, graph.graphDisplay);
	
}

GraphBase.LegendEntry.prototype = {
	draw: function() {
		this.drawToggle();
		this.drawText();
		this.drawMarker(this.pos);
	},
	drawToggle: function() {
		draw.fillStrokeRect(this.boxPos, this.boxDims, this.graph.gridCol, this.toggleCol, this.graph.graphDisplay);
		if (this.set.visible) {
			this.checkMark.draw();
		}
	},
	drawText: function() {
		draw.text(this.text, this.textPos,  this.font, this.textCol, 'left', 0, this.graph.graphDisplay);
	},
	toggle: function() {
		if (ptInRect(this.boxPos, this.boxDims, mouseOffsetDiv(this.graph.parentDivId))) {
			if (this.set.visible) {
				this.set.visible = false;
				
			} else {
				this.set.visible = true;
			
			}
			this.graph.drawAllBG();
			this.graph.drawAllData();
		}		
	},
	toggleActivate: function() {
		addListener(curLevel, 'mouseup', this.mouseListenerName, this.toggle, this);
	},
	toggleDeactivate: function() {
		removeListener(curLevel, 'mouseup', this.mouseListenerName);
	},
	setCanvas: function(canvas) {
		
		this.checkMark.setCanvas(canvas);
	}
}
GraphBase.Range = function(xMin, xMax, yMin, yMax) {
	this.x = {min: xMin, max: xMax};
	this.y = {min: yMin, max: yMax};
}
GraphBase.Range.prototype = {
	copy: function() {
		return new GraphBase.Range(this.x.min, this.x.max, this.y.min, this.y.max) 
	}
}

GraphBase.Marker = function(attrs) {
	this.handle = attrs.handle;
	if (typeof attrs.x == 'function')
		this.dataX = attrs.x;
	else 
		this.dataX = this.wrapInDataGet(attrs.x);
	if (typeof attrs.y =='function')
		this.dataY = attrs.y;
	else
		this.dataY = this.wrapInDataGet(attrs.y);
	this.graph = attrs.graph;
	this.graphDisplay = attrs.graphDisplay;
	//this.graphDisplay = attrs.graphDisplay;
	if (validNumber(this.dataX()) && validNumber(this.dataY())) 
		this.coordLast = this.graph.valToCoord(P(this.dataX(), this.dataY()));
	else 
		this.coordLast = undefined;

	this.markerType = attrs.markerType;
	this.col = attrs.col;
	this.visible = true;
	this.layers = attrs.layers;
	this.dataValid = true;
	if (this.drawFuncs[this.markerType]) {
		this.drawCB = this.drawFuncs[this.markerType];
	} else {
		console.log('Bad marker type ' + this.markerType + '.  Choices include ');
		for (var name in this.drawFuncs) console.log(name);
	}
	this.characLen = 15;
	this.imgCharacLen = this.characLen + 2;
	this.layers.addItem('marker', this);
	var self = this;
	if (attrs.label) {
		this.legendEntry = this.addLegendEntry(attrs.label, function(pos) {self.drawCB(pos)});
	}
}

GraphBase.Marker.prototype = {
	wrapInDataGet: function(expr) {
		var func;
		with (DataGetFuncs) {
			if (exprHasReturn(expr)) {
				func = eval('(function(){' + expr + '})');
			} else {
				func = eval('(function(){return ' + expr + '})')
			
			}
		}
		return func;
	},
	setDataValid: function() {
		try {
			this.dataValid = (validNumber(this.dataX()) !== false && validNumber(this.dataY()) !== false) ? true : false;
		} catch (e) {
			this.dataValid = false;
		};
	},
	setDrawCanvas: function(drawCanvas) {
		this.graphDisplay = drawCanvas;
	},
	addLegendEntry: function(label, drawCB) {//function(set, label, handle, drawMarker) 
		this.graph.makeLegendEntry(this, label, this.handle, drawCB)
	},
	draw: function() {
		if (this.visible) {
			if (this.dataValid) this.coordLast = this.graph.valToCoord(P(this.dataX(), this.dataY()));
			var pos = this.coordLast;
			this.drawCB(pos);
		}
	},
	drawFuncs: {
		bullseye: function(pos) {
			var cLen = this.characLen;
			window.draw.circle(pos, .15 * cLen, this.col, true, this.graphDisplay);
			window.draw.line(pos.copy().movePt(V(-cLen / 2, 0)), pos.copy().movePt(V(cLen / 2, 0)), this.col, this.graphDisplay);
			window.draw.line(pos.copy().movePt(V(0, -cLen / 2)), pos.copy().movePt(V(0, cLen / 2)), this.col, this.graphDisplay);
			//maybe set alpha lower for outer circle
			window.draw.circle(pos, .3 * cLen, this.col, false, this.graphDisplay);
			
			
		}
	},
	remove: function() {
		this.layers.removeItem('marker', this);
	}
}
GraphBase.Layers = function() {
	this.layers = [];
	this.handleIdxPairs = {};
	this.count = 0;
}
GraphBase.Layers.prototype = {
	addLayer: function(handle) {
		this.layers.push([]);
		this.handleIdxPairs[handle] = this.layers.length - 1;
	},
	setDrawCanvas: function(drawCanvas) {
		for (var i=0; i<this.layers.length; i++) {
			var layerItems = this.layers[i];
			for (var j=0; j<layerItems.length; j++) {
				layerItems[j].setDrawCanvas(drawCanvas);
			}
		}
	},
	removeLayer: function(handle) {
		var spliceIdx = this.handleIdxPairs[handle];
		for (var handle in this.handleIdxPairs) {
			var idx = this.handleIdxPairs[handle];
			if (idx > spliceIdx) this.handleIdxPairs[handle] --;
		}
		this.count -= this.layers[spliceIdx].length;
		this.layers.splice(spliceIdx, 1);
		delete this.handleIdxPairs[handle];
	},
	addItem: function(handle, obj) {
		this.layers[this.handleIdxPairs[handle]].push(obj);
		this.count ++;
	},
	removeItem: function(handle, obj) {
		var idx = this.layers[this.handleIdxPairs[handle]].indexOf(obj);
		this.layers[this.handleIdxPairs[handle]].splice(idx, 1);
		this.count --;
	},
	removeAll: function() {
		for (var i=0; i<this.layers.length; i++) {
			var layer = this.layers[i];
			for (var j=0; j<layer.length; j++) {
				layer[j].remove();
			}
		}
	}
}
