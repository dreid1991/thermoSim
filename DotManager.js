function DotManager() {
	this.lists = {ALLDOTS:[]};
	this.spcLists = {};
	this.count = 0;
}

DotManager.prototype = {
//start public funcs
	add: function(dot) {//can send as list or single dot
		if (dot instanceof Array) {
			this.count += dot.length;
		} else {
			this.count ++;
		}
		this.execAllCombos(this.addFunc, dot);
	},
	remove: function(dot) {//can send as list or single dot
		if (dot instanceof Array) {
			this.count -= dot.length;
			for (var dotIdx=0; dotIdx<dot.length;dotIdx++) {
				dot[dotIdx].kill();
			}
		} else {
			this.count --;
			dot.kill();
		}
	},
	removeByAttr: function(attr, val) {
		var dots = this.lists.ALLDOTS;
		for (var i=dots.length; i>=0; i--) {
			if (dots[i][attr] == val) dots[i].kill();
		}
	},
	changeDotSpc: function(dots, newSpcName) {//can send as list or single dot
		if (!(dots instanceof Array)) dots = [dots];
		var def = spcs[newSpcName];
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			var dot = dots[dotIdx];
			var tempF = (dot.hF298 - (def.hF298 * 1000 / N) + dot.cv * (dot.temp() - 298.15)) / (def.cv / N) + 298.15;
			if (tempF > 0) {
				for (var parentListIdx=0; parentListIdx<dot.parentLists.length; parentListIdx++) {
					dot.parentLists[parentListIdx].splice(dot.parentLists[parentListIdx].indexOf(dot), 1);
				}
				dot.parentLists = [];
				dot.m = def.m;
				dot.r = def.r;
				dot.col = def.col;
				dot.spcName = def.spcName;
				dot.hF298 = def.hF298 * 1000 / N;
				dot.hVap298 = def.hVap298 * 1000 / N;
				dot.idNum = def.idNum;
				dot.cvKinetic = 1.5 * R / N;
				dot.cv = def.cv / N;
				dot.cp = dot.cv + R;
				dot.cpLiq = def.cpLiq / N;
				dot.spcVolLiq = def.spcVolLiq / N;
				dot.setTempNoReference(tempF);
				
				var newLists = this.getRelevantLists(dot);
				for (var newListIdx=0; newListIdx<newLists.length; newListIdx++) {
					dot.parentLists.push(newLists[newListIdx]);
					dot.parentLists[dot.parentLists.length - 1].push(dot);
				}
			}
		}
		
		
	},
	addSpcs: function(name) {
		if (!this.lists[name]) {
			this.lists[name] = [];
			this.spcLists[name] = this.lists[name];
		}
		return this.lists[name];
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
	},
	createIfNotExists: function(info) {
		if (info.spcName && info.tag) {
			return this.getByNameAndTag(info);
		} else if (info.spcName) {
			return this.getByName(info.spcName);
		} else if (info.tag) {
			return this.getByTag(info.tag);
		} else {
			return this.lists.ALLDOTS;
		}
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
				list[dotIdx].kill();
			}
		}
	},	
	removeByNameFunc: function(list, info) {
		for (var dotIdx=list.length-1; dotIdx>-1; dotIdx--) {
			if (list[dotIdx].spcName==info.spcName) {
				list.splice(dotIdx, 1);
				list[dotIdx].kill();	
			}
		}
	},	
	removeByNameAndTagFunc: function(list, info) {
		for (var dotIdx=list.length-1; dotIdx>-1; dotIdx--) {
			if (list[dotIdx].tag==info.tag) {
				list.splice(dotIdx, 1);
				list[dotIdx].kill();
			}
		}
	},	
	execAllCombos: function(listFunc, dot) {
		if (dot instanceof Array && dot.length) {
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
		} else if (dot instanceof Dot) {
			this.execFuncOnLists(listFunc, lists, dot);
		}
	},
	execFuncOnLists: function(func, lists, dot) {
		dot.active = true;
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
			console.log('Tried to get bad spcName ' + spcName);
			console.trace();
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