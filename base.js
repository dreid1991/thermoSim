//shared startup stuff
$(function(){
	_.extend(Array.prototype, ArrayExtenders);
	_.extend(Math, MathExtenders);
	//_.extend(String, StringExtenders);
	String.prototype.killWhiteSpace = StringExtenders.killWhiteSpace;
	hoverCol = Col(0, 81, 117);
	dotManager = new DotManager();
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
	extraIntervals = {};
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
	pxToMS = 157.9; //HEY - THIS SHOULD BE REMOVED AND REPLACED WITH SOLVING FOR V FROM DOT'S TEMPERATURE
	KB = 1.38*Math.pow(10,-23)
	ACTUALN = 6.022*Math.pow(10,23);
	g = 1.75
	workConst = .158e-3;//for kJ;
	updateInterval = 30;
	dataInterval = 1250;
	borderCol = Col(155,155,155);
	auxHolderDivs = ['aux1', 'aux2'];
	promptIdx = -1;
	blockIdx = -1;
	sliderList = [];
	spcs = {};
	stored = {};
	draw = new DrawingTools();
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
			spcs[toAdd] = new Species(def.m, def.r, def.cols, def);
			didAdd = true;
		}
		
	} else if (toAdd instanceof Array){
		for (var toAddIdx=0; toAddIdx<toAdd.length; toAddIdx++){
			var name = toAdd[toAddIdx];
			if(!spcs[name] && name){
				var def = speciesDefs[name];
				spcs[name] = new Species(def.m, def.r, def.cols, def);
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


function changeTemp(info, newTemp){
	if (!info){
		for(var spc in spcs){
			var dots = spcs[spc];
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				dots[dotIdx].setTemp(newTemp);
			}
		}
	} else {
		for (var filter in info) {};
		for (var spc in spcs) {
			var dots = spcs[spc];
			for (var dotIdx = 0; dotIdx<dots.length; dotIdx++){
				if (dots[dotIdx][filter] == info[filter]){
					dots[dotIdx].setTemp(newTemp);
				}
			}
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
	//HEY - MAKE THIS WORK FOR TAG
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
	if (typeof(obj)=="function"){
		if (!obj(name)) {
			return name;
		} else {
			var uniqueId = 1;
			while(obj(name+uniqueId)){
				uniqueId++;
			}
			return name+uniqueId;		
		}
	} else {
		if(!obj[name]){
			return name;
		} else {
			var uniqueId = 1;
			while(obj[name+uniqueId]){
				uniqueId++;
			}
			return name+uniqueId;
		}
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
function addInterval(funcHandle, func, destObj, interval) {
	extraIntervals[funcHandle] = window.setInterval(function(){func.apply(destObj)}, interval);
}
function removeListener(object, typeName, funcName){
	delete object[typeName + 'Listeners'].listeners[funcName];
}
function removeInterval(funcHandle) {
	if (extraIntervals[funcHandle]) {
		window.clearInterval(extraIntervals[funcHandle]);
		extraIntervals[funcHandle] = undefined;
	}
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
		if(!isNaN(number) && number!==undefined) {
			this.push(number);
		}
		return this;
	},
	append: function(b){
		for (var idx=0; idx<b.length; idx++) {
			this.push(b[idx]);
		}
		return this;
	},
	average: function() {
		var total = 0;
		for (var idx=0; idx<this.length; idx++) {
			total+=this[idx];
		}
		return total/this.length;
	}
}
function deepCopy(object){
	var copy = new object.constructor();
	for (var item in object){
		if(typeof object[item] == 'object'){
			copy[item] = deepCopy(object[item]);
		}else{
			copy[item] = object[item];
		}
	} 
	return copy;
}

MathExtenders = {
	log10: function(val){
		return Math.log(val)/Math.log(10);	
	},

}
StringExtenders = {
	killWhiteSpace: function() {
		return this.replace(/\s/g, '');
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
		} else if (subStr && subStr == "BR") {
			return "<br><center><img src = 'img/"+imgPath+"/eq"+eqNum+".gif'</img></center>";
		} else {
			return "<img src = 'img/"+imgPath+"/eq"+eqNum+".gif'</img>";
		}
	}

	while(eqIdx!=-1){
		for(var charIdx=eqIdx+4; charIdx<text.length; charIdx++){
			var subStr = text.substring(charIdx, charIdx+2);
			if (subStr=="||" || subStr=="CE") {
				break;
			} else if (subStr=="||" || subStr=="BR") {
				break;
			} else if(charIdx+2==text.length) {
				break;
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
	return wrapperDiv;
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
function showPrompt(newBlockIdx, newPromptIdx){
	var changedBlock = newBlockIdx!=blockIdx;
	var oldPrompt = curLevel.blocks[blockIdx].prompts[promptIdx];
	
	curLevel.promptCleanUp();
	if (changedBlock) {
		curLevel.saveAllGraphs();
		curLevel.freezeAllGraphs();
		curLevel.removeAllGraphs();
		dotManager.clearAll();		
		emptyListener(curLevel, 'cleanUp');
		emptyListener(curLevel, 'condition');
		
		addListener(curLevel, 'blockCleanUp', 'removeArrowAndText',
			function(){
				removeListenerByName(curLevel, 'update', 'drawArrow');
				removeListenerByName(curLevel, 'update', 'animText');
			},
		this);
	}
	
	var finishedPrev = new Boolean();
	var forward = new Boolean();
	var didWin = new Boolean();
	if (prev) {
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
			dotManager.clearAll();
			curLevel.cleanUp.apply(curLevel);

			emptyListener(curLevel, 'cleanUp');
			emptyListener(curLevel, 'condition');
			
			addListener(curLevel, 'cleanUp', 'removeArrowAndText',
				function(){
					removeListenerByName(curLevel, 'update', 'drawArrow');
					removeListenerByName(curLevel, 'update', 'animText');
				},
			this);
			
			if (curLevel.inCutScene) {
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
		//fillEmptyGraphDivs();
	}

}
function toPrompt(newBlockIdx, newPromptIdx){
	var prev = curLevel.blocks[newBlockIdx].prompts[newPromptIdx];
	prev.finished = true;
	//have thing for determining if moving forwards of backwards, then call corresponding func
	showPrompt(newBlockIdx, newPromptIdx);
}
function nextPrompt(){
	var newBlockIdx = blockIdx;
	var newPromptIdx = promptIdx;
	var curBlock = curLevel.blocks[blockIdx];
	if (promptIdx+1==curBlock.prompts.length) {
		if (blockIdx+1 < curLevel.blocks.length) {
			newBlockIdx++;
			newPromptIdx=0;
		}
	} else {
		newPromptIdx++;
	}

	showPrompt(newBlockIdx, newPromptIdx);
	
}
function prevPrompt(){
	var newBlockIdx = blockIdx;
	var newPromptIdx = promptIdx;
	if (promptIdx==0) {
		if (blockIdx>0) {
			newBlockIdx--;
			newPromptIdx=curLevel[newBlockIdx].prompts.length-1;
		}
	} else {
		promptIdx--;
	}
	showPrompt(newBlockIdx, newPromptIdx);
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

function fillEmptyGraphDivs() {
	for (var divIdx=0; divIdx<graphHolderDivs.length; divIdx++) {
		fillEmptyGraphDiv($('#'+graphHolderDivs[divIdx]));
	}
}

function fillEmptyGraphDiv(div) {
	if ($(div).attr('filledWith')=="empty") {
		new GraphBlank(div);
	}
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
	if (val!=0) {
		sign = Math.abs(val)/val;
	}
	return sign;
}
function fracDiff(a, b) {
	return Math.abs(a-b)/Math.min(Math.abs(a), Math.abs(b));
}
function getLen(pts) {
	var len = 0;
	for (var ptIdx=0; ptIdx<pts.length-1; ptIdx++){
		len+=pts[ptIdx].distTo(pts[ptIdx+1]);
	}
	return len;
}
function byAttr(obj, attrVal, attr) {
	if (obj instanceof Array) {
		for(var listIdx=0; listIdx<obj.length; listIdx++){
			if(obj[listIdx][attr]==attrVal){
				return obj[listIdx];
			}
		}
	}else{
		for (var name in obj) {
			if (obj[name][attr]==attrVal){
				return obj[name];
			}
		}
	}
}
function inRect(pos, dims, curCanvas) {
	var mousePos = mouseOffset(curCanvas);
	return mousePos.x>=pos.x && mousePos.x<=(pos.x+dims.dx) && mousePos.y>=pos.y && mousePos.y<=(pos.y+dims.dy);
}
function ptInRect(pos, dims, pt) {
	return pt.x>=pos.x && pt.x<=(pos.x+dims.dx) && pt.y>=pos.y && pt.y<=(pos.y+dims.dy);
}
function extend(old, add) {
	return function(){
		return add(old());
	}
}
function rms(vals) {
	var sum=0;
	for (var valIdx=0; valIdx<vals.length; valIdx++){
		sum+=vals[valIdx]*vals[valIdx]		
	}
	sum/=vals.length;
	return Math.sqrt(sum);
}
globalMousePos = P(0,0);
function mouseOffset(curCanvas) {
	return P(globalMousePos.x - curCanvas.offsetLeft, globalMousePos.y - curCanvas.offsetTop);
}
function mouseOffsetDiv(divId) {
	return P(globalMousePos.x - $('#'+divId).offset().left, globalMousePos.y - $('#'+divId).offset().top);
}
$(document).mousemove(function(e) {
	globalMousePos.x = e.pageX;
	globalMousePos.y = e.pageY;
	for (var mousemoveListener in curLevel.mousemoveListeners.listeners){
		var listener = curLevel.mousemoveListeners.listeners[mousemoveListener]
		listener.func.apply(listener.obj);
	}	
})
$(document).mousedown(function(e) {
	for (var mousedownListener in curLevel.mousedownListeners.listeners){
		var listener = curLevel.mousedownListeners.listeners[mousedownListener]
		listener.func.apply(listener.obj);
	}		
})
$(document).mouseup(function(e) {
	for (var mouseupListener in curLevel.mouseupListeners.listeners){
		var listener = curLevel.mouseupListeners.listeners[mouseupListener]
		listener.func.apply(listener.obj);
	}	
})
function UNLOCK() {
	for (var promptIdx in curLevel.prompts){
		curLevel.prompts[promptIdx].finished=true;
	}
}