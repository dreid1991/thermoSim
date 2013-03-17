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
		}
	},
	MathExtenders:{
		log10: function(val){
			return Math.log(val)/2.302585092994045684017;	//log(10)
		},

	},
	StringExtenders:{
		killWhiteSpace: function() {
			return this.replace(/\s+/g, '');
		},
		killNumbers: function() {
			return this.replace(/[0-9]/g, '');
		},
		toCamelCase: function() {
			 return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
				return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
			  }).replace(/\s+/g, '');
		},
		toCapitalCamelCase: function() {
			 return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
				return letter.toUpperCase();
			  }).replace(/\s+/g, '');		
		},
		sanitize: function() {
			return this.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/</g, '&#60;').replace(/>/g, '&#62;').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
		}
	},
	ArrowFuncs: {
		getPts: function(){
			var pts = new Array(3);
			var dx = this.dims.dx;
			var dy = this.dims.dy;
			pts[0] = P(0, .2*dy);
			pts[1] = P(.7*dx, .2*dy);
			pts[2] = P(.7*dx, .5*dy);
			var ptsReverse = deepCopy(pts).reverse();
			pts.push(P(dx, 0));
			
			for (var ptIdx=0; ptIdx<ptsReverse.length; ptIdx++){
				pts.push(P(ptsReverse[ptIdx].x, -ptsReverse[ptIdx].y));
			}
			//rotatePts(pts, P(0,0), this.dir);
			return pts;		
		},
	}
}
