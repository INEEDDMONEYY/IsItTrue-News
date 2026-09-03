import { TopicSubmission } from '../models/TopicSubmission.js'

export const topicSubmissionRepository = {
  create(data: { title: string; description: string; category?: string; submittedBy: string }) {
    return TopicSubmission.create(data)
  },

  findByUser(userId: string) {
    return TopicSubmission.find({ submittedBy: userId }).sort({ createdAt: -1 })
  },
}
