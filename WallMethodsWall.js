
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
		var activeDots = dotManager.get({tag: this.handle});
		var tempData = this.data.temp.src();
		if (!this.isothermal) {
			addListener(curLevel, 'data', 'recordEnergyForIsothermal' + this.handle,
				function(){
					var tLast = tempData[tempData.length-1] || this.tSet;
					var dt = this.tSet - tLast;
					this.eToAdd = cv*activeDots.length*dt/N;
				},
			this);
			this.recordQ();
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
	unsetMass: function(chunkName) {
		if (!chunkName) {
			for (var chunkName in this.massChunks){
				delete this.massChunk[chunkName]
			}		
		} else {
			delete this.massChunks[chunkName];
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
	getDataObj: function(type, args) { //data will be list of DataObjs if it's like fractional conversion where there can be one for each species or tag.  Else is just DataObj
		if (this.data[type]) {
			if (this.data[type] instanceof Array) {
				for (var idx=0; idx<this.data[type].length; idx++) {
					if (this.data[type][idx].argsMatch(args)) return this.data[type][idx];
				}
			} else {
				return this.data[type]
			}
		}
	},
	removeDataObj: function(type, args) { 
		if (this.data[type]) {
			if (this.data[type] instanceof Array) {
				for (var idx=0; idx<this.data[type].length; idx++) {
					if (this.data[type][idx].argsMatch(args)) return this.data[type].splice(idx, 1);
				}
				console.log("Couldn't find data " + type + " with args " + args);
			} else {
				return delete this.data[type]
			}
		}
	},
	recordDefaults: function(){
		this.recordTime();
		this.recordTemp();
		this.recordPInt();
		this.recordVol();
	},
	recordTime: function() {
		this.data.time = new WallMethods.DataObj();
		var dataObj = this.data.time;
		this.setupStdDataObj(dataObj, 'time');
		var tInit = Date.now();
		var getTime = function() {
			return (Date.now() - tInit) / 1000;
		}
		recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), getTime, this, 'update');
	},
	recordTemp: function() {
		if (!this.data.t || !this.data.t.recording()) {
			this.data.temp = new WallMethods.DataObj();
			var dataObj = this.data.temp;
			this.setupStdDataObj(dataObj, 'temp');
			var tempFunc = dataHandler.tempFunc({tag:this.handle})
			
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), tempFunc, this, 'update');
		}
		return this;
	},

	recordRMS: function() {
		if (!this.data.RMS || !this.data.RMS.recording()) {
			this.data.RMS = new WallMethods.DataObj();
			var dataObj = this.data.RMS;
			this.setupStdDataObj(dataObj, 'RMS');
			//HEY - I AM ASSUMING THAT IF YOU GET RMS, IT IS OF ONE TYPE OF MOLECULE
				
			var mass = this.getRMSMass(this.handle);
			var RMSFunc = function() {
				var temp = this.data.t[this.data.t.length-1];
				return Math.sqrt(3000*KB*temp*ACTUALN/mass)
			}
			//figure out RMS at some point
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), RMSFunc, this, 'update');
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
		if (!this.data.pInt || !this.data.pInt.recording()) {
			this.data.pInt = new WallMethods.DataObj();
			var dataObj = this.data.pInt;
			this.setupStdDataObj(dataObj, 'pInt');
			this.pIntList = new Array();
			this.pIntIdx = 0;
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), this.pInt, this, 'update');
			
		}

		return dataObj;
	},
	recordPExt: function() {
		if (!this.data.pExt || !this.data.pExt.recording()) {
			this.data.pExt = new WallMethods.DataObj();
			var dataObj = this.data.pExt;
			this.setupStdDataObj(dataObj, 'pExt');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), this.pExt, this, 'update');
		}
		return dataObj;
	},
	recordVol: function() {
		if (!this.data.vol || !this.data.vol.recording()) {
			this.data.vol = new WallMethods.DataObj();
			var dataObj = this.data.vol;
			this.setupStdDataObj(dataObj, 'vol');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return this.parent.wallVolume(this.handle)}, this, 'update');
		}
		return dataObj;
	},
	recordWork: function() {
		if (!this.data.work || !this.data.work.recording()) {
			this.data.work = new WallMethods.DataObj();
			var dataObj = this.data.work;
			this.setupStdDataObj(dataObj, 'work');
			
			this.work = 0;
			var LTOM3LOCAL = LtoM3;
			var PCONSTLOCAL = pConst;
			var PUNITTOPALOCAL = PUNITTOPA;
			var VCONSTLOCAL = vConst;
			var JTOKJLOCAL = JtoKJ;
			var trackPt = this[0];

			var heightLast = trackPt.y;
			//Attention - at some point, employ some trickyness to first add a listener for first turn that records zero, then add real listener that uses func below. 
			//this will work after first turn since volume is _always_ recorded before work (vol is added as default to wall, work is added later by objects)
			var self = this;
			//var pExtList = this.data.get
			var volSrc = this.getDataObj('vol').src();
			var calcWork = function() {
				var len = volSrc.length
				var dV = LTOM3LOCAL*(volSrc[len-1] - volSrc[len-2])
				if (!isNaN(dV)) {
					var p = self.pExt()*PUNITTOPALOCAL;
					self.work -= JTOKJLOCAL*p*dV;
					return self.work;
				} else {
					self.work = 0;
					return 0;
				}
			}

			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), calcWork, this, 'update');
		}
		return dataObj;
	},
	recordMass: function() {
		if (!this.data.mass || !this.data.mass.recording()) {
			this.data.mass = new WallMethods.DataObj();
			var dataObj = this.data.mass;
			this.setupStdDataObj(dataObj, 'mass');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function(){return this.mass}, this, 'update');	
		}
		return dataObj;			
	},
	recordQ: function() {
		if (!this.data.q || !this.data.q.recording()) {
			this.data.q = new WallMethods.DataObj();
			var dataObj = this.data.q;
			this.setupStdDataObj(dataObj, 'q');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function(){return this.q}, this, 'update');
		}
		return dataObj;
	},
	recordVDist: function(info) {
		var dots = dotManager.createIfNotExists(info);
		if (!this.data.vDist) this.data.vDist = [];
		
		if (this.getDataObj('vDist', info) == undefined) {
			this.data.vDist.push(new WallMethods.DataObj());
			var dataObj = this.data.vDist[this.data.vDist.length-1];
			this.setupInfoDataObj(dataObj, 'vDist', info);
			var dataFunc = function() {
				var vs = [];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					vs.push(dots[dotIdx].speed());
				}
				return vs;
			}
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), dataFunc, this, 'update');
		
		}
	},
	recordMoles: function(info) {
		var dots = dotManager.createIfNotExists(info);
		if (!this.data.moles) this.data.moles = [];
		//list is okay.  Will use getDataObj func
		this.data.moles.push(new WallMethods.DataObj());
		var dataObj = this.data.moles[this.data.moles.length-1];
		this.setupInfoDataObj(dataObj, 'moles', info);
		recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return dots.length / N}, this, 'update');
		return dataObj;
	},
	recordFrac: function(info) {
		var countList = dotManager.createIfNotExists(info);
		var totalList = dotManager.createIfNotExists(info.tag ? {tag: info.tag} : undefined);
		if (!this.data.frac) this.data.frac = [];
		//list is okay.  Will use getDataObj func
		this.data.frac.push(new WallMethods.DataObj());
		var dataObj = this.data.frac[this.data.frac.length-1];
		this.setupInfoDataObj(dataObj, 'frac', info);

		recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return countList.length/totalList.length}, this, 'update');
		return dataObj;		
	},
	setupStdDataObj: function(dataObj, id) {
		dataObj.recording(true);
		dataObj.recordStop(this.recordStop);
		dataObj.id(id);
		dataObj.type(id);
		dataObj.wallHandle(this.handle);
	},
	setupInfoDataObj: function(dataObj, type, info) {
		dataObj.recording(true);
		dataObj.recordStop(this.recordStopDestroy);
		dataObj.id(type + (info.spcName || '').toCapitalCamelCase() + (info.tag || '').toCapitalCamelCase());
		dataObj.wallHandle(this.handle);
		dataObj.type(type);
		dataObj.idArgs(info);
	},
	//to be called in context of DataObj
	recordStopDestroy: function() {
		this.recording(false);
		walls[this.wallHandle()].removeDataObj(this.type(), this.idArgs());
		recordDataStop(this.id() + this.wallHandle());	

	},
	recordStop: function() {
		this.recording(false);
		recordDataStop(this.id() + this.wallHandle());
	},
	recordAllStop: function(){
		for (var dataObjName in this.data) {
			var dataObj = this.data[dataObjName];
			if (dataObj instanceof Array) {
				for (var idx=0; idx<dataObj.length; idx++) {
					dataObj[idx].recordStop();
				}
			} else {
				dataObj.recordStop();
			}
		}
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
	displayStd: function(dataObj, readout, label, decPlaces, units, func) {
		//wrappers will check if data object is recording
		if (!dataObj.displaying()) {
			dataObj.displaying(true);
			var src = dataObj.src();
			dataObj.readout(readout);
			var firstVal = src[src.length-1];
			if (!validNumber(firstVal)) {
				firstVal = 0;
			}
			var readout = dataObj.readout();
			var entryHandle = dataObj.id() + dataObj.wallHandle().toCapitalCamelCase();
			var listenerStr = 'display' + entryHandle.toCapitalCamelCase();
			readout.addEntry(entryHandle, label, units, firstVal, undefined, decPlaces);
			if (func) {
				addListener(curLevel, 'update', listenerStr,
					function() {func(entryHandle, src)},
				this);
			} else {
				addListener(curLevel, 'update', listenerStr,
					function() {
						readout.hardUpdate(entryHandle, src[src.length-1]);
					},
				this);
			}
			dataObj.displayStop(function() {
				this.displaying(false);
				this.readout().removeEntry(entryHandle);
				removeListener(curLevel, 'update', listenerStr);
			})
		} else {
			console.log('Tried to display ' + dataObj.id() + ' for wall ' + dataObj.wallHandle() + ' while already displaying');
		}
	},
	displayWork: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('work');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordTemp();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'kJ';
		decPlaces = defaultTo(0, decPlaces);
		var label = defaultTo('Work:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);
	},
	displayTemp: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var func;
		var dataObj = this.getDataObj('temp');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordTemp();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'K';
		decPlaces = defaultTo(0, decPlaces);
		var label = defaultTo('Temp:', label);
		if (attrs.smooth) {
			func = function(entryHandle, src) {
				var sum = 0;
				for (var tempIdx=src.length-5; tempIdx<src.length; tempIdx++) {
					sum += src[tempIdx];
				}
				readout.hardUpdate(entryHandle, sum *= .2);
			}
		}
		this.displayStd(dataObj, readout, label, decPlaces, units, func);
	},
	displayTempSmooth: function(attrs) {
		attrs.smooth = true;
		this.displayTemp(attrs);
	}, 
	displayPInt: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('pInt');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordPInt();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'bar';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('P_int:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);
	
	},
	displayPExt: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('pExt');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordPExt();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'bar';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('P_ext:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);
	},
	displayVol: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('vol');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordVol();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'L';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('Vol:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);
	},
	displayMass: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('mass');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordMass();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'kg';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('Mass:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);		
	},
	displayQ: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('q');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordQ();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'kJ';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('Q:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);	
	},
	displayRMS: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dataObj = this.getDataObj('RMS');
		if (!dataObj || !dataObj.recording()) {
			dataObj = this.recordRMS();
		}
		var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
		var units = 'm/s';
		decPlaces = defaultTo(1, decPlaces);
		var label = defaultTo('RMS:', label);
		this.displayStd(dataObj, readout, label, decPlaces, units);		
	
	},
	displayMoles: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dotAttrs = attrs.attrs;
		var dataObj = this.getDataObj('moles', dotAttrs);
		if (!dataObj) {
			console.log('Not recording for moles');
			console.log(dotAttrs);
		} else {
			var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var units = 'Moles';
			decPlaces = defaultTo(2, decPlaces);
			var label = defaultTo((dotAttrs.spcName || '') + ':', label);
			this.displayStd(dataObj, readout, label, decPlaces, units);	
		}
	},
	displayFrac: function(attrs) {
		var readoutHandle = attrs.readout;
		var label = attrs.label;
		var decPlaces = attrs.decPlaces;
		var dotAttrs = attrs.attrs;
		var dataObj = this.getDataObj('frac', dotAttrs);
		if (!dataObj) {
			console.log('Not recording for frac');
			console.log(dotAttrs);
		} else {
			var readout = defaultTo(curLevel.readout, curLevel.readouts[readoutHandle]);
			var units = '';
			decPlaces = defaultTo(2, decPlaces);
			var label = defaultTo('Mole frac:', label);
			this.displayStd(dataObj, readout, label, decPlaces, units);	
		}
	},		
	// I think I will have to abuse the DataObj for the arrows
	displayQArrowsRate: function(attrs){
		var threshold = attrs.threshold
		if (this.data.q.recording() && !(this.data.qArrowsRate && this.data.qArrowsRate.recording()) && !(this.data.qArrowsAmmt && this.data.qArrowsAmmt.recording())) {
			this.data.qArrowsRate = new WallMethods.DataObj();
			var dataObj = this.data.qArrowsRate;
			dataObj.displaying(true);
			dataObj.wallHandle(this.handle);
			dataObj.id('qArrowsRate');
			this.turnLastArrow = Math.max(0, this.data.q.length-1);
			this.qArrowThreshold = defaultTo(threshold, .3);
			var listenerStr = 'checkForDisplayArrows' + dataObj.wallHandle();
			var self = this;
			qSrc = this.data.q.src();
			addListener(curLevel, 'update', listenerStr, function() {self.checkDisplayArrows(qSrc)}, this);
			this.turnLastArrow = turn;
			dataObj.displayStop(function() {
				this.displaying(false);
				removeListener(curLevel, 'update', listenerStr);
				removeListenerByName(curLevel, 'update', 'ArrowFly');
			})
		} else {
			console.log('Tried to display q arrowsRate for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
			console.trace();
		}
	},
	displayQArrowsAmmt: function(attrs) {
		var qMax = attrs.qMax;
		if (this.data.q.recording() && !(this.data.qArrowsRate && this.data.qArrowsRate.recording()) && !(this.data.qArrowsAmmt && this.data.qArrowsAmmt.recording())) {
			this.data.qArrowsAmmt = new WallMethods.DataObj();
			var dataObj = this.data.qArrowsAmmt;
			dataObj.displaying(true);
			dataObj.wallHandle(this.handle);
			dataObj.id('qArrowsAmmt');
			var wall = this;
			dataObj.displayStop(function() {
				this.displaying(false);
				for (var arrowIdx=0; arrowIdx<wall.qArrowsAmmt.length; arrowIdx++) {
					wall.qArrowsAmmt[arrowIdx].remove();
				}
				removeListener(curLevel, 'update', this.wallHandle() + 'updateQAmmtArrows');
			})
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
	displayAllStop: function(){
		for (var dataObjName in this.data) {
			var dataObj = this.data[dataObjName];
			if (dataObj instanceof Array) {
				for (var idx=0; idx<dataObj.length; idx++) {
					dataObj[idx].displayStop();
				}
			} else {
				dataObj.displayStop();
			}
		}
		return this;
	},
	makeDataList: function() {
		var list = [];
		list.displaying = false;
		list.recording = false;
		return list;
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
	checkDisplayArrows: function(q){
		var dQ = q[q.length-1] - q[this.turnLastArrow];
		if (Math.abs(dQ)>this.qArrowThreshold) {
			this.populateArrows(dQ);
			this.turnLastArrow = turn;
		}
	},
	addPts: function(spliceIdx, toAdd) {
		//can't just set concat result equal to this because this's prototype is extended
		//will use handler of wall at spliceIdx because they're usually all the same anyway
		var oldHandlers = [];
		var idx = this.parent.idxByInfo(this.handle);
		for (var handlerIdx=spliceIdx; handlerIdx<this.length; handlerIdx++) {
			oldHandlers.push(this.parent.getSubWallHandler(idx, spliceIdx))
		}
		var oldPts = this.concat();
		var newPts = oldPts.slice(0, spliceIdx).concat(toAdd, oldPts.slice(spliceIdx, oldPts.length));
		for (var ptIdx=0; ptIdx<newPts.length; ptIdx++) {
			this[ptIdx] = newPts[ptIdx];
		}
		for (var movedPtIdx=spliceIdx + toAdd.length; movedPtIdx<this.length; movedPtIdx++) {
			this.parent.setSubWallHandler(this.handle, movedPtIdx, oldHandlers[movedPtIdx - toAdd.length - spliceIdx]);
		}
		var newHandler = oldHandlers[0] || this.parent[id + '-' + (spliceIdx - 1)];
		for (var newPtIdx=spliceIdx; newPtIdx<spliceIdx + toAdd.length; newPtIdx++) {
			this.parent.setSubWallHandler(this.handle, newPtIdx, newHandler)
		}
		this.parent.setupWall(this.handle);
	},
	removePts: function(spliceIdx, num) {
		var handlers = [];
		var idx = this.parent.idxByInfo(this.handle);
		for (var toMoveIdx = spliceIdx + num; toMoveIdx<this.length; toMoveIdx++) {
			handlers.push(this.parent.getSubWallHandler(idx, toMoveIdx));
		}
		this.splice(spliceIdx, num);
		for (var subWallIdx=spliceIdx; subWallIdx<this.length; subWallIdx++) {
			this.parent.setSubWallHandler(idx, subWallIdx, handlers[subWallIdx-spliceIdx]);
		}
		this.parent.setupWall(this.handle);
	},
	getPt: function(idx) {
		return this[idx];
	},
	getUV: function(idx) {
		return this.wallUVs[idx];
	},
	getPerpUV: function(idx) {
		return this.wallPerpUVs[idx];
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
		this.turnLastArrow = this.data.q.src().length-1;
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