'use strict';

var tk = require('rocambole-token');

var wrapWithBraces = function (node, prop) {
    var oldNode = node[prop];
    var finalToken = oldNode.endToken;
    //apply a custom fix if endtoken is empty
    if (tk.isEmpty(oldNode.endToken)) {
        finalToken = tk.findPrevNonEmpty(oldNode.endToken);
    }
    var newNode = {
        type: 'BlockStatement',
        parent: oldNode.parent,
        root: oldNode.root,
        body: [oldNode],
        startToken: tk.before(oldNode.startToken, {
            type: 'Punctuator',
            value: '{'
        }),
        endToken: tk.after(finalToken, {
            type: 'Punctuator',
            value: '}'
        })
    };
    oldNode.parent = newNode;
    node[prop] = newNode;
};

var checkConditionals = function (node) {
    //replace regular conditionals
    if (node.consequent.type !== 'BlockStatement') {
        wrapWithBraces(node, 'consequent');
    }
    //replace else alternate conditional
    if (node.alternate && node.alternate.type !== 'IfStatement' && node.alternate.type !== 'BlockStatement') {
        wrapWithBraces(node, 'alternate');
    }
};

var isLoopNode = function (node) {
    return node.type === 'WhileStatement' ||
        node.type === 'DoWhileStatement' ||
        node.type === 'ForStatement' ||
        node.type === 'ForInStatement';
};

exports.nodeBefore = function (node) {
    //handle conditionals
    if (node.type === 'IfStatement') {
        checkConditionals(node);
    } else if (isLoopNode(node) && node.body.type !== 'BlockStatement') {
        wrapWithBraces(node, 'body');
    }
};
