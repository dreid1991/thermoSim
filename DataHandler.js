function DataHandler(){
	this.pConst = 25;
}
DataHandler.prototype = {
	pressureInt: function(forceInternal, numUpdates, SA){
		return this.pConst*forceInternal/(numUpdates*SA);
	},
	pressureExt: function(weight, g, SA){
		return this.pConst*weight*g/SA;
	},
	temp: function(){
		//console.log("new");
		var t=0;
		var numDots = 0;
		for (var spcName in spcs){
			spc = spcs[spcName];
			var numInSpc = spc.dots.length;
			numDots += numInSpc;
			for (var dotIdx=0; dotIdx<numInSpc; dotIdx++){
				var dot = spc.dots[dotIdx];
				var temp = dot.temp();
				//console.log(temp);
				t+=temp
				//t+=temp*temp;
			}
		}
		t/=(numDots);
		return t //Math.sqrt(t);
		
	},
	volOneWall: function(){
		return walls.area(0)/1000;
	},
	volPolyWall: function(){
		return curLevel.vol()/1000;
	}
}