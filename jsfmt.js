'use strict';
var stdin = require('get-stdin');
var jsfmt = require('jsfmt');
var extend = require('extend');

stdin(function(data) {
    // deep extend
    var scope = process.argv[3];
    var conf = jsfmt.getConfig();
    var optsJSON = extend(true, conf, JSON.parse(process.argv[4]));
    var opts = conf;
    var js;

    // if we don't have a jsfmtrc file
    // use the settings from .sublime-settings
    if( ! conf.config) {
        opts = extend(true, conf, JSON.parse(process.argv[2]));
    }

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
