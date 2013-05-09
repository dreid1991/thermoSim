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

function AuxImage(attrs) {
	this.type = 'AuxImage';
	this.handle = attrs.handle;
	this.imgFunc = attrs.imgFunc;
	this.slotNum = attrs.slotNum;
	this.dims = this.getDims()
	this.bgCol = curLevel.bgCol;
	this.makeDiv(this.slotNum)
	this.addImage(this.imgFunc);
	curLevel.auxs[this.handle] = this;
	this.setupStd();
}

_.extend(AuxImage.prototype, AuxFunctions, objectFuncs, {//CONSISTANT PLEASE - FUNCS/FUNCTIONS
	makeDiv: function(slotNum) {
		this.parentDiv = this.pickParentDiv('picture', slotNum);
		this.parentDiv.html('');
		$(this.parentDiv).css({width: this.dims.dx, height: this.dims.dy, 'background-color': this.bgCol.hex, 'border-radius': 20, padding: 0});
	},
	addImage: function(imgPath) {
		var self = this;
		var imgObj;
		var imgObj = interpreter.parseImgFunc(imgPath, true);
		if (!imgObj.attrs) imgObj.attrs = {};
		imgObj.attrs.id = [this.type + this.handle];
		$(this.parentDiv).append(templater.img(imgObj));
		var img = $('#' + imgObj.attrs.id[0]);
		$(img).load(function() {
			var parentDims = V(self.parentDiv.width(), self.parentDiv.height());
			var origImgDims = V(img.width(), img.height());
			var scaleX = Math.min(origImgDims.dx, parentDims.dx) / origImgDims.dx;
			var scaleY = Math.min(origImgDims.dy, parentDims.dy) / origImgDims.dy;
			var scaleFactor = Math.min(scaleX, scaleY);
			var imgDims = origImgDims.copy().mult(scaleFactor);
			var imgPos = P(parentDims.dx/2 - imgDims.dx/2, parentDims.dy/2 - imgDims.dy/2);
			
			$(img).css({position: 'absolute', left: imgPos.x, top: imgPos.y, width: imgDims.dx, height: imgDims.dy});
		})
			
		
	},
	clearHTML: function() {
		this.cleanUpParent();
	},
	restoreHTML: function() {
		$(this.parentDiv).css({width: this.dims.dx, height: this.dims.dy, 'background-color': this.bgCol.hex, 'border-radius': 20, padding: 0});
		this.addImage(this.imgFunc);
	},
	remove: function() {
		this.cleanUpParent();
		delete curLevel.auxs[this.handle];

	}

})