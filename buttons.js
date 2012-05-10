function Button(x, y, width, height, label, color, altColor){
	var self = this;
	this.color = color;
	this.altColor = altColor;
	this.rect = dash.rect(x, y, width, height, 8);
	this.rect.attr("fill",color);
	this.text = dash.text(x+width/2, y+height/2, label);
	this.text.attr("fill","#000");
	this.text.attr({'font-size':17});
	this.clickListeners = [];
	this.releaseListeners = [];

	this.rect.mousedown(function(){self.onClick()});
	this.text.mousedown(function(){self.onClick()});
	
	this.rect.mouseup(function(){self.onRelease()});
	this.text.mouseup(function(){self.onRelease()});
	
	this.rect.mouseover(function(){self.mouseOver()});
	this.text.mouseover(function(){self.mouseOver()});
	this.rect.mouseout(function(){self.mouseOut()});
	this.text.mouseout(function(){self.mouseOut()});
	return this;
}
Button.prototype = {
	onClick: function(){
		for (var listenerIdx=0; listenerIdx<this.clickListeners.length; listenerIdx++){
			var func = this.clickListeners[listenerIdx][0];
			var object = this.clickListeners[listenerIdx][1];
			func.apply(object);
		}
	},
	onRelease: function(){
		for (var listenerIdx=0; listenerIdx<this.releaseListeners.length; listenerIdx++){
			var func = this.releaseListeners[listenerIdx][0];
			var object = this.releaseListeners[listenerIdx][1];
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
	removeClickListener: function(toRemove, object){
		for (var listenerIdx=0; listenerIdx<this.clickListeners.length; listenerIdx++){
			var listener = this.clickListeners[listenerIdx];
			if(toRemove==listener){
				this.clickListeners.splice(listenerIdx,1);
			}
		}
	},
	removeReleaseListener: function(toRemove, object){
		for (var listenerIdx=0; listenerIdx<this.releaseListeners.length; listenerIdx++){
			var listener = this.releaseListeners[listenerIdx];
			if(toRemove==listener){
				this.releaseListeners.splice(listenerIdx,1);
			}
		}
	},
	mouseOver: function(){
		this.rect.attr("fill",this.altColor);
	},
	mouseOut: function(){
		this.rect.attr("fill",this.color);
	},
	remove: function(){
		this.rect.unmouseover(function(){self.mouseOver()}); //hey - this doesn't seem to be removing the handler like it should
		this.text.unmouseover(function(){self.mouseOver()});
		this.rect.unmouseout(function(){self.mouseOut()});
		this.text.unmouseout(function(){self.mouseOut()});
		this.text.remove();
		this.rect.remove();

	},
}

