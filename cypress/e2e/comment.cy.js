/// <reference types="cypress" />

import { findJsonComment, replaceJsonComment } from '../../src/json-utils'
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

const jackCommentBody = stripIndent`
comment start

<!-- label1

-->

something else

<!-- label2

{
  "name": "jack"
}

-->

comment end
`

// with appended jack object
const label3CommentBody = stripIndent`
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

<!-- label3

{
  "name": "jack"
}

-->
`

describe('findJsonComment', () => {
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
})

describe('replaceJsonComment', () => {
  it('replaces an existing JSON comment', () => {
    const found = findJsonComment(commentBody, 'label2')
    const newBody = replaceJsonComment(commentBody, found, { name: 'jack' })
    expect(newBody, 'replaced').to.equal(jackCommentBody)
  })

  it('adds a new JSON comment if not found', () => {
    const found = findJsonComment(commentBody, 'label3')
    const newBody = replaceJsonComment(commentBody, found, { name: 'jack' })
    expect(newBody, 'appended').to.equal(label3CommentBody)
  })
})
