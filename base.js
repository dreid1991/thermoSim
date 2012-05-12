drawingTools.prototype = {
	clear: function(){
		var width = myCanvas.width;
		var height = myCanvas.height;
		c.clearRect(0, 0, width, height);
		c.fillStyle = "black";
		c.fillRect(0,0, width, height);	
	},
	dots: function(){
		for (var spcIdx = 0; spcIdx<spcs.length; spcIdx++){
			var spc = spcs[spcIdx];
			c.fillStyle = "rgb(" + spc.cols.r + "," + spc.cols.g + "," + spc.cols.b + ")";
			for (var dotIdx = 0; dotIdx<spc.dots.length; dotIdx++){
				var dot = spc.dots[dotIdx];
				c.beginPath();
				c.arc(dot.x,dot.y,dot.r,0,Math.PI*2,true);
				c.closePath();
				c.fill();	
			}
		}

	},
	walls: function(walls){
		c.beginPath()
		
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
	for (var spcIdx = 0; spcIdx<spcs.length; spcIdx++){
		var spc = spcs[spcIdx];
		for (var dotIdx = 0; dotIdx<spc.dots.length; dotIdx++){
			var dot = spc.dots[dotIdx];
			dot.x += dot.v.dx;
			dot.y += dot.v.dy;
		}
	}
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
	var x = (pt1.x+pt2.x)/2 - 5*UV.dy
	var y = (pt1.y+pt2.y)/2 + 5*UV.dx;
	dot.x = x
	dot.y = y
}
function clickEvent(){
	alert();
}
function round(val, dec){
	var pow = Math.pow(10,dec);
	return Math.round(val*pow)/pow;
}
function makeHeader(text){
	var text = header.text(header.width/2, header.height/2, text)
	text.attr("font-size", headerTextSize);
	text.attr("stroke", "white");
	text.attr("fill","white");
	return text;
}
function cleanDash(level){
	for (var buttonName in level.buttons){ 
		Button.prototype.remove.apply(level.buttons[buttonName]);
		delete level.buttons[buttonName];
	}
	for (var sliderName in level.sliders){
		Slider.prototype.remove.apply(level.sliders[sliderName]);
		delete level.sliders[sliderName];
	}
}
function hitHeater(dot, perpV, temp){
	var vRatio = Math.sqrt(temp/dot.temp())
	var vNew = dot.v.mag()*vRatio;
	var UV = dot.v.UV();
	dot.v.dx = UV.dx*vNew;
	dot.v.dy = UV.dy*vNew;
}
function addListener(object, typeName, funcName, listener){
	object[typeName + 'Listeners'][funcName] = listener;
}
function removeListener(object, typeName, funcName){
	delete object[typeName + 'Listeners'][funcName];
}
function emptyListener(object, typeName){
	for (var listName in object[typeName + 'Listeners']){
		delete object[typeName + 'Listeners'][listName];
	}
}
function saveVals(level){
	for (sliderName in level.sliders){
		if (!(level.sliders[sliderName].val===undefined)){
			level.savedVals[sliderName] = level.sliders[sliderName].val;
		}
	}
}
//function loadVals(level){
//	for (sliderName in level.slider){
//		level.sliders[sliderName].val=level.savedVals[sliderName];
//	}
//}
var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");
var spcs = [];
draw = new drawingTools();
collide = new CollideHandler();

levels = [new level3()]
curLevel = levels[0];
curLevel.init();


c.strokeStyle = "rgb(255,255,255)";
setInterval("curLevel.update()", updateInterval);
setInterval("curLevel.addData()", dataInterval);
