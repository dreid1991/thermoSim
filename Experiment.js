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
		tempWalls: new Experiment.Mutable('LevelData.mainSequence[0].sceneData.walls[0].temp')
	}
	this.data = { 
		nA: new Experiment.Data('walls.wally.getDataSrc("vol")'),
		nB: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "b", tag: "wally"})'),
		nC: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "c", tag: "wally"})'),
		nD: new Experiment.Data('walls[0].getDataSrc("frac", {spcName: "d", tag: "wally"})'),
		temp: new Experiment.Data('walls[0].getDataSrc("temp")')
	}
	this.dataToEval = {
		fracProdsExp: new Experiment.Data('nC + nD'),
		eqConstExp: new Experiment.Data('nC * nD / (nB * nA)')
	}
	//appendEqData ONLY works for spcs [0] + [1] -> [2] + [3]
	this.dimensions = [
		new Experiment.Dimension([{paths: ['tempDots1', 'tempDots2', 'tempWalls'], testVals: '[298.15, 398.15 ... 900]'}]),
		new Experiment.Dimension([{paths: ['hFC', 'hFD'], testVals: '[-20, -18 ... -16]'}, {paths: ['eAR'], testVals: '[24, 20... 16]'}])
		//new Experiment.Dimension([{paths: ['BCollide'], testVals: '[.8, 1 ... 1.2]'}])
	]
	this.appendEqData = true;
	this.numReps = 4;
	this.runTime = 40; //seconds;

	//end of experiment parameters
	
	this.draw = false;
	this.runNum = 0;
	this.totalRuns = this.getTotalRuns();
	console.log('Running ' + this.totalRuns + ' tests at ' + this.runTime + ' seconds each.');
	console.log('Total run time: ' + (this.totalRuns * this.runTime) + ' seconds')
	this.resultsSets = [];
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
			console.log("Done!  Ready to print");
			curLevel.pause();

		}
	},
	print: function(dimensionOrder) {
		if (!dimensionOrder) dimensionOrder = Experiment.Dimension.prototype.extendSet('[0 ... ' + (this.dimensions.length - 1) + ']');
		var orderedResults = this.sortResults(this.resultsSets, dimensionOrder);
		var table = '<table border="1" cellpadding="3">';
		table += this.makeHeaderRow();
		for (var i=0; i<orderedResults.length; i++) {
			table += orderedResults[i].asTableRow(this.appendEqData, true);

		}
		table += '</table>';
		$('body').append('<br>');
		$('body').append(table);		
	},
	sortResults: function(sets, dimOrder) {
		if (!dimOrder.length) return sets;
		
		var dimIdx = dimOrder[0];
		var sorted = this.sortSetsByDimIdx(sets.concat(), dimIdx);
		var groups = this.pluckGroups(sorted, dimIdx);
		var idxInSets = 0;
		for (var i=0; i<groups.length; i++) {
			var args = [idxInSets, groups[i].length].concat(this.sortResults(groups[i], dimOrder.slice(1, dimOrder.length - 1)));
			Array.prototype.splice.apply(sets, args);
			idxInSets += groups[i].length;
		}
		return sets;

	},
	pluckGroups: function(sorted, dimIdx) {
		var groups = [];
		var lastVal = -1;
		for (var i=0; i<sorted.length; i++) {
			if (sorted[i].dimValIdxs[dimIdx] != lastVal) {
				groups.push([]);
				lastVal = sorted[i].dimValIdxs[dimIdx];
			}
			groups[groups.length - 1].push(sorted[i]);
		}
		return groups;
	},
	sortSetsByDimIdx: function(sets, byIdx) {
		for (var i=0; i<sets.length; i++) {

			for (var j=0; j<sets.length-1; j++) {
				var here = sets[j];
				var next = sets[j+1];
				if (next.dimValIdxs[byIdx] < here.dimValIdxs[byIdx]) {
					sets[j] = next;
					sets[j+1] = here;
				}
			}
		}
		return sets;
	},
	tryNextMeasurement: function() {
		this.recordPt(this.data, this.mutables, this.dimValIdxs);
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
		return dimValIdxs;
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
	recordPt: function(data, mutables, dataValIdxs) {
		if (this.resultsSets.length) {
			var last = this.resultsSets[this.resultsSets.length - 1];
			if (!last.isAtIdxs(dataValIdxs)) {
				this.resultsSets.push(new Experiment.ResultsSet(dataValIdxs));
			}
		} else {
			this.resultsSets.push(new Experiment.ResultsSet(dataValIdxs));
		}
		

		this.resultsSets[this.resultsSets.length - 1].addResults(new Experiment.Results(data, mutables, this.dataToEval));
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


Experiment.ResultsSet = function(dimValIdxs) {
	this.dimValIdxs = dimValIdxs.concat();
	this.results = [];
}


Experiment.ResultsSet.prototype = {
	addResults: function(results) {
		this.results.push(results);
	},
	isAtIdxs: function(idxs) {
		for (var i=0; i<idxs.length; i++) {
			if (idxs[i] != this.dimValIdxs[i]) return false;
		}
		return true;
	},
	asTableRow: function(appendEqData, pad) {
		var row = '';
		if (pad) row += '<tr><td></td></tr>';
		for (var i=0; i<this.results.length; i++) {
			row += this.results[i].asTableRow(appendEqData);
		}
		return row;
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
		var h3 = spcDefs[3].hF298 * 1000 + spcDefs[3].cp * (temp - 298.15);
		var h2 = spcDefs[2].hF298 * 1000 + spcDefs[2].cp * (temp - 298.15);
		var h1 = spcDefs[1].hF298 * 1000 + spcDefs[1].cp * (temp - 298.15);
		var h0 = spcDefs[0].hF298 * 1000 + spcDefs[0].cp * (temp - 298.15);
		var sRxn298 = (spcDefs[2].sF298 + spcDefs[3].sF298 - spcDefs[1].sF298 - spcDefs[0].sF298);
		var hRxn298 = 1000 * (spcDefs[2].hF298 + spcDefs[3].hF298 - (spcDefs[1].hF298 + spcDefs[0].hF298));
		//var hRxn = h3 + h2 - (h1 + h0);//SHOULD I JUST USE 298?  LOOK HERE: http://www.chem.ufl.edu/~itl/4411/lectures/lec_v.html
		//I did the math.  You should just use hRxn298 since linear hRxn change with temp doesn't affect eq const.
		var eqConst = Math.exp(-(hRxn298-298*sRxn298) / (R * 298.15)) * Math.exp(-(hRxn298 / R) * (1 / temp - 1/298.15)); 
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
		for (var i=Math.max(0, src.length-numPts); i<src.length; i++) {
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