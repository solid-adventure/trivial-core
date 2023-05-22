const { expect } = require('chai')
const { nextPathStep, sanitizedIdentifier } = require('../../lib/code-utils')

describe('nextPathStep()', () => {

  it('returns a name and null for a single step', () => {
    expect(nextPathStep("foo")).to.eql(["foo", null])
  })

  it('trims white space from a single step', () => {
    expect(nextPathStep("  foo ")).to.eql(["foo", null])
  })

  it('returns the first name in a dot-separated path', () => {
    expect(nextPathStep("foo.bar")).to.eql(["foo", "bar"])
  })

  it('permits unicode characters', () => {
    expect(nextPathStep("fóôøお.bar")).to.eql(["fóôøお", "bar"])
  })

  it('trims white space from a dot-separated path', () => {
    expect(nextPathStep("  foo . bar")).to.eql(["foo", " bar"])
  })

  it('returns the first name in a bracket-separated path', () => {
    expect(nextPathStep("foo['bar']")).to.eql(["foo", "['bar']"])
  })

  it('parses single quote strings in brackets', () => {
    expect(nextPathStep("['foo'].bar")).to.eql(["foo", "bar"])
  })

  it('parses double quote strings in brackets', () => {
    expect(nextPathStep("[\"foo\"]['bar']")).to.eql(["foo", "['bar']"])
  })

  it('parses escape sequences in strings', () => {
    expect(nextPathStep("[\"\\t-\\n-\\\"-\\x13-\\u304a-\\\\-\\41\"].bar")).to.eql(
      ["\t-\n-\"-\x13-お-\\-!", "bar"]
    )
  })

  it('permits brackets to terminate a path', () => {
    expect(nextPathStep("['bar']")).to.eql(["bar", null])
  })

})

describe("sanitizedIdentifier()", () => {

  it('returns the input for a valid identifier', () => {
    expect(sanitizedIdentifier('foo')).to.eql('foo')
  })

  it('replaces invalid characters', () => {
    expect(sanitizedIdentifier('*foo++bar-baz?')).to.eql('foobarbaz')
  })

  it('accepts non-ASCII values', () => {
    expect(sanitizedIdentifier('フオオ')).to.eql('フオオ')
  })

  it('ensures the identifier begins with a valid character', () => {
    expect(sanitizedIdentifier('00foo')).to.eql('_00foo')
  })

  it('accepts a custom replacement value', () => {
    expect(sanitizedIdentifier('++00foo++bar', '$')).to.eql('$00foo$bar')
  })

})
