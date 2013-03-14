function Liquid(attrs) {
	//driving force convention: positive -> into liquid, neg -> into vapor
	this.type = 'Liquid';
	this.wallInfo = attrs.wallInfo;
	this.wallGas = walls[this.wallInfo];
	this.wallPts = attrs.wallPts || [this.wallGas[this.wallGas.length - 2], this.wallGas[this.wallGas.length - 3]];
	this.handle = attrs.handle;
	this.cleanUpWith = attrs.cleanUpWith || currentSetupType;
	var actCoeffType = attrs.actCoeffType; //twoSfxMrg for two suffix margules, 
	var actCoeffInfo = attrs.actCoeffInfo;
	
	var tempInit = attrs.tempInit;
	var spcInfo = this.makeSpcInfo(attrs.spcInfo); //formatted as {spc1: {count: #, spcVol: #, antoineCoeffs: {a: #,b: #,c: #}, hVap: #} ... } spcVol in L/mol
	var drivingForce = this.makeDrivingForce(spcInfo);
	this.wallLiq = this.makeWallLiq(spcInfo, this.wallGas, this.wallPts);
	var dataGas = this.initData(this.wallGas, spcInfo, ['pInt']);
	var dataLiq = this.initData(this.wallLiq, spcInfo, ['temp']);
	var dotMgrLiq = new DotManager();
	var drivingForces = this.
	this.makeDots(this.wallLiq, spcInfo, tempInit, dotMgrLiq);
	this.rndDots = this.makeRndDots(dotManagerLiq);
	this.actCoeffFuncs = this.makeActCoeffFuncs(actCoeffType, actCoeffInfo, spcList);
	
	this.updateListenerName = this.type + this.handle;
	this.setupUpdate(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, this.updateListenerName)
	//this.setupStd();
}

_.extend(Liquid.prototype, objectFuncs, {
	makeActCoeffFuncs: function(type, info, spcList) {
		if (type == 'twoSfxMrg') {
			var coeff = info.a
			return this.makeTwoSfxMrgFuncs(spcList, coeff);
		}
	},
	makeTwoSfxMrgFuncs: function(spcList, coeff) {
		var funcs = {};
		var gasConst = R;
		for (var spcIdx=0; spcIdx<spcList.length; spcIdx++) {
			var spcName = spcList[spcIdx];
			funcs[spcName] = function(x, T) {
				return Math.exp(coeff * x * x / (gasConst * T)); 
			}
		}
		return funcs;
	},
	makeWallLiq: function(spcInfo, wallGas, wallPts) {
		var vol = this.getLiqWallVol(spcInfo);
		//liq wall needs to go in opposite direction of gas wall
		var pts = this.getWallLiqPts(wallGas, wallGasPts, vol);
		var handler = {func: this.hit, obj: this};
		window.walls.addWall({pts:pts, handler:handler, handle: 'liquid' + this.handle, record: false, show: false});
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
			reformat[infolet] = new this.Species(infolet, spc.count, spc.hVap, spc.spcVol, spc.antoineCoeffs);
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
	setupUpdate: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName) {
		addListener(curLevel, 'update', listenerName, function() {
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
	getPPure: function(a, b, c, T) {
		Math.pow(10, a - b / (T + c));
	}
	
})

Liquid.prototype.Species = function(spcName, count, hVap, spcVol, antoineCoeffs) {
	this.spcName = spcName;
	this.count = count;
	this.hVap = hVap;
	this.spcVol = spcVol;
	this.antoineCoeffs = antoineCoeffs;
}
