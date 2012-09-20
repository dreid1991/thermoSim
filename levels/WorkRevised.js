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
					text:"hello",
				}
			]
		}

					
		]
	}
}
	
)