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
	this.inletDepth = Math.max(defaultTo(attrs.inletDepth, 20), 20);
	this.outletDepth = Math.max(defaultTo(attrs.outletDepth, 20), 20);
	this.flowWidth = Math.max(defaultTo(30, attrs.width), 30);
	this.flowSpacing = 35
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
	this.pControlListenerHandler = undefined;
	if (attrs.makeTempSlider) {
		this.willMakeTempSlider = true;
		this.tempSliderTitle = attrs.tempSliderTitle || 'Inlet temp';
		//this.tempSlider = this.addTempSlider(attrs.tempMin, attrs.tempMax, attrs.temp, attrs.tempSliderTitle || 'Inlet temp'); figure out later
	}
	this.pSetPt = attrs.pressure;
	this.attrSliders = attrs.sliders;
	this.attrFlows = attrs.flows;
	this.setupStd();
	this.flowsBySpc = {};
	this.compositions = this.recordCompositions(this.wall);
	this.init();	
}

_.extend(CompositionController.prototype, objectFuncs, flowFuncs, {

	init: function() {
		this.tileWallSegments(this.wall, this.segmentIdxs, this.inletDepth, this.outletDepth, this.flowWidth, this.flowSpacing, this.attrFlows, this.temp, this.tempMin, this.tempMax, this.inlets, this.outlets);	
		this.scaleInletFlows(this.inlets);
		if (this.willMakeTempSlider) this.tempSlider = this.addTempSlider(this.tempSliderTitle); //making temp slider be state-y so you can change bounds easily
		//giving the flows from all the inlets to the sliders.  This way sliders for comp controller and normal inlet work the same way
		var allFlows = this.getAllFlows(this.inlets);
		this.populateFlowsBySpc(this.flowsBySpc, allFlows);
		this.flowGroupSliders = this.addFlowSliders(this.attrSliders || [], allFlows);
		if (this.pSetPt) {
			this.pControlListenerHandle = this.initPressureControl(this.wall, allFlows);
		}
	},
	initPressureControl: function(wall, allFlows) {
		//doing pressure control without using pFloor of outlets.  Might settle into very low flow rates if using pFloor, and that is not what I want
		var listenerHandle = this.handle + 'PressureControl';
		var tempList = this.wall.getDataSrc('temp');
		var dots = dotManager.get({tag: wall.handle});
		var volList = this.wall.getDataSrc('vol');
		var pList = this.wall.getDataSrc('pInt');
		var timeConst = 5; //not strictly speaking a time constant, but it will scale the time it takes to respond
		var containedWalls = wall.containedWalls;
		addListener(curLevel, 'data', listenerHandle, function() {
			var pressure = averageLast(pList, 60)
			var setPt = this.pSetPt;
			var correctBy = (setPt / pressure + timeConst) / (1 + timeConst);
			for (var i=0; i<allFlows.length; i++) {
				allFlows[i].scalar *= correctBy;
			}
		}, this)
		return listenerHandle
	},
	recordCompositions: function(wall) {
		var fracs = {};
		for (var a in spcs) {
			fracs[a] = wall.recordFrac({spcName: a, tag: wall.handle}).src();
		}
		return fracs;
	},
	initCompControl: function(setPts) {
		var sum = 0;
		for (var a in setPts) sum += setPts[a];
		if (a > 1) for (var a in setPts) setPts[a] *= 1/sum;
		var comps = this.compositions;
		var timeConst = 5;
		var flowsBySpc
		this.compComtrolHandle = 'controlComp' + this.handle.toCapitalCamelCase();
		var flowsBySpc = this.flowsBySpc;
		//pressure control is happening at the same time, so hopefully we can control both total flow and composition
		addListener(curLevel, 'data', handle, function() {
			for (var a in setPts) {
				var comp = comps[a][comps[a].length - 1];
				var dComp = setPts[a] - comp;
				var flows = flowsBySpc[a];
				var correctBy = (setPts[a] / comp + timeConst) / (1 + timeConst)
				if (correctBy != Infinity) {
					for (var i=0; i<flows.length; i++) {
						flows[i].fracOpen *= correctBy;
					}
				} else {
					for (var i=0; i<flows.length; i++) {
						flows[i].fracOpen += setPts[a]; //just getting it started, could probably make more educated guess 
					}
				}
			}
		}, this)
	},
	addTempSlider: function(title) {
		if (typeof this.tempMin != 'number' || typeof this.tempMax != 'number') console.log('Making heater ' + this.handle + ' temp slider without tempMin or tempMax');
		return sliderManager.addSlider(title, this.handle + 'TempSlider', {value: 100 * this.tempToFrac(this.tempMin, this.tempMax, this.temp)},
			[{eventType: 'slide', obj: this, func: this.parseTempSlider}],
		undefined
		)
	},
	setControl: function(controlType, setPts) {
		if (/slider/i.test(controlType)) {
			this.enableSliders();
			//stop auto control
		} else if (/(comp|auto)/i.test(controlType)) {
			this.compControllerHandle = this.initCompControl(setPts);
		}
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
	getAllFlows: function(inlets) {
		var flows = [];
		for (var i=0; i<inlets.length; i++) {
			flows = flows.concat(inlets[i].flows);
		}
		return flows;
	},
	populateFlowsBySpc: function(flowsBySpc, allFlows) {
		for (var a in spcs) flowsBySpc[a] = [];
		for (var i=0; i<allFlows.length; i++) {
			flowsBySpc[allFlows[i].spcName].push(allFlows[i]);
		}
		
	},
	remove: function() {
		for (var i=0; i<this.inlets.length; i++) this.inlets[i].remove();
		for (var i=0; i<this.outlets.length; i++) this.outlets[i].remove();
		if (this.tempSlider) this.tempSlider.remove();
		removeListener(curLevel, 'data', this.pControlListenerHandle);
		for (var i=0; i<this.flowGroupSliders.length; i++) this.flowGroupSliders[i].slider.remove();
		this.inlets = [];
		this.outlets = [];
	}	
})
