import type { BookmarkItem } from '../types/bookmark.types'

export const mockBookmarks: BookmarkItem[] = [
  {
    id: 'article-1',
    title: 'The Hidden Network Behind a Growing Political Influence Campaign',
    description:
      'An investigation into the organizations, funding networks, and individuals connected to a rapidly expanding influence operation.',
    type: 'article',
    category: 'Investigations',
    author: 'Sarah Mitchell',
    savedAt: '2026-08-08T14:30:00Z',
    readTime: '12 min read',
    href: '/articles/hidden-network-political-influence',
  },
  {
    id: 'investigation-1',
    title: 'Inside the City Contracting Network',
    description:
      'A continuing investigation examining public contracts, private companies, and potential conflicts of interest.',
    type: 'investigation',
    category: 'Public Integrity',
    author: 'Marcus Reed',
    savedAt: '2026-08-07T18:20:00Z',
    status: 'Active Investigation',
    href: '/investigations/city-contracting-network',
  },
  {
    id: 'fact-check-1',
    title: 'Fact Check: Claims About Federal Infrastructure Spending',
    description:
      'A source-backed review of several claims surrounding recent infrastructure spending figures.',
    type: 'fact-check',
    category: 'Politics',
    savedAt: '2026-08-06T11:45:00Z',
    status: 'Verified',
    href: '/fact-checks/infrastructure-spending',
  },
  {
    id: 'video-1',
    title: 'Inside the Investigation: Following the Money',
    description:
      'A video breakdown of the documents and financial records uncovered during the investigation.',
    type: 'video',
    category: 'Investigative Video',
    author: 'Is It True? Investigations',
    savedAt: '2026-08-05T16:10:00Z',
    readTime: '18 min',
    href: '/videos/following-the-money',
  },
  {
    id: 'source-1',
    title: 'Public Records: County Procurement Documents',
    description:
      'A collection of public procurement records used in an ongoing investigation.',
    type: 'source',
    category: 'Public Records',
    savedAt: '2026-08-04T09:15:00Z',
    href: '/sources/county-procurement-documents',
  },
  {
    id: 'evidence-1',
    title: 'Evidence Vault: Financial Transaction Records',
    description:
      'Verified financial records associated with the City Contracting investigation.',
    type: 'evidence',
    category: 'Financial Records',
    savedAt: '2026-08-03T21:05:00Z',
    status: 'Verified Evidence',
    href: '/evidence/financial-transaction-records',
  },
]