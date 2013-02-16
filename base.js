//shared startup stuff
$(function(){
	_.extend(Array.prototype, toInherit.ArrayExtenders);
	_.extend(Math, toInherit.MathExtenders);
	_.extend(String.prototype, toInherit.StringExtenders);
	templater = new Templater();
	//String.prototype.killWhiteSpace = StringExtenders.killWhiteSpace;
	globalHTMLClass = 'sim';
	hoverCol = Col(0, 81, 117);
	dotManager = new DotManager();
	turn = 0;
	window.Graphs = {
		Scatter: GraphScatter,
		Hist: GraphHist
	}
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
	PUNITTOPA = BARTOPA; //current pressure unit to pascals
	JtoKJ = .001;
	N = 1000;//Avagadro's number
	//To get nice numbers with this, 1 mass in here coresponds to weight of 10 g/mol 
	pxToE = Math.sqrt(tConst); //gotten for a dot... T = 1/2*m*(v*pxToE)^2.  For energy conservation in attraction. 
	KB = 1.38*Math.pow(10,-23)
	ACTUALN = 6.022e23;
	g = 1.75;
	gInternal = .01;
	workConst = .158e-3;//for kJ;
	updateInterval = 30;//500;
	dataInterval = 1250;
	borderCol = Col(155,155,155);
	pxToMS = 19.33821;
	auxHolderDivs = ['aux1', 'aux2'];
	promptIdx = 0;
	sectionIdx = 0;
	sliderList = [];
	spcs = {};
	stored = {};
	draw = new DrawingTools();
	collide = new CollideHandler();
	attractor = new Attractor();
	turnUpdater = setInterval('curLevel.update()', updateInterval);
	dataUpdater = setInterval('curLevel.updateData()', dataInterval);

	started = false;
	counted = 0;
	total = 0;
	/*Timing stuff

	if(started){
		var then = Date.now();
	}	
	//stuff to time goes here
	if(started&&counted<500){
		counted++;
		total+=Date.now()-then;
	} else if (counted==500){
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
function boundedStep(cur, setPt, step){
	step = Math.abs(step);
	var sign = 1;
	if (cur==setPt) {
		return cur;
	} else {
		var dist = setPt-cur;
		sign = Math.abs(dist)/dist;
	}
	cur*=sign;
	setPt*=sign;
	return sign*Math.min(cur+step, setPt);
}
function addSpecies(toAdd){
	var didAdd = false;
	if (String(toAdd)===toAdd) {
		if (!spcs[toAdd] && toAdd) {
			var def = speciesDefs[toAdd];
			spcs[toAdd] = new Species(def.m, def.r, def.cols, def);
			didAdd = true;
		}
		
	} else if (toAdd instanceof Array) {
		for (var toAddIdx=0; toAddIdx<toAdd.length; toAddIdx++){
			var name = toAdd[toAddIdx];
			if (!spcs[name] && name) {
				var def = speciesDefs[name];
				spcs[name] = new Species(def.m, def.r, def.cols, def);
				didAdd = true;
			}
		}
	}
	if (didAdd) {
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
	return isNaN(num) ? false : num;
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

function addListener(object, typeName, funcName, func, destObj){
	//try{
	object[typeName + 'Listeners'].listeners[funcName] = {func:func, obj:destObj};
	//}catch(e){console.trace()}
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
function removeInterval(funcHandle) {
	if (extraIntervals[funcHandle]) {
		window.clearInterval(extraIntervals[funcHandle]);
		extraIntervals[funcHandle] = undefined;
	}
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
	object[typeName + 'Listeners'].listeners = {};
}
function emptySave(object, typeName){
	object[typeName + 'Listeners'].save = {};
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

function deepCopy(object){
	var copy = new object.constructor();
	for (var item in object){
		if (typeof object[item] == 'object') {
			copy[item] = deepCopy(object[item]);
		} else {
			copy[item] = object[item];
		}
	} 
	return copy;
}



function recordData(handle, list, func, obj, listenerType){
	var listenerType = defaultTo('record', listenerType)
	store('record' + handle, listenerType);
	addListener(window['curLevel'], listenerType, handle, function(){list.push(func.apply(obj))}, obj); //was pushnumber.  Changed away so I could push lists. 
}
function recordDataStop(handle){
	var listenerType = getStore('record' + handle);
	removeListener(window['curLevel'], listenerType, handle);
}

function makeSlider(wrapperDivId, sliderDivId, title, attrs, handlers, initVisibility){
	var wrapperDiv = $('#' + wrapperDivId);
	var html = '';
	wrapperDiv.html('');
	html += templater.center({innerHTML: title});
	html += templater.div({
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
	
	wrapperDiv.append(html);
	var divParent = $('#'+sliderDivId+'parent');
	var sliderDiv = $('#' + sliderDivId);
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
	return wrapperDiv;
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
function getObjFromPath(objPath, curObj) {
	if (!objPath || objPath == '') {
		return curObj
	}
	var nextDir = /[^\.]{1,}/.exec(objPath)[0];
	objPath = objPath.slice(objPath.indexOf(nextDir) + nextDir.length, objPath.length);
	newObj = curObj[nextDir];
	if (newObj) {
		return getObjFromPath(objPath, newObj);
	} else {
		console.log('tried to get bad obj path ' + objPath + ' from object ' + curObj);
		console.trace();
		return  
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

function addButton(id, text, divId){
	divId = defaultTo('buttons', divId);
	$('#'+divId).append(templater.button({attrs: {id: [id]}}));
	var button = $('button#'+id);
	addJqueryElem(button, 'button');
	return button;
}
function removeButton(id) {
	$('#'+id).remove();
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
function S(newSectionIdx, newPromptIdx, forceReset) {
	showPrompt(newSectionIdx, newPromptIdx, forceReset)
}
function showPrompt(newSectionIdx, newPromptIdx, forceReset){
	var newSection = window['curLevel'].sections[newSectionIdx];
	var newPrompt = newSection.prompts[newPromptIdx];
	var changedSection = newSectionIdx!=sectionIdx;
	var promptIdxsToClean = getpromptIdxsToClean(newSectionIdx, newPromptIdx);
	
	promptIdxsToClean.applyFunc(function(idx){
		curLevel.promptCleanUp(idx);
	})
	
	
	//emptyListener(curLevel, 'promptCleanUp');
	emptyListener(curLevel, 'promptCondition');
	if (changedSection) {
		curLevel.makePromptCleanUpHolders(newSectionIdx);
	}
	if (changedSection || forceReset) {
		curLevel.saveAllGraphs();
		curLevel.freezeAllGraphs();
		curLevel.removeAllGraphs();
		dotManager.clearAll();		

		curLevel.sectionCleanUp();
		
		emptyListener(curLevel, 'sectionCleanUp');
		emptyListener(curLevel, 'sectionCondition');
		//attn - once setup is out of use, remove the condition that checks for it
		if (newSection.setup) {
			renderer.render(newSection.setup);
		} else {
			renderer.render(newSection.sceneData);
		}

		
		addListener(curLevel, 'sectionCleanUp', 'removeArrowAndText',
			function(){
				removeListenerByName(curLevel, 'update', 'drawArrow');
				removeListenerByName(curLevel, 'update', 'animText');
			},
		this);
		curLevel.delayGraphs();
	}
	if (newPrompt.setup) {
		renderer.render(newPrompt.setup);
	} else {
		renderer.render(newPrompt.sceneData);
	}

	if (!newPrompt.quiz) {
		$('#nextPrevDiv').show();
	}
	sectionIdx = newSectionIdx;
	promptIdx = newPromptIdx;
	if (newPrompt.cutScene) {	
		window['curLevel'].cutSceneStart(newPrompt.text, newPrompt.cutScene, newPrompt.quiz)
	} else {
		if (newPrompt.quiz) {
			var quiz = newPrompt.quiz;
			//$('#nextPrevDiv').hide();
			$('#prompt').html(defaultTo('', templater.div({innerHTML: newPrompt.text})));
			window['curLevel'].appendQuiz(newPrompt.quiz, $('#prompt'))
		} else {
			$('#prompt').html(templater.div({innerHTML: newPrompt.text}));
		}
	}
	$('#baseHeader').html(newPrompt.title);



}

function getpromptIdxsToClean(newSectionIdx, newPromptIdx) {
	//attn please - this only works for going forwards
	//would need to make like an 'added by' tag for backwards to work
	var curSection = window['curLevel'].sections[sectionIdx];
	if (newSectionIdx>sectionIdx || (sectionIdx==newSectionIdx && newPromptIdx>promptIdx)) {
		var cleanUps = []
		for (var pIdx=promptIdx; pIdx<curSection.prompts.length; pIdx++) {
			cleanUps.push(pIdx);
		}
		return cleanUps;
	} else {
		return [promptIdx];
	}
}

function nextPrompt(forceAdvance){
	var curSection = window['curLevel'].sections[sectionIdx];
	var curPrompt = defaultTo({}, curSection.prompts[promptIdx]);
	
	if (forceAdvance) {
		var willAdvance = true;
	} else {
		var willAdvance = checkWillAdvance();
	}
	if (willAdvance) {
		if (curPrompt) {
			curPrompt.finished = true;
		}
		var nextIdxs = getNextIdxs()
		showPrompt(nextIdxs.newSectionIdx, nextIdxs.newPromptIdx);
		return true;
	}
	return false;
	
}

function getNextIdxs() {
	var newSectionIdx = sectionIdx;
	var newPromptIdx = promptIdx;
	var curSection = window['curLevel'].sections[sectionIdx];
	if (promptIdx+1==curSection.prompts.length) {
		if (sectionIdx+1 < window['curLevel'].sections.length) {
			newSectionIdx++;
			newPromptIdx=0;
		}
	} else {
		newPromptIdx++;
	}
	return {newSectionIdx:newSectionIdx, newPromptIdx:newPromptIdx};
}

function getPrevIdxs() {
	var newSectionIdx = sectionIdx;
	var newPromptIdx = promptIdx;
	if (promptIdx==0) {
		if (sectionIdx>0) {
			newSectionIdx--;
			newPromptIdx=window['curLevel'].sections[newSectionIdx].prompts.length-1;
		}
	} else {
		newPromptIdx--;
	}
	return {newSectionIdx:newSectionIdx, newPromptIdx:newPromptIdx};
}

function checkWillAdvance() {
	var nextIdxs = getNextIdxs();
	var newSectionIdx = nextIdxs.newSectionIdx;
	var newPromptIdx = nextIdxs.newPromptIdx;
	var willAdvance = 1;
	willAdvance = Math.min(willAdvance, checkWillAdvanceConditions(newSectionIdx, newPromptIdx));
	if (willAdvance) {
		willAdvance = Math.min(willAdvance, checkWillAdvanceQuiz());
	}
	return willAdvance;
}

function checkWillAdvanceConditions(newSectionIdx, newPromptIdx){

	var changingSection = sectionIdx!=newSectionIdx;
	var conditionsMet = 0;
	var curPrompt = defaultTo({}, curLevel.sections[sectionIdx].prompts[promptIdx]);
	var curFinished = defaultTo(false, curPrompt.finished);
	
	conditionsMet = Math.max(conditionsMet, curFinished);
	if (!conditionsMet) {
		var promptResults = curLevel.promptConditions();
		if (promptResults.didWin) {
			if (changingSection) {
				var sectionResults = curLevel.sectionConditions();
				if (sectionResults.didWin) {
					conditionsMet = 1;
				} else {
					conditionsMet = 0;
					alertValid(sectionResults.alert);
				}
			} else {
				conditionsMet = 1;
			}
		} else {
			conditionsMet = 0;
			alertValid(promptResults.alert);
		}
	}
	return conditionsMet;
}

function execListOnObj(list, obj) {
	for (var listIdx=0; listIdx<list.length; listIdx++) {
		list[listIdx].apply(obj);
	}
}

function checkWillAdvanceQuiz(){
	//isCorrect will alert for wrong answers and maybe for no answer (if text box, I guess)
	var allCorrect = 1;
	var quiz = curLevel.quiz;
	if (quiz && quiz.length>0) {
		if (!quiz.allAnswered()) {
			alert("You haven't answered all the questions");
			return 0;
		} else {
			for (var questionIdx=0; questionIdx<quiz.length; questionIdx++) {
				var question = quiz[questionIdx];
				allCorrect = Math.min(allCorrect, question.isCorrect());
			}
			return allCorrect;
		}
	} else {
		return allCorrect;
	}	
	
}

function prevPrompt(){
	var prevIdxs = getPrevIdxs();
	showPrompt(prevIdxs.newSectionIdx, prevIdxs.newPromptIdx);
}

/*
Ahem, I am redefining how get, eval, and img are done.  
get(idStr, type ('int', 'float', 'string'), default, min, max)
eval(expr, decPlaces, default, min, max)
img(path, breakStyle (p, br), center (boolean))
*/

function addStored(text) {
	return text.replace(/get[\s]*\([A-Za-z0-9,\s\-\.]*\)/g, function(subStr, idx) {
		var args = sliceArgs(subStr);
		var idStr = args[0];
		var type = args[1];
		var defVal = args[2];
		var min = Number(args[3]);
		var max = Number(args[4]);
		var isInt = type == 'int';
		var isFloat = type == 'float';
		var isNum = isInt || isFloat;
		var isStr = type == 'string';
		if (type == 'int' || type == 'float') defVal = Number(defVal);
		
		var gotten = getStore(idStr);
		var val;
		if (gotten) {
			if (isInt) {
				val = Math.round(parseFloat(gotten));
			} else if (isFloat) {
				val = parseFloat(gotten);
			} else if (isStr) {
				val = gotten.sanitize();
			}
			if (isNum) {
				if (min === undefined || isNaN(min)) min = val;
				if (max === undefined || isNaN(max)) max = val;
				val = Math.max(min, Math.min(max, val));
			}
		}
		
		if (val === undefined || isNaN(val)) {
			val = defVal;
		}
		return val;
	})
}



function evalText(text) {
	if (typeof text == 'number') return;
	text = text.replace(/eval[\s]*\([0-9\(\)\+\-\*\/\s,\.]*\)/g, function(evalItem, idx) {
		var args = sliceArgs(evalItem);
		var expr = args[0];
		var decPlaces = args[1];
		var def = args[2];
		var min = args[3];
		var max = args[4];
		var val;
		try {
			val = eval(expr);
		} catch(e) {
			console.log('Bad eval ' + evalItem + ', expr is ' + expr);
		}
		
		val = Math.max(min, Math.min(max, val));
		if (val === undefined || isNaN(val) && def !== undefined && !isNaN(def)) {
			val = def;
		}
		if (val !== undefined && !isNaN(val)) { //my round doesn't have any error handling, so need to do that here
			if (min === undefined || isNaN(min)) min = val;
			if (max === undefined || isNaN(max)) max = val;
			if (decPlaces > 0 || decPlaces === 0) val = round(val, Math.round(decPlaces));
		}
		return val;
	})
	var toReturn = Number(text) == text ? Number(text) : text;
	return toReturn;
}

function addImgs(text){
	return text.replace(/img[\s]*\([A-Za-z0-9\+\-\*\/\s,\.]*\)/g, function(imgFunc, idx) {
		var args = sliceArgs(imgFunc);
		var path = args[0];
		var breakStyle = args[1];
		var center = args[2];
		var imgHTML = templater.img({attrs: {src: [path]}});
		
		if (center) {
			imgHTML = templater.center({innerHTML: ingHTML});
		}
		if (breakStyle == 'br') {
			imgHTML = templater.br() + imgHTML + templater.br();
		} else if (breakStyle == 'p') {
			imgHTML = templater.p({innerHTML: imgHTML});
		}
		return imgHTML;
	})
}



function sliceArgs(expr) {
	var args = [];
	var working = expr;
	working = working.replace(/[A-Za-z0-9\s-]*\(/, '');
	working = working.replace(')', '');
	working += ','; //if you'll pardon the slop, just adding a comma to the end is a really easy way to make the below function work for the last argument in a function
	var hasCommas = working.indexOf(',') > -1;
	while (hasCommas) {
		var idx = working.indexOf(',');
		args.push(working.slice(0, idx).killWhiteSpace());
		working = working.slice(idx + 1, working.length);
		hasCommas = working.indexOf(',') > -1;
	}
	return args;	
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
function nameVar(str) {
	if (currentSetupType=='section') {
		return str + 'S' + sectionIdx;
	} else {
		return str + 'S' + sectionIdx + 'P' + promptIdx;
	}
	 
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