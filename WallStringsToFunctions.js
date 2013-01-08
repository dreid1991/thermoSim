WallMethods.getFunc = {
	record: function(x) {
		return this.recordTable[x];
	},
	recordTable: {
		'Temp': WallMethods.wall.recordTemp,
		'RMS' : WallMethods.wall.recordRMS,
		'PInt': WallMethods.wall.recordPInt,
		'PExt': WallMethods.wall.recordPExt,
		'Vol': WallMethods.wall.recordVol,
		'Work': WallMethods.wall.recordWork,
		'Mass': WallMethods.wall.recordMass,
		'Q': WallMethods.wall.recordQ,
		
	},
	display: function(x) {
		return this.displayTable[x];
	},
	displayTable: {
		'Temp': WallMethods.wall.displayTemp,
		'RMS' : WallMethods.wall.displayRMS,
		'PInt': WallMethods.wall.displayPInt,
		'PExt': WallMethods.wall.displayPExt,
		'Vol': WallMethods.wall.displayVol,
		'Work': WallMethods.wall.displayWork,
		'Mass': WallMethods.wall.displayMass,
		'Q': WallMethods.wall.displayQ,	
	},
	handler: function(x) {
		return this.handlerTable[x];
	},
	handlerTable: {
		'cpAdiabaticDamped': WallMethods.collideMethods.cPAdiabaticDamped,
		'cpAdiabaticDamped32': WallMethods.collideMethods.cPAdiabaticDamped32,
		'cpAdiabatic': WallMethods.collideMethods.cPAdiabatic,
		'cpAdiabatic32': WallMethods.collideMethods.cPAdiabatic32,
		'staticAdiabatic': WallMethods.collideMethods.staticAdiabatic,
		'cVIsothermal': WallMethods.collideMethods.cVIsothermal,
		'cVAdiabatic': WallMethods.collideMethods.cVAdiabatic,
		'cVAdiabatic32': WallMethods.collideMethods.cVAdiabatic32,
	}
}