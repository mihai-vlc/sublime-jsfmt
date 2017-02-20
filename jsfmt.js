'use strict';

var stdin = require('get-stdin');
var extend = require('extend');
var path = require('path');
var fs = require('fs');

stdin(function(data) {
    var scope = process.argv[3];
    var jsfmt = getJsfmt(process.argv[5]);
    var conf = jsfmt.getConfig();
    var optsJSON = extend({}, conf, JSON.parse(process.argv[4]));
    var opts = conf;
    var js;

    // if we don't have a jsfmtrc file
    // use the settings from .sublime-settings
    if (! opts.config) {
        opts = extend({}, opts, JSON.parse(process.argv[2]));
    }

    try {

        if (scope && scope == 'json') {
            js = jsfmt.formatJSON(data, optsJSON);
        } else {
            js = jsfmt.format(data, opts);
        }

        process.stdout.write(js);

    } catch (err) {
        throw err;
    }
});

function getJsfmt(localJsfmt) {
    var jsfmt;
    var loader = path.join(localJsfmt, '__sublime-load-jsfmt.js');
    if (localJsfmt) {
        try {
            fs.writeFileSync(loader, "module.exports = require('jsfmt');");
            jsfmt = require(loader);
            fs.unlinkSync(loader);
            return jsfmt;
        } catch ( e ) {
            throw e;
            fs.unlinkSync(loader);
        }
    }
    return require('jsfmt');
}
