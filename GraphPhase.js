function GraphPhase(attrs) {
	this.spcAName = attrs.spcAName;
	this.spcBName = attrs.spcBName;
	this.spcA = spcs[this.spcAName];
	this.spcB = spcs[this.spcBName];
	this.constAttr = attrs.constAttr;
	this.primaryKeyName = attrs.primaryKeyName || 'Heavy';
	this.handle = attrs.handle;
	this.actCoeffFuncs = attrs.actCoeffFuncs;
	this.pressure = pressure;
	if (!(this.spcA && this.spcB)) console.log('Bad species data for phase diagram ' + this.spcAName + ' ' + this.spcBName);
	attrs.handle += 'Scatter';
	this.graph = new GraphScatter(attrs); //passing along axisInit
	this.equilData;
	this.updateEquilData(attrs.pressure);
	this.equilDataHandle = this.handle + 'PhaseData';
	this.graph.addSet({handle: this.equilDataHandle, label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false, drawPts: false});
	this.updateGraph();
	
}

GraphPhase.prototype = {
	updateEquilData: function(pressure) {
		var phaseData = phaseEquilGenerator.constP(this.spcA, this.spcB, this.actCoeffFuncs, pressure, 20);
		var liqPts = [];
		var gasPts = [];
		var primaryKey;
		if (this.primaryKeyName == phaseData.keyHeavy) {
			primaryKey = 'Heavy';
		} else if (this.primaryKeyName == phaseData.keyLight) {
			primaryKey = 'Light';
		}
		var phaseIdx;
		for (phaseIdx=0; phaseIdx<phaseData.data.length; phaseIdx++) {
			var phaseDatum = phaseData.data[phaseIdx];
			var temp = phaseDatum.temp;
			var x = phaseDatum['x' + primaryKey];
			var y = phaseDatum['y' + primaryKey];
			liqPts.push(P(x, temp));
			gasPts.push(P(y, temp));
		}
		this.equilData = liqPts.concat(gasPts.reverse());
		
	},
	updateGraph: function() {
		this.graph.setData(this.equilDataHandle, this.equilData);
		this.graph.drawAllData();
	},
}