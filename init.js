$(function(){
	//R is defined at the top of base so it can be used in level data
	MathJax.Hub.Config({tex2jax: {inlineMath: [['##','##'], ['\\(','\\)']], displayMath: [['$$', '$$']]}});
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
		Hist: GraphHist,
		Phase: GraphPhase
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
	N = 1000;//Avagadro's number
	R = 8.314;
	KB = R / N;
	//set compAdj to '' have collisions for cv of R, cp of 2R
	cv = 1.5*R;
	cp = 2.5*R;
	//compAdj = '32';
	extraIntervals = {};
	vConst = 1/10000;
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
	workConst = .158e-3;//for kJ;
	updateInterval = 30;//500;
	dataInterval = 1250;
	borderCol = Col(155,155,155);
	pxToMS = 19.33821;
	auxHolderDivs = ['aux1', 'aux2'];
	promptIdx = 0;
	sectionIdx = 0;
	//sliderList = [];  FE
	//spcs = {};  FE
	stored = {};
	//window.dataDisplayer = new DataDisplayer(); FE in
	draw = new DrawingTools();
	//collide = new CollideHandler(); FE
	attractor = new Attractor();
	turnUpdater = setInterval('curLevel.update()', updateInterval);
	dataUpdater = setInterval('curLevel.updateData()', dataInterval);
	animText = new AnimText(c);
	renderer = new Renderer();
	phaseEquilGenerator = new PhaseEquilGenerator();
	sceneNavigator = new SceneNavigator();
	interpreter = new ExpressionInterpreter();
	timeline = new Timeline();
	//buttonManager = new ButtonManager($('#buttonManager')); FE
	//dataHandler = new DataHandler(); FE
	canvasHeight = 450;
	myCanvas.width = $('#main').width();

	myCanvas.height = canvasHeight;
	//LevelTools.addSpcs(LevelData.spcDefs, window.spcs); FE
	
	LevelTools.addImgs(LevelData);
	LevelTools.setDefaultPromptVals(LevelData);
	LevelTools.showRunDivs();
	addJQueryElems($('button'), 'button');
	$('#resetExp').click(function(){curLevel.reset()});
	$('#toSim').click(function(){sceneNavigator.nextPrompt()});
	$('#toLastStep').click(function(){sceneNavigator.prevPrompt()});
	$('#previous').click(function(){sceneNavigator.prevPrompt()});
	$('#next').click(function(){sceneNavigator.nextPrompt()});	
	for (var sectionIdx=0; sectionIdx<LevelData.sections.length; sectionIdx++) {
		timeline.pushSection(LevelData.sections[sectionIdx]);
	}
	window.currentSetupType = 'section'; //to be depricated
	timeline.showSection(0);
	//window.curLevel = new LevelData();
	//curLevel.cutSceneEnd();
	//curLevel.init();
	// myCanvas.width = $('#main').width();
	// canvasHeight = 450;
	// animText = new AnimText(c);
	// myCanvas.height = canvasHeight;
	// renderer = new Renderer();
	// window.curLevel = new LevelTemplate();
	// curLevel.cutSceneEnd();
	// curLevel.init();
	// addJQueryElems($('button'), 'button');
	// $('#resetExp').click(function(){curLevel.reset()});
	// $('#toSim').click(function(){nextPrompt()});
	// $('#toLastStep').click(function(){prevPrompt()});
	// $('#previous').click(function(){prevPrompt()});
	// $('#next').click(function(){nextPrompt()});
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