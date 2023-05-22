const { Parser } = require('acorn')
const tt = Parser.acorn.tokTypes
const CodeReferenceIdentifier = require('./CodeReferenceIdentifier')

class CodeCompletionGenerator {
  // valid options are:
  //  - insertionCol: the cursor offset into the string, or -1 for the end of the string (the default). this controls where completions are suggested for
  //  - schema: a type schema used for providing sugesstions (optional)
  //  - dataSample: an input data value used for providing suggestions (optional)
  //  - variable: the name of the variable that contains the input data and/or is the type defined by schema (optional)
  //  - blocks: blocks of custom function definitions available to this code (optional)
  //  - singleExpression: if true (the default), parses only the first expression. set to false for multi-line or multi-expression input.
  constructor(expression, options) {
    this.SUPPORTED_ECMA_VERSION = 6
    this.expression = expression
    this.options = Object.assign({
      insertionCol: -1,
      schema: null,
      dataSample: null,
      variable: null,
      blocks: null,
      singleExpression: true
    }, options)
    this.parser = new Parser({
      ecmaVersion: this.SUPPORTED_ECMA_VERSION,
      onToken: token => this._onToken(token)
    }, expression)
    this._path = null
    this._state = this._initial
    this._parse()
  }

  completions() {
    let schemaStart, dataStart

    if (this._path && this._path.hasOwnProperty('name')) {
      if (this._path.of) {
        schemaStart = this._schemaAtPath(this._path.of, this.baseSchema())
        dataStart = this._dataAtPath(this._path.of, this.baseDataSample())
      } else {
        schemaStart = this.baseSchema()
        dataStart = this.baseDataSample()
      }
      return this._completionsMatching(this._path.name, schemaStart, dataStart, this._path)
    } else {
      return []
    }
  }

  complete(completion) {
    if (this._path) {
      return this.expression.substring(0, this._path.start)
        + completion
        + this.expression.substring(this._path.end)
    } else {
      return completion
    }
  }

  evaluatesAs() {
    delete this.referenceError

    if (! this.ast ||
        this.isEmptyExpression() ||
        this.isLiteral() ||
        this.isUnaryLiteralOperation()) {
      return undefined
    }

    try {
      return new Function(
        'payload',
        this._blockDefinitions() +
        'payload = Object.assign({}, payload)\n' +
        `with (payload) { return ${this.expression} }`
      )(this.baseDataSample())
    } catch (error) {
      // console.log(error)
      this.referenceError = error
      return undefined
    }
  }

  isEmptyExpression() {
    return this.ast &&
      'Program' === this.ast.type &&
      0 == this.ast.body.length
  }

  isSingleExpression() {
    return this.ast &&
      'Program' === this.ast.type &&
      1 == this.ast.body.length &&
      'ExpressionStatement' == this.ast.body[0].type
  }

  isLiteral() {
    return 'Literal' == this.ast.type ||
      (this.isSingleExpression() &&
      'Literal' == this.ast.body[0].expression.type)
  }

  isUnaryLiteralOperation() {
    return 'UnaryExpression' == this.ast.type ||
      (this.isSingleExpression() &&
      'UnaryExpression' == this.ast.body[0].expression.type &&
      'Literal' == this.ast.body[0].expression.argument.type)
  }

  hasFunctionDeclaration() {
    return this.ast &&
      'Program' === this.ast.type &&
      undefined !== this.ast.body.find(node => 'FunctionDeclaration' === node.type)
  }

  hasVarFunctionAssignment() {
    return this.ast &&
      'Program' === this.ast.type &&
      undefined !== this.ast.body.find(node => {
        return 'VariableDeclaration' === node.type &&
          undefined !== node.declarations.find(decl => {
            return decl.init && 'FunctionExpression' === decl.init.type
          })
      })
  }

  hasFunctionDefinition() {
    return this.hasFunctionDeclaration() || this.hasVarFunctionAssignment()
  }

  firstDefinedFunctionName() {
    if (this.ast && 'Program' === this.ast.type) {
      for (let i = 0; i < this.ast.body.length; ++i) {
        let node = this.ast.body[i]
        if ('FunctionDeclaration' === node.type && node.id) {
          return node.id.name
        }
        if ('VariableDeclaration' === node.type) {
          let def = node.declarations.find(decl => decl.init && 'FunctionExpression' === decl.init.type)
          if (def && def.id) {
            return def.id.name
          }
        }
      }
    }
  }

  firstDefinedFunctionReturnsFor(argString) {
    let functionName = this.firstDefinedFunctionName()
    if (! functionName) {
      return undefined
    }

    try {
      return new Function(
        this._blockDefinitions(functionName) +
        `${this.expression}; return ${functionName}( ...([${argString}]) )`
      )()
    } catch (error) {
      return undefined
    }
  }

  allowedValues() {
    let schema = null
    if (this.isSingleExpression()) {
      schema = this._schemaSpecAtExpression(this.ast.body[0].expression, this.baseSchema())
    } else if (this.ast) {
      schema = this._schemaSpecAtExpression(this.ast, this.baseSchema())
    }
    return schema ? schema.allowed : undefined
  }

  _blockDefinitions(exceptName) {
    if ((! this.options.blocks) || (this.options.blocks.length === 0)) {
      return ''
    }
    return this._blockDefsFor(this.ast, exceptName)
  }

  _blockDefsFor(ast, exceptName) {
    const blocks = (this.options.blocks || []).filter(b => b.name !== exceptName)
    const blockNames = new Set(blocks.map(b => b.name))
    const dependsOn = this._blockDependencies(ast).filter(dep => blockNames.has(dep))

    if (dependsOn.length > 0) {
      return `const { ${[...blockNames].join(', ')} } = ` +
      '(function() { ' +
      `${blocks.map(b => b.definition).join(' ; ')} ; ` +
      `return { ${[...blockNames].join(', ')} } ` +
      '})();'
    } else {
      return ''
    }
  }

  _blockDependencies(ast) {
    try {
      return new CodeReferenceIdentifier(ast).externalReferences()
    } catch (e) {
      return []
    }
  }

  _schemaSpecAtExpression(expr, fromSchema) {
    if ('Identifier' == expr.type) {
      return fromSchema && fromSchema.fields ? fromSchema.fields[expr.name] : undefined
    } else if ('MemberExpression' == expr.type) {

      let objType = this._schemaSpecAtExpression(expr.object, fromSchema)
      objType = objType ? objType.type : undefined

      if (expr.computed) {
        if ('Literal' == expr.property.type) {
          return objType && objType.fields ? objType.fields[expr.property.value] : undefined
        }
      } else {
        return this._schemaSpecAtExpression(expr.property, objType)
      }
    }
  }

  baseDataSample() {
    if (this.options.variable)
      return {[this.options.variable]: this.options.dataSample}
    else
      return this.options.dataSample
  }

  baseSchema() {
    if (this.options.variable)
      return {fields: {[this.options.variable]: {type: this.options.schema}}}
    else
      return this.options.schema
  }

  _dataAtPath(path, inSample) {
    const base = path.of ? this._dataAtPath(path.of, inSample) : inSample
    const key = this._stepKey(path)
    if (base) {
      return base[key]
    }
  }

  _schemaAtPath(path, inSchema) {
    const base = path.of ? this._schemaAtPath(path.of, inSchema) : inSchema
    const key = this._stepKey(path)
    if (base && base.fields && base.fields[key]) {
      return base.fields[key].type
    }
  }

  _stepKey(step) {
    if (step.name) {
      return step.name
    } else if (step.index) {
      return step.index
    } else if (step.var) {
      return this._dataAtPath({name: step.var}, this.baseDataSample())
    }
  }

  _completionsMatching(str, schema, data, ctx) {
    let matches = new Set()
    if (schema) {
      this._schemaCompletionsMatching(matches, str, schema, '', ctx)
    }
    if (data) {
      this._dataCompletionsMatching(matches, str, data, '', ctx)
    }

    return [...matches].sort()
  }

  _schemaCompletionsMatching(matches, str, schema, prefix, ctx) {

    // These work, but the suggestions are repetitive and not useful
    // if (schema && schema.member_type && schema.member_type.fields && (!ctx || !ctx.bracket)) {
    //   Object.keys(schema.member_type.fields).forEach(prop => {
    //     let accessProp = this._isPlainName(prop) ? `.${prop}` : `[${JSON.stringify(prop)}]`
    //     let value = JSON.stringify(schema.member_type.fields[prop].type('0000'));
    //     [
    //       `${prefix}every(item => item${accessProp} == ${value})`,
    //       `${prefix}filter(item => item${accessProp} == ${value})`,
    //       `${prefix}find(item => item${accessProp} == ${value})`,
    //       `${prefix}map(item => item${accessProp})`,
    //       `${prefix}some(item => item${accessProp} == ${value})`
    //     ].forEach(path => {
    //       if (path.indexOf(str) !== -1)
    //         matches.add(path)
    //     })
    //   })
    // }

    if (!schema || !schema.fields) {
      return
    }

    Object.keys(schema.fields).forEach(field => {
      let path = this._formatPath(prefix, field, ctx)
      if (path.indexOf(str) !== -1) {
        matches.add(path)
      }
      this._schemaCompletionsMatching(matches, str, schema.fields[field].type, path + '.')
    })
  }

  _dataCompletionsMatching(matches, str, data, prefix, ctx) {
    if (!data || 'string' === typeof data || data instanceof String) {
      return
    }
    // These work, but the suggestions are repetitive and not useful
    // if (Array.isArray(data) && (!ctx || !ctx.bracket)) {
    //   let sample = this._consolidatedSample(data)
    //   Object.keys(sample).forEach(prop => {
    //     let accessProp = this._isPlainName(prop) ? `.${prop}` : `[${JSON.stringify(prop)}]`
    //     let value = JSON.stringify(sample[prop]);
    //     [
    //       `${prefix}every(item => item${accessProp} == ${value})`,
    //       `${prefix}filter(item => item${accessProp} == ${value})`,
    //       `${prefix}find(item => item${accessProp} == ${value})`,
    //       `${prefix}map(item => item${accessProp})`,
    //       `${prefix}some(item => item${accessProp} == ${value})`
    //     ].forEach(path => {
    //       if (path.indexOf(str) !== -1)
    //         matches.add(path)
    //     })
    //   })
    //   return
    // }

    Object.keys(data).forEach(prop => {
      let path = this._formatPath(prefix, prop, ctx)
      if (path.indexOf(str) !== -1) {
        matches.add(path)
      }
      this._dataCompletionsMatching(matches, str, data[prop], path + '.')
    })
  }

  _consolidatedSample(ary) {
    let out = {}
    ary.forEach(item => {
      Object.keys(item || {}).forEach(prop => {
        if (! out.hasOwnProperty(prop))
          out[prop] = item[prop]
      })
    })
    return out
  }

  _formatPath(path, name, ctx) {
    if (ctx && ctx.bracket) {
      return path + JSON.stringify(name) + ']'
    } else if (!this._isPlainName(name)) {
      return path.replace(/\.$/, '') + `[${JSON.stringify(name)}]`
    } else {
      return path + name
    }
  }

  _isPlainName(name) {
    // this is conservative, it will wind up (safely) quoting unicode characters outside the ASCII set as a trade-off for a simpler RegEx
    return /^[$A-Z_a-z][$0-9A-Z_a-z]*$/.test(name)
  }

  _parse() {
    try {
      if (this.options.singleExpression) {
        this.parser.nextToken()
        this.ast = this.parser.type === tt.eof ? null : this.parser.parseExpression()
      } else {
        this.ast = this.parser.parse()
      }
    } catch (error) {
      this.parseError = error
    }
  }

  _onToken(token) {
    if (this.options.insertionCol >= 0 && this.options.insertionCol <= token.start) {
      return
    }
    if (this._state && token.type !== tt.eof)
      this._state(token)
  }

  _initial(token) {
    if (token.type === tt.name) {
      this._path = {name: token.value, start: token.start, end: token.end}
      this._state = this._withLeftOperand
    }
  }

  _withLeftOperand(token) {
    if (token.type === tt.dot) {
      this._path = {name: '', of: this._path, start: token.end, end: token.end}
      this._state = this._memberByName
    } else if (token.type == tt.bracketL) {
      this._path = {name: '', of: this._path, bracket: true, start: token.end, end: token.end}
      this._state = this._memberByExpression
    } else {
      this._path = null
      this._state = this._initial
    }
  }

  _memberByName(token) {
    if (token.type == tt.name) {
      this._path.name = token.value
      this._path.start = token.start
      this._path.end = token.end
      this._state = this._withLeftOperand
    } else {
      this._path = null
      this._state = this._initial
    }
  }

  _memberByExpression(token) {
    if (token.type == tt.string) {
      this._path.name = token.value
      this._path.start = token.start
      this._path.end = token.end
      this._state = this._expectCloseBracket
    } else if (token.type == tt.num) {
      delete this._path.name
      this._path.index = token.value
      this._path.start = token.start
      this._path.end = token.end
      this._state = this._expectCloseBracket
    } else if (token.type == tt.name) {
      delete this._path.name
      this._path.var = token.value
      this._path.start = token.start
      this._path.end = token.end
      this._state = this._expectCloseBracket
    } else {
      this._path = null
      this._state = this._initial
    }
  }

  _expectCloseBracket(token) {
    if (token.type == tt.bracketR) {
      this._path.end = token.end
      this._state = this._withLeftOperand
    } else {
      this._path = null
      this._state = this._initial
    }
  }
}

module.exports = CodeCompletionGenerator
