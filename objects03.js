/*
Contains:
	Clamps
in that order
*/

function Clamps(attrs) {
	this.type = 'Clamps';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.clampee = attrs.clampee;
	this.currentClamper = undefined;
	this.clamps = attrs.clamps;
	this.wall = this.clampee.wall;
	this.init();
}

_.extend(Clamps.prototype, objectFuncs, {
	init: function() {
		this.addCleanUp();
		this.wall.moveStop();
		this.assembleClamps();
		
	},
	assembleClamps: function() {
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var clamp = this.clamps[clampIdx];
			if (clamp.vol) {
				clamp.y = this.wall.volToY(clamp.vol)
				clamp.vol = undefined;
			}
			clamp.clamping = false;
		}
		this.sortClamps();
	},
	sortClamps: function() {
		//sorting for low y's at beginning of list;
		for (var i=0; i<this.clamps.length; i++) {
			for (var j=0; j<this.clamps.length-1; j++) {
				if (this.clamps[j].y>this.clamps[j+1].y) {
					this.clamps.switchElements(j, j+1);
				}
			}
		}
		this.addInitClamp();
	},
	addInitClamp: function() {
		var initClampY = this.wall[0].y;
		for (var clampIdx=0; clampIdx<this.clamps.length; clampIdx++) {
			var curClampY = this.clamps[clampIdx].y;
			if (curClampY>initClampY) {
				this.clamps.splice(clampIdx, 0, {y:initClampY, clamping:true});
				this.currentClamper = this.clamps[clampIdx];
			}
		}
	},
	release: function() {
		this.currentClamper.clamping = false;
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		var highBound = this.clamps[currentIdx+1].y;
		var lowBound = this.clamps[currentIdx-1].y;
		var self = this;
		var onArrive = function(y) {
			self.activateClamp(y);
		}
		this.wall.releaseWithBounds(lowBound, highBound, onArrive);
	},
	activateClamp: function(arrivedAt) {
		var currentIdx = this.clamps.indexOf(this.currentClamper);
		alert(arrivedAt);
		this.currentClamper.clamping = false;
		if (arrivedAt<this.currentClamper.y) {
			this.currentClamper = this.clamps[currentIdx-1];
		} else {
			this.currentClamper = this.clamps[currentIdx+1];
		}
		this.currentClamper.clamping = true;
		
	},
	remove: function() {
		if (!this.wall.removed) {
			this.wall.moveInit();
		}
	},

} 
)