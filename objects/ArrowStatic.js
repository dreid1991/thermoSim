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

function ArrowStatic(attrs) {
	this.type = 'ArrowStatic';
	this.pos = attrs.pos.copy();
	this.dims = attrs.dims.copy();
	this.handle = attrs.handle;
	this.pts = this.getPts();
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	if (attrs.label) {
			this.label = attrs.label;
		} else {
			this.label = false;
	}
	if (attrs.angle) {
		this.angle = attrs.angle;
	} else if (attrs.UV) {
		this.angle = UVToAngle(attrs.UV);
	}
	this.setTextOffset();
	this.fill = attrs.fill.copy();
	this.textCol = defaultTo(Col(255,255,255), attrs.textCol);
	this.stroke = defaultTo(attrs.stroke, Col(0,0,0));
	this.init();
}
_.extend(ArrowStatic.prototype, objectFuncs, toInherit.ArrowFuncs, {
	init: function() {
		this.updateListenerName = unique(this.type + defaultTo('', this.handle), curLevel.updateListeners);
		if (this.label) {
				addListener(curLevel, 'update', this.updateListenerName, this.runLabel, this);
			} else {
				addListener(curLevel, 'update', this.updateListenerName, this.runNoLabel, this);
		}
		this.setupStd();
	},
	runLabel: function() {
		this.drawCanvas.save();
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.angle);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas);
		this.drawCanvas.translate(this.textOffset.dx, this.textOffset.dy);
		this.drawCanvas.rotate(-this.angle);
		draw.text(this.label, P(0,0), '13pt calibri', this.textCol, 'center', 0, this.drawCanvas);
		this.drawCanvas.restore();
	},
	runNoLabel: function() {
		this.drawCanvas.save();
		this.drawCanvas.translate(this.pos.x, this.pos.y);
		this.drawCanvas.rotate(this.angle);
		draw.fillPtsStroke(this.pts, this.fill, this.stroke, this.drawCanvas);
		this.drawCanvas.restore();
	},
	setTextOffset: function() {
		this.textOffset = V(7 + 5*Math.sin(Math.abs(-this.angle)), Math.cos(this.angle)*5);
	},
	getDims: function() {
		return this.dims;
	},
	move: function(v) {
		this.pos.movePt(v);
		return this;
	},
	scale: function(v) {
		this.dims.multVec(v);
		this.pts = this.getPts();
		return this;
	},
	size: function(v) {
		this.dims = v.copy();
		this.pts = this.getPts();
		return this;
	},
	rotate: function(angle) {
		this.angle+=angle;
		this.setTextOffset();
		return this;
	},
	getAngle: function() {
		return this.angle;
	},
	setFill: function(fill) {
		this.fill = fill.copy();
	},
	setStroke: function(stroke) {
		this.stroke = stroke.copy();
	},
	remove: function() {
		removeListener(curLevel, 'update', this.updateListenerName);
		this.removeCleanUp();
	},
	

}
)