const { expect } = require('chai')
const { stripTags } = require('../../lib/html-utils')

describe('stripTags()', () => {

  it('strips end tags', () => {
    expect(stripTags('text</tag>')).to.eql('text')
  })

  it('strips end tags with extraneous space', () => {
    expect(stripTags('text</ tag  >')).to.eql('text')
  })

  it('strips opening tags', () => {
    expect(stripTags('<tag>text')).to.eql('text')
  })

  it('strips opening tags with extraneous space', () => {
    expect(stripTags('< tag >text')).to.eql('text')
  })

  it('strips self-closing tags', () => {
    expect(stripTags('<tag/>text')).to.eql('text')
  })

  it('strips self-closing tags with extraneous space', () => {
    expect(stripTags('< tag />text')).to.eql('text')
  })

  it('strips opening tags with attributes', () => {
    expect(stripTags('<tag attr="value">text')).to.eql('text')
  })

  it('strips opening tags with single quote style attributes', () => {
    expect(stripTags('<tag attr=\'value\'>text')).to.eql('text')
  })

  it('strips opening tags with bare value style attributes', () => {
    expect(stripTags('<tag attr=value>text')).to.eql('text')
  })

  it('strips opening tags with flag style attributes', () => {
    expect(stripTags('<tag attr>text')).to.eql('text')
  })

  it('strips opening tags with attributes that have extraneous space', () => {
    expect(stripTags('<tag attr = "value" >text')).to.eql('text')
  })

  it('strips opening tags with multiple attributes', () => {
    expect(stripTags('<tag attr1="value1" attr2="value2">text')).to.eql('text')
  })

  it('strips multiple tags', () => {
    expect(stripTags('some<br /> <b><i>text</b></i>')).to.eql('some text')
  })

})
