const { expect } = require('chai')
const CodeCompletionGenerator = require('../../lib/CodeCompletionGenerator')
const {
  schema,
  OptionalString,
  OptionalNumber
} = require('../../lib/schema-utils')

describe('CodeCompletionGenerator', () => {

  describe('._path', () => {
    it('produces an empty path for an empty string', () => {
      expect(path(new CodeCompletionGenerator(''))).to.be.null
    })

    it('produces a single entry for a name token', () => {
      expect(path(new CodeCompletionGenerator('foo'))).to.eql({name: 'foo'})
    })

    it('produces multiple entries for dot separated content', () => {
      expect(path(new CodeCompletionGenerator('foo.bar.baz'))).to
        .eql({name: 'baz', of: {name: 'bar', of: {name: 'foo'}}})
    })

    it('produces an empty step after a dot', () => {
      expect(path(new CodeCompletionGenerator('foo.'))).to
        .eql({name: '', of: {name: 'foo'}})
    })

    it('handles a string in brackets', () => {
      expect(path(new CodeCompletionGenerator('foo["bar"]'))).to
        .eql({name: 'bar', of: {name: 'foo'}})
    })

    it('handles a number in brackets', () => {
      expect(path(new CodeCompletionGenerator('foo[0]'))).to
        .eql({index: 0, of: {name: 'foo'}})
    })

    it('handles a name in brackets', () => {
      expect(path(new CodeCompletionGenerator('foo[bar]'))).to
        .eql({var: 'bar', of: {name: 'foo'}})
    })

    it('handles member access after a bracket', () => {
      expect(path(new CodeCompletionGenerator('foo["bar"].baz'))).to
        .eql({name: 'baz', of: {name: 'bar', of: {name: 'foo'}}})
    })

    it('skips unknown tokens', () => {
      expect(path(new CodeCompletionGenerator('foo.bar + baz.qux'))).to
        .eql({name: 'qux', of: {name: 'baz'}})
    })

    it('recognizes paths in string templates', () => {
      expect(path(new CodeCompletionGenerator('`Hello ${foo.bar'))).to
        .eql({name: 'bar', of: {name: 'foo'}})
    })

    context('with an insertion point', () => {
      let options = {insertionCol: 7}

      it('ignores content after the insertion point', () => {
        expect(path(new CodeCompletionGenerator('foo.bar.baz', options))).to
          .eql({name: 'bar', of: {name: 'foo'}})
      })
    })
  })

  describe('.completions()', () => {
    let opts = {
      schema: schema({fields: {
        order: {type: schema({fields: {
          id: OptionalNumber,
          dc_name: OptionalString,
          customer: {type: schema({fields: {
            id: OptionalNumber,
            first_name: OptionalString,
            last_name: OptionalString,
            address: OptionalString,
            city: OptionalString,
            state: OptionalString,
          }})}
        }})}
      }}),
      dataSample: {order: {id: 1234, customer: {
        id: 5678, first_name: 'John', last_name: 'Doe', lat: 40.7587821, lon: -73.9909649
      }}}
    }

    it('produces an empty list for an empty string', () => {
      expect(new CodeCompletionGenerator('', opts).completions()).to.eql([])
    })

    it('produces an empty list for no schema or data', () => {
      expect(new CodeCompletionGenerator('name').completions()).to.eql([])
    })

    it('produces matches from the entire hierarchy', () => {
      expect(new CodeCompletionGenerator('name', opts).completions()).to.eql([
        'order.customer.first_name',
        'order.customer.last_name',
        'order.dc_name'
      ])
    })

    it('is scoped by any preceding path parts', () => {
      expect(new CodeCompletionGenerator('order.customer.name', opts).completions()).to.eql([
        'first_name',
        'last_name',
      ])
    })

    it('includes completions only found in the data', () => {
      expect(new CodeCompletionGenerator('order.l', opts).completions()).to.include.members([
        'customer.lat',
        'customer.lon',
      ])
    })

    it('includes completions only found in the schema', () => {
      expect(new CodeCompletionGenerator('city', opts).completions()).to.eql([
        'order.customer.city'
      ])
    })

    it('prefixes schema and data with a variable when given', () => {
      let withVar = Object.assign({variable: 'data'}, opts)
      expect(new CodeCompletionGenerator('name', withVar).completions()).to.eql([
        'data.order.customer.first_name',
        'data.order.customer.last_name',
        'data.order.dc_name'
      ])
    })

    it('recognizes the variable name in the path when given', () => {
      let withVar = Object.assign({variable: 'data'}, opts)
      expect(new CodeCompletionGenerator('data.name', withVar).completions()).to.eql([
        'order.customer.first_name',
        'order.customer.last_name',
        'order.dc_name'
      ])
    })

    it('formats completions correctly when inside a bracket', () => {
      expect(new CodeCompletionGenerator('order["cust"', opts).completions()).to.eql([
        '"customer"]',
        '"customer"].address',
        '"customer"].city',
        '"customer"].first_name',
        '"customer"].id',
        '"customer"].last_name',
        '"customer"].lat',
        '"customer"].lon',
        '"customer"].state',
      ])
    })

    it('formats completions correctly when names require brackets', () => {
      let withSpaces = Object.assign({}, opts)
      withSpaces.dataSample.order["name with spaces"] = {flag: true}
      expect(new CodeCompletionGenerator('ith', withSpaces).completions()).to.eql([
        'order["name with spaces"]',
        'order["name with spaces"].flag'
      ])
    })

    context('when completions involve an array', () => {
      let opts = {
        schema: schema({fields: {
          questions: {type: schema({member_type: schema({fields: {
            id: OptionalNumber,
            text: OptionalString
          }})})}
        }}),
        dataSample: {answers: [
          {id: 1234, response: "yes"},
          {id: 5678, response: "no"}
        ]}
      }

      // it('includes .map with an example from each item', () => {
      //   expect(new CodeCompletionGenerator('id', opts).completions()).to.include.members([
      //     'questions.map(item => item.id)',
      //     'answers.map(item => item.id)'
      //   ])
      // })

      // it('includes .find with an example from each item', () => {
      //   expect(new CodeCompletionGenerator('id', opts).completions()).to.include.members([
      //     'questions.find(item => item.id == 0)',
      //     'answers.find(item => item.id == 1234)'
      //   ])
      // })

      // it('includes .filter with an example from each item', () => {
      //   expect(new CodeCompletionGenerator('id', opts).completions()).to.include.members([
      //     'questions.filter(item => item.id == 0)',
      //     'answers.filter(item => item.id == 1234)'
      //   ])
      // })

      // it('includes .every with an example from each item', () => {
      //   expect(new CodeCompletionGenerator('id', opts).completions()).to.include.members([
      //     'questions.every(item => item.id == 0)',
      //     'answers.every(item => item.id == 1234)'
      //   ])
      // })

      // it('includes .some with an example from each item', () => {
      //   expect(new CodeCompletionGenerator('id', opts).completions()).to.include.members([
      //     'questions.some(item => item.id == 0)',
      //     'answers.some(item => item.id == 1234)'
      //   ])
      // })
    })
  })

  describe('.complete()', () => {
    let opts = {
      dataSample: {order: {id: 1234, status: 'picked', customer: {
        id: 5678, first_name: 'John', last_name: 'Doe', city: 'New York', state: 'NY'
      }}}
    }

    it('replaces the entire string when a single token is entered', () => {
      let gen = new CodeCompletionGenerator('name', opts)
      expect(gen.complete(gen.completions()[0])).to.eql(
        'order.customer.first_name'
      )
    })

    it('replaces a single token when multiple tokens are entered', () => {
      let gen = new CodeCompletionGenerator('order.name', opts)
      expect(gen.complete(gen.completions()[0])).to.eql(
        'order.customer.first_name'
      )
    })

    it('replaces the token at the insertion point when one is given', () => {
      let withInsertion = Object.assign({insertionCol: 13}, opts)
      let gen = new CodeCompletionGenerator('`${order.name} + ${order.customer.last_name}`', withInsertion)
      expect(gen.complete(gen.completions()[0])).to.eql(
        '`${order.customer.first_name} + ${order.customer.last_name}`'
      )
    })
  })

  describe('.evaluatesAs()', () => {
    let opts = {
      dataSample: {order: {id: 1234, status: 'picked', total_amt: '100.00'}}
    }

    it('returns the expression value when it is valid', () => {
      let gen = new CodeCompletionGenerator('order.status', opts)
      expect(gen.evaluatesAs()).to.eq('picked')
    })

    it('returns undefined when the expression is invalid', () => {
      let gen = new CodeCompletionGenerator('order."status', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for an empty expression', () => {
      let gen = new CodeCompletionGenerator(' ', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a numeric literal', () => {
      let gen = new CodeCompletionGenerator('100', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a signed numeric literal', () => {
      let gen = new CodeCompletionGenerator('-100', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a boolean literal', () => {
      let gen = new CodeCompletionGenerator('true', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a null literal', () => {
      let gen = new CodeCompletionGenerator('null', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a regular expression literal', () => {
      let gen = new CodeCompletionGenerator('/.*/', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a string literal', () => {
      let gen = new CodeCompletionGenerator('"ok"', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns undefined for a parenthesized literal', () => {
      let gen = new CodeCompletionGenerator('(100)', opts)
      expect(gen.evaluatesAs()).to.be.undefined
    })

    it('returns the expression for a string template', () => {
      let gen = new CodeCompletionGenerator('`$${order.total_amt}`', opts)
      expect(gen.evaluatesAs()).to.eq('$100.00')
    })

    context('when the expression references external code', () => {
      let blocks = [{name: 'shout',
        definition: 'function shout(value) { return value.toUpperCase() }'}]
      let opts2 = Object.assign({blocks}, opts)

      it('includes the required function definition', () => {
        let gen = new CodeCompletionGenerator('shout(order.status)', opts2)
        expect(gen.evaluatesAs()).to.eql('PICKED')
      })
    })
  })

  describe('.allowedValues()', () => {
    let opts = {
      schema: schema({fields: {
        event: {type: String, allowed: ['created', 'updated', 'deleted']},
        order: {type: schema({fields: {
          id: {type: Number},
          status: {type: String, allowed: ['ready', 'picked', 'packed', 'shipped']}
        }})},
      }})
    }

    it('returns allowed values for a single name', () => {
      let gen = new CodeCompletionGenerator('event', opts)
      expect(gen.allowedValues()).to.eql(['created', 'updated', 'deleted'])
    })

    it('returns allowed values for a member expression', () => {
      let gen = new CodeCompletionGenerator('order.status', opts)
      expect(gen.allowedValues()).to.eql(['ready', 'picked', 'packed', 'shipped'])
    })

    it('returns allowed values for a member expression in brackets', () => {
      let gen = new CodeCompletionGenerator('order["status"]', opts)
      expect(gen.allowedValues()).to.eql(['ready', 'picked', 'packed', 'shipped'])
    })

    it('returns undefined for a member without allowed values', () => {
      let gen = new CodeCompletionGenerator('order.id', opts)
      expect(gen.allowedValues()).to.be.undefined
    })

    it('returns undefined for an unknown member', () => {
      let gen = new CodeCompletionGenerator('order.bogus.attribute', opts)
      expect(gen.allowedValues()).to.be.undefined
    })
  })

  describe('.hasFunctionDefinition()', () => {
    it('returns true for a named function declaration', () => {
      expect(
        new CodeCompletionGenerator('function foo() { }', {singleExpression: false})
        .hasFunctionDefinition()
      ).to.be.true
    })

    it('returns true for a var assigned a function', () => {
      expect(
        new CodeCompletionGenerator('var foo = function () { }', {singleExpression: false})
        .hasFunctionDefinition()
      ).to.be.true
    })

    it('returns true for a let function assignment', () => {
      expect(
        new CodeCompletionGenerator('let foo = function () { }', {singleExpression: false})
        .hasFunctionDefinition()
      ).to.be.true
    })

    it('returns true for a const function assignment', () => {
      expect(
        new CodeCompletionGenerator('const foo = function () { }', {singleExpression: false})
        .hasFunctionDefinition()
      ).to.be.true
    })

    it('return false for anything else', () => {
      expect(
        new CodeCompletionGenerator("foo()\nbar()", {singleExpression: false})
        .hasFunctionDefinition()
      ).to.be.false
    })
  })

  describe(".firstDefinedFunctionName()", () => {
    it('identifies function declaration names', () => {
      expect(
        new CodeCompletionGenerator('function foo() { }', {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('foo')
    })

    it('identifies functions assigned to a var', () => {
      expect(
        new CodeCompletionGenerator('var bar = function () { }', {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('bar')
    })

    it('identifies functions assigned with a let', () => {
      expect(
        new CodeCompletionGenerator('let bar = function () { }', {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('bar')
    })

    it('identifies functions assigned to a const', () => {
      expect(
        new CodeCompletionGenerator('const bar = function () { }', {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('bar')
    })

    it('ignores subsequent definitions', () => {
      expect(
        new CodeCompletionGenerator("function foo() { }\nfunction bar() { }", {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('foo')
    })

    it('uses the first of any type of definition', () => {
      expect(
        new CodeCompletionGenerator("let foo = function() { }\nfunction bar() { }", {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('foo')
    })

    it('ignores other statements', () => {
      expect(
        new CodeCompletionGenerator("let x = 0\nlet y = 1\nfunction foo() { }", {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.eql('foo')
    })

    it('returns undefined when none is found', () => {
      expect(
        new CodeCompletionGenerator("foo()\nbar()", {singleExpression: false})
        .firstDefinedFunctionName()
      ).to.be.undefined
    })
  })

  describe('.firstDefinedFunctionReturnsFor()', () => {
    context('when the function references external code', () => {
      let blocks = [{
        name: 'shout',
        definition: 'function shout(value) { return value.toUpperCase() }'},
      {
        name: 'mark',
        definition: 'function mark() { }'
      }]

      it('includes the required function definition', () => {
        let gen = new CodeCompletionGenerator(
          'function mark(value) { return shout(`${value}!`) }',
          {blocks, singleExpression: false}
        )
        expect(gen.firstDefinedFunctionReturnsFor("'what?'")).to.eql('WHAT?!')
      })
    })
  })
})

// limited view of the _path property for testing
function path(gen) {
  function pathProps(obj) {
    if (null !== obj && 'object' === typeof obj) {
      let out = {}
      if (obj.hasOwnProperty('name')) out.name = obj.name
      if (obj.hasOwnProperty('index')) out.index = obj.index
      if (obj.hasOwnProperty('var')) out.var = obj.var
      if (obj.of) out.of = pathProps(obj.of)
      return out
    } else {
      return obj
    }
  }

  return pathProps(gen._path)
}
