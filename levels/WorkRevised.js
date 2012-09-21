function Work(){
	this.setStds();
	this.readout = new Readout('mainReadout', 30, myCanvas.width-155, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Work.prototype, 
			LevelTools, 
{
	init: function(){
		$('#mainHeader').text('Work');
		showPrompt(0, 0, true);
	},	
	
	declareBlocks: function(){
		this.blocks=[
		{
			setup:
				function() {
					currentSetupType = 'block';
					new AuxPicture('img/work/block0Pic1.jpg');
					new AuxPicture('img/work/block0Pic2.jpg');
					
				},
			prompts:[
				{
					setup:undefined,
					cutScene:true,
					text:"Today we’re going to investigate how work transfers energy to a system.  First we’re going to develop the equations that describe a process on an adiabatic system. </p><p>If we compress the adiabatic system pictured to the right at a constant external pressure, which of these described the work done?</p>",
					quiz:{	
						type:'multChoice',
						options:
							[
							{text:"||EQ2||", isCorrect: false, message:"Yeah, but you won't do no work with constant volume in this system"},
							{text:"||EQ3||", isCorrect: false, message:"Which P should you be using?"},
							{text:"||EQ1||", isCorrect: true},
							{text:"||EQ4||", isCorrect: false, message:"Do your units work out?"}
						]
					},
				},
				{
					setup:undefined,
					cutScene:true,
					text: "||EQ1BR<p>Indeed.  This equation tells us that work done on a system is equal to how hard you compress a container times how much you compress it.</p><p>Now from the first law, we know</p>||EQ5CE<p>Since we’re going to be looking at an adiabatic system.  If we assume constant heat capacity, which of these relations is correct?</p>",
					quiz:{	
						type:'multChoice',
						options:
							[
							{text:"||EQ7||", isCorrect: false, message:"Why Cp?"},
							{text:"||EQ8||", isCorrect: false, message:"But it's adiabatic!"},
							{text:"It cannot be simplified", isCorrect: false, message:"Yes it can.  What is Q equal to?"},
							{text:"||EQ6||", isCorrect: true}
						]
					},			
				}
			]
		},
		{
			setup: 
				function() {
					currentSetupType = 'block';
					walls = WallHandler({pts:[[P(40,30), P(510,30), P(510,440), P(40,440)]], handlers:'staticAdiabatic', handles:['container']});
					walls[0].setHitMode('ArrowSpd');
					this.borderStd({min:30});
					this.compArrow = new CompArrow({mode:'adiabatic', speed:1.5});
					spcs['spc4'].populate(P(45,235), V(460, 100), 1, 600);
					this.tempListener = new StateListener({dataList:walls[0].data.t, is:'notEqualTo', targetVal:dataHandler.temp(), alertUnsatisfied:"Try hitting the molecule with the wall while the wall's moving"});			
				},
			prompts:[
				{
					setup:undefined,
					text:"<center>||EQ6||</center>From the equation above we see that temperature increases as we do work by decreasing volume.  Temperature is an expression is molecular kinetic energy, so as the system is compressed, the molecules must speed up.  These ideal gas molecules can be thought of as perfectly elastic bouncy balls (I can add the model bit if anyone really wants, but I kind of like 'thought of' better).  Using the movable wall above, can you determine what event causes the molecule's speed to change?  Can you explain why that would cause a temperature change in many molecules?",
					quiz:{	
						type:'text',
						text:'Type your answer here',
						//NEED TO STORE ANSWER
					},
				},
				{
					setup:undefined,
					text:"<p>So the molecule's speed up when they collide with the moving wall.  Those collisions add kinetic energy, which means that the temperature increases.</p><p>Now let's do an experiment where we compress the previously pictured (<--maybe change) adiabatic system.",
				}
			]
		},
		{
			setup:
				function() {
					currentSetupType = 'block';

					walls = WallHandler({pts:[[P(40,60), P(510,60), P(510,380), P(40,380)]], handlers:'staticAdiabatic', handles:['container'], vols:[15]});
					spcs['spc1'].populate(P(45,65), V(460, 300), 1000, 200);
					spcs['spc3'].populate(P(45,65), V(450, 300), 800, 200);
					
				
					this.graphs.pVSv = new GraphScatter({handle:'pVSv', xLabel:"Volume (L)", yLabel:"Pressure (bar)",
										axesInit:{x:{min:6, step:2}, y:{min:0, step:3}}});
					this.graphs.pVSv.addSet({address:'p', label:'P Ext.', pointCol:Col(50,50,255), flashCol:Col(200,200,255),
											data:{x:walls[0].data.v, y:walls[0].data.pExt}, trace:true});

					this.dragWeights = new DragWeights({weightDefs:[{name:'lrg', count:1, mass:213.2}], weightScalar:8, displayText:false, massInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)});
					this.piston = new Piston({wallInfo:'container', init:2, min:2, max:15, makeSlider:false});
					walls[0].displayPExt();
					this.borderStd({min:30});
				},
			prompts:[
				{
					setup:
						function() {
							currentSetupType = 'prompt';
							this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:'Compress the system!', cleanUpWith:currentSetupType});						
						},
					text:"Above is a well insulated piston cylinder assembly.  Place the block on top of the poston and observe the response.  How much work did you do on the system?",
					quiz:{	
						type:'textSmall',
						units:'kJ',
						text:'',
					},	
				},
				{
					setup:undefined,
					text:"The system had an initial temperature of 200 K and contained 1.8 moles of an ideal monatomic gas.  You wrote that XXX kJ of work were done.  What final temperature should the system have had?",
					quiz:{	
						type:'textSmall',
						units:'K',
						text:'',
					},
					replace: 
						[{oldStr:'XXX', newStr:'GET#userAnswerBlock2Prompt0'}]
				}
			]
		},
		{
			setup:
				function() {
					currentSetupType = 'block';
					this.blocks[2].setup.apply(this);
					walls[0].displayTemp();
					walls[0].displayWork();
					this.graphs.tVSv = new GraphScatter({handle:'tVSv', xLabel:"Volume (L)", yLabel:"Temperature (K)",
										axesInit:{x:{min:6, step:2}, y:{min:0, step:200}}});
					this.graphs.tVSv.addSet({address:'t', label:'T sys.', pointCol:Col(255,50,50), flashCol:Col(200,200,255),
											data:{x:walls[0].data.v, y:walls[0].data.t}});					
				},
			prompts:[
				{
					setup:
						function() {
							this.blocks[2].prompts[0].setup.apply(this);
						},
					text:"Previously you answered that the compression did XXXkJ on the system for a final temperature of YYYK.  Here's the same compression, but this time we're displaying work done and temperature. How do the results compare?  If there's a discrepency, can you account for it?",
					quiz:{
						type:'text',
						text:"Type your answer here",
					},
					replace:
						[{oldStr:'XXX', newStr:'GET#userAnswerBlock2Prompt0'},
						{oldStr:'YYY', newStr:'GET#userAnswerBlock2Prompt1'}
						]
				}
			
			]
		},
		{
			setup:
				function() {
					currentSetupType = 'block';
					this.graphs.pVSvLoad = getStore('pVSvblock3prompt0').load();
					this.graphs.tVSvLoad = getStore('tVSvblock3prompt0').load();
				},
			prompts:[
				{
					setup:undefined,
					cutScene:true,
					text:"||EQ6CEIf you'll notice, the T vs. V graph is linear.  Using the equation above, find what its slope should should be with 1.8 moles of an ideal monatomic gas.  Do the slopes from the equation and from the graph match?  Given our P<sub>ext</sub>, should the slopes be linear or did something go wrong?",
					quiz:{
						type:'text',
						text:"Type your answer here",
					},
				}							
			]
		}
		
		]
	}
}
	
)