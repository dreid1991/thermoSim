function IdealGasLaw(){
	dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.e = [];
	this.eUnits = 'kJ';
	this.bgCol = Col(5, 17, 26);
	this.wallCol = Col(255,255,255);
	this.numUpdates = 0;
	this.forceInternal = 0;
	this.wallV = 0;
	this.wallSpeed = 1;
	this.makeListeners()
	this.readout = new Readout('mainReadout', 30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this);
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.prompts=[
		{block:0, title: "", finished: false, text:""},
		{block:1, title: "Current step", finished: false, conditions: this.block1Conditions, text:"Alright, let’s figure out what temperature looks like.  Above, we have one molecule, and I submit to you that this molecule has a temperature.  The equation for a molecule’s temperature is as follows: 1.5k<sub>b</sub>T = 0.5mv<sup>2</sup>, where k<sub>b</sub> in the boltzmann constant, T is temperature, m is the molecule’s mass, and v is its speed.  This tells us that temperature is an expression of molecular kinetic energy.  The slider above changes the molecule’s temperature.  If you double the molecule’s temperature, by what factor will its speed increase?  What would a graph of this molecule’s speed with respect to temperature look like?"},
		{block:2, title: "Current step", finished: false, text:"Now suppose we have many molecules.  We know from before that we can assign a temperature to each molecule based on its mass and speed.  We also know that the system as a whole must have a temperature since a thermometer gives only one number.  We can guess that the bulk temperature must be based on the individual molecules’ temperatures, and we’d be right.  The bulk temperature is the average of all the molecules’ temperatures."},
		{block:3, title: "Current step", finished: false, text:"These two containers hold the same type of molecule.  Just so we're on the same page, which of the containers has a higher temperature and why?"},
		{block:4, title: "Current step", finished: false, text:"Now how do the temperatures of these two new systems compare?  The masses of the particles are 3 g/mol and 8 g/mol respectively.  RMS (above) stands for <a href=http://en.wikipedia.org/wiki/Root_mean_square#Definition target='_blank'>root mean squared</a>, which is the average of the squares of all of the velocities, square rooted.  Since we know that temperature is proportional to average kinetic energy, this can definitely be used to calculate average kinetic energy."},
		{block:5, title: "", 			 finished: false, text:""},
		{block:6, title: "Current step", finished: false, conditions: this.block6Conditions, text:"Now I have a challenge for you: Make the gases in these two containers be the same temperature.  The molecular masses are 2 g/mol and 8 g/mol respectively.  The two sliders change the RMS of the velocities of their corresponding molecules.  Remember, temperature is proportional to average kinetic energy.<br>Note: A correct answer can be calculated, you don't need to guess and check."},
		{block:7, title: "Current step", finished: false, text:""},
		{block:8, title: "Current step", finished: false, text:"Okay, let’s look at pressure.  A pressure is a force per area.  This tells us that gases at non-zero pressure must exert a force on their container.  In the system above, what event causes a force to be exerted on the wall?"},
		{block:9, title: "Current step", finished: false, conditions: this.block9Conditions, text:"It might be simpler if we look at just one molecule.  Every time the molecule hits the wall, its momentum changes.  If we average that change out over the time between each hit, we get an average force applied which can then be related to a pressure.  How would the momentum change of collision and the frequency of collision change with speed, and how might this relate to pressure?  You can use the slider to change the molecule’s temperature to check your ideas."},
		{block:10, title: "Current step", finished: false, text:"", start:this.block10aStart},
		{block:10, title: "Current step", finished: false, text:"", start:this.block10bStart},
		{block:10, title: "", 			 finished: false, text:"", start:this.block10cStart},
		{block:11, title: "Current step", finished: false, conditions: this.block11aConditions, start:this.block11aStart, cleanUp: this.block11aCleanUp, text:"So let’s consider a constant temperature container.  You can use the yellow arrow to change the container volume.  Try halving  the volume of this container.  We know from the ideal gas law that if you halve the volume and hold the temperature constant, the pressure will double, right?  Can you explain why this happens in terms of the number of molecular collisions with the wall?"},
		{block:11, title: "Current step", finished: false, conditions: this.block11bConditions, start:this.block11bStart, cleanUp: this.block11bCleanUp, text:"Now try halving the volume again.  How do the pressure and number of collisions behave this time?"},
		{block:12, title: "Current step", finished: false, text: ""},
		{block:13, title: "", finished: false, text: ""},
		{block:14, title: "", finished: false, text: ""},
	]
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.minY = 30;
	this.maxY = 350;
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	collide.setDefaultHandler({func:collide.impactStd, obj:collide})
	

	
}

_.extend(IdealGasLaw.prototype, LevelTools.prototype, WallCollideMethods.prototype,
{
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},
	block0Start: function(){
		//var ptsToBorder = this.getPtsToBorder();
		//border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container',c);
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.hideDash();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#graphs').hide()
		$('#display').show();
		$('#intText').show().html("<p>Good morning!</p><p>Today, we’re going to consider the ideal gas law.  Specifically, we’re going to figure out why PV does in fact equal nRT, and we’re going to do so from a molecular perspective.  To do this, we’ll need to look at how temperature, pressure, and volume represent themselves on a molecular level. Once that’s understood, we can try to build the relations in the ideal gas law ourselves to get a better understanding of why they're true. </p><p>Let’s begin, shall we?</p>");
		$('#dashIntro').show();
		
	},
	block0CleanUp: function(){
		this.hideDash();
		$('#intText').hide()
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();
		loadListener(this, 'update');
		loadListener(this, 'data');		
	},
	block1Start: function(){
		$('#longSliderHolder').show();
		this.playedWithSlider = new Boolean();
		this.playedWithSlider = false;
		$('#clearGraphs').hide();
		$('#sliderTemp').show();
		
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		;
		populate('spc4', P(45,35), V(450, 350), 1, 300);
		var dot = spcs.spc4.dots[0]
		this.readout.addEntry('temp', "Molecule's temperature:", 'K', dataHandler.temp(), 0, 0);
		this.readout.addEntry('speed', "Speed:", 'm/s', dot.speed(),0,0);
		this.readout.resetAll();
		this.readout.show();
		var temp = spcs.spc4.dots[0].temp();
		$('#sliderTemp').slider('option', {value:temp});
	},
	block1Conditions: function(){
		if(this.playedWithSlider){
			return {result:true};
		}else{
			return {result:false, alert:'Play with the slider, I insist'};
		}
	},
	block1CleanUp: function(){
		this.playedWithSlider = undefined;
		this.readout.removeAllEntries();
		this.readout.hide();
		$('#longSliderHolder').hide();
		$('#sliderTemp').hide();
	},
	block2Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		;	
		populate('spc4', P(45,35), V(450, 350), 400, 200);
	},
	block3Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]], {func:this.staticAdiabatic, obj:this}, ['c1', 'c2']);
		;
		populate('spc4', P(45, 80), V(200, 300), 200, 600);
		populate('spc4', P(305,75), V(200, 300), 200, 100);
		
	},
	block4Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]], {func:this.staticAdiabatic, obj:this}, ['c1', 'c2']);
		;
		populate('spc1', P(45, 80), V(200, 300), 200, 300);
		populate('spc5', P(305,75), V(200, 300), 100, 800);

		this.readout.addEntry('rmsLeft', 'RMS(v) Left:', 'm/s', rms(dataHandler.velocities('spc1')), undefined, 0);
		
		this.readout.addEntry('rmsRight', 'RMS(v) Right:', 'm/s', rms(dataHandler.velocities('spc5')), undefined, 0);

		this.readout.show();
	},
	block4CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
	},
	block5Start: function(){

		this.spcA = undefined;
		this.spcB = undefined;
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>So, we had two comparisons.</p>  <p>In the first, we had identical gases, but the molecules in one chamber moved more quickly.  The container with the fast moving molecules was hotter because its molecules had a higher average kinetic energy. </p>"+
		"<p>In the second set, we had a container with a light gas and a container with a heavy gas, but they had the same root mean squared speed.  We can calculate the average kinetic energy of the molecules in each container with</p><center><img src=img/ideal/IdealGasRMS.gif></img></center>"+
		"<p>This shows us that the average kinetic energy of the heavy gas was greater, but we didn’t <i>need</i> to calculate anything to figure that out.  We know that if two objects have the same speed, the heavier one has more kinetic energy.  This intuition applies to molecules too, and we can say just by looking that the heavier molecules had a higher temperature. </p>"+
		"<p>So higher temperature doesn’t necessarily mean your gas molecules are moving at a higher speed.  It means your gas molecules are moving with <i>more energy</i>.</p>");
	},
	block5CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
		$('#intText').html("");	
	},
	block6Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]], {func:this.staticAdiabatic, obj:this}, ['c1', 'c2']);
		;
		var sliderMin = $('#sliderSpeedLeft').slider('option', 'min');
		var sliderMax = $('#sliderSpeedLeft').slider('option', 'max');
		this.spcA = 'spc6';
		this.spcB = 'spc5'
		var mA = spcs[this.spcA].m;
		var mB = spcs[this.spcB].m;
		var tempA = 1;
		var tempB = 1;
		while (fracDiff(tempA, tempB)<.1){
			var rmsInitA = .75*Math.random()*(sliderMax-sliderMin)+sliderMin;
			var rmsInitB = .75*Math.random()*(sliderMax-sliderMin)+sliderMin;
			var tempA = VToTemp(mA, rmsInitA/pxToMS);
			var tempB = VToTemp(mB, rmsInitB/pxToMS);
		}
		populate(this.spcA, P(45, 80), V(200, 300), 200, tempA);
		populate(this.spcB, P(305,75), V(200, 300), 100, tempB);
		
		$('#sliderSpeedLeft').slider('option', {value:rmsInitA});
		$('#sliderSpeedRight').slider('option', {value:rmsInitB});
		$('#sliderSpeedLeftHolder').show();
		$('#sliderSpeedRightHolder').show();
		$('#checkAns').show();
		this.readout.addEntry('rmsLeft', 'RMS(v) Left:', 'm/s', rmsInitA, undefined, 0);
		this.readout.addEntry('rmsRight', 'RMS(v) Right:', 'm/s', rmsInitB, undefined, 0);
		this.readout.show();
	},
	block6Conditions: function(){
		var tempA = dataHandler.temp(this.spcA);
		var tempB = dataHandler.temp(this.spcB);
		if(fracDiff(tempA, tempB)<.05){
			return {result:true}
		} else{
			return {result:false, alert:"Your temperatures aren't within the 5% tolerance of each other"} 
		}
	},
	checkAnsTemp: function(){
		var tempA = dataHandler.temp(this.spcA);
		var tempB = dataHandler.temp(this.spcB);
		if(fracDiff(tempA, tempB)<.05){
			alert('Your temperatures are ' + round(tempA,0) + ' K and ' + round(tempB,0) + ' K. Close enough, well done.');
			this.prompts[this.promptIdx].finished = true;
		}else{
			alert("Your temperatures aren't within the 5% tolerance of each other.");
		}
	},
	block6CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
		$('#checkAns').hide();
		$('#sliderSpeedLeftHolder').hide()
		$('#sliderSpeedRightHolder').hide()
	},

	block7Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>I see you made it through unscathed.  That’s good!</p><p>Let’s make sure we did that problem the same way.</p><p>First, you can arbitrarily pick an RMS for one of the containers since the temperatures just have to be equal.  Then we can relate RMS to temperature like this:<br><center><img src=img/ideal/block7a.gif></img></center>Since the temperatures of the two containers were equal, you can set the average kinetic energies equal to each other:<br><center><img src=img/ideal/block7b.gif></img></center><p>Finally, you can solve for the unknown RMS like so:</p><center><img src=img/ideal/block7c.gif></img></center>");
	},
	block7CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
		$('#intText').html("");	
	},
	block8Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		;
		populate('spc1', P(45,35), V(450, 350), 600, 300);
		populate('spc3', P(45,35), V(450, 350), 800, 300);
		this.forceInternal=0;
		this.numUpdates=0;
		this.readout.addEntry('pressure', 'Pressure:', 'atm', 0, 0, 1);
		this.readout.show();
		addListener(curLevel, 'data', 'recordPressure', 
			function(){
				var SAPInt = walls.surfArea()
				var newP = dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt);
				this.data.pInt.push(newP);
				this.readout.tick(newP, 'pressure')
			},
			this);
	},
	block8CleanUp: function(){

		this.readout.removeAllEntries();
		this.readout.hide();
		removeListener(curLevel, 'data', 'recordPressure');
	},
	block9Start: function(){
		$('#longSliderHolder').show();
		this.playedWithSlider = new Boolean();
		this.playedWithSlider = false;
		walls = new WallHandler([[P(50,75), P(75,50), P(475,50), P(500,75), P(500,300), P(475,325), P(75,325), P(50,300)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		walls.setHitMode('Arrow');
		;
		populate('spc4', P(100,100), V(300,200), 1, 700);
		//addListener(curLevel, 'wallImpact', 'arrow', this.onWallImpactArrow, this);
		$('#sliderPressure').show();
		
	},
	block9Conditions: function(){
		return this.block1Conditions();
	},
	block9CleanUp: function(){
		walls.setHitMode('Std');
		this.playedWithSlider = undefined;
		$('#longSliderHolder').hide();
		$('#sliderPressure').hide();
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
		
	},
	block10Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		
	},
	block10aStart:function(){
		$('#intText').html("<p>So we have two ideas at play here:</p><p><ul><li>First, the harder your molecules hit the wall, the more force each collision exerts on it.</p>"+
		"<p><li>Second, the faster they're moving, the more often they hit the wall.</ul></p>"+
		"<p>Both of these things are <i>linearly</i> dependant on molecular speed.</p>"+
		"<p>The total force applied to the walls by the molecules is the product of these two, so multiplying, we get that pressure is proportional to mass times speed squared, or to temperature.</p>"+
		"<p>Let's see if we can express that with some math.</p>"
		);
	},
	block10bStart: function(){
		$('#intText').html("Say we have a molecule of mass m moving as follows:"+
			"<center><img src=img/ideal/pressureSetup.gif></img></center>"+
			"Starting from"+
			"<center><img src=img/ideal/pggfa.gif></img> and <img src = img/ideal/fma.gif></center>"+
			"We can integrate F=ma over time to get"+
			"<center><img src=img/ideal/momentum.gif></img></center>"+
			"We know that the change in velocity on collision is 2V<sub>x</sub> because it leaves with the inverse of the velocity it arrived with.  This expresses the first idea.<br>"+
			"Substituting in F, we get"+
			"<center><img src=img/ideal/pdelt.gif></center>  <br><p>Continued on next page...</p>"
			
			);
	},
	block10cStart: function(){
		$('#intText').html("<center><img src=img/ideal/pressureSetup.gif></img></center>"+
		"Because we're looking for an average pressure, we average out the momentum change over the whole time between impacts, which is given by"+
		"<center><img src=img/ideal/delt.gif></img></center>"+
		"This gives us the second idea.<br>"+
		"Then we put it all together and get"+
		"<center><img src=img/ideal/last.gif></img></center>"+
		"Now look at that!  Remember that Y is proportional to mV<sup>2</sup> as well?  This means that we have just derived that <i>P is directly proportional to T</i> from a simple model of balls bouncing around!  Does this sound familiar to the ideal gas law or what?"
		
		);
	},

	block10CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
	},
	block11Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		;
		var ptsToBorder = this.getPtsToBorder();
		border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container', c);
		populate('spc1', P(45,35), V(450, 350), 800, 300);
		populate('spc3', P(45,35), V(450, 350), 600, 300);	
		this.compArrow = this.makeCompArrow({compMode:'isothermal'});
		this.compArrow.show();
		var arrowVolInit = new Arrow([P(545, 30), P(510, 30)], Col(255,0,0), c);
		var arrowVolHalf = new Arrow([P(545, 235), P(510, 235)], Col(0,255,0), c);
		addListener(curLevel, 'update', 'drawVolArrows', 
			function(){
				arrowVolInit.draw();
				arrowVolHalf.draw();
			},
		'');
		this.forceInternal=0;
		this.numUpdates=0;
		this.readout.addEntry('pressure', 'Pressure:', 'atm', 0, 0, 1);
		this.readout.show();
		addListener(curLevel, 'data', 'recordPressure', 
			function(){
				var SAPInt = walls.surfArea()
				var newP = dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt);
				this.data.pInt.push(newP);
				this.readout.tick(newP, 'pressure')
			},
		this);
	},
	block11aStart: function(){
		this.halfY = 235
		var arrowVolInit = new Arrow([P(545, 30), P(510, 30)], Col(255,255,0), c);
		var arrowVolHalf = new Arrow([P(545, this.halfY), P(510, this.halfY)], Col(0,255,0), c);
		addListener(curLevel, 'update', 'drawVolArrows', 
			function(){
				arrowVolInit.draw();
				arrowVolHalf.draw();
			},
		'');	
	},
	block11aConditions: function(){
		if(fracDiff(walls.pts[0][0].y, this.halfY)<.07){
			return {result:true}
		}else{
			return {result:false, alert:'Halve the volume!'}
		}
	},
	block11aCleanUp: function(){
		removeListenerByName(curLevel, 'update', 'drawVolArrows');
	},
	block11bStart: function(){
		this.halfY = 337;
		var arrowVolInit = new Arrow([P(545, 235), P(510, 235)], Col(255,255,0), c);
		var arrowVolHalf = new Arrow([P(545, this.halfY), P(510, this.halfY)], Col(0,255,0), c);
		addListener(curLevel, 'update', 'drawVolArrows', 
			function(){
				arrowVolInit.draw();
				arrowVolHalf.draw();
			},
		'');	
	
	},
	block11bConditions: function(){
		if(fracDiff(walls.pts[0][0].y, this.halfY)<.07){
			return {result:true}
		}else{
			return {result:false, alert:'Halve the volume!'}
		}	
	},
	block11bCleanUp: function(){
		removeListenerByName(curLevel, 'update', 'drawVolArrows');
	},

	block11CleanUp: function(){
		removeListener(curLevel, 'update', 'drawVolArrows');
		removeListenerByName(curLevel, 'update', 'drawBorder');
		removeListener(curLevel, 'data', 'recordPressure');
		this.readout.removeAllEntries();
		this.readout.hide();
		this.compArrow.remove();
		this.drawArrow = undefined;
	},
	block12Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>Remember how we looked at the side length of a container, L<sub>x</sub> to find the time between collisions?  If you imagine that L<sub>x</sub> is the vertical dimension of the previous container, every time you halve L<sub>x</sub>, you halve the average time between collisions, doubling the number of wall impacts per time and thus doubling pressure.   From this inverse relationship, might we propose the following:</p><p><center><img src=img/ideal/orientPalphaV.gif></img></center></p><p>Similarly, might we say that if we double the number of molecules, we would double the number of collisions per time and so double pressure?  So we get</p><p><center><img src=img/ideal/orientPalphaN.gif></img></center></p><p>Would the above relationships be true if temperature were not held constant?  Try to relate your answer to frequency and momentum of collisions with the wall.</p>");
	},
	block12CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();	
	},
	block13Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>Alright, let's put it all together!</p>"+
		"<p>From combining impact frequency and speed, we got</p><center><img src=img/ideal/orientPalphaT.gif></img></center>"+
		"<p>By figuring out that if we halve the size, we double the number of collisions, we got</p><center><img src=img/ideal/orientPalphaV.gif></img></center>"+
		"<p>By saying that if we double the number of molecules, we double the number of collisions, we got</p><center><img src=img/ideal/orientPalphaN.gif></img></center>"+
		"<p>Combining, we get</p><center><img src=img/ideal/orientPalphaNTV.gif></img></center></p>"
		);
	},
	block13CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();		
	},
	block14Start: function(){
		$('#intText').show().html("<p>If we multiply by the ideal gas constant, R, we can say</p><center><img src=img/ideal/orientPNRTV.gif></img></center>"+
			"<p>or</p>"+
			"<center><img src=img/ideal/orientPVNRT.gif></img></center>"+
			"<p>So we just developed the ideal gas law from a model of molecules being hard spheres that bounce around!  Yay!</p>")
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, 'update');
		emptyListener(this, 'data');
		$('#canvasDiv').hide()
		$('#display').show();
		$('#dashOutro').show();		
		this.hideDash();
		this.hideBase();
		$('#dashOutro').show();
	},
	block14CleanUp: function(){
		this.hideDash();
		$('#intText').hide();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();	
		loadListener(this, 'update');
		loadListener(this, 'data');

		showPrompt(undefined, this.prompts[curLevel.promptIdx]);		
	},
	getPtsToBorder: function(){
		var pts = [];
		var wallPts = walls.pts[0];
		pts.push(wallPts[1].copy().position({y:this.minY}))
		pts.push(wallPts[2].copy());
		pts.push(wallPts[3].copy());
		pts.push(wallPts[4].copy().position({y:this.minY}));
		return pts;
	},
	dataRun: function(){

		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volOneWall());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	changeTempSlider: function(event, ui){
		this.playedWithSlider = true;
		var temp = ui.value;
		changeAllTemp(temp);
		var dot = spcs.spc4.dots[0];
		this.readout.hardUpdate(temp, 'temp');
		this.readout.hardUpdate(dot.speed(), 'speed');
	},
	changePressureSlider: function(event, ui){
		this.playedWithSlider = true;
		var temp = ui.value;
		changeAllTemp(temp);
	},
	changeTempSpcA: function(event, ui){
		var rms = ui.value;
		changeRMS(this.spcA, rms);
		this.readout.hardUpdate(rms, 'rmsLeft');
	},
	changeTempSpcB: function(event, ui){
		var rms = ui.value;
		changeRMS(this.spcB, rms);	
		this.readout.hardUpdate(rms, 'rmsRight');		
	},

	reset: function(){
		var curPrompt = this.prompts[this.promptIdx];
		if(this['block'+this.blockIdx+'CleanUp']){
			this['block'+this.blockIdx+'CleanUp']()
		}
		if(curPrompt.cleanUp){
			curPrompt.cleanUp();
		}	
		for (var spcName in spcs){
			depopulate(spcName);
		}
		this.numUpdates = 0;

		this.forceInternal = 0;
		this.wallV = 0;
		emptyListener(this, 'update');
		emptyListener(this, 'wallImpact');
		emptyListener(this, 'data');

		for (resetListenerName in this.resetListeners.listeners){
			var func = this.resetListeners.listeners[resetListenerName].func;
			var obj = this.resetListeners.listeners[resetListenerName].obj;
			func.apply(obj);
		}

		if(this['block'+this.blockIdx+'Start']){
			this['block'+this.blockIdx+'Start']()
		}
		
		if(curPrompt.start){
			curPrompt.start();
		}	
		
	},
}
)