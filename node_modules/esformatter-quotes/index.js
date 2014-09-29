//jshint node:true, eqnull:true
'use strict';

var DOUBLE_QUOTE = '"';
var SINGLE_QUOTE = '\'';

var avoidEscape;
var disabled;
var quoteValue;
var alternateQuote;


exports.setOptions = function(opts) {
  opts = opts && opts.quotes;
  if (!opts || (opts.type == null && opts.avoidEscape == null)) {
    disabled = true;
    return;
  }
  if (opts.type != null) {
    quoteValue = opts.type === 'single' ? SINGLE_QUOTE : DOUBLE_QUOTE;
    alternateQuote = opts.type !== 'single' ? SINGLE_QUOTE : DOUBLE_QUOTE;
  }
  avoidEscape = opts.avoidEscape;
};


exports.tokenBefore = function(token) {
  if (disabled) return;

  if (token.type === 'String') {
    var content = token.value.substr(1, token.value.length - 2);
    var quote = quoteValue;
    var alternate = alternateQuote;

    var shouldAvoidEscape = avoidEscape &&
      content.indexOf(quote) >= 0 &&
      content.indexOf(alternate) < 0;

    if (shouldAvoidEscape) {
      alternate = quoteValue;
      quote = alternateQuote;
    }

    // we always normalize the behavior to remove unnecessary escapes
    var alternateEscape = new RegExp('\\\\' + alternate, 'g');
    content = content.replace(alternateEscape, alternate);

    var quoteEscape = new RegExp('([^\\\\])' + quote, 'g');
    content = content.replace(quoteEscape, '$1\\' + quote);

    token.value = quote + content + quote;
  }
};

