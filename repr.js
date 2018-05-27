//taken from gist.github.com/soapie/6407618
var ELIDED = '<..>';

function repr(thing, depth, max) {
    if (depth === undefined) { depth = 0; }
    if (max === undefined) { max = 2; }

    if (isPrim(thing)) {
        return showPrim(thing);
    }

    var type = typeof (thing), result;

    if (type === 'function') {
        result = 'function';
    } else if (thing instanceof Point) {
        result = thing.repr();
    } else if (thing instanceof Vector) {
        result = thing.repr();
    } else if (Array.isArray(thing)) {
        result = showArray(thing, depth, max);
    } else if (thing.constructor === Object) {
        result = showObject(thing, depth, max);
    } else if (thing.constructor === String) {
        // show string objects the same way as string prims, not sure
        // if this is the morally correct course of action...
        result = showPrim(thing.toString());
    } else {
        result = thing.toString();
    }
    return result;
}

function isPrim(thing) {
    return thing === null || /^[snbu]/.test(typeof thing);
}

function showPrim(prim) {
    var type = typeof (prim), result;

    if (type === 'string') {
        result = JSON.stringify(prim);
    } else if (type === 'number' || type === 'boolean') {
        result = prim.toString();
    } else if (prim === null) {
        result = 'null';
    } else if (type === 'undefined') {
        result = 'undefined';
    }
    return result;
}

function showArray(arr, depth, max) {
    if (depth === undefined) { depth = 0; }
    if (max === undefined) { max = 2; }

    if (depth >= max) {
        return ELIDED;
    }

    var result = '[', i;

    // for loop instead of forEach to correctly handle sparse arrays
    for (i = 0; i < arr.length; i += 1) {
        if (i !== 0) {
            result += ', ';
        }
        // can't simply check if arr[i] is undef because there's a
        // distinction between arr[i] being set to undef and it never
        // being set at all
        if (arr.hasOwnProperty(i.toString())) {
            result += repr(arr[i], depth + 1, max);
        } else {
            result += '';
        }
    }
    result += ']';
    return result;
}

function showObject(o, depth, max) {
    if (depth === undefined) { depth = 0; }
    if (max === undefined) { max = 2; }

    if (depth >= max) {
        return ELIDED;
    }

    var result = '{';
    Object.keys(o).forEach(function (key, ix) {
        if (ix !== 0) {
            result += ', ';
        }
        result += key + ': ' + repr(o[key], depth + 1, max);
    });
    result += '}';
    return result;
}
