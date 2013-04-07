function LevelInstance(readout) {
	this.readouts = {mainReadout: readout};
}
_.extend(LevelInstance.prototype, LevelTools)