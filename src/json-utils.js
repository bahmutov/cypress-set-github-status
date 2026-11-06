/**
 * @typedef {object} JsonCommentResult
 * @property {string} label The label of the JSON comment
 * @property {object} json The parsed JSON object
 * @property {number} start The start index of the JSON comment in the body
 * @property {number} end The end index of the JSON comment in the body
 */

/**
 * @param {string} body The comment body to search within
 * @param {string} label The label to find the JSON for
 * @returns {JsonCommentResult} The result containing the label, parsed JSON, and start index
 */
function findJsonComment(body, label) {
  // check if the label has any spaces and throw an error
  if (/\s/.test(label)) {
    throw new Error(`Label "${label}" cannot contain spaces`)
  }

  const match = body.match(new RegExp(`<!-- ${label}\\s*([\\s\\S]*?)-->`))
  if (!match) {
    throw new Error(`Label "${label}" not found`)
  }
  return {
    label,
    json: JSON.parse(match[1]),
    start: match.index,
    end: match.index + match[0].length,
  }
}

module.exports = { findJsonComment }
