/// <reference types="cypress" />

import { findJsonComment } from '../../src/json-utils'
import { stripIndent } from 'common-tags'

const commentBody = stripIndent`
comment start

<!-- label 1

-->

something else

<!-- label 2

{
  "name": "joe"
}

-->

comment end
`

it('finds the label 2 JSON', () => {
  const result = findJsonComment(commentBody, 'label 2')
  expect(result.json).to.deep.equal({ name: 'joe' })
})
