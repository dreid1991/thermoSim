function Graph(x, y, width, height, xLabel, yLabel, pointColor, flashColor){
	this.width = width;
	this.height = height;
	this.borderSpacing = 70;
	this.xStart = this.borderSpacing/width;
	this.yStart = 1-this.borderSpacing/height;
	this.xEnd = .95;
	this.yEnd = .05
	this.gridSpacing = 40;
	this.hashMarkLen = 10;
	this.axisVals = [];
	this.pts = [];
	this.xMin=null;
	this.xMax=null;
	this.yMin=null;
	this.yMax=null;	
	this.xMinLast=null;
	this.xMaxLast=null;
	this.yMinLast=null;
	this.yMaxLast=null;
	this.gridCol = "#484848";
	this.textCol = "white";
	this.pointCol = pointColor;
	this.flashCol = flashColor;
	this.graphBoundCol = "white";
	this.pointSize = 4;
	this.axisLabelFontSize = 15;
	this.axisValFontSize = 11;
	this.flashAnim = Raphael.animation({r: this.pointSize, fill:this.pointCol}, .15e3)
	this.graph = Raphael(x, y, this.width, this.height);
	this.drawBGRect()
	this.drawBounds()
	this.drawGrid();
	this.drawLabels(xLabel, yLabel);
}
Graph.prototype = {
	drawBGRect: function(){
		this.bgRect = this.graph.rect(0,0,this.width,this.height,10);
		this.bgRect.attr("fill","black");
	},
	drawBounds: function(){
		var ptOrigin = P(this.xStart*this.width, this.yStart*this.height);
		var ptYAxis = P(this.xStart*this.width, this.yEnd*this.height);
		var ptXAxis = P(this.xEnd*this.width, this.yStart*this.height);
		var path = "M"+String(ptOrigin.x)+","+String(ptOrigin.y)+"L"+String(ptXAxis.x)+","+String(ptXAxis.y)+"L"+String(ptXAxis.x)+","+String(ptYAxis.y)+"L"+String(ptYAxis.x)+","+String(ptYAxis.y)+"L"+String(ptOrigin.x)+","+String(ptOrigin.y);
		this.graphBounds = this.graph.path(path);
		this.graphBounds.attr("stroke",this.graphBoundCol);
	},
	removeBounds: function(){
		this.graphBounds.remove();
	},
	drawGrid: function(){
		this.xGrid = [];
		this.yGrid = [];
		for (var xGridIdx=0; xGridIdx<Math.ceil(this.width*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing); xGridIdx++){
			var xPos = String(this.xStart*this.width + this.gridSpacing*xGridIdx);
			var yEnd = String(this.yEnd*this.height);
			var yAxis = String(this.yStart*this.height + this.hashMarkLen);
			var path = "M"+xPos+","+yAxis+"L"+xPos+","+yEnd;
			this.xGrid.push(this.graph.path(path));
			this.xGrid[this.xGrid.length-1].attr("stroke",this.gridCol);
		}
		for (var yGridIdx=0; yGridIdx<Math.ceil(this.height*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing); yGridIdx++){
			var yPos = String(this.yStart*this.height - this.gridSpacing*yGridIdx);
			var xEnd = String(this.xEnd*this.width);
			var xAxis = String(this.xStart*this.width - this.hashMarkLen);
			var path = "M"+xAxis+","+yPos+","+"L"+xEnd+","+yPos;
			this.yGrid.push(this.graph.path(path));
			this.yGrid[this.yGrid.length-1].attr("stroke",this.gridCol);
		}
		
	},
	removeGrid: function(){
		for (var gridIdx=0; gridIdx<this.xGrid.length; gridIdx++){
			this.xGrid[gridIdx].remove();
		}
		for (var gridIdx=0; gridIdx<this.yGrid.length; gridIdx++){
			this.yGrid[gridIdx].remove();
		}
		this.xGrid = null;
		this.yGrid = null;
	},
	drawLabels: function(xLabel, yLabel){
		var xLabelPos = P(this.width*(this.xStart+this.xEnd)/2, Math.min(this.height*this.yStart+50, this.height-20))
		var yLabelPos = P(Math.max(this.width*this.xStart-50, 20),this.height*(this.yStart+this.yEnd)/2)
		this.xLabel = this.graph.text(xLabelPos.x, xLabelPos.y, xLabel);
		this.yLabel = this.graph.text(yLabelPos.x, yLabelPos.y, yLabel);
		this.yLabel.rotate(-90);
		this.xLabel.attr("fill",this.textCol);
		this.yLabel.attr("fill",this.textCol);
		this.xLabel.attr("font-size",this.axisLabelFontSize);	
		this.yLabel.attr("font-size",this.axisLabelFontSize);	
	},
	plotData: function(xVals, yVals){
		if (xVals.length==yVals.length && xVals.length>1){
			var xRange = this.range(xVals);
			this.xMinLast = this.xMin;
			this.xMaxLast = this.xMax;
			this.yMinLast = this.yMin;
			this.yMaxLast = this.yMax;
			this.xMin = xRange[0]*.9
			this.xMax = xRange[1]*1.1;
			var yRange = this.range(yVals);
			this.yMin = yRange[0]*.9
			this.yMax = yRange[1]*1.1;
			if(this.xMinLast!=this.xMin || this.xMaxLast!=this.xMax || this.yMinLast!=this.yMin || this.yMaxLast!=this.yMax){
				this.drawAxisVals();
				this.drawPts(xVals, yVals);

			} else{
				var xVal = xVals[xVals.length-1];
				var yVal = yVals[yVals.length-1];
				this.drawPt(xVal, yVal);
			}
			this.flashLast();

		} else if (xVals.length!=yVals.length){
			console.log("xVals has ", xVals.length, "entries");
			console.log("yVals has ", yVals.length, "entries");
			console.log("UH-OH");
		};
	},
	drawAxisVals: function(){
		this.removeAxisVals();
		for (var xGridIdx=0; xGridIdx<Math.ceil(this.width*(Math.abs(this.xEnd-this.xStart))/this.gridSpacing); xGridIdx++){
			var xPos = this.xStart*this.width + this.gridSpacing*xGridIdx;
			var yPos = this.yStart*this.height + this.hashMarkLen + 10;
			var val = String(round(this.xMin + (this.xMax-this.xMin)*(this.gridSpacing*xGridIdx)/(Math.abs(this.xEnd-this.xStart)*this.width),1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
		}
		for (var yGridIdx=0; yGridIdx<Math.ceil(this.height*(Math.abs(this.yEnd-this.yStart))/this.gridSpacing); yGridIdx++){
			var yPos = this.yStart*this.height - this.gridSpacing*yGridIdx;
			var xPos = this.xStart*this.width - this.hashMarkLen - 10;
			var val = String(round(this.yMin + (this.yMax-this.yMin)*(this.gridSpacing*yGridIdx)/(Math.abs(this.yEnd-this.yStart)*this.height),1));
			this.axisVals.push(this.graph.text(xPos, yPos, val));
			var last = this.axisVals[this.axisVals.length-1]
			last.attr("fill", this.textCol);
			last.attr("font-size", this.axisValFontSize);
			last.rotate(-90);
		}		
		
	},
	removeAxisVals: function(){
		for (var valIdx=0; valIdx<this.axisVals.length; valIdx++){
			val = this.axisVals[valIdx];
			val.remove();
		}
		this.axisVals = [];
	},
	drawPts: function(xVals, yVals){
		this.removePts();
		for (var ptIdx=0; ptIdx<xVals.length; ptIdx++){
			var xVal = xVals[ptIdx];
			var yVal = yVals[ptIdx];
			this.drawPt(xVal, yVal);
		}
	},
	drawPt: function(xVal, yVal){
		var xRange = this.xMax-this.xMin;
		var yRange = this.yMax-this.yMin;
		var xPt = Math.abs(this.xEnd-this.xStart)*this.width*(xVal-this.xMin)/xRange + this.xStart*this.width;
		var yPt = this.height - (1-this.yStart)*this.height - Math.abs(this.yEnd-this.yStart)*this.height*(yVal-this.yMin)/yRange;
		this.pts.push(this.graph.circle(xPt, yPt, this.pointSize));
		var last = this.pts[this.pts.length-1]
		last.attr("fill",this.pointCol);
	},
	flashLast: function(){
		var pt = this.pts[this.pts.length-1];
		pt.attr({r:1.5*this.pointSize, fill:this.flashCol});
		pt.animate(this.flashAnim);
		pt.attr({r:this.pointSize, fill:this.pointCol});
	},
	removePts: function(){
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			var pt = this.pts[ptIdx];
			pt.remove();
		}
		this.pts = [];
	},
	range: function(list){
		var min = Number.MAX_VALUE;
		var max = -Number.MAX_VALUE;
		for (var listIdx=0; listIdx<list.length; listIdx++){
			var listVal = list[listIdx]
			min = Math.min(min, listVal);
			max = Math.max(max, listVal);
		}
		return [min, max];
	},
	remove: function(){
		this.removePts();
		this.removeAxisVals();
		this.xLabel.remove();
		this.yLabel.remove();
		this.removeGrid();
		this.removeBounds();
		this.bgRect.remove();
		this.graph.remove();
	},

}