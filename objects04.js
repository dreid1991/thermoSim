function Liquid(attrs) {
	this.wallInfo = attrs.wallInfo;
	this.handle = handle;
	this.cleanUpWith = attrs.cleanUpWith || currentSetupType;
	var actCoeffType = attrs.actCoeffType; //twoSfxMrg for two suffix margules, 
	var actCoeffInfo = attrs.actCoeffInfo;
	
	var tempInit = attrs.tempInit;
	var compInfo = attrs.compInfo; //formatted as {spc1: {moles: #, spcVol: #, pPure: #} ... }
	this.spcList = this.genSpcList(compInfo);
	var vapPressure = window.grabAttrs(compInfo, ['pPure']);
	var molesInit = window.grabAttrs(compInfo, ['moles']);
	this.actCoeffFuncs = this.genActCoeffFuncs(actCoeffType, actCoeffInfo, spcList);
	
}

_.extend(Liquid.prototype, objectFuncs, {
	genSpcList: function(compInfo) {
		var list = [];
		for (var spcName in compInfo) {
			list.push(spcName);
		}
		return list;
	},
	genActCoeffFuncs: function(type, info, spcList) {
		if (type == 'twoSfxMrg') {
			var coeff = info.a
			return this.genTwoSfxMrgFuncs(spcList, coeff);
		}
	},
	genTwoSfxMrgFuncs: function(spcList, coeff) {
		var funcs = {};
		var gasConst = R;
		for (var spcIdx=0; spcIdx<spcList.length; spcIdx++) {
			var spcName = spcList[spcIdx];
			funcs[spcName] = function(x, T) {
				return Math.exp(coeff * x * x / (gasConst * T)); 
			}
		}
		return funcs;
	},
})
