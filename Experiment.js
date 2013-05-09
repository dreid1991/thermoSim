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
	}
	this.rxn = LevelData.mainSequence[0].sceneData.rxns;
	this.appendEqData = true;
	this.runs = [
		{eAF: 4, eAR: 10, hFA: -10, hFB: -10, hFC: -13, hFD: -13, tempDots1: 300, tempDots2: 300, tempWalls: 300},
		//{eAF: 4, eAR: 8, hFA: -10, hFB: -10, hFC: -12, hFD: -12, tempDots1: 400, tempDots2: 400, tempWalls: 400},
		//{eAF: 4, eAR: 6, hFA: -10, hFB: -10, hFC: -11, hFD: -11,tempDots1: 200, tempDots2: 200, tempWalls: 200},
		{eAF: 4, eAR: 4, hFA: -10, hFB: -10, hFC: -10, hFD: -10, tempDots1: 500, tempDots2: 500, tempWalls: 500}
	]
	this.runTime = 10; //seconds;
	this.results = [];
	this.runIdx = -1;
	this.measureNext()
}

Experiment.prototype = {
	measureNext: function() {
		var self = this;
		this.runIdx++;
		if (this.runs[this.runIdx]) {
			
			this.setVals(this.mutables, this.runs[this.runIdx]);
			sceneNavigator.refresh();
			setTimeout(function() {self.tryNextMeasurement(self.mutables, self.data, self.runs[self.runIdx])}, this.runTime * 1000);
		} else {
			var table = '<table border="1" cellpadding="3">';
			table += this.makeHeaderRow();
			for (var i=0; i<this.results.length; i++) {
				table += this.results[i].asTableRow();
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
		tableRow += '</tr>';
		return tableRow;
	},
	tryNextMeasurement: function(mutables, data, run) {
		this.recordPt(data, run);
		this.logLast();
		this.measureNext();

	},
	recordPt: function(data, setPts) {
		this.results.push(new Experiment.Results(data, setPts));
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

Experiment.Results = function(data, setPts) {
	this.data = {};
	this.setPts = deepCopy(setPts);
	for (var datum in data) {
		this.data[datum] = data[datum].avg(200);
	}
}

Experiment.Results.prototype = {
	log: function() {
		console.log('\nSet point');
		console.log(this.objToStr(this.setPts));
		console.log('Produced data');
		console.log(this.objToStr(this.data) + '\n');
	},
	asTableRow: function() {
		var tableRow = '<tr>';
		for (var a in this.setPts) {
			tableRow += '<td>' + this.setPts[a] + '</td>';
		}
		for (var a in this.data) {
			tableRow += '<td>' + this.data[a] + '</td>';
		}
		tableRow += '</tr>';
		return tableRow;
	},
	objToStr: function(obj) {
		var str = '';
		for (var a in obj) {
			str += (a + ': ' + obj[a] + ', ');
		}
		return str;
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