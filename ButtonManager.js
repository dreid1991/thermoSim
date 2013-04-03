function ButtonManager(wrapperDiv) {
	this.wrapperDiv = wrapperDiv;

	this.groups = [];
	
}

ButtonManager.prototype = {
	addGroup: function(handle, label, prefIdx) {
		var groupId = 'group' + handle;
		var wrapperId = groupId + 'Wrapper';
		var groupButtonWrapperHTML = templater.div({attrs: {id: [groupId], class: ['buttonGroup']}});
		var wrapperInner = label + templater.br() + groupButtonWrapperHTML;
		var groupWrapperHTML = templater.div({attrs: {id: [wrapperId], groupHandle: [handle], class: ['displayText']}, innerHTML: wrapperInner});
		this.wrapperDiv.append(groupWrapperHTML);
		this.groups.push(new ButtonManager.Group(this.wrapperDiv, groupId, handle, label, prefIdx));
		//need to arrange at some point
	},
	addButton: function(groupHandle, handle, label, exprs, prefIdx) {
		var group = this.getGroup(groupHandle);
		if (group) {
			group.addButton(handle, label, exprs, prefIdx);
		}
	},
	getGroup: function(groupHandle) {
		for (var i=0; i<this.groups.length; i++) 
			if (this.groups[i].handle == groupHandle) return this.groups[i];
	},
	arrangeObjs: function(unarranged) {
		var assignments = [];
		var sortedObjs = this.sortObjs(unarranged).concat();
		var assignedPrefs = this.slicePrefs(sortedObjs);
		var unassignedPrefs = this.sliceNoPrefs(sortedObjs);
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
				assignments.splice(i, 1);
			}
		}
		return assignments;
	},
	sortObjs: function(objs) {
		for (var i=0; i<objs.length; i++) {
			for (var j=0; j<objs.length - 1; j++) {
				if (objs[j].prefIdx > objs[j + 1].prefIdx || objs[j].prefIdx == undefined) {
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
		return objs.slice(0, objs.length);
	},
	sliceNoPrefs: function(objs) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].prefIdx == undefined) {
				return objs.slice(i, objs.length);
			}
		}
		return [];
	}
	
}
function blorg() {
	var foo = new ButtonManager($('#buttonManager'));
	foo.addGroup('3141a','sdafasd',1);
	foo.addGroup('dsafsd','faewasd', 0);
	foo.addGroup('3141b','sdafasd',0);
	foo.addGroup('3141c','sdafasd',3);
	foo.addGroup('af', 'dsfdsa', undefined);
	foo.addButton('3141c', 'glorp', 'Label!', function(){console.log('hi')}, 0);
}
//groupHandle, handle, label, exprs, prefIdx
ButtonManager.Group = function(mgrDiv, groupId, handle, label, prefIdx) {
	this.mgrDiv = mgrDiv;
	this.groupId = groupId;
	this.handle = handle;
	this.label = label;
	this.prefIdx = prefIdx;
	this.buttons = [];
}

ButtonManager.Group.prototype = {
	addButton: function(handle, label, exprs, prefIdx) {
		this.buttons.push(new ButtonManager.Button(handle, label, exprs, prefIdx));
		var buttonHTML = templater.button({innerHTML: label, attrs: {id: [handle], handle: [handle]}});
		$('#' + this.groupId).append(buttonHTML);
		var buttonJQ = $('button#' + handle);
		addJQueryElems(buttonJQ, 'button');
		$(buttonJQ).click(this.buttons[this.buttons.length - 1].cb);
	}
}

ButtonManager.Button = function(handle, label, exprs, prefIdx) {
	this.handle = handle;
	this.label = label;
	if (typeof exprs == 'function') {
		this.cb = exprs;
	} else {
		this.cb = this.wrapExprs(exprs);
	}
	this.prefIdx = prefIdx;
}

ButtonManager.Button.prototype = {
	wrapExprs: function(exprs) {
		exprStr = exprs.join(';') + ';';
		return eval('(function() {return ' + exprStr + '})');
	},

}

