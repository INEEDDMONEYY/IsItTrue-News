import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { correctionsApi } from '../api/corrections.api'
import type { CorrectionStatus, InvestigationVerdict } from '../types/correction.types'

const KEY = ['corrections'] as const

export function useCorrections(status: CorrectionStatus) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...KEY, status],
    queryFn: () => correctionsApi.list(status),
    refetchInterval: 60_000,
  })

  // A decision moves a correction to another stage, so every tab and the counts refresh.
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: KEY })
    // Published corrections also appear on the public article.
    queryClient.invalidateQueries({ queryKey: ['articles'] })
  }

  const startInvestigation = useMutation({ mutationFn: correctionsApi.startInvestigation, onSuccess: refresh })
  const recordFindings = useMutation({
    mutationFn: ({ id, findings, verdict }: { id: string; findings: string; verdict: InvestigationVerdict }) =>
      correctionsApi.recordFindings(id, { findings, verdict }),
    onSuccess: refresh,
  })
  const publish = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => correctionsApi.publish(id, text),
    onSuccess: refresh,
  })
  const dismiss = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => correctionsApi.dismiss(id, reason),
    onSuccess: refresh,
  })
  const create = useMutation({ mutationFn: correctionsApi.create, onSuccess: refresh })

  return {
    corrections: query.data?.corrections ?? [],
    counts: query.data?.counts,
    isLoading: query.isLoading,
    isError: query.isError,
    startInvestigation: startInvestigation.mutateAsync,
    recordFindings: recordFindings.mutateAsync,
    publish: publish.mutateAsync,
    dismiss: dismiss.mutateAsync,
    create: create.mutateAsync,
    isCreating: create.isPending,
    createError: create.error,
  }
}
