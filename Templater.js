function Templater() {
 //need to make it add globalHTMLClass
}

Templater.prototype = {
	elem: function(obj) {
		obj.attrs = obj.attrs || {};
		obj.style = obj.style || undefined;
		obj.innerHTML = obj.innerHTML || '';
		!obj.attrs.class ? obj.attrs.class = [globalHTMLClass] : obj.attrs.class.push(globalHTMLClass);
		
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
		if (!obj) {
			obj = {};
		}
		if (!obj.attrs) {
			obj.attrs = {};
		}
		obj.attrs.type = ['checkbox'];
		return this.input(obj);
	},
	style: function(obj) {
		return this.styleTemp(obj);
	},
	elemTemp: _.template("<<%= type%><% for (var attr in attrs) { %><%= ' ' + attr %>='<%= attrs[attr].join(' ') %>'<% } %><%= style ? ' ' : '' %><%= templater.style({style: style}) %>><%= innerHTML %></<%= type %>>"),
	styleTemp: _.template("<% if (!style) {return ''} %>style='<% for (var stylet in style) { %><%= stylet %>:<%= style[stylet] %>;<% } %>'")
}

