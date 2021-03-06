/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // include this plugin before cypress-grep
  // so if we find the test tags in the pull request body
  // we can grep for them by setting the grep config
  require('../../src')(on, config, {
    // let's take this repo
    owner: 'bahmutov',
    repo: 'cypress-set-github-status',
    commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA,
    token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
    // when finished the test run, after reporting its machine status
    // also set or update the common final status
    commonStatus: process.env.COMMON_STATUS || 'Cypress E2E tests',
  })

  // https://github.com/bahmutov/cypress-grep
  require('cypress-grep/src/plugin')(config)

  // cypress-grep could modify the config (the list of spec files)
  // thus it is important to return the modified config to Cypress
  return config
}
