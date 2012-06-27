function animText(init, dest, font, text, align, time, drawCanvas){
	//need unique listener name;
	var numTurns = Math.floor(time/updateInterval);
	var animName = 'anim' + Math.floor(Math.random()*10000);
	
	var moving = new Boolean();
	var changingCol = new Boolean();
	var rotating = new Boolean();
	var changingSize = new Boolean();
	
	moving = dest.pos!==undefined;
	changingCol = dest.col!==undefined;
	rotating = dest.rotaion!==undefined;
	changingSize = dest.size!==undefined;
	var cur = {};
	cur.pos = init.pos.copy();
	cur.col = init.col.copy();
	cur.rot = init.rotation;
	cur.size = init.size;
	
	var funcMove = function(){};
	var funcCol = function(){};
	var funcRot = function(){};
	var funcSize = function(){};
	var speedMove;
	//FINISH MAKING SPEEDS IN THIS DOMAIN, NOT IN THE IF's DOMAINS
	if(moving){
		var path = V(dest.pos.x - init.pos.x, dest.pos.y - init.pos.y)
		var dist = path.UV();
		var speedMove = dist.mult(path.mag())/numTurns;
		funcMove = function(){
			cur.pos.x += speedMove.dx;
			cur.pos.y += speedMove.dy;
		}
	}
	if(changingCol){
		var stepR = Math.ceil((dest.col.r-init.col.r)/numTurns);
		var stepG = Math.ceil((dest.col.g-init.col.g)/numTurns);
		var stepB = Math.ceil((dest.col.b-init.col.b)/numTurns);
		funcCol = function(){
			cur.col.r += stepR;
			cur.col.g += stepG;
			cur.col.b += stepB;
		}
	}
	if(rotating){
		var arcLen = dest.rotation-init.rotation;
		var stepRot;
		if(arcLen<=Math.PI){
			stepRot = arcLen/numTurns;
		}else{
			stepRot = -arcLen/numTurns;
		}
		funcRot = function(){
			cur.rot += stepRot;
		}
	}
	if(changingSize){
		var sizeChange = dest.size - init.size;
		var stepSize = sizeChange/numTurns;
		funcSize = function(){
			cur.size+=stepSize;
		}
	}
	var turn = 0
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
	
			
}