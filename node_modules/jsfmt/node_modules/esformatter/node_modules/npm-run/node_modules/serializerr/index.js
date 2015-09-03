"use strict"

import protochain from 'protochain'

export default serializerr

function serializerr(obj = {}) {
  let chain = protochain(obj)
  .filter(obj => obj !== Object.prototype)
  return [obj]
  .concat(chain)
  .map(item => Object.getOwnPropertyNames(item))
  .reduce((result, names) => {
    names.forEach(name => result[name] = obj[name])
    return result
  }, {})
}

serializerr.serializerr = serializerr
