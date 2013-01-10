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
		obj.type = 'img';
		return this.elem(obj);
	},
	div: function(obj) {
		obj.type = 'div';
		return this.elem(obj);
	},
	style: function(obj) {
		return this.styleTemp(obj);
	},
	elemTemp: _.template("<<%= type%><% for (var attr in attrs) { %><%= ' ' + attr %>='<%= attrs[attr].join(' ') %>'<% } %><%= style ? ' ' : '' %><%= templater.style({style: style}) %>><%= innerHTML %></<%= type %>>"),
	styleTemp: _.template("<% if (!style) {return ''} %>style='<% for (var stylet in style) { %><%= stylet %>:<%= style[stylet] %>;<% } %>'")
}

