import { Link } from 'react-router-dom'
import { FolderLock } from 'lucide-react'
import { PaywallGate } from '@/features/billing/components/PaywallGate'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyStateCard } from '@/components/cards'
import { useMyEvidenceVault } from '@/features/authors/hooks/useMyEvidenceVault'
import type { VaultEvidence } from '../types/evidence.types'

const KIND_LABELS: Record<VaultEvidence['kind'], string> = {
  document: 'Document',
  photo: 'Photo',
  video: 'Video',
  note: 'Note',
  foia: 'FOIA Response',
  interview_transcript: 'Interview Transcript',
}

function groupByInvestigation(evidence: VaultEvidence[]) {
  const groups = new Map<string, { title: string; id: string; items: VaultEvidence[] }>()
  for (const item of evidence) {
    const investigation = item.investigation
    const id = typeof investigation === 'string' ? investigation : investigation.id
    const title = typeof investigation === 'string' ? 'Untitled investigation' : investigation.title
    if (!groups.has(id)) {
      groups.set(id, { id, title, items: [] })
    }
    groups.get(id)!.items.push(item)
  }
  return Array.from(groups.values())
}

function EvidenceVaultPageContent() {
  const { evidence, isLoading } = useMyEvidenceVault()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (evidence.length === 0) {
    return (
      <EmptyStateCard
        icon={FolderLock}
        title="Your vault is empty"
        description="Uploaded source material and supporting evidence will show up here."
      />
    )
  }

  const groups = groupByInvestigation(evidence)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.id} className="rounded-xl border border-card-border bg-card">
          <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
            <Link to={`/author/investigations/${group.id}`} className="font-medium text-card-heading hover:underline">
              {group.title}
            </Link>
            <span className="text-xs text-card-text-muted">
              {group.items.length} item{group.items.length === 1 ? '' : 's'}
            </span>
          </div>
          <ul className="divide-y divide-card-border">
            {group.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="truncate text-card-heading">{item.title}</span>
                  <span className="text-xs text-card-text-muted">{KIND_LABELS[item.kind]}</span>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                    item.visibility === 'public'
                      ? 'border-verified/30 bg-verified/10 text-verified'
                      : 'border-card-border bg-card-2 text-card-text-muted'
                  }`}
                >
                  {item.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function EvidenceVaultPage() {
  return (
    <PaywallGate feature="evidenceVault">
      <div>
        <h1 className="text-2xl font-semibold text-heading mb-1">Evidence Vault</h1>
        <p className="text-sm text-text-muted mb-6">
          Securely stored source documents, recordings, and supporting evidence across every
          investigation you manage.
        </p>
        <EvidenceVaultPageContent />
      </div>
    </PaywallGate>
  )
}
