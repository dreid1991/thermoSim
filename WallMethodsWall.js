
//////////////////////////////////////////////////////////////////////////
//WALL
//////////////////////////////////////////////////////////////////////////
WallMethods.wall = {
	reset: function(){
		var init = this.ptsInit;
		for (var ptIdx=0; ptIdx<init.length; ptIdx++){
			this[ptIdx].x = init[ptIdx].x;
			this[ptIdx].y = init[ptIdx].y;//Must copy by value to keep point object the same since things follow the points
		}
		this.forceInternal = 0;
		this.v = 0;
		this.parent.setupWall(this.parent.indexOf(this));
	},
	setVol: function(vol){
		var setY = this.volToY(vol)
		this[0].position({y:setY});
		this[1].position({y:setY});
	},
	volToY: function(vol) {
		var width = this[2].distTo(this[3]);
		var height = vol/(vConst*width);
		//WHAT IS THIS?
		var extendUV = this[2].VTo(this[3]).UV().perp('cw');
		return this[2].y - height;
	},



	changeSetPt: function(dest, compType, speed){
		if(compType.indexOf('isothermal')!=-1){
			var wallMoveMethod = 'cVIsothermal';
		} else if (compType.indexOf('adiabatic')!=-1){
			var wallMoveMethod = 'cVAdiabatic';
		}
		removeListener(curLevel, 'wallMove', 'cV' + this.handle);
		var setY = function(curY){
			this[0].y = curY;
			this[1].y = curY;
			this[this.length-1].y = curY;
		}
		var y = this[0].y
		var dist = dest-y;
		if (dist!=0) {
			var sign = getSign(dist);
			this.v = speed*sign;
			this.parent.setSubWallHandler(this.handle, 0, wallMoveMethod + compAdj);
			addListener(curLevel, 'wallMove', 'cV' + this.handle,
				function(){
					var y = this[0].y
					setY.apply(this, [boundedStep(y, dest, this.v)])
					this.parent.setupWall(this.handle);
					if(round(y,2)==round(dest,2)){
						removeListener(curLevel, 'wallMove', 'cV' + this.handle);
						this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
						this.v = 0;
					}
				},
			this);
		}		
	},
	releaseWithBounds: function(lowBound, highBound, handler, funcOnFinish) {
		this.moveStop();
		removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
		removeListener(curLevel, 'wallMove', 'cP' + this.handle);
		this.parent.setSubWallHandler(this.handle, 0, handler);
		lowBound = defaultTo(0, lowBound)
		highBound = defaultTo(Number.MAX_VALUE, highBound);
		var gLocal = g;
		var bounds = this.bounds;
		addListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle,
			function(){
				var lastY = this[0].y
				var nextY;
				var unboundedY = lastY + this.v + .5*gLocal;
				var dyWeight = null;
				if (unboundedY<lowBound || unboundedY>highBound) {
					this.moveStop();
					this.parent.setSubWallHandler(this.handle, 0, 'staticAdiabatic');
					if (unboundedY<lowBound) {
						funcOnFinish(lowBound);
						nextY = lowBound;
					} else {
						funcOnFinish(highBound);
						nextY = highBound;
					}
				} else if(unboundedY>bounds.yMax || unboundedY<bounds.yMin) {
					nextY = this.hitBounds(lastY, gLocal, bounds.yMin, bounds.yMax);
				} else {
					nextY = unboundedY;
					this.v += gLocal;

				}
				this[0].y = nextY;
				this[1].y = nextY;
				this[this.length-1].y = nextY;
				this.parent.setupWall(this.handle);		
			},
		this);

	},
	moveInit: function(){
		var gLocal = g;
		var bounds = this.bounds;
		addListener(curLevel, 'wallMove', 'cP' + this.handle,
			function(){
				var lastY = this[0].y
				var nextY;
				var unboundedY = lastY + this.v + .5*gLocal;
				var dyWeight = null;
				if(unboundedY>bounds.yMax || unboundedY<bounds.yMin){
					nextY = this.hitBounds(lastY, gLocal, bounds.yMin, bounds.yMax);
				}else{
					nextY = unboundedY;
					this.v += gLocal;

				}
				this[0].y = nextY;
				this[1].y = nextY;
				this[this.length-1].y = nextY;
				this.parent.setupWall(this.handle);		
			},
		this);
	},
	moveStop: function(){
		this.v = 0;
		removeListener(curLevel, 'wallMove', 'cP' + this.handle);
		removeListener(curLevel, 'wallMove', 'releaseWithBounds' + this.handle);
	},
	hitBounds: function(lastY, gLocal, yMin, yMax){
		var tLeft = 1;
		var unboundedY = lastY + this.v*tLeft + .5*gLocal*tLeft*tLeft;
		var boundedY = Math.max(yMin, Math.min(yMax, unboundedY));
		var discr = this.v*this.v + 2*gLocal*(boundedY-lastY);
		if (boundedY==yMax){
			
			var tHit = (-this.v + Math.sqrt(discr))/gLocal;

		}else if (boundedY==yMin){
			
			var tHit = (-this.v - Math.sqrt(discr))/gLocal;
		}
		this.v+=gLocal*tHit;
		this.v*=-1;
		tLeft-=tHit;
		
		if(-2*this.v< tLeft*gLocal && this.v<0){
			var tBounce = Math.abs(2*this.v/gLocal);
			var numBounces = Math.floor(tLeft/tBounce);
			tLeft-=numBounces*tBounce;
		}
		var nextY = boundedY + this.v*tLeft + .5*gLocal*tLeft*tLeft;
 
		
		this.v += gLocal*tLeft;
		
		return nextY;
	},

	setHitMode: function(inputMode){
		this.hitMode = inputMode;
	},
	setDefaultReadout: function(readout){
		this.defaultReadout = readout;
		return this;
	},
	unsetDefaultReadout: function(){
		this.defaultReadout = undefined;
		return this;
	},
	setTemp: function(temp){
		this.tSet = temp;
	},
	isothermalInit: function(){
		this.eToAdd = 0;
		if(this.parent.numWalls>1){
			var countFunc = dataHandler.countFunc({tag:this.handle})
		}else{
			var countFunc = dataHandler.countFunc();
		}		
		if(!this.isothermal){
			addListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle,
				function(){
					var tLast = defaultTo(this.tSet, this.data.t[this.data.t.length-1]);
					var dt = this.tSet - tLast;
					this.eToAdd = cv*countFunc()*dt/N;
				},
			this);
		}
		for (var lineIdx=0; lineIdx<this.length; lineIdx++){
			this[lineIdx].isothermal = true;
		}
		this.isothermal = true;
	
	},
	isothermalStop: function(){
		this.isothermal = false;
		removeListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle);
	},
	pExt: function(){
		var SA = this[1].x - this[0].x;
		return this.pConst*this.mass*this.g/SA;
	},
	pInt: function(){
		var SA = this.surfArea();
		var pInt = this.pConst*this.forceInternal/((turn-this.pLastRecord)*SA);
		this.forceInternal = 0;
		this.pLastRecord = turn;
		this.pIntList[this.pIntIdx] = pInt;
		this.pIntIdx++;
		if (this.pIntIdx==this.pIntLen) {
			this.pIntIdx=0;
		}
		return this.pIntList.average();
	},
	surfArea: function(){
		var SA=0;
		for (ptIdx=0; ptIdx<this.length-1; ptIdx++){
			var pt = this[ptIdx];
			var ptNext = this[ptIdx+1];
			SA+=pt.distTo(ptNext);
		}
		
		return SA;
	},
	updateMass: function() {
		var totalMass = 0;
		for (var chunkName in this.massChunks){
			totalMass+=this.massChunks[chunkName];
		}
		this.mass = totalMass;			
	},
	setMass: function(chunkName, value){
		this.massChunks[chunkName] = value;
		this.updateMass();
		return this;
	},
	unsetMass: function(chunkName){
		if(!chunkName){
			for (var chunkName in this.massChunks){
				this.massChunks[chunkName] = undefined;
			}		
		}else{
			this.massChunks[chunkName] = undefined;
		}
		this.updateMass();
		return this;
	},

	addBorder: function(attrs) {
		if (attrs) {
			if (defaultTo('std', attrs.type) == 'std') {
				this.border([1, 2, 3, 4], attrs.width || 5, attrs.col || this.col.copy().adjust(-100, -100, -100), [{y:attrs.yMin}, {}, {}, {y:attrs.yMin}]);
			}
		}
	},
	border: function(wallPts, thickness, col, ptAdjusts){
		this.bordered = true;
		var drawCanvas = c;
		var pts = new Array(wallPts.length);
		var perpUVs = new Array(wallPts.length-1)
		var borderPts = [];
		var targetWallPts = this;
		var targetWallPerps = this.wallPerpUVs;
		for (var wallPtIdx=0; wallPtIdx<wallPts.length; wallPtIdx++){
			pts[wallPtIdx] = targetWallPts[wallPts[wallPtIdx]].copy();
		}
		for (var wallPtIdx=0; wallPtIdx<wallPts.length-1; wallPtIdx++){
			perpUVs[wallPtIdx] = targetWallPerps[wallPts[wallPtIdx]].copy().neg();
		}
		for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			//can give either vector or absolute position
			pt.movePt(ptAdjusts[ptIdx]);
			pt.position(ptAdjusts[ptIdx]);
			borderPts.push(pt);
		}
		var lastAdj = perpUVs[perpUVs.length-1].copy().mult(thickness)
		borderPts.push(pts[pts.length-1].copy().movePt(lastAdj));
		for (var ptIdx=pts.length-2; ptIdx>0; ptIdx-=1){
			var UVs = [perpUVs[ptIdx], perpUVs[ptIdx-1]];
			var pt = pts[ptIdx];
			borderPts.push(this.spacedPt(pt, UVs, thickness));
		}
		var firstAdj = perpUVs[0].mult(thickness)
		borderPts.push(pts[0].copy().movePt(firstAdj));
		borderPts.push(pts[0]);
		addListener(curLevel, 'update', 'drawBorder' + this.handle, 
			function(){
				draw.fillPts(borderPts, col, drawCanvas);
			}
		,'');
	},
	spacedPt: function(pt, UVs, thickness){
		var UV1 = UVs[0];
		var UV2 = UVs[1];
		var adjust = UV1.add(UV2)
		return pt.copy().movePt(adjust.mult(thickness));
	},
	removeBorder: function(){
		this.bordered = false;
		removeListener(curLevel, 'update', 'drawBorder' + this.handle);
	},
	
	recordDefaults: function(){
		this.recordTemp();
		this.recordPInt();
		this.recordVol();
		this.recordQ();
	},
	recordTemp: function() {
		this.recordingTemp.val = true;
		//if (this.parent.numWalls>1) {
			var tempFunc = dataHandler.tempFunc({tag:this.handle})
		//}else{
		//	var tempFunc = dataHandler.tempFunc();
		//}		
		recordData('t' + this.handle, this.data.t, tempFunc, this, 'update');
		return this;
	},
	recordRMS: function() {
		if (this.recordingTemp.val) {
			this.recordingRMS.val = true;
			//HEY - I AM ASSUMING THAT IF YOU GET RMS, IT IS OF ONE TYPE OF MOLECULE
			if (this.parent.numWalls>1) {
				var tag = this.handle;
			} else {
				tag = undefined;
			}			
			var mass = this.getRMSMass(tag);
			var RMSFunc = function() {
				var temp = this.data.t[this.data.t.length-1];
				return Math.sqrt(3000*KB*temp*ACTUALN/mass)
			}
			recordData('RMS' + this.handle, this.data.RMS, RMSFunc, this, 'update');
		} else {
			console.log('Tried to record RMS of wall ' + this.handle + ' while not recording temp.  Will not record.');
		}
		return this;
	},
	getRMSMass: function(tag) {
		if (tag) {
			for (var spc in spcs) {
				var dots = spcs[spc].dots;
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					if (tag) {
						if (dots[dotIdx].tag == tag) {
							return dots[dotIdx].m;
						}
					} else {
						return dots[dotIdx].m;
					}
				}
			}
		}
	},
	recordPInt: function() {
		this.recordingPInt.val = true;
		this.pIntList = new Array();
		this.pIntIdx = 0;
		recordData('pInt' + this.handle, this.data.pInt, this.pInt, this, 'update');
		return this;
	},
	recordPExt: function() {
		this.recordingPExt.val = true;
		recordData('pExt' + this.handle, this.data.pExt, this.pExt, this, 'update');
		return this;
	},
	recordVol: function() {
		this.recordingVol.val = true;
		recordData('v' + this.handle, this.data.v, function(){return this.parent.wallVolume(this.handle)}, this, 'update');
		return this;
	},
	recordWork: function() {
		if (!this.recordingWork.val) {
			this.recordingWork.val = true;
			this.work = 0;
			var LTOM3LOCAL = LtoM3;
			var PCONSTLOCAL = pConst;
			var PUNITTOPALOCAL = PUNITTOPA;
			var VCONSTLOCAL = vConst;
			var JTOKJLOCAL = JtoKJ;
			var trackPt = this[0];
			var width = this[1].x-this[0].x;
			var heightLast = trackPt.y;
			//Attention - at some point, employ some trickyness to first add a listener for first turn that records zero, then add real listener that uses func below. 
			//this will work after first turn since volume is _always_ recorded before work (vol is added as default to wall, work is added later by objects)
			var self = this;
			
			var calcWork = function() {
				var len = self.data.v.length;
				var dV = LTOM3LOCAL*(self.data.v[len-1] - self.data.v[len-2])
				if (!isNaN(dV)) {
					var p = self.pExt()*PUNITTOPALOCAL;
					self.work -= JTOKJLOCAL*p*dV;
					heightLast = trackPt.y;
					return self.work;
				} else {
					self.work = 0;
					return 0;
				}
			}

			recordData('work' + this.handle, this.data.work, calcWork, this, 'update');
		}
		return this;
	},
	recordMass: function() {
		if (!this.recordingMass.val) {
			this.recordingMass.val = true;
			recordData('mass' + this.handle, this.data.m, function(){return this.mass}, this, 'update');	
		}
		return this;			
	},
	recordQ: function() {
		if (!this.recordingQ.val) {
			this.recordingQ.val = true;
			recordData('q' + this.handle, this.data.q, function(){return this.q}, this, 'update');
		}
		return this;
	},
	recordStop: function(isRecording, str) {
		isRecording.val = false;
		recordDataStop(str + this.handle);
	},
	//if I want to generalize stop *and* use the closure compiler, need to make isRecording object
	recordAllStop: function(){
		if(this.recordingTemp.val){this.recordStop(this.recordingTemp, 't');};
		if(this.recordingPInt.val){this.recordStop(this.recordingPInt, 'pInt');};
		if(this.recordingPExt.val){this.recordStop(this.recordingPExt, 'pExt');};
		if(this.recordingVol.val){this.recordStop(this.recordingVol, 'v');};
		if(this.recordingWork.val){this.recordStop(this.recordingWork, 'work');};
		if(this.recordingMass.val){this.recordStop(this.recordingMass, 'mass');};
		if(this.recordingQ.val){this.recordStop(this.recordingQ, 'q');};
		if(this.recordingRMS.val){this.recordStop(this.recordingRMS, 'RMS');};
		return this;
	},	
	resetWork: function(){
		this.work = 0;
		return this;
	},
	resetQ: function(){
		this.q = 0;
		return this;
	},
	//HEY - YOU SHOULD _PROBABLY_ MAKE A FUNCTION THAT DOES THESE DISPLAY THINGS GIVEN SOME INPUTS.  I MEAN, THIS IS A LOT OF NEARLY IDENTICAL CODE
	displayWork: function(readoutHandle, label, decPlaces) {
		if (this.recordingWork.val && !this.displayingWork.val) {
			this.displayingWork.val = true;
			decPlaces = defaultTo(1, decPlaces);
			var dataSet = this.data.work;
			label = defaultTo('Work:', label);
			this.workReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.workReadout.addEntry('work' + this.handle, label, 'kJ', firstVal, undefined, decPlaces);
			addListener(curLevel, 'update', 'displayWork' + this.handle,
				function(){
					this.workReadout.hardUpdate('work' + this.handle, dataSet[dataSet.length-1]);
				},
			this);	
			this.addCleanUpIfPrompt('displayWork', this.displayWorkStop);
		} else {
			console.log('Tried to display work of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;
	},
	displayTemp: function(readoutHandle, label, decPlaces, smooth){
		if (this.recordingTemp.val && !this.displayingTemp.val) {
			this.displayingTemp.val = true;
			decPlaces = defaultTo(0, decPlaces);
			var dataSet = this.data.t;
			label = defaultTo('Temp:', label);
			this.tempReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if (!validNumber(firstVal)) {
				firstVal = 0;
			}
			this.tempReadout.addEntry('temp' + this.handle, label, 'K', firstVal, undefined, decPlaces);
			if (!smooth) {
				addListener(curLevel, 'update', 'displayTemp' + this.handle,
					function() {
						this.tempReadout.hardUpdate('temp' + this.handle, dataSet[dataSet.length-1]);
					},
				this);	
			} else {
				addListener(curLevel, 'update', 'displayTemp' + this.handle,
					function() {
						var sum = 0;
						for (var tempIdx=dataSet.length-5; tempIdx<dataSet.length; tempIdx++) {
							sum += dataSet[tempIdx];
						}
						this.tempReadout.hardUpdate('temp' + this.handle, sum*=.2);
					},
				this);
			}
			this.addCleanUpIfPrompt('displayTemp', this.displayTempStop);
		}else{
			console.log('Tried to display temp of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;
	},
	displayTempSmooth: function(readoutHandle, label, decPlaces) {
		return this.displayTemp(readoutHandle, label, decPlaces, true);
	},
	displayPInt: function(readoutHandle, label, decPlaces){
		if(this.recordingPInt.val && !this.displayingPInt.val){
			this.displayingPInt.val = true;
			decPlaces = defaultTo(1, decPlaces);
			var dataSet = this.data.pInt;
			label = defaultTo('Pint:', label);
			this.pIntReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if (!validNumber(firstVal)) {
				firstVal = 0;
			}
			this.pIntReadout.addEntry('pInt' + this.handle, label, 'bar', firstVal, undefined, decPlaces);
			addListener(curLevel, 'update', 'displayPInt'+this.handle,
				function(){
					this.pIntReadout.hardUpdate('pInt' + this.handle, dataSet[dataSet.length-1]);
				},
			this);
			this.addCleanUpIfPrompt('displayPInt', this.displayPIntStop);
		}else{
			console.log('Tried to display pInt of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;
	},
	displayPExt: function(readoutHandle, label, decPlaces){
		if(this.recordingPExt.val && !this.displayingPExt.val){
			this.displayingPExt.val = true;
			decPlaces = defaultTo(1, decPlaces);
			var dataSet = this.data.pExt;
			label = defaultTo('Pext:', label);
			this.pExtReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.pExtReadout.addEntry('pExt' + this.handle, label, 'bar', firstVal, undefined, decPlaces);
			var lastVal = 0;
			addListener(curLevel, 'update', 'displayPExt'+this.handle,
				function(){
					var curVal = dataSet[dataSet.length-1];
					if(curVal!=lastVal){
						this.pExtReadout.tick('pExt' + this.handle, curVal);
						lastVal = curVal;
					}
					
				},
			this);
			this.addCleanUpIfPrompt('displayPExt', this.displayPExtStop);
		}else{//OR ALREADY DISPLAYING - MAKE ERROR MESSAGES FOR TRYING TO DISPLAY WHILE ALREADY DISPLAYING
			console.log('Tried to display pExt of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;
	},
	displayVol: function(readoutHandle, label, decPlaces){
		if(this.recordingVol.val && !this.displayingVol.val){
			this.displayingVol.val = true;
			decPlaces = defaultTo(1, decPlaces);
			var dataSet = this.data.v;
			label = defaultTo('Volume:', label);
			this.volReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.volReadout.addEntry('vol' + this.handle, label, 'L', firstVal, undefined, decPlaces);
			addListener(curLevel, 'update', 'displayVolume' + this.handle,
				function(){
					this.volReadout.hardUpdate('vol' + this.handle, dataSet[dataSet.length-1]);
				},
			this);
			this.addCleanUpIfPrompt('displayVol', this.displayVolStop);
		}else{
			console.log('Tried to display volume of wall ' + this.handle + ' while not recording.  Will not display.');			
		}
		return this;
	},
	displayMass: function(readoutHandle, label, decPlaces){
		if(this.recordingMass.val && !this.displayingMass.val){
			this.displayingMass.val = true;
			decPlaces = defaultTo(0, decPlaces);
			var dataSet = this.data.m;
			label = defaultTo('Mass:', label);
			this.massReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.massReadout.addEntry('mass' + this.handle, label, 'kg', firstVal, undefined, decPlaces);
			var lastVal = 0;
			addListener(curLevel, 'update', 'displayMass' + this.handle,
				function(){
					var curVal = dataSet[dataSet.length-1];
					if(curVal!=lastVal){
						this.massReadout.hardUpdate('mass' + this.handle, curVal);
						lastVal = curVal;
					}
				},
			this);
			this.addCleanUpIfPrompt('displayMass', this.displayMassStop);
		}else{
			console.log('Tried to display mass of wall ' + this.handle + ' while not recording.  Will not display.');			
		}
		return this;			
	},
	displayQ: function(readoutHandle, label, decPlaces){
		if (this.recordingQ.val && !this.displayingQ.val) {
			this.displayingQ.val = true;
			decPlaces = defaultTo(1, decPlaces);
			var dataSet = this.data.q;
			label = defaultTo('Q:', label);
			this.qReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.qReadout.addEntry('q' + this.handle, label, 'kJ', firstVal, undefined, decPlaces);
			var lastVal = 0;
			addListener(curLevel, 'update', 'displayQ'+this.handle,
				function(){
					var curVal = dataSet[dataSet.length-1];
					if(curVal!=lastVal){
						this.qReadout.hardUpdate('q' + this.handle, curVal);
						lastVal = curVal;
					}
					
				},
			this);
			this.addCleanUpIfPrompt('displayQ', this.displayQStop);

		}else{
			console.log('Tried to display q of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;
	},
	displayRMS: function(readoutHandle, label, decPlaces) {
		if(this.recordingRMS.val && !this.displayingRMS.val){
			this.displayingRMS.val = true;
			var decPlaces = defaultTo(0, decPlaces);
			var dataSet = this.data.RMS;
			label = defaultTo('RMS:', label);
			this.RMSReadout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var firstVal = dataSet[dataSet.length-1];
			if(!validNumber(firstVal)){
				firstVal = 0;
			}
			this.RMSReadout.addEntry('RMS' + this.handle, label, 'm/s', firstVal, undefined, decPlaces);
			addListener(curLevel, 'data', 'displayRMS' + this.handle,
				function(){
					this.RMSReadout.tick('RMS' + this.handle, dataSet[dataSet.length-1]);
				},
			this);	
			this.addCleanUpIfPrompt('displayRMS', this.displayRMSStop);
		}else{
			console.log('Tried to display RMS of wall ' + this.handle + ' while not recording.  Will not display.');
		}
		return this;		
	
	},
	displayQArrowsRate: function(threshold){
		if (this.recordingQ.val && !this.displayingQArrowsRate.val && !this.displayingQArrowsAmmt.val) {
			this.displayingQArrowsRate.val = true;
			this.idxLastArrow = Math.max(0, this.data.q.length-1);
			this.qArrowThreshold = defaultTo(threshold, .3);
			addListener(curLevel, 'update', 'checkForDisplayArrows' + this.handle, this.checkDisplayArrows, this);
		} else {
			console.log('Tried to display q arrowsRate for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
			console.trace();
		}
	},
	displayQArrowsAmmt: function(qMax) {
		if (this.recordingQ.val && !this.displayingQArrowsRate.val && !this.displayingQArrowsAmmt.val) {
			this.displayingQArrowsAmmt.val = true;
			this.qArrowsAmmtInit(defaultTo(3, qMax));
		} else {
			console.log('Tried to display q arrowsAmmt for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
			console.trace();	
			
		}
	},
	addCleanUpIfPrompt: function(displayType, func) {
		if (currentSetupType.indexOf('prompt') != -1) {
			addListener(curLevel, currentSetupType + 'CleanUp', displayType + this.handle, func, this);
		}			
	},
	displayVolStop: function(){
		this.displayingVol = false;
		this.volReadout.removeEntry('vol' + this.handle);
		removeListener(curLevel, 'update', 'displayVolume' + this.handle);
		return this;
	},
	displayPIntStop: function(){
		this.displayingPInt = false;
		removeListener(curLevel, 'data', 'displayPInt'+this.handle);
		this.pIntReadout.removeEntry('pInt' + this.handle);
		return this;
	},
	displayPExtStop: function(){
		this.displayingPExt = false;
		removeListener(curLevel, 'update', 'displayPExt'+this.handle);
		this.pExtReadout.removeEntry('pExt' + this.handle);
		return this;
	},
	displayWorkStop: function(){
		this.displayingWork = false;
		this.workReadout.removeEntry('work' + this.handle);
		removeListener(curLevel, 'update', 'displayWork'+this.handle);
		return this;
	},
	displayTempStop: function(){
		this.displayingTemp = false;
		removeListener(curLevel, 'update', 'displayTemp' + this.handle)
		this.tempReadout.removeEntry('temp' + this.handle);
		return this;
	},
	displayMassStop: function(){
		this.displayingMass = false;
		removeListener(curLevel, 'data', 'displayMass' + this.handle)
		this.massReadout.removeEntry('mass' + this.handle);	
		return this;			
	},
	displayQStop: function(){
		this.displayingQ = false;
		removeListener(curLevel, 'data', 'displayQ' + this.handle);
		this.qReadout.removeEntry('q' + this.handle);
		return this;
	},
	displayQArrowsRateStop: function(){
		this.displayingQArrowsRate = false;
		removeListener(curLevel, 'update', 'checkDisplayArrows' + this.handle);
		removeListenerByName(curLevel, 'update', 'ArrowFly');
		return this;
	},
	displayQArrowsAmmtStop: function() {
		this.displayingQArrowsAmmt = false;
		for (var arrowIdx=0; arrowIdx<this.qArrowsAmmt.length; arrowIdx++) {
			this.qArrowsAmmt[arrowIdx].remove();
		}
		removeListener(curLevel, 'update', this.handle + 'updateQAmmtArrows');
	},
	displayRMSStop: function(){
		this.displayingRMS = false;
		removeListener(curLevel, 'data', 'displayRMS' + this.handle)
		this.RMSReadout.removeEntry('RMS' + this.handle);
		return this;
	},

	displayAllStop: function(){
		if(this.displayingVol.val){this.displayVolStop();};
		if(this.displayingPInt.val){this.displayPIntStop();};
		if(this.displayingPExt.val){this.displayPExtStop();};
		if(this.displayingWork.val){this.displayWorkStop();};
		if(this.displayingTemp.val){this.displayTempStop();};
		if(this.displayingMass.val){this.displayMassStop();};
		if(this.displayingQ.val){this.displayQStop();};
		if(this.displayingQArrowsRate.val){this.displayQArrowsRateStop();};
		if(this.displayingQArrowsAmmt.val){this.displayQArrowsAmmtStop();};
		if(this.displayingRMS.val){this.displayRMSStop();};
		return this;
	},
	resetQ: function() {
		this.q = 0;
		if (this.displayingQArrowsAmmt) {
			this.displayQArrowsAmmtStop();
			this.displayQArrowsAmmt(this.qArrowAmmtMax);
		}
	},
	resetWork: function() {
		this.work = 0;
	},
	qArrowsAmmtInit: function(qMax) {
		this.qArrowAmmtMax = qMax;
		var lengthMin = 15;
		var lengthMax = 80;
		var widthMin = 70
		var widthMax = 90;
		var col = Col(175, 0, 0);
		var width = 40;
		var fracFromEdge = .25;
		var startingDims = V(30, 10);
		var pos1 = this[3].copy().fracMoveTo(this[2], fracFromEdge);
		var pos2 = this[3].copy().fracMoveTo(this[2], 1-fracFromEdge);
		var UV = pos2.VTo(pos1).perp('cw').UV();
		pos1.movePt(UV.copy().mult(5));
		pos2.movePt(UV.copy().mult(5));
		var arrow1 = new ArrowStatic({pos:pos1, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});
		var arrow2 = new ArrowStatic({pos:pos2, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});

		var redrawThreshold = qMax/(lengthMax-lengthMin);
		this.qArrowsAmmt = [arrow1, arrow2];
		var dirLast = 'out';
		qLast = this.q;
		this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
		if (this.q>=0) {
			dirLast = 'in';
			this.flipAmmtArrows(this.qArrowsAmmt);
		}
		addListener(curLevel, 'update', this.handle + 'updateQAmmtArrows', 
			function() {
				if (Math.abs(this.q - qLast) > redrawThreshold) {
					if (this.q<0) {
						dir = 'out';
					} else {
						dir = 'in';
					}
					this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
					if (dirLast != dir) {
						this.flipAmmtArrows(this.qArrowsAmmt);
						dirLast = dir;
					}
					qLast = this.q;
				}
			},
		this);
	},
	flipAmmtArrows: function(arrows) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var UV = angleToUV(arrow.getAngle()).mult(1);
			arrow.move(UV.mult(arrow.getDims().dx));
			arrow.rotate(Math.PI);
		}
	},
	setAmmtArrowDims: function(arrows, lMin, lMax, wMin, wMax, q, qMax) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var dimso = arrow.getDims();
			var percent = Math.abs(this.q)/qMax;
			var l = lMin + (lMax-lMin)*percent;
			var w = wMin + (wMax-wMin)*percent;
			arrow.size(V(l, w));
			if (q>0) {
				arrow.move(V(0, l-dimso.dx));
			}
		}
	},
	checkDisplayArrows: function(){
		var dQ = this.data.q[this.data.q.length-1] - this.data.q[this.idxLastArrow];
		if (Math.abs(dQ)>this.qArrowThreshold) {
			this.populateArrows(dQ);
			this.idxLastArrow = turn;
		}
	},
	populateArrows: function(dQ){
		var rotations = {'-1':'cw', '1':'ccw'};
		var dist = 30;
		var fill = this.parent.qArrowFill;
		var fillFinal = this.parent.qArrowFillFinal;
		var stroke = this.parent.qArrowStroke;
		var qList = this.data.q;
		var heatTransSign = getSign(dQ);
		var UVRot = rotations[heatTransSign];
		this.idxLastArrow = this.data.q.length-1;
		var dims = V(110*Math.abs(dQ), 170*Math.abs(dQ));//big numbers from adjusting to q per turn so if I change interval, size of arrows doesn't change
		var dimsFinal = dims.copy();
		dimsFinal.dx *= 1.4;
		dimsFinal.dy *= .85;
		var offset = {'-1':0, '1':-dimsFinal.dx-dist};
		if (dims.dx>7 || dims.dy>7) {
			for (var lineIdx=0; lineIdx<this.length-1; lineIdx++) {
				if (this[lineIdx].isothermal) {
					var len = this[lineIdx].distTo(this[lineIdx+1]);
					var numArrows = Math.round(len/150);
					var pxStep = len/(numArrows+1);
					var distAlongLine = pxStep;
					for (var arrowIdx=0; arrowIdx<numArrows; arrowIdx++){
						var pos = this[lineIdx].copy().movePt(this.wallUVs[lineIdx].copy().mult(distAlongLine)).movePt(this.wallPerpUVs[lineIdx].copy().mult(offset[heatTransSign]));
						new ArrowFly({pos:pos, 
										dist:dist, 
										UV:this.wallUVs[lineIdx].copy().perp(UVRot), 
										fill:fill, 
										fillFinal:fillFinal, 
										stroke:stroke,
										dims:dims,
										dimsFinal:dimsFinal,
										lifespan:3500
									});
						distAlongLine += pxStep;
					}	
				}
			}
		}
		 
	}
	
}