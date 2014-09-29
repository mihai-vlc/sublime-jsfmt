'use strict';

var tk = require('rocambole-token');
var rocambole = require('rocambole');
var unquotedValidator = require('unquoted-property-validator');

var transormToDotNotation = function(node) {
    var old = node;
    //reassign correct value
    old.startToken.value = old.endToken.value = node.value;
    tk.remove(old.startToken.prev);
    tk.remove(old.startToken.next);
    var block = {
        type: 'Identifier',
        name: node.value,
        parent: old.parent,
        root: old.root,
        body: [old],
        startToken: tk.before(old.startToken, {
            type: 'Punctuator',
            value: '.'
        }),
        endToken: old.endToken
    };
    old.parent = block;
    node = block;
};

var isLiteralComputedExpression = function(node) {
    return node.type === 'MemberExpression' &&
        node.computed &&
        node.property.type === 'Literal';
};

var needsBrackets = function(value) {
    return unquotedValidator(value).needsBrackets;
};

exports.transformBefore = function(ast) {
    rocambole.moonwalk(ast, function(node) {
        if (isLiteralComputedExpression(node) && !needsBrackets(node.property.value)) {
            transormToDotNotation(node.property);
        }
    });
};
