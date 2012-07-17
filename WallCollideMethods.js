function WallCollideMethods(level){}

WallCollideMethods.prototype = {
	cPAdiabaticDamped: function(dot, line, wallUV, perpV, perpUV, extras){
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
		var vo = dot.v.copy();
		var vo1 = dot.v.dy;
		var vo2 = this.wallV;
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
			this.wallV = (m1*vo1 + m2*vo2 - m1*dot.v.dy)/(m2*scalar);
		}else{
			var pt = walls.pts[line[0]][line[1]];
			dot.v.dy = (vo1*(m1-m2)+2*m2*vo2)/(dot.m+m2);
			this.wallV = (vo2*(m2-m1)+2*m1*vo1)/(m2+m1);
			dot.y = pt.y+dot.r;			
		}
		this.forceInternal += dot.m*(Math.abs(perpV) + Math.abs(dot.v.dy));
		if(extras){
			extras.apply(this, [{pos:P(dot.x, dot.y), vo:vo, vf:dot.v.copy(), dot:dot, perpV:perpV}]);
		}
	},	
	staticAdiabatic: function(dot, line, wallUV, perpV, perpUV, extras){
		var vo = dot.v.copy();
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		if(extras){
			extras.apply(this, [{pos:P(dot.x, dot.y), vo:vo, vf:dot.v.copy(), dot:dot, perpV:perpV}]);
		}
	},
	cVIsothermal: function(dot, line, wallUV, perpV, perpUV, extras){
		var vo = dot.v.copy();
		var perpUV = walls.wallPerpUVs[line[0]][line[1]]
		dot.y+=perpUV.dy;
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		if(extras){
			extras.apply(this, [{pos:P(dot.x, dot.y), vo:vo, vf:dot.v.copy(), dot:dot, perpV:perpV}]);
		}
	},
	cVAdiabatic: function(dot, line, wallUV, perpV, perpUV, extras){
		var vo = dot.v.copy();
		dot.v.dy = -vo.dy + 2*this.wallV;
		this.forceInternal += dot.m*(perpV + dot.v.dy);
		if(extras){
			extras.apply(this, [{pos:P(dot.x, dot.y), vo:vo, vf:dot.v.copy(), dot:dot, perpV:perpV}]);
		}
	},
	changeWallSetPt: function(dest, compType){
		var wall = walls.pts[0]
		var wallMoveMethod;
		if(compType=='isothermal'){
			var wallMoveMethod = this.cVIsothermal;
		} else if (compType=='adiabatic'){
			var wallMoveMethod = this.cVAdiabatic;
		}
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var getY = function(){
			return walls.pts[0][0].y;
		}
		
		var dist = dest-getY();
		if(dist!=0){
			var sign = getSign(dist);
			this.wallV = this.wallSpeed*sign;
			walls.setSubWallHandler(0, 0, {func:wallMoveMethod, obj:this});
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, this.wallV))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
						walls.setSubWallHandler(0, 0, {func:this.staticAdiabatic, obj:this});
						this.wallV = 0;
					}
				},
			this);
		}
	},
	////////////////////////////////////////////////////////////
	//EXTRAS
	////////////////////////////////////////////////////////////
	drawArrow: function(hitResult){
		var perpV = hitResult.perpV;
		var arrowPts = new Array(3);
		arrowPts[0] = hitResult.pos.copy().movePt(hitResult.vo.copy().mult(10).neg());
		arrowPts[1] = hitResult.pos;
		arrowPts[2] = hitResult.pos.copy().movePt(hitResult.vf.copy().mult(10));
		var lifeSpan = 50;
		var arrowTurn = 0;
		var arrow = new Arrow(arrowPts, Col(255,0,0),c);
		addListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y,
			function(){
				arrow.draw();
				arrowTurn++;
				if(arrowTurn==lifeSpan){
					removeListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y);
				}
			},
		this);//could be ''.  Do after other stuff is working.
		var textPos = hitResult.pos.copy().movePt(hitResult.vf.mult(15));
		var delV = 2*perpV*pxToMS;
		animText({pos:textPos, col:Col(255,255,255), rotation:0, size:13}, 
				{pos:textPos.copy().movePt({dy:-20}), col:this.bgCol},
				'calibri', 'deltaV = '+round(delV,1)+'m/s', 'center', 3000, c
		);
	}	
}