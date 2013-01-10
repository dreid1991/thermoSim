function Templater() {
 //need to make it add globalHTMLClass
}

Templater.prototype = {
	elem: function(obj) {
		obj.attrs = obj.attrs || {};
		obj.style = obj.style || undefined;
		obj.innerHTML = obj.innerHTML || '';
		//maybe just make class attribute in attrs with [] by default
		return this.elemTemp(obj);
	},
	style: function(obj) {
		return this.styleTemp(obj);
	},
	elemTemp: _.template("<<%= type %><% for (var attr in attrs) { %> <%= attr %>='<%= attrs[attr].join(' ') %>'<% } %> <%= templater.style({style: style}) %>><%= innerHTML %></<%= type %>>"),
	styleTemp: _.template("<% if (!style) {return ''} %>style='<% for (var stylet in style) { %><%= stylet %>=<%= style[stylet] %>; <% } %>'")
}

