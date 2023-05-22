const NAME_RE = `[:A-Z_a-z\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}][\\-.0-9:A-Z_a-z\\xB7\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02FF\\u0300-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u203F-\\u2040\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}]*`
const END_TAG_RE = `(?:</\\s*${NAME_RE}\\s*>)`
const ATTRIBUTE_VALUE_RE = `(?:"[^"]*"|'[^']*'|${NAME_RE})`
const ATTRIBUTE_RE = `${NAME_RE}(?:\\s*=\\s*${ATTRIBUTE_VALUE_RE})?`
const START_TAG_RE = `(?:<\\s*${NAME_RE}\\s*(?:${ATTRIBUTE_RE}\\s*)*\\/?>)`
const TAG_RE = new RegExp(`${END_TAG_RE}|${START_TAG_RE}`, 'mug')


function stripTags(html) {
  return String(html || '').replace(TAG_RE, '')
}
module.exports.stripTags = stripTags
