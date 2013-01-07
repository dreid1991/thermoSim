speciesDefs = 	{'spc1': {m:3, r:2, cols: Col(200,0,0), attractRad:60, attractStr:200, attractStrs:[], idNum:0, spcName:''},
				'spc2': {m:5, r:6, cols: Col(0,200,200), attractRad:50, attractStr:100, attractStrs:[], idNum:0, spcName:''},
				'spc3': {m:1, r:1, cols: Col(225, 0, 225), attractRad:50, attractStr:0, attractStrs:[], idNum:0, spcName:''}, 
				'spc4': {m:4, r:4, cols: Col(0,200,200), attractRad:50, attractStr:20, attractStrs:[], idNum:0, spcName:''},
				'spc5': {m:8, r:6, cols: Col(255,255,0), attractRad:50, attractStr:100, attractStrs:[], idNum:0, spcName:''},
				'spc6': {m:2, r:2, cols: Col(111,111,253), attractRad:50, attractStr:20, attractStrs:[], idNum:0, spcName:''}};
$(function(){
	var idNum = 0;
	for (var spcName in speciesDefs) {
		speciesDefs[spcName].idNum = idNum;
		speciesDefs[spcName].spcName = spcName;
		idNum++;
	}
})
$(function() {
	for (var spcName in speciesDefs) {
		var spc = speciesDefs[spcName];
		var attrStrsList = spc.attractStrs;
		for (var attracting in speciesDefs) {
			var attractSpc = speciesDefs[attracting];
			var attractingId = attractSpc.idNum;
			attrStrsList[attractingId] = Math.sqrt(spc.attractStr*attractSpc.attractStr);
		}
	}
})