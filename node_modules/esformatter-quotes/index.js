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
  disabled = false;
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

    // If the first character is a quote, escape it (e.g. "'hello" -> '\'hello')
    //   or if a character is an unescaped quote, escape it (e.g. "hello'" -> 'hello\'')
    // If we are an unescaped set of quotes, escape them (e.g. "hello'" -> 'hello\'', "hello''" -> 'hello\'\'')
    // DEV: JavaScript starts the next match at the end of the current one, causing us to need a function or loop.
    var quoteEscape = new RegExp('(^|[^\\\\])(' + quote + '+)', 'g');
    content = content.replace(quoteEscape, function replaceQuotes (input, group1, group2, match) {
      return group1 + new Array(group2.length + 1).join('\\' + quote);
    });

    token.value = quote + content + quote;
  }
};

