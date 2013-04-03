function ButtonManager(wrapperDiv) {
	this.wrapperDiv = wrapperDiv;
	this.groups = [];
	
}

ButtonManager.prototype = {
	addGroup: function(handle, label, prefIdx) {
		this.groups.push(new ButtonManager.Group(this.wrapperDiv, handle, label, prefIdx));
		
	},
	addButton(groupHandle, handle, label, exprs, prefIdx) {
		var group = this.getGroup(groupHandle);
		if (group) {
			group.addButton(handle, label, exprs, prefIdx);
		}
	}
	getGroup: function(groupHandle) {
		for (var i=0; i<this.groups.length; i++) 
			if (this.groups[i].handle == groupHandle) return this.groups[i]
	},
	arrangeObjs: function(objs) {
		var assignments = [];
		var sortedObjs = this.sortObjs(objs).concat();
		var assignedPrefs = slicePrefs(sortedObjs);
		var unassignedPrefs = sliceNoPrefs(sortedObjs);
		for (var i=0; i<assignedPrefs.length; i++) {
			var prefIdx = assignedPrefs[i].prefIdx;
			if (!assignments[prefIdx]) {
				assignments[prefIdx] = assignedPrefs[i];
			} else {
				assignments.push(assignedPrefs[i]);
			}
		}
		var idxSrc = 0;
		var idxDest = 0;
		while (idxSrc < unassignedPrefs.length) {
			if (assignments[idxDest] == undefined) {
				assignments[idxDest] = unassignedPrefs[idxSrc];
				idxSrc ++;
			}
			idxDest ++;
		}
		for (var i=assignments.length-1; i>=0; i--) {
			if (assignments[i] == undefined) {
				assignments = assignments.splice(i, 1);
			}
		}
	},
	sortObjs: function(objs) {
		for (var i=0; i<objs.length; i++) {
			for (var j=0; j<objs.length - 1; j++) {
				if (objs[j].prefIdx < objs[j + 1].prefIdx || objs[j].prefIdx == undefined) {
					var a = objs[j];
					var b = objs[j + 1];
					objs[j] = b;
					objs[j + 1] = a;
				}
			}			
		}
		return objs;
		
	},
	slicePrefs: function(objs) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].prefIdx == undefined) {
				return objs.slice(0, i);
			}
		}
	}
	sliceNoPrefs: function(objs) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].prefIdx == undefined) {
				return objs.slice(i, objs.length);
			}
		}
	}
	
}

ButtonManager.Group = function(mgrDiv, handle, label, prefIdx) {
	this.mgrDiv = mgrDiv;
	
	this.handle = handle
	this.label = label;
	this.prefIdx = prefIdx;
	this.buttons = [];
}

ButtonManager.Group.prototype = {
	addButton: function(handle, label, exprs, prefIdx) {
		this.buttons.push(new ButtonManager.Button(handle, label, exprs, prefIdx));
	}
}

ButtomManager.Button = function(handle, label, exprs, prefIdx) {
	this.handle = handle;
	this.label = label;
	this.cb = this.wrapExprs(exprs);
	this.prefIdx = prefIdx;
}

ButtonManager.Button.prototype = {
	wrapExprs: function(exprs) {
		exprStr = exprs.join(';') + ';';
		return eval('(function() {return ' + exprStr + '})');
	},

}

