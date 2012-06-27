drawingTools.prototype = {

	clear: function(col){
		var width = myCanvas.width;
		var height = myCanvas.height;
		c.clearRect(0, 0, width, height);
		c.fillStyle = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
		c.fillRect(0,0, width, height);	
	},
	dots: function(){
		for (var spc in spcs){
			c.fillStyle = "rgb(" + spcs[spc].cols.r + "," + spcs[spc].cols.g + "," + spcs[spc].cols.b + ")";
			var dots = spcs[spc].dots;
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				c.beginPath();
				c.arc(dots[dotIdx].x,dots[dotIdx].y,dots[dotIdx].r,0,Math.PI*2,true);
				c.closePath();
				c.fill();	
			}
		}
	},
	walls: function(walls, col){
		c.beginPath();
		c.strokeStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";		
		for (var wallIdx=0; wallIdx<walls.pts.length; wallIdx++){
			var wall = walls.pts[wallIdx];
			c.moveTo(wall[0].x, wall[0].y);
			for (var ptIdx=1; ptIdx<wall.length; ptIdx++){
				var pt = wall[ptIdx];
				c.lineTo(pt.x, pt.y);
			}
		}
		c.closePath();
		c.stroke();
	},
	fillPts: function(pts, col, drawCanvas){
		drawCanvas.fillStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			drawCanvas.lineTo(pt.x, pt.y);
		}
		drawCanvas.closePath();
		drawCanvas.fill();
	},
	fillPtsStroke: function(pts, fillCol, strokeCol, drawCanvas){
		drawCanvas.fillStyle = "rgb(" + Math.floor(fillCol.r) + "," + Math.floor(fillCol.g) + "," + Math.floor(fillCol.b) + ")";
		drawCanvas.strokeStyle = "rgb(" + Math.floor(strokeCol.r) + "," + Math.floor(strokeCol.g) + "," + Math.floor(strokeCol.b) + ")";
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			drawCanvas.lineTo(pt.x, pt.y);
		}
		drawCanvas.closePath();
		drawCanvas.stroke();
		drawCanvas.fill();
	},
	roundedRect: function(pos, dims, r, col, drawCanvas){
		var x = pos.x;
		var y = pos.y;
		var width = dims.dx;
		var height = dims.dy;
		drawCanvas.fillStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
		drawCanvas.beginPath();
		drawCanvas.moveTo(x+r, y);
		this.curvedLine(P(x+width-r, y), P(x+width, y), P(x+width, y+r), drawCanvas);
		this.curvedLine(P(x+width, y+height-r), P(x+width, y+height), P(x+width-r, y+height), drawCanvas);
		this.curvedLine(P(x+r, y+height), P(x, y+height), P(x, y+height-r), drawCanvas);
		this.curvedLine(P(x, y+r), P(x, y), P(x+r, y), drawCanvas);
		drawCanvas.closePath();
		drawCanvas.fill();
		
	},
	fillRect: function(corner, dims, fillCol, drawCanvas){
		drawCanvas.fillStyle = "rgb(" + Math.floor(fillCol.r) + "," + Math.floor(fillCol.g) + "," + Math.floor(fillCol.b) + ")";
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	fillStrokeRect: function(corner, dims, fillCol, strokeCol, drawCanvas){
		drawCanvas.strokeStyle = "rgb(" + Math.floor(strokeCol.r) + "," + Math.floor(strokeCol.g) + "," + Math.floor(strokeCol.b) + ")";
		drawCanvas.fillStyle = "rgb(" + Math.floor(fillCol.r) + "," + Math.floor(fillCol.g) + "," + Math.floor(fillCol.b) + ")";
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	strokeRect: function(corner, dims, col, drawCanvas){
		drawCanvas.strokeStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	checkMark: function(corner, dims, col, stroke, drawCanvas){
		var a = corner;
		var b = dims;
		var p1 = P(a.x			, a.y+b.dy*.6	);
		var p2 = P(a.x+b.dx*.4	, a.y+b.dy		);
		var p3 = P(a.x+b.dx		, a.y			);
		var p4 = P(a.x+b.dx*.35	, a.y+b.dy*.75	);
		var pts = [p1, p2, p3, p4];
		draw.fillPtsStroke(pts, col, stroke, drawCanvas);
	},
	line: function(p1, p2, col, drawCanvas){
		drawCanvas.strokeStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
		drawCanvas.beginPath();
		drawCanvas.moveTo(p1.x, p1.y);
		drawCanvas.lineTo(p2.x, p2.y);
		drawCanvas.closePath();
		drawCanvas.stroke();
	},
	curvedLine: function(line, curvePt, quadEnd, drawCanvas){
		drawCanvas.lineTo(line.x, line.y);
		drawCanvas.quadraticCurveTo(curvePt.x, curvePt.y, quadEnd.x, quadEnd.y);
	},
	text: function(text, pos, font, col, align, rotation, drawCanvas){
		
		drawCanvas.save();
		drawCanvas.translate(pos.x, pos.y);
		drawCanvas.rotate(rotation);
		drawCanvas.fillStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
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
function move(){
	for (var spc in spcs){
		var dots = spcs[spc].dots;
		for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
			dots[dotIdx].x += dots[dotIdx].v.dx;
			dots[dotIdx].y += dots[dotIdx].v.dy;
		}
	}
}
function gauss(avg, stdev){
	var numStdev = (Math.random() + Math.random() + Math.random())-1.5;
	return avg + numStdev*stdev;
}
function boundedStep(cur, dest, step){
	var sign = 1;
	if(cur==dest){
		return cur;
	}else{
		var dist = dest-cur;
		sign = Math.abs(dist)/dist;
	}
	cur*=sign;
	dest*=sign;
	step*=sign;
	return sign*Math.min(cur+step, dest);
}
function addSpecies(toAdd){
	if (String(toAdd)===toAdd){
		var def = speciesDefs[toAdd];
		spcs[toAdd] = new Species(def.m, def.r, def.cols);
	} else{
		for (var toAddIdx=0; toAddIdx<toAdd.length; toAddIdx++){
			var name = toAdd[toAddIdx];
			var def = speciesDefs[name];
			spcs[name] = new Species(def.m, def.r, def.cols);
		}
	}
}
function populate(name, x, y, width, height, num, temp){
	var vStdev = .1;
	var spc = spcs[name];
	if(spc===undefined){
		alert('Tried to populate undefined species');
	}else{
		for (var i=0; i<num; i++){
			var placeX = x + Math.random()*width;
			var placeY = y + Math.random()*height;
			var v = tempToV(spc.m, temp)
			var angle = Math.random()*2*Math.PI;
			var vx = v * Math.cos(angle);
			var vy = v * Math.sin(angle);
			spc.dots.push(D(placeX, placeY, V(vx, vy), spc.m, spc.r, spc.name));
		}
	}
}
function depopulate(name){
	var spc = spcs[name];
	spc.dots = [];
}
function tempToV(mass, temp){
	temp = 2*Math.max(0, temp/tConst*gauss(1,.1));
	return Math.sqrt(temp/mass);
}
function returnEscapist(dot){
	var pt1 = walls.pts[0][0];
	var pt2 = walls.pts[0][1];
	UV = walls.wallUVs[0][0];
	var x = (pt1.x+pt2.x)/2 - 5*UV.dy;
	var y = (pt1.y+pt2.y)/2 + 5*UV.dx;
	dot.v.dy = Math.abs(dot.v.dy);
	dot.x = x;
	dot.y = y;
}
function clickEvent(){
	alert();
}
function round(val, dec){
	var pow = Math.pow(10,dec);
	return Math.round(val*pow)/pow;
}
function hitHeater(dot, perpV, temp){
	var vRatio = Math.sqrt(temp/dot.temp())
	var vNew = dot.v.mag()*vRatio;
	var UV = dot.v.UV();
	dot.v.dx = UV.dx*vNew;
	dot.v.dy = UV.dy*vNew;
}
function makeButton(text, id){
	var newDiv = $('<div>');
	newDiv.append( $('<button>').text(text).button() );
	newDiv.attr({id:id});
	return newDiv;
} 
function addListener(object, typeName, funcName, func, destObj){
	object[typeName + 'Listeners'][funcName] = {func:func, obj:destObj};
}
function removeListener(object, typeName, funcName){
	delete object[typeName + 'Listeners'][funcName];
}
function listenerExists(object, typeName, funcName){
	return object[typeName + 'Listeners'][funcName]!==undefined;
}
function emptyListener(object, typeName){
	for (var listenerName in object[typeName + 'Listeners']){
		delete object[typeName + 'Listeners'][listenerName];
	}
}
function saveVals(level){
	for (sliderName in level.sliders){
		if (!(level.sliders[sliderName].val===undefined)){
			level.savedVals[sliderName] = level.sliders[sliderName].val;
		}
	}
}

function makeSlider(id, attrs, handlers){
	//var newDiv = $('<div>');
	//newDiv.attr({id:id});
	var div = $('#' + id);
	div.slider({});
	div.slider("option",attrs);
	div.attr({width:300});
	for (var handlerIdx=0; handlerIdx<handlers.length; handlerIdx++){
		var handler=handlers[handlerIdx];
		var eventType = handler.eventType;
		var obj = handler.obj;
		var func = handler.func;
		if(obj===undefined){
			div.bind(eventType, function(event, ui){func.apply([event,ui])});
		}else{
			div.bind(eventType, function(event, ui){func.apply(obj, [event,ui])});
		}
	}
	return div;
}
function addQDivs(){
	for (var qIdx=0; qIdx<curLevel.qa.length; qIdx++){
		var q = curLevel.qa[qIdx].q;
		var qDiv = $('<div>');
		var id='q'+String(qIdx);
		qDiv.attr({id:id,class:'question'});
		qDiv.html(q);
		$('#quesHolder').append(qDiv);
	}
}
function showCurQ(){
	for (var qIdx=0; qIdx<curLevel.qa.length; qIdx++){
		if(qIdx==curLevel.curQ){
			$('#q'+String(qIdx)).show();
		}else{
			$('#q'+String(qIdx)).hide();
		}
	}
}
function submit(){
	if(curLevel.curQ<curLevel.qa.length-1){
		curLevel.curQ++;
	}
	showCurQ();
	curLevel.qa[curLevel.curQ].a = $('textarea#answer').val();
}
function log10(val){
	return Math.log(val)/Math.log(10);
}
function getLen(pts){
	var len = 0;
	for (var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
		len+=pts[ptIdx].distTo(pts[ptIdx+1]);
	}
	return len;
}
function byAttr(list, attrVal, attr){
	for(var listIdx=0; listIdx<list.length; listIdx++){
		if(list[listIdx][attr]==attrVal){
			return list[listIdx];
		}
	}
}
function inRect(pos, dims, curCanvas){
	var mousePos = mouseOffset(curCanvas);
	return mousePos.x>=pos.x && mousePos.x<=(pos.x+dims.dx) && mousePos.y>=pos.y && mousePos.y<=(pos.y+dims.dy);
}
//function loadVals(level){
//	for (sliderName in level.slider){
//		level.sliders[sliderName].val=level.savedVals[sliderName];
//	}
//}
var canvas;
var c; 
$(function(){
	canvas = document.getElementById("myCanvas");
	c = canvas.getContext("2d");
})

globalMousePos = P(0,0)
function mouseOffset(curCanvas){
	return P(globalMousePos.x - curCanvas.offsetLeft, globalMousePos.y - curCanvas.offsetTop);
}
$(document).mousemove(function(e){
	globalMousePos.x = e.pageX//-myCanvas.offsetLeft;
	globalMousePos.y = e.pageY//-myCanvas.offsetTop;
	for (var mousemoveListener in curLevel.mousemoveListeners){
		var listener = curLevel.mousemoveListeners[mousemoveListener]
		listener.func.apply(listener.obj);
	}	
})
$(document).mousedown(function(e){
	for (var mousedownListener in curLevel.mousedownListeners){
		var listener = curLevel.mousedownListeners[mousedownListener]
		listener.func.apply(listener.obj);
	}		
})
$(document).mouseup(function(e){
	for (var mouseupListener in curLevel.mouseupListeners){
		var listener = curLevel.mouseupListeners[mouseupListener]
		listener.func.apply(listener.obj);
	}	
})

spcs = {};
draw = new drawingTools();
collide = new CollideHandler();

vConst = 1/10000;
pConst = 16.1423;
tConst = 20;
workConst = .431e-3;//for kJ;
updateInterval = 30;
dataInterval = 2000;




setInterval("curLevel.update()", updateInterval);
setInterval("curLevel.addData()", dataInterval);
