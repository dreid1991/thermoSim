function Templater() {
 //need to make it add globalHTMLClass
}

Templater.prototype = {
	elem: function(obj) {
		obj.attrs = obj.attrs || {};
		obj.style = obj.style || undefined;
		obj.innerHTML = obj.innerHTML || '';
		!obj.attrs.class ? obj.attrs.class = [globalHTMLClass] : obj.attrs.class.push(globalHTMLClass);
		obj.templater = this;
		return this.elemTemp(obj);
	},
	img: function(obj) {
		obj ? obj.type = 'img' : obj = {type: 'img'};
		return this.elem(obj);
	},
	div: function(obj) {
		obj ? obj.type = 'div' : obj = {type: 'div'};
		return this.elem(obj);
	},
	button: function(obj) {
		obj ? obj.type = 'button' : obj = {type: 'button'};
		return this.elem(obj);
	},
	textarea: function(obj) {
		obj ? obj.type = 'textarea' : obj = {type: 'textarea'};
		return this.elem(obj);
	},
	p: function(obj) {
		obj ? obj.type = 'p' : obj = {type: 'p'};
		return this.elem(obj);
	},
	br: function() {
		return '<br>';
	},
	tab: function() {
		return '&#09;';
	},
	table: function(obj) {
		obj ? obj.type = 'table' : obj = {type: 'table'};
		return this.elem(obj);
	},
	tr: function(obj) {
		obj ? obj.type = 'tr' : obj = {type: 'tr'};
		return this.elem(obj);
	},
	td: function(obj) {
		obj ? obj.type = 'td' : obj = {type: 'td'};
		return this.elem(obj);
	},
	center: function(obj) {
		obj ? obj.type = 'center' : obj = {type: 'center'};
		return this.elem(obj);
	},
	label: function(obj) {
		obj ? obj.type = 'label' : obj = {type: 'label'};
		return this.elem(obj);	
	},
	canvas: function(obj) {
		obj ? obj.type = 'canvas' : obj = {type: 'canvas'};
		return this.elem(obj);
	},
	input: function(obj) {
		obj ? obj.type = 'input' : obj = {type: 'input'};
		return this.elem(obj);
	},
	checkbox: function(obj) {
		obj = obj || {};
		obj.attrs = obj.attrs || {};
		obj.attrs.type = ['checkbox'];
		return this.input(obj);
	},
	select: function(obj) {
		obj ? obj.type = 'select' : obj = {type: 'select'};
		return this.elem(obj);
	},
	option: function(obj) {
		obj ? obj.type = 'option' : obj = {type: 'option'};
		return this.elem(obj);		
	},
	ul: function(obj) {
		obj ? obj.type = 'ul' : obj = {type: 'ul'};
		return this.elem(obj);
	},
	li: function(obj) {
		obj ? obj.type = 'li' : obj = {type: 'li'};
		return this.elem(obj);
	},
	a: function(obj) {
		obj ? obj.type = 'a' : obj = {type: 'a'};
		return this.elem(obj);
	},
	appendRadio: function(div, items, defaultIdx, groupName) {
		//formatted as list of option names, ids, cbs
		var itemsHTML = '';
		defaultIdx = defaultIdx || 0;
		for (var itemIdx=0; itemIdx<items.length; itemIdx++) {
			var item, text, id, aHTML, liHTML, classes;
			item = items[itemIdx];
			text = item.text;
			id = item.id;
			aHTML = this.a({innerHTML: text, attrs: {href: ['#']}});//do I need quotes?
			//need to set which one is on first.  
			classes = [groupName];
			if (itemIdx == defaultIdx) classes.push('on');
			liHTML = this.li({innerHTML: aHTML, attrs: {class: classes, id: [id]}});

			itemsHTML += liHTML;
		}
		var HTML = this.ul({innerHTML: itemsHTML, attrs: {id: [groupName]}});
		$(div).append(HTML);
		
		this.radioActivate(items, groupName);
	},
	radioActivate: function(items, groupName) {
		for (var itemIdx=0; itemIdx<items.length; itemIdx++) {
			var item, cb, id, itemDiv;
			item = items[itemIdx];
			itemDiv = $('#' + item.id);
			this.bindRadio(itemDiv, groupName, item.cb);
		}
	},
	bindRadio: function(item, groupName, cb) {
		$(item).click(function() {
			$('li.' + groupName).removeClass('on');
			$(this).addClass('on');
			if (cb) cb();
		})	
	},
	style: function(obj) {
		return this.styleTemp(obj);
	},
	//make init radio function
	elemTemp: _.template("<<%= type%><% for (var attr in attrs) { %><%= ' ' + attr %>='<%= attrs[attr].join(' ') %>'<% } %><%= style ? ' ' : '' %><%= templater.style({style: style}) %>><%= innerHTML %></<%= type %>>"),
	styleTemp: _.template("<% if (!style) {return ''} %>style='<% for (var stylet in style) { %><%= stylet %>:<%= style[stylet] %>;<% } %>'")
}

