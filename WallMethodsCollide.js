/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


//////////////////////////////////////////////////////////////////////////
//COLLIDE METHODS
//////////////////////////////////////////////////////////////////////////
WallMethods.collideMethods ={
	cPAdiabaticDamped: function(dot, wall, subWallIdx, wallUV, perpV, perpUV, distPastWall){
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
		var KEO = .5 * dot.m * (dot.v.dx * dot.v.dx + dot.v.dy * dot.v.dy);
		var dotVyF;
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.vs[subWallIdx].dy;
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
			wall.vs[0].dy = (m1*vo1 + m2*vo2 - m1*dotVyF)/(m2*scalar);
			wall.vs[1].dy = wall.vs[0].dy;
		} else {
			var pt = wall[subWallIdx];
			dotVyF = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			wall.vs[0].dy  = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			wall.vs[1].dy  = wall.vs[0].dy;
			dot.y = pt.y+dot.r;			
		}
		var KEF = .5 * dot.m * (dot.v.dx * dot.v.dx + dotVyF * dotVyF);
		var ratio = Math.sqrt((KEO + 2 * (KEF - KEO) / 3) / KEF);
		dotVyF *= ratio;
		dot.v.dx *= ratio;
		var tempUnAdj = tConst * .5 * dot.m * (dot.v.dx*dot.v.dx + dotVyF*dotVyF); //with cv = R
		dot.setTemp(tempO + (tempUnAdj - tempO) * dot.cvKinetic / dot.cv);
		if (dot.v.dy * dotVyF < 0) dot.v.dy *= -1;
		// var ratio = Math.sqrt((KEo + 2*(KEf - KEo)/3)/KEf);
		// dot.v.dx*=ratio;
		// dot.v.dy*=ratio;
		wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},	
	cPAdiabatic: function(dot, wall, subWallIdx, wallUV, perpV, perpUV, distPastWall){
		var tempO = dot.temp();
		var dotVyF;
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = wall.vs[subWallIdx].dy;
		var m1 = dot.m;
		var m2 = wall.mass;
		var pt = wall[subWallIdx];
		dotVyF = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
		wall.vs[0].dy = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
		wall.vs[1].dy = wall.vs[0].dy;
		dot.y = pt.y+dot.r;		
		var ratio = Math.sqrt((KEO + 2 * (KEF - KEO) / 3) / KEF);
		dotVyF *= ratio;
		dot.v.dx *= ratio;
		var tempUnAdj = tConst * .5 * dot.m * (dot.v.dx*dot.v.dx + dotVyF*dotVyF); //with cv = R
		dot.setTemp(tempO + (tempUnAdj - tempO) * dot.cvKinetic / dot.cv);
		if (dot.v.dy * dotVyF < 0) dot.v.dy *= -1;
		wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
	},
	staticAdiabatic: function(dot, wall, subWallIdx, wallUV, perpV, perpUV, distPastWall) {
		this.reflect(dot, wallUV, perpV, distPastWall);
		wall.forceInternal += 2*dot.m*Math.abs(perpV);
	},
	cVIsothermal: function(dot, wall, subWallIdx, wallUV, perpV, perpUV, distPastWall) {
		if (wall.eToAdd) {
			var eAddSign = getSign(wall.eToAdd);
			var inTemp = dot.temp();
			var eToDot = eAddSign * Math.min(Math.abs(wall.eToAdd), dot.cv * 20 * wall.isothermalRate);
			if (eToDot < 0 && inTemp  <= 20 * wall.isothermalRate) 
				eToDot = -(Math.max(0, inTemp - 1)) * dot.cv;

			wall.eToAdd -= eToDot;
			var outTemp = inTemp + eToDot / dot.cv;
			var spdRatio = Math.sqrt(outTemp/inTemp);
			var outPerpV = perpV*spdRatio;
			this.reflect(dot, wallUV, perpV, distPastWall);
			dot.v.dx*=spdRatio;
			dot.v.dy*=spdRatio;
			dot.internalPotential *= outTemp / inTemp;
			wall.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(outPerpV));
			wall.q += eToDot*JtoKJ;
		} else {
			wall.forceInternal += 2 * dot.m * Math.abs(perpV);
			this.reflect(dot, wallUV, perpV, distPastWall);
		}
	},
	cVAdiabatic: function(dot, wall, subWallIdx, wallUV, perpV, perpUV, distPastWall){
		/*
		This is usually used for just one molecule, so the correct heat transfer behavior is not really important.
		The heat capacity adjustment can lead to the dot's speed converging to the wall's speed, which makes it constantly hit the wall and look funny
		It behaves fine in a many-molecule case, but in this case, just doing an elastic collision is better
		*/
		//walls only move in y right now...
		dot.v.dy = -dot.v.dy + 2 * wall.vs[subWallIdx].dy;
		
	},
	reflect: function(dot, wallUV, perpV, distPastWall) {
		dot.v.dx -= 2*wallUV.dy*perpV;
		dot.v.dy += 2*wallUV.dx*perpV;
		//for two sided walls
		// if (dot.v.dx * -wallUV.dy + dot.v.dy * wallUV.dx >= 0) {
			// dot.x += 2 * -wallUV.dy * dot.r;
			// dot.y += 2 * wallUV.dx * dot.r;
		// } else {
			// dot.x -= 2 * -wallUV.dy * dot.r;
			// dot.y -= 2 * wallUV.dx * dot.r;
		// }
		dot.x -= wallUV.dy * distPastWall;
		dot.y += wallUV.dx * distPastWall;
	},
	outlet: function(dot) {
		dotManager.remove(dot);
	}
}
