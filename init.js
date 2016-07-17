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
window.R = 8.314;
$(function(){
	
	window.IMGPATHPREFIX = '';
	window.simHost = window.simHost || '';
	if (window.simHost == 'CW') {
		window.IMGPATHPREFIX = 'content/sims/levels/'
	}
	$('#resetExp').append("<img src='" + IMGPATHPREFIX + "img/refresh.gif'></img>");
	//console.log('MATHJAX CONFIG IS COMMENTED OUT')
	MathJax.Hub.Config({tex2jax: {inlineMath: [['##','##'], ['\\(','\\)']], displayMath: [['$$', '$$']]}});
	_.extend(Array.prototype, toInherit.ArrayExtenders);
	_.extend(Math, toInherit.MathExtenders);
	_.extend(String.prototype, toInherit.StringExtenders);
	templater = new Templater();
	globalHTMLClass = 'sim';
	//hoverCol = Col(0, 81, 117); defined in quiz renderer
	dotManager = new DotManager();
	turn = 0;
	window.Graphs = {
		Scatter: GraphScatter,
		Hist: GraphHist,
		PhaseTwoComp: GraphPhaseTwoComp,
		PhaseOneComp: GraphPhaseOneComp
	}
	$('#mainHeader').html(LevelData.levelTitle);
	//why are we even doing all this hiding?
	$('#canvasDiv').hide();
	$('#base').hide();
	$('#dashIntro').hide();
	//$('#dashRun').hide();
	$('#dashOutro').hide();
	$('#dashCutScene').hide();
	$('#display').hide();
	$('#intText').hide();
	canvas = document.getElementById("myCanvas");
	c = canvas.getContext("2d");	
	N = 1000;//Avagadro's number
	R = 8.314;
	KB = R / N;
	extraIntervals = {};
	vConst = 1e-4;
	//pConst = 16.1423; //for atm
	pConst = 16.3562; //for bar
	tConst = 20;
	LtoM3 = .001;
	ATMtoPA = 101325;
	BARTOPA = 100000;
	PUNITTOPA = BARTOPA; //current pressure unit to pascals
	MMHGTOBAR = .0013332237;
	JtoKJ = .001;
	//To get nice numbers with this, 1 mass in here coresponds to weight of 10 g/mol 
	pxToE = Math.sqrt(tConst); //gotten for a dot... T = 1/2*m*(v*pxToE)^2.  For energy conservation in attraction. 
	ACTUALN = 6.022e23;
	g = 1.75;
	gInternal = .01;
	updateInterval = 30;
	dataInterval = 1250;
	borderCol = Col(155,155,155);
	pxToMS = 19.33821;
	auxHolderDivs = ['aux1', 'aux2'];
	stored = {};
	storedGraphs = {};
	addJQueryElems($('button'), 'button');
	draw = new DrawingTools();
	turnUpdater = setInterval('curLevel.update()', updateInterval);
	dataUpdater = setInterval('curLevel.updateData()', dataInterval);
	attractor = new Attractor();
	animText = new AnimText(c);
	phaseEquilGenerator = new PhaseEquilGenerator();
	dotMigrator = new DotMigrator();
	quizRenderer = new QuizRenderer();
	sceneNavigator = new SceneNavigator();
	interpreter = new ExpressionInterpreter();
	$('#resetExp').click(function(){sceneNavigator.refresh();});
	$('#toSim').click(function(){sceneNavigator.nextPrompt()});
	$('#toLastStep').click(function(){sceneNavigator.prevPrompt()});
	$('#previous').click(function(){sceneNavigator.prevPrompt()});
	$('#next').click(function(){sceneNavigator.nextPrompt()});	
	window.dashRunId = 0;
	timeline = new Timeline();
	canvasHeight = 450;
	myCanvas.width = $('#main').width();

	myCanvas.height = canvasHeight;
	var questionId = 0;
	LevelTools.addUF298(LevelData.spcDefs);
	LevelTools.addCp(LevelData.spcDefs);
	questionId = LevelTools.addImgsAndQuestionIds(LevelData.mainSequence, questionId);
	LevelTools.assumeDefaultRxnType(LevelData.mainSequence);
	LevelTools.setDefaultPromptVals(LevelData.mainSequence);
	LevelTools.addTriggerCleanUp(LevelData.mainSequence);
	LevelTools.addStoreAs(LevelData.mainSequence);
	LevelTools.transferObjCleanUp(LevelData.mainSequence);
	LevelTools.showRunDivs();
	var branchId = 0;
	for (var auxSectionName in LevelData.auxSections) {
		var auxSections = LevelData.auxSections[auxSectionName];
		auxSections = auxSections instanceof Array ? auxSections : [auxSections];
		questionId = LevelTools.addImgsAndQuestionIds(auxSections, questionId);
		auxSections.id = branchId;
		branchId ++;
		LevelTools.assumeDefaultRxnType(auxSections);
		LevelTools.setDefaultPromptVals(auxSections);
		LevelTools.addTriggerCleanUp(auxSections);
		LevelTools.addStoreAs(auxSections);
		LevelTools.transferObjCleanUp(auxSections);		
	}
	
	for (var auxPromptsName in LevelData.auxPrompts) {
		var auxPrompts = LevelData.auxPrompts[auxPromptsName];
		auxPrompts = auxPrompts instanceof Array ? auxPrompts : [auxPrompts];
		var asSections = [{prompts: auxPrompts}];
		questionId = LevelTools.addImgsAndQuestionIds(asSections, questionId);
		auxPrompts.id = branchId;
		branchId ++;
		LevelTools.assumeDefaultRxnType(asSections);
		LevelTools.setDefaultPromptVals(asSections);
		LevelTools.addTriggerCleanUp(asSections);
		LevelTools.addStoreAs(asSections);
		LevelTools.transferObjCleanUp(asSections);	
	}

	for (var sectionIdx=0; sectionIdx<LevelData.mainSequence.length; sectionIdx++) {
		timeline.pushSection(LevelData.mainSequence[sectionIdx]);
	}
	timeline.show(0, 0);

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
	} else if (counted==500){
		console.log(total);
		counted=0;
		total=0;
	}
	*/
})
