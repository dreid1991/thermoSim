function Reactions(){
	this.setStds();
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	addSpecies(['spc1', 'spc3', 'spc4']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Reactions.prototype, 
			LevelTools, 
{
	init: function(){
		$('#mainHeader').html('c<sub>v</sub> vs. c<sub>P</sub');
		showPrompt(0, 0, true);

	},
	blocks: [
		{//B1
			setup:
				function() {
					walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'staticAdiabatic', handles:['container'], bounds:[{yMin:68, yMax:435}], vols:[10.1]});
					//add temp to wall
					this.borderStd({min:68});
					var maxY = walls[0][0].y;
					var height = walls[0][3].y-walls[0][0].y;
					spcs['spc1'].populate(P(35, maxY+10), V(460, height-20), 100, 273);
					spcs['spc3'].populate(P(35, maxY+10), V(460, height-20), 1, 273);
				},
			prompts:[
				{//P0
					setup:undefined,
					text:"whee!",
					title:"Take your shoes off at the door",
				}
			]
		}
	
	]
}
)