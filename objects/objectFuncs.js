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

compressorFuncs = {
	getBinPts: function(pos, slant, dims, thickness){
		var pts = []
		var thickness = defaultTo(5, thickness);
		pts.push(P(pos.x - slant*dims.dx/2, pos.y - dims.dy));
		pts.push(P(pos.x - dims.dx/2, pos.y));
		pts.push(P(pos.x + dims.dx/2, pos.y));
		pts.push(P(pos.x + slant*dims.dx/2, pos.y - dims.dy));
		pts.push(P(pos.x + slant*dims.dx/2+thickness, pos.y - dims.dy));
		pts.push(P(pos.x + dims.dx/2 + thickness, pos.y +thickness));
		pts.push(P(pos.x - dims.dx/2 - thickness, pos.y +thickness));
		pts.push(P(pos.x - slant*dims.dx/2 - thickness, pos.y - dims.dy));
		pts.push(P(pos.x - slant*dims.dx/2, pos.y - dims.dy));
		return pts;
	},
}

objectFuncs = {
	setupStd: function() {
		this.enabled = true;
		this.removed = false;
		if (this.handle) this.addToCurLevel();
		this.wrapRemove();
	},
	wrapRemove: function() {
		var removeOld = this.remove;
		this.remove = function() {
			this.removed = true;
			if (this.handle) this.removeFromCurLevel();
			removeOld.apply(this);
		}
	},
	addToCurLevel: function() {
		
		curLevel[curLevel.key(this.type, this.handle)] = this;
	},
	removeFromCurLevel: function() {
		var key = curLevel.key(this.type, this.handle);
		//removing 'safties'.  This will be replaced soon anyway
		// if (curLevel[key] == this) {
			delete curLevel[key];
		// } else {
			// console.log("Trying to remove " + key + " but handle doesn't belong to this object");
		// }
	},
	pickSliderPos: function(){
		var xPos;
		if (this.wall) {
			xPos = (this.wall[0].x + this.wall[1].x)/2;
		} else if (this.pos && this.dims) {
			xPos = this.pos.x + this.dims.dx/2;
		} else if (this.pos) {
			xPos = this.pos.x;
		}
		if (!xPos) {
			return this.checkForMigrateCenter();
			//ooh - maybe make it check if that div is empty.  If not, move contents of center to left/right
		} else {
			var width = $('#main').width();
			var segmentWidth = width/3;
			var divDest = Math.floor(xPos/segmentWidth);
			if (divDest==0) {
				return 'left';
			} else if (divDest==1) {
				return this.checkForMigrateCenter();
			} else if(divDest==2) {
				return 'right';
			}
		}
		return this.checkForMigrateCenter();
	},
	addSlider: function(title, attrs, handlers, position, sliderWrapper, sliderTitleWrapper){
		if (!(sliderWrapper && sliderTitleWrapper)) {
			if (!position) {
				position = this.pickSliderPos();
			}
			
			switch (position) {
				case 'left':
					sliderWrapper = $('.active #sliderHolderLeft');
					$('.active #sliderHolderSingle').hide();
					$('.active #sliderHolderDouble').show();
					break;
				case 'center':
					sliderWrapper = $('.active #sliderHolderCenter');
					$('.active #sliderHolderSingle').show();
					$('.active #sliderHolderDouble').hide();
					break;
				case 'right':
					sliderWrapper = $('.active #sliderHolderRight');
					$('.active #sliderHolderSingle').hide();
					$('.active #sliderHolderDouble').show();
					break;
			}
			sliderTitleWrapper = sliderWrapper;
		}
		var sliderSelector = '.active #slider' + this.handle.toCapitalCamelCase();
		var sliderWrapper = makeSlider(sliderTitleWrapper, sliderWrapper, sliderSelector, title, attrs, handlers)
		if (!this.sliderWrapperSelectors) this.sliderWrapperSelectors = [];
		this.sliderWrapperSelectors.push('.active #' + $(sliderTitleWrapper).attr('id'));
		this.sliderWrapperSelectors.push('.active #' + $(sliderWrapper).attr('id'));
		return sliderSelector;
	},
	//remove this. can't clone sliders.  or make more clever to clone it thyself method
	checkForMigrateCenter: function() {
		if ($('#sliderHolderCenter').html().killWhiteSpace() != '') {
			this.migrateCenterSlider();
			return 'right';
		} else {
			return 'center';
		}
	},
	migrateCenterSlider: function() {
		var centerHTML = $('#sliderHolderCenter').html();
		$('#sliderHolderCenter').html('');
		$('#sliderHolderLeft').html(centerHTML);
	},
	removeSlider: function() {
		//can be seperate wrappers for title, slider
		if (this.sliderWrapperSelectors) {
			for (var wrapperIdx=0; wrapperIdx<this.sliderWrapperSelectors.length; wrapperIdx++) {
				$(this.sliderWrapperSelectors[wrapperIdx]).html('');
			}
		}
		
	},
	hideSliderDivs: function(){
		$('.active #sliderHolderSingle').hide();
		$('.active #sliderHolderDouble').hide();
	},
	valToPercent: function(val) {
		return 100*(val-this.min)/(this.max-this.min);
	},
	percentToVal: function(percent) {
		return (percent*(this.max-this.min)/100+this.min);
	},
	pressureToMass: function(pressure) {
		return pressure*(this.wall[1].x-this.wall[0].x)/(pConst*g);
	},
	massToPressure: function(mass) {
		return mass*pConst*g/(this.wall[1].x-this.wall[0].x);
	},
	toggle: function() {
		if (this.enabled) {
			this.disable();
		} else {
			this.enable();
		}
	}
}