function DataHandler(){
	this.pConst = 25;
}
DataHandler.prototype = {
	pressureInt: function(forceInternal, numUpdates, SA){
		var p = this.pConst*forceInternal/(numUpdates*SA);
		console.log('pInt ',p);
		return p;
	},
	pressureExt: function(weight, g, SA){
		var p = this.pConst*weight*g/SA;
		console.log('pExt ',p);
		return p;
	},
	temp: function(){
		//console.log("new");
		var t=0;
		var numDots = 0;
		for (var spcIdx=0; spcIdx<spcs.length; spcIdx++){
			spc = spcs[spcIdx];
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