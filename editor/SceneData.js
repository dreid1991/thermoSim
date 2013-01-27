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


function SceneData(sceneDiv) {
	this.sceneDiv = sceneDiv;
	this.type = undefined;
	this.containers = { //this will be the order they appear in
		title: {contents: undefined, div: undefined},
		genInfo: {contents: undefined, div: undefined},
		quiz: {contents: undefined, div: undefined},
		walls: {contents: [], div: undefined},
		listeners: {contents: [], div: undefined},
		objects: {contents: [], div: undefined},
		dots: {contents: [], div: undefined},
		readoutEntries: {contents: [], div: undefined},
		records: {contents: [], div: undefined},
		commands: {contents: [], div: undefined},
	}
	this.divs = this.genDivs(this.sceneDiv, this.containers)

}

_.extend(SceneData.prototype, updateValue = {
	addElement: function(md) {
		var elem = new md();
		var container = this.pushToList(elem);
		elem.setContainer(container.div);
		elem.genHTML();
	},
	pushToList: function(elem) {
		var type = elem.objType;
		var container;
		if (type == TYPES.wall) {
			container = this.containers.walls;
		} else if (type == TYPES.dots) {
			tcontainer = this.containers.dots;
		} else if (type == TYPES.listener) {
			container = this.containers.listeners;
		} else if (type == TYPES.entry) {
			container = this.containers.readoutEntries;
		} else if (type == TYPES.cmmd) {
			container = this.containers.commands;
		} else if (type == TYPES.record) {
			container = this.containers.records;
		} else {
			container = this.containers.objects;
		}
		container.contents.push(elem);
		return container;

	},
	genDivs: function(sceneDiv, containers) {
		var sceneId = $(sceneDiv).attr('id');
		for (var typeName in containers) {
			var id = sceneId + '_' + typeName;
			$(sceneDiv).append(templater.div({attrs: {id: [id]}}));
			containers[typeName].div = $('#' + id);
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