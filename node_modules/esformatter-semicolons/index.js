var HOOKS = [
  'ExpressionStatement', 'VariableDeclaration', 'ReturnStatement',
  'ContinueStatement', 'BreakStatement', 'ImportDeclaration'
];
var MODULE_EXPORT_HOOKS = [
  'ExportAllDeclaration', 'ExportDefaultDeclaration', 'ExportNamedDeclaration'
];

exports.nodeBefore = function(node) {
  if (shouldAppendSemicolon(node)) {
    var end = true;
    var token = node.endToken;

    while (isEmpty(token) || isComment(token)) {
      if (end) {
        end = false;
      }
      token = token.prev;
    }

    if (isSemicolon(token)) {
      // FIXME: This is used to remove white spaces and line breaks before the ";"
      // See: https://github.com/millermedeiros/esformatter/issues/334
      var last = token.prev;

      while (isEmpty(last)) {
        last = last.prev;
      }

      token.prev = last;
      last.next = token;
    } else if (!isSemicolon(token) && !isLoop(node.parent)) {
      var semicolon = {
        type: 'Punctuator',
        value: ';',
        prev: token,
        next: token.next,
        root: token.root
      };

      if (token.next) {
        token.next.prev = semicolon;
      } else if (token.root) {
        token.root.endToken = semicolon;
      }

      token.next = semicolon;

      if (end) {
        node.endToken = semicolon;
      }
    }
  } else if ('EmptyStatement' === node.type) {
    // FIXME: Basically, setting value to an empty string
    // and changing type to "EmptyStatement" for "WhiteSpace",
    // "Indent", and "LineBreak" is a workaround to prevent a bug.
    // See https://github.com/bulyshko/esformatter-semicolons/issues/2
    var token = node.startToken;
    var prev = token.prev;

    while (isEmpty(prev)) {
      prev.type = 'EmptyStatement';
      prev.value = '';
      prev = prev.prev;
    }

    token.value = '';
  }
};

function shouldAppendSemicolon(node) {
  if (~HOOKS.indexOf(node.type)) {
    if (node.parent && node.parent.type === 'LabeledStatement') {
      return false;
    }
    return true;
  }

  if (~MODULE_EXPORT_HOOKS.indexOf(node.type)) {
    if (!node.declaration) {
      return true;
    }

    if (~HOOKS.concat(
        ['Literal', 'ArrowFunctionExpression']
      ).indexOf(node.declaration.type)
    ) {
      return true;
    }
  }

  return false;
}

function isEmpty(token) {
  return token && ~['WhiteSpace', 'Indent', 'LineBreak'].indexOf(token.type);
}

function isComment(token) {
  return token && ~['LineComment', 'BlockComment'].indexOf(token.type);
}

function isSemicolon(token) {
  return token && token.type === 'Punctuator' && token.value === ';';
}

function isLoop(node) {
  return node && ~['ForStatement', 'ForInStatement', 'ForOfStatement'].indexOf(node.type);
}
