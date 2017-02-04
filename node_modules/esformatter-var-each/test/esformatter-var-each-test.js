// Load in dependencies
var fs = require('fs');
var esformatter = require('esformatter');
var expect = require('chai').expect;
var rocambole = require('rocambole');
var esformatterVarEach = require('../');

// Register our plugin
esformatter.register(esformatterVarEach);

// Define test utilities
var testUtils = {
  format: function (filepath) {
    before(function formatFn () {
      // Format our content
      var input = fs.readFileSync(filepath, 'utf8');
      this.output = esformatter.format(input);
    });
    after(function cleanup () {
      // Cleanup output
      delete this.output;
    });
  },
  transform: function (filepath) {
    before(function formatFn () {
      // Format our content
      var input = fs.readFileSync(filepath, 'utf8');
      this.ast = rocambole.parse(input);
      esformatter.transform(this.ast);
    });
    after(function cleanup () {
      // Cleanup ast
      delete this.ast;
    });
  }
};

// Basic variable tests
describe('esformatter-var-each', function () {
  describe('formatting a JS file with comma-last variables', function () {
    testUtils.format(__dirname + '/test-files/basic-comma-last.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-comma-last.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with comma-first variables', function () {
    testUtils.format(__dirname + '/test-files/basic-comma-first.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-comma-first.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with var-each variables', function () {
    testUtils.format(__dirname + '/test-files/basic-var-each.js');

    it('does nothing', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-var-each.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with variables in loops', function () {
    testUtils.format(__dirname + '/test-files/basic-loops.js');

    it('does nothing', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-loops.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with semicolon-less `var\'s`', function () {
    testUtils.format(__dirname + '/test-files/basic-semicolon-less.js');

    it('does nothing', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-semicolon-less.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with `let` and `const`', function () {
    testUtils.format(__dirname + '/test-files/basic-let-const.js');

    it('converts those to a `var-each` format', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-let-const.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  // DEV: This is an edge case from https://github.com/twolfson/esformatter-var-each/issues/2
  describe('formatting a JS file with a `var` in a `switch`', function () {
    testUtils.format(__dirname + '/test-files/basic-switch.js');

    it('encounters no errors', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/basic-switch.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });
});

// Intermediate tests
describe('esformatter-var-each', function () {
  describe('formatting a JS file with hoisted variables', function () {
    testUtils.format(__dirname + '/test-files/intermediate-hoisted-vars.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/intermediate-hoisted-vars.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with indented variables', function () {
    testUtils.format(__dirname + '/test-files/intermediate-indented-vars.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/intermediate-indented-vars.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting a JS file with indented variables without semicolons', function () {
    testUtils.format(__dirname + '/test-files/intermediate-indented-vars-semicolon-less.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/intermediate-indented-vars-semicolon-less.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  // https://github.com/twolfson/esformatter-var-each/issues/2
  describe('formatting a JS file with indented variables on a var each without semicolons', function () {
    testUtils.format(__dirname + '/test-files/intermediate-indented-var-each-semicolon-less.js');

    it('maintains each `var` statement as its own line', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/intermediate-indented-var-each-semicolon-less.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });
});

// Advanced tests
describe('esformatter-var-each', function () {
  describe('formatting multi-line variables', function () {
    testUtils.format(__dirname + '/test-files/advanced-multi-line.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/advanced-multi-line.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting multi-line variables without semicolons', function () {
    testUtils.format(__dirname + '/test-files/advanced-multi-line-semicolon-less.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/advanced-multi-line-semicolon-less.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });

  describe('formatting semicolon-less variables and no trailing new line', function () {
    testUtils.format(__dirname + '/test-files/advanced-semicolon-less.js');

    it('converts each variable to its own `var` statement', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/advanced-semicolon-less.js', 'utf8');
      expect(this.output).to.equal(expectedOutput);
    });
  });
});

// AST good neighbor tests
describe('esformatter-var-each', function () {
  testUtils.transform(__dirname + '/test-files/basic-comma-last.js');

  it('maintains a doubly linked list for all tokens in Program', function () {
    // Start from left to right
    var token = this.ast.startToken;
    var lastToken;
    var expectedTokens = [];
    while (token) {
      expectedTokens.push(token);
      expect(token).to.have.property('prev', lastToken);
      lastToken = token;
      token = token.next;
    }
    expect(lastToken).to.equal(this.ast.endToken);

    // Now walk backwards
    token = this.ast.endToken;
    lastToken = undefined;
    while (token) {
      var expectedToken = expectedTokens.pop();
      expect(token).to.have.property('next', lastToken);
      expect(token).to.equal(expectedToken);
      lastToken = token;
      token = token.prev;
    }
    expect(lastToken).to.equal(this.ast.startToken);
    expect(expectedTokens).to.have.length(0);
  });

  it('has root set as Program for all tokens', function () {
    // Start from left to right
    var token = this.ast.startToken;
    while (token) {
      expect(token).to.have.property('root', this.ast);
      token = token.next;
    }
  });

  it('our Program has each of our VariableDeclarations as children', function () {
    expect(this.ast.body).to.have.length(2);
    expect(this.ast.body[0]).to.have.property('type', 'VariableDeclaration');
    expect(this.ast.body[1]).to.have.property('type', 'VariableDeclaration');
  });

  it('each of our VariableDeclarations has an expected prev/next property', function () {
    expect(this.ast.body[0]).to.have.property('next', this.ast.body[1]);
    expect(this.ast.body[1]).to.have.property('prev', this.ast.body[0]);
  });

  it('each of our VariableDeclarations has a parent property', function () {
    expect(this.ast.body[0]).to.have.property('parent', this.ast);
    expect(this.ast.body[1]).to.have.property('parent', this.ast);
  });

  it('each of our VariableDeclarations has a startToken and endToken property that are in the token chain', function () {
    expect(this.ast.body[0]).to.have.property('startToken');
    expect(this.ast.body[0]).to.have.property('endToken');
    expect(this.ast.body[1]).to.have.property('startToken');
    expect(this.ast.body[1]).to.have.property('endToken');
  });
});
