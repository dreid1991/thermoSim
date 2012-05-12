function Slider(level, name, x, y, title, onDrag){
	var self = this;
	this.rectCol = "#bdbdbd"
	this.frameCol = "#787878"
	this.onDrag = onDrag;
	this.title=title;
	this.x = x;
	this.y = y;
	this.sliderLines = [];
	this.capHeight = 12;
	this.title = title;
	if(level.savedVals[name]===undefined){
		this.val = .5	
	}else{
		this.val = level.savedVals[name];
	}

	this.height = 100;
	this.width = 30;
	this.rectWidth=this.width-5;
	this.rectHeight=10;
	this.fontSize = 13;
	this.sliderMax = this.y+this.height-this.capHeight-this.rectHeight;
	this.sliderMin = this.y+this.fontSize+this.capHeight
	this.draw();
	this.onDrag = onDrag;
	this.clickListeners = [];
	this.dragListeners = [];
	this.releaseListeners = [];
	this.rect.mousedown(function(){self.onClick()})
	this.rect.drag(function(dx, dy){self.onMove(dx, dy)})
	this.rect.mouseup(function(){self.onRelease()})

}
Slider.prototype = {
	draw: function(){
		var capTop = "M"+String(this.x)+","+String(this.y+this.fontSize+this.capHeight)+"S"+String(this.x+this.width/2)+","+String(this.y+this.fontSize)+","+String(this.x+this.width)+","+String(this.y+this.fontSize+this.capHeight)+"Z"
		this.capTop = dash.path(capTop).attr("fill",this.frameCol);
		var capBot = "M"+String(this.x)+","+String(this.y+this.height-this.capHeight)+"S"+String(this.x+this.width/2)+","+String(this.y+this.height)+","+String(this.x+this.width)+","+String(this.y+this.height-this.capHeight)+"Z"
		this.capBot = dash.path(capBot).attr("fill",this.frameCol);
		var line = "M"+String(this.x+this.width/2)+","+String(this.y+this.fontSize+this.capHeight)+"L"+String(this.x+this.width/2)+","+String(this.y+this.height-this.capHeight);
		this.line = dash.path(line).attr("fill",this.frameCol).attr("stroke",this.frameCol);
		this.rect = dash.rect(this.x+(this.width-this.rectWidth)/2,(1-this.val)*(this.sliderMax-this.sliderMin)+this.sliderMin,this.rectWidth,this.rectHeight);
		this.rect.attr("fill",this.rectCol);	
		this.text = dash.text(this.x+this.width/2, this.y, this.title);
		this.text.attr("font-size",13).attr("fill", this.rectCol);
		
	},
	onMove: function(dx, dy){
		var newY = this.oY + dy
		var newY = Math.max(this.sliderMin, Math.min(newY, this.sliderMax));
		this.val=1-(newY-this.sliderMin)/(this.sliderMax-this.sliderMin);
		this.rect.attr({y:newY});
		for (var listenerIdx=0; listenerIdx<this.dragListeners.length; listenerIdx++){
			var func = this.dragListeners[listenerIdx][0];
			var object = this.dragListeners[listenerIdx][1];
			func.apply(object, [this.val]);
		}
	},
	onClick: function(){
		for (var listenerIdx=0; listenerIdx<this.clickListeners.length; listenerIdx++){
			var func = this.clickListeners[listenerIdx][0];
			var object = this.clickListeners[listenerIdx][1];
			func.apply(object);
		}
		this.oY = this.rect.attr("y");
	},
	onRelease: function(){
		for (var listenerIdx=0; listenerIdx<this.releaseListeners.length; listenerIdx++){
			var func = this.releaseListeners[listenerIdx][0];
			var object = this.releaseListerners[listenerIdx][1];
			func.apply(object);
		}
	},
	addClickListener: function(listener, object){
		this.clickListeners.push([listener, object]);
		return this;	
	},
	addReleaseListener: function(listener, object){
		this.releaseListeners.push([listener, object]);
		return this;
	},
	addDragListener: function(listener, object){
		this.dragListeners.push([listener, object]);
		return this;
	},
	removeClickListener: function(toRemove){
		for (var listenerIdx=0; listenerIdx<this.clickListeners.length; listenerIdx++){
			var listener = this.clickListeners[listenerIdx];
			if(toRemove==listener){
				this.clickListeners.splice(listenerIdx,1);
			}
		}
	},
	removeReleaseListener: function(toRemove){
		for (var listenerIdx=0; listenerIdx<this.releaseListeners.length; listenerIdx++){
			var listener = this.releaseListeners[listenerIdx];
			if(toRemove==listener){
				this.releaseListeners.splice(listenerIdx,1);
			}
		}
	},
	removeDragListener: function(toRemove){
		for (var listenerIdx=0; listenerIdx<this.dragListeners.length; listenerIdx++){
			var listener = this.dragListeners[listenerIdx];
			if(toRemove==listener){
				this.dragListeners.splice(listenerIdx,1);
			}
		}
	},
	remove: function(){
		console.log("here");
		this.rect.remove();
		this.capTop.remove();
		this.capBot.remove();
		this.text.remove();
		this.line.remove();
	},
}


