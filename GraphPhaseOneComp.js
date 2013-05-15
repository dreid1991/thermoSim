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
	this.equilData;
	this.updateEquilData();
	this.equilDataHandle = this.handle + 'PhaseData';
	this.graph.addSet({handle: this.equilDataHandle, label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false, showPts: false});
	this.recordFracData(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.recordFracData(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	var liquid = this.liquid;
	this.liqTempFunc = function(){return liquid.temp};
	this.gasTempFunc = this.makeTempFunc(this.wallGas);
	this.yFuncKillLow = this.makeFracFunc(this.wallGas, this.keyNamePairs[this.primaryKeyType], true);
	this.yFunc = this.makeFracFunc(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.xFuncKillLow = this.makeFracFunc(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType], true);
	this.xFunc = this.makeFracFunc(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	this.updateGraph();
	this.active = false;
	if (defaultTo(true, attrs.makeLiquidMarker)) {
		this.makeLiquidMarker();
	}
	if (defaultTo(true, attrs.makeSystemMarker)) {
		this.makeSystemMarker();
	}
	if (defaultTo(true, attrs.makeGasMarker)) {
		this.makeGasMarker();
	}
	this.graph.hasData = true;
}

GraphPhaseOneComp.prototype = {
	updateEquilData: function() {
		phaseEquilGenerator.oneComp.equilData(this.spcName, 100, 400, false);
	},
}