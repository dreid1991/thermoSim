function Readout(x, y, width, textCol, frameCol, bgCol){
	this.x = x;
	this.y = y;
	this.width = width;
	this.textCol = textCol;
	this.frameCol = frameCol;
	this.bgCol = bgCol;
	this.entryHeight = 20;
	this.frame = null;
	this.colLine = null;
	this.rowLines = [];
	this.entries = [];
	this.showing = new Boolean();
	this.showing = false;
	return this;
}
function ReadoutEntry(name, address){
	this.name = name;
	this.address = address;
	this.nameText = null;
	this.valText = null;
}
Readout.prototype = {
	addEntry: function(name, address){
		this.entries.push(new ReadoutEntry(name, address));
		this.height = this.entries.length*this.entryHeight;
		if(this.showing){
			this.bgRect.attr({height:this.height});
			this.drawColLine();
			this.drawRowLines();
			this.drawEntryText(this.entries.length-1);
		}
		return this;
	},
	update: function(){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			var foo = String(this.getVal(entry))
			entry.valText.attr({text:foo});
		}
	},
	getVal: function(entry){
		var address = entry.address;
		var curObj = curLevel;
		for (var addIdx=0; addIdx<address.length; addIdx++){
			var next = address[addIdx];
			curObj = curObj[next];
		}
		if(parseFloat(curObj)===curObj){
			return round(curObj,1);
		}else{
			try{
				return round(curObj[curObj.length-1],1);
			}catch(e){
				console.log(curObj + " isn't a value or list.  WHAT'S GOING ON?");
				console.log(e.message);
			}
		}
	},
	drawColLine: function(){
		try{
			this.colLine.remove();
		}catch(e){}
		var colX = this.x+this.width*2/3;
		this.colLine = dash.path(makePath([P(colX, this.bgRect.attrs.y), P(colX, this.bgRect.attrs.y + this.bgRect.attrs.height)]));
		this.colLine.attr({stroke:this.frameCol});	
	},
	drawRowLines: function(){
		this.removeRowLines();

		var rowX1 = this.x;
		var rowX2 = this.x+this.width;
		for (var entryIdx=1; entryIdx<this.entries.length; entryIdx++){
			var rowY = this.y + this.entryHeight*entryIdx;
			this.rowLines.push(dash.path(makePath([P(rowX1, rowY), P(rowX2, rowY)])));
			this.rowLines[this.rowLines.length-1].attr({stroke:this.frameCol});
		}
	},
	drawText: function(){
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			this.drawEntryText(entryIdx);
		}
	},
	drawEntryText: function(entryIdx){
		var entry = this.entries[entryIdx];
		entry.nameText = dash.text(this.x+10, this.y + (entryIdx+.5)*this.entryHeight, entry.name);
		entry.nameText.attr({fill:this.textCol,'font-size':17, 'text-anchor':'start'});
		entry.valText = dash.text(this.colLine.attrs.path[0][1]+5, this.y + (entryIdx+.5)*this.entryHeight, "");
		entry.valText.attr({fill:this.textCol,'font-size':17, 'text-anchor':'start'});				
	},
	removeRowLines: function(){
		for (var lineIdx=0; lineIdx<this.rowLines.length; lineIdx++){
			this.rowLines[lineIdx].remove();
		}
		this.rowLines=[];		
	},
	show: function(){
		this.bgRect = dash.rect(this.x, this.y, this.width, this.height, 8);
		this.bgRect.attr({fill:this.bgCol, stroke:this.frameCol});
		this.drawColLine();
		this.drawRowLines();
		this.drawText();
		this.showing = true;
	},
	hide: function(){
		this.bgRect.remove();
		this.colLine.remove();
		this.removeRowLines();
		for (var entryIdx=0; entryIdx<this.entries.length; entryIdx++){
			var entry = this.entries[entryIdx];
			entry.nameText.remove();
			entry.valText.remove();
		}
		this.showing = false;
	}

}