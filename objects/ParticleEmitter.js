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

/*
//////////////////////////////////////////////////////////////////////////
//ParticleEmitter
//////////////////////////////////////////////////////////////////////////
Requires
	pos
	dir
	width
	dist
	col
Optional
	parentList
	handle
	onGenerate
	onArrive
	onRemove
	rate
	speed
	speedSpread
	accel
	accelSpread
	dirSpread
	drawCanvas
*/
function ParticleEmitter(attrs){
	this.type = 'ParticleEmitter';
	this.pos = attrs.pos;
	this.handle = attrs.handle;
	this.dir = attrs.dir;
	this.parentList = attrs.parentList;
	this.width = attrs.width;
	this.col = attrs.col;
	this.dist = attrs.dist;
	this.onGenerate = attrs.onGenerate;
	this.onArrive = attrs.onArrive;
	this.onRemove = attrs.onRemove;
	this.rate = defaultTo(Math.round(.1*this.width), attrs.rate);
	this.speed = defaultTo(5, attrs.speed);
	this.speedSpread = defaultTo(1, attrs.speedSpread);
	if (2*this.speedSpread>this.speed) {
		console.log('Uh-oh.  Making particle emitter with handle ' + this.handle + ' with speed spread such that particles will hit ~0 speed');
	}
	this.accel = defaultTo(.5, attrs.accel);
	this.accelSpread = defaultTo(1, attrs.accelSpread);
	this.dirSpread = defaultTo(0, attrs.dirSpread);
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.makeBounds();
	this.setupStd();
	this.particles = [];
	return this.init();
}
_.extend(ParticleEmitter.prototype, objectFuncs, {
	init: function(){
		this.runListenerName = unique('particle' + this.handle, curLevel.updateListeners);
		addListener(curLevel, 'update', this.runListenerName, this.run, this);
		return this;
	},
	adjust: function(attrs){
		for (var attr in attrs) {
			this[attr] = attrs[attr];
		}
		this.makeBounds();
	},
	makeBounds: function(){
		this.UV = angleToUV(this.dir);
		var edgePt1 = this.pos.copy().movePt(this.UV.copy().rotate(-Math.PI/2).mult(this.width/2));
		var edgePt2 = this.pos.copy().movePt(this.UV.copy().rotate(Math.PI/2).mult(this.width/2));
		this.prodPt = edgePt1;
		this.prodV = edgePt1.VTo(edgePt2);
		this.finishPt = edgePt1.copy().movePt(this.UV.copy().mult(this.dist))
		this.finishV = this.finishPt.VTo(this.prodPt);
	},
	run: function(){
		this.generateNew();
		this.updateParticles();
		this.draw();
	},
	trickleOut: function(){
		this.updateParticles();
		this.draw();
		if (this.particles.length==0) {
			this.remove();
		}
	},
	generateNew: function(){
		var numNew = Math.round(Math.random()*this.rate);
		for (var newIdx=0; newIdx<numNew; newIdx++) {
			this.particles.push(this.newParticle());
			if (this.onGenerate) {
				this.onGenerate.func.apply(this.onGenerate.obj);
			}
		}
	},
	newParticle: function(){
		var initPos = this.prodPt.copy().movePt(this.prodV.copy().mult(Math.random()));
		var initSpeed = Math.max(.01, this.speed + this.speedSpread*(Math.random()-.5));
		var accel = Math.max(0, this.accel + this.accelSpread*(Math.random()-.5));
		var UV = angleToUV(this.dir + this.dirSpread*(Math.random()-.5));
		var lifespan = this.getlifespan(initPos, initSpeed, accel, UV);
		return {pos:initPos, V:UV.copy().mult(initSpeed), accelV:UV.copy().mult(accel), age:0, lifespan:lifespan};
	},
	getlifespan: function(initPos, initSpeed, accel, UV){
		var coLinRatio = UV.dotProd(this.UV);
		var coLinAccel = accel*coLinRatio;
		var coLinSpeed = initSpeed*coLinRatio;
		var a = .5*coLinAccel;
		var b = coLinSpeed;
		var c = -this.dist;
		return (-b + Math.sqrt(b*b - 4*a*c))/(2*a);
	},
	updateParticles: function(){
		for (var particleIdx=this.particles.length-1; particleIdx>=0; particleIdx-=1){
			var particle = this.particles[particleIdx];
			particle.pos.movePt(particle.V);
			particle.V.add(particle.accelV);
			particle.age++;
			if(particle.age>particle.lifespan){
				this.particles.splice(particleIdx, 1);
				if(this.onArrive){
					this.onArrive.func.apply(this.onArrive.obj);
				}
			}	
		}
	},
	draw: function(){
		this.drawCanvas.strokeStyle = this.col.hex;
		for (var particleIdx = 0; particleIdx<this.particles.length; particleIdx++){
			var particle = this.particles[particleIdx];
			c.beginPath();
			c.moveTo(particle.pos.x, particle.pos.y);
			c.lineTo(particle.pos.x+2, particle.pos.y+2);
			//if lines start behaving strangely, not closing the path here may have something to do with it
			c.stroke();
		}	
	},
	stopFlow: function(){
		removeListener(curLevel, 'update', this.runListenerName);
		addListener(curLevel, 'update', this.runListenerName, this.trickleOut, this)
	},
	remove: function(){
		if(this.onRemove){
			this.onRemove.func.apply(this.onRemove.obj);
		}
		if(this.parentList){
			this.parentList.splice(_.indexOf(this.parentList, this), 1);
		}
		removeListener(curLevel, 'update', this.runListenerName);
		this.removed = true;
	},

}
)