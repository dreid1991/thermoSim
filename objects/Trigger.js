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

function Trigger(attrs) {
	this.type = 'Trigger';
	this.handle = attrs.handle;
	this.conditionFunc = this.wrapExpr(attrs.expr);
	this.checkOn = attrs.checkOn;
	this.requiredFor = attrs.requiredFor === false ? undefined : (attrs.requiredFor || 'now');
	this.message = attrs.message;
	this.priority = defaultTo(0, attrs.priorityUnsatisfied || attrs.priority);
	this.satisfyStore = defaultTo(undefined, attrs.satisfyStore);
	this.satisfyCmmds = defaultTo(undefined, attrs.satisfyCmmds);
	this.amSatisfied = false;
	this.setupStd();
	this.init();
}
_.extend(Trigger.prototype, objectFuncs, {
	init: function(){
		if (this.checkOn == 'conditions') {
			this.initCheckOnConditions(); //check if condition is met when curLevel goes to see if its conditions are met
		} else {
			this.initCheckOnInterval(); // check if condition is met at update interval, once true, is done and condition is met
		}
		
	},
	wrapExpr: function(expr) {
		with (DataGetFuncs) {
			var func = eval('(function() {return ' + expr + '})')
		}
		return func;
	},
	initCheckOnConditions: function() {
		if (this.requiredFor) {
			conditionManager.add(this);
		}
	},
	initCheckOnInterval: function() {
		addListener(curLevel, 'update', this.handle,
			function(){
				if (this.conditionFunc()) {
					this.amSatisfied = true;
					this.recordVals();
					if (this.satisfyCmmds) {
						for (var cmmdIdx=0; cmmdIdx<this.satisfyCmmds.length; cmmdIdx++) {
							eval(this.satisfyCmmds[cmmdIdx]);
						}
					}
					removeListener(curLevel, 'update', this.handle);
				}
			},
		this);
		if (this.requiredFor) {
			conditionManager.add(this);
		}
	},
	recordVals: function(){
		with (DataGetFuncs) {
			if (this.satisfyStore) {
				for (var storeIdx=0; storeIdx<this.satisfyStore.length; storeIdx++) {
					var storeObj = this.satisfyStore[storeIdx];
					var storeAs = storeObj.storeAs;
					var expr = storeObj.expr;
					var value = eval(expr);
					store(storeAs, value);
				}
			}
		}
	},
	isSatisfied: function(){
		return this.amSatisfied;
	},
	remove: function(){
		removeListener(curLevel, 'update', this.handle);
	},
})