TYPES = {
	title: 'title',
	genInfo: 'genInfo', //is cutScene, text
	quiz: 'quiz',	
	wall: 'Wall',
	dots: 'Dots',
	listener: 'StateListener',
	entry: 'ReadoutEntry',
	record: 'Record',
	cmmd: 'Command',
	piston: 'Piston',
	dragWeights: 'DragWeights',
	

}

function SceneData() {
	this.type = undefined;
	this.title = undefined;
	this.genInfo = undefined;
	this.quiz = undefined;
	this.walls = [];
	this.listeners = [];
	this.objects = [];
	this.dots = [];
	this.readoutEntries = [];
	this.records = [];
	this.commands = []; //for gravity, attractions,
	this.html = {
		title: undefined,
		genInfo: undefined,
		quiz: undefined,
		walls: undefined,
		dots: undefined,
		objects: undefined,
		readoutEntries: undefined,
		listeners: undefined,
		records: undefined,
		commands: undefined,
		
	};

}
//type will be defined on run based on block position

_.extend(SceneData.prototype, updateValue = {
	addElement: function(md) {
		var elem = new md();
		elem.id = elem.id.apply(data);
		this.pushToList(elem);
	},
	pushToList: function(elem) {
		var type = elem.type;
		if (type == TYPES.wall) {
			this.walls.push(elem);
		} else if (type == TYPES.dots) {
			this.dots.push(elem);
		} else if (type == TYPES.listener) {
			this.listeners.push(elem);
		} else if (type == TYPES.entry) {
			this.readoutEntries.push(elem);
		} else if (type == TYPES.cmmd) {
			this.commands.push(elem);
		} else if (type == TYPES.record) {
			this.records.push(elem);
		} else {
			this.objects.push(elem);
		}
	},
	renderElem: function(elem) {


});

function updateValue(obj, key, newVal, id, settingToDefault, loading) {
	var trackChange = false;
	if (!settingToDefault && !loading && obj[key] != newVal) {
		trackChange = true;
		data.change(id, newVal);
	} 
	obj[key] = newVal;
		
}