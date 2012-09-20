/*
Contains:
	Clamps
in that order
*/

function Clamps(attrs) {
	this.type = 'Clamps';
	this.cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
	this.clampee = attrs.clampee;
	this.clamps = attrs.clamps;
	this.wall = this.clampee.wall;
	this.init();
}

_.extend(Clamps.prototype, objectFuncs, {
	init: function() {
		this.addCleanUp();
		
	},
	remove: function() {
	
	},

} 
)