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
	this.temp = tempInit;
	this.spcInfo = this.makeSpcInfo(attrs.spcInfo); //formatted as {spc1: {count: #, spcVol: #, cP: #, antoineCoeffs: {a: #,b: #,c: #}, hVap: #} ... } spcVol in L/mol
	this.drivingForce = this.makeDrivingForce(this.spcInfo);
	this.dotMgrLiq = this.makeDotManager(this.spcInfo);
	this.wallLiq = this.makeWallLiq(this.spcInfo, this.wallGas, this.wallPtIdxs, this.dotMgrLiq);
	this.makeDots(this.wallLiq, this.spcInfo, tempInit, this.dotMgrLiq) && this.deleteCount(this.spcInfo);
	this.dataGas = this.initData(this.wallGas, this.spcInfo, ['pInt']);
	this.dataLiq = this.initData(this.wallLiq, this.spcInfo, ['temp']);
	this.drawList = this.makeDrawList(this.dotMgrLiq); //need to make draw list in random order otherwise dots drawn on top will look more prominant than they are.
	this.actCoeffFuncs = this.makeActCoeffFuncs(this.actCoeffType, this.actCoeffInfo, this.spcInfo);
	
	this.updateListenerName = this.type + this.handle;
	this.setupUpdate(this.spcInfo, this.dataGas, this.dataLiq, this.actCoeffFuncs, this.drivingForce, this.updateListenerName, this.drawList, this.dotMgrLiq, this.wallLiq)
	
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
	makeWallLiq: function(spcInfo, wallGas, wallPtIdxs, dotMgrLiq, handle) {
		var vol = this.getLiqWallVol(spcInfo);
		//liq wall needs to go in opposite direction of gas wall
		var pts = this.getWallLiqPts(wallGas, wallPtIdxs, vol);
		var handler = {func: this.hit, obj: this};
		window.walls.addWall({pts:pts, handler:handler, handle: 'liquid' + this.handle.toCapitalCamelCase(), record: false, show: false, dotManager: dotMgrLiq});
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
	setupUpdate: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName, drawList, dotMgrLiq, wallLiq) {
		this.setupUpdateEquil(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName);
		this.setupUpdateDraw(drawList, listenerName);
		this.setupUpdateMove(dotMgrLiq, spcInfo, listenerName, wallLiq);
		//eject
	},
	setupUpdateEquil: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName) {
		var self = this;
		addListener(curLevel, 'update', listenerName + 'Equil', function() {
			for (var spcName in spcInfo) {
				var spc = spcInfo[spcName];
				var gasFrac = dataGas[spcName][dataGas[spcName].length - 1];
				var liqFrac = dataLiq[spcName][dataLiq[spcName].length - 1];
				var liqTemp = dataLiq.temp[dataLiq.temp.length - 1];
				var actCoeff = actCoeffFuncs[spcName](liqFrac, liqTemp);
				var antCoeffs = spcInfo[spcName].antoineCoeffs;
				var pPure = self.getPPure(antCoeffs.a, antCoeffs.b, antCoeffs.c, liqTemp);
				var pEq = pPure * actCoeff * liqFrac;
				var pGas = gasFrac * dataGas.pInt[dataGas.pInt.length - 1];
				drivingForce[spcName] = pGas - pEq;
			}
		})	
	},
	setupUpdateDraw: function(drawList, listenerName) {
		addListener(curLevel, 'update', listenerName + 'Draw', function() {
			window.draw.dotsAsst(drawList);
		});
	},
	setupUpdateMove: function(dotMgr, spcInfo, listenerName, wallLiq) {
		var self = this;
		var dotLists = [];
		for (var spcName in spcInfo) {
			dotLists.push(dotMgr.get({spcName: spcName}));
		}
		var rndVec = 
		addListener(curLevel, 'update', listenerName + 'Move', function() {
			var stepSize, i, len, moveVec, dotMass, numGroups;
			var getMoveVec = function(mass, temp) {
				
			}
			//reducing number of vectors I have to make while making motion look random by stepping at random intervals

			var xMax = wallLiq[2].x;
			var xMin = wallLiq[1].x;
			var yMax = wallLiq[1].y;
			var yMin = wallLiq[0].y;
			
			for (var listIdx=0; listIdx<dotLists.length; listIdx++) {
				var dots = dotLists[listIdx];
				len = dots.length;
				dotMass = dots[0].m;
				stepSize = 15 + Math.ceil(Math.random() * 15);
				for (var groupNum=0; groupNum<stepSize; groupNum++) {
					var mag = tempToV(dotMass, self.temp);
					var dir = Math.PI * 2 * Math.random();
					moveVec = V(Math.cos(dir) * mag, Math.sin(dir) * mag);
					for (var dotIdx=groupNum; dotIdx<len; dotIdx+=stepSize) {
						dots[dotIdx].x = Math.max(xMin, Math.min(xMax, dots[dotIdx].x + moveVec.dx));
						dots[dotIdx].y = Math.max(yMin, Math.min(yMax, dots[dotIdx].y + moveVec.dy));
					}
				}

			}
		})

		
	},
	getPPure: function(a, b, c, T) {
		return Math.pow(10, a - b / (T + c));
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
		
		
	},
	hit: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		WallMethods.collideMethods.reflect(dot, wallUV, perpV);
	},

	
})

Liquid.prototype.Species = function(spcName, count, hVap, cP, spcVol, antoineCoeffs) {
	this.spcName = spcName;
	this.count = count;
	this.hVap = hVap;
	this.cP = cP;
	this.spcVol = spcVol;
	this.antoineCoeffs = antoineCoeffs;
}
