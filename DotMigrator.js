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

function DotMigrator(){
	this.numRows = 100;
	this.numCols = 100;
	this.queue = [];
}

DotMigrator.prototype = {
	enqueueDots: function(dots, allowedWallHandles, disallowedWallHandles) {
		var queueLen = this.queue.length;
		for (var i=0; i<dots.length; i++) {
			var dotIdx = this.getDotIdx(this.queue, dots[i], queueLen);
			if (dotIdx > -1) {
				this.mergeDotWalls(this.queue[i], allowedWallHandles, disallowedWallHandles);
			} else {
				this.queue.push(new DotMigrator.MigratingDot(dots[i], allowedWallHandles, disallowedWallHandles));
			}
		}
	},
	mergeDotWalls: function(migratingDot, allowedWallHandles, disallowedWallHandles) {
		for (var i=disallowedWallHandles.length - 1; i>=0; i--) {
			//disallowed takes priority
			var allowedIdx = allowedWallHandles.indexOf(disallowedWallHandles[i]);
			if (allowedIdx > -1) {
				allowedWallHandles.splice(allowedIdx, 1);
			}
		}
		this.mergeWallPermissions(migratingDot.allowedWallHandles, allowedWallHandles, disallowedWallHandles);
		this.mergeWallPermissions(migratingDot.disallowedWallHandles, disallowedWallHandles, allowedWallHandles);
	},
	mergeWallPermissions: function(existing, toAdd, opposite) {
		//new overwrites opposite
		for (var i=0; i<toAdd.length; i++) {
			if (existing.indexOf(toAdd[i]) == -1) {
				existing.push(toAdd[i]);
				var oppositeIdx = opposite.indexOf(toAdd[i]);
				if (oppositeIdx > -1) {
					opposite.splice(oppositeIdx, 1);
				}
			}
		}
	},
	getDotIdx: function(queue, dot, checkToIdx) {
		checkToIdx = checkToIdx === undefined ? queue.length : checkToIdx;
		for (var i=0; i<checkToIdx; i++) {
			if (queue[i].dot == dot) return i;
		}
		return -1;
	},
	flushQueue: function() {
		var width = document.getElementById('myCanvas').width;
		var height = document.getElementById('myCanvas').height;
		var colWidth = width / this.numCols;
		var rowHeight = height / this.numRows;
		var offset = .12345; //because who even wants to deal with grid points being on wall points?
		var allowedMap = this.makeModifiedMap(window.walls, 'contract', offset, colWidth, rowHeight);
		var disallowedMap = this.makeModifiedMap(window.walls, 'expand', offset, colWidth, rowHeight);
		var allowedCoords = this.mapToCoordList(window.walls, allowedMap);
		var queue = this.queue;
		
		var numCols = this.numCols;
		var numRows = this.numRows;
		for (var i=0; i<queue.length; i++) {
			var migratingDot = queue[i];
			var curColIdx = Math.floor((migratingDot.dot.x + offset) / colWidth);
			var curRowIdx = Math.floor((migratingDot.dot.y + offset) / rowHeight);
			var curSquareAllowed = allowedMap[curColIdx][curRowIdx];
			var curSquareDisallowed = disallowedMap[curColIdx][curRowIdx];
			var inValidSquare = this.dotInValidSquare(migratingDot, curSquareAllowed, curSquareDisallowed);

			if (!inValidSquare) {
				this.migrateDot(migratingDot, allowedMap, disallowedMap, allowedCoords, offset, numCols, numRows, colWidth, rowHeight);
			}

		}
		this.queue = [];
	},
	mapToCoordList: function(walls, map) {
		var coords = {};
		for (var i=0; i<walls.length; i++) coords[walls[i].handle] = [];
		//making hashmap of wall handles to lists of points where it exists on the map
		for (var x=0; x<map.length; x++) {
			for (var y=0; y<map[0].length; y++) {
				var square = map[x][y];
				for (var i=0; i<square.length; i++) {
					coords[square[i]].push(P(x, y));
				}
			}
		}
		return coords;
	},
	dotInValidSquare: function(migratingDot, allowedWallHandles, disallowedWallHandles) {
		var inValidSquare = true;
		for (var i=0; i<migratingDot.disallowedWallHandles.length; i++) {
			if (disallowedWallHandles.indexOf(migratingDot.disallowedWallHandles[i]) > -1) {
				inValidSquare = false;
				break;
			}
		}
		return inValidSquare;
		//this bit would make dots not in squares not explicitly allowed be moved.  I don't *think* I want this because it could mess with placing dots near wall edges
		// if (inValidSquare) {
			// for (var i=0; i<migratingDot.allowedWallHandles.length; i++) {
				// if (curSquareAllowed.indexOf(migratingDot.dallowedWallHandles[i]) < 0) {
					// inValidSquare = false;
					// break;
				// }
			// }				
		// }		
	},
	migrateDot: function(migratingDot, allowedMap, disallowedMap, allowedCoords, offset, numCols, numRows, colWidth, rowHeight) {
		var allowedHandles = migratingDot.allowedWallHandles;
		var i = Math.floor(Math.random() * allowedHandles.length);
		var numWallsTried = 0;
		placingLoop:
			while (numWallsTried<allowedHandles.length) {
				var handleCoords = allowedCoords[allowedHandles[i]];
				var j = Math.floor(Math.random() * handleCoords.length);
				var numCoordsTried = 0;
				while (numCoordsTried < handleCoords.length) {
					var coord = handleCoords[j];
					var disallowedSquare = disallowedMap[coord.x][coord.y];
					for (var k=0; k<migratingDot.disallowedWallHandles.length; k++) {
						if (disallowedSquare.indexOf(migratingDot.disallowedWallHandles[k]) == -1) {
							migratingDot.dot.x = offset + (coord.x + Math.random()) * colWidth;
							migratingDot.dot.y = offset + (coord.y + Math.random()) * rowHeight;
							break placingLoop;
						}
						
					}
					j++; numCoordsTried++;
					if (j == handleCoords.length) j = 0;
				}
				i++; numWallsTried++;
				if (i == allowedHandles.length) i = 0;
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
	makeModifiedMap: function(walls, modifier, offset, colWidth, rowHeight) {//modifier being expand or contract
		var listMap = this.makeGrid(this.numCols, this.numRows);
		var wallBoolMaps = [];
		for (var i=0; i<walls.length; i++) {
			var wallMap = new DotMigrator.WallMap(walls[i], this.numCols, this.numRows, offset, colWidth, rowHeight);
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
	// gridToPtList: function(grid, colWidth, rowHeight, offset) {
		// var validPts = [];
		// for (var i=0; i<grid.length; i++) {
			// for (var j=0, jj=grid[0].length; j<jj; j++) {
				// if (grid[i][j]) validPts.push(P(offset + j * colWidth, offset + i * rowHeight));
			// }
		// }
		// return validPts;
	// },
	// mapWallsOnToGrid: function(walls, grid) {
		// for (var i=0; i<walls.length; i++) {
			// this.mapWallOnToGrid(walls[i], grid);
		// }
	// },
	// subtractGrid: function(a, b) {
		// for (var i=0; i<a.length; i++) {
			// for (var j=0; j<a[0].length; j++) {
				// a[i][j] = Math.min(a[i][j], !b[i][j]);
			// }
		// }
	// },
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
