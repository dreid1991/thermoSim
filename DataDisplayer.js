function DataDisplayer () {
	this.entries = [];
}

DataDisplayer.prototype = {
	setReadouts: function(readouts) {
		this.readouts = readouts;
	},
	addEntry: function(attrs) {
		var self = this;
		var label = attrs.label;
		var sigFigs = attrs.sigFigs;
		var expr = attrs.expr;
		var units = attrs.units;
		var cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
		var readout = this.readouts[attrs.readout];
		if (!readout) console.log('Bad readout name ' + attrs.readout);
		var listenerStr = 'display' + label + this.entries.length;
		
		with (this.dataGetFuncs) {
			addListener(curLevel, 'update', listenerStr, function() {
				var displayStr = label;
				var val = eval(expr);
				if (isNaN(val) || val === undefined) 
					val = 'err'
				else
					val = self.forceSigFigs(val, sigFigs);
			})
		
		}
		/*
		if (!dataObj.displaying()) {
			if (inPrompt()) this.setupPromptDisplayStop(dataObj);
			dataObj.displaying(true);
			var src = dataObj.src();
			dataObj.readout(readout);
			var firstVal = src[src.length-1];
			if (!validNumber(firstVal)) {
				firstVal = 0;
			}
			var readout = dataObj.readout();
			var entryHandle = dataObj.id() + dataObj.wallHandle().toCapitalCamelCase();
			var listenerStr = 'display' + entryHandle.toCapitalCamelCase();
			readout.addEntry(entryHandle, label, units, firstVal, undefined, decPlaces);
			if (func) {
				addListener(curLevel, 'update', listenerStr,
					function() {func(entryHandle, src)},
				this);
			} else {
				addListener(curLevel, 'update', listenerStr,
					function() {
						readout.hardUpdate(entryHandle, src[src.length-1]);
					},
				this);
			}
			dataObj.displayStop(function() {
				this.displaying(false);
				this.readout().removeEntry(entryHandle);
				removeListener(curLevel, 'update', listenerStr);
			})
		} else {
			console.log('Tried to display ' + dataObj.id() + ' for wall ' + dataObj.wallHandle() + ' while already displaying');
		}
*/		
		

	},
	dataGetFuncs: {
		temp: function(wallHandle) {
			var src = walls[wallHandle].getDataObj('temp').src();
			return src[src.length - 1];
		},
		pInt: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('pInt').src();
			return src[src.length - 1];
		},
		pExt: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('pExt').src();
			return src[src.length - 1];
		},
		vol: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('vol').src();
			return src[src.length - 1];
		},
		q: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('q').src();
			return src[src.length - 1];
		},
		mass: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('mass').src();
			return src[src.length - 1];
		},
		moles: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('mass', args).src();
			return src[src.length - 1];
		},
		frac: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('frac', args).src();
			return src[src.length - 1];
		},
		time: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('time', args).src();
			return src[src.length - 1];
		},
		work: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('work', args).src();
			return src[src.length - 1];
		}
	},
	forceSigFigs: function(val, sigFigs) {
		var str = String(val);
		var hitSig = false;
		var sigsHit = 0;
		var decHit = false;
		for (var i=0; i<str.length; i++) {
			var val = str[i];
			if (val == '.') {
				decHit = true;
			} else if (hitSig) {
				sigsHit ++;
			} else if (val != '0') {
				sigsHit ++;
				hitSig = true;
			}	
		}
		if (sigsHit >= sigFigs) {
			return Number(val);
		} else {
			if (decHit) str += '.';
			var toAdd = sigFigs - sigsHit;
			for (var sigAdd=0; sigAdd<toAdd; sigAdd++) {
				str += '0';
			}
			return str;
		}
	},
}