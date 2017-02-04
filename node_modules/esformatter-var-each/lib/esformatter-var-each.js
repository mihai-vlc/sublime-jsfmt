// Load in dependencies
var rocambole = require('rocambole');
var rocamboleToken = require('rocambole-token');

// Define a helper for creating a generic token
exports.createToken = exports.cloneToken = function (options) {
  return {
    type: options.type, // e.g. Keyword, Whitespace
    value: options.value, // e.g. 'var', ' '
    root: options.root || null, // e.g. Program node
    next: null,
    prev: null
  };
};

// Define helper for cloning a token chain
// DEV: The first and last nodes will lack a previous and next node respectively
exports.cloneTokenChain = function (tokens, options) {
  // For each of the tokens
  var newTokens = [];
  tokens.forEach(function copyToken (token, index) {
    // Clone our token
    var newToken = exports.cloneToken(token);

    // If there is a previous token, attach to it
    if (index > 0) {
      var lastToken = newTokens[index - 1];
      lastToken.next = newToken;
      newToken.prev = lastToken;
    }

    // Save our tokens
    newTokens.push(newToken);
  });

  // Return our new tokens
  return newTokens;
};

// Handle setting of options
var options;
exports.setOptions = function (_options) {
  options = _options;
};

// Define our transform function
exports._transformNode = function (node) {
  // If the token is not a variable declaration (e.g. `var`, `let`), exit early
  // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
  // interface VariableDeclaration <: Declaration {
  //     type: "VariableDeclaration";
  //     declarations: [ VariableDeclarator ];
  //     kind: "var" | "let" | "const";
  // }
  // interface VariableDeclarator <: Node {
  //   type: "VariableDeclarator";
  //   id: Pattern;
  //   init: Expression | null;
  // }
  if (node.type !== 'VariableDeclaration') {
    return node;
  }

  // If we are inside of a loop, do nothing (e.g. `for`, `while`, `do ... while`)
  // DEV: Technically, a while/dowhile can't have a `var` but this is for good measure
  var parentType = node.parent ? node.parent.type : '';
  if (parentType.match(/WhileStatement|DoWhileStatement|ForStatement|ForInStatement/)) {
    return node;
  }

  // Determine the terminating character
  // Example: `var foo = bar;`
  //   varDeclaration = {type: VariableDeclaration, declarations: [...], kind: 'var'}
  //   declarators[*] = {type: VariableDeclarator, id: {type: Identifier, name: 'foo'}, init: {type: Literal, value: 'bar'}}
  var varDeclaration = node;
  var declarators = varDeclaration.declarations;

  // Find the head and tail of the var declaration for reuse among its declaration clones
  // e.g. `var hello = 'world', goodbye = 'moon';` -> ['var', ' '] = starting tokens; ['hello = world'] = declaration; ...; [';'] = endToken
  var startingTokens = [];
  rocamboleToken.eachInBetween(varDeclaration.startToken, declarators[0].startToken.prev, function saveToken (token) {
    startingTokens.push(token);
  });
  // Determine whether we use automatic semicolon insertion or not
  var endingSemicolonToken = rocamboleToken.findNext(varDeclaration.endToken.prev, function findStatementTerminator (token) {
    return rocamboleToken.isSemiColon(token) || rocamboleToken.isBr(token);
  });
  if (rocamboleToken.isBr(endingSemicolonToken)) {
    endingSemicolonToken = null;
  }

  // Additionally, find the whitespace tokens before our `var` started (e.g. all indents/whitespace)
  var preStartingTokens = [];
  var token = varDeclaration.startToken.prev;
  while (token) {
    // If the token is whitespace or an indent, save it
    // https://github.com/millermedeiros/rocambole-token/blob/fc03674b38f288dc545db0a5b2bdfd2d96cab170/is.js#L19-L25
    if (token.type === 'WhiteSpace' || token.type === 'Indent') {
      preStartingTokens.unshift(token);
      token = token.prev;
    // Otherwise, stop
    // DEV: We ignore line breaks because this could be the start of a program
    //   Also, line breaks can lead to weird edge cases so we keep it consistent/predictable with a single one
    } else {
      break;
    }
  }

  // Copy over the preStartingTokens as betweenDeclarationTokens and add in `;` (if applicable) and `\n`
  // DEV: We add from the left of the queue so `\n` then `;` to get `[';', '\n', ' ']`
  var betweenDeclarationTokens = preStartingTokens.slice();
  betweenDeclarationTokens.unshift(exports.createToken({
    type: 'LineBreak',
    value: options.lineBreak.value,
    root: varDeclaration.startToken.root
  }));
  if (endingSemicolonToken) {
    betweenDeclarationTokens.unshift(exports.cloneToken(endingSemicolonToken));
  }

  // Generate a `var` for each of the declarators
  // e.g. `var hello = 'world', goodbye = 'moon';` -> `var hello = 'world'; var goodbye = 'moon';`
  var declarations = declarators.map(function generateDeclaration (declarator, index) {
    // DEV: A brief refresher on nodes and tokens
    //   Nodes are the AST representation of parts of a program (e.g. Identifier, VariableDeclaration)
    //   Tokens are the actual chunks of code these represent (e.g. Keyword, WhiteSpace)
    //   Tokens can be present without there being a node related to them
    //   Nodes have a prev (previous node on the same level), next (next node on the same level),
    //     parent (node containing our node), and sometimes something like a `body` key where they declare child nodes
    //     `body` varies from node type to node type
    //   Tokens don't have levels but are one giant chain
    //   Tokens have next (next token to render), prev (previous token to render),
    //     root (root node of the entire token chain -- i.e. a Program node)
    //   Nodes also have startToken and endToken which are the tokens that a node will start/end on
    //     (e.g. `var` is the start token for a VariableDeclaration)
    //   The only attachment from tokens to nodes is via `range` but this is brittle in rocambole so avoid it

    // Generate a new declaration similar to the original
    // Example: `var hello = 'world', goodbye = 'moon';` should use `var` and have a trailing semicolon `;`
    // https://github.com/millermedeiros/rocambole/blob/a3d0d63d58b769d13bad288aca32c6e2f7766542/rocambole.js#L69-L74
    var declaration = {
      type: varDeclaration.type, // should always be `VariableDeclaration`
      declarations: [declarator],
      kind: varDeclaration.kind, // (e.g. `var`, `let`)
      toString: varDeclaration.toString
      // prev: bound later
      // next: bound later
      // startToken: bound later
      // endToken: bound later
    };
    return declaration;
  });

  // Set up linkages for nodes
  // DEV: None of these changes will affect the token chain
  //   However, each `node.toString()` is more/less impractical as there are no tokens bound to declarations
  declarations.forEach(function connectNodes (declaration, index) {
    // Attach declaration as the declarator's parent node
    var declarator = declaration.declarations[0];
    declarator.parent = declaration;

    // If this is the first node, connect to var declaration's previous node
    if (index === 0) {
      var varDeclarationPrevNode = varDeclaration.prev;
      if (varDeclarationPrevNode) {
        declaration.prev = varDeclarationPrevNode;
        varDeclarationPrevNode.next = declaration;
      }
    // Otherwise, connect to the last declaration
    } else {
      var lastDeclarationNode = declarations[index - 1];
      declaration.prev = lastDeclarationNode;
      lastDeclarationNode.next = declaration;
    }

    // If this is the last node, connect it to var declaration's next node
    if (index === declarations.length - 1) {
      var varDeclarationNextNode = varDeclaration.next;
      if (varDeclarationNextNode) {
        declaration.next = varDeclarationNextNode;
        varDeclarationNextNode.prev = declaration;
      }
    // Otherwise, do nothing as we will connect to the next node via the previous if/else
    } else {
      // Do nothing
    }

    // In all cases, save this var declaration's parent node as this declaration node's parent
    declaration.parent = varDeclaration.parent;
  });

  // Swap the declarations in the `body` of the parent block statement
  // e.g. `BlockStatement.body = [{orig VariableDeclaration}, some other expressions]`
  //     -> `BlockStatement.body = [{new VariableDeclaration}, {another new VariableDeclaration}, some other expressions]`
  var varDeclarationParentNode = varDeclaration.parent;
  // DEV: Our `body` can be `body` in `Program` or `BlockStatement` but is `consequent` for `SwitchCase's`
  //   https://github.com/estree/estree/blob/9a35a3d091af6ff9cf7fadfe27c49e22533b2bce/spec.md#blockstatement
  //   https://github.com/estree/estree/blob/9a35a3d091af6ff9cf7fadfe27c49e22533b2bce/spec.md#switchcase
  var varDeclarationParentBody = varDeclarationParentNode.body || varDeclarationParentNode.consequent;
  var varDeclarationParentBodyIndex = varDeclarationParentBody.indexOf(varDeclaration);
  var spliceArgs = [varDeclarationParentBodyIndex, 1].concat(declarations);
  varDeclarationParentBody.splice.apply(varDeclarationParentBody, spliceArgs);

  // Handle token bindings (aka the annoying/hard part)
  var queue = [];
  declarations.forEach(function defineAndAttachTokens (declaration, index) {
    // DEV: We have a few linkages to perform:
    //   Example: HEAD; var a = 1, b = 2; TAIL
    //     VariableDeclaration tokens = ['var', ' ', 'a', ' ', '=', ..., ';']
    //     VariableDeclarator tokens = ['a', ' ', '=', ..., '1']
    var declarator = declaration.declarations[0];

    // If this is the first VariableDeclaration
    if (index === 0) {
      // Define STARTING tokens for each VariableDeclaration (e.g. `var ` for `var a = 1`)
      // DEV: `varDeclaration.startToken` is already linked with all previous tokens in the application, making this transition easy
      // DEV: `varDeclaration.startToken` will be the `var` of `var ` (i.e. `['var', ' ']`, it's the `'var'`)
      var firstStartingToken = varDeclaration.startToken;
      var lastStartingToken = null;

      // Save ORIGINAL VariableDeclaration token (which links to HEAD) AS FIRST VariableDeclaration token (e.g. reuse the existing `var ` token chain)
      declaration.startToken = firstStartingToken;
    // Otherwise, (we are a non-first VariableDeclaration)
    } else {
      // Insert leading content for each non-first VariableDeclaration between VariableDeclaration's
      // Create `var ` tokens
      var newStartingTokens = exports.cloneTokenChain(startingTokens);
      // DEV: This is always defined as we always need a `var` keyword
      var firstStartingToken = newStartingTokens[0];
      var lastStartingToken = newStartingTokens[newStartingTokens.length - 1];

      // Save firstStartingToken and lastStartingToken for later
      declaration.firstStartingToken = firstStartingToken;
      declaration.lastStartingToken = lastStartingToken;

      // Attach FIRST `var ` token TO last VariableDeclaration END token
      //   and attach FIRST `var ` token AS current VariableDeclaration START token
      var lastDeclaration = declarations[index - 1];
      lastDeclaration.endToken.next = firstStartingToken;
      firstStartingToken.prev = lastDeclaration.endToken;
      declaration.startToken = firstStartingToken;

      // Attach LAST `var ` token TO FIRST VariableDeclarator token AS PREVIOUS token
      declarator.startToken.prev = lastStartingToken;
      lastStartingToken.next = declarator.startToken;
    }

    // If this is a non-last VariableDeclaration
    if (index < declarations.length - 1) {
      // Define ENDING tokens for each VariableDeclaration (e.g. `;\n  ` for `var a = 1;\n  `)
      // Insert terminating content for each VariableDeclaration between VariableDeclaration's (e.g. `;\n  `)
      // Create `;\n  ` tokens
      var newBetweenTokens = exports.cloneTokenChain(betweenDeclarationTokens);
      var firstBetweenToken = newBetweenTokens[0];
      var lastBetweenToken = newBetweenTokens[newBetweenTokens.length - 1];

      // Attach LAST `;\n  ` token TO current VariableDeclaration AS END token
      //   and attach LAST `;\n  ` token to next VariableDeclaration AS PREVIOUS token
      declaration.endToken = lastBetweenToken;
      var nextDeclaration = declarations[index + 1];
      // DEV: We need to queue these actions since `nextDeclaration.startToken` doesn't exist yet =/
      // QUEUE: nextDeclaration.startToken.prev = lastBetweenToken;
      // QUEUE: lastBetweenToken.next = nextDeclaration.startToken;
      queue.push({
        srcNode: nextDeclaration,
        srcTokenKey: 'startToken',
        srcDirectionKey: 'prev',
        targetToken: lastBetweenToken,
        targetDirectionKey: 'next'
      });

      // Attach FIRST `;\n ` token TO LAST VariableDeclarator token AS NEXT token
      declarator.endToken.next = firstBetweenToken;
      firstBetweenToken.prev = declarator.endToken;
    // Otherwise, (this is the last VariableDeclaration)
    } else {
      // DEV: `lastDeclarator.endToken.next` is already linked with all previous tokens in the application, making this transition easy
      // DEV: `lastDeclarator.endToken.next` will be the `;` of `;\n  ` (i.e. `[';', '\n', '  ']`, it's the `';'`)
      var lastDeclarator = varDeclaration.declarations[index];
      var firstEndingToken = lastDeclarator.endToken.next;
      var lastEndingToken = null;

      // If there is no first ending token, then we are at the end of the program (e.g. `var a = 1EOF`)
      if (!firstEndingToken) {
        // Save the same `lastDeclarator.endToken` as our `declaration.endToken` for consistency
        // DEV: `lastDeclarator.endToken` is already bound to `Program.endToken` as this was the original setup
        declarator.endToken = lastDeclarator.endToken;
      // Save ORIGINAL VariableDeclaration token (which links to TAIL) AS START token for  VariableDeclaration END token (e.g. reuse the existing `var ` token chain)
      } else {
        declaration.endToken = firstEndingToken;
      }
    }
  });

  // Walk over our queued actions and bind them
  queue.forEach(function saveQueueAction (action) {
    var srcNode = action.srcNode;
    var srcToken = srcNode[action.srcTokenKey];
    var targetToken = action.targetToken;
    srcToken[action.srcDirectionKey] = targetToken;
    targetToken[action.targetDirectionKey] = srcToken;
  });

  // Return the updated node
  return node;
};

// Export our transformation
// https://github.com/millermedeiros/esformatter/tree/v0.4.3#transformbeforeast
exports.transform = function (ast) {
  rocambole.moonwalk(ast, exports._transformNode);
};
