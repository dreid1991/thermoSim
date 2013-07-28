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
If you give it wallInfo, heater will add its energy flow to wall.q
Still records its energy flow
*/
function Heater(attrs){
	this.type = 'Heater';
	/*
	dims.dx corresponds to long side w/ wires
	dims.dy corresponds to short side
	*/
	this.dims = defaultTo(V(100,40), attrs.dims);
	
	this.sliderWrapper = attrs.sliderWrapper;
	this.sliderTitleWrapper = attrs.sliderTitleWrapper;
	
	this.wall = walls[attrs.wallInfo];
	this.pos = attrs.pos ? attrs.pos : this.centerOnWall(attrs.wallInfo, this.dims);

	if (attrs.offset) this.pos.movePt(attrs.offset);
	this.wall.recordQ();
	this.wall.hitThreshold = 30;
	this.makeSlider = defaultTo(true, attrs.makeSlider);
	this.handle = attrs.handle;
	this.canvasHandle = attrs.canvasHandle || 'main';
	this.cornerRound = .2;
	this.qRate = defaultTo(0, attrs.init);
	this.qRateMax = defaultTo(1, attrs.max);
	this.qRateMin = -this.qRateMax;
	this.rot = defaultTo(0, attrs.rotation);
	this.tempMax = defaultTo(Number.MAX_VALUE, attrs.tempMax);
	this.tempMin = defaultTo(1, attrs.tempMin)
	this.center = this.pos.copy().movePt(this.dims.copy().mult(.5));
	var colMax = defaultTo(Col(200,0,0), attrs.colMax);
	var colMin = defaultTo(Col(0,0,200), attrs.colMin);
	var colDefault = defaultTo(Col(100, 100, 100), attrs.colDefault);
	this.draw = this.makeDrawFunc(colMin, colDefault, colMax);
	this.wallPts = this.pos.roundedRect(this.dims, .3, 'ccw');
	this.addWallHump(this.wallPts);
	this.eAdded=0;
	if (attrs.liquidHandle) { //liquid invoked using liquid handle
		this.setupLiquidHeat(attrs.liquidHandle);
	}
	this.wallHandleHeater = 'heater' + this.handle.toCapitalCamelCase();
	this.hit = this.wrapHit(this.wall.getDataSrc('temp'));
	this.setupStd();
	if (this.makeSlider) {
		this.slider = sliderManager.addSlider('Heater', this.handle + 'Slider', {value:50},
			[{eventType:'slide', obj:this, func:this.parseSlider},
			{eventType:'slidestop', obj:this, func:function(event, ui){
												$(this.slider.slider).slider('option', {value:50});
												ui.value=50;
												this.parseSlider(event, ui)
											}
			},		
			],
		attrs.sliderIdx
		)
	}
	this.init(this.wallHandleHeater, this.wall.handle);
}

_.extend(Heater.prototype, objectFuncs, {
	parseSlider: function(event, ui){
		this.setQRate(ui.value);
	},
	setQRate: function(val){		
		this.qRate = .02*(val-50)*this.qRateMax;
		if (this.liquid) {
			if (val != 50) {
				addListener(curLevel, 'update', 'heatLiquid' + this.handle, this.heatLiq, this);
			} else {
				removeListener(curLevel, 'update', 'heatLiquid' + this.handle);
			}
		}
		
	},
	heatLiq: function() {
		this.liquid.addQ(.15 * this.qRate * updateInterval);
	},
	addWallHump: function(wallPts) {
		var horizontalStarts = [];
		for (var i=0; i<wallPts.length - 1; i++) {
			if (wallPts[i].y == wallPts[i + 1].y) {
				horizontalStarts.push(i)
			}
		}
		if (wallPts[wallPts.length - 1].y == wallPts[0].y) {
			horizontalStarts.push(wallPts.length - 1);
		}
		var maxIdx = horizontalStarts[0];
		for (var i=0; i<horizontalStarts.length; i++) {
			maxIdx = wallPts[horizontalStarts[i]].y < wallPts[maxIdx].y ? horizontalStarts[i] : maxIdx;
		}
		var avgX = maxIdx == wallPts.length - 1 ? (wallPts[maxIdx].x + wallPts[0].x) / 2 : (wallPts[maxIdx].x + wallPts[maxIdx + 1].x) / 2;
		wallPts.splice(maxIdx + 1, 0, P(avgX, wallPts[maxIdx].y - 5));
	},
	disable: function() {
		var slider = $(this.sliderSelector);
		if (slider.length) $(slider).slider('disable');
		this.enabled = false;
	},
	enable: function() {
		var slider = $(this.sliderSelector);
		if (slider.length) $(slider).slider('enable');
		this.enabled = true;
	},
	makeDrawFunc: function(colMin, colDefault, colMax){
		var pos = this.pos;
		var dims = this.dims;
		var rnd = this.cornerRound;
		this.pts = this.getPts(pos, dims);
		rotatePts(this.pts, this.center, this.rot);
		var colorSteps = this.getColorSteps(colMin, colDefault, colMax)
		var self = this;
		var pts = this.pts;
		var drawFunc = function(ctx){
			var sign = getSign(self.qRate);
			var steps = colorSteps[String(sign)];
			var fracToEnd = sign*self.qRate/self.qRateMax;
			
			var curCol = colDefault.copy().adjust(steps[0]*fracToEnd, steps[1]*fracToEnd, steps[2]*fracToEnd);
			draw.path(pts, curCol, ctx);
		}
		return drawFunc;
	},
	centerOnWall: function(wallInfo, dims){
		var wall = walls[wallInfo];
		var center = (wall[3].x + wall[2].x)/2;
		var floor = wall[2].y;
		var floorSpacing = 30;
		var x = center - dims.dx/2;
		var y = floor - floorSpacing - dims.dy;
		return P(x, y);
	},
	getPts: function(pos, dims, rnd){
		var pts = new Array();
		var circlePos = pos.copy().movePt({dy:dims.dy/2});
		
		var forwardDx = dims.dy/2+2.5;
		var backwardDx = dims.dy/2-2.5;
		var numElipses = Math.floor((dims.dx-2*forwardDx)/(2*(forwardDx - backwardDx)));
		pts.push(circlePos.copy().movePt({dy:200}));
		pts.push(circlePos.copy());
		pts = pts.concat(this.halfElipse(circlePos, forwardDx, dims.dy/2, 0, 5));
		circlePos.movePt({dx:2*forwardDx});
	
		for (var elipseIdx=0; elipseIdx<numElipses; elipseIdx++){
			pts = pts.concat(this.halfElipse(circlePos, backwardDx, dims.dy/2, Math.PI, 5));
			circlePos.movePt({dx:-2*backwardDx});
			pts = pts.concat(this.halfElipse(circlePos, forwardDx, dims.dy/2, 0, 5));
			circlePos.movePt({dx:2*forwardDx});
		}
		
		pts.push(circlePos.copy());
		pts.push(circlePos.copy().movePt({dy:200}));
		this.endX = pts[pts.length-1].x;
		this.dims = V(this.endX-this.pos.x, dims.dy);
		this.center = this.pos.copy().movePt(this.dims.copy().mult(.5));
		return pts;
	},
	halfElipse: function(start, rx, ry, rot, numPts){
		//hey - this goes UP TO the point to complete the half circle
		var numPts = defaultTo(5, numPts);
		var pts = new Array(numPts);
		var rotPerPt = Math.PI/(numPts);
		var center = start.x + rx;
		var arcRot = Math.PI;
		for (var ptIdx=0; ptIdx<numPts; ptIdx++){
			var x = center + rx*Math.cos(arcRot);
			var y = start.y + ry*Math.sin(arcRot);
			pts[ptIdx] = P(x, y);
			arcRot += rotPerPt;
		}
		rotatePts(pts, start, rot);
		return pts;
	},
	getColorSteps: function(min, def, max){
		var steps = {};
		var down = [min.r-def.r, min.g-def.g, min.b-def.b];
		var up = [max.r-def.r, max.g-def.g, max.b-def.b];
		steps['-1']=down;
		steps['1']=up;
		return steps;
	},
	init: function(wallHandleHeater, wallHandleParent){
		canvasManager.addListener(this.canvasHandle, 'drawHeater' + this.handle, this.draw, this, 1);
		this.setupWalls(wallHandleHeater)
		this.eAdded=0;
		//dotMigrator.migrateDots(dotManager.get({tag: wallHandleParent}), [wallHandleParent], [wallHandleHeater]);
	},
	setupWalls: function(wallHandleHeater){
		var handler = {func:this.hit, obj:this};
		walls.addWall({pts:this.wallPts, handler:handler, handle: wallHandleHeater, record:false, show:false});
		walls[wallHandleHeater].createSingleValDataObj('vol', function() {
			return walls.wallVolume(wallHandleHeater);
		})
	},
	wrapHit: function(tempList) {
		return function(dot, wallIdx, subWallIdx, wallUV, vPerp, perpUV) {
			walls.reflect(dot, wallUV, vPerp);
			var temp = dot.temp();
			if ((this.qRate > 0 && tempList[tempList.length - 1] < this.tempMax) || (this.qRate < 0 && tempList[tempList.length - 1] > this.tempMin)) {
				var dE = dot.addEnergy(this.qRate) * .001; //to kJ
				this.eAdded += dE;
				this.wall.q += dE;
			}
		}
	},
	setupLiquidHeat: function(liquidHandle) {
		var self = this;
		timeline.curSection().addCmmdPoint('now', 'setup', function() {
			var type = 'Liquid';
			var liquid = curLevel.selectObj(type, liquidHandle);
			if (!liquid) console.log('Bad liquid handle for heater ' + this.handle + '.  Handle ' + handle);
			liquid.heater = self;
			var liqWall = liquid.getWallLiq();
			liqWall.recordQ();
			self.liquid = liquid;		
		}, true, true) //'once' being true is fine, will be readded each time
	},
	removeLiquid: function() {
		this.liquid = undefined;
	},
	remove: function(){
		this.slider.remove();
		canvasManager.removeListener(this.canvasHandle, 'drawHeater' + this.handle)
		if (window.walls && !walls.removed) {
			walls.removeWall(this.wallHandleHeater);
		}
	}
}
)