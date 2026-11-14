
import type {
  CaseFile,
  CaseFileActor,
  CaseFileAssignment,
  CaseFileCategory,
  CaseFileListResponse,
  CaseFileQueryParams,
  CaseFileSummary,
  CreateCaseFileInput,
  UpdateCaseFileInput,
} from '../types/caseFile.types'

const USE_MOCK_DATA = true
const API_BASE_URL = '/api/admin/case-files'

const daysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const actors: Record<string, CaseFileActor> = {
  admin: {
    id: 'user-admin-01',
    name: 'Adonis Hines',
    email: 'adonis@isittrue.com',
    role: 'Super Administrator',
    type: 'admin',
  },
  editor: {
    id: 'user-editor-01',
    name: 'Sarah Mitchell',
    email: 'sarah@isittrue.com',
    role: 'Managing Editor',
    type: 'editor',
  },
  editorTwo: {
    id: 'user-editor-02',
    name: 'James Carter',
    email: 'james@isittrue.com',
    role: 'Senior Editor',
    type: 'editor',
  },
  author: {
    id: 'user-author-01',
    name: 'Michael Brooks',
    email: 'michael@isittrue.com',
    role: 'Investigative Author',
    type: 'author',
  },
  investigator: {
    id: 'user-investigator-01',
    name: 'Olivia Bennett',
    email: 'olivia@isittrue.com',
    role: 'Investigator',
    type: 'investigator',
  },
  system: {
    id: 'system',
    name: 'IITNews System',
    email: 'system@isittrue.com',
    role: 'System',
    type: 'system',
  },
}

const createAssignment = (
  actor: CaseFileActor,
  days: number,
): CaseFileAssignment => ({
  id: actor.id,
  name: actor.name,
  email: actor.email,
  role: actor.role,
  assignedAt: daysAgo(days),
})

const mockCaseFiles: CaseFile[] = [
  {
    id: 'case-1001',
    reference: 'CF-2026-001',
    title: 'Public Infrastructure Contract Investigation',
    slug: 'public-infrastructure-contract-investigation',
    summary:
      'An investigation into concerns surrounding the awarding and oversight of a major public infrastructure contract.',
    description:
      'This case examines the procurement process, contract disclosures, public spending records, and accountability measures associated with a major infrastructure project. The investigation is intended to establish a verified timeline and identify any documented irregularities.',
    category: 'government',
    status: 'active',
    priority: 'critical',
    accessLevel: 'restricted',
    investigationId: 'investigation-001',
    investigationTitle: 'Infrastructure Procurement Review',
    leadInvestigator: actors.investigator,
    assignedTo: [
      createAssignment(actors.investigator, 12),
      createAssignment(actors.author, 10),
    ],
    relatedArticles: [
      {
        id: 'article-201',
        title: 'Questions Raised Over Public Infrastructure Contract',
        type: 'Article',
        status: 'draft',
      },
    ],
    evidence: [
      {
        id: 'evidence-301',
        title: 'Public Procurement Records',
        type: 'Document',
        status: 'Under Review',
      },
      {
        id: 'evidence-302',
        title: 'Contract Award Timeline',
        type: 'Timeline',
        status: 'Verified',
      },
    ],
    media: [
      {
        id: 'media-401',
        title: 'Infrastructure Project Site',
        type: 'Image',
        status: 'Available',
      },
    ],
    sources: [
      {
        id: 'source-501',
        title: 'Public Procurement Database',
        type: 'Public Record',
        status: 'Verified',
      },
    ],
    factChecks: [],
    tags: ['public spending', 'infrastructure', 'procurement'],
    timeline: [
      {
        id: 'event-1001',
        type: 'created',
        title: 'Case file created',
        description: 'The case file was opened for investigation.',
        actor: actors.investigator,
        createdAt: daysAgo(12),
      },
      {
        id: 'event-1002',
        type: 'evidence-added',
        title: 'Evidence added',
        description: 'Public procurement records were added to the case.',
        actor: actors.author,
        createdAt: daysAgo(8),
      },
      {
        id: 'event-1003',
        type: 'review',
        title: 'Editorial review requested',
        description: 'The case was submitted for an initial editorial review.',
        actor: actors.editor,
        createdAt: daysAgo(3),
      },
    ],
    createdBy: actors.investigator,
    updatedBy: actors.editor,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
    dueDate: daysAgo(-10),
  },
  {
    id: 'case-1002',
    reference: 'CF-2026-002',
    title: 'Corporate Environmental Compliance Review',
    slug: 'corporate-environmental-compliance-review',
    summary:
      'Reviewing public environmental compliance records and claims made by a large industrial operator.',
    description:
      'This case brings together regulatory filings, environmental assessments, public statements, and independent source material to evaluate claims about environmental compliance.',
    category: 'environment',
    status: 'under-review',
    priority: 'high',
    accessLevel: 'internal',
    investigationId: 'investigation-002',
    investigationTitle: 'Industrial Environmental Accountability',
    leadInvestigator: actors.author,
    assignedTo: [
      createAssignment(actors.author, 18),
      createAssignment(actors.editorTwo, 14),
    ],
    relatedArticles: [
      {
        id: 'article-202',
        title: 'Examining Corporate Environmental Claims',
        type: 'Article',
        status: 'In Editorial Review',
      },
    ],
    evidence: [
      {
        id: 'evidence-303',
        title: 'Environmental Compliance Filing',
        type: 'Document',
        status: 'Verified',
      },
    ],
    media: [
      {
        id: 'media-402',
        title: 'Facility Inspection Photographs',
        type: 'Image Collection',
        status: 'Available',
      },
    ],
    sources: [
      {
        id: 'source-502',
        title: 'Environmental Regulatory Records',
        type: 'Government Database',
        status: 'Verified',
      },
    ],
    factChecks: [
      {
        id: 'fact-check-601',
        title: 'Company Environmental Compliance Statement',
        type: 'Fact Check',
        status: 'Pending',
      },
    ],
    tags: ['environment', 'corporate accountability'],
    timeline: [
      {
        id: 'event-1004',
        type: 'created',
        title: 'Case file created',
        description: 'The case was opened for documentation and review.',
        actor: actors.author,
        createdAt: daysAgo(18),
      },
      {
        id: 'event-1005',
        type: 'source-added',
        title: 'Regulatory source linked',
        description: 'Environmental regulatory records were linked.',
        actor: actors.editorTwo,
        createdAt: daysAgo(7),
      },
    ],
    createdBy: actors.author,
    updatedBy: actors.editorTwo,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
    dueDate: daysAgo(-5),
  },
  {
    id: 'case-1003',
    reference: 'CF-2026-003',
    title: 'Public Health Information Verification',
    slug: 'public-health-information-verification',
    summary:
      'Examining widely circulated public health claims against available research and authoritative documentation.',
    description:
      'This case organizes the claims, supporting research, expert commentary, and source material needed to evaluate public health information circulating online.',
    category: 'health',
    status: 'active',
    priority: 'high',
    accessLevel: 'internal',
    leadInvestigator: actors.editor,
    assignedTo: [
      createAssignment(actors.editor, 9),
      createAssignment(actors.author, 6),
    ],
    relatedArticles: [],
    evidence: [
      {
        id: 'evidence-304',
        title: 'Published Research Collection',
        type: 'Research',
        status: 'Under Review',
      },
    ],
    media: [],
    sources: [
      {
        id: 'source-503',
        title: 'Public Health Research Archive',
        type: 'Research Database',
        status: 'Verified',
      },
    ],
    factChecks: [
      {
        id: 'fact-check-602',
        title: 'Public Health Claim Review',
        type: 'Fact Check',
        status: 'In Progress',
      },
    ],
    tags: ['public health', 'research', 'verification'],
    timeline: [
      {
        id: 'event-1006',
        type: 'created',
        title: 'Case file created',
        description: 'The case was created following a review of submitted claims.',
        actor: actors.editor,
        createdAt: daysAgo(9),
      },
    ],
    createdBy: actors.editor,
    updatedBy: actors.editor,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
  },
  {
    id: 'case-1004',
    reference: 'CF-2026-004',
    title: 'Technology Data Privacy Claims',
    slug: 'technology-data-privacy-claims',
    summary:
      'Assessing claims about data collection practices and privacy disclosures in a consumer technology service.',
    description:
      'The case tracks public privacy disclosures, product documentation, technical statements, and other materials relevant to the claims being examined.',
    category: 'technology',
    status: 'draft',
    priority: 'normal',
    accessLevel: 'restricted',
    leadInvestigator: actors.editorTwo,
    assignedTo: [createAssignment(actors.editorTwo, 2)],
    relatedArticles: [],
    evidence: [],
    media: [],
    sources: [],
    factChecks: [],
    tags: ['technology', 'privacy', 'data protection'],
    timeline: [
      {
        id: 'event-1007',
        type: 'created',
        title: 'Draft case file created',
        description: 'An initial case file was created for assessment.',
        actor: actors.editorTwo,
        createdAt: daysAgo(2),
      },
    ],
    createdBy: actors.editorTwo,
    updatedBy: actors.editorTwo,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'case-1005',
    reference: 'CF-2026-005',
    title: 'Election Information and Public Claims',
    slug: 'election-information-and-public-claims',
    summary:
      'A review of election-related public claims, source material, and supporting documentation.',
    description:
      'This case organizes election-related claims and available public documentation. Any findings must be supported by traceable evidence and reviewed before publication.',
    category: 'politics',
    status: 'published',
    priority: 'critical',
    accessLevel: 'internal',
    investigationId: 'investigation-003',
    investigationTitle: 'Election Information Review',
    leadInvestigator: actors.editor,
    assignedTo: [
      createAssignment(actors.editor, 30),
      createAssignment(actors.investigator, 28),
    ],
    relatedArticles: [
      {
        id: 'article-203',
        title: 'What the Available Election Records Show',
        type: 'Article',
        status: 'Published',
      },
    ],
    evidence: [
      {
        id: 'evidence-305',
        title: 'Official Election Results',
        type: 'Public Record',
        status: 'Verified',
      },
    ],
    media: [
      {
        id: 'media-403',
        title: 'Election Results Graphics',
        type: 'Graphic',
        status: 'Published',
      },
    ],
    sources: [
      {
        id: 'source-504',
        title: 'Official Election Records',
        type: 'Government Record',
        status: 'Verified',
      },
    ],
    factChecks: [
      {
        id: 'fact-check-603',
        title: 'Election Results Claim',
        type: 'Fact Check',
        status: 'Verified',
      },
    ],
    tags: ['elections', 'public records', 'politics'],
    timeline: [
      {
        id: 'event-1008',
        type: 'created',
        title: 'Case file created',
        description: 'The case was opened for evidence collection.',
        actor: actors.editor,
        createdAt: daysAgo(30),
      },
      {
        id: 'event-1009',
        type: 'status-change',
        title: 'Case published',
        description: 'The case was approved for public access.',
        actor: actors.admin,
        createdAt: daysAgo(4),
      },
    ],
    createdBy: actors.editor,
    updatedBy: actors.admin,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(4),
  },
  {
    id: 'case-1006',
    reference: 'CF-2026-006',
    title: 'Education Funding Allocation Review',
    slug: 'education-funding-allocation-review',
    summary:
      'Examining available records and public statements about education funding allocations.',
    description:
      'This case brings together budget documents, public statements, and relevant reporting to assess how education funding decisions were made and communicated.',
    category: 'education',
    status: 'closed',
    priority: 'normal',
    accessLevel: 'internal',
    leadInvestigator: actors.author,
    assignedTo: [createAssignment(actors.author, 45)],
    relatedArticles: [],
    evidence: [
      {
        id: 'evidence-306',
        title: 'Education Budget Documents',
        type: 'Document',
        status: 'Reviewed',
      },
    ],
    media: [],
    sources: [
      {
        id: 'source-505',
        title: 'Public Education Budget Records',
        type: 'Public Record',
        status: 'Verified',
      },
    ],
    factChecks: [],
    tags: ['education', 'funding', 'public spending'],
    timeline: [
      {
        id: 'event-1010',
        type: 'created',
        title: 'Case file created',
        description: 'The case was opened for review.',
        actor: actors.author,
        createdAt: daysAgo(45),
      },
      {
        id: 'event-1011',
        type: 'closed',
        title: 'Case closed',
        description: 'The review was completed and the case was closed.',
        actor: actors.editor,
        createdAt: daysAgo(5),
      },
    ],
    createdBy: actors.author,
    updatedBy: actors.editor,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(5),
    closedAt: daysAgo(5),
  },
  {
    id: 'case-1007',
    reference: 'CF-2026-007',
    title: 'International Trade Statement Review',
    slug: 'international-trade-statement-review',
    summary:
      'Reviewing statements and public records concerning an international trade agreement.',
    description:
      'The case contains background materials, public statements, and source references relevant to an international trade agreement and related claims.',
    category: 'international',
    status: 'archived',
    priority: 'low',
    accessLevel: 'internal',
    leadInvestigator: actors.editorTwo,
    assignedTo: [],
    relatedArticles: [],
    evidence: [],
    media: [],
    sources: [],
    factChecks: [],
    tags: ['international', 'trade', 'policy'],
    timeline: [
      {
        id: 'event-1012',
        type: 'created',
        title: 'Case file created',
        description: 'The case was opened for preliminary research.',
        actor: actors.editorTwo,
        createdAt: daysAgo(90),
      },
      {
        id: 'event-1013',
        type: 'status-change',
        title: 'Case archived',
        description: 'The case was archived following an administrative review.',
        actor: actors.admin,
        createdAt: daysAgo(20),
      },
    ],
    createdBy: actors.editorTwo,
    updatedBy: actors.admin,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
  },
  {
    id: 'case-1008',
    reference: 'CF-2026-008',
    title: 'Consumer Financial Service Claims',
    slug: 'consumer-financial-service-claims',
    summary:
      'A preliminary review of consumer-facing financial service claims and supporting disclosures.',
    description:
      'This restricted case is intended to organize public-facing product claims, disclosures, consumer complaints, and available source material for further assessment.',
    category: 'business',
    status: 'active',
    priority: 'high',
    accessLevel: 'confidential',
    leadInvestigator: actors.investigator,
    assignedTo: [
      createAssignment(actors.investigator, 5),
      createAssignment(actors.editor, 4),
    ],
    relatedArticles: [],
    evidence: [
      {
        id: 'evidence-307',
        title: 'Consumer Disclosure Documents',
        type: 'Document',
        status: 'Restricted',
      },
    ],
    media: [],
    sources: [
      {
        id: 'source-506',
        title: 'Public Financial Disclosure Records',
        type: 'Public Record',
        status: 'Under Review',
      },
    ],
    factChecks: [],
    tags: ['consumer protection', 'financial services'],
    timeline: [
      {
        id: 'event-1014',
        type: 'created',
        title: 'Confidential case file created',
        description: 'A restricted case file was opened for preliminary review.',
        actor: actors.investigator,
        createdAt: daysAgo(5),
      },
      {
        id: 'event-1015',
        type: 'assignment',
        title: 'Editor assigned',
        description: 'An editor was assigned to support the review.',
        actor: actors.admin,
        createdAt: daysAgo(4),
      },
    ],
    createdBy: actors.investigator,
    updatedBy: actors.admin,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
]

let caseFiles = structuredClone(mockCaseFiles)

const cloneCaseFiles = (data: CaseFile[]): CaseFile[] =>
  structuredClone(data)

const matchesCategory = (
  caseFile: CaseFile,
  category: CaseFileCategory | 'all',
): boolean => category === 'all' || caseFile.category === category

const matchesFilters = (
  caseFile: CaseFile,
  params: CaseFileQueryParams,
): boolean => {
  const search = params.search.trim().toLowerCase()

  const matchesSearch =
    !search ||
    [
      caseFile.reference,
      caseFile.title,
      caseFile.summary,
      caseFile.description,
      caseFile.leadInvestigator.name,
      ...caseFile.tags,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search)

  const matchesStatus =
    params.status === 'all' || caseFile.status === params.status

  const matchesPriority =
    params.priority === 'all' || caseFile.priority === params.priority

  const matchesAccess =
    params.accessLevel === 'all' ||
    caseFile.accessLevel === params.accessLevel

  const matchesInvestigator =
    !params.investigatorId ||
    caseFile.leadInvestigator.id === params.investigatorId ||
    caseFile.assignedTo.some(
      (person) => person.id === params.investigatorId,
    )

  return (
    matchesSearch &&
    matchesStatus &&
    matchesCategory(caseFile, params.category) &&
    matchesPriority &&
    matchesAccess &&
    matchesInvestigator
  )
}

const filterAndSortCaseFiles = (
  data: CaseFile[],
  params: CaseFileQueryParams,
): CaseFile[] => {
  const filtered = data.filter((caseFile) =>
    matchesFilters(caseFile, params),
  )

  return filtered.sort((a, b) => {
    if (params.sortOrder === 'oldest') {
      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      )
    }

    if (params.sortOrder === 'recently-updated') {
      return (
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      )
    }

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    )
  })
}

const getMockSummary = (): CaseFileSummary => ({
  totalCases: caseFiles.length,
  activeCases: caseFiles.filter((item) => item.status === 'active').length,
  pendingReview: caseFiles.filter(
    (item) => item.status === 'under-review',
  ).length,
  closedCases: caseFiles.filter(
    (item) => item.status === 'closed',
  ).length,
  criticalCases: caseFiles.filter(
    (item) => item.priority === 'critical',
  ).length,
  confidentialCases: caseFiles.filter(
    (item) => item.accessLevel === 'confidential',
  ).length,
})

const request = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    throw new Error(
      errorBody?.message || 'Unable to complete the case file request.',
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const getCaseFiles = async (
  params: CaseFileQueryParams,
): Promise<CaseFileListResponse> => {
  if (!USE_MOCK_DATA) {
    const query = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>(
        (result, [key, value]) => {
          if (value !== undefined && value !== null) {
            result[key] = String(value)
          }
          return result
        },
        {},
      ),
    )

    return request<CaseFileListResponse>(
      `${API_BASE_URL}?${query.toString()}`,
    )
  }

  const filtered = filterAndSortCaseFiles(caseFiles, params)
  const total = filtered.length
  const pageSize = Math.max(1, params.pageSize)
  const totalPages = Math.ceil(total / pageSize)
  const page = Math.max(1, Math.min(params.page, totalPages || 1))
  const startIndex = (page - 1) * pageSize

  return {
    data: cloneCaseFiles(filtered.slice(startIndex, startIndex + pageSize)),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  }
}

export const getCaseFileById = async (
  id: string,
): Promise<CaseFile | null> => {
  if (!USE_MOCK_DATA) {
    return request<CaseFile>(`${API_BASE_URL}/${id}`)
  }

  const caseFile = caseFiles.find((item) => item.id === id)

  return caseFile ? cloneCaseFiles([caseFile])[0] : null
}

export const getCaseFileSummary = async (): Promise<CaseFileSummary> => {
  if (!USE_MOCK_DATA) {
    return request<CaseFileSummary>(`${API_BASE_URL}/summary`)
  }

  return getMockSummary()
}

export const getCaseFileActors = async (): Promise<CaseFileActor[]> => {
  if (!USE_MOCK_DATA) {
    return request<CaseFileActor[]>(`${API_BASE_URL}/actors`)
  }

  const uniqueActors = new Map<string, CaseFileActor>()

  caseFiles.forEach((caseFile) => {
    uniqueActors.set(caseFile.leadInvestigator.id, caseFile.leadInvestigator)

    caseFile.assignedTo.forEach((person) => {
      const actor = Object.values(actors).find(
        (item) => item.id === person.id,
      )

      if (actor) uniqueActors.set(actor.id, actor)
    })
  })

  return structuredClone(
    Array.from(uniqueActors.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  )
}

export const createCaseFile = async (
  input: CreateCaseFileInput,
): Promise<CaseFile> => {
  if (!USE_MOCK_DATA) {
    return request<CaseFile>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  const leadInvestigator = Object.values(actors).find(
    (actor) => actor.id === input.leadInvestigatorId,
  )

  if (!leadInvestigator) {
    throw new Error('The selected lead investigator could not be found.')
  }

  const now = new Date().toISOString()
  const id = `case-${Date.now()}`
  const slug = input.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const assignedTo = (input.assignedToIds || [])
    .map((actorId) =>
      Object.values(actors).find((actor) => actor.id === actorId),
    )
    .filter((actor): actor is CaseFileActor => Boolean(actor))
    .map((actor) => ({
      ...createAssignment(actor, 0),
      assignedAt: now,
    }))

  const newCaseFile: CaseFile = {
    id,
    reference: `CF-${new Date().getFullYear()}-${String(
      caseFiles.length + 1,
    ).padStart(3, '0')}`,
    title: input.title,
    slug,
    summary: input.summary,
    description: input.description,
    category: input.category,
    status: 'draft',
    priority: input.priority,
    accessLevel: input.accessLevel,
    investigationId: input.investigationId,
    leadInvestigator,
    assignedTo,
    relatedArticles: [],
    evidence: [],
    media: [],
    sources: [],
    factChecks: [],
    tags: input.tags || [],
    timeline: [
      {
        id: `event-${Date.now()}`,
        type: 'created',
        title: 'Case file created',
        description: 'The case file was created.',
        actor: actors.admin,
        createdAt: now,
      },
    ],
    createdBy: actors.admin,
    updatedBy: actors.admin,
    createdAt: now,
    updatedAt: now,
    dueDate: input.dueDate,
  }

  caseFiles = [newCaseFile, ...caseFiles]

  return cloneCaseFiles([newCaseFile])[0]
}

export const updateCaseFile = async (
  id: string,
  input: UpdateCaseFileInput,
): Promise<CaseFile> => {
  if (!USE_MOCK_DATA) {
    return request<CaseFile>(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  const index = caseFiles.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error('Case file not found.')
  }

  const existing = caseFiles[index]
  const leadInvestigator = input.leadInvestigatorId
    ? Object.values(actors).find(
        (actor) => actor.id === input.leadInvestigatorId,
      )
    : existing.leadInvestigator

  if (!leadInvestigator) {
    throw new Error('The selected lead investigator could not be found.')
  }

  const assignedTo = input.assignedToIds
    ? input.assignedToIds
        .map((actorId) =>
          Object.values(actors).find((actor) => actor.id === actorId),
        )
        .filter((actor): actor is CaseFileActor => Boolean(actor))
        .map((actor) => ({
          ...createAssignment(actor, 0),
          assignedAt: new Date().toISOString(),
        }))
    : existing.assignedTo

  const updated: CaseFile = {
    ...existing,
    ...input,
    leadInvestigator,
    assignedTo,
    slug: input.title
      ? input.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      : existing.slug,
    updatedBy: actors.admin,
    updatedAt: new Date().toISOString(),
    closedAt:
      input.status === 'closed'
        ? new Date().toISOString()
        : input.status && input.status !== 'closed'
          ? undefined
          : existing.closedAt,
  }

  caseFiles[index] = updated

  return cloneCaseFiles([updated])[0]
}

export const archiveCaseFile = async (id: string): Promise<CaseFile> => {
  return updateCaseFile(id, { status: 'archived' })
}

export const deleteCaseFile = async (id: string): Promise<void> => {
  if (!USE_MOCK_DATA) {
    await request<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    })
    return
  }

  const exists = caseFiles.some((item) => item.id === id)

  if (!exists) {
    throw new Error('Case file not found.')
  }

  caseFiles = caseFiles.filter((item) => item.id !== id)
}
