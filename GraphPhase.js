function GraphPhase(attrs) {
	this.spcAName = attrs.spcAName;
	this.spcBName = attrs.spcBName;
	this.spcA = spcs[this.spcAName];
	this.spcB = spcs[this.spcBName];
	this.wallGas = attrs.wallGas;
	this.liquid = attrs.liquid;
	this.constAttr = attrs.constAttr;
	this.primaryKeyType = /light/i.test(attrs.primaryKey) ? 'Light' : 'Heavy';
	this.handle = attrs.handle;
	this.actCoeffFuncs = attrs.actCoeffFuncs;
	this.pressure = 1; //Make this be specified or grab values from the wall or something//attrs.pressure;
	this.keyNamePairs = this.getKeyNamePairs(this.spcA, this.spcB, this.pressure);
	//this.primarySpcName = this.getPrimarySpcName(this.spcA, this.spcB, this.primaryKeyType, this.pressure);
	if (!(this.spcA && this.spcB)) console.log('Bad species data for phase diagram ' + this.spcAName + ' ' + this.spcBName);
	attrs.handle += 'Scatter';
	attrs.yLabel = 'Temp';
	attrs.xLabel = 'x' + this.keyNamePairs[this.primaryKeyType]; // make this a spc name
	attrs.makeReset = false;
	this.graph = new GraphScatter(attrs); //passing along axisInit
	this.equilData;
	this.updateEquilData(this.pressure);
	this.equilDataHandle = this.handle + 'PhaseData';
	this.graph.addSet({handle: this.equilDataHandle, label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false, showPts: false});
	this.recordFracData(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.recordFracData(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	var liquid = this.liquid;
	this.liqTempFunc = function(){return liquid.temp};
	this.gasTempFunc = this.makeTempFunc(this.wallGas);
	this.xFunc = this.makeFracFunc(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.yFunc = this.makeFracFunc(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	this.updateGraph();
	
	this.graph.addMarker({handle: 'liquid', col: Col(200, 0, 0), markerType: 'bullseye', x: this.xFunc, y: this.liqTempFunc});
	this.graph.addMarker({handle: 'gas', col: Col(0, 200, 0), markerType: 'bullseye', x: this.yFunc, y: this.gasTempFunc});
	
}

GraphPhase.prototype = {
	recordFracData: function(wall, spcName) {
		wall.recordFrac({spcName: spcName, tag: wall.handle})
	},
	makeTempFunc: function(wallGas) {
		var tempData = wallGas.getDataSrc('temp');
		return function() {
			return tempData[tempData.length - 1];
		}
	},
	makeFracFunc: function(wall, spcName) {
		var fracData = wall.getDataSrc('frac', {spcName: spcName, tag: wall.handle});
		return function() {
			return fracData[fracData.length - 1];
		}		
	},
	setPressure: function(pressure) {
		this.updateEquilData(pressure);
		this.updateGraph();
	},
	getKeyNamePairs: function(spcA, spcB, pressure) {
		if (spcA.tBoil(pressure) < spcB.tBoil(pressure)) {
			return {Light: spcA.spcName, Heavy: spcB.spcName};
		} else {
			return {Light: spcB.spcName, Heavy: spcA.spcName};
		}
		
	},
	updateEquilData: function(pressure) {
		var phaseData = phaseEquilGenerator.constP(this.spcA, this.spcB, this.actCoeffFuncs, pressure, 20);
		var liqPts = [];
		var gasPts = [];
		

		for (var phaseIdx=0; phaseIdx<phaseData.data.length; phaseIdx++) {
			var phaseDatum = phaseData.data[phaseIdx];
			var temp = phaseDatum.temp;
			var x = phaseDatum['x' + this.primaryKeyType];
			var y = phaseDatum['y' + this.primaryKeyType];
			liqPts.push(P(x, temp));
			gasPts.push(P(y, temp));
		}	

		this.equilData = liqPts.concat(gasPts.reverse());
		
	},
	updateGraph: function() {
		this.graph.clearData(this.equilDataHandle, false);
		this.graph.enqueueData(this.equilDataHandle, this.equilData);
		this.graph.updateRange();
		this.graph.drawAllData();
	},
}