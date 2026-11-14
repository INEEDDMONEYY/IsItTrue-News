
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { createCaseFile, getCaseFileActors } from '../api/caseFiles.api'
import type {
  CaseFileActor,
  CaseFileCategory,
  CaseFilePriority,
  CaseFileAccessLevel,
  CreateCaseFileInput,
} from '../types/caseFile.types'
import {
  validateCreateCaseFileInput,
  hasCaseFileValidationErrors,
} from '../utils/caseFileValidation'

const categories: { value: CaseFileCategory; label: string }[] = [
  { value: 'politics', label: 'Politics' },
  { value: 'government', label: 'Government' },
  { value: 'business', label: 'Business' },
  { value: 'public-safety', label: 'Public Safety' },
  { value: 'health', label: 'Health' },
  { value: 'technology', label: 'Technology' },
  { value: 'environment', label: 'Environment' },
  { value: 'education', label: 'Education' },
  { value: 'international', label: 'International' },
  { value: 'social-issues', label: 'Social Issues' },
  { value: 'other', label: 'Other' },
]

const priorities: { value: CaseFilePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const accessLevels: { value: CaseFileAccessLevel; label: string }[] = [
  { value: 'internal', label: 'Internal' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'confidential', label: 'Confidential' },
]

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-800'

const labelClass =
  'mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

const initialForm: CreateCaseFileInput = {
  title: '',
  summary: '',
  description: '',
  category: 'other',
  priority: 'normal',
  accessLevel: 'internal',
  leadInvestigatorId: '',
  assignedToIds: [],
  tags: [],
  dueDate: '',
}

export function CreateCaseFilesPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<CreateCaseFileInput>(initialForm)
  const [actors, setActors] = useState<CaseFileActor[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [loadingActors, setLoadingActors] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    async function loadActors() {
      try {
        const result = await getCaseFileActors()

        if (active) {
          setActors(result)
        }
      } catch {
        if (active) {
          setError('Unable to load investigators. Please try again.')
        }
      } finally {
        if (active) {
          setLoadingActors(false)
        }
      }
    }

    void loadActors()

    return () => {
      active = false
    }
  }, [])

  const updateField = <K extends keyof CreateCaseFileInput>(
    field: K,
    value: CreateCaseFileInput[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setError('')
  }

  const handleAssigneeChange = (actorId: string, checked: boolean) => {
    const current = form.assignedToIds ?? []

    updateField(
      'assignedToIds',
      checked
        ? [...current, actorId]
        : current.filter((id) => id !== actorId),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const payload: CreateCaseFileInput = {
      ...form,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      dueDate: form.dueDate || undefined,
    }

    const validationErrors = validateCreateCaseFileInput(payload)

    if (hasCaseFileValidationErrors(validationErrors)) {
      setErrors(validationErrors as Record<string, string>)
      return
    }

    setSaving(true)

    try {
      const created = await createCaseFile(payload)
      navigate(`/admin/case-files/${created.id}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create the case file. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const investigators = actors.filter(
    (actor) =>
      actor.type === 'investigator' ||
      actor.type === 'author' ||
      actor.type === 'editor' ||
      actor.type === 'admin',
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Link
          to="/admin/case-files"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Case Files
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
            Create Case File
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create a central workspace for an investigation, its evidence, and
            related reporting.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Case Information
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Provide the basic details and scope of this case.
            </p>
          </div>

          <div className="grid gap-5">
            <div>
              <label htmlFor="title" className={labelClass}>
                Case Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Enter a descriptive case title"
                className={inputClass}
                required
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="summary" className={labelClass}>
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                rows={3}
                value={form.summary}
                onChange={(event) =>
                  updateField('summary', event.target.value)
                }
                placeholder="Write a concise summary of this case"
                className={inputClass}
                required
              />
              {errors.summary && (
                <p className="mt-1 text-xs text-red-500">{errors.summary}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder="Describe the background, objectives, and scope of the case"
                className={inputClass}
                required
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className={labelClass}>
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      'category',
                      event.target.value as CaseFileCategory,
                    )
                  }
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className={labelClass}>
                  Priority
                </label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(event) =>
                    updateField(
                      'priority',
                      event.target.value as CaseFilePriority,
                    )
                  }
                  className={inputClass}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="accessLevel" className={labelClass}>
                  Access Level
                </label>
                <select
                  id="accessLevel"
                  value={form.accessLevel}
                  onChange={(event) =>
                    updateField(
                      'accessLevel',
                      event.target.value as CaseFileAccessLevel,
                    )
                  }
                  className={inputClass}
                >
                  {accessLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                  Controls the intended visibility of this case file.
                </p>
              </div>

              <div>
                <label htmlFor="dueDate" className={labelClass}>
                  Target Due Date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate ?? ''}
                  onChange={(event) =>
                    updateField('dueDate', event.target.value)
                  }
                  className={inputClass}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="tags" className={labelClass}>
                Tags
              </label>
              <input
                id="tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="investigation, public records, verification"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Separate tags with commas.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Investigation Team
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Assign a lead investigator and optional team members.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="leadInvestigator" className={labelClass}>
                Lead Investigator <span className="text-red-500">*</span>
              </label>
              <select
                id="leadInvestigator"
                value={form.leadInvestigatorId}
                onChange={(event) =>
                  updateField('leadInvestigatorId', event.target.value)
                }
                className={inputClass}
                required
                disabled={loadingActors}
              >
                <option value="">
                  {loadingActors
                    ? 'Loading investigators...'
                    : 'Select a lead investigator'}
                </option>
                {investigators.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} — {actor.role}
                  </option>
                ))}
              </select>
              {errors.leadInvestigatorId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.leadInvestigatorId}
                </p>
              )}
              {!loadingActors && investigators.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No eligible team members were returned by the API.
                </p>
              )}
            </div>

            <div>
              <p className={labelClass}>Additional Team Members</p>
              {loadingActors ? (
                <p className="text-sm text-neutral-500">
                  Loading available team members...
                </p>
              ) : investigators.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No additional team members are available.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {investigators
                    .filter(
                      (actor) => actor.id !== form.leadInvestigatorId,
                    )
                    .map((actor) => (
                      <label
                        key={actor.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      >
                        <input
                          type="checkbox"
                          checked={(form.assignedToIds ?? []).includes(
                            actor.id,
                          )}
                          onChange={(event) =>
                            handleAssigneeChange(
                              actor.id,
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded border-neutral-300 accent-neutral-900 dark:accent-white"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-neutral-900 dark:text-white">
                            {actor.name}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">
                            {actor.role}
                          </span>
                        </span>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/case-files"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || loadingActors || investigators.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Creating Case File...' : 'Create Case File'}
          </button>
        </div>
      </form>
    </div>
  )
}
