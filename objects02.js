/*
Contains:
	Sandbox
*/
function Sandbox(attrs){
	var self = this;
	attrs = defaultTo({}, attrs);
	this.bin = {};
	this.drawCanvas = defaultTo(c, attrs.drawCanvas);
	this.rate = defaultTo(.15, attrs.rate);
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	this.massMax = defaultTo(75, attrs.massMax);
	this.massMin = defaultTo(10, attrs.massMin);
	this.mass = defaultTo(10, attrs.massInit);
	this.buttonAdd = defaultTo('buttonAddMass', attrs.addButtonId);
	this.buttonRemove = defaultTo('buttonRemoveMass', attrs.removeButtonId);

	this.makeButtons();
	
	this.massChunkName = 'sandMass' + defaultTo('', attrs.handle);
	this.wall.setMass(this.massChunkName, this.mass);	
	this.wall.recordPExt();
	this.wall.recordWork();
	this.wallHandler = defaultTo('cPAdiabaticDamped', attrs.compMode) + compAdj;	
	walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);	
	
		
	
	this.bin.col = defaultTo(Col(175, 175, 175), attrs.binCol);
	this.bin.slant = defaultTo(1.3, attrs.binSlant);
	this.bin.width = defaultTo(220, attrs.binWidth);
	this.bin.widthUpper = this.bin.width*this.bin.slant;
	this.bin.height = 30;
	this.bin.thickness = defaultTo(5, attrs.binThickness);
	
	this.spcVol = 70; //specific volume
	this.sand.col = defaultTo(Col(224, 165, 75), attrs.blockCol);
	this.sand.pts = this.getLiquidPts();

	this.bin.pts = this.getBinPts(P(0,0-this.bin.thickness), this.bin.slant, V(this.bin.width, this.bin.height), this.bin.thickness);
	this.binX = (this.wall[1].x+this.wall[0].x)/2;
	this.pistonPt = this.wall[0].y;
	
	this.addCleanUp();
	
	return this.init();	
}
_.extend(Sandbox.prototype, compressorFuncs, objectFuncs,
{
	init: function(){	
		addListener(curLevel, 'update', 'drawPool', this.draw, this);
		this.wall.moveInit();	
		return this.displayMass().displayPressure();
	},
	makeButtons: function(){
		addButton(this.buttonAddId, 'Add mass');
		addButton(this.buttonRemoveId, 'Remove mass');
		var self = this;
		$('#'+this.buttonAddId).mousedown(function(){self.buttonAddDown()});
		$('#'+this.buttonAddId).mouseup(function(){self.buttonAddUp()});
		
		$('#'+this.buttonRemoveId).mousedown(function(){self.buttonRemoveDown()});
		$('#'+this.buttonRemoveId).mouseup(function(){self.buttonRemoveUp()});
	},
	draw: function(){
		this.drawCanvas.save();
		this.drawCanvas.translate(this.binX, this.pistonY());
		draw.fillPts(this.bin.pts, this.bin.col, this.drawCanvas);
		draw.fillPts(this.sand.pts, this.liquid.col, this.drawCanvas);
		this.drawCanvas.restore();		
	},

	getSandPts: function(){
		var dWidth = this.bin.widthUpper - this.bin.width;
		this.liquid.height = this.mass*this.spcVol/(this.bin.width + (dWidth)/this.bin.height);
		var height = this.liquid.height;
		var pts = new Array(4);
		var liquidDWidth = dWidth*height/this.bin.height;
		pts[0] = P(-this.bin.width/2, -this.bin.thickness);
		pts[1] = P(this.bin.width/2, -this.bin.thickness);
		pts[2] = P((this.bin.width + liquidDWidth)/2, -height-this.bin.thickness);
		pts[3] = P((-this.bin.width - liquidDWidth)/2, -height-this.bin.thickness);
		return pts;
	},
	buttonFillDown: function(){
		this.extendTubeFill();
	},
	buttonFillUp: function(){
		this.retractTube();
		
	},
	buttonDrainDown: function(){
		this.extendTubeDrain();
	},
	buttonDrainUp: function(){
		this.retractTube();
	},
	changeMassFunc: function(sign){
		return function(){
			this.mass  = Math.min(this.massMax, Math.max(this.mass + sign*this.rate, this.massMin));
			this.liquid.pts = this.getLiquidPts();
			this.wall.setMass(this.massChunkName, this.mass);
		}
	},

	remove: function(){
		removeListener(curLevel, 'update', 'extendTube');
		removeListener(curLevel, 'update', 'extendFluid');
		removeListener(curLevel, 'update', 'changeLiquidMass');
		removeListener(curLevel, 'update', 'liquidUp');
		removeListener(curLevel, 'update', 'drawTube');
		removeListener(curLevel, 'update', 'drawPool');	
		this.wall.moveStop();
		//this.stops.remove();
	},


}