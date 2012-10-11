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
		$('#mainHeader').html('THE REACTOR');
		showPrompt(0, 0, true);

	},
	blocks: [
		{//B1
			setup:
				function() {
					//walls = WallHandler({pts:[[P(490,300), P(510,300), P(510,410), P(490,410)]], handlers:'staticAdiabatic', handles:['container'], bounds:[{yMin:68, yMax:435}]});
					walls = WallHandler({pts:[[P(200,300), P(510,300), P(510,410), P(200,410)]], handlers:'staticAdiabatic', handles:['container'], bounds:[{yMin:68, yMax:435}]});
					//add temp to wall
					this.borderStd({min:68});
					var maxY = walls[0][0].y;
					var height = walls[0][3].y-walls[0][0].y;
					spcs['spc1'].populate(P(300, 310), V(100, height-20), 50, 273);
					spcs['spc3'].populate(P(300, 310), V(100, height-20), 50, 273);
					//spcs['spc4'].populate(P(495, 310), V(5, height-20), 3, 273);
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
