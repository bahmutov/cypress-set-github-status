# cypress-set-github-status ![cypress version](https://img.shields.io/badge/cypress-9.3.1-brightgreen)

> A little Cypress plugin for setting GitHub commit status

![GitHub checks sent from the tests in another repo](./images/checks.png)

## Install

```
$ npm i -D cypress-set-github-status
```

## Use

Register this plugin in your plugin file. Pick the GitHub owner and repo to send the status checks to. To pass the commit SHA you can use either an environment variable `TEST_COMMIT` or pass it via Cypress `--env testCommit=...` argument. For access, use [GitHub personal token](https://github.com/settings/tokens).

```js
// cypress/plugins/index.js
module.exports = (on, config) => {
  // when we are done, post the status to GitHub
  // application repo, using the passed commit SHA
  // https://github.com/bahmutov/cypress-set-github-status
  require('cypress-set-github-status')(on, config, {
    owner: 'bahmutov',
    repo: 'todomvc-no-tests-vercel',
    commit: config.env.testCommit || process.env.TEST_COMMIT,
    token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
  })
}
```

## Small print

Author: Gleb Bahmutov &copy; 2022

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog/)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)
