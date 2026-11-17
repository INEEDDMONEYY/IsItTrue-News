import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { updateArticleAssigneeSchema } from '../validations/article.validation.js'

describe('updateArticleAssigneeSchema', () => {
  it('accepts a valid user id', () => {
    const result = updateArticleAssigneeSchema.safeParse({ assigneeId: '64b7f0c2a1b2c3d4e5f60718' })
    assert.equal(result.success, true)
  })

  it('accepts null to clear the assignment', () => {
    const result = updateArticleAssigneeSchema.safeParse({ assigneeId: null })
    assert.equal(result.success, true)
  })

  it('rejects a malformed user id', () => {
    const result = updateArticleAssigneeSchema.safeParse({ assigneeId: 'not-an-id' })
    assert.equal(result.success, false)
  })

  it('rejects a missing assigneeId', () => {
    const result = updateArticleAssigneeSchema.safeParse({})
    assert.equal(result.success, false)
  })
})
