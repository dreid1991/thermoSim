//should move things like remove to here. Also, change from 'graph1,2' to aux1,2 when time
AuxFunctions = {
	getDims: function() {
		var dx = 400;
		var dyTotal = $('#main').height();
		dyTotal -= $('#auxSpacer').height();
		var dy = dyTotal/2;//number of aux slots;
		return V(dx, dy);
	},
	pickParentDiv: function(fillWith) {
		for (var divIdx=0; divIdx<auxHolderDivs.length; divIdx++) {
			var div = $('#'+auxHolderDivs[divIdx]);
			var filledWith = $(div).attr('filledWith')
			if (filledWith == '') {
				$(div).attr('filledWith', fillWith);
				return div;
			}
		}
		console.log("Aux divs are all full!");
		console.trace();
	},
	cleanUpParent: function() {
		$(this.parentDiv).removeAttr('style');
		this.parentDiv.html('');
		$(this.parentDiv).attr('filledWith', '');
	},
}