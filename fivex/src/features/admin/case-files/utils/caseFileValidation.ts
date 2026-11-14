
import type {
  CreateCaseFileInput,
  UpdateCaseFileInput,
} from '../types/caseFile.types'

export type CaseFileValidationErrors = Partial<
  Record<keyof CreateCaseFileInput, string>
>

const MAX_TITLE_LENGTH = 160
const MAX_SUMMARY_LENGTH = 300
const MAX_DESCRIPTION_LENGTH = 10000
const MAX_TAGS = 15
const MAX_TAG_LENGTH = 40

const isValidDate = (value: string): boolean =>
  !Number.isNaN(new Date(value).getTime())

export const validateCreateCaseFileInput = (
  input: CreateCaseFileInput,
): CaseFileValidationErrors => {
  const errors: CaseFileValidationErrors = {}

  const title = input.title?.trim() || ''
  const summary = input.summary?.trim() || ''
  const description = input.description?.trim() || ''

  if (!title) {
    errors.title = 'A case-file title is required.'
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`
  }

  if (!summary) {
    errors.summary = 'A summary is required.'
  } else if (summary.length > MAX_SUMMARY_LENGTH) {
    errors.summary = `Summary cannot exceed ${MAX_SUMMARY_LENGTH} characters.`
  }

  if (!description) {
    errors.description = 'A description is required.'
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
  }

  if (!input.category) {
    errors.category = 'Select a case-file category.'
  }

  if (!input.priority) {
    errors.priority = 'Select a priority level.'
  }

  if (!input.accessLevel) {
    errors.accessLevel = 'Select an access level.'
  }

  if (!input.leadInvestigatorId?.trim()) {
    errors.leadInvestigatorId = 'Assign a lead investigator.'
  }

  if (input.tags && input.tags.length > MAX_TAGS) {
    errors.tags = `A maximum of ${MAX_TAGS} tags is allowed.`
  }

  if (input.tags?.some((tag) => tag.trim().length > MAX_TAG_LENGTH)) {
    errors.tags = `Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`
  }

  if (input.dueDate && !isValidDate(input.dueDate)) {
    errors.dueDate = 'Enter a valid due date.'
  }

  return errors
}

export const validateUpdateCaseFileInput = (
  input: UpdateCaseFileInput,
): CaseFileValidationErrors => {
  const errors: CaseFileValidationErrors = {}

  if (input.title !== undefined) {
    const title = input.title.trim()

    if (!title) {
      errors.title = 'A case-file title is required.'
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`
    }
  }

  if (input.summary !== undefined) {
    const summary = input.summary.trim()

    if (!summary) {
      errors.summary = 'A summary is required.'
    } else if (summary.length > MAX_SUMMARY_LENGTH) {
      errors.summary = `Summary cannot exceed ${MAX_SUMMARY_LENGTH} characters.`
    }
  }

  if (input.description !== undefined) {
    const description = input.description.trim()

    if (!description) {
      errors.description = 'A description is required.'
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
    }
  }

  if (
    input.leadInvestigatorId !== undefined &&
    !input.leadInvestigatorId.trim()
  ) {
    errors.leadInvestigatorId = 'Assign a lead investigator.'
  }

  if (input.tags && input.tags.length > MAX_TAGS) {
    errors.tags = `A maximum of ${MAX_TAGS} tags is allowed.`
  }

  if (input.tags?.some((tag) => tag.trim().length > MAX_TAG_LENGTH)) {
    errors.tags = `Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`
  }

  if (input.dueDate && !isValidDate(input.dueDate)) {
    errors.dueDate = 'Enter a valid due date.'
  }

  return errors
}

export const hasCaseFileValidationErrors = (
  errors: CaseFileValidationErrors,
): boolean => Object.keys(errors).length > 0
