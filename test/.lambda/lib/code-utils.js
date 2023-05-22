function readCodePoint(input, pos) {
  if (input.charAt(pos) === '{') {
    ++pos
    const endPos = input.indexOf('}', pos)
    if (endPos === -1) throw new Error("Invalid escape sequence")
    return [String.fromCodePoint(parseInt(input.slice(pos, endPos), 16)), endPos + 1]
  } else {
    return [String.fromCharCode(parseInt(input.slice(pos, pos + 4), 16)), pos + 4]
  }
}

function readEscape(input, pos) {
  let ch = input.charCodeAt(++pos)
  ++pos
  switch (ch) {
    case 98: return ["\b", pos] // b
    case 102: return ["\f", pos] // f
    case 110: return ["\n", pos] // n
    case 114: return ["\r", pos] // r
    case 116: return ["\t", pos] // t
    case 117: return readCodePoint(input, pos) // u
    case 118: return ["\u000b", pos] // v
    case 120: return [String.fromCharCode(parseInt(input.slice(pos, pos + 2), 16)), pos + 2] // x
    case 13:
      if (input.charCodeAt(pos) === 10) ++pos // CR - fall through
    case 10: return ["", pos] // LF
    default:
      if (ch >= 48 && ch <= 55) { // octal number
        --pos
        let match = /^[0-7]{1,4}/.exec(input.slice(pos))
        pos += match[0].length
        return [String.fromCharCode(parseInt(match[0], 8)), pos]
      } else {
        return [String.fromCharCode(ch), pos]
      }
  }
}

function nextString(input, quote) {
  const backslash = "\\".charCodeAt(0)
  let out = ''
  let start = 0
  let pos = 0
  let ch;

  for (;;) {
    if (pos >= input.length) throw new Error("Unterminated string literal")
    let code = input.charCodeAt(pos)
    if (code === quote) break
    if (code === backslash) {
      out += input.slice(start, pos);
      [ch, pos] = readEscape(input, pos)
      out += ch
      start = pos
    } else {
      ++pos
    }
  }

  if (pos === input.length - 1) {
    return [out + input.slice(start, pos), null]
  } else {
    return [out + input.slice(start, pos), input.slice(pos + 1)]
  }
}

function nextPathStep(path) {
  let matchData;

  if (matchData = /^\s*([$A-Z_a-z][$0-9A-Z_a-z\u0080-\uffff]*)\s*([.[])/.exec(path)) {
    if (matchData[2] == '[') {
      return [matchData[1], path.slice(matchData[0].length - 1)]
    } else {
      return [matchData[1], path.slice(matchData[0].length)]
    }
  } else if (matchData = /^\s*\[\s*(['"])/.exec(path)) {
    let [name, remainder] = nextString(
        path.slice(matchData[0].length),
        matchData[1].charCodeAt(0)
    )
    if (matchData = /^\s*\]\s*\.?\s*/.exec(remainder)) {
      if (remainder.length === matchData[0].length) {
        return [name, null]
      } else {
        return [name, remainder.slice(matchData[0].length)]
      }
    } else {
      throw new Error("Unterminated property access bracket")
    }
  } else {
    return [String(path || '').trim(), null]
  }
}
module.exports.nextPathStep = nextPathStep

function isIdentifierStartCode(code) {
  if (code < 36) return false
  if (36 === code) return true // $
  if (code < 65) return false // A
  if (code < 91) return true // [
  if (95 === code) return true // _
  if (code < 97) return false // a
  if (code < 123) return true // {
  if (code >= 170) return identifierStartCharRE.test(String.fromCodePoint(code))
  return false
}

function isIdentifierCode(code) {
  if (code < 36) return false
  if (36 === code) return true // $
  if (code < 48) return false // 0
  if (code < 58) return true // :
  if (code < 65) return false // A
  if (code < 91) return true // [
  if (95 === code) return true // _
  if (code < 97) return false // a
  if (code < 123) return true // {
  if (code >= 170) return identifierCharRE.test(String.fromCodePoint(code))
  return false
}

function sanitizedIdentifier(value, replacementChar = '') {
  let out = ''
  let start = 0
  let pos = 0
  const len = value.length

  for (; pos < len; ) {
    for (; pos < len && isIdentifierCode(value.charCodeAt(pos)); ++pos) ;
    out += value.substring(start, pos)
    if (pos < len) out += replacementChar
    for (; pos < len && !isIdentifierCode(value.charCodeAt(pos)); ++pos) ;
    start = pos
  }
  out += value.substring(start, pos)

  if (!isIdentifierStartCode(out.charCodeAt(0))) {
    if (isIdentifierStartCode(replacementChar.charCodeAt(0))) {
      out = replacementChar + out
    } else {
      out = '_' + out
    }
  }

  return out
}
module.exports.sanitizedIdentifier = sanitizedIdentifier

function fieldSpecAtPath(schema, path) {
  const [field, rest] = nextPathStep(path);
  if (!field) {
    return undefined
  }
  const spec = ((schema || {}).fields || {})[field];
  if (rest) {
    return fieldSpecAtPath(spec.type, rest)
  } else {
    return spec
  }
}
module.exports.fieldSpecAtPath = fieldSpecAtPath

const identifierStartCharRE = /[_$]|\p{L}/u
const identifierCharRE = /[_$\u200c\u200d]|\p{L}|\p{Mn}|\p{Nd}|\p{Pc}/u
// plus \uXXXX sequences for reference:
const identifierStartPartRE = /[_$]|\p{L}|\\u(?:[0-9A-Fa-f]{4}|\{[0-9A-Fa-f]+\})/u
const identifierPartRE = /[_$\u200c\u200d]|\p{L}|\p{Mn}|\p{Nd}|\p{Pc}|\\u(?:[0-9A-Fa-f]{4}|\{[0-9A-Fa-f]+\})/u
