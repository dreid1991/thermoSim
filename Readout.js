function Readout(handle, leftBound, rightBound, y, font, fontCol, obj, align){
	this.handle = handle;
	this.align = 'left';
	if(align){
		this.align = align;
	}
	this.drawCanvas = c;
	this.font = font;
	this.fontCol = fontCol;
	this.leftBound = leftBound;
	this.width = rightBound - leftBound;
	this.y = y;
	this.entries = [];
	if(obj){
		addListener(obj, 'init', 'Readout', this.init, this);
	}
}
Readout.prototype = {
	init: function(){
		addListener(curLevel, 'reset', 'resetReadout', this.resetAll, this);
	},
	draw: function(){
		this.drawCanvas.save();
		this.drawCanvas.translate(this.leftBound, this.y);
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var pos = entry.pos;
			var decPlaces = entry.decPlaces
			var text = entry.text+' '+round(entry.val,decPlaces)+' '+entry.units;
			draw.text(text, pos, this.font, this.fontCol, this.align, 0, this.drawCanvas);
		}
		this.drawCanvas.restore();
	},
	hardUpdate: function(setPt, name){
		var entry = byAttr(this.entries, name, 'name');
		var decPlaces = entry.decPlaces;
		entry.val = round(setPt, decPlaces);
	},
	tick: function(setPt, name){
		var entry = byAttr(this.entries, name, 'name');
		if(isNaN(entry.val)){
			entry.val = setPt;
		}
		var init = entry.val
		var step = (setPt - init)/10;
		removeListener(curLevel, 'update', this.handle + entry.name +'tick');
		if(step!=0){
			var tickFunc = this.makeTickFunc(entry, step, setPt);
			addListener(curLevel, 'update', this.handle + entry.name +'tick', tickFunc, this);
			
		}
	},
	makeTickFunc: function(entry, step, setPt){
		return function(){
			entry.val = boundedStep(entry.val, setPt, step);
			var decPlaces = entry.decPlaces
			if(round(entry.val,decPlaces+1)==round(setPt,decPlaces+1)){
				removeListener(curLevel, 'update', this.handle + entry.name + 'tick');
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
	removeEntry: function(toRemove){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			if(this.entries[entryIdx].name==toRemove){
				this.entries.splice(entryIdx,1);
				this.positionEntries();
				return this;
			}
		}
		console.log('Tried to remove entry that does not exist: ' + toRemove);
	},
	entryExists: function(entryName){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			if(this.entries[entryIdx].name==entryName){
				return true;
			}
		}
		return false;		
	},
	removeAllEntries: function(){
		this.entries = [];
	},
	positionEntries: function(){
		var numEntries = this.entries.length;
		var spacing;
		if(numEntries>1){
			spacing = Math.floor(this.width/(numEntries-1));
		} else{
			spacing=this.width;
		}

		if(this.align=='center'){
			spacing = this.width/(numEntries+1);
			var center = this.leftBound + this.width/2;
			var spaceNum = numEntries-1;
			var sideSpace = spacing*spaceNum/2
			for (var entryIdx=0; entryIdx<numEntries; entryIdx++){
				var entry = this.entries[entryIdx];
				var x = spacing*(entryIdx+1);
				var y = 0;
				entry.pos = P(x,y);
			}
		}else if(this.align=='left'){
			for (var entryIdx=0; entryIdx<numEntries; entryIdx++){
				var entry = this.entries[entryIdx];
				var x = spacing*entryIdx
				var y = 0;
				entry.pos = P(x, y);
			}
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
		
	},
	position: function(p){
		if(p.x!==undefined){
			this.leftBound = p.x
		}
		if(p.y!==undefined){
			this.y = p.y
		}
	},
	show: function(){
		addListener(curLevel, 'update', 'drawReadout'+this.handle, this.draw, this);
	},
	hide: function(){
		removeListener(curLevel, 'update', 'drawReadout'+this.handle);
	}

}