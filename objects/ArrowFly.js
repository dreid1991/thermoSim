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
Requires
	posInit
	posFinal || ((dir || UV) && dist)
	fillInit
	dimsInit
	lifespan
Optional
	posFinal
	fillFinal
	dimsFinal
	strokeInit
	strokeFinal
	alphaInit
	alphaFinal
	fade //defaults to true
	fadeTurns
	onFinish {func:, obj:}
*/

function ArrowFly(attrs){
	this.type = 'ArrowFly';
	this.pos = attrs.pos.copy();
	if (attrs.posFinal) {
		this.posFinal = attrs.posFinal;
		this.UV = this.pos.VTo(this.posFinal).UV();
		this.dir = this.UV.angle();
		this.dist = this.pos.distTo(this.posFinal);
	} else if (attrs.V) {
		this.posFinal = this.pos.copy().movePt(attrs.V);
		this.UV = attrs.V.UV();
		this.dir = this.UV.angle();
	} else if ((attrs.dir || attrs.UV) && attrs.dist) {
		if (attrs.dir) {
			this.dir = attrs.dir;
			this.UV = angleToUV(attrs.dir);
		} else {// must be UV
			this.UV = attrs.UV;
			this.dir = this.UV.angle();
			this.UV = attrs.UV;
		}
		this.posFinal = this.pos.copy().movePt(this.UV.copy().mult(attrs.dist));
		this.dist = attrs.dist;
	}
	this.canvasHandle = 		attrs.canvasHandle || 'main';
	this.dims = 				attrs.dims.copy();
	this.dimsFinal = 			defaultTo(this.dims, attrs.dimsFinal);
	this.fill = 				attrs.fill.copy();
	this.fillUnround = 			{r:this.fill.r, g:this.fill.g, b:this.fill.b};
	this.fillFinal = 			defaultTo(this.fill, attrs.fillFinal);
	this.stroke = 				defaultTo(this.fill, attrs.stroke.copy());
	this.fade = 				defaultTo(true, attrs.fade);
	this.fadeTurns = 			defaultTo(4, attrs.fadeTurns);
	//need to keep precision in unround.  Rounding in color class will lose steps if < .5/turn
	this.strokeUnround = 		{r:this.stroke.r, g:this.stroke.g, b:this.stroke.b};
	this.strokeFinal = 			defaultTo(this.fillFinal, attrs.strokeFinal);
	this.alpha = 				defaultTo(1, attrs.alpha);
	this.alphaFinal = 			defaultTo(this.alpha, attrs.alphaFinal);
	this.age = 					0;
	this.lifespan = 			Math.round(attrs.lifespan/updateInterval);
	this.getSteps();
	this.pts = 					this.getPts();
	/*
	if(this.fade){
		this.lifespan = Math.max(0, this.lifespan-=this.fadeTurns;
	}
	*/
	this.onFinish = attrs.onFinish;
	return this.init();
}
_.extend(ArrowFly.prototype, objectFuncs, toInherit.ArrowFuncs, {
	getSteps: function(){
		var scalar = 1/this.lifespan;
		this.posStep = this.pos.VTo(this.posFinal).mult(scalar);
		
		var ddx = this.dimsFinal.dx - this.dims.dx;
		var ddy = this.dimsFinal.dy - this.dims.dy;
		this.dimsStep = V(ddx, ddy).mult(scalar);
		
		var drFill = this.fillFinal.r - this.fill.r;
		var dgFill = this.fillFinal.g - this.fill.g;
		var dbFill = this.fillFinal.b - this.fill.b;
		this.fillStep = {r:scalar*drFill, g:scalar*dgFill, b:scalar*dbFill};
		
		var drStroke = this.strokeFinal.r - this.stroke.r;
		var dgStroke = this.strokeFinal.g - this.stroke.g;
		var dbStroke = this.strokeFinal.b - this.stroke.b;
		this.strokeStep = {r:scalar*drStroke, g:scalar*dgStroke, b:scalar*dbStroke};
		
		this.alphaStep = (this.alphaFinal - this.alpha)*scalar;
	},

	init: function(){
		this.updateListenerName = unique(this.type + defaultTo('', this.handle), curLevel.updateListeners);
		this.drawListenerName = this.updateListenerName + 'Draw';
		canvasManager.addListener(this.canvasHandle, this.drawListenerName, this.draw, this, 998);
		addListener(curLevel, 'update', this.updateListenerName, this.run, this);
		this.setupStd();
		return this;
	},
	draw: function(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.dir);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, ctx)
		ctx.restore();	
	},
	run: function(){

		this.takeStep();
		this.age++;
		if (this.age == this.lifespan) {
			if (this.onFinish) {
				this.onFinish.func.apply(this.onFinish.obj);
			}
			if (this.fade) {
				this.alphaStep = -this.alpha/this.fadeTurns;
				this.remove();
				this.updateListenerName = unique(this.type + defaultTo('', this.handle) + 'fade', curLevel.updateListeners);
				addListener(curLevel, 'update', this.updateListenerName, this.runFade, this);
				this.addCleanUp();
			} else {
				this.remove();
			}
		}
	},
	runFade: function() {
		this.drawCanvas.save();
		this.drawCanvas.globalAlpha = this.alpha;
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.dir);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas)
		this.drawCanvas.restore();
		this.takeStepFade();
		this.age++;
		if (this.age == this.lifespan+this.fadeTurns) {
			this.remove();
		}		
	},
	scale: function(){
		var scalarX = (this.dims.dx + this.dimsStep.dx)/this.dims.dx;
		var scalarY = (this.dims.dy + this.dimsStep.dy)/this.dims.dy;
		for (var ptIdx=0; ptIdx<this.pts.length; ptIdx++){
			this.pts[ptIdx].x*=scalarX;
			this.pts[ptIdx].y*=scalarY;
		}
	},
	takeStep: function(){
		this.pos.movePt(this.posStep);
		this.dims.add(this.dimsStep);
		this.scale() //can't just scale canvas because that scale stroke as well;
		this.alpha += this.alphaStep;
		
		this.fillUnround.r += this.fillStep.r;
		this.fillUnround.g += this.fillStep.g;
		this.fillUnround.b += this.fillStep.b;
		
		this.strokeUnround.r += this.strokeStep.r;
		this.strokeUnround.g += this.strokeStep.g;
		this.strokeUnround.b += this.strokeStep.b;
		
		this.fill.setFromUnround(this.fillUnround);
		this.stroke.setFromUnround(this.strokeUnround);
		
		
		
	},
	takeStepFade: function(){
		this.pos.movePt(this.posStep);
		this.dims.add(this.dimsStep);
		this.scale() //can't just scale canvas because that scale stroke as well;
		this.alpha += this.alphaStep;
	},
	remove: function(){
		canvasManager.removeListener(this.canvasHandle, this.drawListenerName);
		removeListener(curLevel, 'update', this.updateListenerName);
	},
})