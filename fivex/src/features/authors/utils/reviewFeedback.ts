import type { ArticleReviewInfo } from '@/shared/types/articleReview.types'

export function hasReviewFeedback(review: ArticleReviewInfo): boolean {
  return Boolean(review.reviewNote) || (review.reviewRequirements?.length ?? 0) > 0
}
