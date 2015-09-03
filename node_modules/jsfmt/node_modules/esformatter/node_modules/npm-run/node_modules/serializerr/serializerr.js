"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var protochain = _interopRequire(require("protochain"));

module.exports = serializerr;

function serializerr() {
  var obj = arguments[0] === undefined ? {} : arguments[0];

  var chain = protochain(obj).filter(function (obj) {
    return obj !== Object.prototype;
  });
  return [obj].concat(chain).map(function (item) {
    return Object.getOwnPropertyNames(item);
  }).reduce(function (result, names) {
    names.forEach(function (name) {
      return result[name] = obj[name];
    });
    return result;
  }, {});
}

serializerr.serializerr = serializerr;

