/*
get(idStr, type ('int', 'float', 'string'), default, min, max)
eval(expr, decPlaces, default, min, max)
img(path, breakStyle (p, br), center (boolean))
*/

function ExpressionInterpreter() {
	
	
}

ExpressionInterpreter.prototype = {
	html: function(div, expr) {
		$(div).html(this.addImgs(this.eval(this.addStored(expr))));
		this.renderMath(div);
	},
	append: function(div, expr) {
		$(div).append(this.addImgs(this.eval(this.addStored(expr))));
		this.renderMath(div);
	},
	interpInput: function(expr) {
		return this.eval(this.addStored(expr));
	},
	interpImgs: function(expr) {
		return this.addImgs(expr);
	},
	interp: function(expr) {
		return this.addImgs(this.eval(this.addStored(expr)));
	},
	renderMath: function(div) {
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, div ? $(div).attr('id') : undefined])
	},
	addStored: function(text) {
		var get = DataGetFuncs.get;

		return text.replace(/get[\s]*\([A-Za-z0-9,\s\-\.'"]*\)/g, function(subStr, idx) {
			return eval(subStr);
		})	
	},
	eval: function(text) {
		if (typeof text == 'number') return text;
		text = text.replace(/eval[\s]*\([0-9\(\)\+\-\*\/\s,\.'"]*\)/g, function(evalItem, idx) {
			return eval(evalItem);
		})
		var toReturn = Number(text) === text ? Number(text) : text;
		return toReturn;
	},
	sliceArgs: function(expr) {
		var args = [];
		var working = expr;
		working = working.replace(/[A-Za-z0-9\s-]*\(/, '');
		working = working.replace(')', '');
		working += ','; //if you'll pardon the slop, just adding a comma to the end is a really easy way to make the below function work for the last argument in a function
		var hasCommas = working.indexOf(',') > -1;
		while (hasCommas) {
			var idx = working.indexOf(',');
			args.push(working.slice(0, idx).killWhiteSpace());
			working = working.slice(idx + 1, working.length);
			hasCommas = working.indexOf(',') > -1;
		}
		return args;	
	},
	finishAppend: function() {
		this.div = undefined; 
		this.addedMath = false;
	},
	addImgs: function (text, asObj){
		var img = DataGetFuncs.img;
		return text.replace(/img[\s]*\([A-Za-z0-9\+\-\*\/\s,\.'"]*\)/g, function(imgExpr, idx) {
			return eval(imgExpr);
		})
	},
	
//MAKE WORK WITH AUXIMAGE
	//external func
	parseImgFunc: function(imgFunc, asObj) {
		var args = this.sliceArgs(imgFunc);
		var path = args[0];
		var breakStyle = args[1];
		var center = args[2];
		path = path.replace(/['"]/g, '');
		if (asObj) {
			//HEY - as obj currently only return image, no p, br, or centering.  
			//It is they way because of AuxPicture.  Look into that before making changes here
			return {attrs: {src: [path]}};
	
		} else {
			var imgHTML = templater.img({attrs: {src: [path]}});
			
			if (center) {
				imgHTML = templater.center({innerHTML: imgHTML});
			}
			if (breakStyle == 'br') {
				imgHTML = templater.br() + imgHTML + templater.br();
			} else if (breakStyle == 'p') {
				imgHTML = templater.p({innerHTML: imgHTML});
			}
			return imgHTML;	
		}
	},

	
	
}