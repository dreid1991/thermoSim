function DataManager() {
	this.curIdx = 0;
	this.sectionNum = 0;
	this.promptNum = 0;
	this.objNum = 0;
	this.wallNum = 0;
	this.listenerNum = 0;
	this.dotsNum = 0;
	this.readoutEntryNum = 0;
	this.commandNum = 0;
	this.hist = [new SearchTree()];
}

DataManager.prototype = {
	add: function(key, value) {
		this.hist[this.curIdx].add(key, value);
	},
	change: function(key, value) {
		if (this.curIdx != this.hist.length-1) {
			this.hist = this.hist.slice(0, this.curIdx+1);
		}
		this.hist.push(this.hist[this.hist.length-1].withChange(key, value));
		this.curIdx++;
		
	},
	redo: function() {
		var newIdx = Math.min(this.hist.length-1, this.curIdx+1);
		if (newIdx != this.curIdx) {
			tree.load(this.hist[newIdx]);
			this.curIdx = newIdx;
		}
	},
	undo: function() {
		var newIdx = Math.max(0, this.curIdx-1);
		if (newIdx != this.curIdx) {
			tree.load(this.hist[newIdx]);
			this.curIdx = newIdx;
		}
	},
	getSectionId: function() {
		var id = 's' + this.sectionNum;
		this.sectionNum++;
		return id;
	},
	getPromptId: function() {
		var id = 'p' + this.promptNum;
		this.promptNum++;
		return id;
	},
	getObjId: function() {
		var id = 'o' + this.objNum;
		this.objNum++;
		return id;
	},
	getWallId: function() {
		var id = 'w' + this.wallNum;
		this.wallNum++;
		return id;
	},
	getListenerId: function() {
		var id = 'l' + this.listenerNum;
		this.listenerNum++;
		return id;
	},
	getDotsId: function() {
		var id = 'd' + this.dotsNum;
		this.dotsNum++;
		return id;
	},
	getReadoutEntryId: function() {
		var id = 'rE' + this.readoutEntryNum;
		this.readoutEntryNum++;
		return id;
	},
	getCommandId: function() {
		var id = 'c' + this.commandNum;
		this.commandNum++;
		return id;
	}

}