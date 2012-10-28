function Attractions(){
	this.setStds();
	this.wallSpeed = 1;
	this.readout = new Readout('mainReadout', 30, myCanvas.width-125, 25, '13pt calibri', Col(255,255,255), 'left');
	this.compMode = 'Isothermal';
	addSpecies(['spc1', 'spc3', 'spc4']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(Attractions.prototype, 
			LevelTools, 
{
	init: function(){
		$('#mainHeader').html('THE ATTRACTOR');
		showPrompt(0, 0, true);

	},
	blocks: [
		{//B1
			setup:
				function() {
					walls = WallHandler({pts:[[P(100,260), P(410,260), P(410,410), P(100,410)]], handlers:'staticAdiabatic', handles:['container'], bounds:[{yMin:68, yMax:435}]});
					//walls = WallHandler({pts:[[P(40,68), P(510,68), P(510,410), P(40,410)]], handlers:'staticAdiabatic', handles:['container'], bounds:[{yMin:68, yMax:435}]});
			
					//this.borderStd({min:68});
					var maxY = walls[0][0].y;
					var height = walls[0][3].y-walls[0][0].y;
					
					//spcs['spc1'].populate(P(300, 310), V(100, height-20), 100, 100);
					//spcs['spc3'].populate(P(300, 310), V(100, height-20), 2, 273);
					//HOLDSTILL();
					spcs['spc1'].populate(P(110, 270), V(100, 100), 20, 273);
					this.attract();
					//HOLDSTILL();
					/*
					addListenerOnce(curLevel, 'update', 'lala', function() {
						spcs.spc1.dots[0].v.dy=1;
						spcs.spc1.dots[0].v.dx=.1;
						spcs.spc1.dots[1].v.dy=1;
						spcs.spc1.dots[1].v.dx=-.1;
						this.attract();
						keo = spcs.spc1.dots[0].temp() + spcs.spc1.dots[1].temp();
						peo = spcs.spc1.dots[0].peLast + spcs.spc1.dots[1].peLast;

					}, this)
					*/
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
