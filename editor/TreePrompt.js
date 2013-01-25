/*
For prompt, need to store:
	labelText - if button.haveChangedLabel, store, else undefined
	
*/


function TreePrompt(tree, section, posInit, dragFuncs, clickFuncs, labelText, inheritedId) {
	this.tree = tree;
	this.dragFuncs = dragFuncs;
	this.clickFuncs = clickFuncs;
	this.labelText = labelText;
	this.button = new ArrowButton(this.tree, this, posInit, this.dragFuncs, this.clickFuncs);
	if (inheritedId === undefined) {
		this.id = data.getPromptId();
		this.register();
	} else {
		this.id = inheritedId;
	}
	this.section = section;
	if (!$('#' + this.id).length) {
		$('#objDiv').append(templater.div({attrs: {id: [this.id]}}));
	}
	this.sceneData = new SceneData($('#' + this.id));
}

TreePrompt.prototype = {
	addElement: function(elem) {
		this.sceneData.addElement(elem);
	},
	getSection: function() {
		return this.section;
	},
	getId: function() {
		return this.id;
	},
	register: function() {
		if (this.button.haveUpdatedLabel) {
			data.add(this.id + 'LabelText', this.labelText);
		} else {
			data.add(this.id + 'LabelText', undefined);
		}
	},
	fadeOut: function() {
		this.button.fadeOut();
	},
	setSection: function(section) {
		this.section = section;
	},
	updateLabel: function(labelText, settingToDefault, isLoading) {
		this.button.updateLabel(labelText, settingToDefault, isLoading);
	},
	totalHeight: function() {
		return this.tree.totalButtonHeight;
	},
	totalWidth: function() {
		return this.tree.buttonDims.dx;
	},
	hide: function() {
		this.button.hide();
	},
	show: function() {
		this.button.show();
	},
	toFront: function() {
		this.button.toFront();
	},
	remove: function() {
		this.button.remove();
	},
	move: function(moveOrder, type, time) {
		this.button.move(moveOrder, type, time);
	}
}




