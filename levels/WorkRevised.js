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
							[{text:"||EQ1||", isCorrect: true},
							{text:"||EQ2||", isCorrect: false, message:'No!  You do no work with constant volume'},
							{text:"||EQ3||", isCorrect: false, message:"No!"},
							{text:"||EQ4||", isCorrect: false, message:"It is dependant on change in volume, but T?"}
						]
					},
				},
				{
					setup:undefined,
					cutScene:true,
					text: "<p>Indeed.  This tells us that work done on a system is equal to how hard you compress a container times how much you compress it.</p><p>Now from the first law, we know</p>||EQ5CE<p>Since we’re going to be looking at an adiabatic system.  Which of these relations is correct?</p>",
					quiz:{	
						type:'multChoice',
						options:
							[{text:"||EQ6||", isCorrect: true},
							{text:"||EQ7||", isCorrect: false, message:"Why Cp?"},
							{text:"||EQ8||", isCorrect: false, message:"But it's adiabatic!"},
							{text:"It cannot be simplified", isCorrect: false, message:"Yes it can.  What is Q equal to?"}
						]
					},			
				}
			]
		},
		{
			setup: 
				function() {
					walls = WallHandler({pts:[[P(40,60), P(510,60), P(510,380), P(40,380)]], handlers:'staticAdiabatic', handles:['container'], vols:[15]});
					spcs['spc1'].populate(P(45,65), V(460, 300), 1000, 200);
					spcs['spc3'].populate(P(45,65), V(450, 300), 800, 200);				
				
				},
			prompts:[
				{
					setup:undefined,
					text:"hello",
				}
			]
		}

					
		]
	}
}
	
)