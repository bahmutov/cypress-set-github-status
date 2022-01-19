// @ts-check
const debug = require('debug')('cypress-set-github-status')
const { setGitHubCommitStatus } = require('./utils')

function getContext() {
  let context = 'Cypress tests'
  if (process.env.CIRCLE_NODE_INDEX && process.env.CIRCLE_NODE_TOTAL) {
    // index starts with 0
    const machineIndex = Number(process.env.CIRCLE_NODE_INDEX) + 1
    const totalMachines = Number(process.env.CIRCLE_NODE_TOTAL)
    context += ` (machine ${machineIndex}/${totalMachines})`
  }
  return context
}

function registerPlugin(on, config, options = {}) {
  debug('options %o', options)

  const testCommit =
    options.commit || config.env.testCommit || process.env.TEST_COMMIT

  if (testCommit && options.owner && options.repo) {
    const owner = options.owner
    const repo = options.repo

    console.log('after finishing the test run will report the results')
    console.log('as a status check %s/%s commit %s', owner, repo, testCommit)

    const envOptions = {
      token: options.token,
    }
    const context = getContext()

    on('before:run', async (runResults) => {
      // put the target repo information into the options

      const options = {
        owner,
        repo,
        commit: testCommit,
        status: 'pending',
        description: 'Tests running',
        context,
        targetUrl: process.env.CIRCLE_BUILD_URL,
      }

      await setGitHubCommitStatus(options, envOptions)
    })

    on('after:run', async (runResults) => {
      const options = {
        owner,
        repo,
        commit: testCommit,
        status: runResults.totalFailed > 0 ? 'failure' : 'success',
        description: `${runResults.totalTests} tests finished`,
        context,
        targetUrl: runResults.runUrl || process.env.CIRCLE_BUILD_URL,
      }
      await setGitHubCommitStatus(options, envOptions)
    })
  }
}

module.exports = registerPlugin
