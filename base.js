drawingTools.prototype = {
	clear: function(){
		var width = myCanvas.width;
		var height = myCanvas.height;
		c.clearRect(0, 0, width, height);
		c.fillStyle = "#05111a";
		c.fillRect(0,0, width, height);	
	},
	dots: function(){
		for (var spcIdx = 0; spcIdx<spcs.length; spcIdx++){
			c.fillStyle = "rgb(" + spcs[spcIdx].cols.r + "," + spcs[spcIdx].cols.g + "," + spcs[spcIdx].cols.b + ")";
			for (var dotIdx = 0; dotIdx<spcs[spcIdx].dots.length; dotIdx++){
				var dot = spcs[spcIdx].dots[dotIdx];
				c.beginPath();
				c.arc(spcs[spcIdx].dots[dotIdx].x,spcs[spcIdx].dots[dotIdx].y,spcs[spcIdx].dots[dotIdx].r,0,Math.PI*2,true);
				c.closePath();
				c.fill();	
			}
		}
	},
	walls: function(walls){
		c.beginPath()
		//alert(c.strokeStyle);
		for (var wallIdx=0; wallIdx<walls.pts.length; wallIdx++){
			var wall = walls.pts[wallIdx];
			c.moveTo(wall[0].x, wall[0].y);
			for (var ptIdx=1; ptIdx<wall.length; ptIdx++){
				var pt = wall[ptIdx];
				c.lineTo(pt.x, pt.y);
			}
		}
		c.stroke();
	},
	fillPts: function(pts, col){
		c.fillStyle = "rgb(" + Math.floor(col.r) + "," + Math.floor(col.g) + "," + Math.floor(col.b) + ")";
		c.beginPath();
		c.moveTo(pts[0].x, pts[1].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			c.lineTo(pt.x, pt.y);
		}
		c.closePath();
		c.fill();
	},
}
function move(){
	//var wallPE = (curLevel.maxY-walls.pts[0][0].y)*curLevel.weight.weight*curLevel.g;
	//var wallKE = .5*curLevel.weight.weight*curLevel.wallV*curLevel.wallV;
	//console.log("wallPE: ",wallPE);
	//console.log("wallKE: ",wallKE);
	//console.log("wall e ", String(wallKE+wallPE));
	//var dotKE = 0;
	for (var spcIdx = 0; spcIdx<spcs.length; spcIdx++){
		var spc = spcs[spcIdx];
		for (var dotIdx = 0; dotIdx<spc.dots.length; dotIdx++){
			var dot = spc.dots[dotIdx];
			//dotKE += .5*dot.m*dot.v.magSqr();
			dot.x += dot.v.dx;
			dot.y += dot.v.dy;
		}
	}
	//console.log("total e ", String(wallKE+wallPE+dotKE));
	
}
function gauss(avg, stdev){
	var numStdev = (Math.random() + Math.random() + Math.random())-1.5;
	return avg + numStdev*stdev;
}

function addSpecies(toAdd){
	if (String(toAdd)===toAdd){
		var name = toAdd;
		for (var defIdx=0; defIdx<speciesDefs.length; defIdx++){
			spcDef = speciesDefs[defIdx];
			if(spcDef.name==name){
				spcs.push(new Species(spcDef.name, spcDef.m, spcDef.r, spcDef.cols)) 
			} 
		}		
	} else{
		for (var toAddIdx=0; toAddIdx<toAdd.length; toAddIdx++){
			var name = toAdd[toAddIdx];
			for (var defIdx=0; defIdx<speciesDefs.length; defIdx++){
				spcDef = speciesDefs[defIdx];
				if(spcDef.name==name){
					spcs.push(new Species(spcDef.name, spcDef.m, spcDef.r, spcDef.cols))
				} 
			}	
		}
	}
}
function populate(name, x, y, width, height, num, temp){
	var spcSource = null;
	var spcTarget = null;
	var vStdev = .1;
	for (var spcDefIdx=0; spcDefIdx<speciesDefs.length; spcDefIdx++){
		var spc = speciesDefs[spcDefIdx];
		if(name==spc.name){
			spcSource = spc;
		}
	}
	for (var spcIdx=0; spcIdx<spcs.length; spcIdx++){
		var spc = spcs[spcIdx];
		if(name==spc.name){
			spcTarget = spc;
		}
	}
	for (var i=0; i<num; i++){
		var placeX = x + Math.random()*width;
		var placeY = y + Math.random()*height;
		var v = tempToV(spcSource.m, temp)*gauss(1,vStdev);
		var angle = Math.random()*2*Math.PI;
		var vx = v * Math.cos(angle);
		var vy = v * Math.sin(angle);
		spcTarget.dots.push(D(placeX, placeY, V(vx, vy), spcSource.m, spcSource.r, spcSource.name));
	}
	
}
function tempToV(mass, temp){
	temp*=tempScalar/(updateInterval*updateInterval);
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
function makePath(pts){
	var path = "M"+String(pts[0].x)+","+String(pts[0].y);
	for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
		var pt = pts[ptIdx];
		path+="L";
		path+=String(pt.x);
		path+=",";
		path+=String(pt.y);
	}
	return path;
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
	c.strokeStyle = 'white';
})

mousePos = P(0,0)
$(document).mousemove(function(e){
	mousePos.x = e.pageX-myCanvas.offsetLeft;
	mousePos.y = e.pageY-myCanvas.offsetTop;
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

var spcs = [];
draw = new drawingTools();
collide = new CollideHandler();

tempScalar = 100;
updateInterval = 35;
dataInterval = 2000;




setInterval("curLevel.update()", updateInterval);
setInterval("curLevel.addData()", dataInterval);
