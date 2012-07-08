function GraphScatter(name, width, height, xLabel, yLabel, axisInit){
	this.name = name;
	//this.base = new GraphBase(this);
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
	this.resetRanges();
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
	this.makeCanvas(this.name, this.dims);

	this.drawAllBG();
	
}

GraphScatter.prototype = {
	addSet: function(address, label, pointCol, flashCol, dataPaths){
		var set = {};
		set.label = label;
		set.x = [];
		set.y = [];
		set.pointCol = pointCol;
		set.flashCol = flashCol;
		set.getLast = this.makePtDataGrabFunc(dataPaths);
		set.show = true;
		this.data[address] = set;
		this.makeLegendEntry(set, address);
		this.drawAllBG();
	},
	drawAllData: function(){
		this.graph.putImageData(this.bg, 0, 0);
		this.drawAxisVals();
		this.graphPts();
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
		for (var address in this.data){
			var dataSet = this.data[address];
			toAdd.push(dataSet.getLast(address));
		}
		this.addPts(toAdd);
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
	clear: function(){
		this.clear()
	},
}


