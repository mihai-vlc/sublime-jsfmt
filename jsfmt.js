'use strict';
var stdin = require('get-stdin');
var jsfmt = require('jsfmt');

stdin(function(data) {
    // deep extend
    var scope = process.argv[3];
    var conf = jsfmt.getConfig();
    var opts = extend(true, conf, JSON.parse(process.argv[2]));
    var optsJSON = extend(true, conf, JSON.parse(process.argv[4]));
    var js;
    try {

        if (scope && scope == 'json') {
            js = jsfmt.formatJSON(data, optsJSON);
        } else {
            js = jsfmt.format(data, opts);
        }
        process.stdout.write(js);
    } catch ( err ) {
        throw err;
    }
});

// http://stackoverflow.com/a/9399907/1579481
function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regexp',
            '[object Object]': 'object'
        },
        jQuery = {
            isFunction: function(obj) {
                return jQuery.type(obj) === 'function';
            },
            isArray: Array.isArray || function(obj) {
                return jQuery.type(obj) === 'array';
            },
            isWindow: function(obj) {
                return obj != null && obj == obj.window;
            },
            isNumeric: function(obj) {
                return !isNaN(parseFloat(obj)) && isFinite(obj);
            },
            type: function(obj) {
                return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
            },
            isPlainObject: function(obj) {
                if (!obj || jQuery.type(obj) !== 'object' || obj.nodeType) {
                    return false;
                }
                try {
                    if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                        return false;
                    }
                } catch ( e ) {
                    return false;
                }
                var key;
                for (key in obj) {}
                return key === undefined || hasOwn.call(obj, key);
            }
        };
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (typeof target !== 'object' && !jQuery.isFunction(target)) {
        target = {};
    }
    if (length === i) {
        target = this;
        --i;
    }
    for (i; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue;
                }
                if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];
                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }
                    // WARNING: RECURSION
                    target[name] = extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}
