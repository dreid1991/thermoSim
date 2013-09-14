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
	this.flowWidth = 30;
	this.flowSpacing = 4;
	this.wallInfo = attrs.wallInfo;
	this.wall = walls[this.wallInfo];
	this.inlets = [];
	this.outlets = [];
	if (attrs.makeTempSlider) {
	
	}
	this.temp = attrs.inletTemp; 
	if (!this.temp) console.log('No/zero temperature sent to inlet ' + this.handle);
	this.segmentIdxs = attrs.ptIdxs; //list of all walls to cover, including last one
	var attrFlows = attrs.flows;
	//this.flowGroupSliders = this.addFlowSliders(attrs.sliders || [], this.flows); figure this out later
	this.tempSlider = undefined;
	this.tempMin = attrs.tempMin;
	this.tempMax = attrs.tempMax;
	if (attrs.makeTempSlider) {
		//this.tempSlider = this.addTempSlider(attrs.tempMin, attrs.tempMax, attrs.temp, attrs.tempSliderTitle || 'Inlet temp'); figure out later
	}
	
	this.tileWallSegments(this.wall, this.segmentIdxs, this.inletDepth, this.outletDepth, this.flowWidth, this.flowSpacing, attrFlows, this.temp, this.tempMin, this.tempMax, this.inlets, this.outlets);
	this.setupStd();
	this.init();	
}

_.extend(ConpositionController.prototype, objectFuncs, flowFuncs, {
	tileWallSegments: function(wall, segmentIdxs, inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets) {
		//so ORBVIOUSLY I should start at the end and work to the front
		for (var i=segmentIdxs.length-1; i>=0; i--) {
			this.tileWallSegment(wall, segmentIdxs[i], inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets);
		}
	},
	tileWallSegment: function(wall, segmentIdx, inletDepth, outletDepth, flowWidth, flowSpacing, attrFlows, temp, tempMin, tempMax, inlets, outlets) {
		var distInit = wall[segmentIdx].distTo(wall[segmentIdx + 1]);
		var numHoles = Math.floor((dist - flowSpacing)/ (flowWidth + flowSpacing))//a hole being an inlet or an outlet, I guess.  Flows is sort of used
		var edgeSpacing = (distInit - numHoles * flowWidth + (numHoles - 1) * flowSpacing) / 2;
		//wall is shinking as I add more, so need to be tricky about calculating fracOffset
		//also, fracOffset references the center of the flow
		for (var i=0; i<numHoles; i++) {
			//need to put in terms for inlet/outlet attrs
			flowCenterAlongInit = distInit - edgeSpacing - i * (flowWidth + flowSpacing) - flowWidth * .5;
			var distCur = wall[segmentIdx].distTo(wall[segmentIdx + 1]);
			var fracOffset = flowCenterAlongInit / distCur;
			var handle = this.handle + 'Wall' + wall.handle + 'Segment' + segmentIdx + 'Flow' + i;
			
			if (i % 2) 
				this.inlets.push(new Inlet({handle: handle, addArrows: false, temp: temp, tempMin: tempMin, tempMax: tempMax, flows: attrFlows, width: flowWidth, depth: inletDepth}));
			else 
				this.outlets.push(new Outlet({handle: handle, width: flowWidth, depth: outletDepth, 
			
		}
	},
})
