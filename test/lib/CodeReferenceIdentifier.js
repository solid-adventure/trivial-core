const { expect } = require('chai')
const CodeReferenceIdentifier = require('../../lib/CodeReferenceIdentifier')

describe('CodeReferenceIdentifer', () => {

  describe('constructor', () => {
    it('succeeds for a valid expression', () => {
      expect(new CodeReferenceIdentifier('let x = 1'))
        .to.be.an.instanceOf(CodeReferenceIdentifier)
    })

    it('throws an error for an invalid expression', () => {
      expect(() => new CodeReferenceIdentifier('let x = ]'))
        .to.throw('Unexpected token')
    })
  })

  describe('.externalReferences()', () => {
    const references = e => new CodeReferenceIdentifier(e).externalReferences()

    it('returns an array of undeclared references made', () => {
      expect(references("let x = alpha()\nlet y = beta")).to.eql(['alpha','beta'])
    })

    it('identifies references in returns', () => {
      expect(references("() => { return ref }")).to.eql(['ref'])
    })

    it('identifies references in if statements', () => {
      expect(references("if (ref) ;")).to.eql(['ref'])
    })

    it('identifies references in switch statements', () => {
      expect(references("switch (x) { case y: break; }")).to.eql(['x', 'y'])
    })

    it('identifies references in throw statements', () => {
      expect(references("throw ref")).to.eql(['ref'])
    })

    it('identifies references in while statements', () => {
      expect(references("while (ref) ;")).to.eql(['ref'])
    })

    it('identifies references in do / while statements', () => {
      expect(references("do ; while(ref)")).to.eql(['ref'])
    })

    it('identifies references in for statements', () => {
      expect(references("for (x; y; z) ;")).to.eql(['x', 'y', 'z'])
    })

    it('identifies references in for / in statements', () => {
      expect(references("for (x in y) ;")).to.eql(['x', 'y'])
    })

    it('identifies references in array expressions', () => {
      expect(references("[x, y]")).to.eql(['x', 'y'])
    })

    it('identifies references in object expressions', () => {
      expect(references("let x = {y: alpha, z: beta}")).to.eql(['alpha', 'beta'])
    })

    it('supports object expressions with implied keys', () => {
      expect(references("let x = { alpha }")).to.eql(['alpha'])
    })

    it('identifies references in unary expressions', () => {
      expect(references("!x")).to.eql(['x'])
    })

    it('identifies references in update expressions', () => {
      expect(references("x++")).to.eql(['x'])
    })

    it('identifies references in binary expressions', () => {
      expect(references("x = y + z")).to.eql(['x', 'y', 'z'])
    })

    it('identifies references in logical expressions', () => {
      expect(references("x || y")).to.eql(['x', 'y'])
    })

    it('identifies references in member expressions', () => {
      expect(references("let x = alpha.y.z")).to.eql(['alpha'])
    })

    it('identifies references in member bracket expressions', () => {
      expect(references("let x = alpha.y[beta]")).to.eql(['alpha', 'beta'])
    })

    it('identifies references in ternary expressions', () => {
      expect(references("x ? y : z")).to.eql(['x', 'y', 'z'])
    })

    it('identifies references in function calls', () => {
      expect(references("x(y, z)")).to.eql(['x', 'y', 'z'])
    })

    it('identifies references in new expressions', () => {
      expect(references("new x(y, z)")).to.eql(['x', 'y', 'z'])
    })

    it('identifies references in sequence expressions', () => {
      expect(references("for(x, y; ;) ;")).to.eql(['x', 'y'])
    })

    it('identifies a bare reference', () => {
      expect(references("ref")).to.eql(['ref'])
    })

    it('identifies a bare reference when parsed as an expression', () => {
      const { Parser } = require('acorn')
      const p = new Parser({ecmaVersion: 6}, 'ref')
      p.nextToken()
      const ast = p.parseExpression()
      const references = new CodeReferenceIdentifier(ast).externalReferences()
      expect(references).to.eql(['ref'])
    })

    // ES6 extensions

    it('identifies references in for / of statements', () => {
      expect(references("for (x in y) ;")).to.eql(['x', 'y'])
    })

    it('identifies references in spread expressions', () => {
      expect(references("x(y, ...z)")).to.eql(['x', 'y', 'z'])
      expect(references("let x = [alpha, ...beta]")).to.eql(['alpha', 'beta'])
    })

    it('identifies references in arrow expressions', () => {
      expect(references("let x = (y) => alpha")).to.eql(['alpha'])
    })

    it('identifies references in yield expressions', () => {
      expect(references("function* x() { yield alpha }")).to.eql(['alpha'])
    })

    it('identifies references in string templates', () => {
      expect(references("`_${x}_`")).to.eql(['x'])
    })

    // identifiers defined in the expression

    it('excludes variables declared in the expression', () => {
      expect(references("let x = 0\nlet y = x")).not.to.include('x')
    })

    it('excludes functions declared in the expression', () => {
      expect(references("function x() { }\nlet y = x()")).not.to.include('x')
    })

    it('excludes function parameters declared in the expression', () => {
      expect(references("function x(y) { return y }")).not.to.include('y')
    })

    xit('excludes classes declared in the expression', () => {
      expect(references("class X { }\nlet y = new X()")).not.to.include('X')
    })

    xit('excludes method parameters declared in the expression', () => {
      expect(references("class X { y(z) { return z } }")).not.to.include('z')
    })

    // global definitions

    it('excludes builtins', () => {
      expect(references("let x = Array(1, 2, 3)")).not.to.include('Array')
    })

    it('excludes global functions', () => {
      expect(references("let x = setTimeout(() => 1, 1)")).not.to.include('setTimeout')
    })

    it('excludes node.js globals', () => {
      expect(references("let x = process.env.X")).not.to.include('process')
    })
  })

})
