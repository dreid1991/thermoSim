function DataHandler(){
	this.tConst = tConst;
}
DataHandler.prototype = {
	temp: function(info){
		info = defaultTo({}, info);
		//info can have attrs spcName and/or tag
		return this.KEAvg(info)*this.tConst;
	},
	tempFunc: function(info){
		info = defaultTo({}, info);
		var self = this;
		return function(){
			return self.KEAvg(info)*self.tConst;
		}
	},
	countFunc: function(info){
		if(info && info.tag){//assuming you only send one thing in info
			return function(){
				var tag = info.tag;
				var count = 0;
				for(var spcName in spcs){
					var spc = spcs[spcName];
					for(var dotIdx=0; dotIdx<spc.length; dotIdx++){
						if(spc[dotIdx].tag==tag){
							count++;
						}
					}
					
				}
				return count;
			}
		}else{
			return function(){
				var count = 0;
				for(var spcName in spcs){
					count += spcs[spcName].length;
				}
				return count;
			}
		}
	},
	count: function(info) {
		var count = 0;
		if (!info) {
			for(spcName in spcs){
				var dots = spcs[spcName];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					count++;
				}				
			}
		} else if (info.spcName) {
			count = spcs[info.spcName].length;
		} else if (info.tag) {
			for(spcName in spcs){
				var dots = spcs[spcName];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					if (dots[dotIdx] == info.tag) {
						count++;
					}
				}				
			}		
		}
	
		
		return count;	
	},
	RMS: function(info) {
		var count = 0;
		var sum = 0;
		if (!info) {
			for(spcName in spcs){
				var dots = spcs[spcName];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					sum += dots[dotIdx].v.magSqr();
					count++;
				}				
			}
		} else if (info.spcName) {
			var dots = spcs[info.spcName];
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				sum += dots[dotIdx].v.magSqr();
				count++;
			}
		} else if (info.tag) {
			for(spcName in spcs){
				var dots = spcs[spcName];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					if (dots[dotIdx].tag == info.tag) {
						sum += dots[dotIdx].v.magSqr();
						count++;
					}
				}				
			}		
		}
		return pxToMS*Math.sqrt(sum/count);
	},
	velocities: function(info){
		info = defaultTo({}, info);
		var tag = info.tag;
		var spcToMeasure = info.spcName;
		if (spcToMeasure) {
			var spc = spcs[spcToMeasure];
			var numDots = spc.length
			var velocities = new Array(numDots);
			for (var dotIdx=0; dotIdx<numDots; dotIdx++){
				var dot = spc[dotIdx];
				if(!tag || tag==dot.tag){
					velocities[dotIdx] = dot.speed();
				}
			}			
		} else if (tag) {
			for (var spc in spcs) {
				var dots = spcs[spc];
				var velocities = new Array();
				for (var dotIdx=0; dotIdx<numDots; dotIdx++){
					if(tag==dots[dotIdx].tag){
						velocities.push(dot[dotIdx].speed());
					}
				}	
			}
		} else {
			var velocitiesAll = [];
			for (var spc in spcs) {
				var dots = spcs[spc];
				var velocities = new Array(dots.length);
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++){
					velocities[dotIdx] = dot[dotIdx].speed();		
				}
				velocitiesAll = velocitiesAll.concat(velocities);
			}
			velocities = velocitiesAll;
		}

		return velocities;
	},
	velocityAvg: function(info){
		info = defaultTo({}, info);
		vList = this.velocities(info);
		var sum=0;
		for(var dotIdx=0; dotIdx<vList.length; dotIdx++){
			sum+=vList[dotIdx];
		}
		return sum/vList.length;
	},
	KEAvg: function(info){
		info = defaultTo({}, info);
		var tag = info.tag;
		var spcToMeasure = info.spcName;
		var sumKE=0;
		if(spcToMeasure){
			var dots = spcs[spcName];
			var KEResult = this.KESpc(dots, tag);
			sumKE += KEResult.sumKE;
			return sumKE/KEResult.num;
		}
		var numDots = 0;
		for(spcName in spcs){
			if(!spcToMeasure || spcToMeasure==spcName){
				var dots = spcs[spcName];
				var KEResult = this.KESpc(dots, tag);
				sumKE += KEResult.sumKE;
				numDots += KEResult.num;
			}
		}
		return sumKE/numDots;
	},
	KESpc: function(dots, tag){
		var sumKE = 0;
		var numCounted = 0;
		for(var dotIdx=0; dotIdx<dots.length; dotIdx++){
			var dot = dots[dotIdx];
			if(!tag || tag==dot.tag){
				numCounted++;
				sumKE+=dots[dotIdx].KE();
			}
		}	
		return {sumKE:sumKE, num:numCounted};
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