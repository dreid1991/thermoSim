function Heater(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.tMin = 50;
	this.tMax = 300;
	this.t = (this.tMax+this.tMin)/2;
	this.col = Col(255/2, 255/2, 255/2);
	this.pts = this.getPts(this.x, this.y, this.width, this.height)

}
//function Weight(xInit, yInit, tagWall, LWRatio, 
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
