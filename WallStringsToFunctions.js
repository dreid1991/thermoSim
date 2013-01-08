WallMethods.getFunc = {
	record: function(x) {
		if (x == 'Temp') {
			return WallMethods.wall.recordTemp;
		} else if (x == 'RMS') {
			return WallMethods.wall.recordRMS;
		} else if (x == 'PInt') {
			return WallMethods.wall.recordPInt;
		} else if (x == 'PExt') {
			return WallMethods.wall.recordPExt;
		} else if (x == 'Vol') {
			return WallMethods.wall.recordVol;
		} else if (x == 'Work') {
			return WallMethods.wall.recordWork;
		} else if (x == 'Mass') {
			return WallMethods.wall.recordMass;
		} else if (x == 'Q') {
			return WallMethods.wall.recordQ;
		}
	},
	display: function(x) {
		if (x == 'Temp') {
			return WallMethods.wall.displayTemp;
		} else if (x == 'TempSmooth') {
			return WallMethods.wall.displayTempSmooth;
		} else if (x == 'RMS') {
			return WallMethods.wall.displayRMS;
		} else if (x == 'PInt') {
			return WallMethods.wall.displayPInt;
		} else if (x == 'PExt') {
			return WallMethods.wall.displayPExt;
		} else if (x == 'Vol') {
			return WallMethods.wall.displayVol;
		} else if (x == 'Work') {
			return WallMethods.wall.displayWork;
		} else if (x == 'Mass') {
			return WallMethods.wall.displayMass;
		} else if (x == 'Q') {
			return WallMethods.wall.displayQ;
		} else if (x == 'QArrowsRate') {
			return WallMethods.wall.displayQArrowsRate;
		} else if (x == 'QArrowsAmmt') {
			return WallMethods.wall.displayQArrowsAmmt;
		}
	},
	handler: function(x) {
		if (x == 'cPAdiabaticDamped') {
			return WallMethods.collideMethods.cPAdiabaticDamped;
		} else if (x == 'cPAdiabaticDamped32') {
			return WallMethods.collideMethods.cPAdiabaticDamped32;
		} else if (x == 'cPAdiabatic') {
			return WallMethods.collideMethods.cPAdiabatic;
		} else if (x == 'cPAdiabatic32') {
			return WallMethods.collideMethods.cPAdiabatic32;
		} else if (x == 'staticAdiabatic') {
			return WallMethods.collideMethods.staticAdiabatic;
		} else if (x == 'cVIsothermal') {
			return WallMethods.collideMethods.cVIsothermal;
		} else if (x == 'cVAdiabatic') {
			return WallMethods.collideMethods.cVAdiabatic;
		} else if (x == 'cVAdiabatic32') {
			return WallMethods.collideMethods.cVAdiabatic32;
		}
	}
}