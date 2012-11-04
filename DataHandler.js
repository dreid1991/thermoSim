function DataHandler(){
	this.tConst = tConst;
}
DataHandler.prototype = {
	temp: function(info){
		//info can have attrs spcName and/or tag
		return this.KEAvg(info)*this.tConst;
	},
	tempFunc: function(info){
		var self = this;
		return function(){
			return self.KEAvg(info)*self.tConst;
		}
	},
	avgTemp: function() {
		var sum = 0;
		for (var wallIdx=0; wallIdx<walls.length; wallIdx++) {
			sum += walls[wallIdx].data.t[walls[wallIdx].data.t.length-1];
		}
		return sum/walls.length;
	},
	countFunc: function(info){
		var self = this;
		return function() {
			return self.count(info);
		}
	},
	count: function(info) {
		return dotManager.get(info).length;
	},
	RMS: function(info) {
		//var count = 0;
		var sum = 0;
		var dots = dotManager.get(info);
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			sum += dots[dotIdx].v.magSqr();
		}

		return pxToMS*Math.sqrt(sum/dots.length);
	},
	velocities: function(info){
		var dots = dotManager.get(info);
		var velocities = new Array(dots.length);
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			velocities[dotIdx] = dots[dotIdx].v.mag();
		}
		return velocities;
	},
	velocityAvg: function(info){
		vList = this.velocities(info);
		var sum=0;
		for(var dotIdx=0; dotIdx<vList.length; dotIdx++){
			sum+=vList[dotIdx];
		}
		return sum/vList.length;
	},
	KEAvg: function(info){
		var sumKE = 0;
		var dots = dotManager.get(info);
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			sumKE += dots[dotIdx].KE();
		}
		return sumKE/dots.length;
	},

	volume: function(wallInfo){
		if(wallInfo===undefined){
			var volume = walls.totalVolume();
		}else{
			var volume = walls.wallVolume(wallInfo);
		}
		return volume;
	},
	volumeFunc: function(wallInfo){
		var self = this;
		return function(){
			return self.volume(wallInfo);
		}
	}
}