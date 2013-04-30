function PhysTest() {
	this.mutables = {
		eAF: new PhysTest.Mutable('LevelData.mainSequence[0].sceneData.rxns[0].activeE'),
		eAR: new PhysTest.Mutable('LevelData.mainSequence[0].sceneData.rxns[1].activeE'),
		hFA: new PhysTest.Mutable('LevelData.spcDefs[0].hF298'),
		hFB: new PhysTest.Mutable('LevelData.spcDefs[1].hF298'),
		hFC: new PhysTest.Mutable('LevelData.spcDefs[2].hF298'),
		hFD: new PhysTest.Mutable('LevelData.spcDefs[3].hF298'),		
	}
	this.data = {
		nA: new PhysTest.Data('walls[0].getDataSrc("frac", {spcName: "a", tag: "wally"})'),
		nB: new PhysTest.Data('walls[0].getDataSrc("frac", {spcName: "b", tag: "wally"})'),
		nC: new PhysTest.Data('walls[0].getDataSrc("frac", {spcName: "c", tag: "wally"})'),
		nD: new PhysTest.Data('walls[0].getDataSrc("frac", {spcName: "d", tag: "wally"})'),
	}
	this.runs = [
		{eaF: 4, eaR: 10, hfA: -10, hfB: -10, hfC: -13, hfD: -13}
	]
	this.results = [];
	this.measure(this.mutables, this.data, this.runs)
	this.runIdx = -1;
}

PhysTest.prototype = {
	measureNext: function() {
		var self = this;
		this.runIdx++;
		if (this.runs[thisIdx]) {
			this.setVals(this.mutables, this.runs[this.runIdx]);
			sceneNavigator.refresh();
			setTimeout(self.initMeasurement(self.mutables, self.data, self.runs[self.runIdx]), 10000);
		} else {
			console.log('DONE');
			for (var res in this.results) {
				console.log(this.results[res]);
			}
		}
	},
	initMeasurement: function(mutables, data, run) {
		var self = this;
		var interval = window.setInterval(function() {
			var atSS = true;
			for (var datumName in data) {
				if (!data[datumName].atSS()) {
					atSS = false;
					break;
				}
				if (atSS) {
					self.recordPt(data, run);
					window.clearInterval(interval);
					self.measureNext;
				}
			}
		}, 1000);
	},
	recordPt: function(data, setPts) {
		this.results.push(new PhysTest.Results(data, setPts));
	},
	setVals: function(mutables, run) {
		for (var datumName in run) {
			mutables[datumName].set(run[datumName]);
		}
	}
}

PhysTest.Results = function(data, setPts) {
	this.data = {};
	this.setPts = deepCopy(setPts);
	for (var datum in data) {
		this.data[datum] = data[datum].last();
	}
}

PhysTest.Mutable = function(path) {
	this.path = path;
}
PhysTest.Mutable.prototype = {
	get: function() {
		return eval(this.path);
	},	
	set: function(val) {
		eval(this.path + ' = ' + val);
	}
}

PhysTest.Data = function(path) {
	this.path = path;
}

PhysTest.Data.prototype = {
	all: function() {
		return eval(this.path);
	},
	last: function() {
		var data = eval(this.path);
		return data[data.length - 1];
	},
	atSS: function() {
		var sum;
		var data = this.all();
		data = all.slice(Math.round(data.length - 10000/35), data.length);
		var avgs = [];
		var grpSize = 500;
		for (var ceilIdx=data.length-1; ceilIdx>=grpSize; ceilIdx-=grpSize) {
			sum = 0;
			for (var i=0; i<grpSize; i++) {
				sum+= data[ceilIdx-i];
			}
			avgs.push(sum/grpSize);
		}
		sum = 0;
		for (var i=0; i<avgs.length; i++) {
			sum ++ avgs[i];
			
		}
		var avgavg = sum / avgs.length;
		var numOutside = 0;
		for (var i=0; i<avgs.length; i++) {
			numOutside += fracDiff(avgs[i], avgavg) > .1;
		}
		return numOutside <= 2;
	}
}