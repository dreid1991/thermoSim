function DataHandler(){
}
DataHandler.prototype = {
	pressureInt: function(forceInternal, numUpdates, SA){
		return pConst*forceInternal/(numUpdates*SA);
	},
	pressureExt: function(weight, g, SA){
		return pConst*weight*g/SA;
	},
	temp: function(spcName){
		var sumKE = 0
		var numDots = 0;
		if(spcName){
			spc = spcs[spcName];
			var numInSpc = spc.dots.length;
			numDots += numInSpc; 
			for (var dotIdx=0; dotIdx<numInSpc; dotIdx++){
				var dot = spc.dots[dotIdx];
				sumKE += dot.KE();
			}		
		}else{
			for (var spcName in spcs){
				spc = spcs[spcName];
				var numInSpc = spc.dots.length;
				numDots += numInSpc; 
				for (var dotIdx=0; dotIdx<numInSpc; dotIdx++){
					var dot = spc.dots[dotIdx];
					sumKE += dot.KE();
				}
			}
		}
		t = sumKE*tConst;
		t/=(numDots);
		return t;
		
	},
	velocities: function(spcName){
		var spc = spcs[spcName];
		var numDots = spc.dots.length
		var velocities = new Array(numDots);
		
		for (var dotIdx=0; dotIdx<numDots; dotIdx++){
			var dot = spc.dots[dotIdx];
			velocities[dotIdx] = dot.speed();
		}
		return velocities;
	},
	velocityAvg: function(spcName){
		vList = this.velocities(spcName);
		var sum=0;
		for(var dotIdx=0; dotIdx<vList.length; dotIdx++){
			sum+=vList[dotIdx];
		}
		return sum/vList.length;
	},
	KEAvg: function(spcName){
		var sumKE=0;
		if(spcName){
			var dots = spcs[spcName].dots;
			for(var dotIdx=0; dotIdx<dots.length; dotIdx++){
				sumKE+=dots[dotIdx].KE();
			}
			return sumKE/dots.length;
		}
		var numDots=0;
		for(spcName in spcs){
			var dots = spcs[spcName].dots;
			numDots+=dots.length;
			for(var dotIdx=0; dotIdx<dots.lenght; dotIdx++){
				sumKE+=dots[dotIdx].KE();
			}
		}
		return sumKE/numDots;
	},
	volOneWall: function(){
		return walls.area(0)*vConst;
	},
	volPolyWall: function(){
		return curLevel.vol()*vConst;
	}
}