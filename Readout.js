function Readout(leftBound, rightBound, y, font, fontCol, obj){
	this.font = font;
	this.fontCol = fontCol;
	this.leftBound = leftBound;
	this.rightBound = rightBound;
	this.y = y;
	this.entries = [];
	addListener(obj, 'init', 'Readout', this.init, this);
}
Readout.prototype = {
	init: function(){
		addListener(curLevel, 'reset', 'resetReadout', this.resetAll, this);
	},
	draw: function(){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var pos = entry.pos;
			var decPlaces = entry.decPlaces
			var text = entry.text+' '+round(entry.val,decPlaces)+' '+entry.units;
			draw.text(text, pos, this.font, this.fontCol, 'left', 0, c);
		}		
	},
	hardUpdate: function(setPt, name){
		var entry = byAttr(this.entries, name, 'name');
		var decPlaces = entry.decPlaces;
		entry.val = round(setPt, decPlaces);
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
			entry.val = boundedStep(entry.val, setPt, step);
			var decPlaces = entry.decPlaces
			if(round(entry.val,decPlaces+1)==round(setPt,decPlaces+1)){
				removeListener(curLevel, 'update', entry.name);
			}
		}
	},
	addEntry: function(name, text, units, initVal, idx, decPlaces){
		var entry = {name:name, text:text, units:units, val: initVal, initVal:initVal, decPlaces:decPlaces};
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
			this.hardUpdate(setPt, name);
		}
		addListener(curLevel, 'update', 'drawReadout', this.draw, this);
	},

}