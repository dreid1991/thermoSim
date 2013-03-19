function Liquid(attrs) {
	//driving force convention: positive -> into liquid, neg -> into vapor
	//still need to do pInt adjustment for wallGas
	this.type = 'Liquid';
	this.wallInfo = attrs.wallInfo;
	this.wallGas = walls[this.wallInfo];
	this.wallPtIdxs = attrs.wallPts || [this.wallGas.length - 2, this.wallGas.length - 3];
	this.handle = attrs.handle;
	this.cleanUpWith = attrs.cleanUpWith || currentSetupType;
	this.actCoeffType = attrs.actCoeffType; //twoSfxMrg for two suffix margules, 
	this.actCoeffInfo = attrs.actCoeffInfo;
	this.Cp = 0; //to be set each turn/absorption and used in setting temperatures for reflecting dots.  Capital C denotes total heat capacity.
	var tempInit = attrs.tempInit;
	this.temp = tempInit;
	this.spcInfo = this.makeSpcInfo(attrs.spcInfo); //formatted as {spc1: {count: #, spcVol: #, cP: #, antoineCoeffs: {a: #,b: #,c: #}, hVap: #} ... } spcVol in L/mol, hVap in kj/mol
	this.drivingForce = this.makeDrivingForce(this.spcInfo);
	this.dotMgrLiq = this.makeDotManager(this.spcInfo);
	this.wallLiq = this.makeWallLiq(this.spcInfo, this.wallGas, this.wallPtIdxs, this.dotMgrLiq);
	this.numAbs = this.makeNumAbsorbed(this.spcInfo);
	this.makeDots(this.wallLiq, this.spcInfo, tempInit, this.dotMgrLiq) && this.deleteCount(this.spcInfo);
	this.dataGas = this.initData(this.wallGas, this.spcInfo, ['pInt']);
	this.dataLiq = this.initData(this.wallLiq, this.spcInfo, ['temp']);
	this.drawList = this.makeDrawList(this.dotMgrLiq); //need to make draw list in random order otherwise dots drawn on top will look more prominant than they are.
	this.actCoeffFuncs = this.makeActCoeffFuncs(this.actCoeffType, this.actCoeffInfo, this.spcInfo);
	this.chanceZeroDf = .2;
	this.drivingForceSensitivity = 10;//formalize this a bit
	this.updateListenerName = this.type + this.handle;
	this.setupUpdate(this.spcInfo, this.dataGas, this.dataLiq, this.actCoeffFuncs, this.drivingForce, this.updateListenerName, this.drawList, this.dotMgrLiq, this.wallLiq, this.numAbs, this.drivingForceSensitivity)
	
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
	makeNumAbsorbed: function(spcInfo) {
		var nA = {};
		for (var spcName in spcInfo) {
			nA[spcName] = 0;
		}
		return nA;
	},
	getLiqWallVol: function(spcInfo, dotMgr) {
		var vol = 0;
		if (!dotMgr) {
			for (var spcName in spcInfo) {
				vol += spcInfo[spcName].spcVol * spcInfo[spcName].count / N;
			}
		} else {
			for (var spcName in spcInfo) {
				vol += spcInfo[spcName].spcVol * dotMgr.get({spcName: spcName}).length / N;
			}
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
	setupUpdate: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName, drawList, dotMgrLiq, wallLiq, numAbs, drivingForceSensitivity) {
		this.calcCp = this.setupCalcCp(spcInfo, dotMgrLiq);
		this.calcEquil = this.setupUpdateEquil(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce);
		this.drawDots = this.setupDrawDots(drawList);
		this.moveDots = this.setupMoveDots(dotMgrLiq, spcInfo, wallLiq);
		this.ejectDots = this.setupEjectDots(dotMgrLiq, spcInfo, drivingForce, numAbs, drivingForceSensitivity, drawList, wallLiq);
		var sizeWall = this.setupSizeWall(wallLiq, spcInfo, dotMgrLiq)
		var zeroAttrs = this.zeroAttrs;
		var calcCp = this.calcCp, calcEquil = this.calcEquil, drawDots = this.drawDots, moveDots = this.moveDots, ejectDots = this.ejectDots;
		calcCp();
		addListener(curLevel, 'update', listenerName, function() {
			calcCp();
			calcEquil();
			drawDots();
			moveDots();
			ejectDots();
			sizeWall();
			zeroAttrs(numAbs);
		})
	},
	setupCalcCp: function(spcInfo, dotMgrLiq) {
		var self = this;
		return function() {
			var Cp = 0;
			for (var spcName in spcInfo) {
				Cp += spcInfo[spcName].cP * dotMgrLiq.get({spcName: spcName}).length / N; //Cp in J/K  spcInfo given in J/mol-k
			}
			self.Cp = Cp;	
		}

	},
	zeroAttrs: function(a) {
		for (var aLet in a) {
			a[aLet] = 0;
		}
	},
	setupUpdateEquil: function(spcInfo, dataGas, dataLiq, actCoeffFuncs, drivingForce) {
		var self = this;
		return function() {
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
		}
	},
	setupDrawDots: function(drawList) {
		return function() {
			window.draw.dotsAsst(drawList);
		};
	},
	setupMoveDots: function(dotMgr, spcInfo, wallLiq) {
		var self = this;
		var dotLists = [];
		for (var spcName in spcInfo) {
			dotLists.push(dotMgr.get({spcName: spcName}));
		}
		return function() {
			var stepSize, i, len, moveVec, dotMass, numGroups;
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
		};

		
	},
	setupEjectDots: function(dotMgrLiq, spcInfo, drivingForce, numAbs, drivingForceSensitivity, drawList, wallLiq) {
		var self = this;
		var wallGas = this.wallGas;
		return function() {
			var numEject;
			for (var spcName in spcInfo) {
				var dF = drivingForce[spcName];
				var abs = numAbs[spcName];
				//converges to abs as df -> 0
				if (dF > 0) {
					numEject = Math.round(abs / (dF * drivingForceSensitivity + 1));
				} else {
					numEject = Math.round(abs * (-dF * drivingForceSensitivity + 1));
				}
				if (numEject) {
					self.eject(dotMgrLiq, window.dotManager, spcInfo, spcName, numEject, wallGas, drawList, wallLiq);
				}
			}
		}
	},
	setupSizeWall: function(wall, spcInfo, dotMgrLiq) {
		var self = this;
		return function() {
			var vol = self.getLiqWallVol(spcInfo, dotMgrLiq);
			var height = self.getWallHeight(wall[2].x - wall[1].x, vol);
			wall[0].y = wall[1].y - height;
			wall[3].y = wall[1].y - height;
			wall[4].y = wall[1].y - height;
		}
	},
	eject: function(dotMgrLiq, dotMgrGas, spcInfo, spcName, numEject, wallGas, drawList, wallLiq) {
		//going to take energy out of ejected dot rather than liquid. 
		var info = spcInfo[spcName];
		var hVapPerDot = info.hVap * 1000 / N; //1000/N = 1, but if I ever change N, I don't want this to be a sneaky problem.
		var cDot = window.cv;
		var dHLiq = 0;
		var dotList = dotMgrLiq.get({spcName: spcName})
		var sliceIdx = Math.min(dotList.length, numEject);
		
		var toTransfer = dotList.slice(0, sliceIdx);
		dotMgrLiq.remove(toTransfer);
		//hey - you should *probably* take energy out of the liquid, not the gas because the gas will be colder than it should be due to fast gas molecs hitting liq surface more often
		var tempEject = this.temp - hVapPerDot / cDot;
		for (var transIdx=0; transIdx<toTransfer.length; transIdx++) {
			var dot = toTransfer[transIdx];
			dot.setTemp(tempEject);
			dot.v.dy = -Math.abs(toTransfer[transIdx].v.dy)
			dot.y = wallLiq[0].y - 1;
			dot.setWall(wallGas.handle);
			drawList.splice(drawList.indexOf(dot), 1);
		}
		dotMgrGas.add(toTransfer);
	},
	getPPure: function(a, b, c, T) {
		return Math.pow(10, a - b / (T + c)) * MMHGTOBAR; //C is Kelvin
	},
	deleteCount: function(spcInfo) {
		for (var a in spcInfo) {
			delete spcInfo[a].count;
		}
	},
	makeDrawList: function(dotMgr) {
		//sacrifial array that I take dots from to make randomly ordered list.  
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
		//it's a sigmoid!
		var dF = this.drivingForce;
		if (dF[dot.spcName] !== undefined) {
			var chanceZero = this.chanceZeroDf;
			var a = chanceZero / (1 - chanceZero);
			var chanceAbs = a / (a + Math.exp(-dF[dot.spcName] * this.drivingForceSensitivity));
			if (chanceAbs > Math.random()) {
				return this.absorbDot(dot, this.drawList, this.dotMgrLiq, this.wallLiq, this.spcInfo);//need to set Cp in this;
			}
		}
		this.equalizeTemps(dot, wallUV, perpV);
		
		
	},
	absorbDot: function(dot, drawList, dotMgrLiq, wallLiq, spcInfo) {
		var dotMgrGas = window.dotManager; 
		dotMgrGas.remove(dot);
		drawList.splice(Math.floor(Math.random() * drawList.length), 0, dot);
		dot.setWall(wallLiq.handle);
		dotMgrLiq.add(dot);
		var hVap = spcInfo[dot.spcName].hVap; //in kj/mol
		this.calcCp();
		this.temp += hVap * 1000 / (this.Cp * N); //converting to j/dot
		this.numAbs[dot.spcName]++;
		return false; //returning false isn't used here, but I like to return false when a dot is removed from a dot/wall collision check because it is used in dot collisions.  Feels consistent.  
	},
	equalizeTemps: function(dot, wallUV, perpV) {
		var CLiq = this.Cp;
		var CDot = cv / N; //I think cv is right, because CpLiq is basically cv as well
		var tLiq = this.temp;
		var tDot = dot.temp();
		var tF = (CLiq * tLiq + CDot * tDot) / (CLiq + CDot);
		this.temp = tF;
		var vRatio = Math.sqrt(tF / tDot); //inlining vRatio show dot.setTemp so I don't have to sqrt unnecessarily
		dot.v.mult(vRatio);
		WallMethods.collideMethods.reflect(dot, wallUV, perpV * vRatio);
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
