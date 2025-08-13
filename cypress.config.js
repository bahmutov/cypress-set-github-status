const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    // place the E2E variables into e2e block
    // https://glebbahmutov.com/blog/cypress-v10-env/
    env: {
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // include this plugin before cypress-grep
      // so if we find the test tags in the pull request body
      // we can grep for them by setting the grep config
      const commit = process.env.COMMIT_SHA || process.env.GITHUB_SHA
      const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN
      const commonStatus = process.env.COMMON_STATUS || 'Cypress E2E tests'

      require('./src')(on, config, {
        // let's take this repo
        owner: 'bahmutov',
        repo: 'cypress-set-github-status',
        commit,
        token,
        // when finished the test run, after reporting its machine status
        // also set or update the common final status
        commonStatus,
      })

      // https://github.com/bahmutov/cypress-grep
      require('cypress-grep/src/plugin')(config)

      // cypress-grep could modify the config (the list of spec files)
      // thus it is important to return the modified config to Cypress
      return config
    },
  },
})
