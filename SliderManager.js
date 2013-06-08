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

function SliderManager(containerId) {
	this.containerId = containerId; //container div must be empty
	this.sliderGroupWrapper = this.appendSliderGroupWrapper(this.containerId);
}
SliderManager.prototype = {
	addSlider: function(title, handle, attrs, handlers, idx) {
		idx = idx === undefined ? this.getMaxIdx(this.sliderGroupWrapper) + 1 : idx;
		var sliderWrapper = this.insertSliderWrapper(this.containerId, this.sliderGroupWrapper, idx, handle)
		var sliderInnerId = 'sliderInnerDash' + this.dashId + 'Handle' + handle;
		var sliderInnerSelector = '#' + this.containerId + ' #' + sliderInnerId;
		var sliderWrappers = makeSlider(sliderWrapper, sliderWrapper, sliderInnerSelector, sliderInnerId, title, attrs, handlers)
		return new SliderManager.Slider(this, $(sliderInnerSelector));
	},
	insertSliderWrapper: function(containerId, sliderGroupWrapper, idx, handle) {
		var sliderId = 'sliderIdx' + idx + 'Handle' + handle;
		var children = sliderGroupWrapper.children();
		var insertBeforeIdx = -1;
		for (var i=0; i<children.length; i++) {
			var childIdx = $(children[i]).attr('sliderIdx');
			if (childIdx !== undefined && idx <= childIdx) {
				insertBefore = i;
				break;
			}
			
		}
		var divHTML = templater.div({attrs: {id: [sliderId], handle: [handle], sliderIdx: [idx], 'class': ['sliderWrapper']}});//and some class 
		if (insertBeforeIdx == -1) {
			sliderGroupWrapper.append(divHTML);
			
		} else {
			$(children[i]).before(divHTML);
		}
		return $('#' + containerId + ' #' + sliderId);
	},
	getMaxIdx: function(groupWrapper) {
		var children = groupWrapper.children();
		var max = -1;
		for (var i=0; i<children.length; i++) {
			var childIdx = $(children[i]).attr('sliderIdx');
			if (childIdx !== undefined && !isNaN(childIdx)) {
				max = Math.max(childIdx, max);
			}
		}
		return max;
	},
	appendSliderGroupWrapper: function(containerId) {
		var wrapperId = 'sliderWrapper'
		$('#' + containerId).append(templater.div({attrs: {id: [wrapperId]}}));
		return $('#' + containerId + ' #' + wrapperId);
	}
}

SliderManager.Slider = function(manager, slider) {
	this.manager = manager;
	this.slider = slider;//jquery elem
	this.selector = slider.selector;
}

SliderManager.Slider.prototype = {
	remove: function() {
	
	}
}