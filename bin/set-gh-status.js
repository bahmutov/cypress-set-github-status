#!/usr/bin/env node

const debug = require('debug')('cypress-set-github-status')
const arg = require('arg')
const { setGitHubCommitStatus } = require('../src/utils')

const args = arg({
  '--owner': String,
  '--repo': String,
  '--commit': String,

  // commit status fields
  // https://docs.github.com/en/rest/reference/commits#commit-statuses
  '--status': String,
  // alternative: set the commit status based on GH job outcome
  '--outcome': String,
  '--description': String,
  '--target-url': String,
  '--context': String,

  // aliases
  '-o': '--owner',
  '-r': '--repo',
  '-c': '--commit',
  '--sha': '--commit',
  '-s': '--status',
})
debug('args: %o', args)

function checkEnvVariables(env) {
  if (!env.GITHUB_TOKEN && !env.PERSONAL_GH_TOKEN) {
    console.error(
      'Cannot find environment variable GITHUB_TOKEN or PERSONAL_GH_TOKEN',
    )
    process.exit(1)
  }
}

checkEnvVariables(process.env)

function getCommitStatus(status, jobOutcome) {
  debug('commit status from status %s or outcome %s', status, jobOutcome)
  if (status) {
    return status
  }
  const outcomeToStatus = {
    success: 'success',
    failure: 'failure',
    canceled: 'error',
    skipped: 'error',
  }
  const pickedStatus = outcomeToStatus[jobOutcome] || 'error'
  debug('picked status %s', pickedStatus)

  return pickedStatus
}

const options = {
  owner: args['--owner'],
  repo: args['--repo'],
  commit: args['--commit'],

  // status fields
  // alternative: set the commit status based on GitHub job outcome
  status: getCommitStatus(args['--status'], args['--outcome']),

  description: args['--description'] || 'Tests finished',
  targetUrl: args['--target-url'],
  context: args['--context'] || 'Cypress tests',
}
const envOptions = {
  token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
}

setGitHubCommitStatus(options, envOptions).catch((e) => {
  console.error(e)
  process.exit(1)
})
