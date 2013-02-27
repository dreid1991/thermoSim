WallMethods.Border = function (attrs) {
	this.wall = attrs.wall;
	this.type = attrs.type;
	this.yMin = attrs.yMin;
	this.col = attrs.col || this.wall.col.copy().adjust(-100, -100, -100);
	this.thick = attrs.thickness || 5; //don't want to have value of zero anyway
	this.update = this.pickGenerator(this.type)
	this.update();
}
//need to do yMin stuff still

//open means one with open top.  It will start at the second point and go to the last with potential adjustments on all the points
//end means it will always go to the last point
WallMethods.Border.prototype = {
	pickGenerator: function(type) {
		if (type == 'open') {
			return this.genOpen();
		} else if (type == 'wrap') {
			return this.genWrap();
		}
	},	
	genOpen: function() {
		var yMin = this.yMin || this.wall[1].y;
		return this.genBorder(this.thick, this.col, 1, 'end', true);
		
	},
	genWrap: function() {
		return this.genBorder(this.thick, this.col, 0, 'end', false);
	},
	genBorder: function(thick, col, firstPt, lastPt, bluntEnds) {
		var self = this;
		var drawCanvas = c;
		var listenerName = 'drawBorder' + this.wall.handle.toCapitalCamelCase();
		return function() {
			removeListener(curLevel, 'update', listenerName);
			var segments = self.genSegs(firstPt, lastPt, thick, bluntEnds);
			addListener(curLevel, 'update', listenerName, function() {
				for (var segIdx=0; segIdx<segments.length; segIdx++) {
					draw.fillPts(segments[segIdx], col, drawCanvas);
				}
			})
		};
	},
	genSegs: function(firstPt, lastPt, thick, bluntEnds) {
		var segments = [];
		var firstPtIdx = firstPt;
		var lastPtIdx = lastPt == 'end' ? this.wall.length - 1 : lastPt;
		for (var ptIdx=firstPtIdx; ptIdx<lastPtIdx; ptIdx++) {
			var perpUV = this.wall.wallPerpUVs[ptIdx].copy().neg();
			var pt1 = this.wall[ptIdx].copy();
			var pt2 = this.wall[ptIdx + 1].copy();
			
			var prevPtIdx = this.wall[ptIdx - 1] ? ptIdx - 1 : this.wall.length-2;
			var nextPtIdx = ptIdx + 1 == lastPtIdx ? 0 : ptIdx + 1;
			var extendV1, extendV2;
			
			extendV1 = this.getExtendV(perpUV, prevPtIdx, firstPtIdx, thick, bluntEnds);
			extendV2 = this.getExtendV(perpUV, nextPtIdx, lastPtIdx, thick, bluntEnds);
			
			var pt3 = pt2.copy().movePt(extendV2);
			var pt4 = pt1.copy().movePt(extendV1);
			segments.push([pt1, pt2, pt3, pt4]);
		}
		return segments;
		
	},
	getExtendV: function(perpUV, neighborPtIdx, boundaryPtIdx, thick, bluntEnds) {
		var neighborPerpUV = this.wall.wallPerpUVs[neighborPtIdx].copy().neg();
		var comboUV = bluntEnds && neighborPtIdx == boundaryPtIdx ? perpUV.copy() : neighborPerpUV.add(perpUV).UV();
		var perpComp = perpUV.dotProd(comboUV);
		thick /= perpComp;
		return comboUV.mult(thick);
	}
}