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
    return {
      label,
      json: null,
      start: -1,
      end: -1,
    }
  }

  return {
    label,
    json: JSON.parse(match[1]),
    start: match.index,
    end: match.index + match[0].length,
  }
}

/**
 * @param {string} body The original comment body
 * @param {JsonCommentResult} found The result from findJsonComment
 * @param {object} newJson The new JSON object to replace the old one with
 * @returns {string} The updated comment body with the replaced JSON
 */
function replaceJsonComment(body, found, newJson) {
  const stringified = JSON.stringify(newJson, null, 2)

  // if there is no found comment, append the new comment at the end
  if (found.start === -1) {
    return `${body}\n\n<!-- ${found.label}\n\n${stringified}\n\n-->`
  }

  // replace the existing JSON comment with the new one
  return (
    body.slice(0, found.start) +
    `<!-- ${found.label}\n\n${stringified}\n\n-->` +
    body.slice(found.end)
  )
}

module.exports = { findJsonComment, replaceJsonComment }
