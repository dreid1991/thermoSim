WallMethods.Border = function (attrs) {
	this.wall = attrs.wall;
	this.type = attrs.type;
	this.yMin = attrs.yMin;
	this.col = attrs.col || this.wall.col.copy().adjust(-100, -100, -100);
	this.thick = attrs.thickness || 5; //don't want to have value of zero anyway
	this.generator = this.pickGenerator(this.type)

}
//open means one with open top.  It will start at the second point and go to the last with potential adjustments on all the points
//end means it will always go to the last point
WallMethods.Border.prototype = {
	pickGenerator: function(type) {
		if (type == 'open') {
			return this.genOpen;
		} else if (type == 'wrap') {
			return this.getWrap;
		}
	},	
	genOpen: function() {
		var yMin = this.yMin || this.wall[1].y;
		this.genBorder(this.thick, this.col, 1, 'end', true);
		
	},
	genWrap: function() {
		this.genBorder(this.thick, this.col, 0, 'end', false);
	},
	genBorder: function(thick, col, firstPt, lastPt, bluntEnds) {
		var self = this;
		var drawCanvas = c;
		var listenerName = 'drawBorder' + this.wall.handle.toCapitalCamelCase();
		this.updateBorder = function() {
			removeListener(curLevel, 'update', listenerName);
			var pts = self.genPts(firstPt, lastPt, thick, bluntEnds);
		};
		this.updateBorder()
	},
	genPts: function(firstPt, lastPt, thick, bluntEnds) {
		var pts = [];
		lastPt = lastPt == 'end' ? this.wall.length - 1 : lastPt;
		for (var ptIdx=firstPt; firstPt<lastPt; ptIdx++) {
			var perpUV = this.wall.wallPerpUVs[ptIdx].copy().neg();
			var pt1 = this.wall[ptIdx].copy();
			var pt2 = this.wall[ptIdx + 1].copy();
			var prevPtIdx = this.wall[ptIdx - 1] ? ptIdx - 1 : this.wall.length-1;
			var nextPtIdx = this.wall[ptIdx + 2] ? ptIdx + 2 : 0;
			var extendV1, extendV2;
			
			if (bluntends && ptIdx == firstPt) {
			
			el
				if (ptIdx == firstPt) {
					angle1 = 0;
				} else if (ptIdx == lastPt) {
					angle2 = 0;
				}
			} else {
				var UV1 = this.wall.wallPerpUVs[prevPtIdx].copy().neg().add(perpUV).UV();
				var UV2 = this.wall.wallPerpUVs[nextPtIdx].copy().neg().add(perpUV).UV();
				var perpComp1 = UV1.dotProd(perpUV);
				var perpComp2 = UV2.dotProd(perpUV);
				var extendV1 = UV1.mult(thick / perpComp1);
				var extendV2 = UV2.mult(thick / perpComp2);
				
				
			}
			// var extendMag1 = thick / Math.cos(angle1);
			// var extendMag2 = thick / Math.cos(angle2);
			// var pt3 = pt2.copy().moveInDir(extendMag1, angle1);
			// var pt4 = pt1.copy().moveInDir(entendMag1, angle2);
		}
		
	},
	getExtendV: function(perpUV, neighborUV, thick) {
		var perpComp = neighborUV ? perpUV.copy().add(neighborUV).UV();
	}
}