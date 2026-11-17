import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { EDITORIAL_DEADLINE_DAYS, resolveEditorialDeadline } from '../constants/editorialDeadline.js'
import { updateEditorialWorkflowSchema } from '../../modules/articles/validations/article.validation.js'

const DAY_MS = 24 * 60 * 60 * 1000

describe('resolveEditorialDeadline', () => {
  const now = new Date('2026-03-10T15:45:00Z')

  it('sets a 30-day deadline from the start of the current UTC day on a new stage', () => {
    const deadline = resolveEditorialDeadline({ previousStage: 'reviewing', nextStage: 'scheduled', now })
    assert.equal(deadline.toISOString(), '2026-04-09T00:00:00.000Z')
    assert.equal(deadline.getTime() - Date.UTC(2026, 2, 10), EDITORIAL_DEADLINE_DAYS * DAY_MS)
  })

  it('keeps the existing deadline when the stage is unchanged, so re-saving cannot extend it', () => {
    const previousDeadline = new Date('2026-03-20T00:00:00Z')
    const deadline = resolveEditorialDeadline({
      previousStage: 'reviewing',
      previousDeadline: previousDeadline,
      nextStage: 'reviewing',
      now,
    })
    assert.equal(deadline, previousDeadline)
  })

  it('starts a new window when an unchanged stage has no stored deadline', () => {
    const deadline = resolveEditorialDeadline({ previousStage: 'reviewing', previousDeadline: null, nextStage: 'reviewing', now })
    assert.equal(deadline.toISOString(), '2026-04-09T00:00:00.000Z')
  })
})

describe('updateEditorialWorkflowSchema', () => {
  it('accepts the three editor-settable article stages', () => {
    for (const editorialStage of ['reviewing', 'fact_checking', 'scheduled']) {
      assert.equal(updateEditorialWorkflowSchema.safeParse({ editorialStage }).success, true)
    }
  })

  it('rejects stages editors cannot set, including published', () => {
    for (const editorialStage of ['draft', 'submitted', 'published']) {
      assert.equal(updateEditorialWorkflowSchema.safeParse({ editorialStage }).success, false)
    }
  })

  it('strips client-supplied deadlines, which the server now computes', () => {
    const result = updateEditorialWorkflowSchema.safeParse({
      editorialStage: 'reviewing',
      editorialDeadline: '2026-01-01T00:00:00Z',
    })
    assert.equal(result.success, true)
    assert.equal('editorialDeadline' in (result.data as object), false)
  })
})
