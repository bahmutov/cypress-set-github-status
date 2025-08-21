#!/usr/bin/env node

const debug = require('debug')('cypress-set-github-status')
const arg = require('arg')
const { addOrUpdateComment } = require('../src/utils')

const args = arg({
  '--owner': String,
  '--repo': String,
  '--comment': Number,
  // text to include in the comment
  '--text': String,

  // aliases
  '-o': '--owner',
  '-r': '--repo',
  '-c': '--comment',
  '-t': '--text',
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

const options = {
  owner: args['--owner'],
  repo: args['--repo'],
  comment: args['--comment'],
  text: args['--text'],
}
const envOptions = {
  token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
}

addOrUpdateComment(options, envOptions)
  .then((result) => {
    switch (result) {
      case 'nothing to do': {
        console.log('Comment already contains the text, nothing to do')
        break
      }
      case 'comment updated': {
        console.log('Comment updated with new text')
        break
      }
      default: {
        console.log('Hmm, unknown result from addOrUpdateComment: %s', result)
        break
      }
    }
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
