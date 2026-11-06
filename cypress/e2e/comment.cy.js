/// <reference types="cypress" />

import { findJsonComment } from '../../src/json-utils'
import { stripIndent } from 'common-tags'
import spok from 'cy-spok'

const commentBody = stripIndent`
comment start

<!-- label1

-->

something else

<!-- label2

{
  "name": "joe"
}

-->

comment end
`

it('finds the label 2 JSON', () => {
  const result = findJsonComment(commentBody, 'label2')
  spok({
    label: 'label2',
    json: {
      name: 'joe',
    },
    start: 49,
    end: 86,
  })(result)
})

it('returns default for missing label', () => {
  const result = findJsonComment(commentBody, 'label3')
  spok({
    label: 'label3',
    json: null,
    start: -1,
    end: -1,
  })(result)
})
