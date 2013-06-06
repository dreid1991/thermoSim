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

function SliderManager(div, dashId) {
	
	this.container = div; //wrapper div must be empty
	this.dashId = dashId;
	this.sliderGroupWrapper = this.appendSliderGroupWrapper(this.container, this.dashId);
}
SliderManager.prototype = {
	addSlider: function(title, handle, attrs, handlers, idx) {
		var sliderWrapper = this.insertSliderWrapper(this.sliderGroupWrapper, this.dashId, idx, handle)
		var sliderSelector = '#slider' + handle.toCapitalCamelCase() + this.dashId;
		var sliderWrapper = makeSlider(sliderTitleWrapper, sliderWrapper, sliderSelector, title, attrs, handlers)
		if (!this.sliderWrapperSelectors) this.sliderWrapperSelectors = [];
		this.sliderWrapperSelectors.push('.active #' + $(sliderTitleWrapper).attr('id'));
		this.sliderWrapperSelectors.push('.active #' + $(sliderWrapper).attr('id'));
		return sliderSelector;		
	},
	insertSliderWrapper: function(sliderGroupWrapper, dashId, idx, handle) {
		var sliderId = 'sliderDashId' + dashId + 'Idx' + idx + 'Handle' + handle;
		var children = sliderGroupWrapper.children();
		var insertBeforeIdx = -1;
		for (var i=0; i<children.length; i++) {
			var childIdx = $(children[i]).attr('sliderIdx');
			if (childIdx !== undefined && idx <= childIdx) {
				insertBefore = i;
				break;
				
			}
			
		}
		var divHTML = templater.div({attrs: {id: [sliderId]}})
		if (insertBeforeIdx == -1) {
			sliderGroupWrapper.append(divHTML);//and some class 
			
		} else {
			$(children[i]).before(divHTML);
		}
		return $('#' + sliderId);
	},
	
	appendSliderGroupWrapper: function(container, dashId) {
		var wrapperId = 'sliderWrapper' + dashId;
		container.append(templater.div({attrs: {id: [wrapperId]}}));
		return $('#' + wrapperId);
	}
}