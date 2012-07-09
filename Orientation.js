function Orientation(){
	this.dataHandler = new DataHandler();
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
	this.updateListeners = {listeners:{}, save:{}};
	this.dataListeners = {listeners:{}, save:{}};
	this.wallImpactListeners = {listeners:{}, save:{}};
	this.dotImpactListeners = {listeners:{}, save:{}};
	this.mousedownListeners = {listeners:{}, save:{}};
	this.mouseupListeners = {listeners:{}, save:{}};
	this.mousemoveListeners = {listeners:{}, save:{}};
	this.resetListeners = {listeners:{}, save:{}};
	this.initListeners = {listeners:{}, save:{}};
	this.readout = new Readout(30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this);
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.prompts=[
		{block:0, title: "one fish", text:"Alright, let’s figure out what temperature looks like.  Above, we have one molecule, and I submit to you that this molecule has a temperature.  The equation for a molecule’s temperature is as follows: 1.5kT = 0.5mv<sup>2</sup>, where k in the boltzmann constant, T is temperature, m is the molecule’s mass, and v is its speed.  This tells us that temperature is an expression of molecular kinetic energy.  The slider above changes the molecule’s temperature.  If you double the molecule’s temperature, by what factor will its speed increase?  Try drawing a graph of a hydrogen atom’s velocity with respect to its temperature."},
		{block:1, title: "two fish", text:"Now suppose we have many molecules.  We know from before that we can assign a temperature to each molecule based on its mass and speed.  We also know that the system as a whole must have a temperature since a thermometer gives only one number.  We can guess that the bulk temperature must be based on the individual molecules’ temperatures, and we’d be right.  The bulk temperature is the average of all the molecules’ temperatures."},
		{block:2, title: "red fish", text:"These two containers hold the same type of molecule.  Just so we're on the same page, which of the containers has a higher temperature and why?"},
		{block:3, title: "bloo fish", text:"Hopefully you said the one one the left was hotter.  Now how do the temperatures of these two new systems compare?  The masses of the particles are 1 g/mol and 8 g/mol respectively.  Rms (above) stands for <a href=http://en.wikipedia.org/wiki/Root_mean_square#Definition>root mean squared</a>, which is the average of the square of all of the velocities, square rooted.  This can definitely be used to calculate kinetic energy. "},
		{block:4, title: "too fish", text:"Okay, last one, I promise.  How do the temperatures of these two compare?  The masses are 3 g/mol and 8 g/mol."},
		{block:5, title: "", text:""},
		{block:6, title: "zoo fish", text:"Okay, let’s look at pressure.  A pressure is a force per area.  This tells us that gases at non-zero pressure must exert a force on their container.  In the system above, what event causes a force to be exerted on the wall?"},
		{block:7, title: "quail", text:"It might be simpler if we look at just one molecule.  Every time the molecule hits the wall, its momentum changes.  A force is a momentum change per time.  If we want an average pressure, we can define time as the average time between collisions.  How would the momentum change and the frequency of collision change with velocity?  When you’re done playing here, we can go through the math on the next page."},
		{block:8, title: "", text:"", start:this.block8aStart},
		{block:8, title: "", text:"", start:this.block8bStart},
		{block:8, title: "", text:"", start:this.block8cStart},
		{block:9, title: "sprocket", start:this.block9aStart, cleanUp: this.block9aCleanUp, text:"So let’s consider a constant temperature container.  You can use the arrow to change the container volume.  Try havling the volume of this container.  We know from the ideal gas law that if you halve the volume and hold the temperature constant, the pressure will double, right?  Can you explain why this happens in terms of the number of molecular collisions with the wall?"},
		{block:9, title: "sprocket", start:this.block9bStart, cleanUp: this.block9bCleanUp, text:"Now try halving the volume again.  What does pressure do this time, and does that seem correct?"},
		{block:10, title: "", text: ""},
		{block:11, title: "", text: ""},
	]
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.minY = 30;
	this.maxY = 350;
	collide.setup();
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	addListener(this, 'wallImpact', 'std', this.onWallImpact, this);
	addListener(this, 'dotImpact', 'std', collide.impactStd, collide);

}

Orientation.prototype = {
	init: function(){
		this.hideDash();
		this.hideText();
		this.hideBase();
		this.startIntro();
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		var self = this;
		$('#myCanvas').show();
	},
	startIntro: function(){
		//var ptsToBorder = this.getPtsToBorder();
		//border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container',c);
		saveListener(this, 'update');
		saveListener(this, 'data');
		saveListener(this, 'wallImpact');
		saveListener(this, 'dotImpact');
		emptyListener(this, "update");
		emptyListener(this, "data");
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#graphs').hide()
		$('#display').show();
		$('#textIntro').show();
		$('#dashIntro').show();
	},
	block0Start: function(){
		$('#clearGraphs').hide();
		$('#sliderTemp').show();
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		populate('spc4', P(45,35), V(450, 350), 1, 300);
		var dot = spcs.spc4.dots[0]
		this.readout.addEntry('temp', "Molecule's temperature:", 'K', this.dataHandler.temp(), 0, 0);
		this.readout.addEntry('speed', "speed:", 'm/s', dot.speed(),0,0);
		this.readout.resetAll();
		this.readout.show();
		var temp = spcs.spc4.dots[0].temp();
		$('#sliderTemp').slider('option', {value:temp});
	},
	block0CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
		$('#sliderTemp').hide();
	},
	block1Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		populate('spc4', P(45,35), V(450, 350), 400, 200);
	},
	block2Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]]);
		walls.setup();
		populate('spc4', P(45, 80), V(200, 300), 200, 600);
		populate('spc4', P(305,75), V(200, 300), 200, 100);
		
	},
	block3Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]]);
		walls.setup();
		populate('spc3', P(45, 80), V(200, 300), 200, 300);
		populate('spc5', P(305,75), V(200, 300), 100, 300);

		this.readout.addEntry('rmsV1', 'rms(V1):', 'm/s', rms(this.dataHandler.velocities('spc3')), undefined, 0);
		
		this.readout.addEntry('rmsV2', 'rms(V2):', 'm/s', rms(this.dataHandler.velocities('spc5')), undefined, 0);

		this.readout.show();
	},
	block3CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
	},
	block4Start: function(){
		walls = new WallHandler([[P(40,30), P(250,30), P(250,440), P(40,440)], 
			[P(300,30), P(510,30), P(510,440), P(300,440)]]);
		walls.setup();
		populate('spc1', P(45, 80), V(200, 300), 200, 300);
		populate('spc5', P(305,75), V(200, 300), 100, 800);

		this.readout.addEntry('rmsV1', 'rms(V1):', 'm/s', rms(this.dataHandler.velocities('spc1')), undefined, 0);
		
		this.readout.addEntry('rmsV2', 'rms(V2):', 'm/s', rms(this.dataHandler.velocities('spc5')), undefined, 0);

		this.readout.show();
	},
	block4CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.hide();
	},
	block5Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#reset').hide();
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("So, we had three comparisons.  In the first, we had identical gases where the molecules in one chamber moved more quickly.  The fast moving one was hotter here because its molecules had a higher average kinetic energy. </p>"+
		"<p>In the second set, with a light gas and a heavy gas, the root mean squareds of the velocities were different, but if you computed 0.5*m*rms(V)<sup>2</sup>, you found that the kinetic energies of the two were equal, showing that they were the same temperature.  So, molecular speed alone doesn’t tell us about temperature.  We need to know the particle mass as well.</p>"+
		"<p>Finally, we had the two containers with equal speeds but different masses.  The temperatures can be calculated like in the last set, but that’s not necessary.  We can know that since temperature is an expression of <i>energy</i>, and since their speeds were the same, the one with less mass must have less energy and thus a lower temperature. </p>"+
		"<p>To restate, higher temperature doesn’t necessarily mean your gas molecules are moving at a higher speed.  It means your gas molecules are moving with <i>more energy</i>.</p>");
	},
	block5CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#reset').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
		$('#intText').html("");	
	},
	block6Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		populate('spc1', P(45,35), V(450, 350), 600, 300);
		populate('spc3', P(45,35), V(450, 350), 800, 300);
		this.forceInternal=0;
		this.numUpdates=0;
		this.readout.addEntry('pressure', 'Pressure:', 'atm', 0, 0, 1);
		this.readout.show();
		addListener(curLevel, 'data', 'recordPressure', 
			function(){
				var SAPInt = walls.surfArea()
				var newP = this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt);
				this.data.pInt.push(newP);
				this.readout.tick(newP, 'pressure')
			},
			this);
	},
	block6CleanUp: function(){
		this.readout.removeAllEntries();
		this.readout.show();
		removeListener(curLevel, 'data', 'recordPressure');
	},
	block7Start: function(){
		walls = new WallHandler([[P(50,75), P(75,50), P(400,50), P(425,75), P(425,300), P(400,325), P(75,325), P(50,300)]]);
		walls.setup();
		populate('spc4', P(100,100), V(300,200), 1, 700);
		removeListener(curLevel, 'wallImpact', 'std');
		addListener(curLevel, 'wallImpact', 'arrow', this.onWallImpactArrow, this);
		$('#sliderPressure').show();
		
	},
	block7CleanUp: function(){
		$('#sliderPressure').hide();
		removeListener(curLevel, 'wallImpact', 'arrow');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
		addListener(curLevel, 'wallImpact', 'std', this.onWallImpact, this);
		
	},
	block8Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#reset').hide();
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		
	},
	block8aStart: function(){
		$('#intText').html("Okay, math time!  We're going to solve for pressure exerted by a molecule on one wall.<br>"+
			"Say we have a molecule of mass m moving as follows:"+
			"<center><img src=img/pressureSetup.gif></img></center>"+
			"Then starting from"+
			"<center><img src=img/pggfa.gif></img> and <img src = img/fma.gif></center>"+
			"We can integrate F=ma over time to get"+
			"<center><img src=img/momentum.gif></img></center>"+
			"We know that the change in velocity is 2V<sub>x</sub> it leaves with the inverse of the velocity it arrived with.<br>"+
			"Substituting in F, we get"+
			"<center><img src=img/pdelt.gif></center>"+
			"Continued on next page..."
			);
	},
	block8bStart: function(){
		$('#intText').html("<center><img src=img/pressureSetup.gif></img></center>"+
		"Because we're looking for an average pressure, we're averaging out the momentum change over the whole time between impacts, which is given by"+
		"<center><img src=img/delt.gif></img></center>"+
		"Then we put it all together and get"+
		"<center><img src=img/last.gif></img></center>"+
		"Now hold on!  Remember the T is preportional to mV<sup>2</sup> as well!  The means that we have just derived that <i>P is directly proportional to T</i> from a simple model of balls bouncing around!  Does this sound familiar to the ideal gas law or what?"
		
		);
	},
	block8cStart:function(){
		$('#intText').html("<p>So we started with two ideas:</p><p>The harder your molecules hit the wall, the more force they exert on it.</p>"+
		"<p>Second, the faster they're moving, the more often they hit the wall.</p>"+
		"<p>Both of these things are <i>linearly</i> dependant on molecular speed</p>"+
		"<p>Since total force applied to the walls by the molecules is product of these two, we get that pressure is proportional to speed squared, or to temperature.</p>"+
		"<p>So there are <i>two factors</i> that influence pressure: force of collisions and number of collisions</p>"
		);
	},
	block8CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#reset').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();
	},
	block9Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]]);
		walls.setup();
		var ptsToBorder = this.getPtsToBorder();
		border(ptsToBorder, 5, this.wallCol.copy().adjust(-100,-100,-100), 'container', c);
		populate('spc1', P(45,35), V(450, 350), 600, 300);
		populate('spc3', P(45,35), V(450, 350), 800, 300);	
		this.dragArrow = this.makeDragArrow();
		this.dragArrow.show();
		var arrowVolInit = new Arrow([P(545, 30), P(510, 30)], Col(255,255,0), c);
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
				var newP = this.dataHandler.pressureInt(this.forceInternal, this.numUpdates, SAPInt);
				this.data.pInt.push(newP);
				this.readout.tick(newP, 'pressure')
			},
		this);
	},
	block9aStart: function(){
		var arrowVolInit = new Arrow([P(545, 30), P(510, 30)], Col(255,255,0), c);
		var arrowVolHalf = new Arrow([P(545, 235), P(510, 235)], Col(0,255,0), c);
		addListener(curLevel, 'update', 'drawVolArrows', 
			function(){
				arrowVolInit.draw();
				arrowVolHalf.draw();
			},
		'');	
	},
	block9aCleanUp: function(){
		removeListenerByName(curLevel, 'update', 'drawVolArrows');
	},
	block9bStart: function(){
		var arrowVolInit = new Arrow([P(545, 235), P(510, 235)], Col(255,255,0), c);
		var arrowVolHalf = new Arrow([P(545, 337), P(510, 337)], Col(0,255,0), c);
		addListener(curLevel, 'update', 'drawVolArrows', 
			function(){
				arrowVolInit.draw();
				arrowVolHalf.draw();
			},
		'');	
	
	},
	block9bCleanUp: function(){
		removeListenerByName(curLevel, 'update', 'drawVolArrows');
	},
	getPtsToBorder: function(){
		var pts = [];
		var wallPts = walls.pts[0];
		pts.push(wallPts[1].copy())
		pts.push(wallPts[2].copy());
		pts.push(wallPts[3].copy());
		pts.push(wallPts[4].copy());
		return pts;
	},
	block9CleanUp: function(){
		
		removeListenerByName(curLevel, 'update', 'drawBorder');
		removeListener(curLevel, 'data', 'recordPressure');
		this.readout.removeAllEntries();
		this.readout.hide();
		this.dragArrow.remove();
		this.drawArrow = undefined;
	},
	block10Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#reset').hide();
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>Each time you halved the volume, you doubled the number of collisions that happen with the wall. This means that you doubled the pressure.  Might we propose the following:</p><p><center><img src=img/orientPalphaV.gif></img></center></p><p>Similarly, might we say that if we double the number of molecules, we would double the number of collisions and thus double pressure?  So we get</p><p><center><img src=img/orientPalphaN.gif></img></center></p>");
	},
	block10CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#reset').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();	
	},
	block11Start: function(){
		saveListener(curLevel, 'update');
		emptyListener(curLevel, 'update');
		$('#reset').hide();
		$('#canvasDiv').hide();
		$('#display').show();
		$('#intText').show();
		$('#intText').html("<p>Alright, let's put it all together!</p>"+
		"<p>From combining impact frequency and speed, we got</p><center><img src=img/orientPalphaT.gif></img></center>"+
		"<p>By figuring out that if we halve the size, we double the number of collisions, we got</p><center><img src=img/orientPalphaV.gif></img></center>"+
		"<p>By saying that if we double the number of molecules, we double the number of collisions, we got</p><center><img src=img/orientPalphaN.gif></img></center>"+
		"<p>Combining, we get</p><center><img src=img/orientPalphaNTV.gif></img></center></p>"
		);
	},
	block11CleanUp: function(){
		loadListener(curLevel, 'update');
		$('#intText').html('');
		$('#reset').show();
		$('#canvasDiv').show();
		$('#display').hide();
		$('#intText').hide();		
	},
	startSim: function(){
		this.hideDash();
		this.hideText();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();
		loadListener(this, 'update');
		loadListener(this, 'data');		
		loadListener(this, 'wallImpact');
		loadListener(this, 'dotImpact');
	},
	startOutro: function(){
		saveListener(this, 'update');
		saveListener(this, 'data');
		emptyListener(this, 'update');
		emptyListener(this, 'data');
		this.hideDash();
		this.hideText();
		this.hideBase();
		$('#canvasDiv').hide()
		$('#display').show();
		$('#textOutro').show();	
		$('#dashOutro').show();

	},
	toSim: function(){
		this.startSim();
		nextPrompt();
	},
	backToSim: function(){
		this.promptIdx = this.prompts.length-1;
		this.hideDash();
		this.hideText();
		$('#graphs').show()
		$('#canvasDiv').show()
		$('#display').hide();
		$('#dashRun').show();
		$('#base').show();	
		loadListener(this, 'update');
		loadListener(this, 'data');
	},
	makeDragArrow: function(bounds){
		var pos = walls.pts[0][1].copy()
		var rotation = 0;
		var cols = {};
		cols.outer = Col(247, 240,9);
		cols.onClick = Col(247, 240,9);
		cols.inner = this.bgCol;
		var dims = V(25, 15);
		var name = 'volDragger';
		var drawCanvas = c;
		var canvasElement = canvas;
		var listeners = {};
		listeners.onDown = function(){};
		listeners.onMove = function(){curLevel.changeWallSetPt(this.pos.y)};
		listeners.onUp = function(){};
		
		if(!bounds){
			bounds = {y:{min:this.minY, max:this.maxY}};
		}
		return new DragArrow(pos, rotation, cols, dims, name, drawCanvas, canvasElement, listeners, bounds);
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
	changeWallSetPt: function(dest){
		var wall = walls.pts[0]
		removeListener(curLevel, 'update', 'moveWall');
		var setY = function(curY){
			wall[0].y = curY;
			wall[1].y = curY;
			wall[wall.length-1].y = curY;
		}
		var getY = function(){
			return walls.pts[0][0].y;
		}
		
		var dist = dest-getY();
		if(dist!=0){
			var sign = 1;
			sign = Math.abs(dist)/dist;		
			this.wallV = this.wallSpeed*sign;
			removeListener(curLevel, 'wallImpact', 'std');
			addListener(curLevel, 'wallImpact', this.compMode, this['onWallImpact' + this.compMode], this);
			addListener(curLevel, 'update', 'moveWall',
				function(){
					setY(boundedStep(getY(), dest, this.wallV))
					walls.setupWall(0);
					if(round(getY(),2)==round(dest,2)){
						removeListener(curLevel, 'update', 'moveWall');
						removeListener(curLevel, 'wallImpact', this.compMode)
						addListener(curLevel, 'wallImpact', 'std', this.onWallImpact, this);
						this.wallV = 0;
					}
				},
			this);
		}
	},
	update: function(){
		this.numUpdates++;
		for (var updateListener in this.updateListeners.listeners){
			var listener = this.updateListeners.listeners[updateListener]
			listener.func.apply(listener.obj);
		}
	},
	addData: function(){
		for (var dataListener in this.dataListeners.listeners){
			var listener = this.dataListeners.listeners[dataListener];
			listener.func.apply(listener.obj);
		}
		this.numUpdates = 0;
		this.forceInternal = 0;
	},
	updateRun: function(){
		move();
		this.checkDotHits(); 
		this.checkWallHits();
		this.drawRun();
	},
	drawRun: function(){
		draw.clear(this.bgCol);
		draw.dots();
		draw.walls(walls, this.wallCol);
	},
	checkDotHits: function(){
		collide.check();
	},
	checkWallHits: function(){
		walls.check();
	},
	onWallImpact: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}
	},
	onWallImpactIsothermal: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		var perpUV = walls.wallPerpUVs[line[0]][line[1]]
		dot.y-=2*perpUV.dy;
		walls.impactStd(dot, wallUV, perpV);
		this.forceInternal += 2*dot.m*Math.abs(perpV);
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}	
	},
	onWallImpactAdiabatic: function(dot, line, wallUV, perpV){
		var vo = dot.v.copy();
		if(line[0]==0 && line[1]==0){
			dot.v.dy = -vo + 2*this.wallV;
			this.forceInternal += dot.m*(perpV + dot.v.dy);
		}else{
			walls.impactStd(dot, wallUV, perpV);
			this.forceInternal += 2*dot.m*Math.abs(perpV);
		}
		return {vo:vo, vf:dot.v.copy(), pos:P(dot.x, dot.y)}	
	},
	onWallImpactArrow: function(dot, line, wallUV, perpV){
		var hitResult = this.onWallImpact(dot, line, wallUV, perpV);
		var arrowPts = new Array(3);
		arrowPts[0] = hitResult.pos.copy().movePt(hitResult.vo.copy().mult(10).neg());
		arrowPts[1] = hitResult.pos;
		arrowPts[2] = hitResult.pos.copy().movePt(hitResult.vf.copy().mult(10));
		var lifeSpan = 50;
		var arrowTurn = 0;
		var arrow = new Arrow(arrowPts, Col(255,0,0),c);
		addListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y,
			function(){
				arrow.draw();
				arrowTurn++;
				if(arrowTurn==lifeSpan){
					removeListener(curLevel, 'update', 'drawArrow'+hitResult.pos.x+hitResult.pos.y);
				}
			},
		this);
		var textPos = hitResult.pos.copy().movePt(hitResult.vf.mult(15));
		var delV = 2*perpV*pxToMS;
		animText({pos:textPos, col:Col(255,255,255), rotation:0, size:13}, 
				{pos:textPos.copy().movePt({dy:-20}), col:this.bgCol},
				'calibri', 'deltaV = '+round(delV,1)+'m/s', 'center', 3000, c);
	},
	dataRun: function(){

		this.data.t.push(this.dataHandler.temp());
		this.data.v.push(this.dataHandler.volOneWall());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
	},
	vol: function(){
		return walls.area(0);// - walls.area(1);
	},
	changeTempSlider: function(event, ui){
		var temp = ui.value;
		changeAllTemp(temp);
		var dot = spcs.spc4.dots[0];
		this.readout.hardUpdate(temp, 'temp');
		this.readout.hardUpdate(dot.speed(), 'speed');
	},
	changePressureSlider: function(event, ui){
		var temp = ui.value;
		changeAllTemp(temp);
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
		emptyListener(this, 'dotImpact');
		emptyListener(this, 'data');
		
		this.startSim();
		
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
	hideDash: function(){
		$('#dashIntro').hide();
		$('#dashRun').hide();
		$('#dashOutro').hide();
	},
	hideText: function(){
		$('#intText').hide();
		$('#textIntro').hide();
		$('#textOutro').hide();
	},
	hideBase: function(){
		$('#base').hide();
	},

}
