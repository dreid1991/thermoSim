/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//should move things like remove to here. Also, change from 'graph1,2' to aux1,2 when time
AuxFunctions = {
	getDims: function() {
		var dx = 400;
		var dyTotal = $('#main').height();
		dyTotal -= $('#auxSpacer').height();
		var dy = dyTotal/2;//number of aux slots;
		return V(dx, dy);
	},
	pickParentDiv: function(fillWith, slotNum) {
		if (slotNum === undefined) {
			for (var divIdx=0; divIdx<auxHolderDivs.length; divIdx++) {
				var div = $('#' + auxHolderDivs[divIdx]);
				var filledWith = $(div).attr('filledWith')
				if (filledWith == '') {
					$(div).attr('filledWith', fillWith);
					return div;
				}
			}
			console.log("Aux divs are all full!");
			console.trace();
		} else {
			var div = $('#' + auxHolderDivs[slotNum]);
			if (!div.length) {
				console.log('Bad div idx ' + slotNum + '.  Defaulting to next empty slot');
				return this.pickParentDiv(fillWith);
			}
			var filledWith = $(div).attr('filledWith');
			if (!(filledWith == '' || filledWith == undefined)) {
				console.log('Trying to add ' + fillWith + ' in ' + slotNum + ' but ' + slotNum + ' is already filled with ' + filledWith + '.');
				console.log('Defaulting to next empty slot');
				return this.pickParentDiv(fillWith) 
			} else {
				$(div).attr('filledWith', fillWith);
				return div;
			}
		}
	},
	parentDivEmpty: function() {
		var filledWith = this.parentDiv.attr('filledWith');
		return filledWith == undefined || filledWith == '';
	},
	cleanUpParent: function() {
		$(this.parentDiv).removeAttr('style');
		$(this.parentDiv).html('');
		$(this.parentDiv).attr('filledWith', '');
	},
}