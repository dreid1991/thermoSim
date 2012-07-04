

function Dot(x, y, v, mass, radius, name){
	this.x = x;
	this.y = y;
	this.v = v;
	this.m = mass;
	this.r = radius;
	this.name = name;
}
function Species( mass, radius, colors){
	this.m = mass;
	this.r = radius;
	this.cols = colors;
	this.dots = [];
	return this;
}
function Point(x, y){
	this.x = x;
	this.y = y;
	return this;
}
function Vector(dx, dy){
	this.dx = dx;
	this.dy = dy;
	return this;
}
function Color(r, g, b){
	this.r = r;
	this.g = g;
	this.b = b;
	return this;
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
	add: function(b){
		this.dx+=b.dx;
		this.dy+=b.dy;
		return this;
	},
	neg: function(){
		this.dx*=-1;
		this.dy*=-1;
		return this;
	},
	dotProd: function(b){
		return this.dx*b.dx + this.dy*b.dy;
	},
	magSqr: function(){
		return this.dx*this.dx + this.dy*this.dy;
	},
	copy: function(){
		return V(this.dx, this.dy);
	},
	mult: function(scalar){
		this.dx*=scalar; 
		this.dy*=scalar;
		return this;
	},
	adjust: function(ddx, ddy){
		this.dx+=ddx;
		this.dy+=ddy;
		return this;
	},
	rotate: function(rad){
		var dx = this.dx;
		var dy = this.dy;
		this.dx = dx*Math.cos(rad) - dy*Math.sin(rad);
		this.dy = dx*Math.sin(rad) + dy*Math.cos(rad);
		return this;
	},
}
Color.prototype = {
	adjust: function(dr, dg, db){
		this.r = Math.round(Math.min(255, Math.max(0, this.r+dr)));
		this.g = Math.round(Math.min(255, Math.max(0, this.g+dg)));
		this.b = Math.round(Math.min(255, Math.max(0, this.b+db)));
		return this;
	},
	copy: function(){
		return Col(this.r, this.g, this.b);
	},
}
Point.prototype = {
	distTo: function(pTo){
		var dx = this.x-pTo.x;
		var dy = this.y-pTo.y;
		return Math.sqrt(dx*dx + dy*dy);
	},
	VTo: function(b){
		return V(b.x-this.x, b.y-this.y);
	},
	area: function(a, b){
		var baseV = V(a.x-this.x, a.y-this.y);
		var baseUV = baseV.UV();
		var width = baseV.mag();
		var basePerp = V(-baseUV.dy, baseUV.dx);
		var sideVec = V(b.x-this.x, b.y-this.y);
		var height = Math.abs(basePerp.dotProd(sideVec));
		return .5*width*height;
	},
	copy: function(){
		return P(this.x, this.y);
	},
	movePt: function(v){
		if(v.dx!==undefined){
			this.x+=v.dx;
		}
		if(v.dy!==undefined){
			this.y+=v.dy;
		}
		return this;
	},
	position: function(p){
		if(p.x!==undefined){
			this.x=p.x;
		}
		if(p.y!==undefined){
			this.y=p.y;
		}
		return this;
	},
	scale: function(around, val){
		var dx = this.x - around.x;
		var dy = this.y - around.y;
		this.x = around.x + dx*val;
		this.y = around.y + dy*val;
		return this;
	},
	rotate: function(around, rad){
		var origin = V(around.x, around.y)
		this.movePt(origin.copy().neg());
		var x = this.x;
		var y = this.y;
		this.x = x*Math.cos(rad) - y*Math.sin(rad);
		this.y = x*Math.sin(rad) + y*Math.cos(rad);
		this.movePt(origin);
		return this;
	},
}
Dot.prototype = {
	KE: function(){
		var vSqr = this.v.magSqr();
		return .5*this.m*vSqr;
	},
	temp: function(){
		return this.KE()*tConst;
	},
	speed: function(){
		return pxToMS*Math.sqrt(this.temp()/(this.m*10));
	}
}
