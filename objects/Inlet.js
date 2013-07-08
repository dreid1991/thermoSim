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

	//wallInfo, flows(array), ptIdxs, fracOffset, makeSlider, fracOpen
	//flows as [{spcName: , nDotMax: , temp: }]
function Inlet (attrs) {
	this.arrowDims = V(15, 20);
	this.arrowFill = Col(200, 0, 0);
	this.arrowStroke = Col(100, 100, 100);
	this.type = 'Inlet';
	this.handle = attrs.handle;
	this.width = defaultTo(30, attrs.width);
	this.depth = defaultTo(20, attrs.depth);
	this.fracOpen = defaultTo(1, attrs.fracOpen);
	//if depth is 0, just have it not add any pointsa
	this.makePts = this.depth;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset);
	this.flows = this.processFlows(attrs.flows);
	this.makeSlider = defaultTo(true, attrs.makeSlider);
	if (this.makeSlider) {
		this.slider = sliderManager.addSlider('Flow rate', this.handle + 'Slider',  {value: this.fracOpen*100},
			[{eventType:'slide', obj:this, func:this.parseSlider}],
		attrs.sliderIdx
		)
	}
	this.setupStd();
	this.arrows = [];
	this.init();
	
}

_.extend(Inlet.prototype, flowFuncs, objectFuncs, {
	init: function() {
		this.addPts();
		
		//add pts to wall, need to figure out handler.  I guess use the one for pt a
		//make wall check if any adjacent points are equal, splice out if they are (to deal with depth == 0 case)
		if (this.makePts) {
			this.wall.addPts(this.ptIdxs[1], this.pts);
		}
		var inletLine = {pos: this.pts[1].copy(), vec: this.pts[1].VTo(this.pts[2]), dir: this.perp.copy()};
		this.arrows = this.addArrows(this.pts[1].VTo(this.pts[2]).UV().perp('ccw'));
		this.makeInlet(inletLine, this.flows);
	},


	processFlows: function(flows) {
		var procdFlows = [];
		for (var flowIdx=0; flowIdx<flows.length; flowIdx++) {
			var flow = flows[flowIdx];
			procdFlows.push({spc: spcs[flow.spcName], temp: flow.temp, nDotMax: flow.nDotMax, returnTo: this.wallInfo, tag: flow.tag})
			procdFlows[procdFlows.length-1].nDotMax *= 1000 / updateInterval;
		}
		return procdFlows;
	},
	parseSlider: function(event, ui){
		this.fracOpen = ui.value / 100;
	},
	makeInlet: function(inletLine, flows) {
		var inletPos = inletLine.pos;
		var inletVec = inletLine.vec;
		var inletDir = inletLine.dir;
		var dotBank = new Array(flows.length);
		var flowLen = flows.length;
		for (var i=0; i<dotBank.length; i++) dotBank[i] = 0;
		addListener(curLevel, 'update', this.type + this.handle, function() {
			for (var flowIdx=0; flowIdx<flowLen; flowIdx++) {
				var flow = flows[flowIdx];
				dotBank[flowIdx] += this.fracOpen * flow.nDotMax;
				var toMake = Math.floor(dotBank[flowIdx])
				if (toMake) {
					var newDots = [];
					for (var makeIdx=0; makeIdx<toMake; makeIdx++) {
						var rnd = Math.random();
						var pos = P(inletPos.x + inletVec.dx * rnd, inletPos.y + inletVec.dy * rnd);
						newDots.push({pos: pos, dir: inletDir, temp: flow.temp, returnTo: flow.returnTo, tag: flow.tag})
						
					}
					flow.spc.place(newDots);
					dotBank[flowIdx] -= toMake;
				}
			}
		}, this) //maybe context should be this.  Will see if it's needed
	},
	remove: function() {
		if (this.slider) {
			this.slider.remove();
		}
		this.arrows.map(function(arrow){arrow.remove()});
		removeListener(curLevel, 'update', this.type + this.handle);
	
	}


})