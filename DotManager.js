function DotManager() {
	this.lists = {ALLDOTS:[]};
}
//Yo yo, make spcs[w/e].populate add lists here and then spc references this list.  THIS IS THE MOTHERLIST
DotManager.prototype = {
//start public funcs
	add: function(dot) {//can send as list or single dot
		this.execAllCombos(this.addFunc, dot);
	},
	remove: function(dot) {//can send as list or single dot
		if (dot instanceof Array) {
			for (var dotIdx=0; dotIdx<dot.length;dotIdx++) {
				dot[dotIdx].removeFromParents();
			}
		} else {
			dot.removeFromParents();
		}
	},
	removeByInfo: function(info) {
		if (info.spcName && info.tag) {
			this.execAllCombos(this.removeByNameAndTagFunc, info);
		} else if (info.spcName){
			this.execAllCombos(this.removeByNameFunc, info);
		} else if (info.tag) {
			this.execAllCombos(this.removeByTagFunc, info);
		} else {
			console.log('No useful info given to removeByInfo func in DotManager');
			console.trace();
		}
	},
	get: function(info) {
		if (info) {
			if (info.spcName && info.tag) {
				return this.lists[info.spcName + '-' + info.tag];
			} else if (info.spcName) {
				return this.lists[info.spcName];
			} else if (info.tag) {
				return this.lists[info.tag];
			}
		} else {
			return this.lists.ALLDOTS;
		}
	},
	clearAll: function() {
		for (var list in this.lists) {
			this.lists[list].splice(0, this.lists[list].length);
		}
		this.lists = {ALLDOTS:[]};
	},
	
//end public funcs
	addFunc: function(list, dot) {
		list.push(dot);
		dot.parentLists.push(list);
	},
	removeFunc: function(list, dot) {
		var idx = list.indexOf(dot);
		if (idx>-1) {
			list.splice(idx, 1);
			dot.parentLists.splice(dot.parentLists.indexOf(list), 1);
		} else {
			console.log('Tried to remove dot from global list of spcName ' + dot.spcName + ' and tag ' + dot.tag + '. Dot not present.');
			console.trace();
		}
	},
	removeByNameAndTagFunc: function(list, info) {
		for (var dotIdx=list.length-1; dotIdx>-1; dotIdx--) {
			if (list[dotIdx].spcName==info.spcName && list[dotIdx].tag==info.tag) {
				list[dotIdx].removeFromParents();
			}
		}
	},	
	removeByNameFunc: function(list, info) {
		for (var dotIdx=list.length-1; dotIdx>-1; dotIdx--) {
			if (list[dotIdx].spcName==info.spcName) {
				list.splice(dotIdx, 1);
				list[dotIdx].removeFromParents();	
			}
		}
	},	
	removeByNameAndTagFunc: function(list, info) {
		for (var dotIdx=list.length-1; dotIdx>-1; dotIdx--) {
			if (list[dotIdx].tag==info.tag) {
				list.splice(dotIdx, 1);
				list[dotIdx].removeFromParents();
			}
		}
	},	
	execAllCombos: function(listFunc, dot) {
		if (dot instanceof Array) {
			var dots = dot;
			var info = {spcName: dots[0].spcName, tag: dots[0].tag};
		} else {
			var info = dot;
		}
		var lists = this.getRelevantLists(info);
		if (dots) {
			for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
				this.execFuncOnLists(listFunc, lists, dots[dotIdx]);
			}
		} else {
			this.execFuncOnLists(listFunc, lists, dot);
		}
	},
	execFuncOnLists: function(func, lists, dot) {
		for (var listIdx=0; listIdx<lists.length; listIdx++) {
			func(lists[listIdx], dot);
		}
	},
	getRelevantLists: function(info) {
		var lists = [];
		lists.push(this.lists.ALLDOTS);
		if (info.spcName && info.tag) {
			lists.push(this.getByNameAndTag(info));
		}
		if (info.spcName) {
			lists.push(this.getByName(info.spcName));
		}
		if (info.tag) {
			lists.push(this.getByTag(info.tag));
		}
		return lists;
	},

	getByNameAndTag: function(info) {
		if (this.lists[info.spcName + '-' + info.tag]) {
			return this.lists[info.spcName + '-' + info.tag];
		} else {
			this.lists[info.spcName + '-' + info.tag] = [];
			return this.lists[info.spcName + '-' + info.tag];
		}
	},
	getByName: function(spcName) {
		if (this.lists[spcName]) {
			return this.lists[spcName];
		} else {
			this.lists[spcName] = [];
			return this.lists[spcName];
		}
	},
	getByTag: function(tag) {
		if (this.lists[tag]){
			return this.lists[tag];
		} else {
			this.lists[tag] = [];
			return this.lists[tag];
		}
	},

}