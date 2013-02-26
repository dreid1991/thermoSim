function ExpressionInterpreter() {
	
	
}

ExpressionInterpreter.prototype = {
	append: function(expr, div) {
		this.addedMath = false;
		expr = this.eval(this.getStored(expr));
		this.finishAppend();
	},
	getStored: function() {
	
	}
	finishAppend: function() {
		this.div = undefined;
		this.addedMath = false;
	},
	
}