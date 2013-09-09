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

function QArrowsAmmt(attrs) {
	this.type = 'QArrowsAmmt';
	this.rate = attrs.rate != undefined ? attrs.rate : false;
	this.wallHandle = attrs.wallInfo;
	this.wall = walls[this.wallHandle];
	this.handle = attrs.handle;
	var wall = this.wall;
	wall.recordQ();
	var qMax = (1 / attrs.scale) * 3;
	this.qArrowAmmtMax = isNaN(qMax) ? 3 : qMax;
	this.qArrowAmmtMax = defaultTo(3, (1 / attrs.scale) * 3);

	addListener(wall, 'cleanUp', 'qArrowsAmmt', function() {
		for (var arrowIdx=0; arrowIdx<this.qArrowsAmmt.length; arrowIdx++) {
			this.qArrowsAmmt[arrowIdx].remove();
		}
		removeListener(curLevel, 'update', this.listenerName);
		
	}, this)

	this.init(this.wall, this.qArrowAmmtMax);
	
	this.setupStd();
}

_.extend(QArrowsAmmt.prototype, objectFuncs, {
	init: function(wall, qMax) {
		var lengthMin = 15;
		var lengthMax = 80;
		var widthMin = 70
		var widthMax = 90;
		var col = Col(175, 0, 0);
		var width = 40;
		var fracFromEdge = .25;
		var startingDims = V(30, 10);
		var pos1 = wall[3].copy().fracMoveTo(wall[2], fracFromEdge);
		var pos2 = wall[3].copy().fracMoveTo(wall[2], 1-fracFromEdge);
		var UV = pos2.VTo(pos1).perp('cw').UV();
		pos1.movePt(UV.copy().mult(5));
		pos2.movePt(UV.copy().mult(5));
		var arrow1 = new ArrowStatic({pos:pos1, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV, handle: this.handle + 'Left'});
		var arrow2 = new ArrowStatic({pos:pos2, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV, handle: this.handle + 'Right'});

		var redrawThreshold = qMax/(lengthMax-lengthMin);
		this.qArrowsAmmt = [arrow1, arrow2];
		var dirLast = 'out';
		var dir;
		var src = [];
		var qLast = wall.q;
		this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, wall.q, qMax);
		if (wall.q >= 0) {
			dirLast = 'in';
			this.flipAmmtArrows(this.qArrowsAmmt);
		}
		this.listenerName = this.handle + 'updateQAmmtArrows';
		if (this.rate) {
			addListener(curLevel, 'update', this.listenerName, 
				function() {
					src.push(wall.q - qLast);
					var numVals = Math.min(75, src.length);
					var init = src.length - numVals;
					var sum = 0;
					for (var i=0; i<numVals; i++) {
						sum += src[init + i];
					}
					var qRateSmooth = sum / numVals;
					if (qRateSmooth < 0) {
						dir = 'out';
					} else {
						dir = 'in';
					}
					this.setAmmtArrowDims(this.qArrowsAmmt, 0, lengthMax, widthMin, widthMax, 150 * qRateSmooth, qMax);
					if (dirLast != dir) {
						this.flipAmmtArrows(this.qArrowsAmmt);
						dirLast = dir;
					}
					qLast = wall.q;
				},
			this);	
		} else {
			addListener(curLevel, 'update', this.listenerName, 
				function() {
					if (Math.abs(wall.q - qLast) > redrawThreshold) {
						if (wall.q < 0) {
							dir = 'out';
						} else {
							dir = 'in';
						}
						this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, wall.q, qMax);
						if (dirLast != dir) {
							this.flipAmmtArrows(this.qArrowsAmmt);
							dirLast = dir;
						}
						qLast = wall.q;
					}					
				},
			this);	
		}
	},



	flipAmmtArrows: function(arrows) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var UV = angleToUV(arrow.getAngle()).mult(1);
			// arrow.move(UV.mult(arrow.getDims().dx));
			arrow.rotate(Math.PI);
		}
	},
	setAmmtArrowDims: function(arrows, lMin, lMax, wMin, wMax, q, qMax) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var dimso = arrow.getDims();
			var percent = Math.abs(q)/qMax;
			var l = lMin + (lMax-lMin)*percent;
			var w = wMin + (wMax-wMin)*percent;
			arrow.size(V(l, w));
			if (q>0) {
				//arrow.move(V(0, dimso.dx));
			}
		}
	},
	remove: function() {
		removeListener(curLevel, 'update', this.listenerName);
	},

})