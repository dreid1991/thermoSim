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


function Tracer(attrs) {
	this.handle = attrs.handle;
	this.type = 'Tracer';
	this.info = attrs.info;
	this.col = defaultTo(Col(175, 175, 175), attrs.col);
	this.lifespan = Math.round(1000/updateInterval * defaultTo(5, attrs.lifespan));
	this.listenerHandle = this.type + this.handle + 'Draw';
	this.listenerHandleSearch = this.type + this.handle + 'Search';
	this.setupStd();
	this.drawCanvas = c;
	this.drawingTools = draw;
	this.init();
	
}

_.extend(Tracer.prototype, objectFuncs, {
	init: function() {
		this.dot = this.getDot();
		this.pts = [];
		if (this.dot) {
			removeListener(curLevel, 'update', this.listenerHandleSearch);
			addListener(curLevel, 'update', this.listenerHandle, this.draw, this);
		} else {
			addListener(curLevel, 'update', this.listenerHandleSearch, this.init, this);
		}
	},
	getDot: function() {
		var potentials = dotManager.get(this.info);
		if (potentials.length > 0) {
			if (this.info.idx && this.info.idx < potentials.length) {
				return potentials[this.info.idx];
			} else {
				return potentials[Math.floor(Math.random() * potentials.length)];
			}
		}
	},
	draw: function() {
		if (this.dot.active) {
			this.pts.push(P(this.dot.x, this.dot.y));
			if (this.pts.length > this.lifespan) this.pts.splice(0, 1);
			this.drawingTools.path(this.pts, this.col, this.drawCanvas);
		} else {
			this.init();
		}
	},
	remove: function() {
		removeListener(curLevel, 'update', this.listenerHandleSearch);
		removeListener(curLevel, 'update', this.listenerHandle);
	},
})