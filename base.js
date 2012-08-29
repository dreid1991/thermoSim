//shared startup stuff
$(function(){
	_.extend(Array.prototype, ArrayExtenders);
	_.extend(Math, MathExtenders);
	hoverCol = Col(0, 81, 117);
	turn = 0;
	$('#canvasDiv').hide();
	$('#base').hide();
	$('#dashIntro').hide();
	$('#dashRun').hide();
	$('#dashOutro').hide();
	$('#dashCutScene').hide();
	$('#display').hide();
	$('#intText').hide();
	canvas = document.getElementById("myCanvas");
	c = canvas.getContext("2d");	
	R = 8.314;
	//set compAdj to '' have collisions for cv of R, cp of 2R
	cv = 1.5*R;
	cp = 2.5*R;
	compAdj = '32';
	vConst = 1/10000;
	//pConst = 16.1423; //for atm
	pConst = 16.3562; //for bar
	tConst = 20;
	LtoM3 = .001;
	ATMtoPA = 101325;
	BARTOPA = 100000;
	PUNITTOPA = BARTOPA;
	JtoKJ = .001;
	N = 1000;//Avagadro's number
	//To get nice numbers with this, 1 mass in here coresponds to weight of 10 g/mol 
	pxToMS = 157.9;
	g = 1.75
	workConst = .158e-3;//for kJ;
	updateInterval = 30;
	dataInterval = 1250;
	borderCol = Col(155,155,155);
	multChoiceMaxSnapHeight = 100;
	sliderList = [];
	spcs = {};
	stored = {};
	draw = new drawingTools();
	collide = new CollideHandler();
	setInterval('curLevel.update()', updateInterval);
	setInterval('curLevel.updateData()', dataInterval);
	//_.extend(Array.prototype, pushNumber);
	
	/*Timing stuff
	started = false;
	counted = 0;
	total = 0;

	if(started){
		var then = Date.now();
	}	
	//stuff to time goes here
	if(started&&counted<500){
		counted++;
		total+=Date.now()-then;
	}else if (counted==500){
		console.log(total);
		counted=0;
		total=0;
	}
	*/
})
/*
function checkIdeality(){
	var count = dataHandler.countFunc()
	var theData = walls[0].data;
	var pInt = theData.pInt[theData.pInt.length-1]
	var t = theData.t[theData.t.length-1]
	var v = theData.v[theData.v.length-1]
	console.log(pInt);
	console.log(t);
	console.log(v);
	console.log('nrt ' + count()/N*.0831*t);
	console.log('pv ' + pInt*v);
	
}
*/
drawingTools.prototype = {

	clear: function(col){
		var width = myCanvas.width;
		var height = myCanvas.height;
		c.clearRect(0, 0, width, height);
		c.fillStyle = col.hex;
		c.fillRect(0,0, width, height);	
	},
	dots: function(){
		for (var spcName in spcs){
			var dots = spcs[spcName];
			c.fillStyle = dots.cols.hex;
			if(dots[0]){
				var r = dots[0].r;//from 5250ms/500 -> 4975 ms/500.  also don't define dot locally
			}
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				c.beginPath();
				c.arc(dots[dotIdx].x,dots[dotIdx].y,r,0,Math.PI*2,true);
				c.closePath();
				c.fill();	
			}
		}
	},
	walls: function(walls, col){
		c.beginPath();
		c.strokeStyle = col.hex;		
		for (var wallIdx=0; wallIdx<walls.length; wallIdx++){
			var wall = walls[wallIdx];
			if(wall.show){
				c.moveTo(wall[0].x, wall[0].y);
				for (var ptIdx=1; ptIdx<wall.length-1; ptIdx++){
					var pt = wall[ptIdx];
					c.lineTo(pt.x, pt.y);
				}
				c.closePath();
				c.stroke();
			}
		}
	},
	fillPts: function(pts, col, drawCanvas){
		drawCanvas.fillStyle = col.hex;
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for (var ptIdx=1; ptIdx<pts.length; ptIdx++){
			drawCanvas.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		drawCanvas.closePath();
		drawCanvas.fill();
	},
	fillPtsAlpha: function(pts, col, alpha, drawCanvas){
		var prevAlpha = drawCanvas.globalAlpha;
		drawCanvas.globalAlpha = alpha;
		draw.fillPts(pts, col, drawCanvas);
		drawCanvas.globalAlpha = prevAlpha;
	},
	fillPtsStroke: function(pts, fillCol, strokeCol, drawCanvas){
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
	roundedRect: function(pos, dims, r, col, drawCanvas){
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
	fillRect: function(corner, dims, fillCol, drawCanvas){
		drawCanvas.fillStyle = fillCol.hex
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	fillStrokeRect: function(corner, dims, fillCol, strokeCol, drawCanvas){
		drawCanvas.strokeStyle = strokeCol.hex;
		drawCanvas.fillStyle = fillCol.hex;
		drawCanvas.fillRect(corner.x, corner.y, dims.dx, dims.dy);
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},
	strokeRect: function(corner, dims, col, drawCanvas){
		drawCanvas.strokeStyle = col.hex;
		drawCanvas.strokeRect(corner.x, corner.y, dims.dx, dims.dy);
	},

	line: function(p1, p2, col, drawCanvas){
		drawCanvas.strokeStyle = col.hex;
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
	path: function(pts, col, drawCanvas){
		drawCanvas.strokeStyle = col.hex;
		drawCanvas.beginPath();
		drawCanvas.moveTo(pts[0].x, pts[0].y);
		for(var ptIdx=1; ptIdx<pts.length; ptIdx++){
			drawCanvas.lineTo(pts[ptIdx].x, pts[ptIdx].y);
		}
		drawCanvas.stroke();		
	},
	text: function(text, pos, font, col, align, rotation, drawCanvas){
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
function CheckMark(corner, dims, col, stroke, drawCanvas){
	var a = corner;
	var b = dims;
	var p1 = P(a.x			, a.y+b.dy*.6	);
	var p2 = P(a.x+b.dx*.4	, a.y+b.dy		);
	var p3 = P(a.x+b.dx		, a.y			);
	var p4 = P(a.x+b.dx*.35	, a.y+b.dy*.75	);
	var pts = [p1, p2, p3, p4];
	this.pts = pts;
	this.col = col;
	this.stroke = stroke;
	this.drawCanvas = drawCanvas;
}
CheckMark.prototype = {
	draw: function(){
		draw.fillPtsStroke(this.pts, this.col, this.stroke, this.drawCanvas);
	},
}
function Arrow(handle, pts, col, drawCanvas){
	this.handle = handle;
	var rotate = .5;
	this.pts = {line:pts, arrow: new Array(3)}
	this.col = col;
	this.drawCanvas = drawCanvas;
	var ptLast = this.pts.line[this.pts.line.length-1];
	var ptNextLast = this.pts.line[this.pts.line.length-2];
	var dirBack = ptLast.VTo(ptNextLast).UV();
	var dirSide1 = dirBack.copy().rotate(rotate);
	var dirSide2 = dirBack.copy().rotate(-rotate);

	this.pts.arrow[0] = ptLast.copy().movePt(dirSide1.mult(10));
	this.pts.arrow[1] = ptLast;
	this.pts.arrow[2] = ptLast.copy().movePt(dirSide2.mult(10));
	return this;
}	
Arrow.prototype = {
	draw: function(){
		for(var ptName in this.pts){
			var pts = this.pts[ptName];
			for(var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
				var p1 = pts[ptIdx];
				var p2 = pts[ptIdx+1];
				draw.line(p1, p2, this.col, this.drawCanvas);
			}	
		}
	},
	show: function(lifespan){//in ms
		var turn = 0;
		addListener(curLevel, 'update', 'drawArrow' + this.handle, this.makeDrawFunc(lifespan), this)
		return this;
	},
	makeDrawFunc: function(lifespan){
		var turn = 0;
		var self = this;
		var drawListener = function(){
			self.draw();
		}
		if(lifespan){
			drawListener = extend(drawListener, function(){
				turn++;
					if(turn==lifespan){
						removeListener(curLevel, 'update', 'drawArrow' + self.handle);
					}
				}
			)
		}
		return drawListener;
	},
	hide: function(){
		removeListener(curLevel, 'update', 'drawArrow' + this.handle);
	}
}

function gauss(avg, stdev){
	var numStdev = (Math.random() + Math.random() + Math.random())-1.5;
	return avg + numStdev*stdev;
}
function boundedStep(cur, setPt, step){
	step = Math.abs(step);
	var sign = 1;
	if(cur==setPt){
		return cur;
	}else{
		var dist = setPt-cur;
		sign = Math.abs(dist)/dist;
	}
	cur*=sign;
	setPt*=sign;
	return sign*Math.min(cur+step, setPt);
}
function addSpecies(toAdd){
	var didAdd = false;
	if (String(toAdd)===toAdd){
		if(!spcs[toAdd] && toAdd){
			var def = speciesDefs[toAdd];
			spcs[toAdd] = Species(def.m, def.r, def.cols, def);
			didAdd = true;
		}
		
	} else if (toAdd instanceof Array){
		for (var toAddIdx=0; toAddIdx<toAdd.length; toAddIdx++){
			var name = toAdd[toAddIdx];
			if(!spcs[name] && name){
				var def = speciesDefs[name];
				spcs[name] = Species(def.m, def.r, def.cols, def);
				didAdd = true;
			}
		}
	}
	if(didAdd){
		collide.setup();
	}
}
function removeSpecies(toRem){
	if (String(toRemove)===toRemove){
		spcs[toRemove] = undefined;
	} else if(toRem instanceof Array){
		for (var toRemIdx=0; toRemIdx<toRem.length; toRemIdx++){
			var name = toAdd[toRemIdx];
			spcs[name] = undefined
		}
	}
	collide.setup();
}


function changeAllTemp(temp){
	for(var spc in spcs){
		var dots = spcs[spc];
		for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
			dots[dotIdx].setTemp(temp);
		}
	}
}
function changeRMS(info, newRMS){
	info = defaultTo({}, info);
	var spcName = info.spcName;
	var tag = info.tag;
	
	var dots = spcs[spcName];
	var curRMS = rms(dataHandler.velocities(info));
	var ratio = newRMS/curRMS;
	for (var dotIdx=0; dotIdx<dots.length; dotIdx++){
		var dot = dots[dotIdx];
		dot.v.mult(ratio);
	}
}

function tempToV(mass, temp){
	//T/tConst = 0.5*m*v^2
	temp = 2*Math.max(0, temp/tConst*gauss(1,.1));
	return Math.sqrt(temp/mass);
}
function VToTemp(mass, v){
	return .5*mass*v*v*tConst;
}
function returnEscapist(dot){
	returnTo = defaultTo('0', dot.returnTo);
	var pt1 = walls[returnTo][0];
	var pt2 = walls[returnTo][1];
	var UV = walls[returnTo].wallUVs[0];	
	var x = (pt1.x+pt2.x)/2 - 5*UV.dy;
	var y = (pt1.y+pt2.y)/2 + 5*UV.dx;
	dot.v.dy = Math.abs(dot.v.dy);
	dot.x = x;
	dot.y = y;
}
function defaultTo(defaultVal, inputVal){
	if(inputVal !== undefined){
		return inputVal;
	}
	return defaultVal;
} 
function validNumber(num){
	if(!isNaN(num)){
		return num;
	}
	return false;
}
function round(val, dec){
	var pow = Math.pow(10,dec);
	return Math.round(val*pow)/pow;
}
function unique(name, obj){
	if(!obj[name]){
		return name;
	}else{
		var uniqueId = 1;
		while(!obj[name+uniqueId]){
			uniqueId++;
		}
		return name+uniqueId;
	}
}
function addListener(object, typeName, funcName, func, destObj){
	object[typeName + 'Listeners'].listeners[funcName] = {func:func, obj:destObj};
}
function addListenerOnce(object, typeName, funcName, func, destObj){
	var removeFunc = function(){
		removeListener(object, typeName, funcName);
		removeListener(object, typeName, funcName+'Remove');
	}
	object[typeName + 'Listeners'].listeners[funcName] = {func:func, obj:destObj};
	object[typeName + 'Listeners'].listeners[funcName + 'Remove'] = {func:removeFunc, obj:''};
}
function removeListener(object, typeName, funcName){
	delete object[typeName + 'Listeners'].listeners[funcName];
}
function removeSave(object, typeName, funcName){
	delete object[typeName + 'Listeners'].save[funcName];
}
function removeListenerByName(object, typeName, pieceToRemoveBy){
	var didDelete = false;
	var funcName = getListenerByName(object, typeName, pieceToRemoveBy);
	while (funcName!==undefined){
		didDelete = true;
		delete object[typeName+'Listeners'].listeners[funcName];
		funcName = getListenerByName(object, typeName, pieceToRemoveBy);
	}
	return didDelete
}
function removeSaveByName(object, typeName, pieceToRemoveBy){
	var didDelete = false;
	var funcName = getSaveByName(object, typeName, pieceToRemoveBy);
	while (funcName!==undefined){
		didDelete = true;
		delete object[typeName+'Listeners'].save[funcName];
		funcName = getSaveByName(object, typeName, pieceToRemoveBy);
	}
	return didDelete
}
function listenerExists(object, typeName, funcName){
	return object[typeName + 'Listeners'].listeners[funcName]!==undefined;
}
function emptyListener(object, typeName){
	for (var listenerName in object[typeName + 'Listeners'].listeners){
			delete object[typeName + 'Listeners'].listeners[listenerName];
	}
}
function getListenerByName(object, typeName, pieceName){
	for (thisFuncName in object[typeName + 'Listeners'].listeners){
		if(thisFuncName.indexOf(pieceName)!=-1){
			return thisFuncName;
		}
	}
}
function getSaveByName(object, typeName, pieceName){
	for (thisFuncName in object[typeName + 'Listeners'].save){
		if(thisFuncName.indexOf(pieceName)!=-1){
			return thisFuncName;
		}
	}
}
function saveListener(object, typeName){
	var listener = object[typeName+'Listeners']
	var save = listener.save;
	var listeners = listener.listeners;
	for (var listenerName in listeners){
		save[listenerName] = listeners[listenerName];
	}
}
function loadListener(object, typeName){
	var listener = object[typeName+'Listeners']
	var save = listener.save;
	var listeners = listener.listeners;
	for (var saveName in save){
		listeners[saveName] = save[saveName];
	}
	
}
function store(attrName, val){
	stored[attrName] = val;
}
function getStore(attrName){
	return stored[attrName];
}
function eraseStore(attrName){
	if(attrName){
		stored[attrName] = undefined;
	}else{
		stored = {};
	}
}
ArrayExtenders = {
	pushNumber: function(number){
		if(!isNaN(number) && number!==undefined){
			this.push(number);
		}
		return this;
	},
	deepCopy: function(startIdx, endIdx){
		startIdx = defaultTo(0, startIdx);
		endIdx = Math.min(this.length, defaultTo(this.length, endIdx));
		var copy = new Array(this.length);
		for (var idx=startIdx; idx<endIdx; idx++){
			if(this[idx] instanceof Array){
				copy[idx] = this[idx].deepCopy();
			}else{
				copy[idx] = this[idx];
			}
		}
		return copy;

	},
	
}
MathExtenders = {
	log10: function(val){
		return Math.log(val)/Math.log(10);	
	},

}
function recordData(handle, list, func, obj, listenerType){
	var listenerType = defaultTo('record', listenerType)
	store('record' + handle, listenerType);
	addListener(curLevel, listenerType, handle, function(){list.pushNumber(func.apply(obj))}, obj);
}
function recordDataStop(handle){
	var listenerType = getStore('record' + handle);
	removeListener(curLevel, listenerType, handle);
}
function addEqs(text){
	var eqIdx = text.indexOf('||EQ');
	var toHTML = function(eqNum, subStr){
		if(subStr && subStr =="CE"){
			return "<p><center><img src = 'img/"+imgPath+"/eq"+eqNum+".gif'</img></center></p>";
		} else {
			return "<img src = 'img/"+imgPath+"/eq"+eqNum+".gif'</img>";
		}
	}

	while(eqIdx!=-1){
		for(var charIdx=eqIdx+4; charIdx<text.length; charIdx++){
			var subStr = text.substring(charIdx, charIdx+2);
			if(subStr=="||" || subStr=="CE"){
				break
			}else if(charIdx+2==text.length){
				break
			}
		}
		var eqNum = text.substring(eqIdx+4, charIdx);
		var eqHTML = toHTML(eqNum, subStr);
		text = text.replace("||EQ"+eqNum+subStr, eqHTML);
		eqIdx = text.indexOf('||EQ');
	}
	return text;
}

function makeSlider(wrapperDivId, sliderDivId, title, attrs, handlers, initVisibility){
	var wrapperDiv = $('#' + wrapperDivId);
	wrapperDiv.html('');
	wrapperDiv.append('<center>'+title+'</center>');
	wrapperDiv.append("<div id='"+sliderDivId+"parent' style='padding:5px'><div id='"+sliderDivId+"'></div></div>");
	divParent = $('#'+sliderDivId+'parent');
	sliderDiv = $('#' + sliderDivId);
	sliderDiv.slider({});
	sliderDiv.slider("option",attrs);
	//sliderDiv.attr({width:divParent.width()-10});
	/*
	if(toChange){
		curLevel[handle+'Set'] = function(event, ui){
			this.playedWithSlider = true;
			this[objName]['set' + toChange](ui.value);
		}
		sliderBind(div, 'slide', curLevel[handle+'Set'], curLevel);
	}
	*/
	for (var handlerIdx=0; handlerIdx<handlers.length; handlerIdx++){
		var handler=handlers[handlerIdx];
		var eventType = handler.eventType;
		var obj = handler.obj;
		var func = handler.func;

		var event;
		var ui;
		if(obj===undefined){
			sliderBind(sliderDiv, eventType, func, '');
		}else{
			sliderBind(sliderDiv, eventType, func, obj);
		}
		
	}
	if(initVisibility){
		div[initVisibility]();
	}
	sliderList.push(sliderDivId);
	return sliderDiv;
}
function sliderBind(div, eventType, func, obj){
	div.bind(eventType, function(event, ui){func.apply(obj, [event, ui])});
	return div;
}
function addButton(id, text, divId){
	divId = defaultTo('buttons', divId);
	$('#'+divId).append('<button id='+id+'>'+text+'</button>');
	var button = $('button#'+id);
	button.button();
	return button;
}
function buttonBind(id, func){
	var button = $('#'+id);
	button.click(func);
	return button;
}
function hideSliders(){
	for (var handleIdx=0; handleIdx<sliderList.length; idIdx++){
		var handle = sliderList[handleIdx];
		$('#'+ handle).hide();
	}
}
function showPrompt(prev, prompt){
	var finishedPrev = new Boolean();
	var forward = new Boolean();
	var didWin = new Boolean();
	if(prev){
		var finishedPrev = prev.finished;
	} else{
		finishedPrev = true;
	}
	didWin = true;
	var indexOfPrev = _.indexOf(curLevel.prompts, prev);
	var indexOfCur = _.indexOf(curLevel.prompts, prompt);
	forward = indexOfCur>indexOfPrev;
	if(prev){
		var conditions = defaultTo(curLevel.conditions, defaultTo(curLevel['block'+prev.block+'Conditions'], prev.conditions));
	}
	if(!finishedPrev && forward && conditions){
		var condResult = conditions.apply(curLevel);
		didWin = condResult.didWin;
		if(condResult.alert){
			alert(condResult.alert);
		}
	}
	if(didWin || finishedPrev){


		if(prev){
			if(forward){
				prev.finished = true;
			}
			if(prev.cleanUp){
				prev.cleanUp.apply(curLevel);
			}
		}
		var block = prompt.block
		var func = prompt.start;
		if(prompt.replace){
			prompt.text = replaceStrings(prompt.text, prompt.replace);
		}
		var text = prompt.text;
		
		if(block!=curLevel.blockIdx){
			curLevel.saveAllGraphs();
			curLevel.freezeAllGraphs();
			curLevel.removeAllGraphs();
			for (var spcName in spcs){
				spcs[spcName].depopulate();
			}
			curLevel.cleanUp.apply(curLevel);

			emptyListener(curLevel, 'cleanUp');
			emptyListener(curLevel, 'condition');
			if(curLevel.inCutScene){
				curLevel.cutSceneEnd();
			}
			if(curLevel['block'+block+'Start']){
				curLevel['block'+block+'Start'].apply(curLevel);
			}
			curLevel.blockIdx = block;
		}
		curLevel.promptIdx = indexOfCur;	
		if(!prompt.quiz){
			$('#submitDiv').show();
		}
		if(!prompt.cutScene){	
			if(prompt.quiz){
				var quiz = prompt.quiz;
				$('#submitDiv').hide();
				$('#prompt').html('');
				curLevel.appendQuiz(text, prompt.quiz, 'prompt')
			}else{
				$('#prompt').html(text);
			}
		} else{
			curLevel.cutSceneStart(prompt.text, prompt.cutScene, prompt.quiz)
		}
		var title = prompt.title;
		$('#baseHeader').html(title);
		if(func){
			func.apply(curLevel);
		}
	}

}
function toPrompt(promptIdx){
	var prev = curLevel.prompts[curLevel.promptIdx];
	prev.finished = true;
	var prompt = curLevel.prompts[promptIdx];
	showPrompt(prev, prompt);
}
function nextPrompt(){
	var prev = curLevel.prompts[curLevel.promptIdx];
	var promptIdx = Math.min(curLevel.promptIdx+1, curLevel.prompts.length-1);
	var prompt = curLevel.prompts[promptIdx];
	showPrompt(prev, prompt);
	
}
function prevPrompt(){
	var prev = curLevel.prompts[curLevel.promptIdx];
	var promptIdx = Math.max(0, curLevel.promptIdx-1);;
	var prompt = curLevel.prompts[promptIdx];
	showPrompt(prev, prompt);
}
function replaceStrings(text, replaceList){
	for (var replaceIdx=0; replaceIdx<replaceList.length; replaceIdx++){
		var replace = replaceList[replaceIdx];
		var oldStr = replace.oldStr;
		var newStr = replace.newStr;
		if(typeof newStr == 'string' && newStr.indexOf('GET')==0){
			
			newStr = getStore(newStr.slice(3,newStr.length));
		} else if (typeof newStr == 'function'){
			newStr = newStr();
		}
		text = text.replace(oldStr, newStr);
	}
	return text;
}

function rotatePts(pts, center, rotation){
	for(var ptIdx=0; ptIdx<pts.length; ptIdx++){
		var pt = pts[ptIdx];
		pt.rotate(center, rotation);
	}
}
function mirrorPts(pts, center, line){
	for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
		pts[ptIdx].mirror(center, line);
	}
	return pts;
}
function angleToUV(dir){
	return V(Math.cos(dir), Math.sin(dir));
}
function getSign(val){
	var sign=1;
	if(val!=0){
		sign = Math.abs(val)/val;
	}
	return sign;
}
function fracDiff(a, b){
	return Math.abs(a-b)/Math.min(Math.abs(a), Math.abs(b));
}
function getLen(pts){
	var len = 0;
	for (var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
		len+=pts[ptIdx].distTo(pts[ptIdx+1]);
	}
	return len;
}
function byAttr(obj, attrVal, attr){
	if(obj instanceof Array){
		for(var listIdx=0; listIdx<obj.length; listIdx++){
			if(obj[listIdx][attr]==attrVal){
				return obj[listIdx];
			}
		}
	}else{
		for(var name in obj){
			if (obj[name][attr]==attrVal){
				return obj[name];
			}
		}
	}
}
function inRect(pos, dims, curCanvas){
	var mousePos = mouseOffset(curCanvas);
	return mousePos.x>=pos.x && mousePos.x<=(pos.x+dims.dx) && mousePos.y>=pos.y && mousePos.y<=(pos.y+dims.dy);
}
function ptInRect(pos, dims, pt){
	return pt.x>=pos.x && pt.x<=(pos.x+dims.dx) && pt.y>=pos.y && pt.y<=(pos.y+dims.dy);
}
function extend(old, add){
	return function(){
		return add(old());
	}
}
function rms(vals){
	var sum=0;
	for (var valIdx=0; valIdx<vals.length; valIdx++){
		sum+=vals[valIdx]*vals[valIdx]		
	}
	sum/=vals.length;
	return Math.sqrt(sum);
}
globalMousePos = P(0,0);
function mouseOffset(curCanvas){
	return P(globalMousePos.x - curCanvas.offsetLeft, globalMousePos.y - curCanvas.offsetTop);
}
$(document).mousemove(function(e){
	globalMousePos.x = e.pageX;
	globalMousePos.y = e.pageY;
	for (var mousemoveListener in curLevel.mousemoveListeners.listeners){
		var listener = curLevel.mousemoveListeners.listeners[mousemoveListener]
		listener.func.apply(listener.obj);
	}	
})
$(document).mousedown(function(e){
	for (var mousedownListener in curLevel.mousedownListeners.listeners){
		var listener = curLevel.mousedownListeners.listeners[mousedownListener]
		listener.func.apply(listener.obj);
	}		
})
$(document).mouseup(function(e){
	for (var mouseupListener in curLevel.mouseupListeners.listeners){
		var listener = curLevel.mouseupListeners.listeners[mouseupListener]
		listener.func.apply(listener.obj);
	}	
})
function UNLOCK(){
	for (var promptIdx in curLevel.prompts){
		curLevel.prompts[promptIdx].finished=true;
	}
}






