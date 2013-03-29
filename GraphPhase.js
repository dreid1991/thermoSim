function GraphPhase(attrs) {
	this.spcAName = attrs.spcAName;
	this.spcBName = attrs.spcBName;
	this.spcA = spcs[this.spcAName];
	this.spcB = spcs[this.spcBName];
	this.constAttr = attrs.constAttr;
	this.handle = attrs.handle;
	this.actCoeffFuncs = attrs.actCoeffFuncs;
	this.pressure = pressure;
	if (!(this.spcA && this.spcB)) console.log('Bad species data for phase diagram ' + this.spcAName + ' ' + this.spcBName);
	attrs.handle += 'Scatter';
	this.graph = new GraphScatter(attrs); //passing along axisInit
	this.phaseData;
	this.updateEquilData(attrs.pressure);
	this.phaseDataHandle = this.handle + 'PhaseData';
	this.graph.addSet({handle: this.phaseDataHandle, label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false})
	
}

GraphPhase.prototype = {
	updateEquilData: function(pressure) {
		this.phaseData = phaseEquilGenerator.constP(this.spcA, this.spcB, this.actCoeffFuncs, pressure, 20);
	},
}