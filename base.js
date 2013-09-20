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
/*
function foo() {
	//console.log('START TURN READOUT');
	var dot1 = spcs.spc1.dots[0];
	var dot2 = spcs.spc1.dots[1];
	//var dot3 = spcs.spc1.dots[2];
	var total = dot1.temp() + dot2.temp();// + dot3.temp();
	var shouldBe = keo + dot1.peLast + dot2.peLast + dot3.peLast + attractor.eDebt  - peo;
	var difference = shouldBe-total;
	
	console.log('total ke+ ' + total);
	console.log('should be ' + shouldBe);
	console.log('difference ' + difference);
	if (Math.abs(difference) > 1e-7) {
		console.log('omg');
		console.log(difference);
	}
	//console.log('END TURN READOUT');
}


function HOLDSTILL() {
	spcs.spc1.dots[0].v.dx=0;
	spcs.spc1.dots[0].v.dy=1;
	spcs.spc1.dots[1].v.dx=0;
	spcs.spc1.dots[1].v.dy=1;
	//spcs.spc1.dots[2].v.dx=0;
	//spcs.spc1.dots[2].v.dy=1;
	
	spcs.spc1.dots[0].x=300;
	spcs.spc1.dots[0].y=300;
	spcs.spc1.dots[1].x=310;
	spcs.spc1.dots[1].y=300;
	//spcs.spc1.dots[2].x=330;
	//spcs.spc1.dots[2].y=300;
}
*/


function gauss(avg, stdev){
	var numStdev = (Math.random() + Math.random() + Math.random())-1.5;
	return avg + numStdev*stdev;
}
function bound(val, min, max) {
	return Math.min(Math.max(val, min), max);
}
function stepTowards(cur, setPt, step){
	step = Math.abs(step);
	if (cur < setPt) {
		return Math.min(setPt, cur + step);
	} else {
		return Math.max(setPt, cur - step);
	}
}



function changeTemp(info, newTemp){
	var dots = dotManager.get(info);
	for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
		dots[dotIdx].setTemp(newTemp);
	}
}

function changeRMS(info, newRMS){
	var dots = dotManager.get(info);
	var spcName = info.spcName;
	var tag = info.tag;
	var curRMS = rms(dataHandler.velocities(info));
	var ratio = newRMS/curRMS;
	for (var dotIdx=0; dotIdx<dots.length; dotIdx++){
		dots[dotIdx].v.mult(ratio);
	}
}

function tempToV(mass, temp){
	//T/tConst = 0.5*m*v^2
	temp = 2 * temp / tConst;
	return Math.sqrt(temp / mass);
}
function VToTemp(mass, v){
	return .5 * mass * v * v * tConst;
}

function tempToKE(temp) {
	return temp / tConst;
}

function returnEscapist(dot){
	returnTo = defaultTo(0, dot.returnTo);
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
	return inputVal === undefined ? defaultVal : inputVal;
} 
function validNumber(num){
	return isNaN(num) || num === undefined ? false : num;
}
function round(val, dec){
	var pow = Math.pow(10,dec);
	return Math.round(val*pow)/pow;
}

function averageLast(list, n) {
	var n = Math.min(list.length, n);
	var sum = 0;
	for (var i=list.length - n; i<list.length; i++) {
		sum += list[i];
	}
	return sum / n;
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
		if (!obj[name]) {
			return name;
		} else {
			var uniqueId = 1;
			while (obj[name+uniqueId]) {
				uniqueId++;
			}
			return name+uniqueId;
		}
	}
}


function addListener(object, typeName, funcName, func, obj) {
	object[typeName + 'Listeners'][funcName] = new Listener(func, obj);

}
function addListenerOnce(object, typeName, funcName, func, obj) {
	var execOnce = function() {
		func.apply(obj);
		removeListener(object, typeName, funcName);
	};
	object[typeName + 'Listeners'][funcName] = new Listener(execOnce, undefined);
}

function addInterval(funcHandle, func, obj, interval) {
	extraIntervals[funcHandle] = window.setInterval(function(){func.apply(obj)}, interval);
}
function removeInterval(funcHandle) {
	if (extraIntervals[funcHandle]) {
		window.clearInterval(extraIntervals[funcHandle]);
		extraIntervals[funcHandle] = undefined;
	}
}
function removeListener(object, typeName, funcName){
	// try{
	delete object[typeName + 'Listeners'][funcName];
	// }catch(e){
		// console.log('hafsd');
	// }
}


function Listener(func, obj) {
	this.func = func;
	this.obj = obj;
}

function removeListenerByName(object, typeName, pieceToRemoveBy){
	var didDelete = false;
	var funcName = getListenerByName(object, typeName, pieceToRemoveBy);
	while (funcName!==undefined){
		didDelete = true;
		delete object[typeName + 'Listeners'][funcName];
		funcName = getListenerByName(object, typeName, pieceToRemoveBy);
	}
	return didDelete
}

function makeListenerHolder(obj, name) {
	//obj[name + 'Listeners'] = {listeners:{}, save:{}};
	obj[name + 'Listeners'] = {};
	return obj[name + 'Listeners'];
}
function listenerExists(object, typeName, funcName){
	return object[typeName + 'Listeners'][funcName]!==undefined;
}
function emptyListener(object, typeName){
	object[typeName + 'Listeners'] = {};
}

function getListenerByName(object, typeName, pieceName){
	for (thisFuncName in object[typeName + 'Listeners']) {
		if (thisFuncName.indexOf(pieceName)!=-1) {
			return thisFuncName;
		}
	}
}


function store (attrName, val) {
	stored[attrName] = val;
}
function getStore (attrName) {
	return stored[attrName];
}
function eraseStore (attrName) {
	if (attrName) {
		stored[attrName] = undefined;
	} else {
		stored = {};
	}
}

function getAndEval(sceneElem) {
	if (typeof sceneElem == 'number') {
		return sceneElem;
	} else if (typeof sceneElem == 'string') {
		return interpreter.interpInput(sceneElem);
	} else if (typeof sceneElem == 'boolean') {
		return sceneElem;
	} else if (sceneElem instanceof Point) {
		var x = this.getAndEval(sceneElem.x);
		var y = this.getAndEval(sceneElem.y);
		return P(x, y);
	} else if (sceneElem instanceof Vector) {
		var dx = this.getAndEval(sceneElem.dx);
		var dy = this.getAndEval(sceneElem.dy);
		return V(dx, dy);
	} else if (sceneElem instanceof Color) {
		var r = this.getAndEval(sceneElem.r);
		var g = this.getAndEval(sceneElem.g);
		var b = this.getAndEval(sceneElem.b);
		return Col(r, g, b);
	} else if (sceneElem instanceof Array) {
		var newArr = [];
		for (var idx=0; idx<sceneElem.length; idx++) {
			newArr.push(this.getAndEval(sceneElem[idx]));
		}
		return newArr = newArr;
	} else if (typeof sceneElem == 'function') {
		return sceneElem;
	} else if (sceneElem instanceof Object) {
		var newObj = {};
		for (var name in sceneElem) {
			newObj[name] = this.getAndEval(sceneElem[name])
		}
		return newObj;
	}
}

function deepCopy(object){
	var copy = new object.constructor();

	for (var item in object) {
		if (typeof object[item] == 'object') {
			copy[item] = deepCopy(object[item]);
		} else {
			copy[item] = object[item];
		}
	} 
	return copy;
}


function deepCopySafe(object) {
	var stack = [object];
	var copies = [];
	return deepCopyStep(object, stack, copies);
}

function deepCopyStep(object, stack, copies) {
	var copy;
	try {
		copy = new object.constructor();
	} catch(e) {
		copy = {};
	}
	copies.push(copy);
	for (var key in object) {
		var val = object[key]; 
		if (typeof val == 'object') {
			var idx = stack.indexOf(val);
			if (idx == -1 ){
				copy[key] = deepCopyStep(val, stack.concat([val]), copies.concat());
			} else {
				copy[key] = copies[idx];
			}
			
		} else {
			copy[key] = val;
		}
	}
	return copy;
}



function recordData(handle, list, listener, listenerType){
	var listenerType = defaultTo('record', listenerType)
	store('record' + handle, listenerType);
	var func = listener.func;
	var obj = listener.obj;
	addListener(curLevel, listenerType, handle, function(){list.push(func.apply(obj))}, obj); //was pushnumber.  Changed away so I could push lists. 
}
function recordDataStop(handle){
	var listenerType = getStore('record' + handle);
	removeListener(curLevel, listenerType, handle);
}

function grabAttrs(obj, attrs) {
	var newObj = {};
	for (var objLet in obj) {
		newObj[objLet] = {};
		for (var i=0; i<attrs.length; i++) {
			newObj[objLet][attrs[i]] = obj[objLet][attrs[i]];
		}
	}
	return newObj;
}

function execListeners(listeners) {
	for (var name in listeners) {
		var listener = listeners[name];
		listener.func.apply(listener.obj);
	}
}

function makeSlider(titleWrapperDiv, sliderWrapperDiv, sliderDivSelector, sliderDivId, title, attrs, handlers, initVisibility){
	// var wrapperDiv = $('#' + wrapperDivId);
	var titleHTML = '';
	var sliderHTML = '';
	// wrapperDiv.html('');
	titleHTML += templater.center({innerHTML: title}); // need to deal with this center.  Don't always want to do that
	sliderHTML += templater.div({
		attrs: {
			id:	[sliderDivId + 'parent']
		},
		style: {
			padding: '5px'
		},
		innerHTML: templater.div(
			{
			attrs: {
				id: [sliderDivId]
			}
		})
	})
	
	titleWrapperDiv.append(titleHTML);
	sliderWrapperDiv.append(sliderHTML);
	var divParent = $(sliderDivSelector + 'parent');
	var sliderDiv = $(sliderDivSelector);
	if (!divParent.length || !sliderDiv.length) {
		divParent
	}
	//sliderDiv.slider({});
	addJQueryElems($(sliderDiv), 'slider');
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
		} else {
			sliderBind(sliderDiv, eventType, func, obj);
		}
		
	}
	if (initVisibility) {
		div[initVisibility]();
	}
	sliderList.push(sliderDivId);
	return [titleWrapperDiv, sliderWrapperDiv];//YOU WERE HERE.
}
function sliderBind(div, eventType, func, obj){
	div.bind(eventType, function(event, ui){func.apply(obj, [event, ui])});
	return div;
}

function addJQueryElems(elems, funcName) {
	elems = elems instanceof Array ? elems : [elems];
	for (var elemIdx=0; elemIdx<elems.length; elemIdx++) {
		var elem = elems[elemIdx];
		$(elem)[funcName]();
		recursiveAddClass(elem, globalHTMLClass);
	}

}


function recursiveAddClass(elem, HTMLClass) {
	$(elem).addClass(HTMLClass);
	var children = $(elem).children();
	for (var childIdx=0; childIdx<children.length; childIdx++) {
		var child = $(children[childIdx]);
		recursiveAddClass(child, HTMLClass);
	}
	
}

function stringTogetherGET(obj) {
	var strs = []
	for (var a in obj) {
		strs.push(a + '=' + obj[a]);
	}
	return strs.join('&');
}

function sendToCW(string, CWTriggerId) {
	var request = new XMLHttpRequest();
	var string64 = window.btoa(string);
	var get;
	if (/^(http|https)/.test(document.URL)) {
		get = window.stringTogetherGET({'goto': 'simulation', command: 'send_answer', question_id: CWTriggerId, answer_text_64: string64});
		request.open("GET", "CW.php?" + get, true);
		request.send(null);
	}
}

function hideSliders(){
	for (var handleIdx=0; handleIdx<sliderList.length; idIdx++){
		var handle = sliderList[handleIdx];
		$('#'+ handle).hide();
	}
}
function S(newSectionIdx, newPromptIdx, forceReset) {
	sceneNavigator.showPrompt(newSectionIdx, newPromptIdx, forceReset)
}

function alertValid(str) {
	if (str!==undefined && str!='') {
		alert(str);
	}
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
function angleToUV(dir) {
	return V(Math.cos(dir), Math.sin(dir));
}
function UVToAngle(UV) {
	return Math.atan2(UV.dy, UV.dx);
}
function getSign(val){
	return val < 0 ? -1 : 1;
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

function exprHasReturn(expr) {
	return /(\(|\:|\?|\s|\{)return/.test(' ' + expr);
}
function byAttr(obj, attrVal, attr) {
	if (obj instanceof Array) {
		for(var listIdx=0; listIdx<obj.length; listIdx++){
			if(obj[listIdx][attr]==attrVal){
				return obj[listIdx];
			}
		}
	} else {
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

function getNth(obj, n) {
	var i = 0;
	for (var a in obj) {
		if (i++ == n) return obj[a];
	}
}

function countAttrs(obj) {
	var count = 0;
	for (var a in obj) count++;
	return count;
}
function objectsEqual(a, b) {
	return Math.min(objectsEqualInDirection(a, b), objectsEqualInDirection(b, a));
	
}
function objectsEqualInDirection(a, b) {
	for (var alet in a) {
		if (b && b.hasOwnProperty(alet)) {
			if (typeof a[alet] == 'object') {
				if (!objectsEqual(a[alet], b[alet])) {
					return false;
				}
			} else {
				if (a[alet] != b[alet]) {
					return false;
				}
			}
		} else {
			return false;
		}
	}
	return true;
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
	var offset = $(curCanvas).offset();
	return P(globalMousePos.x - offset.left, globalMousePos.y - offset.top);
}
function mouseOffsetDiv(divId) {
	var offset = $('#' + divId).offset();
	return P(globalMousePos.x - offset.left, globalMousePos.y - offset.top);
}
$(document).mousemove(function(e) {
	globalMousePos.x = e.pageX;
	globalMousePos.y = e.pageY;
	for (var mousemoveListener in curLevel.mousemoveListeners){
		var listener = curLevel.mousemoveListeners[mousemoveListener]
		listener.func.apply(listener.obj);
	}	
})
$(document).mousedown(function(e) {
	for (var mousedownListener in curLevel.mousedownListeners){
		var listener = curLevel.mousedownListeners[mousedownListener]
		listener.func.apply(listener.obj);
	}		
})
$(document).mouseup(function(e) {
	for (var mouseupListener in curLevel.mouseupListeners){
		var listener = curLevel.mouseupListeners[mouseupListener]
		listener.func.apply(listener.obj);
	}	
})