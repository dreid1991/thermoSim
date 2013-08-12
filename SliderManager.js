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
		idx = (typeof idx != 'number' && idx >= 0) ? this.getMaxIdx(this.sliderGroupWrapper) + 1 : idx;
		var sliderWrapper = this.insertSliderWrapper(this.containerId, this.sliderGroupWrapper, idx, handle)
		var sliderPadding = this.insertSliderPadding(this.containerId, sliderWrapper);
		var sliderInnerId = 'sliderInnerContainer' + this.containerId + 'Handle' + handle;
		var sliderInnerSelector = '#' + this.containerId + ' #' + sliderInnerId;
		var sliderWrappers = makeSlider(sliderPadding, sliderPadding, sliderInnerSelector, sliderInnerId, title, attrs, handlers)
		this.setWidths();
		return new SliderManager.Slider(this, sliderWrapper, $(sliderInnerSelector));
	},
	setWidths: function() {
		var children = this.sliderGroupWrapper.children();
		if (children.length) {
			var wrapperWidthPercent = 100 * 1.5 * children.length / (1 + 1.5 * children.length);
			this.sliderGroupWrapper.css('width', wrapperWidthPercent + '%');
			var childWidthPercent = 100 / children.length;
			for (var i=0; i<children.length; i++) {
				$(children[i]).css('width', childWidthPercent + '%');
			}
		}
		
	},
	insertSliderWrapper: function(containerId, sliderGroupWrapper, idx, handle) {
		var sliderId = 'sliderIdx' + idx + 'Handle' + handle;
		var children = sliderGroupWrapper.children();
		var insertBeforeIdx = -1;
		for (var i=0; i<children.length; i++) {
			var childIdx = $(children[i]).attr('sliderIdx');
			if (childIdx !== undefined && idx <= childIdx) {
				insertBeforeIdx = i;
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
	insertSliderPadding: function(containerId, sliderWrapper) {
		var id = sliderWrapper.attr('id') + 'Padding'
		var html = templater.div({attrs: {id: [id], 'class': ['sliderPadding']}});
		sliderWrapper.append(html);
		return $('#' + containerId + ' #' + sliderWrapper.attr('id') + ' #' + id);
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
		$('#' + containerId).append(templater.div({attrs: {id: [wrapperId], 'class': ['sliderGroupWrapper']}}));
		return $('#' + containerId + ' #' + wrapperId);
	}
}

SliderManager.Slider = function(manager, wrapper, slider) {
	this.manager = manager;
	this.wrapper = wrapper;//jquery elem
	this.slider = slider;//jquery elem
	this.selector = slider.selector;
	this.removed = false;
}

SliderManager.Slider.prototype = {
	remove: function() {
		if (!this.removed) {
			this.wrapper.remove();
			this.manager.setWidths();
			this.removed = true;
		}
		
	},
	enable: function() {
		$(this.selector).slider('enable');
	},
	disable: function() {
		$(this.selector).slider('disable');
	}
}