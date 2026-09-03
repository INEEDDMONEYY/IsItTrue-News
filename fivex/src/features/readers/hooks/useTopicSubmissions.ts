import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { topicSubmissionsApi, type CreateTopicSubmissionInput } from '../api/topicSubmissions.api'

export function useTopicSubmissions() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['readers', 'topicSubmissions', 'mine'],
    queryFn: topicSubmissionsApi.listMine,
  })

  const submitMutation = useMutation({
    mutationFn: (input: CreateTopicSubmissionInput) => topicSubmissionsApi.submit(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['readers', 'topicSubmissions', 'mine'] }),
  })

  return {
    submissions: data ?? [],
    isLoading,
    submitTopic: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}
