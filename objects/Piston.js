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

function Piston(attrs) {
	this.type = 'Piston';
	this.handle = attrs.handle;
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.min = defaultTo(2, attrs.min);
	this.max = defaultTo(15, attrs.max);
	this.makeSlider = defaultTo(false, attrs.makeSlider);

	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.slant = .04;
	
	//must send neither or both of these.
	this.sliderWrapper = attrs.sliderWrapper;
	this.sliderTitleWrapper = attrs.sliderTitleWrapper;
	
	this.left = this.wall[0].x;
	this.width = this.wall[1].x-this.left;
	var shaftThicknessMax = 30;
	var shaftThicknessMin = 13
	this.shaftThickness = shaftThicknessMin + (shaftThicknessMax - shaftThicknessMin) * Math.max(0, Math.min(1, (this.width - 200) / (500 - 200)));
	this.pistonPt = this.wall[0];
	var pInit = defaultTo(2, attrs.init)
	this.setPressure(pInit);
	this.canvasHandle = attrs.canvasHandle || 'main';
	this.height = 500;
	this.pistonTop;
	this.pistonBottom;
	this.pistonAdjust = 9;
	this.draw = this.makeDrawFunc(this.height, this.left, this.width);
	this.dataSlotFont = '12pt Calibri';
	this.dataSlotFontCol = Col(255,255,255);
	this.pStep = .05;
	var readoutLeftLeft = this.left + this.width*this.slant * .1;
	var readoutLeftRight = this.left + this.width / 2 - this.shaftThickness / 2;
	var readoutRightLeft = this.left + this.width / 2 + this.shaftThickness / 2;
	var readoutRightRight = this.left + this.width - this.width*this.slant * .1;
	var readoutY = this.pistonBottom.pos.y-this.pistonAdjust+this.pistonPt.y;
	var readoutFont = '12pt calibri';
	var readoutFontCol = Col(255, 255, 255);
	this.readoutLeft = new Readout('piston' + this.handle.toCapitalCamelCase() + 'Left', readoutLeftLeft, readoutLeftRight, readoutY, readoutFont, readoutFontCol, 'center', curLevel);
	this.readoutRight = new Readout('piston' + this.handle.toCapitalCamelCase() + 'Right', readoutRightLeft, readoutRightRight, readoutY, readoutFont, readoutFontCol, 'center', curLevel);
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
		var headThickness = 15
		var shaftLength = height - headThickness;
		var plateThickness = 1/2*headThickness;
		var plateTopHeight = headThickness - plateThickness;

		this.pistonTop = this.makeTop(left, pistonWidth, this.shaftThickness, shaftLength, height, plateTopHeight, plateThickness);
		
		var plateTopY = -height + shaftLength
		
		var plateBottomY = plateTopY + plateTopHeight;
		
		this.pistonBottom = this.makePlateBottom(P(left, plateBottomY), V(pistonWidth, plateThickness));
		

		var self = this;
		var drawFunc = function(ctx){
			self.setReadoutY();
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
		var pts = [];
		var shaftX = left + pistonWidth/2 - shaftThickness/2;
		var shaftY = -yInit;
		var shaftPos = P(shaftX, shaftY);
		var col = Col(150, 150, 150);
		var dims = V(pistonWidth, plateHeight)
		var platePos = shaftPos.copy().movePt({dy:length}).position({x:left});;
		pts.push(P(platePos.x,										platePos.y+dims.dy+1));
		pts.push(P(platePos.x+dims.dx*slantLeft, 					platePos.y));
		pts.push(P(shaftPos.x-dims.dx*slantLeft,					platePos.y));
		pts.push(P(shaftPos.x,										platePos.y-15*dims.dy*slantLeft));
		pts.push(P(shaftPos.x,										shaftPos.y));
		pts.push(P(shaftPos.x + shaftThickness,					    shaftPos.y));
		pts.push(P(shaftPos.x + shaftThickness,					    platePos.y-15*dims.dy*slantLeft));
		pts.push(P(shaftPos.x + shaftThickness+dims.dx*slantLeft,	platePos.y));
		pts.push(P(platePos.x+dims.dx*slantRight, 					platePos.y));
		pts.push(P(platePos.x+dims.dx, 							    platePos.y+dims.dy+1));
		pts.push(P(platePos.x+dims.dx-plateThickness,				platePos.y+dims.dy+1));
		pts.push(P(platePos.x+plateThickness,						platePos.y+dims.dy+1));
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
		canvasManager.addListener(this.canvasHandle, 'drawPiston' + this.handle, this.draw, this, 1);
		this.readoutLeft.show();
		this.readoutRight.show();
		return this;
	},
	pToPercent: function(p) {
		return 100 * (p - this.min) / (this.max - this.min);
	},
	hide: function(){
		canvasManager.removeListener(this.canvasHandle, 'drawPiston' + this.handle)
		this.readoutLeft.hide();
		this.readoutRight.hide();
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
		this.readoutLeft.position({y:this.pistonBottom.pos.y-this.pistonAdjust+this.pistonPt.y});
		this.readoutRight.position({y:this.pistonBottom.pos.y-this.pistonAdjust+this.pistonPt.y});	
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