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
		new Experiment.Dimension([{paths: ['tempDots1', 'tempDots2', 'tempWalls'], testVals: '[298.15, 348.15 ... 600]'}]),
		new Experiment.Dimension([{paths: ['hFC', 'hFD'], testVals: '[-13...-10]'}, {paths: ['eAR'], testVals: '[10, 8 ... 4]'}])
	]
	this.appendEqData = true;

	this.draw = false;

	this.numReps = 6;
	this.runNum = 0;
	this.totalRuns = this.getTotalRuns();
	this.runTime = 20; //seconds;
	this.resultSets = [[]];
	this.repIdx = 0;
	this.dimValIdxs = this.makeDimValIdxs(this.dimensions);
	this.finished = false;
	this.measureNext()
}

Experiment.prototype = {
	measureNext: function() {
		var self = this;
		
		if (!this.finished) {
			
			
			this.setVals(this.mutables, this.dimensions, this.dimValIdxs);
			sceneNavigator.refresh();
			if (!this.draw) {
				curLevel.drawRun = function(){};
			}
			setTimeout(function() {self.tryNextMeasurement()}, this.runTime * 1000);
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
			curLevel.pause();

		}
	},
	tryNextMeasurement: function() {
		this.recordPt(this.data, this.mutables);
		//this.logLast();
		this.finished = this.tick();
		this.measureNext();

	},
	tick: function() {
		this.runNum ++;
		console.log(Math.round(100 * this.runNum / this.totalRuns) + ' %');
		var dims = this.dimensions;
		var dimValIdxs = this.dimValIdxs;
		this.repIdx++;
		if (this.repIdx == this.numReps) {
			this.repIdx = 0;
			var finished = this.nextDimVal(dims, dimValIdxs);
			return finished;
		}
		return false;
	},
	nextDimVal: function(dims, dimValIdxs) {
		for (var i=dims.length - 1; i>=0; i--) {
			dimValIdxs[i]++;
			if (dimValIdxs[i] == dims[i].numPts) {
				dimValIdxs[i] = 0;
			} else {
				return false;
			}
		}
		return true;
	},
	makeDimValIdxs: function(dims) {
		var dimValIdxs = [];
		for (var i=0; i<dims.length; i++) {
			dimValIdxs.push(0);
		}
		return dimValIdxs
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
	getTotalRuns: function() {
		var numSetPts = 1;
		for (var i=0; i<this.dimensions.length; i++) {
			numSetPts *= this.dimensions[i].numPts;
		}
		return numSetPts * this.numReps;
	},
	recordPt: function(data, mutables) {
		if (this.resultSets[this.resultSets.length - 1].length == this.numReps) {
			this.resultSets.push([]);
		}

		this.resultSets[this.resultSets.length - 1].push(new Experiment.Results(data, mutables, this.dataToEval));
	},
	logLast: function() {
		this.results[this.results.length - 1].log();
	},
	setVals: function(mutables, dims, dimValIdxs) {
		for (var i=0; i<dims.length; i++) {
			var dim = dims[i];
			var dimValIdx = dimValIdxs[i];
			for (var pathGrpIdx=0; pathGrpIdx<dim.paths.length; pathGrpIdx++) {
				var val = dim.testVals[pathGrpIdx][dimValIdx];
				var pathGrp = dim.paths[pathGrpIdx];
				for (var pathNameIdx=0; pathNameIdx<pathGrp.length; pathNameIdx++) {
					var pathName = pathGrp[pathNameIdx];
					eval(mutables[pathName].path + ' = ' + val);
				}
			}
		}
		
	}
}


Experiment.Dimension = function(pathsAndVals) {
	this.paths = _.pluck(pathsAndVals, 'paths');
	var testVals = _.pluck(pathsAndVals, 'testVals');
	this.testVals = this.extendSets(testVals, this.paths);
	this.numPts = this.testVals[0].length;
}

Experiment.Dimension.prototype = {
	extendSets: function(sets, paths) {
		var vals = [];
		for (var i=0; i<sets.length; i++) {
			if (sets[i] instanceof Array) {
				vals.push(sets[i]);
			} else {
				vals.push(this.extendSet(sets[i]));
			}
		}
		this.checkValLens(vals, paths);
		return vals;
	},
	extendSet: function(set) {
		if (set.indexOf('...') == -1) console.log('Unrecognized set ' + set);
		set = set.replace('...', ' ... ');
		var resultVals = [];
		var sigVals = this.cleanSigVals(set.match(/[\-0-9\.]+/g));
		var startBound, step, endBound;
		startBound = sigVals[0];
		if (sigVals.length == 3) {
			step = sigVals[1] - sigVals[0];
			endBound = sigVals[2];
		} else {
			endBound = sigVals[1];
			step = endBound > startBound ? 1 : -1;
		}
		return this.setFromSigVals(startBound, step, endBound);
		
	},
	checkValLens: function(vals, paths) {
		var minLen = vals[0].length;
		var maxLen = vals[0].length;
		for (var i=0; i<vals.length; i++) {
			minLen = Math.min(vals[i].length, minLen);
			maxLen = Math.max(vals[i].length, maxLen);
		}
		if (minLen != maxLen) {
			console.log('Dimension with paths ');
			console.log(paths);
			console.log('has mismatched values sets: max length is ' + maxLen + ' and min length is ' + minLen);
			console.log('THIS EXPERIMENT WILL NOT WORK');
			// for (var i=0; i<vals.length; i++) {
				// vals[i] = vals[i].slice(0, minLen);
			// }
		}
		
	},
	cleanSigVals: function(sigVals) {
		var asNumbers = [];
		for (var i=0; i<sigVals.length; i++) {
			var regexpRes = /[\.]+/.exec(sigVals[i]);
			if (regexpRes && regexpRes[0] != sigVals[i]) {
				asNumbers.push(Number(sigVals[i]));
			} else if (!regexpRes) {
				asNumbers.push(Number(sigVals[i]));
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

Experiment.Results = function(data, mutables, dataToEval) {
	this.data = {};
	this.spcDefs = deepCopy(LevelData.spcDefs);
	var tempSrc = walls[0].getDataSrc('temp');
	this.finalTemp = this.avgLast(tempSrc, 300);
	this.setPts = this.recordMutables(mutables);
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
	recordMutables: function(mutables) {
		var evaled = {};
		for (var name in mutables) {
			evaled[name] = eval(mutables[name].path);
		}
		return evaled;
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