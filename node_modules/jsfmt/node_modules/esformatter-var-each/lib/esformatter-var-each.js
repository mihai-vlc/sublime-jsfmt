// Load in dependencies
var rocambole = require('rocambole');

// Handle setting of options
var options;
exports.setOptions = function (_options) {
  options = _options;
};

// Define our transform function
exports._transformNode = function (node) {
  // If the token is a variable declaration (e.g. `var`, `let`)
  // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
  // interface VariableDeclaration <: Declaration {
  //     type: "VariableDeclaration";
  //     declarations: [ VariableDeclarator ];
  //     kind: "var" | "let" | "const";
  // }
  if (node.type === 'VariableDeclaration') {
    // If we are inside of a loop, do nothing
    // DEV: Technically, a while/dowhile can't have a `var` but this is for good measure
    var parentType = node.parent ? node.parent.type : '';
    if (parentType.match(/WhileStatement|DoWhileStatement|ForStatement|ForInStatement/)) {
      return node;
    }

    // Determine the terminating character
    var varDeclaration = node;
    var declarators = varDeclaration.declarations;
    var lineEndingToken = varDeclaration.endToken;

    // If the terminating token is the same as the last declarator's, override it as a line break
    // DEV: This fixes `advanced-semicolon-less.js` which has no trailing line, making the last token be 'world'
    if (lineEndingToken === declarators[declarators.length - 1].endToken) {
      lineEndingToken = {
        type: 'LineBreak',
        value: options.lineBreak.value
      };
    }

    // Generate a `var` for each of the declarators
    var declarations = declarators.map(function generateDeclaration (declarator, index) {
      // Generate a new delcaration similar to the original
      // Example: `var`` ` ... `;` (i.e. `var` <-> ` ` <-> ... <-> `;`)
      var declaration = {
        type: varDeclaration.type, // should always be `VariableDeclaration`
        declarations: [declarator],
          // link to declaration's tokens
        kind: varDeclaration.kind, // (e.g. `var`, `let`)
        // prev: connect to `declarations[i - 1]` or if first, original var's `prev`
        // next: connect to `declarations[i + 1]` or if last, original var's `next`
        startToken: {
          type: varDeclaration.startToken.type, // should always be `Keyword`
          value: varDeclaration.startToken.value, // (e.g. `var`, `let`)
          // prev: connect to `declarations[i - 1].endToken` or if first, original var's `startToken.prev`
          next: {
            type: varDeclaration.startToken.next.type, // should be `WhiteSpace`
            value: varDeclaration.startToken.next.value, // (e.g. ` `)
            // prev: set later to `declaration.startToken`
            next: declarator.startToken
              // update `next.prev` later
          }
        },
        endToken: {
          type: lineEndingToken.type, // (e.g. `Punctuation`, `LineBreak`)
          value: lineEndingToken.value, // (e.g. `;`, '\n')
          prev: declarator.endToken
            // update `prev.next` later
          // next: connect to `declarator[i + 1].startToken` or if last, original var's `endToken.next`
        }
      };
      declaration.startToken.next.prev = declaration.startToken;

      // Handle link backs
      if (declaration.startToken.next.next) {
        declaration.startToken.next.next.prev = declaration.startToken.next;
      }
      if (declarator.endToken.prev) {
        declarator.endToken.prev.next = declarator.endToken;
      }

      // Return the declaration
      return declaration;
    });

    // Connect all of our declarations
    // Example: `Leading code` <-> `var ... ;` <-> `var ... ;` <-> `Trailing code`
    var varDeclarationStartToken = varDeclaration.startToken;
    var varDeclarationEndToken = varDeclaration.endToken;
    var lenMinusOne = declarations.length - 1;
    declarations.forEach(function connectDeclaration (declaration, index) {
      // If we are the first item, connect to `varDeclaration's` predecessor
      if (index === 0) {
        declaration.prev = varDeclaration.prev;
        declaration.startToken.prev = varDeclarationStartToken.prev;
      // Otherwise, connect to the previous declaration
      } else {
        declaration.prev = declarations[index - 1];
        declaration.startToken.prev = declarations[index - 1].endToken;
      }

      // Handle link backs
      if (declaration.prev) {
        declaration.prev.next = declaration;
      }
      if (declaration.startToken.prev) {
        declaration.startToken.prev.next = declaration.startToken;
      }

      // If we are the last item, connect to `varDeclaration's` successor
      if (index === lenMinusOne) {
        declaration.next = varDeclaration.next;
        declaration.endToken.next = varDeclarationEndToken.next;
      // Otherwise, connect to the next declaration
      } else {
        // DEV: Since the terminator could be `;` or `\n`, we handle whitespace later
        declaration.next = declarations[index + 1];
        declaration.endToken.next = declarations[index + 1].startToken;
      }

      // Handle link backs
      if (declaration.next) {
        declaration.next.prev = declaration;
      }
      if (declaration.endToken.next) {
        declaration.endToken.next.prev = declaration.endToken;
      }
    });

    // Connect all of our declarator's tokens
    declarators.forEach(function connectDeclarator (declarator, index) {
      // DEV: This is the whitespace character
      declarator.startToken.prev = declarations[index].startToken.next;
      declarator.endToken.next = declarations[index].endToken;
    });

    // For each of the declarations, add a line break and indent our `var`
    declarations.forEach(function indentDeclaration (declaration, index) {
      // If we are the first element, do nothing (line break should already exist)
      if (index === 0) {
        return;
      }

      // Determine if there was a line break between the vars
      var varStartToken = declaration.startToken;
      var token = declarations[index - 1].endToken;
      var lineBreakToken = null;
      var indentToken = null;
      while (token && token !== varStartToken) {
        // If the token is an indent, save it
        if (token.type === 'Indent') {
          indentToken = token;
        }

        // If the token is a line break, save the result and stop
        if (token.type === 'LineBreak') {
          lineBreakToken = token;
          break;
        }

        // Continue to the previous token
        token = token.next;
      }

      // If there was not a line break before, add one with indentation
      if (!lineBreakToken) {
        // For good measure, reset the indentation token
        // TODO: Is there ever a time when we have indentation but no line break?
        indentToken = null;

        // Create our start token
        declaration.startToken = lineBreakToken = {
          type: 'LineBreak',
          value: options.lineBreak.value,
          prev: varStartToken.prev,
          next: varStartToken
        };

        // Handle link backs
        if (declaration.startToken.prev) {
          declaration.startToken.prev.next = declaration.startToken;
        }
      }

      // If the original `var` has indentation, add indentation
      if (varDeclaration.startToken.prev && varDeclaration.startToken.prev.type === 'Indent') {
        // If there is no indentation token, add one
        if (!indentToken) {
          // Add indentation after the line break and before the `var`
          lineBreakToken.next = {
            type: varDeclaration.startToken.prev.type, // should be `Indent`
            value: varDeclaration.startToken.prev.value, // (e.g. '  ', '    ')
            depth: varDeclaration.startToken.prev.depth, // (e.g. 1, 2)
            prev: lineBreakToken,
            next: varStartToken
              // prev: lineBreakToken.next
          };
          varStartToken.prev = lineBreakToken.next;
        // Otherwise, update the value and depth
        // TODO: Figure out when this occurs and test it
        } else {
          indentToken.value = indentToken.value.replace(options.indent.value, '');
          indentToken.depth -= 1;
        }
      }
    });

    // Overwrite `node` with our first declaration
    node = declarations[0];
  }

  // Return the updated node
  return node;
};

// Export our transformation
// https://github.com/millermedeiros/esformatter/tree/v0.4.3#transformbeforeast
exports.transform = function (ast) {
  rocambole.moonwalk(ast, exports._transformNode);
};
