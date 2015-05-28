# [esformatter](https://github.com/millermedeiros/esformatter)-jsx-ignore
> esformatter plugin: ignore jsx blocks so the rest of the javascript code could be formatted without parsing errors

**NOTE**: If you want something that actually tries to apply some formatting to your javascript files try: [esformatter-jsx](https://www.npmjs.com/package/esformatter-jsx)

[![NPM Version](http://img.shields.io/npm/v/esformatter-jsx-ignore.svg?style=flat)](https://npmjs.org/package/esformatter-jsx-ignore)
[![Build Status](http://img.shields.io/travis/royriojas/esformatter-jsx-ignore.svg?style=flat)](https://travis-ci.org/royriojas/esformatter-jsx-ignore)

**Esformatter-jsx-ignore** is a plugin for [esformatter](https://github.com/millermedeiros/esformatter) meant to allow the
code formatting of jsx files. This plugin basically will make esformatter to ignore the offending blocks (the jsx blocks)
and let esformatter apply the magic on the rest of the file.

**IMPORTANT**: This is a temporary solution until [esformatter](https://github.com/millermedeiros/esformatter) 
supports jsx out of the box. It actually works, by just ignoring the jsx blocks and letting esformatter to work on the 
rest of the code. It seems to be working, but I haven't test all possible scenarios. That said, it works for my main use case
on very complex react components, so it might work for you too.

If you want a bit of history about what this plugin was develop, check: 
- https://github.com/millermedeiros/esformatter/issues/242
- https://github.com/facebook/esprima/issues/74

So this plugin will turn this:
```js
var React = require('react');

var Hello = React.createClass({
render: function () {
return <div className="hello-div">{this.props.message}</div>;
}
});

React.render(<Hello message="world"/>,      document.body);
```

into:
```js
var React = require('react');

var Hello = React.createClass({
  render: function() {
    return <div className="hello-div">{this.props.message}</div>;
  }
});

React.render(<Hello message="world"/>, document.body);
```

## Future Goals

- ~~Try to apply some formatting to the actual jsx nodes, instead of blindly ignore them~~.**Done, use [esformatter-jsx](https://github.com/royriojas/esformatter-jsx) instead**
- Render this plugin obsolete when esformatter support this out of the box. Check: https://github.com/millermedeiros/esformatter/issues/242

## Installation

```sh
$ npm install esformatter-jsx-ignore --save-dev
```

## Config

Newest esformatter versions autoload plugins from your `node_modules` [See this](https://github.com/millermedeiros/esformatter#plugins)

Add to your esformatter config file:

In order for this to work, this plugin should be the first one! (I Know too picky, but who isn't).

```json
{
  "plugins": [
    "esformatter-jsx-ignore"
  ]
}
```
**Note**: The previous syntax won't work because of [this issue](https://github.com/millermedeiros/esformatter/issues/245). 
But registering it manually will work like a charm!

Or you can manually register your plugin:
```js
// register plugin
esformatter.register(require('esformatter-jsx-ignore'));
```

## Usage

```js
var fs = require('fs');
var esformatter = require('esformatter');
//register plugin manually
esformatter.register(require('esformatter-jsx-ignore'));

var str = fs.readFileSync('someKewlFile.js').toString();
var output = esformatter.format(str);
//-> output will now contain the formatted code, allowing the jsx nodes to happily pass.
```

See [esformatter](https://github.com/millermedeiros/esformatter) for more options and further usage.

## License

MIT @[Roy Riojas](http://royriojas.com)
