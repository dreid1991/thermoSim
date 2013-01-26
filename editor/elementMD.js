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
		this.containerDiv = undefined;
		this.labelText = 'Wall';
		if (attrs.returnLabel) return this.labelText;
		this.type = TYPES.wall;
		this.id = data.getWallId();
		this.attrs = {
			isBox: {
				type: 'checkbox',
				title: 'Is box: ',
				postText: undefined,
				inline: true,
				extendable: false,
				value: undefined,
				procFields: function(attr, field) {
					attr.value = $(field).val();
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
						divId: undefined,
						rows: 1,
						inline: true, //true means there won't be a break between that field's label and its input
						cols: 5
					},
					y: {
						type: 'textarea',
						title: 'Y:',
						divId: undefined,
						inline: true,
						rows: 1,
						cols: 5
					}
				},
				value: undefined,
				procFields: function(attr, fields) {
					attr.value = P($(fields.x).val(), $(fields.y).val());
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
			setContainer: function(div) {
				this.containerDiv = div;
			},
			genHTML: function() {
				var menuItems = [];
				var indent = 0;
				for (var attrName in this.attrs) {
					menuItems.push(this.genAttrHTML(this.attrs, attrName, this.id, indent));
				}
				this.elemWrapper = templater.div({attrs:{id: [this.id]}, innerHTML: renderMenuItem(this.wrapMenu(menuItems))});
				this.containerDiv.append(this.elemWrapper);
				this.bindFuncs();
			},
			genAttrHTML: function(attrs, attrName, id, indent) {
				id += '_' + attrName;
				var attrHTML = undefined
				var attr = attrs[attrName];
				if (attr.type == 'folder') {
					var folder = {title: undefined, content: [], type: 'folder'};
					folder.title = this.genFolderHTML(attr);
					folder.fieldsInline = attr.fieldsInline;
					for (var fieldName in attr.fields) {
						folder.content.push(this.genAttrHTML(attr.fields, fieldName, id, indent++));
					}
					attrHTML = folder;
				} else {
					attrHTML = this.genFieldHTML(attr, id, indent);
				}

				return attrHTML;
				
			},
			genFieldHTML: function(field, id, indent) {
				var title, input, post;
				
				title = field.title ? templater.label({attrs:{'for': [id]}, style: {display: 'inline-block'}, innerHTML: field.title}) : '';
				
				if (field.type == 'checkbox') {
					input = templater.checkbox({attrs: {id: [id]}});
					post = field.postText || '';
				} else if (field.type == 'textarea') {
					input = templater.textarea({attrs: {id: [id], rows: [field.rows || 1], cols: [field.cols || 7]}});
					post = field.postText || '';
				}
				return {title: title, indent: indent, input: input, post: post, type: 'field', inline: field.inline};
			},
			genFolderHTML: function(attr) {
				return attr.title;
			},
			bindFuncs: function() {
				for (var attrName in this.attrs) {
					var id = $(this.elemWrapper).attr('id');
					var attr = this.attrs[attrName];
					var func = attr.procFields;
					if (attr.type == 'folder') {
						var fields = {}
						this.appendFolderContents(attr, fields, id + '_' + attrName, attr, fields, func);
					} else {
						this.bindFunc($('#' + id + '_' + attrName), attr, $('#' + id + '_' + attrName), func);
					}
				}
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
			bindFunc: function(div, attr, fields, func) {
				var self = this;
				$(div).change(function() {func.apply(self, [attr, fields])});
			},
			wrapMenu: function(menuItems) {
				return {title: this.labelText, content: menuItems, type: 'folder'}
			}
		})
	}
})


function renderMenuItem(item) {
	if (item.type == 'folder') {
		//
		var titleDiv = templater.div({innerHTML: item.title});
		var content = item.content;
		var contentHTML = [];
		for (var contentIdx=0; contentIdx<content.length; contentIdx++) {
			contentHTML.push(renderMenuItem(content[contentIdx]));
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
		returnHTML = templater.div({innerHTML: titleDiv + templater.div({innerHTML: returnHTML, style: {position: 'relative', left: '1.5em'}})});
		return returnHTML;
	} else {
		if (item.inline) {
			//wrapping in a table to make input boxes and labels line up nicely
			return templater.div({innerHTML: 
				templater.table({attrs: {cellspacing: [0], border: [0], cellPadding: [0], bordercolor: ['red']}, innerHTML: 
					templater.tr({innerHTML: 
						templater.td({innerHTML: item.title + '&nbsp;&nbsp;'}) + 
						templater.td({innerHTML: templater.div({innerHTML: item.input})}) +
						templater.td({innerHTML: item.post || ''})
					})
				})
			});
		} else {
			return templater.div({innerHTML: item.title + templater.div({innerHTML: item.input}) + (item.post || '')});
		}
	}
}
