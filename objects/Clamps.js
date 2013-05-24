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

function Clamps(attrs) {
	this.type = 'Clamps';
	this.handle = attrs.handle;
	this.draw = defaultTo(false, attrs.draw);
	this.releaseWith = defaultTo('button', attrs.releaseWith);
	this.currentClamper = undefined;
	this.clamps = attrs.clamps;
	this.wall = walls[attrs.wallInfo];
	this.buttonId = 'clampRelease' + this.wall.handle;
	this.wallHandler = this.wall.parent.getSubWallHandler(this.wall.handle, 0);
	this.init();
}

_.extend(Clamps.prototype, objectFuncs, {
	init: function() {
		this.setupStd();
		this.wall.moveStop();
		this.assembleClamps();
		if (this.releaseWith=='button') {
			this.makeReleaseButton();
		} else {
			this.setupClampClicking(); //Not implemented 
		}
		if (this.draw) {
			this.drawClamps(); //Not implemented
		}
		this.freezeWall();

		
	},
	assembleClamps: function() {
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var clamp = this.clamps[clampIdx];
			if (clamp.vol) {
				clamp.y = this.wall.volToY(clamp.vol)
				delete clamp.vol;
			}
			clamp.clamping = false;
		}
		this.sortClamps();
		this.addInitClamp();
	},
	sortClamps: function() {
		//sorting for low y's at beginning of list;
		for (var i=0; i<this.clamps.length; i++) {
			var switched = false;
			for (var j=0; j<this.clamps.length-1; j++) {
				if (this.clamps[j].y>this.clamps[j+1].y) {
					this.clamps.switchElements(j, j+1);
					switched = true;
				}
			}
			if (!switched) {
				break;
			}
		}
	},
	addInitClamp: function() {
		var initClampY = this.wall[0].y;
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var curClampY = this.clamps[clampIdx].y;
			if (curClampY>initClampY) {
				this.clamps.splice(clampIdx, 0, {y:initClampY, clamping:true});
				this.currentClamper = this.clamps[clampIdx];
				break;
			}
		}
	},
	makeReleaseButton: function() {
		var self = this;
		addButton(this.buttonId, 'Release');
		$('#' + this.buttonId).click(function() {self.release()});
	},
	removeReleaseButton: function() {
		removeButton(this.buttonId);
	},
	release: function() {
		var highBound = undefined;
		var lowBound = undefined;
		this.currentClamper.clamping = false;
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		var highClamp = this.clamps[currentIdx+1];
		var lowClamp = this.clamps[currentIdx-1];
		if (highClamp) {
			highBound = highClamp.y;
		}
		if (lowClamp) {
			lowBound = lowClamp.y;
		}
		var self = this;
		var onArrive = function(y) {
			self.activateClamp(y);
		}
		this.wall.releaseWithBounds(lowBound, highBound, this.wallHandler, onArrive);
	},
	activateClamp: function(arrivedAt) {
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		this.currentClamper.clamping = false;
		if (arrivedAt<this.currentClamper.y) {
			this.currentClamper = this.clamps[currentIdx-1];
		} else {
			this.currentClamper = this.clamps[currentIdx+1];
		}
		this.currentClamper.clamping = true;
		this.freezeWall();	
	},
	freezeWall: function() {
		walls.setSubWallHandler(this.wall.handle, 0, 'staticAdiabatic');	
	},
	remove: function() {
		if (!this.wall.removed) {
			this.wall.moveInit();
			this.wall.parent.setSubWallHandler(walls.indexOf(this.wall), 0, this.wallHandler);
		}
		if (this.releaseWith == 'button') {
			this.removeReleaseButton();
		}
	},

} 
)