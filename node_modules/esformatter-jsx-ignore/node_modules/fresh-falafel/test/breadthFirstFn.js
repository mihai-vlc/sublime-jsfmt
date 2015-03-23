var falafel = require('../');
var test = require('tape');

test('parent', function (t) {
    t.plan(5 + 4);
    
    var src = '(' + function () {
        var xs = [ 1, 2, 3 ];
        fn(ys);
    } + ')()';
    
    var output = falafel(src, 
        function (node) {
            if (node.type === 'ArrayExpression') {
                t.ok(node.isArrayExpression, "isArrayExpression is not defined") //We added isArrayExpression on breath first
                t.equal(node.parent.type, 'VariableDeclarator');
                t.equal(
                    ffBracket(node.parent.source()),
                    'xs = [ 1, 2, 3 ]'
                );
                t.equal(node.parent.parent.type, 'VariableDeclaration');
                t.equal(
                    ffBracket(node.parent.parent.source()),
                    'var xs = [ 1, 2, 3 ];'
                );
                node.parent.update('ys = 4;');
            }},
        function (node) { //breadth first function
            if (node.type === 'ArrayExpression') {
                t.ok(node.source);
                t.ok(node.parent);
                t.notOk(node.update); //Update should not be defined yet
                node.isArrayExpression = true; //We will confirm this is still there during depth first pass
            }
        });
    
    Function(['fn'], output)(function (x) { t.equal(x, 4) });
});

function ffBracket (s) {
    return s.replace(/\[\s*/, '[ ').replace(/\s*\]/, ' ]');
}
