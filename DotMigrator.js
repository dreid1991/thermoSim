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

function DotMigrator(sectionWalls){
	this.numRows = 100;
	this.numCols = 100;
}

DotMigrator.prototype = {
/*
There are two maps - positive and negative.  You check positive if you want to know if a dot is allowed to go in a square,
negative if you want to check if it's disallowed there.  The resolution of the grid is not perfect, so the allowed one is contracted by
one square and the disallowed one is expanded by one.  
*/
	migrateDots: function(dots, allowedWallHandles, allowedOrderType, disallowedWallHandles, disallowedOrderType) { //type -> 'any', 'all'
	
		var width = document.getElementById('myCanvas').width;
		var height = document.getElementById('myCanvas').height;
		var colWidth = width / this.numCols;
		var rowHeight = height / this.numRows;
		var offset = .12345; //because who even wants to deal with grid points being on wall points?
		var closedWalls = this.spliceOpenWalls(window.walls)
		var sortedWalls = _.sortBy(closedWalls, function(wall) {return wall.handle});
		allowedWallHandles = _.sortBy(allowedWallHandles, function(a) {return a});
		disallowedWallHandles = _.sortBy(disallowedWallHandles, function(a) {return a});
		var positiveMap = this.makeModifiedMap(sortedWalls, 'contract', offset, colWidth, rowHeight);
		var negativeMap = this.makeModifiedMap(sortedWalls, 'expand', offset, colWidth, rowHeight);
		var disallowedBoolMap = this.makeBooleanMap(negativeMap, disallowedWallHandles, disallowedOrderType);
		var allowedBoolMap = this.makeBooleanMap(positiveMap, allowedWallHandles, allowedOrderType);
		this.subtractBooleanMap(allowedBoolMap, disallowedBoolMap);

		var allowedCoords = this.mapToCoordList(allowedBoolMap);

		if (!allowedCoords.length) return false;
		//expected behavior: If a dot is is disallowed it will be moved to allowed.  If it is in neither disallowed or allowed, it will not be moved.  
		//Trying to make effects of migrating dots not accidentally overreach.
		var numCols = this.numCols;
		var numRows = this.numRows;
		
		for (var i=0; i<dots.length; i++) {
			
			var curColIdx = Math.floor((dots[i].x + offset) / colWidth);
			var curRowIdx = Math.floor((dots[i].y + offset) / rowHeight);
			
			if (disallowedBoolMap[curColIdx][curRowIdx]) {
				this.migrateDot(migratingDot, allowedCoords, offset, numCols, numRows, colWidth, rowHeight);
			}

		}
	},
	spliceOpenWalls: function(allWalls) {
		var closed = [];
		for (var i=0; i<allWalls.length; i++) {
			if (allWalls[i].closed) closed.push(allWalls[i]);
		}
		return closed;
	},
	mapToCoordList: function(boolMap) {
		var coords = [];
		for (var x=0; x<map.length; x++) {
			for (var y=0; y<map[0].length; y++) {
				if (map[x][y]) coords.push(P(x, y));
			}
		}
		return coords;
	},
	migrateDot: function(migratingDot, allowedCoords, offset, numCols, numRows, colWidth, rowHeight) {
		var coord = allowedCoords[Math.floor(Math.random() * allowedCoords.length)];
		migratingDot.dot.x = offset + (coord.x + Math.random()) * colWidth;
		migratingDot.dot.y = offset + (coord.y + Math.random()) * rowHeight;
	},
	makeBooleanMap: function(map, handles, type) {//all sorted by handle
		var allowedMap = this.makeGridBoolean(this.numCols, this.numRows);
		for (var x=0, xx=map.length; x<xx; x++) {
			for (var y=0, yy=map[0].length; y<yy; y++) {
				allowedMap[x][y] = this.listsOverlap(map[x][y], handles, type);
			}
		}
	},
	listsOverlap: function(a, b, overlapType) {
		//a, b both sorted alphabetically
		if (overlapType == 'all') {
			for (var i=0; i<a.length; i++) {
				if (b.indexOf(a[i]) < 0) return false;
			}
			return true;
		} else if (overlapType == 'only') {
			if (a.length != b.length) return false;
			for (var i=0; i<a.length; i++) {
				if (a[i] != b[i]) return false;
			}
			return true;
		} else if (overlapType == 'any') {
			for (var i=0; i<a.length; i++) {
				if (b.indexOf(a[i]) > -1) return true;
			}
			return false
		}
	},
	subtractBooleanMap: function(a, b) {
		for (var x=0, xx=a.length; x<xx; x++) {
			for (var y=0, yy=a[0].length; y<yy; y++) {
				a[x][y] = Math.min(a[x][y], b[x][y]);
			}
		}
	},
	squareValid: function(migratingDot, allowedSquare, disallowedSquare) {
		var hasAllowed = false;
		var hasDisallwed = false;
		for (var i=0; i<migratingDot.allowedWallHandles.length; i++) {
			if (allowedSquare.indexOf(migratingDot.allowedWallHandles[i]) > -1) {
				hasAllowed = true;
				break;
			}
		}
		for (var i=0; i<migratingDot.disallowedWallHandles.length; i++) {
			if (disallowedSquare.indexOf(migratingDot.disallowedWallHandles[i]) > -1) {
				hasDisallowed = true;
				break;
			}
		}
		
		return hasAllowed && !hasDisallowed;
	},
	makeModifiedMap: function(sectionWalls, modifier, offset, colWidth, rowHeight) {//modifier being expand or contract
		var listMap = this.makeGrid(this.numCols, this.numRows);
		var wallBoolMaps = [];
		for (var i=0; i<sectionWalls.length; i++) { //sectionWalls is sorted by handle, so the listMap will be sorted as well
			var wallMap = new DotMigrator.WallMap(sectionWalls[i], this.numCols, this.numRows, offset, colWidth, rowHeight);
			wallMap[modifier]();
			wallBoolMaps.push(wallMap);
		}
		for (var i=0; i<this.numCols; i++) {
			for (var j=0; j<this.numRows; j++) {
				for (var a=0; a<wallBoolMaps.length; a++) {
					if (wallBoolMaps[a].grid[i][j]) {
						listMap[i][j].push(wallBoolMaps[a].wall.handle);
					}
				}
			}
		}
		return listMap;
	},
	makeGrid: function(numCols, numRows) {
		var grid = new Array(numCols); //I think this grid is addressed as [x][y]
		for (var colIdx=0; colIdx<numCols; colIdx++) {
			var col = new Array(numRows)
			for (var rowIdx=0; rowIdx<numRows; rowIdx++) {
				col[rowIdx] = [];
			}
			grid[colIdx] = col;
		}
		return grid;		
	},
	makeGridBoolean: function(numCols, numRows) {
		var grid = new Array(numCols); //I think this grid is addressed as [x][y]
		for (var colIdx=0; colIdx<numCols; colIdx++) {
			var col = new Array(numRows)
			for (var rowIdx=0; rowIdx<numRows; rowIdx++) {
				col[rowIdx] = false;
			}
			grid[colIdx] = col;
		}
		return grid;			
	},

}

DotMigrator.WallMap = function(wall, numCols, numRows, offset, colWidth, rowHeight) {
	this.wall = wall;
	this.grid = this.makeGrid(numCols, numRows);
	this.mapWallOntoGrid(wall, this.grid, offset, colWidth, rowHeight);
}

DotMigrator.WallMap.prototype = {
	makeGrid: function(numCols, numRows) {
		var grid = new Array(numCols); //I think this grid is addressed as [x][y]
		for (var colIdx=0; colIdx<numCols; colIdx++) {
			var col = new Array(numRows)
			for (var rowIdx=0; rowIdx<numRows; rowIdx++) {
				col[rowIdx] = false;
			}
			grid[colIdx] = col;
		}
		return grid;			
	},
	mapWallOntoGrid: function(wall, grid, offset, colWidth, rowHeight) {
		var nodes = [];
		var i, j;
		for (var yGridIdx=0; yGridIdx<grid.length; yGridIdx++) {
			var yVal = offset + rowHeight * (yGridIdx + .5);
			var nodeXs = [];
			for (i=0, j=wall.length-1; i<wall.length; i++) {
				if ((wall[i].y < yVal && wall[j].y >= yVal) || wall[j].y < yVal && wall[i].y >= yVal) {
					nodeXs.push(wall[i].x + (yVal - wall[i].y) / (wall[j].y - wall[i].y) * (wall[j].x - wall[i].x));
				}
				j = i;
			}
			i = 0;
			//bubble sort
			while (i < nodeXs.length - 1) {
				if (nodeXs[i] > nodeXs[i+1]) {
					var swap = nodeXs[i];
					nodeXs[i] = nodeXs[i+1];
					nodeXs[i+1] = swap;
					if (i) i--;
				} else {
					i++;
				}
			}
			for (i=0; i<nodeXs.length; i+=2) {
				for (j=nodeXs[i]; j<nodeXs[i+1]; j+=5) {
					xGridIdx = Math.floor((j - offset) / colWidth);
					grid[xGridIdx][yGridIdx] = true;
				}
			}
		}
	},
	expand: function() {
		var grid = this.grid;
		var expanded = this.makeGrid(grid.length, grid[0].length);
		for (var y=0; y<grid.length; y++) {
			for (var x=0; x<grid[0].length; x++) {
				if (grid[y][x] || grid[y][x+1] || (grid[y-1] ? grid[y-1][x] : false) || (grid[y+1] ? grid[y+1][x] : false)) {
					expanded[y][x] = true;
				}				
			}
		}
		this.grid = expanded;
	},
	contract: function() {
		var grid = this.grid;
		var contracted = this.makeGrid(grid.length, grid[0].length);
		for (var y=0; y<grid.length; y++) {
			for (var x=0; x<grid[0].length; x++) {
				if (grid[y][x] && grid[y][x+1] && (grid[y-1] ? grid[y-1][x] : true) && (grid[y+1] ? grid[y+1][x] : true)) {
					contracted[y][x] = true;
				}
			}
		}
		this.grid = contracted;
	},
}

DotMigrator.MigratingDot = function(dot, allowedWallHandles, disallowedWallHandles) {
	this.dot = dot;
	this.allowedWallHandles = allowedWallHandles;
	this.disallowedWallHandles = disallowedWallHandles
}
