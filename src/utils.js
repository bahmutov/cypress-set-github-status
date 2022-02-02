// @ts-check
const got = require('got')
const debug = require('debug')('cypress-set-github-status')

const validStatuses = ['pending', 'success', 'failure', 'error']

function validateCommonOptions(options, envOptions) {
  if (!options.owner) {
    throw new Error('options.owner is required')
  }
  if (!options.repo) {
    throw new Error('options.repo is required')
  }
  if (!envOptions.token) {
    throw new Error('envOptions.token is required')
  }
}

async function getPullRequest(options, envOptions) {
  if (!options.pull) {
    throw new Error('options.pull number is required')
  }

  // https://docs.github.com/en/rest/reference/pulls#get-a-pull-request
  // https://api.github.com/repos/bahmutov/todomvc-no-tests-vercel/pulls/10
  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/pulls/${options.pull}`
  debug('url: %s', url)

  // @ts-ignore
  const res = await got.get(url, {
    headers: {
      authorization: `Bearer ${envOptions.token}`,
      accept: 'application/vnd.github.v3+json',
    },
  })

  const json = JSON.parse(res.body)
  return json
}

// assume we do need to authenticate to fetch the pull request body
async function getPullRequestBody(options, envOptions) {
  if (options.token) {
    console.error('you have accidentally included the token in the options')
    console.error('please use the second environment options object instead')
    delete options.token
  }

  debug('getting pull request body: %o', options)

  validateCommonOptions(options, envOptions)

  const json = await getPullRequest(options, envOptions)
  return json.body
}

/** Gets the pull request number (if any) from the GITHUB_* variables */
function getPullRequestNumber() {
  if (process.env.GITHUB_WORKFLOW !== 'pr') {
    return
  }
  // something like "GITHUB_REF=refs/pull/5/merge"
  const parts = process.env.GITHUB_REF.split('/')
  if (parts.length !== 4) {
    console.error(
      'Do not know how to split GITHUB_REF: %s',
      process.env.GITHUB_REF,
    )
    return
  }

  debug('parsing GITHUB_REF "%s" part "%s"', process.env.GITHUB_REF, parts[2])
  return parseInt(parts[2], 10)
}

function checkCommonOptions(options, envOptions) {
  if (options.token) {
    console.error('you have accidentally included the token in the options')
    console.error('please use the second environment options object instead')
    delete options.token
  }

  validateCommonOptions(options, envOptions)

  if (!validStatuses.includes(options.status)) {
    console.error(
      'options.status was invalid "%s" must be one of: %o',
      options.status,
      validStatuses,
    )
    throw new Error('Invalid options.status')
  }
}

async function setGitHubCommitStatus(options, envOptions) {
  checkCommonOptions(options, envOptions)

  if (!options.commit) {
    throw new Error('options.commit is required')
  }

  debug('setting commit status: %o', options)

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
    options.description ? options.description : '',
  )
  console.log('response status: %d %s', res.statusCode, res.statusMessage)
}

function isLineChecked(line) {
  return line.includes('[x]')
}

/**
 * @param {string} pullRequestBody The pull request text with checkboxes
 */
function getTestsToRun(pullRequestBody) {
  const testsToRun = {
    all: false,
    tags: [],
  }
  const lines = pullRequestBody.split('\n')
  lines.forEach((line) => {
    if (line.includes('all tests') && isLineChecked(line)) {
      testsToRun.all = true
    }
    if (line.includes('@sanity') && isLineChecked(line)) {
      testsToRun.tags.push('@sanity')
    }
    if (line.includes('@user') && isLineChecked(line)) {
      testsToRun.tags.push('@user')
    }
  })
  return testsToRun
}

async function setCommonStatus(context, options, envOptions) {
  checkCommonOptions(options, envOptions)

  debug('setting the common commit status "%s" %o', context, options)

  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/commits/${options.commit}/status`
  debug('url: %s', url)

  // @ts-ignore
  const res = await got.get(url, {
    headers: {
      authorization: `Bearer ${envOptions.token}`,
    },
  })
  const statuses = JSON.parse(res.body).statuses || []
  debug('commit statuses %o', statuses)
  const existingStatus = statuses.find((status) => status.context === context)
  if (!existingStatus || existingStatus.state === 'pending') {
    debug('there is no existing status: %s', context)
    await setGitHubCommitStatus(
      {
        ...options,
        context,
        description: 'Test results',
      },
      envOptions,
    )
  } else {
    console.log(
      'commit %s has "%s" current status %s, adding %s',
      options.commit,
      context,
      existingStatus.state,
      options.status,
    )
    if (existingStatus.state === options.status) {
      debug('nothing to do, the status is the same')
    } else if (
      existingStatus.state === 'success' &&
      options.status === 'failure'
    ) {
      debug('updating the common status to %s', options.status)
      await setGitHubCommitStatus(
        {
          ...options,
          context,
          description: 'Test results',
        },
        envOptions,
      )
    }
  }
}

module.exports = {
  setGitHubCommitStatus,
  getPullRequestBody,
  getTestsToRun,
  setCommonStatus,
  getPullRequestNumber,
}

// @ts-ignore
if (!module.parent) {
  setCommonStatus(
    'Cypress E2E tests',
    {
      owner: 'bahmutov',
      repo: 'todomvc-no-tests-vercel',
      commit: 'f9399541332866512e4adea333a6a3018629e8d4',
      status: 'failure',
    },
    {
      token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
    },
  ).catch((err) => {
    console.error(err)
  })
}
