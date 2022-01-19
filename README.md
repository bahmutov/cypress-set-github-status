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

## Examples

- [bahmutov/todomvc-tests-circleci](https://github.com/bahmutov/todomvc-tests-circleci)

## Small print

Author: Gleb Bahmutov &copy; 2022

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog/)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-set-github-status/issues) on Github

## MIT License

Copyright (c) 2022 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
