function WallCollideMethods(level){}

WallCollideMethods.prototype = {
	cPAdiabaticDamped: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		/*
		To dampen wall speed , doing:
		1 = dot
		2 = wall
		m1vo1^2 + m2vo2^2 = m1v1^2 + m2v2^2
		m1vo1 + m2vo2 = m1v1 + A*m2v2
		where A = (abs(wallV)+1)^(const, maybe .1 to .3)
		leads to
		a = m1 + m1^2/(A^2m2)
		b = -2*vo1*m1^2/(A^2m2) - 2*vo2*m1/A^2
		c = m1^2*vo1^2/(A^2*m2) + 2*m1*vo2*vo1/A^2 + m2*(vo2/A)^2 - m1*vo1^2 - m2*vo2^2
		I recommend grouping squared terms in each block for faster computation
		v1 = (-b + (b^2 - 4*a*c)^.5)/2a
		v2 = (m1*vo1 + m2*vo2 - m1*v1)/(m2*A)
		*/
		var wall = walls[wallIdx];
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.v;
		var m1 = dot.m;
		var m2 = this.mass()
		if(Math.abs(vo2)>1.0){
			var vo1Sqr = vo1*vo1;
			var vo2Sqr = vo2*vo2;
			
			var scalar = Math.pow(Math.abs(vo2)+.1, .2);
			var scalarSqr = scalar*scalar
			
			var a = m1*(1 + m1/(scalarSqr*m2));
			var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
			var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
			
			dot.v.dy = (-b + Math.pow(b*b - 4*a*c,.5))/(2*a);
			dot.y = dot.y+dot.r;
			wall.v = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
		}else{
			var pt = walls[wallIdx][subWallIdx];
			dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;			
		}
		this.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},	
	cPAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		
		var wall = walls[wallIdx];
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.v;
		var m1 = dot.m;
		var m2 = this.mass()	
		var pt = wall[subWallIdx];
		dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
		wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
		dot.y = pt.y+dot.r;		
		this.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},
	staticAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		this.reflect(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
	},
	cVIsothermal: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		dot.y+=perpUV.dy;
		this.reflect(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		//this is really not correct, but it's not in use yet, so...
	},
	cVAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		var v = dot.v;
		v.dy = -v.dy + 2*walls[wallIdx].v;
		this.forceInternal += dot.m*(perpV + v.dy);
	},
	reflect: function(dot, wallUV, perpV){
		dot.v.dx -= 2*wallUV.dy*perpV;
		dot.v.dy += 2*wallUV.dx*perpV;
		dot.x -= wallUV.dy
		dot.y += wallUV.dx
	},

}