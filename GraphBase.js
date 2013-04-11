GraphBase = {

	setStds: function(){
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
		addListener(curLevel, 'update', 'drawLayers' + this.handle, this.drawLayers, this);
		this.hasData = false;
	},
	makeDataFunc: function(expr) {
		with (DataGetFuncs) {
			return eval('(function() { return ' + expr + '})');
		}
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
						src: ['img/refresh.gif']
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
		var canvasDisplay = this.makeCanvas(this.dims, this.parentDiv, this.handle + 'Graph', this.makeReset, this.handle + 'Button');
		this.graphDisplayHTMLElement = canvasDisplay.HTMLElem;
		this.graphDisplay = canvasDisplay.canvas;	
		if (this.legend) {
			for (var legendEntry in this.legend) {
				this.legend[legendEntry].setCheckMarkCanvas(this.graphDisplay);
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
	save: function(saveName){
	
		var saveName = defaultTo('graph'+this.handle, saveName);
		saveName = unique(saveName, stored);
		this.dataSave = {};
		//need to redo this.  Make like a save function for each set.
		// for (var set in this.data){
			// this.dataSave[set] = {pts:{}, src:{}};
			// this.dataSave[set].pts.x = deepCopy(this.data[set].x);
			// this.dataSave[set].pts.y = deepCopy(this.data[set].y);
			// if(this.data[set].xInitDataIdx){
				// this.dataSave[set].src.x = deepCopy(this.data[set].src.x);//.splice(this.data[set].xInitDataIdx, this.data[set].src.x.length);
			// }//THIS DEMANDS ATTENTION.  FIX START IDX
			// if(this.data[set].yInitDataIdx){
				// this.dataSave[set].src.y = deepCopy(this.data[set].src.y);//.splice(this.data[set].yInitDataIdx, this.data[set].src.y.length);
			// }
		// }
		// store(saveName, this);
		return saveName;
	},
	load: function(){
		//if(!$('#' + this.handle + 'GraphDiv').length){
			this.makeCanvas(this.dims);
		//}
		var toAdd = []
		for (var set in this.data){
			this.data[set].x = [];
			this.data[set].y = [];
			this.data[set].src.x = deepCopy(this.dataSave[set].src.x);
			this.data[set].src.y = deepCopy(this.dataSave[set].src.y);
						
			var toAdd = toAdd.concat(this.setsToPts(this.dataSave[set].pts.x, this.dataSave[set].pts.y, set));
		
		}
		this.addPts(toAdd, false, true);
		return this;
	},
	setsToPts: function(x, y, setName){
		var pts = new Array(x.length);
		for(var ptIdx=0; ptIdx<x.length; ptIdx++){
			pts[ptIdx] = {x:x[ptIdx], y:y[ptIdx], address:setName};
		}
		return pts;
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
		for (var xGridIdx=0; xGridIdx<this.numGridLines.x; xGridIdx++){
			var x = this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * xGridIdx;
			var yEnd = this.graphRangeFrac.y.max * this.dims.dy;
			var yAxis = this.graphRangeFrac.y.min * this.dims.dy + this.hashMarkLen;
			var p1 = P(x, yAxis);
			var p2 = P(x, yEnd);
			draw.line(p1, p2, this.gridCol, this.graphDisplay);
		}
		for (var yGridIdx=0; yGridIdx<this.numGridLines.y; yGridIdx++){
			var y = this.graphRangeFrac.y.min * this.dims.dy - this.gridSpacing.y *yGridIdx;
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
			var entry = this.legend[entryName];
			var text = entry.text;
			this.drawLegendToggle(entry);
			var font = this.legendFont
			draw.text(text, entry.textPos,  this.legendFont, this.textCol, 'left', 0, this.graphDisplay);
			this.drawPtStd(entry.pos, entry.col);
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

	drawLayers: function() {
		//redrawing all data is hugely faster than erasing flashers with get/put image data.  get/put took ~25% of a core for two markers.  Redrawing is fast.
		if (turn % 2 && this.hasData && this.layers.count) {
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
		if(!(a.x.min<b.x.min && a.x.max>b.x.max)){
			if(oldRange){
				if(!this.rangeIsSame(oldRange.x, this.valRange.x)){
					this.getXBounds();
				}
			} else{
				this.getXBounds();
			}
		} else{
			this.setAxisToInit('x');
		}
	},
	setAxisBoundsY: function(oldRange){
		var a = this.axisInit;
		var b = this.valRange;	
		if(!(a.y.min<b.y.min && a.y.max>b.y.max)){
			if(oldRange){
				if(!this.rangeIsSame(oldRange.y, this.valRange.y)){
					this.getYBounds();
				}
			} else{
				this.getYBounds();
			}
		} else{
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
			var unroundStepX = rangeX / (this.numGridLines.x-2);
			var expStepX = Math.pow(10, Math.floor(Math.log10(unroundStepX)))
			newStepSize = Math.ceil(unroundStepX / expStepX) * expStepX;
			newBounds.min = Math.floor(this.valRange.x.min / newStepSize) * newStepSize;
			newBounds.max = newBounds.min + (this.numGridLines.x - 1) * newStepSize;
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
			var unroundStepY = rangeY / (this.numGridLines.y-2);
			var expStepY = Math.pow(10, Math.floor(Math.log10(unroundStepY)))
			newStepSize = Math.ceil(unroundStepY / expStepY) * expStepY;
			newBounds.min = Math.floor(this.valRange.y.min / newStepSize) * newStepSize;
			newBounds.max = newBounds.min + (this.numGridLines.y-1) * newStepSize;
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
	drawAxisVals: function(){
		for (var xGridIdx=0; xGridIdx<this.numGridLines.x; xGridIdx++){
			var xPos = this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * xGridIdx;
			var yPos = this.graphRangeFrac.y.min * this.dims.dy + this.hashMarkLen + 10 + this.axisValFontSize/2;
			var text = String(round(this.axisRange.x.min + this.stepSize.x * xGridIdx, 1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', 0, this.graphDisplay);
		}
		for (var yGridIdx=0; yGridIdx<this.numGridLines.y; yGridIdx++){
			var yPos = this.graphRangeFrac.y.min * this.dims.dy - this.gridSpacing.y * yGridIdx;
			var xPos = this.graphRangeFrac.x.min * this.dims.dx - this.hashMarkLen - 10;
			var text = String(round(this.axisRange.y.min + this.stepSize.y*yGridIdx,1));
			draw.text(text, P(xPos,yPos), this.axisValFont, this.textCol, 'center', -Math.PI/2, this.graphDisplay);
		}		
	},
	drawLegendToggle: function(entry){
		draw.fillStrokeRect(entry.boxPos, entry.boxDims, this.gridCol, this.toggleCol, this.graphDisplay);
		var set = entry.set;
		if (set.visible) {
			entry.checkMark.draw();
		}
	},
	makeLegendEntry: function(set, address){
		var x = this.dims.dx-this.legendWidth+5;
		var y = 30;
		for (var entryIdx in this.legend){
			y += 35;
		}

		var legendEntry = new GraphBase.LegendEntry(this, set, set.pointCol, set.label, x, y, this.legendFontSize, this.dims, this.toggleCol);
		legendEntry.toggleActivate();
		
		this.legend[address] = legendEntry;
		this.drawAllBG();
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
	makePtDataGrabFunc: function(data){
		return function(){
			var xLast = data.x[data.x.length-1];
			var yLast = data.y[data.y.length-1];
			return P(xLast, yLast);
		}
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
	makeHistDataGrabFunc: function(data){
		return function(address){
			return {address:address, data:data[data.length-1]};
		}
	},
	valToCoord: function(val){
		var rangeX = this.axisRange.x.max - this.axisRange.x.min;
		var rangeY = this.axisRange.y.max - this.axisRange.y.min;
		var x = this.graphRangeFrac.x.min * this.dims.dx + this.gridSpacing.x * (this.numGridLines.x - 1) * (val.x - this.axisRange.x.min) / rangeX; 
		var y = this.dims.dy - (this.gridSpacing.y * (this.numGridLines.y - 1) * (val.y - this.axisRange.y.min) / rangeY + (1 - this.graphRangeFrac.y.min) * this.dims.dy);
		return P(x,y);
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

GraphBase.LegendEntry = function(graph, set, col, text, x, y, fontSize, graphDims) {
	this.graph = graph;
	this.set = set;
	this.pos = P(x, y);
	this.col = col;
	this.text = text;
	this.textPos = P(x + 10, y + fontSize / 2);
	this.fontSize = fontSize;
	this.boxPos = P(graphDims.dx - 18, y - 5); //whatever, will look at later
	this.boxDims = V(13, 13);
	this.mouseListenerName = 'toggle' + this.graph.handle.toCapitalCamelCase() + this.set.handle.toCapitalCamelCase();
	this.checkMark = graph.checkMark(this.boxPos.copy(), this.boxDims.copy(), graph.checkMarkOversize, graph.toggleCol, graph.graphDisplay);
}

GraphBase.LegendEntry.prototype = {
	drawCheck: function() {
		this.checkMark.draw();
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
	setCheckMarkCanvas: function(canvas) {
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
	this.layers = attrs.layers;
	if (this.drawFuncs[this.markerType]) {
		this.draw = this.drawFuncs[this.markerType];
	} else {
		console.log('Bad marker type ' + this.markerType + '.  Choices include ');
		for (var name in this.drawFuncs) console.log(name);
	}
	this.characLen = 15;
	this.imgCharacLen = this.characLen + 2;
	this.layers.addItem('marker', this);
}

GraphBase.Marker.prototype = {
	wrapInDataGet: function(expr) {
		var func;
		with (DataGetFuncs) {
			func = eval('(function(){return ' + expr + '})');
		}
		return func;
	},
	drawFuncs: {
		bullseye: function() {
			var cLen = this.characLen;
			this.coordLast = this.graph.valToCoord(P(this.dataX(), this.dataY()));
			var coord = this.coordLast;
			window.draw.circle(coord, .15 * cLen, this.col, true, this.graphDisplay);
			window.draw.line(coord.copy().movePt(V(-cLen / 2, 0)), coord.copy().movePt(V(cLen / 2, 0)), this.col, this.graphDisplay);
			window.draw.line(coord.copy().movePt(V(0, -cLen / 2)), coord.copy().movePt(V(0, cLen / 2)), this.col, this.graphDisplay);
			//maybe set alpha lower for outer circle
			window.draw.circle(coord, .3 * cLen, this.col, false, this.graphDisplay);
			
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
//GraphBase.prototype.