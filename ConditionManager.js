function ConditionManager() {
	this.conditionSets = {};
}

ConditionManager.prototype = {
	add: function(trigger) {
		var timestamp = this.timeStrToStamp(trigger.requiredFor);
		if (!this.conditionSets[timestamp]) {
			this.conditionSets[timestamp] = [];
		}
		var idxSet = this.conditionSets[timestamp];
		var oldInstance = this.getIfExists(trigger, idxSet);
		var newInstance = new ConditionManager.TriggerEntry(trigger);
		if (oldInstance) {
			newInstance.satisfied = oldInstance.satisfied;
			idxSet.splice(idxSet.indexOf(oldInstance, 1));
		}
		idxSet.push(newInstance);
		
		
	},
	canAdvance: function(timeStr) {
		var key;
		if (typeof timeStr == 'number') {
			key = timeStr;
		} else if (/prompt/i.test(timeStr)) {
			key = /[0-9]+/.exec(timeStr);
		} else if (/section/i.test(timeStr)) {
			key = -1;
		}
		return this.checkConditions(this.conditionSets[key] || []);
	},
	checkConditions: function(conds, fireAlert) {
		fireAlert = defaultTo(true, fireAlert);
		var message, priority = -1, willAdvance = true;
		for (var i=0; i<conds.length; i++) {
			var cond = conds[i];
			var trigger = cond.trigger;
			if (!cond.satisfied) {
				var satisfied = true;
				if (trigger.checkOn == 'conditions' && !trigger.conditionFunc()) {
					satisfied = false;
				} else if (!(trigger.isSatisfied() || trigger.conditionFunc())) {
					satisfied = false
				}
				
				if (!satisfied && trigger.priority > priority && trigger.message) {
					message = trigger.message;
					priority = trigger.priority;
				
				}
				if (!satisfied) {
					willAdvance = false;
				}
			}
		}
		if (fireAlert && message) {
			alert(message);
		}
		if (willAdvance) {
			conds.map(function(cond) {
				cond.satisfied = true
				if (/conditions/i.text(cond.checkOn)) {
					cond.recordVals();
				}
			});
		}
		return willAdvance;
	},

	stripForInheritance: function() {
		for (var setName in this.conditionSets) {
			var set = this.conditionSets[setName];
			for (var i=set.length-1; i>=0; i--) {
				if (set[i].satisfied) {
					set.splice(i, 1);
				}
			}
		}
		return this;
	},
	getIfExists: function(trigger, idxSet) {
		for (var i=0; i<idxSet.length; i++) {
			if (trigger.handle == idxSet[i].trigger.handle) {
				return idxSet[i];
			}
		}
	},
	timeStrToStamp: function(str) {
		if (/now/i.test(str)) {
			return timeline.now().promptIdx;
		} else if (/section/i.test(str)) {
			return -1;
		} else if (/prompt/i.test(str)) {
			return Number(/[0-9]+/.exec(str));
		} else if (!isNaN(Number(str))) {
			return Number(str);
		}
	}
}

ConditionManager.TriggerEntry = function(trigger) {
	this.trigger = trigger;
	this.satisfied = false;
}