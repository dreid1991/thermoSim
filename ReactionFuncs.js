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
	rxnsAreType: function(rxns, type) {
		if (rxns.length) {
			for (var i=1; i<rxns.length; i++) {
				if (!rxns[i] instanceof type) {
					return false;
				}
			}
			return true;
		} else {
			return true;
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
	react: function(a, b, prods) {
		var uRct = a.internalEnergy() + b.internalEnergy();
		var uF298Prod = 0;
		var cVProd = 0;
		var x = .5*(a.x + b.x);
		var y = .5*(a.y + b.y);
		var newDotsBySpc = [];
		for (var prodIdx=0; prodIdx<prods.length; prodIdx++) {
			var prod = prods[prodIdx];
			var spcDots = [];
			uF298Prod += prod.def.uF298 * prod.count;
			cVProd += this.spcs[prod.spcName].cv * prod.count;
			for (var countIdx=0; countIdx<prod.count; countIdx++) {
				var angle = Math.random()*2*Math.PI;
				var UV = V(Math.sin(angle), Math.cos(angle));
				
				spcDots.push(D(x+UV.dx*3, y+UV.dy*3, UV, prod.spcName, a.tag, a.elemId, a.returnTo)); 
			}
			newDotsBySpc.push(spcDots);
			
		}
		uF298Prod *= 1000 / N; //kj/mol -> j/molec;
		cVProd /= N; //j/mol -> j/molec
		var tempF = (uRct - uF298Prod) / cVProd + 298.15;
		if (tempF > 0) {
			this.dotManager.remove([a, b]);
			for (var spcIdx=0; spcIdx<newDotsBySpc.length; spcIdx++) {
				var spcDots = newDotsBySpc[spcIdx];
				this.dotManager.add(spcDots);
				for (var dotIdx=0; dotIdx<spcDots.length; dotIdx++) {
					spcDots[dotIdx].setTemp(tempF);
				}
			}
			return true;
		}
		return false;
		
	}
}


ReactionComponent = function(spcName, count) {
	this.spcName = spcName;
	this.count = count; //how many are being produced, corresponds to order.
	this.def = window.spcs[spcName];
}

ReactionComponent.prototype = {
	copy: function() {
		return new ReactionComponent(this.spcName, this.count);
	},
	flatten: function(path) {
		var flat = [];
		for (var i=0; i<this.count; i++) flat.push(this[path]);
		return flat;
	},
}
