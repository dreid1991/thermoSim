//should move things like remove to here. Also, change from 'graph1,2' to aux1,2 when time
AuxFunctions = {
	getDims: function() {
		var dx = 400;
		var dyTotal = $('#main').height();
		dyTotal -= $('#graphSpacer').height();
		var dy = dyTotal/2;//number of graphs;
		return V(dx, dy);
	},
	pickParentDiv: function(fillWith) {
		for (var divIdx=0; divIdx<graphHolderDivs.length; divIdx++) {
			var div = $('#'+graphHolderDivs[divIdx]);
			var filledWith = $(div).attr('filledWith')
			if (filledWith == 'empty' || filledWith == 'blank') {
				$(div).attr('filledWith', fillWith);
				return div;
			}
		}
		console.log("Graphs are all full!");
	},
}