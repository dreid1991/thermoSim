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

function DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds){
	this.type = 'DragArrow';
	this.pos = pos;
	this.rotation = rotation;
	this.posInit = this.pos.copy()
	this.cols = cols;
	this.dims = dims
	this.name = name;
	this.listeners = listeners;
	this.drawCanvas = drawCanvas;
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
	this.makeDrawFunc();
	this.clickListeners = this.makeListenerFuncs();
	return this;
}
DragArrow.prototype = {

	makeDrawFunc: function(){
		this.dirUV = V(Math.cos(this.rotation+Math.PI/2), Math.sin(this.rotation+Math.PI/2));
		this.draw = function(){};
		var self = this;
		var init = function(){
			self.drawCanvas.save();
			self.drawCanvas.translate(self.pos.x, self.pos.y);
			self.drawCanvas.rotate(self.rotation);
		}
		this.draw = extend(this.draw, init);
		if (this.cols.stroke) {
			var strokeFill = function(){draw.fillPtsStroke(self.pts.outer, self.cols.outer, self.cols.stroke, self.drawCanvas)};
			this.draw = extend(this.draw, strokeFill);
		} else {
			var fill = function(){draw.fillPts(self.pts.outer, self.cols.outer, self.drawCanvas)};
			this.draw = extend(this.draw, fill);
		}
		if (this.cols.inner || this.cols.onClick) {
			for (var ptIdx=0; ptIdx<this.pts.outer.length; ptIdx++) {
				var newPt = this.pts.outer[ptIdx].copy().movePt({dx:-this.dims.dx/2}).scale(P(0,0),.6).movePt({dx:this.dims.dx/2});
				this.pts.inner.push(newPt)
			}
			if( this.cols.inner) {
				this.cols.curInner = this.cols.inner;
			} else {
				this.cols.curInner = this.cols.outer;
			}
			
			var fill = function(){draw.fillPts(self.pts.inner, self.cols.curInner, self.drawCanvas)};
			this.draw = extend(this.draw, fill);
		}
		var restore = function(){self.drawCanvas.restore()};
		this.draw = extend(this.draw, restore);
	},
	
	makeListenerFuncs: function(){
		var listeners = this.listeners;
		var self = this;
		self.amSelected = new Boolean();
		if(listeners.onDown||listeners.onMove||listeners.onUp){
			var onClick = function(){}
			var onDown = function(){
				self.amSelected = self.checkSelected();
				if(self.amSelected){
					self.posInit = self.pos.copy();
					self.mouseInit = mouseOffset(self.canvasElement);
					onClick();
				}
			}
			if(self.cols.onClick){
				var changeInnerCol = function(){
					self.cols.curInner = self.cols.onClick
				}
				onClick = extend(onClick, changeInnerCol);
			}
			
			onClick = extend(onClick, function(){listeners.onDown.apply(self)});
			var onMove = this.makeMoveListenerFunc(self);
			onClick = extend(onClick, onMove)

			if(listeners.onUp){
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
		var addMoveListeners = function(){addListener(curLevel, 'mousemove', 'dragArrow'+self.name, moveFunc, '')};
		
		var removeMoveListeners = function(){
			addListener(curLevel, 'mouseup', 'dragArrow'+self.name+'RemoveMove',
				function(){
					removeListener(curLevel, 'mousemove', 'dragArrow'+self.name);
					removeListener(curLevel, 'mouseup', 'dragArrow'+self.name+'RemoveMove');
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
			addListener(curLevel, 'mouseup', 'mouseup'+self.name, function(){self.listeners.onUp.apply(self)}, '');
			addListener(curLevel, 'mouseup', 'mouseup'+self.name+'remove', 
				function(){
					removeListener(curLevel, 'mouseup', 'mouseup'+self.name);
					removeListener(curLevel, 'mouseup', 'mouseup'+self.name+'remove');
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
				addListener(curLevel, 'mouseup', 'revertCols'+self.name,
					function(){
						revertCols();
						removeListener(curLevel, 'mouseup', 'revertCols'+self.name);
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
		addListener(curLevel, 'mousedown', 'dragArrow'+this.name, this.clickListeners, '');
		addListener(curLevel, 'update', 'drawDragArrow'+this.name, this.draw, '');
		return this;
	},
	hide: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.name);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.name);	
		return this;
	},
	reset: function(){
		this.pos = this.posInit.copy();
		removeListener(curLevel, 'update', 'moveWall');
		return this;
	},
	remove: function(){
		removeListener(curLevel, 'mousedown', 'dragArrow'+this.name);
		removeListener(curLevel, 'update', 'drawDragArrow'+this.name);
	},
	checkSelected: function(){
		var mousePos = mouseOffset(this.canvasElement);
		var unRotated = mousePos.rotate(this.pos, -this.rotation);
		var ULCorner = this.pos.copy().movePt({dy:-this.dims.dy/2});
		return ptInRect(ULCorner, this.dims, unRotated);
	},
}