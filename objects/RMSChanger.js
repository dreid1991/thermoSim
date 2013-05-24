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

function RMSChanger(attrs) {
	this.type = 'RMSChanger';
	this.info = attrs.info;
	this.min = defaultTo(1, attrs.min);
	this.val = dataHandler.RMS(this.info);
	this.max = defaultTo(15, attrs.max);
	this.handle = attrs.handle;
	//this.handle = 'RMSChanger' + Math.round(this.min).toString() + Math.round(this.val).toString() + Math.round(this.max).toString() + Math.round(Math.random()*1000);
	this.totalDots = dataHandler.count(this.info);
	this.sliderPos = attrs.sliderPos;
	this.setupStd();
	return this.init();
}
_.extend(RMSChanger.prototype, objectFuncs, {
	init: function() {
		if (this.totalDots > 1) {
			var title = "Molecules' RMS";
		} else {
			var title = "Molecule's RMS";
		}
		this.sliderId = this.addSlider(title, {value:this.valToPercent(this.val)}, [{eventType:'slide', obj:this, func:this.parseSlider}], this.sliderPos);
	},
	parseSlider: function(event, ui) {
		changeRMS(this.info, this.percentToVal(ui.value));
	},
	remove: function(){
		this.removeSlider();
	},
}
)