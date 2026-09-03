import { apiClient } from '@/api/client'

export type TopicSubmissionStatus = 'pending' | 'reviewed'

export interface TopicSubmission {
  id: string
  title: string
  description: string
  category?: string
  status: TopicSubmissionStatus
  createdAt: string
}

export interface CreateTopicSubmissionInput {
  title: string
  description: string
  category?: string
}

export const topicSubmissionsApi = {
  submit: async (input: CreateTopicSubmissionInput): Promise<TopicSubmission> => {
    const { data } = await apiClient.post<{ submission: TopicSubmission }>(
      '/api/topic-submissions',
      input,
    )
    return data.submission
  },

  listMine: async (): Promise<TopicSubmission[]> => {
    const { data } = await apiClient.get<{ submissions: TopicSubmission[] }>(
      '/api/topic-submissions/mine',
    )
    return data.submissions
  },
}
