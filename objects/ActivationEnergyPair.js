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

function ActivationEnergyPair(attrs) {
	this.type = 'ThresholdEnergyPair';
	if (spcs[attrs.spcNameLow] && spcs[attrs.spcNameHigh]) {
		this.spcNameLow = attrs.spcNameLow;
		this.spcNameHigh = attrs.spcNameHigh;
		this.spcDefLow = spcs[this.spcNameLow];
		this.spcDefHigh = spcs[this.spcNameHigh];
		this.activationEnergy = attrs.activationEnergy;
		this.addToChanger();
		this.setupStd();
	} else {
		console.log('One of the species names in threshold energy pair is bad');
		console.log('The names are ' + attrs.spcNameLow + ' and ' + attrs.spcNameHigh);
	}
}
_.extend(ActivationEnergyPair.prototype, objectFuncs, {
	addToChanger: function() {
		activationEnergySpcChanger.addPair(this);
	},
	remove: function() {
		activationEnergySpcChanger.removePair(this);
	}
})