function DataHandler(){
}
DataHandler.prototype = {
	pressureInt: function(forceInternal, numUpdates, SA){
		return pConst*forceInternal/(numUpdates*SA);
	},
	pressureExt: function(weight, g, SA){
		return pConst*weight*g/SA;
	},
	temp: function(){
		var sumKE = 0
		var numDots = 0;
		for (var spcName in spcs){
			spc = spcs[spcName];
			var numInSpc = spc.dots.length;
			numDots += numInSpc;
			for (var dotIdx=0; dotIdx<numInSpc; dotIdx++){
				var dot = spc.dots[dotIdx];
				sumKE += dot.KE();
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
	volOneWall: function(){
		return walls.area(0)*vConst;
	},
	volPolyWall: function(){
		return curLevel.vol()*vConst;
	}
}