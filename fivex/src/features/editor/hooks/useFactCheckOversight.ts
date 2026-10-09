import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { claimsApi } from '../api/claims.api'
import type { ClaimUpdate } from '../types/claim.types'

const CLAIMS_KEY = ['editor', 'claims'] as const
const ARTICLES_KEY = ['editor', 'fact-check-articles'] as const

export function useFactCheckOversight() {
  const queryClient = useQueryClient()

  const claims = useQuery({ queryKey: CLAIMS_KEY, queryFn: claimsApi.list, refetchInterval: 60_000 })
  const articles = useQuery({ queryKey: ARTICLES_KEY, queryFn: claimsApi.listArticles, refetchInterval: 60_000 })

  // Claim changes also move the article's tallies and fact-checked state.
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: CLAIMS_KEY }),
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY }),
    ])

  const createMutation = useMutation({ mutationFn: claimsApi.create, onSuccess: refresh })
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: ClaimUpdate }) => claimsApi.update(id, changes),
    onSuccess: refresh,
  })
  const removeMutation = useMutation({ mutationFn: claimsApi.remove, onSuccess: refresh })
  const takeMutation = useMutation({ mutationFn: claimsApi.takeResponsibility, onSuccess: refresh })
  const factCheckedMutation = useMutation({
    mutationFn: ({ articleId, factChecked }: { articleId: string; factChecked: boolean }) =>
      claimsApi.setArticleFactChecked(articleId, factChecked),
    onSuccess: refresh,
  })

  return {
    claims: claims.data ?? [],
    articles: articles.data ?? [],
    isLoading: claims.isLoading || articles.isLoading,
    isError: claims.isError || articles.isError,
    createClaim: createMutation.mutateAsync,
    updateClaim: (id: string, changes: ClaimUpdate) => updateMutation.mutateAsync({ id, changes }),
    deleteClaim: removeMutation.mutateAsync,
    takeResponsibility: takeMutation.mutateAsync,
    setFactChecked: (articleId: string, factChecked: boolean) =>
      factCheckedMutation.mutateAsync({ articleId, factChecked }),
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      takeMutation.isPending ||
      factCheckedMutation.isPending,
  }
}
