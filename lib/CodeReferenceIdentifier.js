const { Parser } = require('acorn')
const astray = require('astray')

class CodeReferenceIdentifier {
  constructor(expression) {
    this.SUPPORTED_ECMA_VERSION = 6
    if (this._isNode(expression)) {
      this.ast = expression
    } else {
      this.expression = expression
      this.parser = new Parser({ecmaVersion: this.SUPPORTED_ECMA_VERSION}, expression)
      this.ast = this.parser.parse()
    }
    this.predefined = new Set(
      this.builtins.concat(this.globals).concat(this.nodeGlobals)
    )
  }

  _isNode(obj) {
    return (
      (typeof obj.type !== 'undefined') &&
      (typeof obj.start !== 'undefined') &&
      (typeof obj.end !== 'undefined')
    )
  }

  get globals() {
    return [
      'clearInterval', 'clearTimeout', 'setInterval', 'setTimeout', 'queueMicrotask'
    ]
  }

  get builtins() {
    return [
      'Infinity', 'NaN', 'undefined', 'globalThis',
      'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'encodeURI',
        'encodeURIComponent', 'decodeURI', 'decodeURIComponent', 'escape', 'unescape',
      'Object', 'Function', 'Boolean', 'Symbol',
      'Error', 'AggregateError', 'EvalError', 'InternalError', 'RangeError',
        'SyntaxError', 'TypeError', 'URIError',
      'Number', 'BigInt', 'Math', 'Date',
      'String', 'RegExp',
      'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
        'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array',
        'BigInt64Array', 'BigUint64Array',
      'Map', 'Set', 'WeakMap', 'WeakSet',
      'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON',
      'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction', 'AsyncGenerator',
        'AsyncGeneratorFunction',
      'Reflect', 'Proxy',
      'Intl',
      'WebAssembly',
      'arguments'
    ]
  }

  get nodeGlobals() {
    return [
      'Buffer', '__dirname', '__filename', 'console', 'exports', 'global',
      'module', 'process', 'require', 'TextDecoder', 'TextEncoder', 'URL',
      'URLSearchParams',
      'setImmediate', 'clearImmediate'
    ]
  }

  isPredefined(name) {
    return this.predefined.has(name)
  }

  externalReferences() {
    const identifiers = {}

    astray.walk(this.ast, {
      Identifier: (node) => {
        const parent = node.path.parent

        if ((!parent) ||
            node === parent.init ||
            node === parent.callee ||
            node === parent.argument ||
            node === parent.test ||
            node === parent.discriminant ||
            node === parent.update ||
            node === parent.left ||
            node === parent.right ||
            node === parent.value ||
            node === parent.object ||
            node === parent.alternate ||
            node === parent.consequent ||
            node === parent.body ||
            node === parent.expression ||
            (node === parent.property && parent.computed) ||
            (parent.elements && -1 !== parent.elements.indexOf(node)) ||
            (parent.arguments && -1 !== parent.arguments.indexOf(node)) ||
            (parent.expressions && -1 !== parent.expressions.indexOf(node))) {

          let bindings = astray.lookup(node, node.name)
          if ( (! bindings.hasOwnProperty(node.name)) &&
               (! this.isPredefined(node.name)) ) {
            identifiers[node.name] = true
          }
        }
      }
    })

    return Object.keys(identifiers)
  }
}

module.exports = CodeReferenceIdentifier
