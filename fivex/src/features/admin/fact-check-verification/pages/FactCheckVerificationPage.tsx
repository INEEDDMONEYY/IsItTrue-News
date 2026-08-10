import { useState } from 'react'
import { BadgeCheck, Check, X } from 'lucide-react'
import { StatCard } from '@/components/cards'
import { useFactCheckVerification } from '../hooks/useFactCheckVerification'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function FactCheckVerificationPage() {
  const { requests, isLoading, error, approveRequest, rejectRequest } = useFactCheckVerification()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setActionError(null)
    try {
      await approveRequest(id)
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to approve fact-check request.'))
    }
  }

  const startReject = (id: string) => {
    setActionError(null)
    setReason('')
    setRejectingId(id)
  }

  const confirmReject = async (id: string) => {
    if (!reason.trim()) return
    setActionError(null)
    try {
      await rejectRequest(id, reason.trim())
      setRejectingId(null)
      setReason('')
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to reject fact-check request.'))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Fact Check Verification</h1>
      <p className="text-sm text-text-muted mb-6">
        Author/editor-submitted claims and sources, waiting for the IsItTrue Fact-Check Team to
        verify. Approving marks the article as verified for readers; rejecting flags the claim
        (not the author) so readers know to take it with a grain of salt.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Pending Verification" value={requests.length} icon={BadgeCheck} />
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading fact-check requests...</p>}
      {error && (
        <p className="text-sm text-disputed mb-4">
          {getErrorMessage(error, 'Failed to load fact-check requests.')}
        </p>
      )}
      {actionError && <p className="text-sm text-disputed mb-4">{actionError}</p>}

      <div className="flex flex-col gap-3">
        {requests.map((item) => (
          <div key={item.id} className="rounded-xl border border-card-border bg-card p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-card-heading truncate">
                  {item.article.title || 'Untitled'}
                </p>
                <p className="text-xs text-card-text-muted">
                  {item.requestedBy.name} · Submitted{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-verified/10 text-verified border border-verified/30 hover:bg-verified/20 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => startReject(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-disputed/10 text-disputed border border-disputed/30 hover:bg-disputed/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>

            <p className="text-xs text-card-text-dim uppercase mb-1">Claim</p>
            <p className="text-sm text-card-text-muted mb-2">&ldquo;{item.claim}&rdquo;</p>

            <p className="text-xs text-card-text-dim uppercase mb-1">Sources</p>
            <p className="text-sm text-card-text-muted mb-2 whitespace-pre-wrap">{item.sources}</p>

            <p className="text-xs text-card-text-dim uppercase mb-1">Notes</p>
            <p className="text-sm text-card-text-muted whitespace-pre-wrap">{item.notes}</p>

            {rejectingId === item.id && (
              <div className="mt-3 pt-3 border-t border-card-border">
                <label className="block text-xs text-card-text-muted mb-1.5" htmlFor={`reason-${item.id}`}>
                  Reason for rejection (shown to readers as a warning)
                </label>
                <textarea
                  id={`reason-${item.id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Explain why this claim didn't pass verification"
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-card-2 text-sm text-card-heading placeholder:text-card-text-dim outline-none focus:border-accent resize-none mb-2"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => confirmReject(item.id)}
                    disabled={!reason.trim()}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-disputed text-white hover:bg-disputed/90 transition-colors disabled:opacity-50"
                  >
                    Confirm rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingId(null)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs text-card-text-muted hover:bg-card-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!isLoading && requests.length === 0 && (
          <div className="rounded-xl border border-dashed border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
            There are no fact checks awaiting verification.
          </div>
        )}
      </div>
    </div>
  )
}

