toInherit = {
	gridder:{
		makeGrid: function(){
			var numCols = this.numCols;
			var numRows = this.numRows;
			var grid = new Array(numCols)
			for (var colIdx=0; colIdx<numCols; colIdx++) {
				var col = new Array(numRows)
				for (var rowIdx=0; rowIdx<numRows;rowIdx++) {
					col[rowIdx] = [];
				}
				grid[colIdx] = col;
			}
			return grid;
		},	
	},
	ArrayExtenders:{
		pushNumber: function(number){
			if(!isNaN(number) && number!==undefined) {
				this.push(number);
			}
			return this;
		},
		append: function(b){
			for (var idx=0; idx<b.length; idx++) {
				this.push(b[idx]);
			}
			return this;
		},
		average: function() {
			var total = 0;
			for (var idx=0; idx<this.length; idx++) {
				total+=this[idx];
			}
			return total/this.length;
		},
		switchElements: function(idx1, idx2) {
			var obj1 = this[idx1];
			var obj2 = this[idx2];
			this[idx1] = obj2;
			this[idx2] = obj1;	
			return this;
		},
		applyFunc: function(func) {
			for (var idx=0; idx<this.length; idx++) {
				func(this[idx]);
			}
		}
	},
	MathExtenders:{
		log10: function(val){
			return Math.log(val)/Math.log(10);	
		},

	},
	StringExtenders:{
		killWhiteSpace: function() {
			return this.replace(/\s/g, '');
		},
		killNumbers: function() {
			return this.replace(/[0-9]/g, '');
		}
	}
}
