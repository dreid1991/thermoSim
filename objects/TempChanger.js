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

function TempChanger(attrs) {
	this.type = 'tempChanger';
	this.info = attrs.info;
	this.min = defaultTo(100, attrs.min);
	this.val = dataHandler.temp(this.info);
	this.max = defaultTo(1500, attrs.max);
	this.sliderPos = attrs.sliderPos;
	this.handle = attrs.handle;
	this.totalDots = dataHandler.count(this.info);
	this.setupStd();
	return this.init();
}
_.extend(TempChanger.prototype, objectFuncs, {
	init: function() {
		if (this.totalDots > 1) {
			var title = 'System temperature';
		} else {
			var title = "Molecule's kinetic energy";//temperature";
		}
		this.sliderId = this.addSlider(title, {value:this.valToPercent(this.val)}, [{eventType:'slide', obj:this, func:this.parseSlider}], this.sliderPos);
	},
	parseSlider: function(event, ui) {
		changeTemp(this.info, this.percentToVal(ui.value));
	},
	remove: function(){
		this.removeSlider();
	},
}
)