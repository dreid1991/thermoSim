function AnimText(drawCanvas){
	this.drawCanvas = drawCanvas;
}
AnimText.prototype = {
	newAnim: function(init, dest, attrs){
		
		var animName = unique('animText', curLevel.updateListeners.listeners);
		//font, text, align, time
		var text = attrs.text;
		var moving = new Boolean();
		var changingCol = new Boolean();
		var rotating = new Boolean();
		var changingSize = new Boolean();
		
		moving = dest.pos!==undefined;
		changingCol = dest.col!==undefined;
		rotating = dest.rotation!==undefined;
		changingSize = dest.size!==undefined;
		var defaults = {};
		//defaults
		defaults.col = Col(255, 255, 255);
		defaults.rot = 0;
		defaults.size = 13;
		defaults.time = 300;
		defaults.align = 'center';
		defaults.font = 'calibri';
		
		var font = defaultTo(defaults.font, attrs.font);
		var align = defaultTo(defaults.align, attrs.align);
		var time = defaultTo(defaults.time, attrs.time);
		
		var cur = {};
		
		init.size = defaultTo(defaults.size, init.size);
		init.rot = defaultTo(defaults.rot, init.rot);
		init.col = defaultTo(defaults.col, init.col);
		
		cur.size = init.size;
		cur.rot = init.rot;
		cur.col = init.col;
		//only necessary init attr
		cur.pos = init.pos.copy();
		
		var numTurns = Math.floor(time/updateInterval);	
		
		var funcMove = function(){};
		var funcCol = function(){};
		var funcRot = function(){};
		var funcSize = function(){};
		var speedMove;
		var speedChangeCol = {};
		var speedRotate;
		var speedSizeChange;
		if(moving){
			var path = V(dest.pos.x - init.pos.x, dest.pos.y - init.pos.y)
			var dir = path.UV();
			var speedMove = dir.mult(path.mag()/numTurns);
			funcMove = function(){
				cur.pos.x += speedMove.dx;
				cur.pos.y += speedMove.dy;
			}
		}
		if(changingCol){
			speedChangeCol.r = Math.ceil((dest.col.r-init.col.r)/numTurns);
			speedChangeCol.g = Math.ceil((dest.col.g-init.col.g)/numTurns);
			speedChangeCol.b = Math.ceil((dest.col.b-init.col.b)/numTurns);
			funcCol = function(){
				cur.col.adjust(speedChangeCol.r, speedChangeCol.g, speedChangeCol.b);
			}
		}
		
		if(rotating){
			var arcLen = dest.rotation-init.rotation;
			if(arcLen<=Math.PI){
				speedRotate = arcLen/numTurns;
			}else{
				speedRotate = -arcLen/numTurns;
			}
			funcRot = function(){
				cur.rot += speedRotate;
			}
		}
		if(changingSize){
			var sizeChange = dest.size - init.size;
			speedSizeChange = sizeChange/numTurns;
			funcSize = function(){
				cur.size+=speedSizeChange;
			}
		}
		
		var turn = 0
		var drawCanvas = this.drawCanvas;
		addListener(curLevel, 'update', animName, 
			function(){
				var curFont = Math.floor(cur.size) + 'pt ' + font;
				draw.text(text, cur.pos, curFont, cur.col, align, cur.rot, drawCanvas);
				funcMove();
				funcCol();
				funcRot();
				funcSize()
				if(turn==numTurns){
					removeListener(curLevel, 'update', animName);
				}
				turn++;
			},
		'');	
		
	},
}
