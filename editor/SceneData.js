function SceneData() {
	this.type = undefined;
	this.walls = [];
	this.listeners = [];
	this.objects = [];
	this.dots = [];
	this.readoutEntries = [];
	this.commands = []; //for gravity, attractions,

}
//type will be defined on run based on block position

_.extend(SceneData.prototype, updateValue = {
	addWall: function() {
		var attrs = this.buildNewElement('wall');
		attrs.id = data.getWallId();
		this.walls.push(attrs);
		return attrs;
	},
	addListener: function() {
		var attrs = this.buildNewElement('listener');
		attrs.id = data.getListenerId();
		this.listeners.push(attrs);
		return attrs;
	},
	addObject: function(type) {
		var attrs = this.buildNewElement(type);
		attrs.id = data.getObjectId();
		this.objects.push(attrs);
		return attrs;
	},
	addDots: function() {
		var attrs = this.buildNewElement('dots');
		attrs.id = data.getDotsId();
		this.dots.push(attrs);
		return attrs;
	},
	addReadoutEntry: function() {
		var attrs = this.buildNewElement('readoutEntry')
		attrs.id = data.getReadoutEntryId();
		this.readoutEntries.push(attrs);
		return attrs;
	},
	addCommand: function() {
		var attrs = this.buildNewElement('command');
		attrs.id = data.getCommandId();
		this.commands.push(attrs);
		return attrs;
	},
	buildNewElement: function(type) {
		var elemData = elementData[type];
		var attrs = {};
		var labelText = elemData.labelText;
		attrs.labelText = labelText;
		for (var attr in elemData.attrs) {
			attrs[attr] = undefined;
		}
		return attrs;
	}


});

function updateValue(obj, key, newVal, id, settingToDefault, loading) {
	var trackChange = false;
	if (!settingToDefault && !loading && obj[key] != newVal) {
		trackChange = true;
		data.change(id, newVal);
	} 
	obj[key] = newVal;
		
}