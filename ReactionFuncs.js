ReactionFuncs = {
	rxnIsEnabled: function(handle) {
		var active = this.getRxn(this.activeRxns, handle);
		return active ? true : false;
	},
	disableRxn: function(handle) {
		this.removeRxn(handle);
	},
	enableRxn: function(handle) {
		var rxn = this.getRxn(this.pausedRxns, handle);
		if (rxn) {
			this.pausedRxns.splice(this.pausedRxns.indexOf(rxn), 1);
			this.initRxn(rxn);
		}
	},
	removeRxn: function(handle) {
		for (var rxnId in this.rxns) {
			var spcRxns = this.rxns[rxnId];
			var removedRxn = false;
			for (var spcRxnIdx=spcRxns.length - 1; spcRxnIdx>=0; spcRxnIdx--) {
				var spcRxn = spcRxns[spcRxnIdx];
				if (spcRxn.handle == handle) {
					spcRxns.splice(spcRxnIdx, 1);
					removedRxn = true;
				
				}
			
			}
			if (removedRxn) {
				if (spcRxns.length == 0) {
					this.collide.setHandlerByIdStr(rxnId, {func:this.collide.impactStd, obj:this.collide})
				} else if (spcRxns.length ==1) {
					var rxn = spcRxns[0];
					this.initPair(rxn, true);
				}
			}
		}
		var rxn = this.getRxn(this.activeRxns, handle);
		if (rxn) {
			this.activeRxns.splice(this.activeRxns.indexOf(rxn), 1);
			this.pausedRxns.push(rxn);
		}
	},
	getRxn: function(rxns, handle) {
		for (var i=0; i<rxns.length; i++) {
			if (handle == rxns[i].handle) return rxns[i];
		}
	},
	initRxn: function(rxn) {
		this.initPair(rxn)

		this.activeRxns.push(rxn);
		
	},
	
	removeAllReactions: function(){
		this.collide.setDefaultHandler({func:this.collide.impactStd, obj:this});
	},
}