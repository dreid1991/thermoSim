function Dot(x, y, v, mass, radius, spcName, idNum, tag, returnTo){
	this.x = x;
	this.y = y;
	this.v = v;
	this.m = mass;
	this.r = radius;
	this.spcName = spcName;
	this.idNum = idNum;
	this.tag = tag;
	this.returnTo = returnTo;
	this.tConst = tConst;
	this.pxToE = pxToE;
	this.pxToMS = pxToMS;
	this.parentLists = [];
	this.peLast = 0;
	this.tempLast = 0;
	this.peCur = 0;
	var speciesDef = speciesDefs[spcName];
	this.attractStr = speciesDef.attractStr;
	this.attractStrs = speciesDef.attractStrs;
	this.attractRad = speciesDef.attractRad;
	this.active = true;
	return this;
	
}
function Species(mass, radius, colors, def){
	this.m = mass;
	this.r = radius;
	this.cols = colors;
	this.def = def;
	this.idNum = def.idNum
	this.dots = dotManager.addSpcs(def.spcName);
}
Species.prototype = {
	populate: function(pos, dims, count, temp, tag, returnTo){
		var x = pos.x;
		var y = pos.y;
		var width = dims.dx;
		var height = dims.dy;
		var birthList = [];
		for (var i=0; i<count; i++){
			var placeX = x + Math.random()*width;
			var placeY = y + Math.random()*height;
			var v = tempToV(this.m, temp)
			var angle = Math.random()*2*Math.PI;
			var vx = v * Math.cos(angle);
			var vy = v * Math.sin(angle);
			birthList.push(D(placeX, placeY, V(vx, vy), this.m, this.r, this.def.spcName, this.def.idNum, tag, returnTo));
		}
		dotManager.add(birthList);
		//dots gets set in dotManager
	},
	depopulate: function(tag) {
		console.trace();
		if (tag) {
			dotManager.removeByInfo({name:this.def.spcName, tag:tag});
		} else {
			dotManager.removeByInfo({name:this.def.spcName});
		}
	},
	place: function(dotsInfo) { //as [{pos: , dir: , temp: , tag: , returhTo: }]
		var birthList = [];
		for (var infoIdx=0; infoIdx<dotsInfo.length; infoIdx++) {
			var info = dotsInfo[infoIdx];
			birthList.push(D(info.pos.x, info.pos.y, info.dir.copy().mult(tempToV(this.m, info.temp)), this.m, this.r, this.def.spcName, this.def.idNum, info.tag, info.returnTo));
		}
		dotManager.add(birthList);
	},
	placeSingle: function(pos, dir, temp, tag, returnTo) {
		birth = D(pos.x, pos.y, dir.copy().mult(tempToV(this.m, temp)), this.m, this.r, this.def.spcName, this.def.idNum, tag, returnTo);
		dotManager.add(birth);
	}
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
	this.setHex();
}


function D(x, y, v, mass, radius, name, idNum, tag, returnTo){
	return new Dot(x, y, v, mass, radius, name, idNum, tag, returnTo);
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
		var mag = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
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
	set: function(b) {
		this.dx = b.dx;
		this.dy = b.dy;
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
		return new Vector(this.dx, this.dy);
	},
	mult: function(scalar){
		this.dx*=scalar; 
		this.dy*=scalar;
		return this;
	},
	multVec: function(b) {
		this.dx*=b.dx;
		this.dy*=b.dy;
		return this;
	},
	setMag: function(mag){
		this.mult(mag/this.mag());
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
	perp: function(dir){
		var dxOld = this.dx;
		var dyOld = this.dy;
		if (dir) {
			if (dir=='cw') {
				this.dx = dyOld;
				this.dy = -dxOld;
			} else { //dir is 'ccw'
				this.dx = -dyOld;
				this.dy = dxOld;
			}
		} else{ 
			this.dx = dyOld;
			this.dy = -dxOld;		
		}
		return this;
	},
	angle: function() {
		return Math.atan2(this.dy, this.dx);
	},
	sameAs: function(b){
		return (this.dx==b.dx && this.dy==b.dy);
	},
	isValid: function() {
		return this.dx!==undefined && !isNaN(this.dx) && this.dy!==undefined && !isNaN(this.dy);
	}
}
Color.prototype = {
	adjust: function(dr, dg, db){
		this.r = Math.round(Math.min(255, Math.max(0, this.r+dr)));
		this.g = Math.round(Math.min(255, Math.max(0, this.g+dg)));
		this.b = Math.round(Math.min(255, Math.max(0, this.b+db)));
		this.setHex();
		return this;
	},
	set: function(col){
		if (col.r!==undefined) {this.r = col.r;};
		if (col.g!==undefined) {this.g = col.g;};
		if (col.b!==undefined) {this.b = col.b;};
		this.setHex();
		return this;
	},
	setFromUnround: function(col) {
		if(col.r!==undefined){this.r = Math.round(col.r);};
		if(col.g!==undefined){this.g = Math.round(col.g);};
		if(col.b!==undefined){this.b = Math.round(col.b);};
		this.setHex();
		return this;	
	},
	setHex: function(){
		var r = Number(Math.round(this.r)).toString(16);
		var g = Number(Math.round(this.g)).toString(16);
		var b = Number(Math.round(this.b)).toString(16);
		if (r.length==1) {r = '0'+r;}
		if (g.length==1) {g = '0'+g;}
		if (b.length==1) {b = '0'+b;}
		this.hex = r+g+b;
	},
	copy: function(){
		return new Color(this.r, this.g, this.b);
	},
	add: function(b){
		this.r = Math.round(Math.min(255, Math.max(0, this.r+b.r)));
		this.g = Math.round(Math.min(255, Math.max(0, this.g+b.g)));
		this.b = Math.round(Math.min(255, Math.max(0, this.b+b.b)));
		this.setHex();
		return this;	
	},
	addNoBounds: function(b){
		this.r = Math.round(this.r + b.r);
		this.g = Math.round(this.g + b.g);
		this.b = Math.round(this.b + b.b);
		this.setHex();
		return this;
	},
	mult: function(scalar){
		this.r = Math.round(Math.min(255, Math.max(0, this.r*scalar)));
		this.g = Math.round(Math.min(255, Math.max(0, this.g*scalar)));
		this.b = Math.round(Math.min(255, Math.max(0, this.b*scalar)));
		this.setHex();
		return this;
	},
	sameAs: function(b){
		return this.r == b.r && this.g == b.g && this.b == b.b;
	}

}
Point.prototype = {
	distTo: function(pTo) {
		var dx = this.x-pTo.x;
		var dy = this.y-pTo.y;
		return Math.sqrt(dx*dx + dy*dy);
	},
	VTo: function(b) {
		return V(b.x-this.x, b.y-this.y);
	},
	fracVTo: function(b, frac) {
		return this.VTo(b).mult(frac);
	},
	fracMoveTo: function(b, frac){
		this.movePt(this.fracVTo(b, frac));
		return this;
	},
	set: function(b) {
		this.x = b.x;
		this.y = b.y;
	},
	avg: function(b) {
		return P((this.x+b.x)/2, (this.y+b.y)/2);
	},
	area: function(a, b) {
		var baseV = V(a.x-this.x, a.y-this.y);
		var baseUV = baseV.UV();
		var width = baseV.mag();
		var basePerp = V(-baseUV.dy, baseUV.dx);
		var sideVec = V(b.x-this.x, b.y-this.y);
		var height = Math.abs(basePerp.dotProd(sideVec));
		return .5*width*height;
	},
	copy: function() {
		return new Point(this.x, this.y);
	},
	movePt: function(v) {
		if(v.dx!==undefined){
			this.x+=v.dx;
		}
		if(v.dy!==undefined){
			this.y+=v.dy;
		}
		//if(v.x!==undefined || v.y!==undefined){
		//	console.log('movePt TAKES A VECTOR, NOT A POINT!');
		//}
		return this;
	},
	moveInDir: function(mag, dir) {
		this.x += Math.cos(dir) * mag;
		this.y += Math.sin(dir) * mag;
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
	mirror: function(around, vec){
		var UV = vec.UV();
		var ptVec = around.VTo(this);
		var perpVec = UV.perp('cw');
		var mag = ptVec.dotProd(perpVec);
		if (mag<0) {
			this.movePt(perpVec.mult(Math.abs(2*mag)));
		} else if (mag>0) {
			this.movePt(perpVec.neg().mult(2*mag));
		}
		return this;
		
	},
	rect: function(dims, dir){
		var pts = new Array(4);
		if (dir=='ccw') {
			pts[0] = this.copy();
			pts[1] = this.copy().movePt({dy:dims.dy});
			pts[2] = this.copy().movePt(dims);
			pts[3] = this.copy().movePt({dx:dims.dx});
		} else {
			pts[0] = this.copy();
			pts[1] = this.copy().movePt({dx:dims.dx});			
			pts[2] = this.copy().movePt(dims);
			pts[3] = this.copy().movePt({dy:dims.dy});
		}
		return pts;
	},
	roundedRect: function(dims, fracRnd, dir){
		var rectPts = this.rect(dims, dir);
		return this.roundPts(rectPts, fracRnd);
	},
	roundPts: function(pts, fracRnd){
		if(!this.sameAs(pts[0])){
			pts = [this].concat(pts);
		}
		var rndPts = new Array(2*(pts.length));
		pts['-1'] = pts[pts.length-1];
		pts.push(pts[0]);
		for (var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
			rndPts[2*ptIdx] = pts[ptIdx].copy().fracMoveTo(pts[String(ptIdx-1)], fracRnd/2);
			rndPts[2*ptIdx+1] = pts[ptIdx].copy().fracMoveTo(pts[String(ptIdx+1)], fracRnd/2);
		}
		return rndPts;
	},
	sameAs: function(b) {
		return (this.x==b.x && this.y==b.y);
	},
	closeTo: function(b) {
		return Math.abs(this.x-b.x)<1 && Math.abs(this.y-b.y)<1;
	},
	isValid: function() {
		return this.x!==undefined && !isNaN(this.x) && this.y!==undefined && !isNaN(this.y);
	},
	track: function(trackData){
		if (trackData instanceof Point) {
			pt = trackData;
			offset = false;
			noTrackX = false;
			noTrackY = false;
		} else {
			var pt = trackData.pt;
			var offset = trackData.offset;
			var noTrack = defaultTo('',trackData.noTrack);
			var noTrackX = noTrack.indexOf('x')+1;// so is 0 if not there
			var noTrackY = noTrack.indexOf('y')+1;
		}

		this.trackListenerId = unique(this.x+','+this.y+'tracksWithUniqueId', curLevel.updateListeners.listeners);
		if (this.trackListenerId.indexOf('NaN')!=-1) {
			console.log('Trying to track NaN!');
			console.trace();
		}
		if (!noTrackX && !noTrackY) {
			if (!offset) {
				var trackFunc = function() {
					this.x = pt.x;
					this.y = pt.y;
				}
			} else if (offset.dx) {
				var trackFunc = function() {
					this.x = pt.x + offset.dx;
					this.y = pt.y;
				}
			} else if (offset.dy) {
				var trackFunc = function(){
					this.x = pt.x;
					this.y = pt.y + offset.dy;
				}
			} else if (offset.dy && offset.dx) {
				var trackFunc = function() {
					this.x = pt.x + offset.dx;
					this.y = pt.y + offset.dy;
				}
			}
		} else if (noTrackX) {
			if (!offset) {
				var trackFunc = function() {
					this.y = pt.y;
				}
			} else if (offset.dy) {
				var trackFunc = function() {
					this.y = pt.y + offset.dy;
				}
			}			
		} else if (noTrackY) {
			if (!offset) {
				var trackFunc = function() {
					this.x = pt.x;
				}
			} else if(offset.dx) {
				var trackFunc = function() {
					this.x = pt.x + offset.dx;
				}
			}		
		}
		if (trackFunc) {
			addListener(curLevel, 'update', this.trackListenerId, trackFunc, this);
			this.cleanUpWith = defaultTo(currentSetupType, trackData.cleanUpWith)
			addListener(curLevel, this.cleanUpWith + 'CleanUp', this.trackListenerId, this.trackStop, this);
		} else {
			console.log('tried to track ' + this.trackListenerId + " but input wasn't right");
			console.trace();
		}
		this.tracking = true;
		return this;
	},
	trackStop: function() {
		if (this.tracking) {
			removeListener(curLevel, 'update', this.trackListenerId);
			removeListener(curLevel, this.cleanUpWith + 'CleanUp', this.trackListenerId);
			this.trackListenerId = undefined;
			this.cleanUpWith = undefined;
			this.tracking = false;
		}
		return this;
	}
}
Dot.prototype = {
	KE: function() {
		return .5*this.m*(this.v.dx*this.v.dx + this.v.dy*this.v.dy);
	},
	temp: function() {
		return .5*this.m*(this.v.dx*this.v.dx + this.v.dy*this.v.dy)*this.tConst;
	},
	setTemp: function(newTemp) {
		var curTemp = this.temp();
		//if (curTemp!=0) {
			this.v.mult(Math.sqrt(newTemp / curTemp));
		/*  SHOULD ZERO-TEMP CASE BECOME A THING, USE BELOW,  BUT AT CURRENT I DON'T THINK IT MUST
		} else {
			var v = Math.sqrt(2*newTemp/(this.tConst*this.m));
			var dir = Math.random()*2*Math.PI;
			this.v.dx = Math.cos(dir)*v;
			this.v.dy = Math.sin(dir)*v;
		}
		*/
		return this;
	},
	adjTemp: function(delta) {
		var curTemp = this.temp();
		this.v.mult(Math.sqrt((curTemp + delta) / curTemp));
		return this;
	},
	speed: function(){
		return this.v.mag()*this.pxToMS;
		//return pxToMS*Math.sqrt(this.temp()/(this.m*10));
	},
	kill: function(){
		for (var listIdx=0; listIdx<this.parentLists.length; listIdx++) {
			this.parentLists[listIdx].splice(this.parentLists[listIdx].indexOf(this), 1);
		}
		this.active = false;
	}
}
