const got = require('got')
const debug = require('debug')('cypress-set-github-status')
const details = require('debug')('cypress-set-github-status:details')
const { findJsonComment, replaceJsonComment } = require('./json-utils')

/**
 * @typedef {Object} JsonCommentOptions
 * @property {string} owner
 * @property {string} repo
 * @property {number} comment
 * @property {string} [token] DO NOT USE, pass it as the second argument instead
 */

/**
 * @typedef {function(Object): (Object|Promise<Object>)} jsonUpdateCallback
 */

/**
 * Initializes access to the given comment on GitHub
 * @param {JsonCommentOptions} options Repo, owner, and comment ID
 * @param {string} token GitHub token for authentication
 */
function setupJsonComment(options, token) {
  debug('setup json comment access')

  // create github client using env options
  if (options.token) {
    console.error('you have accidentally included the token in the options')
    console.error('please use the second environment options object instead')
    delete options.token
  }

  if (!options.comment) {
    throw new Error('options.comment is required')
  }

  // Here you would add the logic to interact with the GitHub API
  // to add or update the comment with ID options.comment
  // Note: the comment must exist
  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/issues/comments/${options.comment}`
  debug('setup access via comment url: %s', url)

  const authorization = `Bearer ${token}`

  return async function getJsonComment(label) {
    try {
      // @ts-ignore
      const res = await got.get(url, {
        headers: {
          authorization,
        },
      })
      const comment = JSON.parse(res.body)
      // debug('existing comment: %o', comment)
      // debug('existing comment body\n%s', comment.body)

      /**
       * Updates the JSON content of the comment with the given label.
       * If there is no existing JSON with the given label, the argument
       * will be undefined
       *
       * @param {jsonUpdateCallback} updateFn Function that receives the current JSON and returns the updated JSON
       * @returns {Promise<void>}
       */
      async function updateJsonComment(updateFn) {
        const found = findJsonComment(comment.body, label)

        debug('looked for JSON for label %s: %o', label, {
          start: found.start,
          end: found.end,
        })
        details(found)

        const updated = await updateFn(found.json)
        if (updated === undefined) {
          throw new Error('updateFn must return a value')
        }
        if (updated === null) {
          throw new Error('updateFn must not return null')
        }

        debug('updated JSON for label %s', label)
        details(updated)

        const newBody = replaceJsonComment(comment.body, found, updated)
        const body = JSON.stringify({ body: newBody })
        await got.patch(url, {
          headers: {
            authorization,
            'content-type': 'application/json',
          },
          body,
        })
        debug('comment %s updated successfully', label)
        return updated
      }

      return updateJsonComment
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }
}

module.exports = setupJsonComment

// @ts-ignore
if (!module.parent) {
  async function testJsonComment() {
    const getJsonComment = setupJsonComment(
      {
        owner: 'bahmutov',
        repo: 'cypress-set-github-status',
        comment: 3184190647,
      },
      process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
    )

    const update = await getJsonComment('label123')
    await update((json) => {
      if (!json) {
        return {
          counter: 1,
        }
      }

      if ('counter' in json) {
        json.counter++
      } else {
        json.counter = 1
      }
      return json
    })
  }

  testJsonComment().catch((err) => {
    console.error(err)
  })
}
