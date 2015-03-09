var falafel = require('fresh-falafel');

function hasXJSElementAsParent( node ) {
  while ( node.parent ) {
    if ( node.parent.type === 'XJSElement' ) {
      return true;
    }
    node = node.parent;
  }
  return false;
}

module.exports = {
  _sections: [],
  stringBefore: function (code) {
    var me = this;
    // array of found jsx sections
    var sections = me._sections = [];

    // inject esprima to fresh-falafel
    falafel.setParser(require('esprima-fb').parse);

    // parse the code
    code = falafel(code, function (node) {
      // if a JSX node
      if (node.type === 'XJSElement' && ! hasXJSElementAsParent( node ) ) {
        // save the source
        sections.push(node.source());
        // replace it with a token like `void(0)/*$$$_XJS_ELEMENT_$$$*/`
        // the index is passed to void that way we can restore them later
        // we just want to temporary ignore those nodes because esformatter
        // does not play well yet with jsx syntax.
        // Actually rocambole already uses esprima-fb, but there is a bug in esprima-fb
        // that will make very risky to use it in esformatter at this time. basically regex
        // when formatter will produce duplicated results.
        // Really sad, really lame. check:
        //
        // https://github.com/millermedeiros/esformatter/issues/242
        // https://github.com/facebook/esprima/issues/74
        //
        node.update('void(' + (sections.length - 1) + '/*$$$_XJS_ELEMENT_$$$*/)');
      }
    });

    return code.toString();
  },
  stringAfter: function (code) {
    var me = this;
    var sections = me._sections || [];
    // no jsx content found in the file
    if (sections.length === 0) {
      // just return the code as is
      return code;
    }
    // otherwise
    return falafel(code, function (node) {
      // check for the node we added, it should be an UnaryExpression, void and have the
      // custom comment we have included
      if (node.type === 'UnaryExpression' &&
        node.operator === 'void' &&
        node.source().match(/void\s*\(\s*(\d+)\s*\/\*\$\$\$_XJS_ELEMENT_\$\$\$\*\/\s*\)/g)
        ) {
        // if it is a comment, get the argument passed
        var nodeIdx = parseInt(node.argument.source(), 10);
        // get the value from that node from the tokens we have stored before
        node.update(sections[nodeIdx]);
      }
    }).toString();
  }
};
