/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function Liquid(attrs) {
	//driving force convention: positive -> into liquid, neg -> into vapor
	//still need to do pInt adjustment for wallGas
	this.type = 'Liquid';
	this.wallInfo = attrs.wallInfo;
	this.wallGas = walls[this.wallInfo];
	this.wallPtIdxs = attrs.wallPts || [this.wallGas.length - 2, this.wallGas.length - 3];
	this.handle = attrs.handle;
	this.actCoeffType = attrs.actCoeffType || 'ideal'; //twoSfxMrg for two suffix margules, 
	this.actCoeffInfo = attrs.actCoeffInfo;
	var makePhaseDiagram = attrs.makePhaseDiagram;
	this.Cp = 0; //to be set each turn/absorption and used in setting temperatures for reflecting dots.  Capital C denotes total heat capacity.
	var tempInit = attrs.tempInit;
	this.temp = tempInit;
	var spcCounts = attrs.spcCounts; //{spcA: 100, spcB:200}
	this.spcDefs = this.getSpcDefs(spcCounts);
	this.tempDisplay = this.temp;
	this.isTwoComp = countAttrs(this.spcDefs) == 2;
	this.spcA = getNth(this.spcDefs, 0);
	if (this.isTwoComp) this.spcB = getNth(this.spcDefs, 1);
	
	this.drivingForce = this.makeDrivingForce(this.spcDefs);
	this.dotMgrLiq = this.makeDotManager(this.spcDefs);
	this.wallLiq = this.makeWallLiq(this.spcDefs, spcCounts, this.wallGas, this.wallPtIdxs, this.dotMgrLiq);
	this.surfAreaObj = this.wallGas.addSurfAreaAdjust(this.handle);
	this.numAbs = deepCopy(this.drivingForce);
	this.numEjt = deepCopy(this.numAbs);
	this.makeDots(this.wallLiq, this.wallGas, this.wallPtIdxs, spcCounts, tempInit, this.dotMgrLiq) && this.deleteCount(this.spcDefs);
	this.dataGas = this.initData(this.wallGas, this.spcDefs, ['pInt', 'temp']);
	this.setupGrabPExt(this.wallGas, this.dataGas);
	this.dataLiq = this.initData(this.wallLiq, this.spcDefs);
	this.recordTempLiq(this.wallLiq);
	this.drawList = this.makeDrawList(this.dotMgrLiq); //need to make draw list in random order otherwise dots drawn on top will look more prominant than they are.
	this.actCoeffFuncs = this.makeActCoeffFuncs(this.actCoeffType, this.actCoeffInfo, this.spcDefs);
	this.chanceZeroDf = .4;
	this.drivingForceSensitivity = 10;//formalize this a bit
	this.updateListenerName = this.type + this.handle;
	this.phasePressure = attrs.phasePressure || 1;
	this.makePhaseDiagram = this.wrapMakePhaseDiagram(this, this.spcDefs, this.actCoeffFuncs, 'liquid' + this.handle.toCapitalCamelCase(), attrs.primaryKey, attrs.makeGasMarker, attrs.makeSystemMarker, attrs.makeLiquidMarker, this.phasePressure);
	if (makePhaseDiagram) {
	
		this.phaseDiagram = this.makePhaseDiagram();
		//this.phaseDiagram.setPressure(this.phasePressure);
	}
	this.updateEquilData(this.phaseDiagram, [this.phasePressure]);
	this.setupUpdate(this.spcDefs, this.dataGas, this.dataLiq, this.actCoeffFuncs, this.drivingForce, this.updateListenerName, this.drawList, this.dotMgrLiq, this.wallLiq, this.numAbs, this.drivingForceSensitivity, this.numEjt, this.wallGas, this.wallPtIdxs, this.surfAreaObj);
	this.wallGas.addLiquid(this);
	this.wallBound = this.addWallBound(this.wallGas);
	this.phaseChangeEnabled = true;
	this.equilData;
	this.energyForDots = 0;
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
	setupGrabPExt: function(wallGas, dataGas) {
		var self = this;
		timeline.curSection().addCmmdPoint('now', 'setup', function() {
			var pExtObj = wallGas.getDataSrc('pExt', undefined, true);
			if (pExtObj) {
				dataGas.pExt = pExtObj;
			}
		}, true, true)
	},
	makeActCoeffFuncs: function(type, coeffInfo, spcDefs) {
		type = type || 'ideal';
		if (/(twoSfxMrg|twosuffixmargoules)/i.test(type)) {
			var coeff = coeffInfo.a
			return this.makeTwoSfxMrgFuncs(spcDefs, coeff);
		} else if (/van[\s]*laar/i.test(type)) {
			return this.makeVanLaar(spcDefs, coeffInfo);
		} else if (/ideal/i.test(type)) {
			var funcs = {};
			for (var spcName in spcDefs) funcs[spcName] = function(x, T) {return 1};
			return funcs;
		}
	},
	makeTwoSfxMrgFuncs: function(spcDefs, coeff) {
		var funcs = {};
		var gasConst = R;
		for (var spcName in spcDefs) {
			funcs[spcName] = function(x, T) {
				return Math.exp(coeff * (1 - x) * (1 - x) / (gasConst * T)); 
			}
		}
		return funcs;
	},
	makeVanLaar: function(spcDefs, coeffInfo) {
		var funcs = {};
		for (var spcName in spcDefs) {
			var actCoeffSelf = coeffInfo[spcName];
			var actCoeffOther = this.getActCoeffOther(spcName, coeffInfo);
			if (actCoeffSelf === undefined) {
				console.log('Missing activity coefficient for ' + spcName);
			}
			funcs[spcName] = this.makeVanLaarFunc(actCoeffSelf, actCoeffOther);
		}
		return funcs;
		//{spc1: ...., spc2:...}, //{spc1: ##, spc2: ##}
		
	},
	makeVanLaarFunc: function(actCoeffSelf, actCoeffOther) {
		return function (x, T) {
			return Math.exp(actCoeffSelf * (actCoeffOther * (1 - x)) / (actCoeffSelf * x + actCoeffOther * (1 - x)) * (actCoeffOther * (1 - x)) / (actCoeffSelf * x + actCoeffOther * (1 - x)));
		}
	},
	getActCoeffOther: function(selfName, binaryInfo) {
		for (var spcName in binaryInfo) {
			if (spcName != selfName) return binaryInfo[spcName];
		}
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
	togglePhaseChange: function() {
		this.phaseChangeEnabled ? this.disablePhaseChange() : this.enablePhaseChange();
	},
	enablePhaseChange: function() {
		window.walls.setWallHandler(this.wallLiq.handle, {func: this.hit, obj: this});
		this.phaseChangeEnabled = true;
	},
	disablePhaseChange: function() {
		window.walls.setWallHandler(this.wallLiq.handle, {func: this.hitNoPhaseChange, obj: this});
		this.phaseChangeEnabled = false;
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
			spcs[spcName].populate(pos, dims, counts[spcName], temp, wallLiq.handle, undefined, wallLiq.handle, dotMgrLiq); 
		}
	},
	recordTempLiq: function(wallLiq) {
		var self = this;
		wallLiq.recordTemp(function() {
			return self.tempDisplay;
		})
	},
	initData: function(wall, spcDefs, extras) {
		var data = {};
		if (extras) {
			for (var extraIdx=0; extraIdx<extras.length; extraIdx++) {
				var extra = extras[extraIdx];
				var dataObj = wall.getDataObj(extra, undefined, true);
				if (dataObj) {
					data[extra] = dataObj.src();
				}
				//will only get, not record now
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
		this.calcEquil = this.setupUpdateEquil(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq);
		this.drawDots = this.setupDrawDots(drawList);
		this.moveDots = this.setupMoveDots(dotMgrLiq, spcDefs, wallLiq, wallGas, wallGasIdxs);
		this.ejectDots = this.setupEjectDots(dotMgrLiq, spcDefs, drivingForce, numAbs, drivingForceSensitivity, drawList, wallLiq, numEjt);//you were making the liquid eject if df<0 whether hit or not
		var sizeWall = this.setupSizeWall(wallLiq, wallGas, spcDefs, dotMgrLiq, wallGasIdxs, wallSurfAreaObj)
		var zeroAttrs = this.zeroAttrs;
		var fixLiquidTemp = this.setupFixLiquidTemp(wallGas, dotManager, dataGas);
		var calcCp = this.calcCp, calcEquil = this.calcEquil, drawDots = this.drawDots, moveDots = this.moveDots, ejectDots = this.ejectDots;
		calcCp();
		var turns = 0;
		var self = this;
		addListener(curLevel, 'update', listenerName, function() {
			if (turns == 5) {
				var checkUpdateEquilAndPhaseDiagram;
				if (self.isTwoComp) {
					self.checkUpdateEquilAndPhaseDiagram = self.setupCheckUpdateEquilPhaseDiagram(self.phaseDiagram, self.wallGas.getDataSrc('pExt'), self.wallGas.getDataSrc('pInt'));
					checkUpdateEquilAndPhaseDiagram = self.checkUpdateEquilAndPhaseDiagram;	
				} else {
					checkUpdateEquilAndPhaseDiagram = function(){};
				}
				removeListener(curLevel, 'update', listenerName);
				addListener(curLevel, 'update', listenerName, function() {
					if (0 < self.Cp && self.Cp < 2.5) {
						fixLiquidTemp();
					}
					self.tempDisplay = self.temp;
					calcCp();
					calcEquil();
					drawDots();
					moveDots();
					if (self.phaseChangeEnabled) ejectDots();
					sizeWall();
					checkUpdateEquilAndPhaseDiagram();
					if (self.addEnergyToDots(window.dotManager.lists.ALLDOTS, self.energyForDots)) {
						self.energyForDots = 0;
					}
				})
				
			} 
			self.tempDisplay = self.temp;
			calcCp();
			calcEquil();
			drawDots();
			moveDots();
			sizeWall();	
			turns ++;
			
		})
	},
	setupFixLiquidTemp: function(wallGas, dotMgrGas, dataGas) {
		var self = this;

		return function() {
			var tDew = self.tDew(self.spcA, self.spcB, dataGas, self.equilData);
			var tGas = dataGas.temp[dataGas.temp.length - 1];
			//var dewWeight = .9;
			var sign = getSign(tGas - tDew);
			var tLiqF = tDew + sign * Math.min(15, sign * (tGas - tDew));
			//var tLiqF = dewWeight * tDew + (1 - dewWeight) * tGas;  //so liquid is near dew pt but is moving in the direction the gas would push it in thermal equilibrium
			var dE = (tLiqF - self.temp) * self.Cp;
			self.temp = tLiqF;
			self.energyForDots -= dE;
		}
		
	},
	tDew: function(spcA, spcB, dataGas, equilData) {
		if (spcA && spcB) {
			var equilDataData = equilData.data;
			var yLight = dataGas[equilData.keyLight][dataGas[equilData.keyLight].length - 1];
			for (var i=1, ii=equilDataData.length; i<ii; i++) {
				if (equilDataData[i].yLight <= yLight) {
					var y2 = equilDataData[i].yLight;
					var y1 = equilDataData[i - 1].yLight;
					var t2 = equilDataData[i].temp;
					var t1 = equilDataData[i - 1].temp;
					return t1 + (yLight - y1) * (t2 - t1) / (y2 - y1);
				}
			}
		} else {
			return spcA.tBoil(dataGas.pExt ? dataGas.pExt[dataGas.pExt.length - 1] : dataGas.pInt[dataGas.pInt.length - 1]);
		}		
	},
	addEnergyToDots: function(dots, energy) {
		if (dots.length && energy) {
			var addTo = Math.min(dots.length, 20);
			var i = Math.max(0, Math.floor(Math.random() * dots.length - addTo));
			var ePer = energy / addTo;
			for (var ceil = addTo + i; i<ceil; i++) {
				dots[i].addEnergy(ePer);
			}
			return true;
			
		}
		return false;
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
	setupUpdateEquil: function(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq) {
		var self = this;
		return function() {
			//hey - assuming that if the walls get within 5 px of each other, we're in a constant pressure situation.  
			var wallNearLiq = Math.abs(wallGas[0].y - wallLiq[0].y) < 5;
			var allVapor = dotMgrLiq.count == 0;
			if (allVapor) {
				self.updateEquilAllVap(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq);
			} else if (wallNearLiq) {
				self.updateEquilWithPExt(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq);
			} else {
				self.updateEquilStd(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq);
			}
				
		}
	},
	updateEquilAllVap: function(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq) {
		var tDew = this.tDew(this.spcA, this.spcB, dataGas, this.equilData);
		var temp = dataGas.temp[dataGas.temp.length - 1];
		var dF = temp > tDew ? -10 : 0;  //very low chance of condensing at dF = -10
		for (var spcName in spcDefs) {
			drivingForce[spcName] = dF;   
		}
			

	},
	updateEquilWithPExt: function(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq) {
		var sumPEq = 0;
		var pEqs = {};
		for (var spcName in spcDefs) {
			var spc = spcDefs[spcName];
			var gasFrac = dataGas[spcName][dataGas[spcName].length - 1];
			var liqFrac = dataLiq[spcName][dataLiq[spcName].length - 1];
			var liqTemp = this.temp;
			var actCoeff = actCoeffFuncs[spcName](liqFrac, liqTemp);
			var antCoeffs = spcDefs[spcName].antoineCoeffs;
			var pPure = this.getPPure(antCoeffs.a, antCoeffs.b, antCoeffs.c, liqTemp);
			var pEq = pPure * actCoeff * liqFrac;
			sumPEq += pEq;
			pEqs[spcName] = pEq;
		}
		var dPEq = wallGas.pExt() - sumPEq;
		for (var spcName in spcDefs) {
			drivingForce[spcName] = dPEq * pEqs[spcName] / sumPEq;
		}	
	},
	updateEquilStd: function(wallGas, wallLiq, spcDefs, dataGas, dataLiq, actCoeffFuncs, drivingForce, dotMgrLiq) {
		for (var spcName in spcDefs) {
			var spc = spcDefs[spcName];
			var gasFrac = dataGas[spcName][dataGas[spcName].length - 1];
			var liqFrac = dataLiq[spcName][dataLiq[spcName].length - 1];
			var liqTemp = this.temp;
			var actCoeff = actCoeffFuncs[spcName](liqFrac, liqTemp);
			var antCoeffs = spcDefs[spcName].antoineCoeffs;
			var pPure = this.getPPure(antCoeffs.a, antCoeffs.b, antCoeffs.c, liqTemp);
			var pEq = pPure * actCoeff * liqFrac;
			var pGas = gasFrac * (dataGas.pExt ? dataGas.pExt[dataGas.pExt.length - 1] : dataGas.pInt[dataGas.pInt.length - 1]);
			drivingForce[spcName] = pGas - pEq;
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
								
				if (dF > 0) { 
					numEjt[spcName] += abs / (dF * drivingForceSensitivity + 1);
				} else if (dF < 0) {
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
	setupCheckUpdateEquilPhaseDiagram: function(phaseDiagram, srcA, srcB) {
		var src = srcA ? srcA : srcB;
		var turnsDiff = 0;
		var self = this;
		return function() {
			if (src[src.length - 1] != self.equilData.pressure) {
				turnsDiff ++;
			}
			if (turnsDiff > 15) {
				self.updateEquilData(phaseDiagram, src);

				turnsDiff = 0;
			}
		}
	},
	updateEquilData: function(phaseDiagram, src) {
		if (phaseDiagram) {
			this.equilData = phaseDiagram.setPressure(src[src.length - 1]);
		} else if (this.isTwoComp) {
			this.equilData = phaseEquilGenerator.constP(this.spcA, this.spcB, this.actCoeffFuncs, src[src.length - 1], 20);
		}
	},
	eject: function(dotMgrLiq, dotMgrGas, spcDefs, spcName, numEject, wallGas, drawList, wallLiq) {
		//going to take energy out of ejected dot rather than liquid. 
		var CpOld = this.Cp;
		var dHLiq = 0;
		var dotList = dotMgrLiq.get({spcName: spcName})
		var sliceIdx = Math.min(dotList.length, numEject);

		var toTransfer = dotList.slice(0, sliceIdx);
		//taking energy out of liquid.  If I did from ejecting gas molec, would not be able to vaporize below a temp because tEject would be < 0
		for (var transIdx=0; transIdx<toTransfer.length; transIdx++) {
		
			var dot = toTransfer[transIdx];
			if (dot.temp() == 0) {
				dot.v.dy = -1; //preventing setTemp with original temp == 0.  That will set temp to NaN
			}
			dot.setTemp(this.temp);
			var hVap = dot.hVap();
			dot.v.dy = -Math.abs(dot.v.dy);
			dot.y = wallLiq[0].y - 1;
			dot.setWall(wallGas.handle);
			drawList.splice(drawList.indexOf(dot), 1);
			dotMgrLiq.remove(dot);
			this.calcCp();
			this.temp -= hVap / this.Cp;
			if (this.Cp == 0) {
				this.temp = 0;
				this.energyForDots -= hVap;
			}
			if (this.temp < 0) {
				this.energyForDots -= this.Cp * (1 - this.temp); //setting temp to 1;
				this.temp = 1;
			}
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
				return this.absorbDot(dot, this.drawList, this.dotMgrLiq, this.wallLiq, this.spcDefs, this.dataGas.temp);
			}
		}
		if (this.dotMgrLiq.count) {
			this.adjTemps(dot, wallUV, perpV, this.dataGas, this.dataLiq, this.temp, window.dotManager.spcLists, this.spcDefs);
		}
	
	},
	hitNoPhaseChange: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		this.adjTemps(dot, wallUV, perpV, this.dataGas, this.dataLiq, this.temp, window.dotManager.spcLists, this.spcDefs);
	},
	absorbDot: function(dot, drawList, dotMgrLiq, wallLiq, spcDefs, gasTemp) {
		
		var dotMgrGas = window.dotManager; 
		dotMgrGas.remove(dot);
		drawList.splice(Math.floor(Math.random() * drawList.length), 0, dot);
		dot.setWall(wallLiq.handle);
		dotMgrLiq.add(dot);
		
		var tDotF = gasTemp[gasTemp.length - 1];
		this.energyForDots += (dot.temp() - tDotF) * dot.cv;
		dot.setTemp(tDotF);
		var CpLiqOld = this.Cp;
		this.calcCp();
		this.temp = (this.temp * CpLiqOld + dot.tempCondense() * dot.cpLiq) / this.Cp;
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
		var vRatio = 1;
		var tempTest = this.temp - qToDot / this.Cp;
		if (tempTest > 0) {
			this.temp -= qToDot / this.Cp;
			

			vRatio = Math.sqrt(tDotTarget / tDot); //inlining vRatio show dot.setTemp so I don't have to sqrt unnecessarily
			dot.v.mult(vRatio);
			dot.internalPotential *= tDotTarget / tDot;
		}
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
		if (Cp != 0) {
			var temp = this.temp;
			q = Math.min(Cp * (3000 - temp), Math.max((-temp + 10) * Cp, q));
			this.temp += q / Cp;
			this.wallLiq.q += q;
		}
	},
	wrapMakePhaseDiagram: function(liquid, spcDefs, actCoeffFuncs, handle, primaryKey, makeGasMarker, makeSystemMarker, makeLiquidMarker, pressure) {
		var self = this;
		var makePhase = this.makePhaseDiagram;
		return function() {
			return makePhase.apply(self, [liquid, spcDefs, actCoeffFuncs, handle, primaryKey, makeGasMarker, makeSystemMarker, makeLiquidMarker, pressure]);
		}
	},
	makePhaseDiagram: function(liquid, spcDefs, actCoeffFuncs, handle, primaryKey, makeGasMarker, makeSystemMarker, makeLiquidMarker, pressure) {
		var spcAName, spcBName, graph, axisInit;
		//var primaryKey = 'Heavy';
		for (var spcName in spcDefs) {
			if (!spcAName) {
				spcAName = spcName;
			} else {
				spcBName = spcName;
			}
		}
		if (this.isTwoComp) {
			axisInit = {x: {min: 0, step: .2}, y: {min: 200, step: 50}};
			graph = new GraphPhaseTwoComp({spcAName: spcAName, spcBName: spcBName, axisInit: axisInit, actCoeffFuncs: actCoeffFuncs, handle: handle, primaryKey: primaryKey, liquid: this, wallGas: this.wallGas, makeGasMarker: makeGasMarker, makeSystemMarker: makeSystemMarker, makeLiquidMarker: makeLiquidMarker, pressure: pressure});
		} else {
			axisInit = {x: {min: 200, step: 50}, y: {min: 0, step: 1}};
			graph = new GraphPhaseOneComp({spcName: spcAName, axisInit: axisInit, handle: handle, liquid: this, wallGas: this.wallGas, makeSystemMarker: makeSystemMarker});
		}
		return graph;
	},
	addWallBound: function(wallGas) {
		//if the falling wall is moving really quickly, energy added may not quite = P\Delta V because wall velocity increases stepwise, not smoothly.  It is around the whatever threshold though
		wallGas.setBounds(undefined, this.wallLiq[0]);
		var boundFunc = function(wallGas, unboundedY, boundY) {
			var wallGasY = wallGas[0].y;
			var wallGasVelocity = wallGas.vs[0].dy;
			var liqY = this.wallLiq[0].y;
			var wallGasMass = wallGas.mass;
		
			
			//1 simUnit * (2/3) <for 2d to 3d> * tConst * 3/2 KB = joules
			var energy = (.5 * wallGasMass * wallGasVelocity * wallGasVelocity + wallGasMass * window.g * (boundY - wallGasY)) * window.tConst * window.KB
			wallGas.vs[0].dy = 0;
			wallGas.vs[1].dy = 0;
			this.temp += energy / this.Cp;
			return boundY;
		}
	
		var handler = new WallMethods.BoundHandler(boundFunc, this, true);
		wallGas.addBoundHandler('max', handler);
		return handler;
	},
	remove: function() {
		removeListener(curLevel, 'update', this.updateListenerName);
		this.wallGas.removeLiquid(this);
		if (this.heater) this.heater.removeLiquid();
		if (!this.wallLiq.removed) walls.removeWall(this.wallLiq.handle);
		if (!this.wallGas.removed) this.wallGas.removeSurfAreaAdjust(this.handle);
	},
})


