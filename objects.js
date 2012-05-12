function Heater(x, y, width, height, tMin, tMax){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.tMin = tMin;
	this.tMax = tMax;
	this.t = (this.tMax+this.tMin)/2;
	this.col = Col(0, 0, 0);
	this.getCol();
	this.pts = this.getPts(this.x, this.y, this.width, this.height)
	walls.pts.push(this.pts);
}
Heater.prototype = {
	getPts: function(x, y, width, height){
		var pts = []
		pts.push(P(x+.2*width, y+height));
		pts.push(P(x+.8*width, y+height));
		pts.push(P(x+width, y+.8*height));
		pts.push(P(x+width, y+.2*height));
		pts.push(P(x+.8*width, y));
		pts.push(P(x+.2*width, y));
		pts.push(P(x, y+.2*height));
		pts.push(P(x, y+.8*height));
		return pts;	
	},
	getCol: function(){
		var percent = (this.t-this.tMin)/(this.tMax-this.tMin);
		this.col.r = 255*percent;
		this.col.g = 255*(.5-Math.abs(percent-.5))
		this.col.b = 255*(1-percent);
	},
	changeTemp: function(percent){
		this.t = this.tMin + (this.tMax-this.tMin)*percent;
		this.getCol();
	}

}
function Weight(xInit, yInit, dimRatio, weightMin, weightMax){
	this.x = xInit;
	this.y = yInit-1;
	this.dimRatio = dimRatio;
	this.weightMin = weightMin;
	this.weightMax = weightMax;
	this.weight = (this.weightMin+this.weightMax)/2;
	this.scalar = .3;
	this.pts = [];
	this.getPts();
	this.col = Col(100,100,200);
}
Weight.prototype = {
	getPts: function(){
		var width = this.weight*this.scalar;
		var height = width*this.dimRatio;
		this.pts = [P(this.x-width/2,this.y), P(this.x+width/2,this.y), P(this.x+width/2, this.y-height), P(this.x-width/2, this.y-height)];
	},
	movePts: function(vector){
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			var pt = this.pts[ptIdx];
			pt.x+=vector.dx;
			pt.y+=vector.dy;
		}
	},
	move: function(vector){
		this.x+=vector.dx;
		this.y+=vector.dy;
		this.movePts(vector);
	},
	changeWeight: function(percent){
		this.weight = this.weightMin + percent*(this.weightMax-this.weightMin);
		this.getPts();
	},
}
