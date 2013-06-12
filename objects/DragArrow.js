/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function DragArrow(pos, rotation, cols, dims, handle, canvasHandle, canvasElement, listeners, bounds){
	this.type = 'DragArrow';
	this.pos = pos;
	this.rotation = rotation;
	this.posInit = this.pos.copy();
	this.cols = cols;
	this.dims = dims
	this.handle = handle;
	this.listeners = listeners;
	this.canvasHandle = canvasHandle || 'main';
	this.canvasElement = canvasElement;
	this.bounds = bounds;
	if(this.bounds.x){
		if(!this.bounds.x.max){this.bounds.x.max = canvasElement.width - dims.dx;}
		if(!this.bounds.x.min){this.bounds.x.min = 0;}
	} else{
		this.bounds.x = {min:0, max:canvasElement.width - dims.dx};
	}
	if(this.bounds.y){
		if(!this.bounds.y.max){this.bounds.y.max = canvasElement.height - dims.dy;}
		if(!this.bounds.y.min){this.bounds.y.min = 0;}
	} else{
		this.bounds.y = {min:0, max:canvasElement.height - dims.dy};
	}
	this.pts = {};
	this.pts.outer = [];
	this.pts.inner = [];
	var width = this.dims.dx;
	var height = this.dims.dy;
	this.pts.outer.push(P(0,0));
	this.pts.outer.push(P(.9*width, -height/2));
	this.pts.outer.push(P(width, 0));
	this.pts.outer.push(P(.9*width, height/2));
	this.pts.outer.push(P(0,0));
	this.dirUV = V(Math.cos(this.rotation+Math.PI/2), Math.sin(this.rotation+Math.PI/2));
	this.draw = this.makeDrawFunc();
	this.clickListeners = this.makeListenerFuncs();
}
DragArrow.prototype = {

	makeDrawFunc: function(){
		var listeners;
		
		var self = this;
		var init = function(ctx){
			ctx.save();
			ctx.translate(self.pos.x, self.pos.y);
			ctx.rotate(self.rotation);
		}
		listeners = [init];
		
		if (this.cols.stroke) {
			listeners.push(function(ctx){draw.fillPtsStroke(self.pts.outer, self.cols.outer, self.cols.stroke, ctx)});
		} else {
			listeners.push(function(ctx){draw.fillPts(self.pts.outer, self.cols.outer, ctx)});
		}
		if (this.cols.inner || this.cols.onClick) {
			for (var ptIdx=0; ptIdx<this.pts.outer.length; ptIdx++) {
				var newPt = this.pts.outer[ptIdx].copy().movePt({dx:-this.dims.dx/2}).scale(P(0,0),.6).movePt({dx:this.dims.dx/2});
				this.pts.inner.push(newPt)
			}
			if (this.cols.inner) {
				this.cols.curInner = this.cols.inner;
			} else {
				this.cols.curInner = this.cols.outer;
			}
			
			listeners.push(function(ctx){draw.fillPts(self.pts.inner, self.cols.curInner, ctx)});
		}
		var restore = function(ctx){ctx.restore()};
		listeners.push(restore);
		return function(ctx){
			for (var i=0; i<listeners.length; i++) {
				listeners[i](ctx);
			}
		};
	},
	makeListenerFuncs: function(){
		var listeners = this.listeners;
		var self = this;
		self.amSelected = new Boolean();
		if(listeners.onDown||listeners.onMove||listeners.onUp){
			var onClick = function(){}
			var onDown = function() {
				self.amSelected = self.checkSelected();
				if(self.amSelected){
					self.posInit = self.pos.copy();
					self.mouseInit = mouseOffset(self.canvasElement);
					onClick();
				}
			}
			if (self.cols.onClick) {
				var changeInnerCol = function(){
					self.cols.curInner = self.cols.onClick
				}
				onClick = extend(onClick, changeInnerCol);
			}
			
			onClick = extend(onClick, function(){listeners.onDown.apply(self)});
			var onMove = this.makeMoveListenerFunc(self);
			onClick = extend(onClick, onMove)

			if (listeners.onUp) {
				var onUp = this.makeUpListenerFunc(self);
				onClick = extend(onClick, onUp)
			}
			return onDown;
		}

	},
	makeMoveListenerFunc: function(self){
		var listeners = self.listeners;
		var moveFunc = function(){
			var mousePos = mouseOffset(self.canvasElement);
			var dMouseX = mousePos.x - self.mouseInit.x;
			var dMouseY = mousePos.y - self.mouseInit.y;
			var mouseDist = V(dMouseX, dMouseY);
			var arrowDist = mouseDist.dotProd(self.dirUV);
			var unBoundedX = self.posInit.x + (arrowDist*Math.cos(self.rotation+Math.PI/2));
			var unBoundedY = self.posInit.y + (arrowDist*Math.sin(self.rotation+Math.PI/2));
			self.pos.x = Math.max(self.bounds.x.min, Math.min(unBoundedX, self.bounds.x.max));
			self.pos.y = Math.max(self.bounds.y.min, Math.min(unBoundedY, self.bounds.y.max));
		}
		if(listeners.onMove){
			moveFunc = extend(moveFunc, function(){listeners.onMove.apply(self)});
		}
		var addMoveListeners = function(){addListener(curLevel, 'mousemove', 'dragArrow'+self.handle, moveFunc, '')};
		
		var removeMoveListeners = function(){
			addListener(curLevel, 'mouseup', 'dragArrow'+self.handle+'RemoveMove',
				function(){
					removeListener(curLevel, 'mousemove', 'dragArrow'+self.handle);
					removeListener(curLevel, 'mouseup', 'dragArrow'+self.handle+'RemoveMove');
				},
			'');
		}

		var toReturn = function(){
			addMoveListeners();
			
			removeMoveListeners();
		}
		
		return toReturn;
	},
	makeUpListenerFunc: function(self){
		var upFunc = function(){
			addListener(curLevel, 'mouseup', 'mouseup'+self.handle, function(){self.listeners.onUp.apply(self)}, '');
			addListener(curLevel, 'mouseup', 'mouseup'+self.handle+'remove', 
				function(){
					removeListener(curLevel, 'mouseup', 'mouseup'+self.handle);
					removeListener(curLevel, 'mouseup', 'mouseup'+self.handle+'remove');
				},
			'');
		}

		if(self.cols.onClick){
			var revertCols = function(){};
			if(self.cols.inner){
				revertCols = extend(revertCols, function(){self.cols.curInner = self.cols.inner;});
			}else{
				revertCols = extend(revertCols, function(){self.cols.curInner = self.cols.outer;});
			}
			var revertColsListener = function(){
				addListener(curLevel, 'mouseup', 'revertCols'+self.handle,
					function(){
						revertCols();
						removeListener(curLevel, 'mouseup', 'revertCols'+self.handle);
					},
				'');
			}
			upFunc = extend(upFunc, revertColsListener)
		}
	
		
		return upFunc;
	},
	setPos: function(pos) {
		if (typeof pos.x == 'number') this.pos.x = pos.x;
		if (typeof pos.y == 'number') this.pos.y = pos.y;
	},
	show: function(){
		addListener(curLevel, 'mousedown', 'dragArrow'+this.handle, this.clickListeners, '');
		canvasManager.addListener(this.canvasHandle, 'drawDragArrow'+this.handle, this.draw, this, 2);
		return this;
	},
	hide: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.handle);
		canvasManager.removeListener(this.canvasHandle, 'drawDragArrow'+this.handle);
		return this;
	},
	reset: function(){
		this.pos = this.posInit.copy();
		removeListener(curLevel, 'update', 'moveWall');
		return this;
	},
	remove: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.handle);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.handle);
	},
	checkSelected: function(){
		var mousePos = mouseOffset(this.canvasElement);
		var unRotated = mousePos.rotate(this.pos, -this.rotation);
		var ULCorner = this.pos.copy().movePt({dy:-this.dims.dy/2});
		return ptInRect(ULCorner, this.dims, unRotated);
	},
}