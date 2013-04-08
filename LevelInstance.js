function LevelInstance() {
	this.readouts = {};
	this.setStds();
}
_.extend(LevelInstance.prototype, LevelTools);