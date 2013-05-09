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

function PhaseEquilGenerator() {
	
}
PhaseEquilGenerator.prototype = {
	//make a constT one.  That would be easy.  
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
		return new PhaseEquilGenerator.EquilData(equilData, keyLight.spcName, keyHeavy.spcName, pressure);
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
			//Newton method
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
PhaseEquilGenerator.EquilData = function(data, keyLight, keyHeavy, pressure) {
	this.data = data;
	this.keyLight = keyLight;
	this.keyHeavy = keyHeavy;
	this.pressure = pressure;
}