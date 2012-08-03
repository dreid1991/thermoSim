function DataHandler(){
	this.tConst = tConst;
}
DataHandler.prototype = {
	temp: function(info){
		info = defaultTo({}, info);
		//info can have attrs spcName and/or tag
		return this.KEAvg(info)*this.tConst;
	},
	velocities: function(info){
		info = defaultTo({}, info);
		var tag = info.tag;
		var spcToMeasure = info.spcName;
		var spc = spcs[spcToMeasure];
		var numDots = spc.length
		var velocities = new Array(numDots);
		
		for (var dotIdx=0; dotIdx<numDots; dotIdx++){
			var dot = spc[dotIdx];
			if(!tag || tag==dot.tag){
				velocities[dotIdx] = dot.speed();
			}
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
			var area = walls.totalArea();
		}else{
			var area = walls.wallArea(wallInfo);
		}
		return area*vConst;
	},
}