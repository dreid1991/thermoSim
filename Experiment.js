function Experiment() {
	this.mutables = {
		eAF: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.rxns[0].activeE'),
		eAR: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.rxns[1].activeE'),
		hFA: new Experiment.Mutable('LevelData.spcDefs[0].hF298'),
		hFB: new Experiment.Mutable('LevelData.spcDefs[1].hF298'),
		hFC: new Experiment.Mutable('LevelData.spcDefs[2].hF298'),
		hFD: new Experiment.Mutable('LevelData.spcDefs[3].hF298'),		
		tempDots1: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.dots[0].temp'),
		tempDots2: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.dots[1].temp'),
		tempWalls: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.walls[0].temp'),
	}
	this.data = {
		nA: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "a", tag: "wally"})'),
		nB: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "b", tag: "wally"})'),
		nC: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "c", tag: "wally"})'),
		nD: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "d", tag: "wally"})'),
		temp: new Experiment.Data('walls[0].getDataSrc("temp")')
	}
	this.dataToEval = {
		fracProdsExp: new Experiment.Data('nC + nD'),
		eqConstExp: new Experiment.Data('nC * nD / (nB * nA)')
	}
	//rxn appending ONLY works for spcs [0] + [1] -> [2] + [3]
	this.dimensions = [
		new Experiment.Dimension([{paths: ['tempDots1', 'tempDots2', 'tempDots3'], testVals: '[298.15, 348.15 ... 500]'}]),
		new Experiment.Dimension([{paths: ['hFC', 'hFD'], testVals: '[-13...-10]'}, {paths: ['eAR'], testVals: '[10, 8 ... 4]'}])
	]
	this.appendEqData = true;
	// this.runs = [
		// {eAF: 4, eAR: 10, hFA: -10, hFB: -10, hFC: -13, hFD: -13, tempDots1: 298.15, tempDots2: 298.15, tempWalls: 298.15},
		// {eAF: 4, eAR: 8, hFA: -10, hFB: -10, hFC: -12, hFD: -12, tempDots1: 298.15, tempDots2: 298.15, tempWalls: 298.15},
		// {eAF: 4, eAR: 6, hFA: -10, hFB: -10, hFC: -11, hFD: -11,tempDots1: 298.15, tempDots2: 298.15, tempWalls: 298.15},
		// {eAF: 4, eAR: 4, hFA: -10, hFB: -10, hFC: -10, hFD: -10, tempDots1: 298.15, tempDots2: 298.15, tempWalls: 298.15}
	// ]
	this.draw = false;
	
	this.numReplicates = 6;
	this.runTime = 20; //seconds;
	this.resultSets = [];
	this.runIdx = 0;
	this.repIdx = -1;
	this.measureNext()
}

Experiment.prototype = {
	measureNext: function() {
		var self = this;
		var runFrac = 1 / this.runs.length;
		this.repIdx++;
		if (this.repIdx == this.numReplicates) {
			this.runIdx++;
			this.repIdx = 0;
		}
		console.log(Math.round((this.runIdx / this.runs.length + runFrac * this.repIdx / this.numReplicates)* 100) + ' %');
		
		if (this.runs[this.runIdx]) {
			
			
			this.setVals(this.mutables, this.runs[this.runIdx]);
			sceneNavigator.refresh();
			if (!this.draw) {
				curLevel.drawRun = function(){};
			}
			setTimeout(function() {self.tryNextMeasurement(self.mutables, self.data, self.runs[self.runIdx])}, this.runTime * 1000);
		} else {
			var table = '<table border="1" cellpadding="3">';
			table += this.makeHeaderRow();
			for (var i=0; i<this.resultSets.length; i++) {
				table += '<tr><td></td></tr>';
				var set = this.resultSets[i];
				for (var j=0; j<set.length; j++) {
					table += set[j].asTableRow(this.appendEqData);
				
				}
			}
			table += '</table>';
			$('body').append('<br>');
			$('body').append(table);

		}
	},
	makeHeaderRow: function() {
		var tableRow = '<tr>';
		for (var a in this.mutables) {
			tableRow += '<td>' + a + '</td>';
		}
		for (var a in this.data) {
			tableRow += '<td>' + a + '</td>';
		}
		for (var a in this.dataToEval) {
			tableRow += '<td>' + a + '</td>';
		}
		if (this.appendEqData) {
			tableRow += '<td>eq const</td>';
			tableRow += '<td>mole frac prods</td>';
		}
		tableRow += '</tr>';
		return tableRow;
	},
	tryNextMeasurement: function(mutables, data, run) {
		this.recordPt(data, run);
		//this.logLast();
		this.measureNext();

	},
	recordPt: function(data, setPts) {
		if (this.resultSets[this.runIdx] == undefined) {
			this.resultSets[this.runIdx] = [];
		}
		this.resultSets[this.runIdx].push(new Experiment.Results(data, setPts, this.dataToEval));
	},
	logLast: function() {
		this.results[this.results.length - 1].log();
	},
	setVals: function(mutables, run) {
		for (var datumName in run) {
			mutables[datumName].set(run[datumName]);
		}
	}
}


Experiment.Dimension = function(pathsAndVals) {
	var paths = _.pluck(pathsAndVals, 'paths');
	var testVals = _.pluck(pathsAndVals, 'testVals');
	this.testVals = this.extendSets(testVals, paths);
}

Experiment.Dimension.prototype = {
	extendSets: function(sets, paths) {
		var vals = [];
		for (var i=0; i<sets.length; i++) {
			vals.push(this.extendSet(sets[i]));
		}
		this.pareVals(vals, paths);
		//need to pare down to min length and alert if paring happens
		return vals;
	},
	extendSet: function(set) {
		if (set.indexOf('...') == -1) console.log('Unrecognized set ' + set);
		set.replace('...', ' ... ');
		var resultVals = [];
		var sigVals = this.cleanSigVals(set.match(/[\-0-9\.]+/g));
		var startBound, step, endBound;
		startBound = sigVals[0];
		if (sigVals.length == 3) {
			step = sigVals[1];
			endBound = sigVals[2];
		} else {
			step = endBound > startBound ? 1 : -1;
			endBound = sigVals[2];
		}
		return this.setFromSigVals(startBound, step, endBound);
		
	},
	pareVals: function(vals, paths) {
		var minLen = vals[0].length;
		var maxLen = vals[0].length;
		for (var i=0; i<vals.length; i++) {
			minLen = Math.min(vals[i].length, minLen);
			maxLen = Math.max(vals[i].length, maxLen);
		}
		if (minLen != maxLen) {
			console.log('Dimension with paths ');
			console.log(paths);
			console.log('has mismatched dimensions: max is ' + maxLen + ' and min is ' + minLen);
			console.log('Paring to min');
			for (var i=0; i<vals.length; i++) {
				vals[i] = vals[i].slice(0, minLen);
			}
		}
		
	},
	cleanSigVals: function(sigVals) {
		var asNumbers = [];
		for (var i=0; i<sigVals.length; i++) {
			var regexpRes = /[\.]+/.exec(sigVals[i]);
			if (regexpRes && regexpRes[0] != sigVals[i]) {
				asNumbers[i] = Number(sigVals[i]);
			} else {
				asNumbers[i] = Number(sigVals[i]);
			}
		}
		return asNumbers;
	},
	setFromSigVals: function(startBound, step, endBound) {
		var vals = [];
		if (startBound < endBound) {
			for (var i=startBound; i<=endBound; i+=step) {
				vals.push(i);
			}	
		} else {
			for (var i=startBound; i>=endBound; i+=step) { //step < 0
				vals.push(i);
			}
		}
		return vals;
		
	}
}

Experiment.Results = function(data, setPts, dataToEval) {
	this.data = {};
	this.spcDefs = deepCopy(LevelData.spcDefs);
	var tempSrc = walls[0].getDataSrc('temp');
	this.finalTemp = this.avgLast(tempSrc, 300);
	this.setPts = deepCopy(setPts);
	for (var datum in data) {
		this.data[datum] = data[datum].avg(200);
	}
	this.evaledData = this.evalData(dataToEval, this.data);
}

Experiment.Results.prototype = {
	log: function() {
		console.log('\nSet point');
		console.log(this.objToStr(this.setPts));
		console.log('Produced data');
		console.log(this.objToStr(this.data) + '\n');
	},
	evalData: function(dataToEval, data) {
		var evaled = {};
		with (data) {
			for (var a in dataToEval) {
				evaled[a] = eval(dataToEval[a].path);
			}
		}
		return evaled;
	},
	asTableRow: function(appendEqData) {
		var tableRow = '<tr>';
		for (var a in this.setPts) {
			tableRow += '<td>' + this.setPts[a] + '</td>';
		}
		for (var a in this.data) {
			tableRow += '<td>' + this.data[a] + '</td>';
		}
		for (var a in this.evaledData) {
			tableRow += '<td>' + this.evaledData[a] + '</td>';
		}
		if (appendEqData) {
			tableRow += this.makeEqData(this.spcDefs);
		}
		tableRow += '</tr>';
		return tableRow;
	},
	makeEqData: function(spcDefs) {
		var temp = this.finalTemp;
		var h3 = spcDefs[3].hF298 * 1000 + spcDefs[3].cv * (temp - 298.15)
		var h2 = spcDefs[2].hF298 * 1000 + spcDefs[2].cv * (temp - 298.15)
		var h1 = spcDefs[1].hF298 * 1000 + spcDefs[1].cv * (temp - 298.15)
		var h0 = spcDefs[0].hF298 * 1000 + spcDefs[0].cv * (temp - 298.15)
		var hRxn = h3 + h2 - (h1 + h0);
		var eqConst = Math.exp(-hRxn / (R * temp)) * Math.exp(-(hRxn / R) * (1 / temp - 1/298.15)); // no entropy right now
		var testFrac;
		for (var i=0; i<=1; i+=.1) {
			var testFrac = Newton(eqConst + ' - (x*x)/((1-x)*(1-x))', {x: i}, 'x');
			if (testFrac >= 0 && testFrac <= 1) break;
		}
		return '<td>' + eqConst + '</td><td>' + testFrac + '</td>';
	},
	objToStr: function(obj) {
		var str = '';
		for (var a in obj) {
			str += (a + ': ' + obj[a] + ', ');
		}
		return str;
	},
	avgLast: function(list, n) {
		var sum = 0;
		for (var i=Math.max(0, list.length - n); i<list.length; i++) {
			sum += list[i];
		}
		return sum / Math.min(n, list.length);
	},
}

Experiment.Mutable = function(path) {
	this.path = path;
}
Experiment.Mutable.prototype = {
	get: function() {
		return eval(this.path);
	},	
	set: function(val) {
		eval(this.path + ' = ' + val);
	}
}

Experiment.Data = function(path) {
	this.path = path;
}

Experiment.Data.prototype = {
	all: function() {
		return eval(this.path);
	},
	last: function() {
		var data = eval(this.path);
		return data[data.length - 1];
	},
	avg: function(numPts) {
		var src = eval(this.path);
		var x = 0;
		for (var i=src.length-numPts; i<src.length; i++) {
			x += src[i];
		}
		return x / numPts;
	},


}

function Newton(expr, dict, solveFor) {
	var evaldydx = function(dictLocal) {
		dictLocal = deepCopy(dictLocal);
		with (dictLocal) {
			dictLocal[solveFor] += 1e-7;
			var plus = eval(expr);
			dictLocal[solveFor] -= 2e-7;
			var minus = eval(expr);
			return (plus - minus) / 2e-7;
		}
	}
	
	var valWith = function(dictLocal) {
		with (dictLocal) {
			return eval(expr);
		}
	}
	
	var error = valWith(dict);
	var numSteps = 0;
	while (Math.abs(error) > 1e-7) {
		var dydx = evaldydx(dict);
		dict[solveFor] -= error / dydx;
		error = valWith(dict);
		numSteps ++;
		if (numSteps > 1000) return (dict[solveFor] + ' EQ DID NOT CONVERGE');
	}
	return dict[solveFor];
	
}