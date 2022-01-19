const got = require('got')
const debug = require('debug')('cypress-set-github-status')

const validStatuses = ['pending', 'success', 'failure', 'error']

async function setGitHubCommitStatus(options, envOptions) {
  if (options.token) {
    console.error('you have accidentally included the token in the options')
    console.error('please use the second environment options object instead')
    delete options.token
  }

  debug('setting commit status: %o', options)

  if (!options.owner) {
    throw new Error('options.owner is required')
  }
  if (!options.repo) {
    throw new Error('options.repo is required')
  }
  if (!validStatuses.includes(options.status)) {
    console.error(
      'options.status was invalid "%s" must be one of: %o',
      options.status,
      validStatuses,
    )
    throw new Error('Invalid options.status')
  }

  if (!envOptions.token) {
    throw new Error('envOptions.token is required')
  }

  // REST call to GitHub API
  // https://docs.github.com/en/rest/reference/commits#commit-statuses
  // https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#example-calling-the-rest-api
  // a typical request would be like:
  // curl --request POST \
  // --url https://api.github.com/repos/${{ github.repository }}/statuses/${{ github.sha }} \
  // --header 'authorization: Bearer ${{ secrets.GITHUB_TOKEN }}' \
  // --header 'content-type: application/json' \
  // --data '{
  //     "state": "success",
  //     "description": "REST commit status",
  //     "context": "a test"
  //   }'
  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/statuses/${options.commit}`
  debug('url: %s', url)

  // @ts-ignore
  const res = await got.post(url, {
    headers: {
      authorization: `Bearer ${envOptions.token}`,
    },
    json: {
      context: options.context,
      state: options.status,
      description: options.description,
      target_url: options.targetUrl,
    },
  })
  console.log(
    'set commit %s status %s with %s %s',
    options.commit,
    options.status,
    options.context,
    options.description,
  )
  console.log('response status: %d %s', res.statusCode, res.statusMessage)
}

module.exports = { setGitHubCommitStatus }
