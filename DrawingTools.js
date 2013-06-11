function DrawingTools(){};

DrawingTools.prototype = {

	dots: function(ctx){
		for (var spcName in spcs) {
			var dots = spcs[spcName].dots;
			ctx.fillStyle = spcs[spcName].col.hex;
			if (dots[0]) {
				var r = dots[0].r;//from 5250ms/500 -> 4975 ms/500.  also don't define dot locally
			}
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++) {
				ctx.beginPath();
				ctx.arc(dots[dotIdx].x, dots[dotIdx].y, r, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();	
			}
		}
	},
	dotsAsst: function(dots, ctx) {
		for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
			ctx.fillStyle = spcs[dots[dotIdx].spcName].col.hex;
			ctx.beginPath();
			ctx.arc(dots[dotIdx].x, dots[dotIdx].y, dots[dotIdx].r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}
	},
	walls: function(walls, ctx){
		for (var wallIdx=0; wallIdx<walls.length; wallIdx++) {
			var wall = walls[wallIdx];
			if (wall.show) {
				ctx.beginPath();
				ctx.strokeStyle = wall.col.hex;
				ctx.moveTo(wall[0].x, wall[0].y);
				for (var ptIdx=1; ptIdx<wall.length-1; ptIdx++){
					ctx.lineTo(wall[ptIdx].x, wall[ptIdx].y);
				}
				ctx.closePath();
				ctx.stroke();
			}
		}
	},
	circle: function(pos, r, col, fill, ctx) {

		
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, r, 0, Math.PI*2, true);
		ctx.closePath();
		if (fill) {
			ctx.fillStyle = col.hex;
			ctx.fill();	
		} else {
			ctx.strokeStyle = col.hex;
			ctx.stroke();
		}
	},
	fillPts: function(pts, col, ctx) {
		ctx.fillStyle = col.hex;
		ctx.beginPath();
		ctx.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++) {
			ctx.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		ctx.closePath();
		ctx.fill();
	},
	fillPtsAlpha: function(pts, col, alpha, ctx) {
		var prevAlpha = ctx.globalAlpha;
		ctx.globalAlpha = alpha;
		draw.fillPts(pts, col, ctx);
		ctx.globalAlpha = prevAlpha;
	},
	fillPtsStroke: function(pts, fillCol, strokeCol, ctx) {
		ctx.fillStyle = fillCol.hex
		ctx.strokeStyle = strokeCol.hex
		ctx.beginPath();
		ctx.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			ctx.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	},
	roundedRect: function(pos, dims, r, col, ctx) {
		var x = pos.x;
		var y = pos.y;
		var width = dims.dx;
		var height = dims.dy;
		ctx.fillStyle = col.hex
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		this.curvedLine(P(x+width-r, y), P(x+width, y), P(x+width, y+r), ctx);
		this.curvedLine(P(x+width, y+height-r), P(x+width, y+height), P(x+width-r, y+height), ctx);
		this.curvedLine(P(x+r, y+height), P(x, y+height), P(x, y+height-r), ctx);
		this.curvedLine(P(x, y+r), P(x, y), P(x+r, y), ctx);
		ctx.closePath();
		ctx.fill();
		
	},
	fillRect: function(corner, dims, fillCol, ctx) {
		ctx.fillStyle = fillCol.hex
		ctx.fillRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	fillStrokeRect: function(corner, dims, fillCol, strokeCol, ctx){
		ctx.strokeStyle = strokeCol.hex;
		ctx.fillStyle = fillCol.hex;
		ctx.fillRect(corner.x, corner.y, dims.dx, dims.dy);
		ctx.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	strokeRect: function(corner, dims, col, ctx) {
		ctx.strokeStyle = col.hex;
		ctx.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},

	line: function(p1, p2, col, ctx) {
		ctx.strokeStyle = col.hex;
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.closePath();
		ctx.stroke();
	},
	curvedLine: function(line, curvePt, quadEnd, ctx) {
		ctx.lineTo(line.x, line.y);
		ctx.quadraticCurveTo(curvePt.x, curvePt.y, quadEnd.x, quadEnd.y);
	},
	path: function(pts, col, ctx) {
		ctx.strokeStyle = col.hex;
		ctx.beginPath();
		ctx.moveTo(pts[0].x, pts[0].y);
		for(var ptIdx=1; ptIdx<pts.length; ptIdx++){
			ctx.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		ctx.stroke();		
	},
	text: function(text, pos, font, col, align, rotation, ctx) {
		ctx.save();
		ctx.translate(pos.x, pos.y);
		ctx.rotate(rotation);
		ctx.fillStyle = col.hex;
		ctx.font = font;
		ctx.textAlign = align;
		var fontSize = parseFloat(font);
		var yOffset = 0;
		var breakIdx = text.indexOf('\n');
		while (breakIdx!=-1){
			var toPrint = text.slice(0, breakIdx);
			ctx.fillText(toPrint, 0, yOffset);
			yOffset+=fontSize+2;
			text = text.slice(breakIdx+1, text.length);
			breakIdx = text.indexOf('\n');
		}
		ctx.fillText(text, 0, yOffset);
		ctx.restore();
	},

}

