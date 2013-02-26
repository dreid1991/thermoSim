function WorkTracker(handle, height, width, mass, g, readoutData, obj){
	this.handle = handle;
	this.height = height;
	this.width = width;
	this.mass = mass;
	this.g = g;
	this.work = 0;
	this.readout = readoutData.readout;
	this.readout.addEntry('work', 'Work:', 'kJ', 0, readoutData.idx, 1);
	this.heightLast = this.height();
	if(obj){
		addListener(obj, 'reset', 'workTracker'+this.handle, this.reset, this);
	}
}
WorkTracker.prototype = {

	/*
	YOUR ATTENTION PLEASE:
	I made it so work tracker is based on heights and widths, not volumes.
	To track, compression must happen from the top.
	*/
	updateVal: function(){
		var heightCur = this.height();
		var p = ATMtoPA*pConst*this.mass()*this.g()/this.width;
		var dV = LtoM3*vConst*(this.heightLast-heightCur)*this.width;
		this.work -= JtoKJ*p*dV;
		this.heightLast = heightCur;
		this.readout.hardUpdate(this.work, 'work');
	},
	updateReadout: function(){
		//this.readout.tick(this.work, 'work');
	},
	reset: function(){
		//addListener(curLevel, 'update', 'workTracker', this.updateVal, this);
		this.work=0;
		this.heightLast = this.height();
	},
	start: function(){

		addListener(curLevel, 'update', 'workTracker' + this.handle, this.updateVal, this);
	},
	stop: function(){
		removeListener(curLevel, 'update', 'workTracker' + this.handle);
		
	},
	
}
