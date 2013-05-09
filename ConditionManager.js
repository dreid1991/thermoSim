/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
				if (/conditions/i.test(cond.checkOn)) {
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
	
		if (/section/i.test(str)) {
			return -1;
		} else if (/prompt/i.test(str)) {
			return Number(/[0-9]+/.exec(str));
		} else if (!isNaN(Number(str))) {
			return Number(str);
		} else {
			// if (timeline.nowTime().promptIdx != -1) {
				// return -1;
			// } else {
			return timeline.nowTime().promptIdx;
			//}
		}
	}
}

ConditionManager.TriggerEntry = function(trigger) {
	this.trigger = trigger;
	this.satisfied = false;
}