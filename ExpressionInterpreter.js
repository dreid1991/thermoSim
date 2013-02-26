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
		return text.replace(/get[\s]*\([A-Za-z0-9,\s\-\.]*\)/g, function(subStr, idx) {
			var args = this.sliceArgs(subStr);
			var idStr = args[0];
			var type = args[1];
			var defVal = args[2];
			var min = Number(args[3]);
			var max = Number(args[4]);
			var isInt = type == 'int';
			var isFloat = type == 'float';
			var isNum = isInt || isFloat;
			var isStr = type == 'string';
			if (type == 'int' || type == 'float') defVal = Number(defVal);
			
			var gotten = getStore(idStr);
			var val;
			if (gotten) {
				if (isInt) {
					val = Math.round(parseFloat(gotten));
				} else if (isFloat) {
					val = parseFloat(gotten);
				} else if (isStr) {
					val = gotten.sanitize();
				}
				if (isNum) {
					if (min === undefined || isNaN(min)) min = val;
					if (max === undefined || isNaN(max)) max = val;
					val = Math.max(min, Math.min(max, val));
				}
			}
			
			if (val === undefined || isNaN(val)) {
				val = defVal;
			}
			return val;
		})	
	},
	eval: function(text) {
		if (typeof text == 'number') return;
		text = text.replace(/eval[\s]*\([0-9\(\)\+\-\*\/\s,\.]*\)/g, function(evalItem, idx) {
			var args = this.sliceArgs(evalItem);
			var expr = args[0];
			var decPlaces = args[1];
			var def = args[2];
			var min = args[3];
			var max = args[4];
			var val;
			try {
				val = eval(expr);
			} catch(e) {
				console.log('Bad eval ' + evalItem + ', expr is ' + expr);
			}
			
			val = Math.max(min, Math.min(max, val));
			if (val === undefined || isNaN(val) && def !== undefined && !isNaN(def)) {
				val = def;
			}
			if (val !== undefined && !isNaN(val)) { //my round doesn't have any error handling, so need to do that here
				if (min === undefined || isNaN(min)) min = val;
				if (max === undefined || isNaN(max)) max = val;
				if (decPlaces > 0 || decPlaces === 0) val = round(val, Math.round(decPlaces));
			}
			return val;
		})
		var toReturn = Number(text) == text ? Number(text) : text;
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
		var self = this;
		return text.replace(/img[\s]*\([A-Za-z0-9\+\-\*\/\s,\.]*\)/g, function(imgFunc, idx) {
			return self.parseImgFunc(imgFunc);
		})
	},
	
//MAKE WORK WITH AUXIMAGE
	//external func
	parseImgFunc: function(imgFunc, asObj) {
		var args = this.sliceArgs(imgFunc);
		var path = args[0];
		var breakStyle = args[1];
		var center = args[2];
		if (asObj) {
			//HEY - as obj currently only return image, no p, br, or centering.  
			//It is they way because of AuxPicture.  Look into that before making changes here
			return {attrs: {src: [path]}};
	
		} else {
			var imgHTML = templater.img({attrs: {src: [path]}});
			
			if (center) {
				imgHTML = templater.center({innerHTML: ingHTML});
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