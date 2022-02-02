/// <reference types="cypress" />
// @ts-check
const debug = require('debug')('cypress-set-github-status')
const { setGitHubCommitStatus, setCommonStatus } = require('./utils')
const pluralize = require('pluralize')

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

/**
 * @param {Cypress.PluginEvents} on Function for registering event handlers
 */
function registerPlugin(on, config, options = {}) {
  debug('options %o', options)

  const testPullRequest =
    options.pull ||
    config.env.pull ||
    config.env.pullRequest ||
    config.env.pullRequestNumber ||
    process.env.TEST_PULL_REQUEST_NUMBER

  if (testPullRequest) {
    const testPullRequestNumber = Number(testPullRequest)
    console.log(
      'picking the tests to run based on PR number %d',
      testPullRequestNumber,
    )
  }

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
      const status = runResults.totalFailed > 0 ? 'failure' : 'success'
      const description = `${pluralize(
        'spec',
        runResults.runs.length,
        true,
      )}: ${runResults.totalPassed} passed, ${runResults.totalFailed} failed, ${
        runResults.totalPending + runResults.totalSkipped
      } other tests`
      const targetUrl = runResults.runUrl || process.env.CIRCLE_BUILD_URL

      const commitOption = {
        owner,
        repo,
        commit: testCommit,
        status,
        description,
        context,
        targetUrl,
      }
      await setGitHubCommitStatus(commitOption, envOptions)

      if (options.commonStatus) {
        if (typeof options.commonStatus !== 'string') {
          throw new Error(`Expected commonStatus to be a string`)
        }
        await setCommonStatus(options.commonStatus, commitOption, envOptions)
      }
    })
  }
}

module.exports = registerPlugin
