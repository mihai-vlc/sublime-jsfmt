'use strict';

var rocambole = require('rocambole');
var tk = require('rocambole-token');
var unquotedValidator = require('unquoted-property-validator');

var transormToDotNotation = function (node) {
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
    block.endToken.type = 'Identifier';
    block.startToken.next.type = 'Identifier';
    old.parent = block;
    node = block;
};

var isLiteralComputedExpression = function (node) {
    return node.type === 'MemberExpression' &&
        node.computed &&
        node.property.type === 'Literal';
};

var needsBrackets = function (value) {
    return unquotedValidator(value).needsBrackets;
};

exports.transformBefore = function (ast) {
    rocambole.moonwalk(ast, function (node) {
        //check that it's a literal expression
        if (isLiteralComputedExpression(node)) {
            //check that the value is valid as a literal
            var value = String(node.property.value);
            if (!needsBrackets(value)) {
                transormToDotNotation(node.property);
            }
        }
    });
};
