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

DataGetFuncs = {
	tempSmooth: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('temp');
		var numVals = Math.min(15, src.length);
		var init = src.length - numVals;
		var sum = 0;
		for (var i=0; i<numVals; i++) {
			sum += src[init + i];
		}
		return sum / numVals;
	},
	collisions: function() {
		var src = collide.hitsPerTurn;
		var numVals = Math.min(15, src.length);
		var init = src.length - numVals;
		var sum = 0;
		for (var i=0; i<numVals; i++) {
			sum += src[init + i];
		}
		return sum * 1000 / numVals / updateInterval;
	},
	temp: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('temp');
		return src[src.length - 1];
	},
	pInt: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('pInt');
		return src[src.length - 1];
	},
	pExt: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('pExt');
		return src[src.length - 1];
	},
	vol: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('vol');
		return src[src.length - 1];
	},
	q: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('q');
		return src[src.length - 1];
	},
	mass: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('mass');
		return src[src.length - 1];
	},
	moles: function(wallHandle, args) {
		var src = walls[wallHandle].getDataSrc('moles', args);
		return src[src.length - 1];
	},
	frac: function(wallHandle, args) {
		var src = walls[wallHandle].getDataSrc('frac', args);
		return src[src.length - 1];
	},
	time: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('time');
		return src[src.length - 1];
	},
	work: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('work');
		return src[src.length - 1];
	},
	enthalpy: function(wallHandle) {
		var src = walls[wallHandle].getDataSrc('enthalpy');
		return src[src.length - 1];
	},
	vDist: function(wallHandle, args) {
		var src = walls[wallHandle].getDataSrc('vDist', args);
		return src[src.length - 1];
	},
	get: function(idStr, type, defaultVal, min, max) {
		var gotten = getStore(idStr);
		var val;
		var isNum = type == 'int' || type == 'float';
		if (gotten) {
			if (type == 'int') {
				val = Math.round(parseFloat(gotten));
			} else if (type == 'float') {
				val = parseFloat(gotten);
			} else if (type == 'string') {
				val = gotten.sanitize();
			} else if (Number(gotten) == gotten) {
				val = Number(gotten);
			} else {
				val = gotten;
			}
			
			if (isNum) {
				max = max === undefined || isNaN(max) ? val : max;
				min = min === undefined || isNaN(min) ? val : min;
				val = bound(val, min, max)
			}
		}
		if (val === undefined || (isNum && isNaN(val))) {
			val = defaultVal;
		}
		return val;
	},

	img: function(path, breakStyle, center, asObj) {
		if (asObj) {
			//HEY - as obj currently only return image, no p, br, or centering.  
			//It is they way because of AuxPicture.  Look into that before making changes here
			return {attrs: {src: [window.IMGPATHPREFIX + path]}};
	
		} else {
			var imgHTML = templater.img({attrs: {src: [window.IMGPATHPREFIX + path]}});
			
			if (center) {
				imgHTML = templater.center({innerHTML: imgHTML});
			}
			if (breakStyle == 'br') {
				imgHTML = templater.br() + imgHTML + templater.br();
			} else if (breakStyle == 'p') {
				imgHTML = templater.p({innerHTML: imgHTML});
			}
			return imgHTML;	
		}	
	}
}