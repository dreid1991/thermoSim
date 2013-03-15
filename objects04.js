function Liquid(attrs) {
	//driving force convention: positive -> into liquid, neg -> into vapor
	this.type = 'Liquid';
	this.wallInfo = attrs.wallInfo;
	this.wallGas = walls[this.wallInfo];
	this.wallPtIdxs = attrs.wallPts || [this.wallGas.length - 2, this.wallGas.length - 3];
	this.handle = attrs.handle;
	this.cleanUpWith = attrs.cleanUpWith || currentSetupType;
	this.actCoeffType = attrs.actCoeffType; //twoSfxMrg for two suffix margules, 
	this.actCoeffInfo = attrs.actCoeffInfo;
	
	var tempInit = attrs.tempInit;
	this.spcInfo = this.makeSpcInfo(attrs.spcInfo); //formatted as {spc1: {count: #, spcVol: #, cP: #, antoineCoeffs: {a: #,b: #,c: #}, hVap: #} ... } spcVol in L/mol
	this.drivingForce = this.makeDrivingForce(this.spcInfo);
	this.dotMgrLiq = this.makeDotManager(this.spcInfo);
	this.wallLiq = this.makeWallLiq(this.spcInfo, this.wallGas, this.wallPtIdxs, this.dotMgrLiq);
	var dataGas = this.initData(this.wallGas, this.spcInfo, ['pInt']);
	var dataLiq = this.initData(this.wallLiq, this.spcInfo, ['temp']);
	this.makeDots(this.wallLiq, this.spcInfo, tempInit, this.dotMgrLiq) && this.deleteCount(this.spcInfo);
	this.drawList = this.makeDrawList(this.dotMgrLiq); //need to make draw list in random order otherwise dots drawn on top will look more prominant than they are.
	this.actCoeffFuncs = this.makeActCoeffFuncs(this.actCoeffType, this.actCoeffInfo, this.spcInfo);
	
	this.updateListenerName = this.type + this.handle;
	this.setupUpdate(this.spcInfo, this.dataGas, this.dataLiq, this.actCoeffFuncs, this.drivingForce, this.updateListenerName, this.drawList, this.dotMgrLiq)
	
	//this.setupStd();
}

_.extend(Liquid.prototype, objectFuncs, {
	makeActCoeffFuncs: function(type, info, spcInfo) {
		if (type == 'twoSfxMrg') {
			var coeff = info.a
			return this.makeTwoSfxMrgFuncs(spcInfo, coeff);
		}
	},
	makeTwoSfxMrgFuncs: function(spcInfo, coeff) {
		var funcs = {};
		var gasConst = R;
		for (var spcName in spcInfo) {
			funcs[spcName] = function(x, T) {
				return Math.exp(coeff * x * x / (gasConst * T)); 
			}
		}
		return funcs;
	},
	makeWallLiq: function(spcInfo, wallGas, wallPtIdxs, dotMgrLiq) {
		var vol = this.getLiqWallVol(spcInfo);
		//liq wall needs to go in opposite direction of gas wall
		var pts = this.getWallLiqPts(wallGas, wallPtIdxs, vol);
		var handler = {func: this.hit, obj: this};
		window.walls.addWall({pts:pts, handler:handler, handle: 'liquid' + this.handle, record: false, show: false, dotManager: dotMgrLiq});
		return window.walls[window.walls.length - 1];
	},
	getLiqWallVol: function(spcInfo) {
		var vol = 0;
		for (var spcName in spcInfo) {
			vol += spcInfo[spcName].spcVol * spcInfo[spcName].count / N;
		}
		return vol;
	},
	getWallLiqPts: function(wallGas, wallGasPts, vol) {
		var a = wallGas[wallGasPts[0]];
		var b = wallGas[wallGasPts[1]];
		var bottomLeft = a.x < b.x ? a : b;
		var bottomRight = bottomLeft == a ? b : a;
		var height = this.getWallHeight(bottomRight.x - bottomLeft.x, vol);
		var topLeft = bottomLeft.copy().movePt(V(0, -height));
		var topRight = bottomRight.copy().movePt(V(0, -height));
		return [topLeft, bottomLeft, bottomRight, topRight];
	},
	getWallHeight: function(width, vol) {
		return vol/(vConst*width);
	},
	makeDotManager: function(spcInfo) {
		var dotMgr = new DotManager();
		for (var spcName in spcInfo) {
			dotMgr.addSpcs(spcName);
		}
		return dotMgr;
	},
	makeDots: function(wallLiq, makeOrder, temp, dotMgrLiq) {
		var pos = wallLiq[0].copy();
		var dims = wallLiq[0].VTo(wallLiq[2]);
		
		for (var spcName in makeOrder) {
			var order = makeOrder[spcName]
			spcs[spcName].populate(pos, dims, order.count, temp, wallLiq.handle, wallLiq.handle, dotMgrLiq); 
		}
	},
	initData: function(wall, spcInfo, extras) {
		var data = {};
		for (var extraIdx=0; extraIdx<extras.length; extraIdx++) {
			var extra = extras[extraIdx];
			var dataObj = wall.getDataObj(extra);
			if (dataObj === false) {
				var recordFunc = 'record' + extra.toCapitalCamelCase();
				wall[recordFunc]();
				data[extra] = wall.getDataObj(extra).src();
			} else {
				data[extra] = dataObj.src();
			}
		}
		for (var spcName in spcInfo) {
			var attrs = {spcName: spcName, tag: wall.handle};
			wall.recordFrac(attrs)
			data[spcName] = wall.getDataObj('frac', attrs).src();
		}
		return data;
	},
	makeSpcInfo: function(spcInfo) {
		var reformat = {};
		for (var infolet in spcInfo) {
			var spc = spcInfo[infolet];
			reformat[infolet] = new this.Species(infolet, spc.count, spc.hVap, spc.cP, spc.spcVol, spc.antoineCoeffs);
		}
		return reformat;
	},
	makeDrivingForce: function(spcInfo) {
		var force = {};
		for (var spcName in spcInfo) {
			force[spcName] = 0;
		}
		return force;
	},
	setupUpdate: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName, drawList, dotMgrLiq) {
		this.setupUpdateEquil(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName);
		this.setupUpdateDraw(drawList);
		this.setupUpdateMove(dotMgrLiq.lists.ALLDOTS); //need to send list of each species.  Need to make velocity vectors for *each* group of dots. whew
	
	},
	setupUpdateEquil: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName) {
		addListener(curLevel, 'update', listenerName + 'Equil', function() {
			for (var spcName in spcInfo) {
				var spc = spcInfo[spcName];
				var gasFrac = dataGas[spcName];
				var liqFrac = dataLiq[spcName];
				var liqTemp = dataLiq.temp;
				var actCoeff = actCoeffFuncs[spcName](liqFrac, liqTemp);
				var antCoeffs = spcInfo.antoineCoeffs;
				var pPure = this.getPPure(antCoeffs.a, antCoeffs.b, antCoeffs.c, liqTemp);
				var pEq = pPure * actCoeff * liqFrac;
				var pGas = gasFrac * dataGas.pInt;
				drivingForce[spcName] = pGas - pEq;
			}
		})	
	},
	setupUpdateDraw: function(drawList) {
		addListener(curLevel, 'update', listenerName + 'Draw', function() {
			window.drawingTools.dotsAsst(drawList);
		});
	},
	setupUpdateMove: function(dots) {
		var stepSize = Math.max(1, dots.length / 50)
		var numSteps = Math.max(dots.length / stepSize);
		for (var i=0; i<numSteps; i++) {
			//var 
		}
		
	},
	getPPure: function(a, b, c, T) {
		Math.pow(10, a - b / (T + c));
	},
	deleteCount: function(spcInfo) {
		for (var a in spcInfo) {
			delete spcInfo[a].count;
		}
	},
	makeDrawList: function(dotMgr) {
		var sacArray = dotMgr.lists.ALLDOTS.concat();
		var draw = [];
		for (var i=0; i<dotMgr.lists.ALLDOTS.length; i++) {
			var spliceIdx = Math.floor(Math.random() * sacArray.length);
			draw.push(sacArray[spliceIdx]);
			sacArray.splice(spliceIdx, 1);
		}
		return draw;
		
		
	}
	
})

Liquid.prototype.Species = function(spcName, count, hVap, cP, spcVol, antoineCoeffs) {
	this.spcName = spcName;
	this.count = count;
	this.hVap = hVap;
	this.cP = cP;
	this.spcVol = spcVol;
	this.antoineCoeffs = antoineCoeffs;
}
