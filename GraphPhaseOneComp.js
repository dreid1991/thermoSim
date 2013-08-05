function GraphPhaseOneComp(attrs) {
//({spcName: spcAName, axisInit: axisInit, handle: handle, liquid: this, wallGas: this.wallGas, makeSystemMarker: makeSystemMarker}
	this.spcName = attrs.spcName;
	this.spc = spcs[this.spcName];
	this.wallGas = attrs.wallGas;
	this.liquid = attrs.liquid;
	this.handle = attrs.handle;
	this.pressure = attrs.pressure || 1;
	attrs.axesFixed = {x: false, y: false};
	//for now, only allowing axes x -> temp, y -> pressure
	attrs.numGridLines = {x: 6};
	attrs.xLabel = 'Temperature';
	attrs.yLabel = 'Pressure ' + this.spcName;
	attrs.makeReset = false;
	this.equilDataSets = undefined;
	this.triplePointTemp = attrs.triplePointTemp;
	this.criticalPointTemp = attrs.criticalPointTemp;
	this.updateEquilData();
	var yMin = this.getYMin(this.equilDataSets);
	var yMax = this.getYMax(this.equilDataSets);
	var orderOfMagRange = this.getOrderOfMagRange(yMin, yMax);
	attrs.numGridLines = defaultTo({}, attrs.numGridLines);
	attrs.numGridLines.y = orderOfMagRange + 1;
	attrs.axisInit.y = {min: Math.pow(10, Math.floor(Math.log(yMin) / Math.LN10)), step: 1}; //step doesn't matter for log plot
	attrs.logScale = {y: true};
	this.graph = new GraphScatter(attrs); //passing along axisInit
	
	this.equilDataHandles = this.makeEqDataHandles(this.equilDataSets, this.handle);
	this.addEqDataSets(this.graph, this.equilDataSets, this.equilDataHandles);
	var liquid = this.liquid;
	this.tempFunc = this.makeTempFunc(this.wallGas, this.liquid)
	this.pressureFunc = this.makePressureFunc(this.wallGas, this.spcName);
	this.updateGraph();
	this.active = false;
	if (defaultTo(true, attrs.makeSystemMarker)) {
		this.makeMarker();
	}
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
	makeMarker: function() {
		this.graph.addMarker({handle: 'system', col: Col(200, 0, 0), markerType: 'bullseye', x: this.tempFunc, y: this.pressureFunc, label: 'System'});
	},
	
	updateEquilData: function() {
		this.equilDataSets = phaseEquilGenerator.oneComp.equilData(this.spcName, this.triplePointTemp, this.criticalPointTemp, this.triplePointTemp - 25, false);
	},
	getYMin: function(dataSets) {
		var min = Number.MAX_VALUE;
		for (var i=0; i<dataSets.length; i++) {
			var set = dataSets[i];
			for (var j=0; j<set.length; j++) {
				min = Math.min(set[j].pressure, min);
			}
		}
		return min;
	},
	getYMax: function(dataSets) {
		var max = Number.MIN_VALUE;
		for (var i=0; i<dataSets.length; i++) {
			var set = dataSets[i];
			for (var j=0; j<set.length; j++) {
				max = Math.max(set[j].pressure, max);
			}
		}
		return max;	
	},
	getOrderOfMagRange: function(yMin, yMax) {
		return Math.ceil(Math.log(yMax) / Math.LN10) - Math.floor(Math.log(yMin) / Math.LN10);
	},
	makePressureFunc: function(wallGas, spcName) {
		// oy - composition.  RECORD IT
		var fracDataObj = wallGas.recordFrac({spcName: spcName, tag: wallGas.handle});
		var fracDataSrc = fracDataObj.src();
		var pExtList = wallGas.getDataSrc('pExt', undefined, true);
		var pList = pExtList !== false ? pExtList : wallGas.getDataSrc('pInt', undefined, true);
		return function() {
			var sum = 0;
			for (var i=Math.max(0, pList.length - 30); i<pList.length; i++) {
				sum += pList[i];
			}
			if (fracDataSrc[fracDataSrc.length - 1]) {
				var molFrac = fracDataSrc[fracDataSrc.length - 1];
			} else {
				var molFrac = 1;
			}
			var pAvg = sum / Math.min(pList.length, 30) * molFrac;
			return pAvg;
		}
		
	},
	makeTempFunc: function(wallGas, liquid) {
		var gasTempData = wallGas.getDataSrc('temp');
		return function() {
			var liqCp = liquid.Cp;
			var gasCp = wallGas.getCv();
			return (gasTempData[gasTempData.length - 1] * gasCp + liquid.temp * liqCp) / (gasCp + liqCp);         
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