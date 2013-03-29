function PhaseEquilGenerator() {
	
}
PhaseEquilGenerator.prototype = {
	constP: function(spcA, spcB, actCoeffFuncs, pressure, numPts) {
		var tBoilA = spcA.tBoil(pressure);
		var tBoilB = spcB.tBoil(pressure);
		var tBoilLight = tBoilA < tBoilB ? tBoilA : tBoilB;
		var tBoilHeavy = tBoilA > tBoilB ? tBoilA : tBoilB;
		var keyLight = tBoilA < tBoilB ? spcA : spcB;
		var keyHeavy = tBoilA > tBoilB ? spcA : spcB;
		var actFuncLight = actCoeffFuncs[keyLight.spcName];
		var actFuncHeavy = actCoeffFuncs[keyHeavy.spcName];
		var equilData = this.makeConstPEquil(pressure, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy, numPts);
		return new PhaseEquilGenerator.EquilData(equilData, keyLight.spcName, keyHeavy.spcName);
	},
	makeConstPEquil: function(pressure, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy, numPts) {
		var equilData = [];
		var stepSize = 1 / (numPts - 1);
		for (var step=0, xHeavy=0; step<numPts; step++) {
			var tGuess = tBoilLight + (tBoilHeavy - tBoilLight) * xHeavy;
			var tStep = this.solveTAtStep(tGuess, pressure, xHeavy, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy);
			var pTotal = this.solvePTotal(tStep, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy);
			var pLight = this.pSpc(keyLight, tStep, actFuncLight, 1 - xHeavy);
			
			equilData.push(new PhaseEquilGenerator.EquilPt(1 - xHeavy, xHeavy, pLight / pTotal, 1 - pLight / pTotal, tStep, pressure));
			xHeavy += stepSize;
		}
		
		return equilData;
	},
	solveTAtStep: function(tInit, pSys, xHeavy, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy) {
		var temp = tInit;
		var pCur = this.solvePTotal(temp, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy);
		while (fracDiff(pCur, pSys) > .01) {
		
			var derivative = this.getDPDT(temp, xHeavy, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy);
			temp += (pSys - pCur) / derivative;
			temp = bound(temp, tBoilLight, tBoilHeavy);
			pCur = this.solvePTotal(temp, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy);
		}
		return temp;
		
	},
	getDPDT: function(temp, xHeavy, keyLight, keyHeavy, tBoilLight, tBoilHeavy, actFuncLight, actFuncHeavy) {
		var tLow = .995 * temp;
		var tHigh = 1.005 * temp;
		var pLow = this.solvePTotal(tLow, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy);
		var pHigh = this.solvePTotal(tHigh, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy);
		return (pHigh - pLow) / (tHigh - tLow);
	},
	solvePTotal: function(tSys, xHeavy, keyLight, keyHeavy, actFuncLight, actFuncHeavy) {
		var pLight = this.pSpc(keyLight, tSys, actFuncLight, 1 - xHeavy);
		var pHeavy = this.pSpc(keyHeavy, tSys, actFuncHeavy, xHeavy);
		return pLight + pHeavy;
	},
	pSpc: function(key, tSys, actFunc, x) {
		return key.pPure(tSys) * actFunc(x, tSys) * x;
	}
}

PhaseEquilGenerator.EquilPt = function(xLight, xHeavy, yLight, yHeavy, temp, pressure) {
	this.xLight = xLight;
	this.xHeavy = xHeavy;
	this.yLight = yLight;
	this.yHeavy = yHeavy;
	this.temp = temp;
	this.pressure = pressure;
}
PhaseEquilGenerator.EquilData = function(data, keyLight, keyHeavy) {
	this.data = data;
	this.keyLight = keyLight;
	this.keyHeavy = keyHeavy;
}