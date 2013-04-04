function QArrowsAmmt(attrs) {
	this.wallHandle = attrs.wallHandle;
	this.wall = walls[this.wallHandle];
	this.cleanUpWith = attrs.cleanUpWith;
	this.handle = attrs.handle;
	var wall = this.wall;
	wall.recordQ();
	this.qArrowAmmtMax = defaultTo(3, attrs.qMax);
		
	var wall = this;
	addListener(wall, 'cleanUp', 'qArrowsAmmt', function() {
		for (var arrowIdx=0; arrowIdx<wall.qArrowsAmmt.length; arrowIdx++) {
			wall.qArrowsAmmt[arrowIdx].remove();
		}
		removeListener(curLevel, 'update', wall.handle + 'updateQAmmtArrows');
		
	})

	this.init(this.wall, this.qArrowAmmtMax);
	
	this.setupStd();
}

QArrowsAmmt.prototype = {
	init: function(wall, qMax) {
		var lengthMin = 15;
		var lengthMax = 80;
		var widthMin = 70
		var widthMax = 90;
		var col = Col(175, 0, 0);
		var width = 40;
		var fracFromEdge = .25;
		var startingDims = V(30, 10);
		var pos1 = wall[3].copy().fracMoveTo(wall[2], fracFromEdge);
		var pos2 = wall[3].copy().fracMoveTo(wall[2], 1-fracFromEdge);
		var UV = pos2.VTo(pos1).perp('cw').UV();
		pos1.movePt(UV.copy().mult(5));
		pos2.movePt(UV.copy().mult(5));
		var arrow1 = new ArrowStatic({pos:pos1, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});
		var arrow2 = new ArrowStatic({pos:pos2, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});

		var redrawThreshold = qMax/(lengthMax-lengthMin);
		this.qArrowsAmmt = [arrow1, arrow2];
		var dirLast = 'out';
		qLast = wall.q;
		this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, wall.q, qMax);
		if (wall.q >= 0) {
			dirLast = 'in';
			this.flipAmmtArrows(this.qArrowsAmmt);
		}
		addListener(curLevel, 'update', this.handle + 'updateQAmmtArrows', 
			function() {
				if (Math.abs(wall.q - qLast) > redrawThreshold) {
					if (wall.q < 0) {
						dir = 'out';
					} else {
						dir = 'in';
					}
					this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, wall.q, qMax);
					if (dirLast != dir) {
						this.flipAmmtArrows(this.qArrowsAmmt);
						dirLast = dir;
					}
					qLast = wall.q;
				}
			},
		this);	
	},



	flipAmmtArrows: function(arrows) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var UV = angleToUV(arrow.getAngle()).mult(1);
			arrow.move(UV.mult(arrow.getDims().dx));
			arrow.rotate(Math.PI);
		}
	},
	setAmmtArrowDims: function(arrows, lMin, lMax, wMin, wMax, q, qMax) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var dimso = arrow.getDims();
			var percent = Math.abs(this.q)/qMax;
			var l = lMin + (lMax-lMin)*percent;
			var w = wMin + (wMax-wMin)*percent;
			arrow.size(V(l, w));
			if (q>0) {
				arrow.move(V(0, l-dimso.dx));
			}
		}
	},
	
	displayQArrowsAmmt: function(attrs) {

	},