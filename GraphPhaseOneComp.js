function GraphPhaseOneComp(attrs) {
//({spcName: spcAName, axisInit: axisInit, handle: handle, liquid: this, wallGas: this.wallGas, makeSystemMarker: makeSystemMarker}
	this.spcName = attrs.spcName;
	this.spc = spcs[this.spcName];
	this.wallGas = attrs.wallGas;
	this.liquid = attrs.liquid;
	this.handle = attrs.handle;
	this.pressure = attrs.pressure || 1;
	attrs.axesFixed = {x: true, y: true};
	//for now, only allowing axes x -> temp, y -> pressure
	attrs.numGridLines = {x: 6};
	attrs.xLabel = 'Temperature';
	attrs.yLabel = 'Pressure';
	attrs.makeReset = false;
	this.graph = new GraphScatter(attrs); //passing along axisInit
	this.equilDataSets = undefined;
	this.updateEquilData();
	this.equilDataHandles = this.makeEqDataHandles(this.equilDataSets, this.handle);
	this.addEqDataSets(this.graph, this.equilDataSets, this.equilDataHandles);
	var liquid = this.liquid;
	this.tempFunc = this.makeTempFunc(this.wallGas, this.liquid)
	this.updateGraph();
	this.active = false;
	// if (defaultTo(true, attrs.makeLiquidMarker)) {
		// this.makeLiquidMarker();
	// }
	// if (defaultTo(true, attrs.makeSystemMarker)) {
		// this.makeSystemMarker();
	// }
	// if (defaultTo(true, attrs.makeGasMarker)) {
		// this.makeGasMarker();
	// }
	this.graph.hasData = true;
}

GraphPhaseOneComp.prototype = {
	addEqDataSets: function(graphs, equilDataSets, equilDataHandles) {
		for (var i=0; i<equilDataSets.length; i++) {
			this.graph.addSet({handle: this.equilDataHandles[i], label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false, showPts: false});	
		}
	},
	updateEquilData: function() {
		this.equilDataSets = phaseEquilGenerator.oneComp.equilData(this.spcName, 300, 400, 200, false);
	},
	makeTempFunc: function(wallGas, liquid) {
		var gasTempData = wallGas.getDataSrc('temp');
		return function() {
			var liqCp = liquid.Cp;
			var gasCp = wallGas.getCv();
			return (gasTempData[gasTempdata.length - 1] * gasCp + liquid.temp * liqCp) / (gasCp + liqCp);         
		}
	},
	updateGraph: function() {
		for (var i=0; i<this.equilDataSets.length; i++) {
			this.graph.clearData(this.equilDataHandles[i], false);
			this.graph.enqueueData(this.equilDataHandles[i], this.equilDataToPoints(this.equilDataSets[i]));
		}
		this.graph.updateRange();
		this.graph.drawAllData();
	},
	setPressure: function() {
	
	},
	makeEqDataHandles: function(eqData, graphHandle) {
		var handles = [];
		for (var i=0; i<eqData.length; i++) {
			handles.push(graphHandle + 'PhaseDataSet' + i);
		}
		return handles;
	},
	equilDataToPoints: function(equilData) {
		var pts = [];
		for (var i=0; i<equilData.length; i++) {
			pts.push(P(equilData[i].temp, equilData[i].pressure));
		}
		return pts;
	},
}