# esformatter-var-each [![Build status](https://travis-ci.org/twolfson/esformatter-var-each.png?branch=master)](https://travis-ci.org/twolfson/esformatter-var-each)

[Esformatter][] plugin that converts comma `var` statements into separate `var` statements

This was created to make obfuscated scripts more palatable. However, it should be a nice addition to your web development tasks.

[Esformatter]: https://github.com/millermedeiros/esformatter

**Features:**

- Preserves last character of `var's` (e.g. `var a, b;` -> `var a; var b;`)
- Maintain indentation level of `var's`

## Getting Started
Install the module with: `npm install esformatter-var-each`

Then, register it as a plugin and format your JS:

```js
// Load and register our plugin
var esformatter = require('esformatter');
var esformatterVarEach = require('esformatter-var-each');
esformatter.register(esformatterVarEach);

// Format our code
esformatter.format([
  'var a = \'hello\',',
  '    b = \'world\';'
].join('\n'));
// var a = 'hello';
// var b = 'world';
```

Alternatively, load it via `format` directly:

```js
var esformatter = require('esformatter');
esformatter.format([
  'var a = \'hello\',',
  '    b = \'world\';'
].join('\n'), {
  plugins: [
    'esformatter-var-each'
  ]
});
```

## Documentation
`esformatter-var-each` exposes `exports.transform` for consumption by `esformatter`.

### `esformatterVarEach.transform(ast)`
Walk [AST][] and splice in `var` statements.

**Warning: This mutates nodes in place**

- ast `AbstractSyntaxTree` - Abstract syntax tree provided by `esformatter`

[AST]: http://en.wikipedia.org/wiki/Abstract_syntax_tree

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Unlicense
As of Nov 03 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
