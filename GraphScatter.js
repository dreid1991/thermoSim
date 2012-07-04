function GraphScatter(name, width, height, xLabel, yLabel, axisInit){
	this.base = new GraphBase(this);
	this.name = name;
	this.dims = V(width, height);
	
	this.xLabel = xLabel;
	this.yLabel = yLabel;
	this.labelFontSize = 15;
	this.legendFontSize = 12;
	this.axisValFontSize = 11;
	this.labelFont = this.labelFontSize+ 'pt calibri';
	this.legendFont = this.legendFontSize+ 'pt calibri';
	this.axisValFont = this.axisValFontSize+ 'pt calibri';
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/width;
	this.yStart = 1-this.borderSpacing/height;
	this.legendWidth = 80;
	this.xEnd = (this.dims.dx - (this.legendWidth+8))/this.dims.dx;
	this.yEnd = .05;
	this.gridSpacing = 40;
	this.hashMarkLen = 10;
	
	var numGridLinesX = Math.ceil(this.dims.dx*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing);
	var numGridLinesY = Math.ceil(this.dims.dy*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing);
	this.numGridLines = {x:numGridLinesX, y:numGridLinesY};
	this.axisInit = {x:{min:axisInit.x.min, max:axisInit.x.min+ axisInit.x.step*(this.numGridLines.x-1)}, y:{min:axisInit.y.min, max:axisInit.y.min + axisInit.y.step*(this.numGridLines.y-1)}};
	this.axisRange = {x:{min:0, max:0}, y:{min:0, max:0}};
	this.data = {};
	this.legend = {};
	this.base.resetRanges();
	this.stepSize = {x:0, y:0};
	this.checkMarkOversize = 3;
	this.bgCol = curLevel.bgCol
	this.gridCol = Col(72,72,72);
	this.toggleCol = Col(255,255,255);
	
	this.textCol = Col(255, 255, 255);
	this.flashMult = 1.5;
	this.flashRate = .1;
	this.graphBoundCol = Col(255,255,255);
	this.ptStroke = Col(0,0,0);
	this.rectSideLen = 8;
	this.characLen = Math.sqrt(Math.pow(this.rectSideLen, 2)/2);
	//characLen, characteristic length, is the radius of the shape being used
	var canvasData = this.base.makeCanvas(this.name, this.dims);
	this.graph = canvasData.graph;
	this.graphHTMLElement = canvasData.HTMLElement;
	this.base.drawAllBG();
	addListener(curLevel, 'reset', 'clearGraph'+name, this.clear, this);
}
GraphScatter.prototype = {
	addSet: function(address, label, pointCol, flashCol, dataPaths){
		var set = {};
		set.label = label;
		set.x = [];
		set.y = [];
		set.pointCol = pointCol;
		set.flashCol = flashCol;
		set.getLast = this.base.makePtDataGrabFunc(dataPaths);
		set.show = true;
		this.data[address] = set;
		this.base.makeLegendEntry(set, address);
		this.base.drawAllBG();
	},
	drawAllData: function(){
		this.graph.putImageData(this.bg, 0, 0);
		this.base.drawAxisVals();
		this.graphPts();
	},



	addLast: function(){
		var toAdd = [];
		for (var address in this.data){
			var dataSet = this.data[address];
			toAdd.push(dataSet.getLast(address));
		}
		this.addPts(toAdd);
	},
	addPts: function(toAdd){
		var mustRedraw = new Boolean()
		mustRedraw = false;
		var val = this.valRange;
		var oldValRange = {x:{min:val.x.min, max:val.x.max}, y:{min:val.y.min, max:val.y.max}};
		for (var addIdx=0; addIdx<toAdd.length; addIdx++){
			var address = toAdd[addIdx].address;
			var x = toAdd[addIdx].x;
			var y = toAdd[addIdx].y;
			var dataSet = this.data[address]
			dataSet.x.push(x);
			dataSet.y.push(y);
			this.valRange.x.max = Math.max(this.valRange.x.max, x);
			this.valRange.x.min = Math.min(this.valRange.x.min, x);		
			this.valRange.y.max = Math.max(this.valRange.y.max, y);
			this.valRange.y.min = Math.min(this.valRange.y.min, y);
		}
		var old = this.axisRange;
		var oldAxisRange = {x:{min:old.x.min, max:old.x.max}, y:{min:old.y.min, max:old.y.max}};
		this.base.setAxisBounds(oldValRange);
		if(!this.base.rangeIsSame(oldAxisRange.x, this.axisRange.x) || !this.base.rangeIsSame(oldAxisRange.y, this.axisRange.y)){
			mustRedraw = true;
		}
		
		if(mustRedraw){
			//this.valRange.x = this.base.getRange('x');
			//this.valRange.y = this.base.getRange('y');
			this.drawAllData();
		} else{
			for (var addIdx=0; addIdx<toAdd.length; addIdx++){
				var dataSet = this.data[toAdd[addIdx].address];
				if(dataSet.show){

					var xPt = dataSet.x[dataSet.x.length-1]
					var yPt = dataSet.y[dataSet.y.length-1]
					var pointCol = dataSet.pointCol
					this.graphPt(xPt, yPt, pointCol);
				}
			}
		}
		
		this.base.flashInit(toAdd);
		
	},


	plotData: function(xVals, yVals, address){
		if (xVals.length==yVals.length && xVals.length>1){
			this.data[address].x = xVals;
			this.data[address].y = yVals;
			this.valRange.x = this.base.getRange('x');
			this.valRange.y = this.base.getRange('y');
			this.getAxisBounds();
			this.drawAllData();
		} else if (xVals.length!=yVals.length){
			console.log("xVals has ", xVals.length, "entries");
			console.log("yVals has ", yVals.length, "entries");
			console.log("UH-OH");
		};
	},

	getAxisBounds: function(){
		this.base.getXBounds();
		this.base.getYBounds();
	},


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


