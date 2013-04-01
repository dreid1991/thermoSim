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
	var makePhaseDiagram = attrs.makePhaseDiagram;
	this.Cp = 0; //to be set each turn/absorption and used in setting temperatures for reflecting dots.  Capital C denotes total heat capacity.
	var tempInit = attrs.tempInit;
	this.temp = tempInit;
	var spcCounts = attrs.spcCounts; //{spcA: 100, spcB:200}
	this.spcDefs = this.getSpcDefs(spcCounts);
	this.drivingForce = this.makeDrivingForce(this.spcDefs);
	this.dotMgrLiq = this.makeDotManager(this.spcDefs);
	this.wallLiq = this.makeWallLiq(this.spcDefs, spcCounts, this.wallGas, this.wallPtIdxs, this.dotMgrLiq);
	this.surfAreaObj = this.wallGas.addSurfAreaAdjust(this.handle);
	this.numAbs = deepCopy(this.drivingForce);
	this.numEjt = deepCopy(this.numAbs);
	this.makeDots(this.wallLiq, this.wallGas, this.wallPtIdxs, spcCounts, tempInit, this.dotMgrLiq) && this.deleteCount(this.spcDefs);
	this.dataGas = this.initData(this.wallGas, this.spcDefs, ['pInt', 'temp']);
	this.dataLiq = this.initData(this.wallLiq, this.spcDefs);
	this.recordTempLiq(this.wallLiq);
	this.drawList = this.makeDrawList(this.dotMgrLiq); //need to make draw list in random order otherwise dots drawn on top will look more prominant than they are.
	this.actCoeffFuncs = this.makeActCoeffFuncs(this.actCoeffType, this.actCoeffInfo, this.spcDefs);
	this.chanceZeroDf = .4;
	this.drivingForceSensitivity = 10;//formalize this a bit
	this.updateListenerName = this.type + this.handle;
	this.setupUpdate(this.spcDefs, this.dataGas, this.dataLiq, this.actCoeffFuncs, this.drivingForce, this.updateListenerName, this.drawList, this.dotMgrLiq, this.wallLiq, this.numAbs, this.drivingForceSensitivity, this.numEjt, this.wallGas, this.wallPtIdxs, this.surfAreaObj);
	this.wallGas.addLiquid(this);
	if (makePhaseDiagram) this.phaseDiagram = this.makePhaseDiagram(this, this.spcDefs, this.actCoeffFuncs, this.handle, attrs.primaryKey);
	this.setupStd();
}

_.extend(Liquid.prototype, objectFuncs, {
	getSpcDefs: function(counts) {
		var usedSpcs = {};
		for (var spc in counts) {
			usedSpcs[spc] = window.spcs[spc];
		}
		return usedSpcs;
	},
	makeActCoeffFuncs: function(type, info, spcDefs) {
		if (type == 'twoSfxMrg') {
			var coeff = info.a
			return this.makeTwoSfxMrgFuncs(spcDefs, coeff);
		}
	},
	makeTwoSfxMrgFuncs: function(spcDefs, coeff) {
		var funcs = {};
		var gasConst = R;
		for (var spcName in spcDefs) {
			funcs[spcName] = function(x, T) {
				return Math.exp(coeff * x * x / (gasConst * T)); 
			}
		}
		return funcs;
	},
	makeWallLiq: function(defs, counts, wallGas, wallPtIdxs, dotMgrLiq, handle) {
		var vol = this.getLiqWallVol(defs, counts);
		//liq wall needs to go in opposite direction of gas wall
		var pts = this.getWallLiqPts(wallGas, wallPtIdxs, vol);
		var handler = {func: this.hit, obj: this};
		return window.walls.addWall({pts:pts, handler:handler, handle: 'liquid' + this.handle.toCapitalCamelCase(), record: false, show: true, dotManager: dotMgrLiq, close: false});
	},
	makeNumAbsorbed: function(spcDefs) {
		var nA = {};
		for (var spcName in spcDefs) {
			nA[spcName] = 0;
		}
		return nA;
	},
	
	getLiqWallVol: function(spcDefs, counts, dotMgr) {
		var vol = 0;
		if (!dotMgr) {
			for (var spcName in spcDefs) {
				vol += spcDefs[spcName].spcVolLiq * counts[spcName] / N;
			}
		} else {
			for (var spcName in spcDefs) {
				vol += spcDefs[spcName].spcVolLiq * dotMgr.get({spcName: spcName}).length / N;
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
		return [topRight, topLeft];
	},
	getWallHeight: function(width, vol) {
		return vol/(vConst*width) + 2;
	},
	makeDotManager: function(defs) {
		var dotMgr = new DotManager();
		for (var spcName in defs) {
			dotMgr.addSpcs(spcName);
		}
		return dotMgr;
	},
	makeDots: function(wallLiq, wallGas, wallGasIdxs, counts, temp, dotMgrLiq) {
		var pos = wallLiq[1].copy();
		var b = P(Math.max(wallGas[wallGasIdxs[0]].x, wallGas[wallGasIdxs[1]].x), wallGas[wallGasIdxs[0]].y);
		var dims = pos.VTo(b);
		
		for (var spcName in counts) {
			spcs[spcName].populate(pos, dims, counts[spcName], temp, wallLiq.handle, wallLiq.handle, dotMgrLiq); 
		}
	},
	recordTempLiq: function(wallLiq) {
		var self = this;
		wallLiq.recordTemp(function() {
			return self.temp;
		})
	},
	initData: function(wall, spcDefs, extras) {
		var data = {};
		if (extras) {
			for (var extraIdx=0; extraIdx<extras.length; extraIdx++) {
				var extra = extras[extraIdx];
				var dataObj = wall.getDataObj(extra, undefined, true);
				if (dataObj === false) {
					var recordFunc = 'record' + extra.toCapitalCamelCase();
					wall[recordFunc]();
					data[extra] = wall.getDataObj(extra).src();
				} else {
					data[extra] = dataObj.src();
				}
			}
		}
		for (var spcName in spcDefs) {
			var attrs = {spcName: spcName, tag: wall.handle};
			wall.recordFrac(attrs)
			data[spcName] = wall.getDataObj('frac', attrs).src();
		}
		return data;
	},
	makeDrivingForce: function(spcDefs) {
		var force = {};
		for (var spcName in spcDefs) {
			force[spcName] = 0;
		}
		return force;
	},
	setupUpdate: function(spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, listenerName, drawList, dotMgrLiq, wallLiq, numAbs, drivingForceSensitivity, numEjt, wallGas, wallGasIdxs, wallSurfAreaObj) {
		this.calcCp = this.setupCalcCp(spcDefs, dotMgrLiq);
		this.calcEquil = this.setupUpdateEquil(spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce);
		this.drawDots = this.setupDrawDots(drawList);
		this.moveDots = this.setupMoveDots(dotMgrLiq, spcDefs, wallLiq, wallGas, wallGasIdxs);
		this.ejectDots = this.setupEjectDots(dotMgrLiq, spcDefs, drivingForce, numAbs, drivingForceSensitivity, drawList, wallLiq, numEjt);//you were making the liquid eject if df<0 whether hit or not
		var sizeWall = this.setupSizeWall(wallLiq, wallGas, spcDefs, dotMgrLiq, wallGasIdxs, wallSurfAreaObj)
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
		})
	},
	setupCalcCp: function(spcDefs, dotMgrLiq) {
		var self = this;
		var dotLists = {};
		for (var spcName in spcDefs) {
			dotLists[spcName] = dotMgrLiq.get({spcName: spcName});
		}
		return function() {
			var Cp = 0;
			for (var spcName in spcDefs) {
				Cp += spcDefs[spcName].cpLiq * dotLists[spcName].length / N; //Cp in J/K  spcDefs given in J/mol-k
			}
			self.Cp = Cp;	
		}

	},
	setupUpdateEquil: function(spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce) {
		var self = this;
		return function() {
			for (var spcName in spcDefs) {
				var spc = spcDefs[spcName];
				var gasFrac = dataGas[spcName][dataGas[spcName].length - 1];
				var liqFrac = dataLiq[spcName][dataLiq[spcName].length - 1];
				var liqTemp = self.temp;
				var actCoeff = actCoeffFuncs[spcName](liqFrac, liqTemp);
				var antCoeffs = spcDefs[spcName].antoineCoeffs;
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
	setupMoveDots: function(dotMgr, spcDefs, wallLiq, wallGas, wallGasIdxs) {
		var self = this;
		
		var dotLists = [];
		for (var spcName in spcDefs) {
			dotLists.push(dotMgr.get({spcName: spcName}));
		}
		return function() {
			var stepSize, i, len, moveVec, dotMass, numGroups;
			//reducing number of vectors I have to make while making motion look random by stepping at random intervals

			var xMax = wallLiq[0].x;
			var xMin = wallLiq[1].x;
			var yMax = wallGas[wallGasIdxs[0]].y;
			var yMin = wallLiq[0].y;
			
			for (var listIdx=0; listIdx<dotLists.length; listIdx++) {
				var dots = dotLists[listIdx];
				len = dots.length;
				if (len) {
					dotMass = dots[0].m;
					stepSize = 15 + Math.ceil(Math.random() * 15);
					for (var groupNum=0; groupNum<stepSize; groupNum++) {
						var mag = tempToV(dotMass, self.temp) * .5;
						var dir = Math.PI * 2 * Math.random();
						moveVec = V(Math.cos(dir) * mag, Math.sin(dir) * mag);
						for (var dotIdx=groupNum; dotIdx<len; dotIdx+=stepSize) {
							dots[dotIdx].x = Math.max(xMin, Math.min(xMax, dots[dotIdx].x + moveVec.dx));
							dots[dotIdx].y = Math.max(yMin, Math.min(yMax, dots[dotIdx].y + moveVec.dy));
						}
					}
				}
			}
		};

		
	},
	setupEjectDots: function(dotMgrLiq, spcDefs, drivingForce, numAbs, drivingForceSensitivity, drawList, wallLiq, numEjt) {
		var self = this;
		var wallGas = this.wallGas;
		var dotLists = {};
		for (var spcName in spcDefs) {
			dotLists[spcName] = dotMgrLiq.get({spcName: spcName});
		}
		return function() {
			for (var spcName in spcDefs) {
				var dF = drivingForce[spcName];
				var abs = numAbs[spcName];
				numAbs[spcName] = 0;
				//converges to abs as df -> 0
				
				if (dF > 0) { 
					numEjt[spcName] += abs / (dF * drivingForceSensitivity + 1);
				} else {
					numEjt[spcName] += 1 + Math.sqrt(abs * (-dF * drivingForceSensitivity + 1));
					numEjt[spcName] += (wallLiq[0].x - wallLiq[1].x) * -dF * drivingForceSensitivity / 2000;
				}
				//numEjt[spcName] = 1;
				numEjt[spcName] = Math.min(numEjt[spcName], dotLists[spcName].length);
				var flr = Math.floor(numEjt[spcName])
				
				if (flr) {
					self.eject(dotMgrLiq, window.dotManager, spcDefs, spcName, flr, wallGas, drawList, wallLiq);
					numEjt[spcName] = 0;
				}
			}
		}
	},
	setupSizeWall: function(wallLiq, wallGas, spcDefs, dotMgrLiq, wallGasIdxs, surfAreaObj) {
		var self = this;
		return function() {
			var vol = self.getLiqWallVol(spcDefs, undefined, dotMgrLiq);
			var height = self.getWallHeight(Math.abs(wallGas[wallGasIdxs[0]].x - wallGas[wallGasIdxs[1]].x), vol);
			wallLiq[0].y = wallGas[wallGasIdxs[0]].y - height;
			wallLiq[1].y = wallGas[wallGasIdxs[0]].y - height;
			wallLiq.parent.setupWall(wallLiq.parent.indexOf(wallLiq));
			surfAreaObj.val = 2 * height + wallLiq[1].x - wallLiq[0].x;
		}
	},
	eject: function(dotMgrLiq, dotMgrGas, spcDefs, spcName, numEject, wallGas, drawList, wallLiq) {
		//going to take energy out of ejected dot rather than liquid. 

		var CpOld = this.Cp;
		var dHLiq = 0;
		var dotList = dotMgrLiq.get({spcName: spcName})
		var sliceIdx = Math.min(dotList.length, numEject);
		
		var toTransfer = dotList.slice(0, sliceIdx);
		dotMgrLiq.remove(toTransfer);
		//taking energy out of liquid.  If I did from ejecting gas molec, would not be able to vaporize below a temp because tEject would be < 0
		for (var transIdx=0; transIdx<toTransfer.length; transIdx++) {
			var dot = toTransfer[transIdx];
			dot.setTemp(this.temp);
			var hVap = dot.hVap();
			dot.v.dy = -Math.abs(toTransfer[transIdx].v.dy)
			dot.y = wallLiq[0].y - 1;
			dot.setWall(wallGas.handle);
			drawList.splice(drawList.indexOf(dot), 1);
			this.calcCp();
			this.temp -= hVap / this.Cp;
		}
		dotMgrGas.add(toTransfer);
	},
	getPPure: function(a, b, c, T) {
		return Math.pow(10, a - b / (T + c)) * MMHGTOBAR; //C is Kelvin
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
				return this.absorbDot(dot, this.drawList, this.dotMgrLiq, this.wallLiq, this.spcDefs);//need to set Cp in this;
			}
		}
		this.adjTemps(dot, wallUV, perpV, this.dataGas, this.dataLiq, this.temp, window.dotManager.spcLists, this.spcDefs);
		
		
	},
	absorbDot: function(dot, drawList, dotMgrLiq, wallLiq, spcDefs) {
		var dotMgrGas = window.dotManager; 
		dotMgrGas.remove(dot);
		drawList.splice(Math.floor(Math.random() * drawList.length), 0, dot);
		dot.setWall(wallLiq.handle);
		dotMgrLiq.add(dot);
		var tempDotF = dot.tempCondense();
		var CpLiqOld = this.Cp;
		this.calcCp();
		this.temp = (this.temp * CpLiqOld + tempDotF * dot.cpLiq) / this.Cp;
		this.numAbs[dot.spcName]++;
		return false; //returning false isn't used here, but I like to return false when a dot is removed from a dot/wall collision check because it is used in dot collisions.  Feels consistent.  
	},
	adjTemps: function(dot, wallUV, perpV, dataGas, dataLiq, tLiq, gasSpcLists, spcDefs) {
		
		var tGas = dataGas.temp[dataGas.temp.length - 1];
		var tDot = dot.temp();
		var CDot = dot.cv;
		var CGas = 0;
		for (var spcName in spcDefs) CGas += gasSpcLists[spcName].length * spcDefs[spcName].cv / N;
		
		
		var sign = getSign(tLiq - tGas);
		var tEq = (this.Cp * tLiq + CGas * tGas) / (this.Cp + CGas);
		var qMax = Math.abs((tLiq - tEq) * this.Cp);
		
		var qToDot = Math.max(sign * Math.min(qMax, 100 * CDot), (5 - tDot) * CDot);
		
		var tDotTarget = tDot + qToDot / CDot;

		var tempTest = this.temp - qToDot / this.Cp;
		this.temp -= qToDot / this.Cp;
		

		var vRatio = Math.sqrt(tDotTarget / tDot); //inlining vRatio show dot.setTemp so I don't have to sqrt unnecessarily
		dot.v.mult(vRatio);
		dot.internalPotential *= tDotTarget / tDot;
		WallMethods.collideMethods.reflect(dot, wallUV, perpV * vRatio);
	},
	getWallLiq: function() {
		return this.wallLiq;
	},
	getWallGas: function() {
		return this.wallGas;
	},
	addQ: function(q) {
		var Cp = this.Cp;
		var temp = this.temp;
		q = Math.min(Cp * (3000 - temp), Math.max((-temp + 10) * Cp, q));
		this.temp += q / Cp;
		console.log(q/Cp);
		this.wallLiq.q += q;
	},
	makePhaseDiagram: function(liquid, spcDefs, actCoeffFuncs, handle, primaryKey) {
		var spcAName, spcBName
		//var primaryKey = 'Heavy';
		for (var spcName in spcDefs) {
			if (!spcAName) {
				spcAName = spcName;
			} else {
				spcBName = spcName;
			}
		}
		var axisInit = {x: {min: 0, max: 1}, y: {min: 200, max: 400}};
		
		var graph = new GraphPhase({spcAName: spcAName, spcBName: spcBName, axisInit: axisInit, actCoeffFuncs: actCoeffFuncs, handle: handle, primaryKey: primaryKey, liquid: this, wallGas: this.wallGas});
		return graph;
	},
	remove: function() {
		removeListener(curLevel, 'update', this.updateListenerName);
		this.wallGas.removeLiquid(this);
		if (!this.wallLiq.removed) walls.removeWall(this.wallLiq.handle);
		if (!this.wallGas.removed) this.wallGas.removeSurfAreaAdjust(this.handle);
	},
})


