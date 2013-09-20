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

function CompositionController(attrs) {
	this.type = 'CompositionController';
	this.handle = attrs.handle;
	this.inletDepth = attrs.inletDepth;
	this.outletDepth = attrs.outletDepth;
	this.flowWidth = defaultTo(30, attrs.width);
	this.flowSpacing = 18;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.inlets = [];
	this.outlets = [];
	
	this.temp = attrs.temp; 
	if (!this.temp) console.log('No/zero temperature sent to inlet ' + this.handle);
	this.segmentIdxs = this.capPtIdxs(_.sortBy(attrs.ptIdxs, function(a) {return a}), this.wall); //list of all wall segments to cover, including last one
	//this.flowGroupSliders = this.addFlowSliders(attrs.sliders || [], this.flows); figure this out later
	this.tempSlider = undefined;
	this.tempMin = attrs.tempMin;
	this.tempMax = attrs.tempMax;
	if (attrs.makeTempSlider) {
		this.willMakeTempSlider = true;
		this.tempSliderTitle = attrs.tempSliderTitle || 'Inlet temp';
		//this.tempSlider = this.addTempSlider(attrs.tempMin, attrs.tempMax, attrs.temp, attrs.tempSliderTitle || 'Inlet temp'); figure out later
	}
	this.attrFlows = attrs.flows;
	this.setupStd();
	this.init();	
}

_.extend(CompositionController.prototype, objectFuncs, flowFuncs, {
	capPtIdxs: function(ptIdxs, wall) {
		var maxPtIdx = wall.length - 2;
		for (var i=0; i<ptIdxs.length; i++) {
			if (ptIdxs[i] > maxPtIdx) {
				ptIdxs.splice(i, 1);
				i--;
			}
		}
		return ptIdxs;
	},
	init: function() {
		this.tileWallSegments(this.wall, this.segmentIdxs, this.inletDepth, this.outletDepth, this.flowWidth, this.flowSpacing, this.attrFlows, this.temp, this.tempMin, this.tempMax, this.inlets, this.outlets);	
		this.scaleInletFlows(this.inlets);
		if (this.willMakeTempSlider) this.tempSlider = this.addTempSlider(this.tempSliderTitle); //making temp slider be state-y so you can change bounds easily
		//this.addSliders(this.inlets, this.makeTempSlider, 
	},
	addTempSlider: function(title) {
		if (typeof this.tempMin != 'number' || typeof this.tempMax != 'number') console.log('Making heater ' + this.handle + ' temp slider without tempMin or tempMax');
		return sliderManager.addSlider(title, this.handle + 'TempSlider', {value: 100 * this.tempToFrac(this.tempMin, this.tempMax, this.temp)},
			[{eventType: 'slide', obj: this, func: this.parseTempSlider}],
		undefined
		)
	},
	parseTempSlider: function(event, ui) {
		for (var i=0; i<this.inlets.length; i++) {
			this.inlets[i].parseTempSlider(event, ui);
		}
	},
	scaleInletFlows: function(inlets) {
		var scaleFunc = function(flow) {
			flow.nDotMax /= inlets.length;
		}
		for (var i=0; i<inlets.length; i++) {
			inlets[i].modifyFlows(scaleFunc, undefined);
		}
	},
	tileWallSegments: function(wall, segmentIdxs, inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets) {
		//so ORBVIOUSLY I should start at the end and work to the front
		for (var i=segmentIdxs.length-1; i>=0; i--) {
			this.tileWallSegment(wall, segmentIdxs[i], inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets);
		}
	},
	tileWallSegment: function(wall, segmentIdx, inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets) {
		var distInit = wall[segmentIdx].distTo(wall[segmentIdx + 1]);
		var numHoles = Math.floor((distInit - flowSpacing)/ (flowWidth + flowSpacing))//a hole being an inlet or an outlet, I guess.  Flows is sort of used
		var edgeSpacing = (distInit - numHoles * flowWidth - (numHoles - 1) * flowSpacing) / 2;
		//wall is shinking as I add more, so need to be tricky about calculating fracOffset
		//also, fracOffset references the center of the flow
		for (var i=0; i<numHoles; i++) {
			//need to put in terms for inlet/outlet attrs
			var flowCenterAlongInit = distInit - edgeSpacing - i * (flowWidth + flowSpacing) - flowWidth * .5;
			var distCur = wall[segmentIdx].distTo(wall[segmentIdx + 1]);
			var fracOffset = flowCenterAlongInit / distCur;
			var handle = this.handle + 'Wall' + wall.handle + 'Segment' + segmentIdx + 'Flow' + i;
			
			if (i % 2) 
				this.inlets.push(new Inlet({handle: handle, wallInfo: wall.handle, ptIdxs: [segmentIdx, segmentIdx + 1], addArrows: false, temp: temp, tempMin: tempMin, tempMax: tempMax, flows: attrFlows, width: flowWidth, depth: inletDepth, fracOffset: fracOffset}));
			else 
				this.outlets.push(new Outlet({handle: handle, wallInfo: wall.handle, ptIdxs: [segmentIdx, segmentIdx + 1], width: flowWidth, depth: outletDepth, fracOffset: fracOffset}));
			
		}
	},
	remove: function() {
		for (var i=0; i<this.inlets.length; i++) this.inlets[i].remove();
		for (var i=0; i<this.outlets.length; i++) this.outlets[i].remove();
		this.inlets = [];
		this.outlets = [];
	}	
})
