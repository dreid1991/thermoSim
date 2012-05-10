function MainTextBox(text){
	this.fontSize = 17;
	this.mainDisp = Raphael(8, header.height+8, myCanvas.width, myCanvas.height);
	var bgRect = this.mainDisp.rect(0,0,this.mainDisp.width, this.mainDisp.height);
	bgRect.attr("fill", "black");
	var text = this.wordWrap(text, myCanvas.width)
	var numLineBreaks = this.numLinesBreaks(text);
	var height = 1.3*this.fontSize*numLineBreaks/2 + this.fontSize/2+2;
	var textObj = this.mainDisp.text(10,height,text);
	textObj.attr({"text-anchor":"start"});
	textObj.attr("font-size",this.fontSize);
	//textObj.attr("stroke", "white");
	textObj.attr("fill", "white");
}
MainTextBox.prototype = {
	wordWrap: function(text, width){
		var maxLineLen = Math.floor(2.15*width/this.fontSize);
		var insIdx = []
		var lineLen = 0;
		for (var letterIdx=0; letterIdx<text.length-1; letterIdx++){
			if(text.slice(letterIdx, letterIdx+1)=="\n"){
				lineLen=0;
			}else if(lineLen<maxLineLen){
				lineLen++;
			}else{
				var spaceIdx = this.lastSpace(text, letterIdx, maxLineLen);
				insIdx.push(spaceIdx);
				letterIdx = spaceIdx;
				lineLen=0;
			}
		}
		for (var letterIdx=text.length-1; letterIdx>=0; letterIdx-=1){
			if(letterIdx==insIdx[insIdx.length-1]){
				text = text.slice(0,letterIdx)+"\n"+text.slice(letterIdx,text.length);
				insIdx.pop();
			}
		}
		return text;
	},
	remove: function(){
		this.mainDisp.remove();
	},
	lastSpace: function(text, start, max){
		for (var letterIdx = start; letterIdx>=Math.max(0,start-max); letterIdx-=1){
			if(text.charAt(letterIdx-1)==" "){
				return letterIdx;
			}
		}
		console.log("NO SPACES!");
		return start-max;
	},
	numLinesBreaks: function(text){
		var numBreaks=0;
		for (var letterIdx=0; letterIdx<text.length-1; letterIdx++){
			if(text.slice(letterIdx, letterIdx+1)=="\n"){
				numBreaks++;
			}
		}
		return numBreaks;
	},

}