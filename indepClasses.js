
$(document).mousemove(function(e){
	mousePos.x = e.pageX;
	mousePos.y = e.pageY;
})
function Dot(x, y, v, mass, radius, name){
	this.x = x;
	this.y = y;
	this.v = v;
	this.m = mass;
	this.r = radius;
	this.name = name;
}
function Species(name, mass, radius, colors){
	this.name = name;
	this.m = mass;
	this.r = radius;
	this.cols = colors;
	this.dots = [];
}
function Point(x, y){
	this.x = x;
	this.y = y;
}
function Vector(dx, dy){
	this.dx = dx;
	this.dy = dy;
}
function Color(r, g, b){
	this.r = r;
	this.g = g;
	this.b = b;
}
function drawingTools(){};

function D(x, y, vx, vy, mass, radius, name){
	return new Dot(x, y, vx, vy, mass, radius, name);
}
function P(x, y){
	return new Point(x, y);
}
function V(dx, dy){
	return new Vector(dx, dy);
}
function Col(r, g, b){
	return new Color(r, g, b);
}

Vector.prototype = {
	UV: function(){
		var mag = this.mag();
		return V(this.dx/mag, this.dy/mag);
	},
	mag: function(){
		return Math.sqrt(this.dx*this.dx + this.dy*this.dy);
	},
	dotProd: function(b){
		return this.dx*b.dx + this.dy*b.dy;
	},
	magSqr: function(){
		return this.dx*this.dx + this.dy*this.dy;
	},
}
Point.prototype = {
	distTo: function(pTo){
		var dx = this.x-pTo.x;
		var dy = this.y-pTo.y;
		return Math.sqrt(dx*dx + dy*dy);
	},
	area: function(a, b){
		var baseV = V(a.x-this.x, a.y-this.y);
		var baseUV = baseV.UV();
		var width = baseV.mag();
		var basePerp = V(-baseUV.dy, baseUV.dx);
		var sideVec = V(b.x-this.x, b.y-this.y);
		var height = Math.abs(basePerp.dotProd(sideVec));
		return .5*width*height;
	}
}
Dot.prototype = {
	KE: function(){
		var vSqr = this.v.magSqr();
		return .5*this.m*vSqr;
	},
	temp: function(){
		return this.KE()*updateInterval*updateInterval/tempScalar;
	}
}
mousePos = P(0,0)