function formatJSON(payload) {
	try {
		let j = isString(payload) ? JSON.parse(payload) : payload
		return JSON.stringify(j, null, 2)
	} catch {
		return payload
	}
}
module.exports.formatJSON = formatJSON

function isString(val) {
  return (('string' === typeof val) || (val instanceof String))
}
module.exports.isString = isString

function memoize(fn) {
  let wrapper = function (...args) {
    let result = fn.apply(this, args)
    wrapper = () => result
    return result
  }

  return function(...args) { return wrapper.apply(this, args) }
}
module.exports.memoize = memoize

// Limit the number of calls to a function with a wait period. The ms
// argument can be a value or a function that returns one.
function debounce(fn, ms = 0) {
  let timer = null
  let lastResult = undefined
  function delay(withThis) {
    return 'function' === typeof ms ? ms.call(withThis) : ms
  }

  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = null
      lastResult = fn.apply(this, args)
    }, delay(this))

    return lastResult
  }
}
module.exports.debounce = debounce

// Perform a fetch call that returns JSON.
// Takes the same arguments as fetch and parses the response body. If the
// call returns a non-2XX status, rejects with the most descriptive error
// available in the response. This is for calls that follow our most
// common API pattern. If you need more granular control over response
// parsing or status code handing, use fetch directly.
async function fetchJSON(...args) {
  let body = null
  const response = await fetch(...args)

  try {
    body = await response.json()
  } catch (err) {
    console.warn('[fetchJSON] could not parse JSON response:', err)
  }

  if (response.ok) {
    return body
  }

  if (body) {
    if (body.hasOwnProperty('errors') && Array.isArray(body.errors)) {
      throw new Error(body.errors.join("\n"))
    } else if (body.hasOwnProperty('errors') && body.errors.hasOwnProperty('full_messages')) {
      throw new Error(body.errors.full_messages.join("\n"))
    } else if (body.hasOwnProperty('errors')) {
      throw new Error(body.errors)
    } else if (body.hasOwnProperty('error') && typeof(body.error) == 'string') {
      throw new Error(body.error)
    }
  }

  throw new Error(response.statusText)
}
module.exports.fetchJSON = fetchJSON
