import { AppError } from '../../../shared/errors/AppError.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { topicSubmissionRepository } from '../repositories/topicSubmission.repository.js'
import type { CreateTopicSubmissionInput } from '../validations/topicSubmission.validation.js'

export const topicSubmissionService = {
  async submitTopic(userId: string, input: CreateTopicSubmissionInput) {
    const user = await userRepository.findById(userId)
    if (!user?.isEmailVerified) {
      throw new AppError('Please verify your email address before submitting a topic.', 403)
    }
    return topicSubmissionRepository.create({ ...input, submittedBy: userId })
  },

  async listMine(userId: string) {
    return topicSubmissionRepository.findByUser(userId)
  },
}
