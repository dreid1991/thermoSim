function CanvasManager() {
	this.canvases = [];
	
}
//hey - I don't think I'm going to include the graph canvases in this.  They're pretty independant and flashing won't be a problem since their drawing already happens all at once
CanvasManager.prototype = {
	draw: function() {
		for (var i=0; i<this.canvases.length; i++) {
			this.canvases[i].clear();
			var listeners = this.canvases[i].listeners;
			for (var j=0; j<listeners.length; j++) {
				listeners[j].cb.apply(listeners[j].obj);
			}
		}
	},
	addCanvas: function(handle, htmlElem, ctx, bgCol) {
		var canvas = new CanvasManager.Canvas(handle, htmlElem, ctx, bgCol);
		this.canvases.push(canvas);
	},
	addListener: function(canvasHandle, listenerHandle, cb, obj, zIndex) {
		var canvas = this.getByHandle(this.canvases, canvasHandle);
		if (!canvas) console.log('Bad canvas handle ' + canvasHandle)
		else {
			var listener = new CanvasManager.Canvas.Listener(listenerHandle, zIndex, cb, obj);
			var alreadyPresent = this.getByHandle(canvas.listeners, listenerHandle);
			if (alreadyPresent) {
				canvas.listeners.splice(canvas.listeners.indexOf(alreadyPresent, 1));
				console.log('overwriting listener ' + alreadyPresent.handle);
			}
			this.spliceByZIndex(canvas.listeners, listener);
		}
			
		
	},
	removeCanvas: function(handle) {
		for (var i=0; i<this.canvases.length; i++) this.canvases[i].handle == handle && this.canvases.splice(i, 1);
	},
	removeListener: function(canvasHandle, listenerHandle) {
		var canvas = this.getByHandle(this.canvases, canvasHandle);
		if (canvas) {
			var listener = this.getByHandle(canvas.listeners, listenerHandle);
			listener && canvas.listeners.splice(canvas.listeners.indexOf(listener), 1);
		}
	},
	spliceByZIndex: function(list, toSplice) {
		var spliceIdx = list.length;
		for (var i=0; i<list.length; i++) {
			if (list[0].zIndex >= toSplice.zIndex) {
				spliceIdx = i;
				break;
			}
		}
		list.splice(spliceIdx, 0, toSplice);
	},
	getByHandle: function(list, handle) {
		for (var i=0; i<list.length; i++) if (list[i].handle == handle) return list[i];
		return undefined;
	},
}

CanvasManager.Canvas = function(handle, htmlElem, ctx, bgCol) {
	this.handle = handle;
	this.htmlElem = htmlElem;
	this.ctx = ctx;
	this.listeners = [];
	this.bgCol = bgCol;
	
}

CanvasManager.Canvas.prototype = {
	clear: function() {
		var width = this.htmlElem.width;
		var height = this.htmlElem.height;
		this.ctx.clearRect(0, 0, width, height);
		this.ctx.fillStyle = this.bgCol.hex;
		this.ctx.fillRect(0,0, width, height);			
	}
}

CanvasManager.Canvas.Listener = function(handle, zIndex, cb, obj) {
	this.handle = handle;
	this.zIndex = zIndex;
	this.cb = cb;
	this.obj = obj;
}