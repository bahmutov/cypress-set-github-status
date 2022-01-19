#!/usr/bin/env node

const debug = require('debug')('cypress-set-github-status')
const arg = require('arg')
const { setGitHubCommitStatus } = require('../src/index')

const args = arg({
  '--owner': String,
  '--repo': String,
  '--commit': String,

  // commit status fields
  // https://docs.github.com/en/rest/reference/commits#commit-statuses
  '--status': String,
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
  if (!env.GITHUB_TOKEN) {
    console.error('Cannot find environment variable GITHUB_TOKEN')
    process.exit(1)
  }
}

checkEnvVariables(process.env)

const options = {
  owner: args['--owner'],
  repo: args['--repo'],
  commit: args['--commit'],
  // status fields
  status: args['--status'],
  description: args['--description'] || 'Tests finished',
  targetUrl: args['--target-url'],
  context: args['--context'] || 'Cypress tests',
}
const envOptions = {
  token: process.env.GITHUB_TOKEN,
}

setGitHubCommitStatus(options, envOptions).catch((e) => {
  console.error(e)
  process.exit(1)
})
