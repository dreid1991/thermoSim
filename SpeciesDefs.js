speciesDefs = 	{spc1: {m:3, r:2, cols: Col(200,0,0)},
				spc2: {m:5, r:6, cols: Col(0,200,200)},
				spc3: {m:1, r:1, cols: Col(225, 0, 225)}, 
				spc4: {m:4, r:4, cols: Col(0,200,200)},
				spc5: {m:8, r:6, cols: Col(255,255,0)},
				spc6: {m:2, r:2, cols: Col(111,111,253)}};
$(function(){
	var idNum = 0;
	for (var spcName in speciesDefs){
		speciesDefs[spcName].idNum = idNum;
		speciesDefs[spcName].spcName = spcName;
		idNum++;
	}
})