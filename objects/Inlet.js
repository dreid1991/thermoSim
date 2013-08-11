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
	//flows as [{spcName: , nDotMax: }]
function Inlet (attrs) {
	//flow has {spcName, handle, nDotMax}
	//have sliderGrps attrs: list of {handle: '', flowHandles: [], title: '', fracOpen: 0<1}
	//if not frac open is specified by binding a flow to a slider, it will be 1
	this.arrowDims = V(15, 20);
	this.arrowFill = Col(200, 0, 0);
	this.arrowStroke = Col(100, 100, 100);
	this.type = 'Inlet';
	this.temp = attrs.temp; 
	if (!this.temp) console.log('No/zero temperature sent to inlet ' + this.handle);
	//temp slider?
	this.handle = attrs.handle;
	this.width = defaultTo(30, attrs.width);
	this.depth = defaultTo(20, attrs.depth);
	this.makePts = Boolean(this.depth);
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.dotTag = attrs.tag || this.wall.handle;
	this.dotReturnTo = attrs.returnTo || this.wall.handle;
	this.ptIdxs = attrs.ptIdxs;
	this.fracOffset = defaultTo(.5, attrs.fracOffset); 
	this.flows = this.processFlows(attrs.flows);
	this.flowGroupSliders = this.addFlowSliders(attrs.sliders, this.flows);
	this.tempSlider = undefined;
	if (attrs.makeTempSlider) {
		this.tempMin = attrs.tempMin;
		this.tempMax = attrs.tempMax;
		this.tempSlider = this.addTempSlider(attrs.tempMin, attrs.tempMax, attrs.temp, attrs.tempSliderTitle || 'Inlet temp');
	}
	// this.makeSlider = defaultTo(true, attrs.makeSlider);
	
	// if (this.makeSlider) {
		// this.slider = sliderManager.addSlider(attrs.title || 'Flow rate', this.handle + 'Slider',  {value: this.fracOpen*100},
			// [{eventType:'slide', obj:this, func:this.parseSlider}],
		// attrs.sliderIdx
		// )
	// }
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
		this.makeInlet(inletLine, this.flows, this.dotTag, this.dotReturnTo);
	},

	processFlows: function(flows) {
		var procdFlows = [];
		for (var flowIdx=0; flowIdx<flows.length; flowIdx++) {
			var flow = flows[flowIdx];
			procdFlows.push(new Inlet.Flow(flow.spcName, flow.nDotMax * 1000 / updateInterval, flow.handle));
		}
		return procdFlows;
	},
	parseSlider: function(event, ui){
		this.fracOpen = ui.value / 100;
	},
	addFlowSliders: function(attrSliders, flows) {
		var sliders = [];
		for (var i=0; i<attrSliders.length; i++) {
			var attrSlider = attrSliders[i];
			var sliderFlowHandles = attrSlider.flowHandles;
			var sliderFlows = this.pluckFlows(flows, sliderFlowHandles);
			var handle = attrSlider.handle;
			var title = attrSlider.title;
			var fracOpen = attrSlider.fracOpen;
			var sliderIdx = attrSlider.sliderIdx;
			var sliderGroup = new Inlet.FlowGroupSlider(title, handle, sliderFlows);
			var slider = sliderManager.addSlider(title, this.handle + 'Slider' + handle.toCapitalCamelCase(),  {value: fracOpen*100},
				[{eventType:'slide', obj: sliderGroup, func: sliderGroup.parseSlider}],
			undefined
			)
			sliderGroup.slider = slider;
			sliders.push(sliderGroup);
		}
		return sliders;
	},
	addTempSlider: function(min, max, init, title) {
		if (typeof min != 'number' || typeof max != 'number') console.log('Making heater ' + this.handle + ' temp slider without tempMin or tempMax');
		
		init = Math.min(Math.max(min, init), max);
		return sliderManager.addSlider(title, this.handle + 'TempSlider', {value: 100 * this.tempToFrac(min, max, init)},
			[{eventType: 'slide', obj: this, func: this.parseTempSlider}],
		undefined
		)
		
	},
	setFracOpen: function(sliderHandle, fracOpen) {
		var slider = this.getSlider(sliderHandle);
		if (slider) slider.setFracOpenExternal(bound(fracOpen, 0, 1));
	},
	parseTempSlider: function(event, ui) {
		this.setTemp(this.fracToTemp(this.tempMin, this.tempMax, ui.value / 100), false);
	},
	setTemp: function(temp, setSlider) {
		this.temp = bound(temp, this.tempMin, this.tempMax);
		if (setSlider !== false && this.tempSlider) {
			this.tempSlider.slider.slider('value', 100 * this.tempToFrac(this.tempMin, this.tempMax, temp));
		}
	},
	fracToTemp: function(min, max, frac) {
		return min + (max - min) * frac;
	},
	tempToFrac: function(min, max, temp) {
		return (temp - min) / (max - min);
	},
	pluckFlows: function(flows, flowHandles) {
		var plucked = [];
		for (var i=0; i<flowHandles.length; i++) {
			var flow = _.find(flows, function(flow) {return flow.handle == flowHandles[i]});
			flow ? plucked.push(flow) : console.log('Could not find flow ' + flowHandles[i] + ' for inlet slider');
		}
		return plucked;
	},
	getSlider: function(handle) {
		for (var i=0; i<this.flowGroupSliders.length; i++) {
			if (this.flowGroupSliders[i].handle == handle) return this.flowGroupSliders[i];
		}
		return false;
	},
	makeInlet: function(inletLine, flows, dotTag, dotReturnTo) {
		var inletPos = inletLine.pos;
		var inletVec = inletLine.vec;
		var inletDir = inletLine.dir;
		var dotBank = new Array(flows.length);
		var returnTo = this.returnTo;
		var flowLen = flows.length;
		for (var i=0; i<dotBank.length; i++) dotBank[i] = 0;
		addListener(curLevel, 'update', this.type + this.handle, function() {
			for (var flowIdx=0; flowIdx<flowLen; flowIdx++) {
				var flow = flows[flowIdx];
				dotBank[flowIdx] += flow.fracOpen * flow.nDotMax;
				var toMake = Math.floor(dotBank[flowIdx])
				if (toMake) {
					var newDots = [];
					for (var makeIdx=0; makeIdx<toMake; makeIdx++) {
						var rnd = Math.random();
						var pos = P(inletPos.x + inletVec.dx * rnd, inletPos.y + inletVec.dy * rnd);
						newDots.push({pos: pos, dir: inletDir, temp: this.temp, returnTo: dotReturnTo, tag: dotTag})
						
					}
					flow.spc.place(newDots);
					dotBank[flowIdx] -= toMake;
				}
			}
		}, this) 
	},
	remove: function() {
		for (var i=0; i<this.flowGroupSliders.length; i++) 	this.flowGroupSliders[i].slider.remove();
		for (var i=0; i<this.arrows.length; i++) 			this.arrows[i].remove();
		if (this.tempSlider) 								this.tempSlider.remove();
		removeListener(curLevel, 'update', this.type + this.handle);
	
	}


})

Inlet.Flow = function(spcName, nDotMax, handle) {
	this.spcName = spcName;
	this.spc = window.spcs[spcName];
	this.nDotMax = nDotMax;
	this.handle = handle;
	this.fracOpen = 1;
}

Inlet.FlowGroupSlider = function(title, handle, flows) {
	this.title = title;
	this.handle = handle;
	this.slider = undefined;
	this.flows = flows;
}

Inlet.FlowGroupSlider.prototype = {
	parseSlider: function(event, ui) {
		this.setFracOpen(ui.value / 100);
	},
	setFracOpen: function(fracOpen) {
		var flows = this.flows;
		for (var i=0; i<flows.length; i++) {
			flows[i].fracOpen = fracOpen;
		}
	},
	setFracOpenExternal: function(fracOpen) {
		this.setFracOpen(fracOpen);
		this.slider.slider.slider('value', fracOpen * 100); 
		//I am so sorry.  it's the slider member of the flow group slider class, which is a slider manager slider, which has a slider attribute, which is the actual slider, which has a slider method
	}
}