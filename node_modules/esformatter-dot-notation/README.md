# [esformatter](https://github.com/millermedeiros/esformatter)-dot-notation

> esformatter plugin for transforming object bracket usage to dot notation

[![NPM Version](http://img.shields.io/npm/v/esformatter-dot-notation.svg?style=flat)](https://npmjs.org/package/esformatter-dot-notation)
[![NPM Downloads](http://img.shields.io/npm/dm/esformatter-dot-notation.svg?style=flat)](https://npmjs.org/package/esformatter-dot-notation)
[![Build Status](http://img.shields.io/travis/pgilad/esformatter-dot-notation.svg?style=flat)](https://travis-ci.org/pgilad/esformatter-dot-notation)

**esformatter-dot-notation** is a plugin for [esformatter](https://github.com/millermedeiros/esformatter)
meant to convert accessing object properties with brackets into dot notation where valid.

This module uses [unquoted-property-validator](https://github.com/pgilad/unquoted-property-validator) which uses Mathias Bynens
[implementation](https://github.com/mathiasbynens/mothereff.in/tree/master/js-properties)
in order to validate if a property name is a valid identifier name and can be used with dot notation.

That means invalid identifiers will not be converted and your code is safe for transformations (see [tests](tests/compare.spec.js)).

Turn this:
```js
someObject['property'] = true;
```

into:
```js
someObject.property = true;
```

## Installation

```sh
$ npm install esformatter-dot-notation --save-dev
```

## Config

Newest esformatter versions autoload plugins from your `node_modules` [See this](https://github.com/millermedeiros/esformatter#plugins)

Add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-dot-notation"
  ]
}
```

Or you can manually register your plugin:
```js
var dotNotation = require('esformatter-dot-notation');
// register plugin
esformatter.register(dotNotation);
```

## Usage

```js
var fs = require('fs');
var esformatter = require('esformatter');
//register plugin manually
esformatter.register(require('esformatter-dot-notation'));

var str = fs.readFileSync('someKewlFile.js').toString();
var output = esformatter.format(str);
//-> output will now contain the formatted string
```

See [esformatter](https://github.com/millermedeiros/esformatter) for more options and further usage.

## License

MIT @[Gilad Peleg](http://giladpeleg.com)
