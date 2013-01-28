elementAttrs = {
	handle: 
		{type: String},
	pos:
		{type: Point},
	dims:
		{type: Vector},
	bounds:
		{type: Object},
	compMode:
		{type: String},
	wallHandle:
		{type: String},
	dotInfo:
		{type: Object}  //Need to figure out composites
}

elementMDTypes = {
	checkbox: function(label, trueVal, falseVal, extendable) {
		return {
			type: 'checkbox',
			label: label,
			values: {
				true: trueVal,
				false: falseVal
			},
			extendable: false
		
		}
	},
	textarea: function(label, suffix, extendable) {
		return {
			type: 'textarea',
			suffix: suffix,
			extendable: extendable
		}
	}
}

elementMD = {
//Objects ones must correspond to their function name in the simulation.

//I am changing wallInfo to wallHandle
//instead of pressure or mass, allow only pressure input, because who wants mass anyway?

	readoutEntry: function() {
		// labelText: 'Readout entry',
		// type: 'ReadoutEntry',
		// id: DataManager.prototype.readoutEntryId,
		// attrs: {
			// wallHandle: 
				// elementAttrs.wallHandle,
			// data:
				// {type: String},
			// readoutHandle:
				// {type: String}
		// }
			
		//{wallHandle: 'left', data:'TempSmooth', readout:'mainReadout'}
	},
	dots: function() {
		// labelText: 'Molecules',
		// type: 'Dots',
		// id: DataManager.prototype.getDotsId,
		// attrs: {
			// pos:
				// elementAttrs.pos,
			// dims:
				// elementAttrs.dims,
			// spc: 
				// {type: String},
			// count:
				// {type: Number},
			// temp: 
				// {type: Number},
			// returnTo:
				// {type: String},
			// tag:
				// {type: String}
		// }
	},
	//wallHandle: 'left', dataList: 't', is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'
	listener: function() {
		// labelText: 'Listener',
		// type: 'StateListener',
		// id: DataManager.prototype.getListenerId,
		// attrs: {
			// wallHandle:
				// elementAttrs.wallHandle,
			// dataList:
				// {type: String},
			// is:
				// {type: String},
			// targetVal:
				// {type: Number},
			// alertSatisfied:
				// {type: String},
			// alertUnsatisfied:
				// {type: String},
			// priorityUnsatisfied:
				// {type: Number},
			// checkOn:
				// {type: String}
		// }
	},
	weights: function() {
		// labelText: 'Weights',
		// type: 'DragWeights',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle:
				// elementAttrs.handle,
			// weightDefs:
				// {type: Array},
			// weightScalar:
				// {type: Number},
			// displayText:
				// {type: Boolean},
			// massInit:
				// {type: Number},
			// wallHandle:
				// elementAttrs.wallHandle,
			// compMode:
				// elementAttrs.compMode,
			// pistonOffset:
				// {type: Vector}
		// }
		//{weightDefs:[{count:1, pressure:2}], weightScalar:70, displayText:false, massInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)}
	},
	compArrow: function() {
		// labelText: 'Compression Arrow',
		// type: 'CompArrow',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle:
				// elementAttrs.handle,
			// compMode:
				// elementAttrs.compMode,
			// bounds:
				// elementAttrs.bounds
			
		// }
		//{handle:'compyT', compMode:'adiabatic', bounds:{y:{min:30, max:235}}}
	},
	piston: function() {
	//{type: 'Piston', attrs: {handle: 'RightPiston', wallInfo: 'right', min:2, init:2, max:2, makeSlider:false}
		// labelText: 'Piston',
		// type: 'Piston',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle:
				// elementAttrs.handle,
			// compMode:
				// elementAttrs.compMode,
			// wallHandle:
				// elementAttrs.wallHandle,
			// min:
				// {type: Number},
			// init: 
				// {type: Number},
			// max:
				// {type: Number},
			// makePiston:
				// {type: Boolean}
		// }
	},
	heater: function() {
		// labelText: 'Heater',
		// type: 'Heater',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle: 
				// elementAttrs.handle,
			// wallHandle:
				// elementAttrs.wallHandle,
			// dims:
				// elementAttrs.dims, //Need to make an optional/required thing
			// max:
				// {type: Number}
			
		// }
	},
	stops: function() {
		// labelText: 'Stops',
		// type: 'Stops',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle:
				// elementAttrs.handle,
			// wallHandle:
				// elementAttrs.wallHandle
		// }
	},
	sandbox: function() {
		// labelText: 'Sandbox',
		// type: 'Sandbox',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// handle: 
				// elementAttrs.handle,
			// min:
				// {type: Number},
			// init: 
				// {type: Number},
			// max:
				// {type: Number}
		// }
	},
	tempChanger: function() {
		// labelText: 'Temp changer',
		// type: 'TempChanger',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// min:
				// {type: Number},
			// max:
				// {type: Number},
			// sliderPos:
				// {type: String},
			// info:
				// elementAttrs.dotInfo
				
		// }
	
	},
	RMSChanger: function() {
		// labelText: 'RMS changer',
		// type: 'RMSChanger',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			// min:
				// {type: Number},
			// max:
				// {type: Number},
			// sliderPos:
				// {type: String},
			// info:
				// elementAttrs.dotInfo
				
		// }
	},
	arrowStatic: function() {
		// labelText: 'Arrow static',
		// type: 'ArrowStatic',
		// id: DataManager.prototype.getObjId,
		// attrs: {
			
		// }
	
	},
	wall: function(attrs) {
		attrs = attrs || {};
	//type, label, something about how data is input
		this.containerDiv = undefined; //set in setContainer function
		this.labelText = 'Wall';
		if (attrs.returnLabel) return this.labelText;
		this.val = {};
		this.objType = TYPES.wall;
		this.id = data.getWallId();
		//process functions are wrapped so attr and children refer to themselves and their fields.  The wrapper calls the parent's process function so the changes bubble up
		this.process = function(attr, children) {
			for (var childName in children) {
				attr.val[childName] = children[childName].val;
			}
		},
		this.fields = {
			isBox: {
				type: 'checkbox',
				title: 'Is box: ',
				postText: undefined,
				inline: true,
				extendable: false,
				val: undefined,
				process: function(attr, field) {
					attr.val = $(field).is(':checked')
				},
				
			},
			pts: {
				type: 'folder',
				title: 'Points: ',
				extendable: true,
				fieldsInline: true, //true means there won't be a break between each field
				fields: {
					x: {
						type: 'textarea',
						title: 'X:',
						inline: true, //true means there won't be a break between that field's label and its input
						rows: 1,
						cols: 5,
						val: undefined,
						process: function(attr, field) {
							attr.val = parseFloat($(field).val());
						}
					},
					y: {
						type: 'textarea',
						title: 'Y:',
						inline: true,
						rows: 1,
						cols: 5,
						val: undefined,
						process: function(attr, field) {
							attr.val = parseFloat($(field).val());
						}
					}
				},
				val: undefined,
				process: function(attr, children) {
					attr.val = [];
					//for (var childIdx=0; is list now
					attr.val = P(children.x.val, children.y.val);
				}
			},
			/*
			pos:
				elementAttrs.pos,
			dims:	
				elementAttrs.dims,
			handle:
				elementAttrs.handle,
			handler:
				{type: String},
			vol: 
				{type: Number},
			bounds:
				{type: Object},
			show:
				{type: Boolean},
			temp:
				{type: Number}
			//add some border stuff*/

		}
	},


}
//if a folder, fields will be object, else field is just a jquery object
$(function() {
	for (var mdName in elementMD) {
		var md = elementMD[mdName];
		_.extend(md.prototype, {
			type: 'folder',
			folderArrowDim: 13,
			stdExts: {
				content: 'content',
				header: 'header',
				title: 'title',
				wrapper: 'wrapper',
				expander: 'expander',
				image: 'img'
			},
			setContainer: function(div) {
				this.containerDiv = div;
			},

			//only folders can be extendable.  Non-folders and single inputs
			
			//Take 2
			genHTML: function() {
				var wrapperDiv = $(templater.div({attrs: {id: [[this.id, 'std', this.stdExts.wrapper].join('_')]}}));
				this.containerDiv.append(wrapperDiv);
				this.genFieldHTML(this, [this.id], wrapperDiv, undefined)
			},
			genFieldHTML: function(field, ids, wrapper, parent) {
				var process = field.process;
				var headerId = ids.concat(['std', this.stdExts.header]).join('_');
				var titleId = ids.concat(['std', this.stdExts.title]).join('_');
				var contentId = ids.concat(['std', this.stdExts.content]).join('_');
				
				var headerHTML = templater.div({attrs: {id: [headerId]}, innerHTML: templater.div({attrs: {id: [titleId]}, innerHTML: field.title})});
				
				if (field.inline) {
					var contentHTML = templater.div({attrs: {id: [contentId]}});
				
					bodyHTML = templater.table({attrs: {cellspacing: [0], border: [0]}, innerHTML:
								templater.tr({innerHTML: 
									templater.td({innerHTML: headerHTML}) + //need to have spaces and headerHTML in different td or it offsets the content down a little bit
									templater.td({innerHTML: '&nbsp;&nbsp;'}) + 
									templater.td({innerHTML: contentHTML}) 
								})
							});
				} else {
					var contentHTML = templater.div({attrs: {id: [contentId]}, style: {position: 'relative', left: '1.5em'}});
					bodyHTML = headerHTML + contentHTML;
				}
				
				$(wrapper).append(bodyHTML);
				var header = $('#' + headerId);
				var title = $('#' + titleId);
				var content = $('#' + contentId);
				if (field.type == 'folder') {
					this.genFolderHTML(field, ids, content, parent, process)
				} else {
					this.genInputHTML(field, ids, parent, process, title, content);
				}
			},
			genFolderHTML: function(field, ids, content, parent, process) {
				var subFields = field.fields;
				//writing so that each folder starts with one child.  More will be added if extandable
				var children = [{}];
				var child = children[0];
				for (var subFieldName in subFields) {
					var subField = subFields[subFieldName];
					child[subFieldName] = subField;
					var subFieldIds = ids.concat([subFieldName]);
					var subFieldWrapperId = subFieldIds.concat(['std', this.stdExts.wrapper]).join('_');
					if (field.fieldsInline) {
						subFieldDivHTML = templater.div({attrs: {id: [subFieldWrapperId]}, style: {display: 'inline-block'}});
					} else {
						subFieldDivHTML = templater.div({attrs: {id: [subFieldWrapperId]}});
					}
					$(content).append(subFieldDivHTML);
					this.bindFolder(field, parent, children);
					this.genFieldHTML(subField, subFieldIds, $('#' + subFieldWrapperId), field);
				}			
			},
			genInputHTML: function(field, ids, parent, process, title, content) {
				var id = ids.join('_');
				this.appendInput(content, field, id);
				$(title).attr('for', id);
				this.bindInput($('#' + id), field, parent, process);
			},
			appendInput: function(div, field, id) {
				var inputHTML;
				if (field.type == 'textarea') {
					inputHTML = templater.textarea({attrs: {id: [id], rows: [field.rows || 1], cols: [field.cols || 7]}});
				} else if (field.type == 'checkbox') {
					inputHTML = templater.checkbox({attrs: {id: [id]}});
				}
				$(div).append(inputHTML);
			},
			bindFolder: function(field, parent, children) {
				var oldProcess = field.process;
				var self = this;
				if (parent) {
					field.process = function() {
						oldProcess.apply(self, [field, children]);
						parent.process();
					}
				} else {
					field.process = function() {
						oldProcess.apply(self, [field, children])
					}
				}
			},
			bindInput: function(div, field, parent, func) {
				var self = this;
				$(div).change(function() {func.apply(self, [field, div]); parent.process.apply(self)});
			},
			bindExpanders: function() {
				var newExpanders = this.newExpanders;
				if (newExpanders) {
					for (var expIdx=0; expIdx<newExpanders.length; expIdx++) {
						var exp = $('#' + newExpanders[expIdx]);
						this.bindExpander(exp);
					}
				}
			},
			// genExpanderDiv: function(itemId) {
				// var expanderId = itemId + '_std_' + this.stdExts.expander;
				// var imgId = expanderId + '_' + this.stdExts.image;
				// var className = this.stdExts.expander;
				// this.newExpanders ? this.newExpanders.push(expanderId) : this.newExpanders = [expanderId];
				// return templater.div({style: {position: 'relative', left: '-' + (this.folderArrowDim + 2) + 'px', top: this.folderArrowDim*.2 + 'px', width: '0px', height: '0px'}, attrs: {id: [expanderId], itemId: [itemId], imgId: [imgId], 'class': [className]}, innerHTML: templater.img({attrs: {src: ['img/folder_open.png'], id: [imgId], width: [this.folderArrowDim], height: [this.folderArrowDim]}})});
			// },
			// genExtenders: function(menuItems) {
				// for (var itemIdx=0; itemIdx<menuItems.length; itemIdx++) {
					// var item = menuItems[itemIdx];
					// if (item.type == 'folder') {
						// if (item.extendable) {
							// this.genExtender(item);
						// }
						// this.genExtenders(item);
					// }
					
				// }
			// },
			// genExtender: function(menuItem) {
				// var id = menuItem.id;
				// //was here
				
			// },
		})
	}
})
