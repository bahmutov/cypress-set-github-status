/// <reference types="cypress" />
// @ts-check
const debug = require('debug')('cypress-set-github-status')
const {
  setGitHubCommitStatus,
  setCommonStatus,
  addOrUpdateComment,
} = require('./utils')
const pluralize = require('pluralize')

function getContext() {
  let context = process.env.COMMIT_CONTEXT || 'Cypress tests'
  if (process.env.CIRCLE_NODE_INDEX && process.env.CIRCLE_NODE_TOTAL) {
    // index starts with 0
    const machineIndex = Number(process.env.CIRCLE_NODE_INDEX) + 1
    const totalMachines = Number(process.env.CIRCLE_NODE_TOTAL)
    context += ` (machine ${machineIndex}/${totalMachines})`
  } else if (
    'MACHINES_TOTAL' in process.env &&
    'MACHINES_INDEX' in process.env
  ) {
    debug('getting the index and total from MACHINES_INDEX and MACHINES_TOTAL')
    // index starts with zero
    const machineIndex = Number(process.env.MACHINES_INDEX) + 1
    const totalMachines = Number(process.env.MACHINES_TOTAL)
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

  const commentId =
    options.comment || config.env.commentId || process.env.COMMENT_ID
  debug('test commit %s comment id %s', testCommit, commentId)

  if (options.owner && options.repo) {
    if (testCommit) {
      debug('have the commit %s', testCommit)

      const owner = options.owner
      const repo = options.repo

      console.log('after finishing the test run will report the results')
      console.log('as a status check %s/%s commit %s', owner, repo, testCommit)

      const envOptions = {
        token: options.token,
      }
      const context = getContext()
      debug('context "%s"', context)

      on('before:run', async (runResults) => {
        // put the target repo information into the options

        const ghOptions = {
          owner,
          repo,
          commit: testCommit,
          status: 'pending',
          description: 'Tests running',
          context,
          targetUrl: process.env.CIRCLE_BUILD_URL,
        }

        await setGitHubCommitStatus(ghOptions, envOptions)

        if (commentId) {
          if (runResults.runUrl) {
            // add a comment with the link to the test run
            const commentOptions = {
              owner,
              repo,
              comment: Number(commentId),
              text: `Cypress test run at ${runResults.runUrl}`,
            }
            const result = await addOrUpdateComment(commentOptions, envOptions)
            debug('addOrUpdateComment result %o', result)
            if (result === 'comment updated') {
              console.log(
                'Updated existing comment with ID %d, added link to the test run %s',
                commentOptions.comment,
                runResults.runUrl,
              )
            }
          }
        }
      })

      on('after:spec', (spec, results) => {
        debug('spec finished')
        debug(spec)
        debug('results')
        debug(results)
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
}

module.exports = registerPlugin
