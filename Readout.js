function Readout(x, y, width, textCol, frameCol, bgCol){
	this.x = x;
	this.y = y;
	this.width = width;
	this.textCol = textCol;
	this.lineCol = frameCol;
	this.bgCol = bgCol;
	this.entryHeight = 14;
	this.bgRect = dash.rect(this.x, this.y, this.width, 40, 8);
	this.bgRect.attr({fill:bgCol, stroke:frameCol});
	var divX = String(this.x+this.width*2/3);
	this.divLine = dash.path(makePath([P(divX, this.bgRect.attrs.y), P(divX, this.bgRect.attrs.y + this.bgRect.attrs.height)]));
	this.divLine.attr({stroke:frameCol});
	this.frame = null;
	this.entries = [];
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
		var newHeight = this.bgRect.attrs.height+this.entryHeight;
		this.bgRect.attr({height:newHeight});
		var divLineX = this.divLine.attrs.path[0][1];
		this.divLine.attr({path:makePath([P(divLineX, this.bgRect.attrs.y), P(divLineX, this.bgRect.attrs.y + this.bgRect.attrs.height)])});
		return this;
	},

}