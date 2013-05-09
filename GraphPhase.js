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

function GraphPhase(attrs) {
	this.spcAName = attrs.spcAName;
	this.spcBName = attrs.spcBName;
	this.spcA = spcs[this.spcAName];
	this.spcB = spcs[this.spcBName];
	this.wallGas = attrs.wallGas;
	this.liquid = attrs.liquid;
	this.constAttr = attrs.constAttr;
	this.primaryKeyType = /light/i.test(attrs.primaryKey) ? 'Light' : 'Heavy';
	this.handle = attrs.handle;
	this.actCoeffFuncs = attrs.actCoeffFuncs;
	this.pressure = attrs.pressure || 1;
	attrs.axesFixed = {x: true};
	attrs.numGridLines = {x: 6};
	this.keyNamePairs = this.getKeyNamePairs(this.spcA, this.spcB, this.pressure);
	//this.primarySpcName = this.getPrimarySpcName(this.spcA, this.spcB, this.primaryKeyType, this.pressure);
	if (!(this.spcA && this.spcB)) console.log('Bad species data for phase diagram ' + this.spcAName + ' ' + this.spcBName);
	attrs.yLabel = 'Temp';
	attrs.xLabel = 'frac ' + this.keyNamePairs[this.primaryKeyType].toCapitalCamelCase();
	attrs.makeReset = false;
	this.graph = new GraphScatter(attrs); //passing along axisInit
	this.equilData;
	this.updateEquilData(this.pressure);
	this.equilDataHandle = this.handle + 'PhaseData';
	this.graph.addSet({handle: this.equilDataHandle, label: 'Phase\nData', pointCol: Col(255, 255, 255), flashCol: Col(0, 0, 0), trace: true, recording: false, showPts: false});
	this.recordFracData(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.recordFracData(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	var liquid = this.liquid;
	this.liqTempFunc = function(){return liquid.temp};
	this.gasTempFunc = this.makeTempFunc(this.wallGas);
	this.yFuncKillLow = this.makeFracFunc(this.wallGas, this.keyNamePairs[this.primaryKeyType], true);
	this.yFunc = this.makeFracFunc(this.wallGas, this.keyNamePairs[this.primaryKeyType]);
	this.xFuncKillLow = this.makeFracFunc(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType], true);
	this.xFunc = this.makeFracFunc(this.liquid.wallLiq, this.keyNamePairs[this.primaryKeyType]);
	this.updateGraph();
	this.active = false;
	if (defaultTo(true, attrs.makeLiquidMarker)) {
		this.makeLiquidMarker();
	}
	if (defaultTo(true, attrs.makeSystemMarker)) {
		this.makeSystemMarker();
	}
	if (defaultTo(true, attrs.makeGasMarker)) {
		this.makeGasMarker();
	}
	this.graph.hasData = true;
}
GraphPhase.prototype = {
	recordFracData: function(wall, spcName) {
		wall.recordFrac({spcName: spcName, tag: wall.handle})
	},
	setDataValid: function() {
		this.graph.setDataValid();
		
	},
	makeLiquidMarker: function() {
		this.graph.addMarker({handle: 'liquid', col: Col(200, 0, 0), markerType: 'bullseye', x: this.xFuncKillLow, y: this.liqTempFunc, label: 'Liquid'});
	},
	makeSystemMarker: function() {
		var self = this;
		var liquid = self.liquid;
		var wallGas = liquid.wallGas;
		var dotMgrGas = liquid.wallGas.dotManager;
		var dotMgrLiq = liquid.wallLiq.dotManager;
		var xFunc = function() {
			return (self.xFunc() * dotMgrLiq.count + self.yFunc() * dotMgrGas.count) / (dotMgrGas.count + dotMgrLiq.count);
		}
		var yFunc = function() {
			var gasCv = wallGas.getCv();
			return (gasCv * self.gasTempFunc() + liquid.Cp * self.liqTempFunc()) / (gasCv + liquid.Cp);
		}
		this.graph.addMarker({handle: 'system', col: Col(200, 200, 0), markerType: 'bullseye', x: xFunc, y: yFunc, label: 'System'});
		
		
	},
	makeGasMarker: function() {
		this.graph.addMarker({handle: 'gas', col: Col(0, 200, 0), markerType: 'bullseye', x: this.yFuncKillLow, y: this.gasTempFunc, label: 'Gas'});
	},
	makeTempFunc: function(wallGas) {
		var tempData = wallGas.getDataSrc('temp');
		return function() {
			var sum = 0;
			for (var i=Math.max(0, tempData.length - 30); i<tempData.length; i++) {
				sum += tempData[i];
			}
			return sum / Math.min(Math.max(1, tempData.length), 30);
		}
	},
	makeFracFunc: function(wall, spcName, killLow) {
		var fracData = wall.getDataSrc('frac', {spcName: spcName, tag: wall.handle});
		var dotMgr = wall.dotManager;
		if (killLow) {
			return function() {
				if (dotMgr.count > 50) {
					var sum = 0;
					for (var i=Math.max(0, fracData.length - 30); i<fracData.length; i++) {
						sum += fracData[i];
					}
					return sum / Math.min(Math.max(1, fracData.length), 30);
				} else {
					return -1e5;
				}
			}		
		} else {
			return function() {
				var sum = 0;
				for (var i=Math.max(0, fracData.length - 30); i<fracData.length; i++) {
					sum += fracData[i];
				}
				return sum / Math.min(Math.max(1, fracData.length), 30);
			}			
		}
	},
	clearHTML: function() {
		this.graph.clearHTML();
	},
	restoreHTML: function() {
		this.graph.restoreHTML();
	},
	drawAllData: function() {
		this.graph.drawAllData();
	},
	disable: function() {
		this.graph.disable();
	},
	save: function() {
		return undefined;
	},
	addLast: function() {
		this.graph.addLast();
	},
	remove: function() {
		this.graph.remove();
	},
	setPressure: function(pressure) {
		var equilData = this.updateEquilData(pressure);
		this.updateGraph();
		this.pressure = pressure;
		return equilData;
	},
	getKeyNamePairs: function(spcA, spcB, pressure) {
		if (spcA.tBoil(pressure) < spcB.tBoil(pressure)) {
			return {Light: spcA.spcName, Heavy: spcB.spcName};
		} else {
			return {Light: spcB.spcName, Heavy: spcA.spcName};
		}
		
	},
	updateEquilData: function(pressure) {
		var phaseData = phaseEquilGenerator.constP(this.spcA, this.spcB, this.actCoeffFuncs, pressure, 20);
		var liqPts = [];
		var gasPts = [];
		

		for (var phaseIdx=0; phaseIdx<phaseData.data.length; phaseIdx++) {
			var phaseDatum = phaseData.data[phaseIdx];
			var temp = phaseDatum.temp;
			var x = phaseDatum['x' + this.primaryKeyType];
			var y = phaseDatum['y' + this.primaryKeyType];
			liqPts.push(P(x, temp));
			gasPts.push(P(y, temp));
		}	

		this.equilData = liqPts.concat(gasPts.reverse());
		return phaseData
	},
	updateGraph: function() {
		this.graph.clearData(this.equilDataHandle, false);
		this.graph.enqueueData(this.equilDataHandle, this.equilData);
		this.graph.updateRange();
		this.graph.drawAllData();
	},
};