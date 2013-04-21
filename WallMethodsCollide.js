
//////////////////////////////////////////////////////////////////////////
//COLLIDE METHODS
//////////////////////////////////////////////////////////////////////////
WallMethods.collideMethods ={
//32 denotes converting from cv of R to 3/2 R NOT ANYMORE IT DOESN'T!
	// cPAdiabaticDamped: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		// /*
		// To dampen wall speed , doing:
		// 1 = dot
		// 2 = wall
		// m1vo1^2 + m2vo2^2 = m1v1^2 + m2v2^2
		// m1vo1 + m2vo2 = m1v1 + A*m2v2
		// where A = (abs(wallV)+1)^(const, maybe .1 to .3)
		// leads to
		// a = m1 + m1^2/(A^2m2)
		// b = -2*vo1*m1^2/(A^2m2) - 2*vo2*m1/A^2
		// c = m1^2*vo1^2/(A^2*m2) + 2*m1*vo2*vo1/A^2 + m2*(vo2/A)^2 - m1*vo1^2 - m2*vo2^2
		// I recommend grouping squared terms in each block for faster computation
		// v1 = (-b + (b^2 - 4*a*c)^.5)/2a
		// v2 = (m1*vo1 + m2*vo2 - m1*v1)/(m2*A)
		// */
		// var wall = this[wallIdx];
		// var vo = dot.v.copy();
		// var vo1 = dot.v.dy;
		// var vo2 = wall.v;
		// var m1 = dot.m;
		// var m2 = wall.mass;
		// var absWallV = Math.abs(vo2);
		
		// if (absWallV > 1) {
			// var vo1Sqr = vo1*vo1;
			// var vo2Sqr = vo2*vo2;
			// //var scalar = Math.pow(Math.abs(vo2)+.1, .2);
			// var scalar = .0017*absWallV*absWallV*absWallV - .0281*absWallV*absWallV + .205*absWallV + .8466;
			// //polynomial fit to above function for fasterness.
			// var scalarSqr = scalar*scalar;
			
			// var a = m1*(1 + m1/(scalarSqr*m2));
			// var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
			// var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
			
			// dot.v.dy = (-b + Math.pow(b*b - 4*a*c,.5))/(2*a);
			// dot.y = dot.y+dot.r;
			// wall.v = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
		// }else{
			// var pt = walls[wallIdx][subWallIdx];
			// dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			// wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			// dot.y = pt.y+dot.r;			
		// }
		// wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	// },	
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
		var tempO = dot.temp();
		var dotVyF;
		var wall = this[wallIdx];
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.v;
		var m1 = dot.m;
		var m2 = wall.mass;
		var absWallV = Math.abs(vo2);
		
		if (absWallV > 1) {
			var vo1Sqr = vo1*vo1;
			var vo2Sqr = vo2*vo2;
			//var scalar = Math.pow(Math.abs(vo2)+.1, .2);
			var scalar = .0017*absWallV*absWallV*absWallV - .0281*absWallV*absWallV + .205*absWallV + .8466;
			//polynomial fit to above function for fasterness.
			var scalarSqr = scalar*scalar;
			
			var a = m1*(1 + m1/(scalarSqr*m2));
			var b = -2*m1*(vo1*m1/(m2) + vo2)/scalarSqr;
			var c = (m1*(m1*vo1Sqr/m2 + 2*vo2*vo1) + m2*vo2Sqr)/scalarSqr - m1*vo1Sqr - m2*vo2Sqr;
			
			dotVyF = (-b + Math.sqrt(b*b - 4*a*c))/(2*a);
			dot.y = dot.y+dot.r;
			wall.v = (m1*vo1 + m2*vo2 - m1*dotVyF)/(m2*scalar);
		} else {
			var pt = walls[wallIdx][subWallIdx];
			dotVyF = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;			
		}
		var tempUnAdj = tConst * .5 * dot.m * (dot.v.dx*dot.v.dx + dotVyF*dotVyF); //with cv = R
		dot.setTemp(tempO + (tempUnAdj - tempO) * dot.cvKinetic / dot.cv);
		if (dot.v.dy * dotVyF < 0) dot.v.dy *= -1;
		// var ratio = Math.sqrt((KEo + 2*(KEf - KEo)/3)/KEf);
		// dot.v.dx*=ratio;
		// dot.v.dy*=ratio;
		wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},	
	// cPAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		// var wall = this[wallIdx];
		// var vo = dot.v.copy();
		// var vo1 = dot.v.dy;
		// var vo2 = wall.v;
		// var m1 = dot.m;
		// var m2 = wall.mass;	
		// var pt = wall[subWallIdx];
		// dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
		// wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
		// dot.y = pt.y+dot.r;		
		// wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	// },
	cPAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		var tempO = dot.temp();
		var dotVyF;
		var wall = this[wallIdx];
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.v;
		var m1 = dot.m;
		var m2 = wall.mass;
		var pt = wall[subWallIdx];
		dotVyF = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
		wall.v = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
		dot.y = pt.y+dot.r;		
		var tempUnAdj = tConst * .5 * dot.m * (dot.v.dx*dot.v.dx + dotVyF*dotVyF); //with cv = R
		dot.setTemp(tempO + (tempUnAdj - tempO) * dot.cvKinetic / dot.cv);
		if (dot.v.dy * dotVyF < 0) dot.v.dy *= -1;
		wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},
	staticAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		this.reflect(dot, wallUV, perpV);
		this[wallIdx].forceInternal += 2*dot.m*Math.abs(perpV);
	},
	cVIsothermal: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		if (this[wallIdx].eToAdd) {
			var eAddSign = getSign(this[wallIdx].eToAdd);
			var inTemp = dot.temp();
			var eToAdd = eAddSign * Math.min(Math.abs(this[wallIdx].eToAdd), dot.cv * 20);
			if (eToAdd < 0 && inTemp  <= 20) 
				eToAdd = -(Math.max(0, inTemp - 1)) * dot.cv;

			this[wallIdx].eToAdd -= eToAdd;
			var outTemp = inTemp + eToAdd / dot.cv;
			var spdRatio = Math.sqrt(outTemp/inTemp);
			var outPerpV = perpV*spdRatio;
			this.reflect(dot, wallUV, perpV);
			dot.v.dx*=spdRatio;
			dot.v.dy*=spdRatio;
			dot.internalPotential *= outTemp / inTemp;
			this[wallIdx].forceInternal += dot.m*(Math.abs(perpV) + Math.abs(outPerpV));
			this[wallIdx].q += eToAdd*JtoKJ;
		} else {
			this[wallIdx].forceInternal += 2 * dot.m * Math.abs(perpV);
			this.reflect(dot, wallUV, perpV);
		}
	},
	// cVAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		// var v = dot.v;
		// v.dy = -v.dy + 2*walls[wallIdx].v;
		// this[wallIdx].forceInternal += dot.m*(perpV + v.dy);
	// },
	cVAdiabatic: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV, extras){
		var tempO = dot.temp();
		var v = dot.v;
		var dotVyF = -v.dy + 2*walls[wallIdx].v;
		this[wallIdx].forceInternal += 2 * dot.m * perpV;
		var tempUnAdj = tConst * .5 * dot.m * (dot.v.dx*dot.v.dx + dotVyF*dotVyF); //with cv = R
		dot.setTemp(tempO + (tempUnAdj - tempO) * dot.cvKinetic / dot.cv);
		if (dot.v.dy * dotVyF < 0) dot.v.dy *= -1;

	},
	reflect: function(dot, wallUV, perpV){
		dot.v.dx -= 2*wallUV.dy*perpV;
		dot.v.dy += 2*wallUV.dx*perpV;
		dot.x -= wallUV.dy
		dot.y += wallUV.dx
	},
	outlet: function(dot) {
		dotManager.remove(dot);
	}
	/*
	reflectChangeSpd: function(dot, wallUV, perpVIn, perpVOut){
		dot.v.dx -= wallUV.dy*perpVIn + wallUV.dy*perpVOut;
		dot.v.dy += wallUV.dx*perpVIn + wallUV.dx*perpVOut;
		dot.x -= wallUV.dy
		dot.y += wallUV.dx		
	},
	*/
}
