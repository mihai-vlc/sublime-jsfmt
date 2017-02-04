var esformatter = require('esformatter');
var esformatterVarEach = require('../');
esformatter.register(esformatterVarEach);

console.log(esformatter.format([
  'var a = \'hello\',',
  '    b = \'world\';'
].join('\n')));
