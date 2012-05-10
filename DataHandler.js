function DataHandler(){

}
DataHandler.prototype = {
	pressure: function(fTurn){
		return fTurn*1000/(dataInterval*walls.surfArea());
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