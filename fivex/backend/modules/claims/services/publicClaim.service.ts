import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { escapeRegex } from '../../../utils/escapeRegex.js'
import { CONCLUDING_ASSESSMENTS, type ConcludingAssessment } from '../constants/claimStatus.js'
import type { ClaimDocument } from '../models/Claim.js'
import { publicClaimRepository, type PublicFactCheckRow } from '../repositories/publicClaim.repository.js'
import type { PublicFactCheckListQuery } from '../validations/publicClaim.validation.js'

// What the article page badge says about a story as a whole.
export type ArticleVerdict = 'verified' | 'partially_supported' | 'disputed' | 'unverified' | 'pending'

const SUMMARY_LENGTH = 280

// Only web addresses are ever handed out as links. A claim saved before links were checked could hold
// something like javascript:, and this is the last place to stop it reaching a reader.
const webUrl = (value: string | undefined | null): string | null => (value && /^https?:\/\//i.test(value) ? value : null)

function trimTo(text: string, length: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= length ? clean : `${clean.slice(0, length - 1).trimEnd()}…`
}

// One verdict for the whole story, from its concluded claims. It is never "verified" just because the editor
// marked the article as checked: one disputed claim makes the story disputed.
//   - any claim disputed                       -> disputed
//   - every claim verified                     -> verified
//   - every claim unverified / unable to verify -> unverified (nothing could be confirmed; not "false")
//   - a mix of confirmed and not-confirmed      -> partially supported
//   - nothing concluded yet                     -> under review if claims are being checked, else unverified
export function deriveArticleVerdict(verdicts: readonly ConcludingAssessment[], openClaims: number, flagged: boolean): ArticleVerdict {
  if (flagged) return 'pending'
  if (verdicts.length === 0) return openClaims > 0 ? 'pending' : 'unverified'
  if (verdicts.includes('disputed')) return 'disputed'
  if (verdicts.every((verdict) => verdict === 'verified')) return 'verified'
  if (verdicts.every((verdict) => verdict === 'unverified' || verdict === 'unable_to_verify')) return 'unverified'
  return 'partially_supported'
}

function toRow(row: PublicFactCheckRow) {
  const { conclusion, reasoning } = row.assessment ?? {}
  return {
    id: row._id.toString(),
    claim: row.text,
    verdict: row.assessmentStatus,
    summary: conclusion ? trimTo(conclusion, SUMMARY_LENGTH) : reasoning ? trimTo(reasoning, SUMMARY_LENGTH) : null,
    article: { title: row.articleDoc.title, slug: row.articleDoc.slug, category: row.articleDoc.category },
    checkedBy: row.reviewerDoc?.name ?? null,
    checkedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    sourceCount: row.sourceCount,
  }
}

type Populated<T> = T | Types.ObjectId | null | undefined
const populated = <T extends object>(value: Populated<T>): T | null => (value && !(value instanceof Types.ObjectId) ? value : null)

function claimSummary(claim: ClaimDocument) {
  const reviewer = populated(claim.reviewedBy as unknown as Populated<{ name?: string }>)
  return {
    id: claim._id.toString(),
    claim: claim.text,
    verdict: claim.assessmentStatus as ConcludingAssessment,
    summary: claim.assessment?.conclusion
      ? trimTo(claim.assessment.conclusion, SUMMARY_LENGTH)
      : claim.assessment?.reasoning
        ? trimTo(claim.assessment.reasoning, SUMMARY_LENGTH)
        : null,
    checkedBy: reviewer?.name ?? null,
    checkedAt: claim.reviewedAt ? claim.reviewedAt.toISOString() : null,
  }
}

export const publicClaimService = {
  async list(query: PublicFactCheckListQuery) {
    const escapedSearch = query.q ? escapeRegex(query.q) : undefined
    const [{ rows, total }, byVerdict] = await Promise.all([
      publicClaimRepository.search({ verdict: query.verdict, escapedSearch, page: query.page, pageSize: query.pageSize }),
      publicClaimRepository.countByVerdict(escapedSearch),
    ])

    const counts = Object.fromEntries(CONCLUDING_ASSESSMENTS.map((verdict) => [verdict, byVerdict[verdict] ?? 0]))
    return {
      factChecks: rows.map(toRow),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      counts: { ...counts, all: Object.values(counts).reduce((sum, count) => sum + count, 0) },
    }
  },

  async getDetail(id: string) {
    const claim = await publicClaimRepository.findPublicById(id)
    if (!claim) throw new AppError('Fact-check not found.', 404)

    const article = populated(
      claim.article as unknown as Populated<{
        _id: Types.ObjectId
        title: string
        slug: string
        category: string
        publishedAt?: Date
        corrections: { number: number; text: string; publishedAt: Date }[]
      }>,
    )
    if (!article) throw new AppError('Fact-check not found.', 404)
    const reviewer = populated(claim.reviewedBy as unknown as Populated<{ name?: string }>)
    const revisedAt = await publicClaimRepository.lastRevisedAt(claim._id.toString())

    return {
      id: claim._id.toString(),
      claim: claim.text,
      verdict: claim.assessmentStatus as ConcludingAssessment,
      conclusion: claim.assessment?.conclusion ?? null,
      reasoning: claim.assessment?.reasoning ?? null,
      limitations: claim.assessment?.limitations ?? null,
      // What is still not known, said plainly. It is part of an honest conclusion.
      uncertainty: claim.assessment?.uncertainty ?? null,
      checkedBy: reviewer?.name ?? null,
      checkedAt: claim.reviewedAt ? claim.reviewedAt.toISOString() : null,
      revisedAt: revisedAt ? revisedAt.toISOString() : null,
      article: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      },
      sources: claim.sources.map(webUrl).filter((url): url is string => Boolean(url)),
      evidence: claim.evidence
        .filter((item) => !item.restricted)
        .map((item) => ({
          id: item._id.toString(),
          stance: item.stance,
          title: item.title,
          url: webUrl(item.url),
          citation: item.citation ?? null,
          reliability: item.reliability,
          reliabilityNote: item.reliabilityNote ?? null,
        })),
      corrections: article.corrections.map((correction) => ({
        number: correction.number,
        text: correction.text,
        publishedAt: correction.publishedAt.toISOString(),
      })),
    }
  },

  // Everything the article page needs in one request: the verdict for the story, and each claim behind it.
  async forArticle(slug: string) {
    const article = await publicClaimRepository.findPublishedArticleBySlug(slug)
    if (!article) throw new AppError('Article not found.', 404)

    // An admin flagged this story during verification. Its conclusions are held back until that is resolved.
    const flagged = article.factCheckStatus === 'rejected'
    const articleId = article._id.toString()
    const [concluded, openClaims] = await Promise.all([
      flagged ? Promise.resolve([]) : publicClaimRepository.concludedForArticle(articleId),
      publicClaimRepository.openCountForArticle(articleId),
    ])

    const claims = concluded.map(claimSummary)
    const counts = Object.fromEntries(CONCLUDING_ASSESSMENTS.map((verdict) => [verdict, claims.filter((c) => c.verdict === verdict).length]))
    const reviewer = populated(article.factCheckReviewedBy as unknown as Populated<{ name?: string }>)

    return {
      verdict: deriveArticleVerdict(claims.map((claim) => claim.verdict), openClaims, flagged),
      flagged,
      claims,
      counts,
      openClaims,
      // The editor's own sign-off that every claim has been looked at, kept apart from what the claims concluded.
      editorSignOff:
        article.factCheckStatus === 'approved' && article.factCheckReviewedAt
          ? { by: reviewer?.name ?? null, at: article.factCheckReviewedAt.toISOString() }
          : null,
    }
  },
}
