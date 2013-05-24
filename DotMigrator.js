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
	this.numRows = 20;
	this.numCols = 20;
	this.width = $('#myCanvas').width();
	this.height = $('#myCanvas').height();
	this.colWidth = this.width / (this.numCols - 1);
	this.rowHeight = this.height / (this.numRows - 1);
	this.offset = .12345; //because who even wants to deal with grid points being on wall points?
}

DotMigrator.prototype = {
	migrateDots: function(dots, allowedWallHandles, disallowedWallHandles) {
		var allowedWalls = window.walls.getWallsByHandles(allowedWallHandles);
		var disallowedWalls = window.walls.getWallsByHandles(disallowedWallHandles);
		var allowedGrid = this.makeWallGrid(this.numRows, this.numCols);
		var disallowedGrid = this.makeWallGrid(this.numRows, this.numCols);
		this.mapWallsOnToGrid(allowedWalls, allowedGrid);
		this.mapWallsOnToGrid(disallowedWalls, disallowedGrid);
		disallowedGrid = this.expandGrid(disallowedGrid); //just being careful;
		allowedGrid = this.contractGrid(allowedGrid);
		var allowedList = this.gridToPtList(allowedGrid, this.colWidth, this.rowHeight, this.offset);
		this.subtractGrid(allowedGrid, disallowedGrid);
		this.placeDots(dots, allowedGrid, allowedList);
		
	},
	placeDots: function(dots, grid) {
		for (var i=0; i<dots.length; i++) {
			var row = Math.floor((dots[i].y - this.offset) / this.rowHeight);
			var col = Math.floor((dots[i].y - this.offset) / this.colWidth);
			
		}
	},
	gridToPtList: function(grid, colWidth, rowHeight, offset) {
		
	},
	mapWallsOnToGrid: function(walls, grid) {
		for (var i=0; i<walls.length; i++) {
			this.mapWallOnToGrid(walls[i], grid);
		}
	},
	subtractGrid: function(a, b) {
		for (var i=0; i<a.length; i++) {
			for (var j=0; j<a[0].length; j++) {
				a[i][j] = Math.min(a[i][j], !b[i][j]);
			}
		}
	},
	mapWallOnToGrid: function(wall, grid) {
		var nodes = [];
		var i, j;
		for (var yGridIdx=0; yGridIdx<grid.length; yGridIdx++) {
			var yVal = this.offset + this.rowHeight * (yGridIdx + .5);
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
					xGridIdx = Math.floor((j - this.offset) / this.colWidth);
					grid[yGridIdx][xGridIdx] = true;
				}
			}
		}
	},
	expandGrid: function(grid) {
		var expanded = this.makeWallGrid(grid.length, grid[0].length);
		for (var y=0; y<grid.length; y++) {
			for (var x=0; x<grid[0].length; x++) {
				if (grid[y][x] || grid[y][x+1] || grid[x-1] || (grid[y-1] ? grid[y-1][x] : false) || (grid[y+1] ? grid[y+1][x] : false)) {
					expanded[y][x] = true;
				}				
			}
		}
		return expanded;
	},
	contractGrid: function(grid) {
		var contracted = this.makeWallGrid(grid.length, grid[0].length);
		for (var y=0; y<grid.length; y++) {
			for (var x=0; x<grid[0].length; x++) {
				if (grid[y][x] && grid[y][x+1] && grid[x-1] && (grid[y-1] ? grid[y-1][x] : true) && (grid[y+1] ? grid[y+1][x] : true)) {
					contracted[y][x] = true;
				}
			}
		}
		return contracted;
	},
	makeWallGrid: function(numRows, numCols) {
		var grid = new Array(numCols)
		for (var colIdx=0; colIdx<numCols; colIdx++) {
			var col = new Array(numRows)
			for (var rowIdx=0; rowIdx<numRows;rowIdx++) {
				col[rowIdx] = false;
			}
			grid[colIdx] = col;
		}
		return grid;		
	},
}
