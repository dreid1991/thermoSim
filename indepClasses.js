/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
ROUNDTO=4;

function reprNum(x) {
    return String(round(x, ROUNDTO))
}
function Dot(x, y, v, spcName, tag, elemId, returnTo) {
	var def = window.spcs[spcName]
	this.x = x;
	this.y = y;
	this.v = v;
	this.m = def.m;
	this.r = def.r;
	this.spcName = spcName;
	this.elemId = defaultTo(-1, elemId); //timeline element
	this.idNum = def.idNum;
	//btdubs, try to be type-safe with members so V8 can optimize dot
	this.hF298 = defaultTo(0, def.hF298 * 1000 / N);
	this.uF298 = defaultTo(0, def.uF298 * 1000 / N);
	this.hVap298 = defaultTo(0, def.hVap298 * 1000 / N);
	this.sF298 = defaultTo(0, def.sF298 * 1000 / N);
	this.cvKinetic = 1.5 * R / N;
	this.cv = def.cv / N;
	this.cp = this.cv + R / N;
	this.cpLiq = defaultTo(this.cv, def.cpLiq / N);
	this.spcVolLiq = defaultTo(1e-3, def.spcVolLiq / N); //L/molec
	this.tag = tag;
	this.returnTo = returnTo;
	this.tConst = tConst;
	this.pxToE = pxToE;
	this.pxToMS = pxToMS;
	this.parentLists = [];
	this.internalPotential = this.temp() * (this.cv - this.cvKinetic);
	this.peLast = 0;
	this.tempLast = 0;
	this.peCur = 0;
	// var speciesDef = speciesDefs[spcName];
	// this.attractStr = speciesDef.attractStr;
	// this.attractStrs = speciesDef.attractStrs;
	// this.attractRad = speciesDef.attractRad;
	this.active = true;
}
//{spcName: 'spc1', m: 2, r: 1, col: Col(200, 0, 0), cv: 2.5 * R, hF: -10, hVap: 40, cvLiq: 12},
function Species (spcName, mass, radius, color, idNum, cv, hF298, hVap298, sF298, antoineCoeffs, cpLiq, spcVolLiq, dotManager) {
	this.spcName = spcName;
	this.m = mass;
	this.r = radius;
	this.col = color;
	this.idNum = idNum
	this.cv = cv;
	this.cp = cv + R;
	this.hF298 = hF298;
	this.uF298 = this.hF298 - R * 298.15 / 1000;
	this.hVap298 = hVap298;
	this.sF298 = sF298;
	this.antoineCoeffs = antoineCoeffs;
	this.cpLiq = cpLiq;
	this.spcVolLiq = spcVolLiq;
	this.dots = dotManager.addSpcs(spcName);
	
}
Species.prototype = {
	populate: function(pos, dims, count, temp, tag, elemId, returnTo, dotMgrLocal) {
		dotMgrLocal = dotMgrLocal || dotManager;
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
			birthList.push(D(placeX, placeY, V(vx, vy), this.spcName, tag, elemId, returnTo));
		}
		dotMgrLocal.add(birthList);
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
	place: function(dotsInfo) { //as [{pos: , dir: , temp: , tag: , returnTo: }]
		var birthList = [];
		for (var infoIdx=0; infoIdx<dotsInfo.length; infoIdx++) {
			var info = dotsInfo[infoIdx];
			birthList.push(D(info.pos.x, info.pos.y, info.dir.copy().mult(tempToV(this.m, info.temp)), this.spcName, info.tag, undefined, info.returnTo));
		}
		dotManager.add(birthList);
	},
	placeSingle: function(pos, dir, temp, tag, returnTo) {
		birth = D(pos.x, pos.y, dir.copy().mult(tempToV(this.m, temp)), this.spcName, tag, undefined, returnTo);
		dotManager.add(birth);
	},
	enthalpy: function(temp) {
		// j in dot
		return (this.hF298 * 1000 + (this.cv + R) * (temp - 298.15)) / N;
	},
	internalEnergy: function(temp) {
		return (this.uF298 * 1000 + this.cv * (temp - 298.15)) / N;
	},
	tBoil: function(pressure) { //in bar
		pressure /= MMHGTOBAR;
		var coeffs = this.antoineCoeffs;
		return coeffs.b / (coeffs.a - Math.log10(pressure)) - coeffs.c;
	},
	pPure: function(temp) {
		var coeffs = this.antoineCoeffs;
		return MMHGTOBAR * Math.pow(10, coeffs.a - coeffs.b / (coeffs.c + temp));
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


function D(x, y, v, name, tag, elemId, returnTo){
	return new Dot(x, y, v, name, tag, elemId, returnTo);
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


function ValObj(x) {
	this.x = x;
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
	sub: function(b) {
		this.dx-=b.dy;
		this.dy-=b.dx;
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
	crossProd: function(b) {
		return this.dx * b.dy - this.dy * b.dx;
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
		var dx = this.dx, dy = this.dy, cos = Math.cos(rad), sin = Math.sin(rad);
		this.dx = dx * cos - dy * sin;
		this.dy = dx * sin + dy * cos;
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
	},
	zero: function() {
		this.x = 0;
		this.y = 0;
	},
    repr: function() {
        return 'V(' + reprNum(this.dx) + ',' + reprNum(this.dy) + ')'
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
		var r = Math.round(this.r).toString(16);
		var g = Math.round(this.g).toString(16);
		var b = Math.round(this.b).toString(16);
		if (r.length==1) {r = '0'+r;}
		if (g.length==1) {g = '0'+g;}
		if (b.length==1) {b = '0'+b;}
		this.hex = '#' + r + g + b;
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
	},
    repr: function() {
        return 'Col(' + reprNum(this.r) + ',' + reprNum(this.g) + ',' + reprNum(this.b) + ')'
    }

}
Point.prototype = {
	distTo: function(b) {
		var dx = this.x-b.x;
		var dy = this.y-b.y;
		return Math.sqrt(dx*dx + dy*dy);
	},
	distSqrTo: function(b) {
		var dx = this.x-b.x;
		var dy = this.y-b.y;
		return dx*dx + dy*dy;	
	},
	VTo: function(b) {
		return new Vector(b.x-this.x, b.y-this.y);
	},
	UVTo: function(b) {
		var mag = Math.sqrt((this.x - b.x) * (this.x - b.x) + (this.y - b.y) * (this.y - b.y));
		return new Vector((b.x - this.x) / mag, (b.y - this.y) / mag);
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
		return new Point((this.x+b.x)/2, (this.y+b.y)/2);
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
		var origin = new Vector(around.x, around.y)
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
		var pt, offset, noTrackX, noTrackY, xMult, yMult;
		
		if (trackData instanceof Point) {
			pt = trackData;
			offset = V(0, 0);
			noTrackX = false;
			noTrackY = false;
			
			
			
		} else {
			pt = trackData.pt;
			offset = trackData.offset == undefined ? V(0, 0) : V(trackData.offset.dx || 0, trackData.offset.dy || 0);
			noTrackX = /x/i.test(trackData.noTrack);
			noTrackY = /y/i.test(trackData.noTrack);
		}
		xMult = !noTrackX ? 1 : 0;
		yMult = !noTrackY ? 1 : 0;
		var trackFunc = function() {
			this.x = this.x + xMult * (pt.x - this.x + offset.dx);
			this.y = this.y + yMult * (pt.y - this.y + offset.dy);
		}
		
		this.trackListenerId = unique(this.x+','+this.y+'tracksWithUniqueId', curLevel.updateListeners);
		
		addListener(curLevel, 'update', this.trackListenerId, trackFunc, this);
		if (!trackFunc) {
			console.log('tried to track ' + this.trackListenerId + " but input wasn't right");
			console.trace();
		}
		this.tracking = true;
		return this;
	},
	trackStop: function() {
		if (this.tracking) {
			removeListener(curLevel, 'update', this.trackListenerId);
			//removeListener(curLevel, this.cleanUpWith + 'CleanUp', this.trackListenerId);
			this.trackListenerId = undefined;
			//this.cleanUpWith = undefined;
			this.tracking = false;
		}
		return this;
	},

    repr: function() {
        return 'P(' + reprNum(this.x) + ',' + reprNum(this.y) + ')'
    }
}
Dot.prototype = {
	KE: function() {
		return .5*this.m*(this.v.dx*this.v.dx + this.v.dy*this.v.dy);
	},
	temp: function() {
		return .5 * this.m * (this.v.dx*this.v.dx + this.v.dy*this.v.dy) * this.tConst;
	},
	tempCondense: function() {
		return (this.cv * (this.temp() - 298.15) + this.hVap298) / this.cpLiq + 298.15;
	},
	tempVaporize: function(tLiq) { 
		return (this.cpLiq * (this.temp() - 298.15) - this.hVap298) / this.cv + 298.15;
	},
	hVap: function() {
		return this.hVap298 + (this.temp() - 298.15) * (this.cv - this.cpLiq);
	},
	setTemp: function(newTemp) {	
		var curTemp = this.temp();
		//if (curTemp!=0) {
		this.v.mult(Math.sqrt(newTemp / curTemp));
		this.internalPotential *= newTemp / curTemp;
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
	setTempNoReference: function(temp) {
		var dir = this.v.UV();
		var vMag = Math.sqrt(2 * temp / (this.m * this.tConst));
		this.v.dx = dir.dx * vMag;
		this.v.dy = dir.dy * vMag;
		this.internalPotential = temp * (this.cv - this.cvKinetic);
	},
	addEnergy: function(dE) {
		var curTemp = this.temp();
		tF = Math.max(1, curTemp + dE / this.cv)
		this.v.mult(Math.sqrt(tF / curTemp));
		this.internalPotential *= tF / curTemp;
		return (tF - curTemp) * this.cv;
	},
	adjTemp: function(delta) {
		var curTemp = this.temp();
		this.internalPotential += delta * (this.cv - this.cvKinetic) / this.N;
		this.v.mult(Math.sqrt((curTemp + delta) / curTemp));
		return this;
	},
	enthalpy: function() {
		//joules in that dot
		return (this.hF298 + (this.temp() - 298.15) * (this.cv + R / N));
	},
	internalEnergy: function() {
		return (this.uF298 + (this.temp() - 298.15) * this.cv);
	},
	kineticEnergy: function() {
		return this.temp() * this.cvKinetic;
	},
	speed: function() {
		return this.v.mag()*this.pxToMS;
		//return pxToMS*Math.sqrt(this.temp()/(this.m*10));
	},
	kill: function(deactivate) {
		for (var listIdx=0; listIdx<this.parentLists.length; listIdx++) {
			this.parentLists[listIdx].splice(this.parentLists[listIdx].indexOf(this), 1);
		}
		this.parentLists.splice(0, this.parentLists.length);
		if (deactivate) this.active = false;
	}
}
