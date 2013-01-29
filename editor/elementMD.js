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
		this.title = this.labelText;
		if (attrs.returnLabel) return this.labelText;
		this.val = {};
		this.objType = TYPES.wall;
		this.id = data.getWallId();
		//process functions are wrapped so attr and children refer to themselves and their fields.  The wrapper calls the parent's process function so the changes bubble up
		this.process = function(valObj, children) {
			var children = children[0]
			for (var childName in children) {
				valObj.val[childName] = children[childName].val;
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
				process: function(valObj, field) {
					valObj.val = $(field).is(':checked')
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
						process: function(valObj, field) {
							valObj.val = parseFloat($(field).val());
						}
					},
					y: {
						type: 'textarea',
						title: 'Y:',
						inline: true,
						rows: 1,
						cols: 5,
						val: undefined,
						process: function(valObj, field) {
							valObj.val = parseFloat($(field).val());
						}
					}
				},
				val: undefined,
				process: function(valObj, children) {
					//for (var childIdx=0; is list now
					valObj.val = P(children[0].x.val, children[0].y.val);
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
				fieldsWrapper: 'fieldsWrapper',
				expander: 'expander',
				aux: 'aux',
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
				this.genFieldHTML(this, [this.id], wrapperDiv, undefined, this)
			},
			genFieldHTML: function(field, ids, wrapper, parent, valObj) {
				var process = field.process;
				var headerId = ids.concat(['std', this.stdExts.header]).join('_');
				var titleId = ids.concat(['std', this.stdExts.title]).join('_');
				var contentId = ids.concat(['std', this.stdExts.content]).join('_');
				//var auxId = ids.concat(['std', this.stdExts.aux]).join('_');
				
				//var auxHTML = templater.div({attrs: {id: [auxId]}, style: {display: 'inline-block'}});
				
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
				if (field.type == 'folder') {
					bodyHTML = templater.div({
						attrs: {
							id: [ids.concat(['std', this.stdExts.expander]).join('_')]
						}, 
						style:{
							position: 'relative', 
							left: '-' + (this.folderArrowDim + 2) + 'px', 
							top: this.folderArrowDim*.2 + 'px', 
							width: '0px', 
							height: '0px'
						}
					}) + bodyHTML;
					
				}
				
				$(wrapper).append(bodyHTML);
				var header = $('#' + headerId);
				var title = $('#' + titleId);
				var content = $('#' + contentId);
				
				if (field.type == 'folder') {
					var expander = $('#' + ids.concat(['std', this.stdExts.expander]).join('_'));
					this.genFolderHTML(field, ids, content, parent, expander, valObj)
				} else {
					this.genInputHTML(field, ids, parent, process, title, content, valObj);
				}
			},
			genFolderHTML: function(field, ids, content, parent, expander, valObj) {
				this.genExpanderHTML(expander, ids, content);
				var subFields = field.fields;
				//writing so that each folder starts with one child.  More will be added if extandable
				var children = [];
				
				this.folderSpawnChild(field, ids, content, children)
				//I just moved bindFolder out of the loop.  Pretty sure that's fine, but make sure things still bubble up at some point
				this.bindFolder(field, parent, valObj, children);
			},
			folderSpawnChild: function(field, ids, content, children) {
				var child = {};
				children.push(child);
				var subFields = field.fields;
				for (var subFieldName in subFields) {
					var subField = subFields[subFieldName];
					child[subFieldName] = {val: undefined};
					var subFieldIds = ids.concat([subFieldName]);
					var subFieldWrapperId = subFieldIds.concat(['std', this.stdExts.wrapper]).join('_');
					if (field.fieldsInline) {
						subFieldDivHTML = templater.div({attrs: {id: [subFieldWrapperId]}, style: {display: 'inline-block'}});
					} else {
						subFieldDivHTML = templater.div({attrs: {id: [subFieldWrapperId]}});
					}
					$(content).append(subFieldDivHTML);
					this.genFieldHTML(subField, subFieldIds, $('#' + subFieldWrapperId), field, child[subFieldName]);
				}					
			},
			genInputHTML: function(field, ids, parent, process, title, content, valObj) {
				var id = ids.join('_');
				this.appendInput(content, field, id);
				$(title).attr('for', id);
				this.bindInput($('#' + id), valObj, parent, process);
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
			bindFolder: function(field, parent, valObj, children) {
				var oldProcess = field.process;
				var self = this;
				if (parent) {
					field.process = function() {
						oldProcess.apply(self, [valObj, children]);
						parent.process();
					}
				} else {
					field.process = function() {
						oldProcess.apply(self, [valObj, children])
					}
				}
			},
			bindInput: function(div, valObj, parent, func) {
				var self = this;
				$(div).change(function() {func.apply(self, [valObj, div]); parent.process.apply(self)});
			},

			bindExpander: function(img, content) {
				var expanded = true;
				$(img).click(function() {
					if (expanded) {
						expanded = false;
						$(img).attr('src', 'img/folder_closed.png');
						$(content).hide();
					} else {
						expanded = true;
						$(img).attr('src', 'img/folder_open.png');
						$(content).show();
					}
				})
			},
			genExpanderHTML: function(parent, ids, content) {
				var imgId = ids.concat(['std', this.stdExts.image]).join('_');
				var className = this.stdExts.expander;
				var img = templater.img({
					attrs: {
						src: ['img/folder_open.png'], 
						id: [imgId], 
						width: [this.folderArrowDim], 
						height: [this.folderArrowDim]
					}
				});

				$(parent).append(img);
				this.bindExpander($('#' + imgId), content);
			},
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
