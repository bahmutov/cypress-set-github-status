const got = require('got')
const debug = require('debug')('cypress-set-github-status')

/**
 * @typedef {Object} JsonCommentOptions
 * @property {string} owner
 * @property {string} repo
 * @property {number} comment
 * @property {string} [token] DO NOT USE, pass it as the second argument instead
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

  return async function getJsonComment() {
    try {
      // @ts-ignore
      const res = await got.get(url, {
        headers: {
          authorization,
        },
      })
      const comment = JSON.parse(res.body)
      console.log(comment)
      // debug('existing comment: %o', comment)
      debug('existing comment body\n%s', comment.body)
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }
}

module.exports = setupJsonComment

// @ts-ignore
if (!module.parent) {
  const getJsonComment = setupJsonComment(
    {
      owner: 'bahmutov',
      repo: 'cypress-set-github-status',
      comment: 3184190647,
    },
    process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
  )
  getJsonComment().catch((err) => {
    console.error(err)
  })
}
