# [esformatter](https://github.com/millermedeiros/esformatter)-braces

> esformatter plugin for enforcing braces around statements

[![NPM Version](http://img.shields.io/npm/v/esformatter-braces.svg?style=flat)](https://npmjs.org/package/esformatter-braces)
[![NPM Downloads](http://img.shields.io/npm/dm/esformatter-braces.svg?style=flat)](https://npmjs.org/package/esformatter-braces)
[![Build Status](http://img.shields.io/travis/pgilad/esformatter-braces.svg?style=flat)](https://travis-ci.org/pgilad/esformatter-braces)

**Esformatter-braces** is a plugin for [esformatter](https://github.com/millermedeiros/esformatter) meant for brace enforcement around statements. Recommended by Douglas Crockford in his [coding style guide](http://javascript.crockford.com/code.html).

Turn this:
```js
if (theSkyIsBlue)
    stareAtItForAWhile();
```

into:
```js
if (theSkyIsBlue) {
    stareAtItForAWhile();
}
```

For more information see:
- [Jetbrain's Idea](http://www.jetbrains.com/idea/webhelp10.5/wrapping-and-braces.html) and specifically the **Force brace always** section.
- The [jsHint](https://github.com/jshint/jshint/) option - [curly](http://www.jshint.com/docs/options/#curly)

Currently the following node statements are handled:
 **If conditionals**, **While**, **Do While**, **For loops**

*For any other formatting (such as braces placement, spacing and line wrapping) use esformatter or other plugins.*

## Goals

- Add similar options to IDEA's: **Do not force** and **Multiline**
- Possibly do the reverse: remove braces if possible (single line statements)

## Installation

```sh
$ npm install esformatter-braces --save-dev
```

## Config

Newest esformatter versions autoload plugins from your `node_modules` [See this](https://github.com/millermedeiros/esformatter#plugins)

Add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-braces"
  ]
}
```

Or you can manually register your plugin:
```js
// register plugin
esformatter.register(require('esformatter-braces'));
```

## Usage

```js
var fs = require('fs');
var esformatter = require('esformatter');
//register plugin manually
esformatter.register(require('esformatter-braces'));

var str = fs.readFileSync('someKewlFile.js').toString();
var output = esformatter.format(str);
//-> output will now contain the formatted string
```

See [esformatter](https://github.com/millermedeiros/esformatter) for more options and further usage.

## License

MIT @[Gilad Peleg](http://giladpeleg.com)
