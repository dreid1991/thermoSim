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
	circle: function(pos, r, col, fill, drawCanvas) {

		
		drawCanvas.beginPath();
		drawCanvas.arc(pos.x, pos.y, r, 0, Math.PI*2, true);
		drawCanvas.closePath();
		if (fill) {
			drawCanvas.fillStyle = col.hex;
			drawCanvas.fill();	
		} else {
			drawCanvas.strokeStyle = col.hex;
			drawCanvas.stroke();
		}
	},
	fillPts: function(pts, col, drawCanvas) {
		drawCanvas.fillStyle = col.hex;
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++) {
			drawCanvas.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		drawCanvas.closePath();
		drawCanvas.fill();
	},
	fillPtsAlpha: function(pts, col, alpha, drawCanvas) {
		var prevAlpha = drawCanvas.globalAlpha;
		drawCanvas.globalAlpha = alpha;
		draw.fillPts(pts, col, drawCanvas);
		drawCanvas.globalAlpha = prevAlpha;
	},
	fillPtsStroke: function(pts, fillCol, strokeCol, drawCanvas) {
		drawCanvas.fillStyle = fillCol.hex
		drawCanvas.strokeStyle = strokeCol.hex
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			drawCanvas.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		drawCanvas.closePath();
		drawCanvas.stroke();
		drawCanvas.fill();
	},
	roundedRect: function(pos, dims, r, col, drawCanvas) {
		var x = pos.x;
		var y = pos.y;
		var width = dims.dx;
		var height = dims.dy;
		drawCanvas.fillStyle = col.hex
		drawCanvas.beginPath();
		drawCanvas.moveTo(x+r, y);
		this.curvedLine(P(x+width-r, y), P(x+width, y), P(x+width, y+r), drawCanvas);
		this.curvedLine(P(x+width, y+height-r), P(x+width, y+height), P(x+width-r, y+height), drawCanvas);
		this.curvedLine(P(x+r, y+height), P(x, y+height), P(x, y+height-r), drawCanvas);
		this.curvedLine(P(x, y+r), P(x, y), P(x+r, y), drawCanvas);
		drawCanvas.closePath();
		drawCanvas.fill();
		
	},
	fillRect: function(corner, dims, fillCol, drawCanvas) {
		drawCanvas.fillStyle = fillCol.hex
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	fillStrokeRect: function(corner, dims, fillCol, strokeCol, drawCanvas){
		drawCanvas.strokeStyle = strokeCol.hex;
		drawCanvas.fillStyle = fillCol.hex;
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	strokeRect: function(corner, dims, col, drawCanvas) {
		drawCanvas.strokeStyle = col.hex;
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},

	line: function(p1, p2, col, drawCanvas) {
		drawCanvas.strokeStyle = col.hex;
		drawCanvas.beginPath();
		drawCanvas.moveTo(p1.x, p1.y);
		drawCanvas.lineTo(p2.x, p2.y);
		drawCanvas.closePath();
		drawCanvas.stroke();
	},
	curvedLine: function(line, curvePt, quadEnd, drawCanvas) {
		drawCanvas.lineTo(line.x, line.y);
		drawCanvas.quadraticCurveTo(curvePt.x, curvePt.y, quadEnd.x, quadEnd.y);
	},
	path: function(pts, col, drawCanvas) {
		drawCanvas.strokeStyle = col.hex;
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for(var ptIdx=1; ptIdx<pts.length; ptIdx++){
			drawCanvas.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		drawCanvas.stroke();		
	},
	text: function(text, pos, font, col, align, rotation, drawCanvas) {
		drawCanvas.save();
		drawCanvas.translate(pos.x, pos.y);
		drawCanvas.rotate(rotation);
		drawCanvas.fillStyle = col.hex;
		drawCanvas.font = font;
		drawCanvas.textAlign = align;
		var fontSize = parseFloat(font);
		var yOffset = 0;
		var breakIdx = text.indexOf('\n');
		while (breakIdx!=-1){
			var toPrint = text.slice(0, breakIdx);
			drawCanvas.fillText(toPrint, 0, yOffset);
			yOffset+=fontSize+2;
			text = text.slice(breakIdx+1, text.length);
			breakIdx = text.indexOf('\n');
		}
		drawCanvas.fillText(text, 0, yOffset);
		drawCanvas.restore();
	},

}

