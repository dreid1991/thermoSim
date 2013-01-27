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
				title: 'title',
				wrapper: 'wrapper',
				expander: 'expander',
				image: 'img'
			},
			setContainer: function(div) {
				this.containerDiv = div;
			},
			//So first I assemble the HTML in getAttrHTML as some js objects with types, content, and html blocks for the input and titles.  
			//Then assembleItems puts it together into one big html string.
			//Then bindFuncs binds change and process functions to changes bubble up through the folders
			//folder has attrs: title, content, type, id.  Id is for the title and content divs.  They are theId_std_(content|title) 
			//input has attrs: title, input, post, type, inline.  Title, input, and post and the three html blocks.  Before the input, the input, after the input.  type is 'field'
			genHTML: function() {
				var menuItems = [];
				for (var fieldName in this.fields) {
					menuItems.push(this.genAttrHTML(this.fields, fieldName, this.id));
				}
				this.elemWrapper = templater.div({attrs:{id: [this.id]}, innerHTML: this.assembleItems(this.wrapMenu(menuItems))});
				this.containerDiv.append(this.elemWrapper);
				this.bindFuncs(this, $(this.elemWrapper).attr('id'));
				this.bindExpanders();
			},
			genAttrHTML: function(fields, fieldName, id) {
				id += '_' + fieldName;
				var attrHTML = undefined
				var field = fields[fieldName];
				if (field.type == 'folder') {
					var folder = {title: undefined, content: [], type: 'folder', id: id};
					folder.title = this.genFolderHTML(field);
					folder.fieldsInline = field.fieldsInline;
					for (var subFieldName in field.fields) {
						folder.content.push(this.genAttrHTML(field.fields, subFieldName, id));
					}
					attrHTML = folder;
				} else {
					attrHTML = this.genFieldHTML(field, id);
				}

				return attrHTML;
				
			},
			genFieldHTML: function(field, id) {
				var title, input, post;
				
				title = field.title ? templater.label({attrs:{'for': [id]}, innerHTML: field.title}) : '';
				
				if (field.type == 'checkbox') {
					input = templater.checkbox({attrs: {id: [id]}});
					post = field.postText || '';
				} else if (field.type == 'textarea') {
					input = templater.textarea({attrs: {id: [id], rows: [field.rows || 1], cols: [field.cols || 7]}});
					post = field.postText || '';
				}
				return {title: title, input: input, post: post, type: 'field', inline: field.inline};
			},
			genFolderHTML: function(field) {
				return field.title;
			},
			bindFuncs: function(field, id, parent, fieldName) {
				var func = field.process;
				if (field.type == 'folder') {
					var children = {};
					var subFields = field.fields;
					for (var subFieldName in subFields) {
						var subField = subFields[subFieldName];
						children[subFieldName] = subField;
						this.bindFolder(field, parent, children);
						var childId = fieldName ? id + '_' + fieldName : id;
						this.bindFuncs(subField, childId, field, subFieldName);
						
					}
					var titleDiv = $('#' + id + '_std_' + this.stdExts.title);
					var contentDiv = $('#' + id + '_std_' + this.stdExts.content);
				} else {
					this.bindInput($('#' + id + '_' + fieldName), field, parent, func);
				}
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
			bindExpander: function(exp) {
				var contentDiv = $('#' + $(exp).attr('itemId') + '_std_' + this.stdExts.content);
				var img = $('#' + $(exp).attr('imgId'));
				var expanded = true;
				$(exp).click(function() {
					if (expanded) {
						expanded = false;
						$(img).attr('src', 'img/folder_closed.png');
						$(contentDiv).hide();
					} else {
						expanded = true;
						$(img).attr('src', 'img/folder_open.png');
						$(contentDiv).show();
					}
				})
			},
			appendFolderContents: function(attr, fields, id, topAttrs, topFields, func) {
				for (var fieldName in attr.fields) {
					var field = attr.fields[fieldName];
					if (field.type == 'folder') {
						fields[fieldName] = {};
						this.appendFolderContents(attr[attrName], fields[attrName], id + '_' + attrName, topAttrs, topFields, func);
					} else {
						fields[fieldName] = $('#' + id + '_' + fieldName);
						this.bindFunc($(fields[fieldName]), topAttrs, topFields, func);
					}
				}
			},
			wrapMenu: function(menuItems) {
				return {title: this.labelText, content: menuItems, type: 'folder', id: this.id}
			},
			assembleItems: function(item) {
				if (item.type == 'folder') {
					var titleDiv = templater.div({innerHTML: item.title, attrs: {id: [item.id + '_std_title']}});
					var content = item.content;
					var contentHTML = [];
					for (var contentIdx=0; contentIdx<content.length; contentIdx++) {
						contentHTML.push(this.assembleItems(content[contentIdx]));
					}
					var returnHTML = '';
					if (item.fieldsInline) {
						for (var htmlIdx=0; htmlIdx<contentHTML.length; htmlIdx++) {
							returnHTML += templater.div({innerHTML: contentHTML[htmlIdx], style: {display: 'inline-block'}});
						}			
					} else {
						for (var htmlIdx=0; htmlIdx<contentHTML.length; htmlIdx++) {
							returnHTML += templater.div({innerHTML: contentHTML[htmlIdx]});
						}
					}
					var contentWrapperDiv = templater.div({innerHTML: returnHTML, attrs: {id: [item.id + '_std_' + this.stdExts.content]}, style: {position: 'relative', left: '1.5em'}})
					var expanderDiv = this.genExpanderDiv(item.id);
					returnHTML = templater.div({attrs: {id: [item.id + '_std_' + this.stdExts.wrapper]}, innerHTML: expanderDiv + titleDiv + contentWrapperDiv});
					return returnHTML;
				} else {
					if (item.inline) {
						//wrapping in a table to make input boxes and labels line up nicely
						return templater.table({attrs: {cellspacing: [0], border: [0]}, innerHTML: 
								templater.tr({innerHTML: 
									templater.td({innerHTML: item.title + '&nbsp;&nbsp;'}) + 
									templater.td({innerHTML: templater.div({innerHTML: item.input})}) +
									templater.td({innerHTML: item.post || ''})
								})
							});
						
					} else {
						return item.title + templater.div({innerHTML: item.input}) + (item.post || '');
					}
				}			
			},
			genExpanderDiv: function(itemId) {
				var expanderId = itemId + '_std_' + this.stdExts.expander;
				var imgId = expanderId + '_' + this.stdExts.image;
				var className = this.stdExts.expander;
				this.newExpanders ? this.newExpanders.push(expanderId) : this.newExpanders = [expanderId];
				return templater.div({style: {position: 'relative', left: '-' + (this.folderArrowDim + 2) + 'px', top: this.folderArrowDim*.2 + 'px', width: '0px', height: '0px'}, attrs: {id: [expanderId], itemId: [itemId], imgId: [imgId], 'class': [className]}, innerHTML: templater.img({attrs: {src: ['img/folder_open.png'], id: [imgId], width: [this.folderArrowDim], height: [this.folderArrowDim]}})});
			},
		})
	}
})
