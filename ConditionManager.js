function ConditionManager() {
	this.conditionSets = {};
}

ConditionManager.prototype = {
	add: function(trigger) {
		var timestamp = this.timeStrToStamp(trigger.requiredFor);
		if (!this.conditionSets[timestamp]) {
			this.conditionSets[timestamp] = [];
		}
		var sets = this.conditionSets[timestamp];
		var oldInstance = this.getIfExists(trigger, sets);
		var newInstance = new ConditionManager.TriggerEntry(trigger);
		if (oldInstance) {
			newInstance.satisfied = oldInstance.satisfied;
			sets.splice(sets.indexOf(oldInstance, 1));
		}
		sets.push(newInstance);
		
		
	},
	getIfExists: function(trigger, sets) {
		for (var i=0; i<sets.length; i++) {
			if (trigger.handle == sets[i].trigger.handle) {
				return sets[i].trigger.handle;
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