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
		nextPrompt();
	},	
	
	declareBlocks: function(){
		this.blocks=[
		{
			setup:undefined,
			prompts:[
				{
					setup:undefined,
					cutScene:true,
					text:"Today we’re going to investigate how work transfers energy to a system.  First we’re going to develop the equations that describe a process on an adiabatic system. </p><p>If we compress the adiabatic system pictured to the right at a constant external pressure, which of these described the work done?</p>",
					quiz:{	
						type:'multChoice',
						options:
							[
							{text:"||EQ2||", isCorrect: false, message:'No!  You do no work with constant volume'},
							{text:"||EQ3||", isCorrect: false, message:"No!"},
							{text:"||EQ1||", isCorrect: true},
							{text:"||EQ4||", isCorrect: false, message:"It is dependant on change in volume, but T?"}
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
					this.borderStd();
					this.compArrow = new CompArrow({mode:'adiabatic', speed:1.5});
					spcs['spc4'].populate(P(45,235), V(460, 100), 1, 600);
					this.tempListener = new StateListener({dataList:walls[0].data.t, is:'notEqualTo', targetVal:dataHandler.temp(), alertUnsatisfied:"Try hitting the molecule with the wall while the wall's moving"});			
				},
			prompts:[
				{
					setup:undefined,
					text:"<center>||EQ6||</center>From the equation above we see that temperature increases as we do work by decreasing volume.  Let's see what's happening from the point of view of a molecule in the system.  Using the movable wall above, can you determine what event causes the molecule's speed to change?  Can you explain why that would cause a temperature change in many molecules?",
					quiz:{	
						type:'text',
						text:'Type your answer here',
						//NEED TO STORE ANSWER
					},
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
					this.borderStd();
					this.volListener10 = new StateListener({dataList:walls[0].data.v, is:'lessThan', targetVal:10, alertUnsatisfied:'Compress the system!'});						
				},
			prompts:[
				{
					setup:undefined,
					text:"Above is a piston cylinder assembly that is well insulated.  Place the block on top of the poston and observe the response.  How much work did you do on the system?",
					quiz:{	
						type:'textSmall',
						units:'kJ',
						text:'',
						//NEED TO STORE ANSWER
					},	
				},
				{
					setup:undefined,
					text:"The system had an initial temperature of 200 K and contained 1.8 moles of an ideal monatomic gas.  You wrote that XXX kJ of work were done.  What final temperature should the system have had?",
					quiz:{	
						type:'textSmall',
						units:'K',
						text:'',
						//NEED TO STORE ANSWER
					},
				}
			]
		}
		
		]
	}
}
	
)