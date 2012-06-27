function Readout(leftBound, rightBound, y, font, fontCol){
	this.font = font;
	this.fontCol = fontCol;
	this.leftBound = leftBound;
	this.rightBound = rightBound;
	this.y = y;
	this.entries = [];
}
Readout.prototype = {
	init: function(){
		addListener(curLevel, 'update', 'drawReadout', this.draw, this);
	},
	draw: function(){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var pos = entry.pos;
			var text = entry.text+' '+entry.val+' '+entry.units;
			draw.text(text, pos, this.font, this.fontCol, 'left', 0, c);
		}		
	},
	hardUpdate: function(setPt, name){
		var entry = byAttr(this.entries, name, 'name');
		entry.val = round(setPt, 1);
	},
	tick: function(setPt, name){
		var entry = byAttr(this.entries, name, 'name');
		var init = entry.val
		var step = (setPt - init)/10;
		if(step!=0){
			var tickFunc = this.makeTickFunc(entry, step, setPt);
			removeListener(curLevel, 'update', entry.name);
			addListener(curLevel, 'update', entry.name, tickFunc, '');
			
		}
	},
	makeTickFunc: function(entry, step, setPt){
		return function(){
			entry.val = round(boundedStep(entry.val, setPt, step),1);
			if(entry.val==round(setPt,1)){
				removeListener(curLevel, 'update', entry.name);
			}
		}
	},
	addEntry: function(name, text, units, initVal, idx){
		var entry = {name:name, text:text, units:units, val: initVal, initVal:initVal};
		if(idx){
			this.entries.splice(idx, 0, entry);
		}else{
			this.entries.push(entry);
		}
		this.positionEntries();
		
	},
	positionEntries: function(){
		var width = this.rightBound - this.leftBound;
		var spacing = Math.floor(width/(this.getNumEntries()-1));
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var x = this.leftBound + spacing*entryIdx;
			var y = this.y;
			entry.pos = P(x, y);
		}
	},
	getNumEntries: function(){
		var count = 0;
		for(var entryName in this.entries){
			count++;
		}
		return count;
	},
	reset: function(name){
		var entry = byName(this.entries, name);
		var curVal = entry.curVal;
		var setPt = entry.setPt;
		this.tickReadout(curVal, setPt, name);
	},
	resetAll: function(){
		for(var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var name = entry.name;
			var curVal = entry.val;
			var setPt = entry.initVal;
			this.tick(setPt, name);
		}
	},

}