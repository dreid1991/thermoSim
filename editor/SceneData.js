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
	addElement: function(md) {
		var elem = this.buildNewElement(md);
		elem.id = md.id.apply(data);
		this.pushToList(elem);
	},
	buildNewElement: function(md) {
		var elem = {};
		elem.vals = {};
		elem.src = md;
		elem.labelText = md.labelText;
		for (var attr in md.attrs) {
			elem.vals[attr] = undefined;
		}
		return elem;
	},
	pushToList: function(elem) {
		var type = elem.src.type;
		if (type == 'Wall') {
			this.walls.push(elem);
		} else if (type == 'Dots') {
			this.dots.push(elem);
		} else if (type == 'StateListener') {
			this.listeners.push(elem);
		} else if (type == 'ReadoutEntry') {
			this.readoutEntries.push(elem);
		} else if (type == 'Command') {
			this.commands.push(elem);
		} else {
			this.objects.push(elem);
		}
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