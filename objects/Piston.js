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

function Piston(attrs){
	this.type = 'Piston';
	this.handle = attrs.handle;
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.min = defaultTo(2, attrs.min);
	this.max = defaultTo(15, attrs.max);
	this.makeSlider = defaultTo(false, attrs.makeSlider);

	this.slant = .07;
	
	//must send neither or both of these.
	this.sliderWrapper = attrs.sliderWrapper;
	this.sliderTitleWrapper = attrs.sliderTitleWrapper;
	
	this.left = this.wall[0].x;
	this.width = this.wall[1].x-this.left;
	this.pistonPt = this.wall[0];
	var pInit = defaultTo(2, attrs.init)
	this.setPressure(pInit);

	this.height = 500;
	this.draw = this.makeDrawFunc(this.height, this.left, this.width);
	this.dataSlotFont = '12pt Calibri';
	this.dataSlotFontCol = Col(255,255,255);
	this.pStep = .05;
	var readoutLeft = this.left + this.width*this.slant;
	var readoutRight = this.left + this.width - this.width*this.slant;
	var readoutY = this.pistonBottom.pos.y-2+this.pistonPt.y;
	var readoutFont = '12pt calibri';
	var readoutFontCol = Col(255, 255, 255);
	this.readout = new Readout('pistonReadout' + this.handle.toCapitalCamelCase(), readoutLeft, readoutRight, readoutY, readoutFont, readoutFontCol, 'center', curLevel);
	this.wall.moveInit();
	
	this.wall.recordPExt();
	this.wall.recordWork();
	this.savedWallHandler = this.wall.handlers[0];
	this.wallHandler = defaultTo('cPAdiabaticDamped', attrs.compMode);
	walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);
	//this.wall.setDefaultReadout(this.readout);
	if (this.makeSlider) {
		this.slider = sliderManager.addSlider('Pressure', this.handle + 'Slider',  {value: this.pToPercent(pInit)},
			[{eventType:'slide', obj:this, func:this.parseSlider}],
		attrs.sliderIdx
		)
	// this.sliderSelector = this.addSlider('Pressure', {value: this.pToPercent(pInit)}, [{eventType:'slide', obj:this, func:this.parseSlider}], this.sliderWrapper, this.sliderTitleWrapper);
		// this.slider = $(this.sliderSelector);
	}
	
	this.setupStd();
	
	return this.show();
}

_.extend(Piston.prototype, objectFuncs, compressorFuncs, {
	makeDrawFunc: function(height, left, pistonWidth){
		var shaftThickness = 30;
		var shaftLength = height - 45;
		var plateTopHeight = 35;
		var plateThickness = 10;

		this.pistonTop = this.makeTop(left, pistonWidth, shaftThickness, shaftLength, height, plateTopHeight, plateThickness);
		
		var plateTopY = -height + shaftLength
		
		var plateBottomY = plateTopY + plateTopHeight;
		
		this.pistonBottom = this.makePlateBottom(P(left, plateBottomY), V(pistonWidth, plateThickness));
		

		
		
		
		var self = this;
		var drawFunc = function(ctx){
			if (self.readout) {
				self.setReadoutY();
			}
			ctx.save();
			ctx.translate(0, self.pistonPt.y);
			draw.fillPts(self.pistonTop.pts, self.pistonTop.col, ctx);
			draw.fillRect(self.pistonBottom.pos, self.pistonBottom.dims, self.pistonBottom.col, ctx);
			ctx.restore();
		}
		return drawFunc;
	},
	makeTop: function(left, pistonWidth, shaftThickness, length, yInit, plateHeight, plateThickness){
		var slant = this.slant;
		var slantLeft = slant;
		var slantRight = 1-slant;
		var pts = new Array(14);
		var shaftX = left + pistonWidth/2 - shaftThickness/2;
		var shaftY = -yInit;
		var shaftPos = P(shaftX, shaftY);
		var col = Col(150, 150, 150);
		var dims = V(pistonWidth, plateHeight)
		var platePos = shaftPos.copy().movePt({dy:length}).position({x:left});;
		pts[0] =  P(platePos.x,										platePos.y+dims.dy+1);
		pts[1] =  P(platePos.x+dims.dx*slantLeft, 					platePos.y);
		pts[2] =  P(shaftPos.x-dims.dx*slantLeft,					platePos.y);
		pts[3] =  P(shaftPos.x,										platePos.y-5*dims.dy*slantLeft);
		pts[4] =  P(shaftPos.x,										shaftPos.y);
		pts[5] =  P(shaftPos.x + shaftThickness,					shaftPos.y);
		pts[6] =  P(shaftPos.x + shaftThickness,					platePos.y-5*dims.dy*slantLeft);
		pts[7] =  P(shaftPos.x + shaftThickness+dims.dx*slantLeft,	platePos.y);
		pts[8] =  P(platePos.x+dims.dx*slantRight, 					platePos.y);
		pts[9] =  P(platePos.x+dims.dx, 							platePos.y+dims.dy+1);
		pts[10] = P(platePos.x+dims.dx-plateThickness,				platePos.y+dims.dy+1);
		pts[11] = P(platePos.x+dims.dx*slantRight-plateThickness, 	platePos.y+plateThickness);
		pts[12] = P(platePos.x+dims.dx*slantLeft+plateThickness, 	platePos.y+plateThickness);
		pts[13] = P(platePos.x+plateThickness,						platePos.y+dims.dy+1);
		var col = Col(150, 150, 150);
		return {pts:pts, col:col};
	},
	makePlateBottom: function(pos, dims){
		var col = Col(100, 100, 100);
		dims.adjust(0,1);
		return {pos:pos, dims:dims, col:col};
	},
	enable: function() {
		if (this.slider) {
			this.slider.slider('option', 'disabled', false);
		}
		this.setMass(this.massStore);
		delete this.massStore;
		this.enabled = true;
	},
	disable: function() {
		if (this.slider) {
			this.slider.slider('option', 'disabled', true);
		}
		this.massStore = this.mass;
		this.setMass(0);
		this.enabled = false;
	},
	show: function(){
		canvasManager.addListener('main', 'drawPiston' + this.handle, this.draw, undefined, 1);
		this.readout.show();
		return this;
	},
	pToPercent: function(p) {
		return 100 * (p - this.min) / (this.max - this.min);
	},
	hide: function(){
		canvasManger.removeListener('main', 'drawPiston' + this.handle);
		this.readout.hide();
	},
	parseSlider: function(event, ui){
		this.setPressure(this.percentToVal(ui.value));
	},
	setPressure: function(pressure){
		this.setMass(this.pressureToMass(pressure));
	},
	setMass: function(mass){
		this.mass = mass;
		this.wall.setMass('piston' + this.handle, this.mass);
	},
	setReadoutY: function(){
		this.readout.position({y:this.pistonBottom.pos.y-2+this.pistonPt.y});
	},
	remove: function(){
		this.wall.moveStop();
		this.wall.unsetMass('piston' + this.handle);
		walls.setSubWallHandler(walls.indexOf(this.wall), 0, this.savedWallHandler);
		this.hide();
		if (this.slider) {
			this.slider.remove();
		}
		removeListener(curLevel, 'update', 'moveWalls');
	}
}
)