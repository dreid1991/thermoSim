/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function Sandbox(attrs){
	this.type = 'Sandbox';
	this.handle = attrs.handle;
	this.emitterNum = 0;
	var self = this;
	attrs = defaultTo({}, attrs);
	this.bin = {};
	this.sand = {};
	this.canvasHandle = attrs.canvasHandle || 'main';
	this.wallInfo = defaultTo(0, attrs.wallInfo);
	this.wall = walls[this.wallInfo];
	//must send init as pressure
	this.mass = this.pressureToMass(defaultTo(2, attrs.init));
	this.massMin = this.pressureToMass(defaultTo(.5, attrs.min));
	this.massMax = this.pressureToMass(defaultTo(15, attrs.max));


	this.particleMass = defaultTo(.01, attrs.partMass);
	this.buttonAddId = 'sandAdd' + this.handle;
	this.buttonRemoveId = 'sandRemove' + this.handle;
	this.makeButtons();
	
	this.massChunkName = 'sandMass' + defaultTo('', this.handle);
	this.wall.setMass(this.massChunkName, this.mass);	
	this.wall.recordPExt();
	this.wall.recordWork();
	this.wallHandler = defaultTo('cPAdiabaticDamped', attrs.compMode);	
	walls.setSubWallHandler(this.wallInfo, 0, this.wallHandler);	
	this.trackingPts = [];
	this.wallPt = this.wall[0];
	
	this.emitters = new Array();

	this.binX = (this.wall[1].x+this.wall[0].x)/2;

	this.spcVol = 70; //specific volume
	this.sand.col = defaultTo(Col(224, 165, 75), attrs.sandCol);
	this.sand.pts = this.getSandPts();
	this.sand.pos = P(this.binX, this.wall[0].y).track({pt:this.wallPt, noTrack:'x'});
	this.trackingPts.push(this.sand.pos);
	this.pistonPt = this.wall[0].y;
	
	this.setupStd();
	
	return this.init();	
}
_.extend(Sandbox.prototype, compressorFuncs, objectFuncs,
{
	init: function(){	
		this.drawListenerName = 'drawSand' + this.handle;
		canvasManager.addListener(this.canvasHandle, this.drawListenerName, this.draw, this, 2);
		this.wall.moveInit();
		this.wall.recordMass();
		this.wall.recordPExt();
		return this;
	},
	makeButtons: function(){
		var self = this;
		var groupHandle = this.handle + 'SandButtons';
		buttonManager.addGroup(groupHandle, 'Sand controls');
		//groupHandle, handle, label, exprs, prefIdx, isDown)
		buttonManager.addButton(groupHandle, 'add', 'Add mass', 
			{mousedown: function() 
				{
					self.buttonAddDown();
				}
			}
		);
		buttonManager.addButton(groupHandle, 'remove', 'Remove mass', 
			{mousedown: function() 
				{
					self.buttonRemoveDown();
				}
			}
		);
	
		// addButton(this.buttonAddId, 'Add mass');
		// addButton(this.buttonRemoveId, 'Remove mass');
		// $('#'+this.buttonAddId).mousedown(function(){self.buttonAddDown()});
		// //$('#'+this.buttonAddId).mouseup(function(){self.buttonAddUp()});
		
		// $('#'+this.buttonRemoveId).mousedown(function(){self.buttonRemoveDown()});
		// //$('#'+this.buttonRemoveId).mouseup(function(){self.buttonRemoveUp()});
	},
	removeButtons: function(){
		$('#' + this.buttonAddId).remove();
		$('#' + this.buttonRemoveId).remove();
	},
	draw: function(ctx){
		ctx.save();
		ctx.translate(this.sand.pos.x, this.sand.pos.y);
		var scalar = Math.sqrt(this.mass*.4);
		ctx.scale(scalar, scalar)
		draw.fillPts(this.sand.pts, this.sand.col, ctx);
		this.width = scalar * (this.sand.pts[this.sand.pts.length-1].x - this.sand.pts[0].x);
		ctx.restore();		
	},
	getSandPts: function(){
		var pts = new Array(4);
		pts[0] = P(-10, 0);
		pts[1] = P(-7, -2);
		pts[2] = P(-3, -6);
		pts[3] = P(0, -7);
		ptsRight = deepCopy(pts).splice(0, pts.length-1).reverse();
		mirrorPts(ptsRight, P(0, 0), V(0, -10));
		pts = pts.concat(ptsRight);
		return pts;
	},
	buttonAddDown: function(){
		if(this.mass < this.massMax){
			this.boundUpper();
			this.addMass();
			addListener(curLevel, 'mouseup', 'mouseUpSandbox', this.buttonAddUp, this);
		}
	},
	buttonAddUp: function(){
		this.boundUpperStop();
		this.addMassStop();	
		removeListener(curLevel, 'mouseup', 'mouseUpSandbox');
	},
	buttonRemoveDown: function(){
		if(this.mass > this.massMin){
			this.boundLower();
			this.removeMass();
			addListener(curLevel, 'mouseup', 'mouseUpSandbox', this.buttonRemoveUp, this);
		}
	},
	buttonRemoveUp: function(){
		this.boundLowerStop();
		this.removeMassStop();
		removeListener(curLevel, 'mouseup', 'mouseUpSandbox');
	},
	boundUpper: function(){
		var listenerName = this.handle + 'BoundUpper'
		if (!curLevel.updateListeners[listenerName]) {
			addListener(curLevel, 'update', listenerName,
				function(){
					if (this.mass > this.massMax) {
						this.stopAllEmitters()
						removeListener(curLevel, 'update', listenerName);
					}
				},
			this)
		}
	},
	boundLower: function(){
		var listenerName = this.handle + 'BoundLower'
		if(!curLevel.updateListeners[listenerName]){
			addListener(curLevel, 'update', listenerName,
				function(){
					if(this.mass < this.massMin){
						this.stopAllEmitters();
						removeListener(curLevel, 'update', listenerName);
					}
				},
			this)
		}	
	},
	boundUpperStop: function(){
		var listenerName = this.handle + 'BoundUpper';
		removeListener(curLevel, 'update', listenerName);
	},
	boundLowerStop: function(){
		var listenerName = this.handle + 'BoundLower';
		removeListener(curLevel, 'update', listenerName);	
	},
	stopAllEmitters: function(){
		for(var emitterIdx=0; emitterIdx<this.emitters.length; emitterIdx++){
			this.emitters[emitterIdx].stopFlow();
		}
	},
	addMass: function(){
		this.emitters.push(this.makeAddEmitter())
	},
	addMassStop: function(){
		this.emitters[this.emitters.length-1].stopFlow();
	},
	removeMass: function(){
		this.emitters.push(this.makeRemoveEmitter());
	},
	removeMassStop: function(){
		this.emitters[this.emitters.length-1].stopFlow();
	},
	makeAddEmitter: function(){
		var emitterHandle = this.handle + this.emitterNum;
		this.emitterNum ++;
		var onArrive = {func:this.onArriveAdd, obj:this};
		var emitterIdx = this.emitters.length;
		
		var dir = Math.PI/2;
		var col = this.sand.col;
		var centerPos = (this.wall[0].x + this.wall[1].x)/2;
		var dist = this.wall[0].y;
		var newEmitter = new ParticleEmitter({pos:P(centerPos, 0), width:this.width, dist:dist, dir:dir, col:col,
											onRemove:onRemove, parentList:this.emitters, onArrive:onArrive, handle: emitterHandle});
		newEmitter.adding = true;
		moveListenerName = unique('adjustEmitter' + emitterIdx, curLevel.updateListeners)
		addListener(curLevel, 'update', moveListenerName, 
			function(){
				newEmitter.adjust({dist:this.wallPt.y, width:this.width});
			},
		this);
		var onRemove = 
			{func:function(){
				removeListener(curLevel, 'update', moveListenerName);
			}, 
			obj:this};
		
		return newEmitter;
	},
	makeRemoveEmitter: function(){
		var emitterHandle = this.handle + this.emitterNum;
		this.emitterNum ++;
		var onGenerate = {func:this.onGenerateRemove, obj:this};
		var emitterIdx = this.emitters.length;
		var dir = -Math.PI/2;
		var col = this.sand.col;
		var centerPos = (this.wall[0].x + this.wall[1].x)/2;
		var dist = this.wall[0].y;
		var newEmitter = new ParticleEmitter({pos:P(centerPos, 0), width:this.width, dist:dist, dir:dir, col:col,
											onRemove:onRemove, parentList:this.emitters, onGenerate:onGenerate, handle: emitterHandle});
		newEmitter.removing = true;
		moveListenerName = unique('adjustEmitter' + emitterIdx, curLevel.updateListeners)
		var wallPt = this.wall[0];
		addListener(curLevel, 'update', moveListenerName, 
			function(){
				newEmitter.adjust({pos:P(centerPos, wallPt.y), dist:wallPt.y, width:this.width});
			},
		this);
		var onRemove = 
			{func:function(){
				removeListener(curLevel, 'update', moveListenerName);
			}, 
			obj:this};
		
		return newEmitter;		
	},
	onGenerateRemove: function(){
		this.mass-=this.particleMass;
		this.wall.setMass(this.massChunkName, this.mass);
	},
	onArriveAdd: function(){
		this.mass+=this.particleMass;
		this.wall.setMass(this.massChunkName, this.mass);	
	},
	remove: function(){
		for (var emitterIdx=0; emitterIdx<this.emitters.length; emitterIdx++) {
			this.emitters[emitterIdx].remove();
		}
		this.emitters = [];
		this.trackingPts.map(function(pt) {pt.trackStop()});
		this.trackingPts.splice(0, this.trackingPts.length);
		this.removeButtons();
		canvasManager.removeListener(this.canvasHandle, this.drawListenerName);
		removeListener(curLevel, 'data', this.cleanUpEmittersListenerName);	
		this.wall.moveStop();
	},


}
)