import type { FactCheck } from '@/shared/types/factCheck.types'
import { CATEGORIES } from '@/features/home/data/mockHome'

const CHECKERS = ['Nina Cole', 'Marcus Webb', 'Priya Anand', 'Sam Torres']

export const FACT_CHECKS: FactCheck[] = [
  {
    id: 'fc1',
    slug: 'unemployment-rate-claim',
    claim: 'The national unemployment rate dropped to its lowest level in 50 years last month.',
    verdict: 'verified',
    summary:
      'Bureau of Labor Statistics data confirms the reported rate matches the lowest recorded figure since 1969, based on the most recent jobs report.',
    source: 'Bureau of Labor Statistics, Monthly Employment Situation Report',
    category: CATEGORIES[3],
    checkedAt: '2026-07-20T10:00:00.000Z',
    checkedBy: CHECKERS[0],
  },
  {
    id: 'fc2',
    slug: 'vaccine-microchip-claim',
    claim: 'A viral post claims vaccines contain tracking microchips.',
    verdict: 'disputed',
    summary:
      'No peer-reviewed evidence or manufacturing documentation supports this claim. Vaccine vials are too small to contain functioning microchips, per independent lab analysis.',
    source: 'FDA public ingredient disclosures; independent lab teardown analysis',
    category: CATEGORIES[4],
    checkedAt: '2026-07-18T14:30:00.000Z',
    checkedBy: CHECKERS[1],
  },
  {
    id: 'fc3',
    slug: 'new-infrastructure-bill-cost',
    claim: 'The proposed infrastructure bill will cost taxpayers $3 trillion this year alone.',
    verdict: 'pending',
    summary:
      'The bill spreads funding across 10 years and has not passed final committee review. Our team is awaiting the finalized CBO cost estimate before rating this claim.',
    source: 'Congressional Budget Office (estimate pending)',
    category: CATEGORIES[0],
    checkedAt: '2026-07-23T09:15:00.000Z',
    checkedBy: CHECKERS[2],
  },
  {
    id: 'fc4',
    slug: 'city-crime-rate-claim',
    claim: 'Crime in the downtown district has tripled over the past year.',
    verdict: 'disputed',
    summary:
      'City police department records show an 8% increase in reported incidents, not a tripling. The viral figure appears to conflate two unrelated precincts.',
    source: 'City Police Department quarterly crime statistics',
    category: CATEGORIES[1],
    checkedAt: '2026-07-15T16:45:00.000Z',
    checkedBy: CHECKERS[3],
  },
  {
    id: 'fc5',
    slug: 'ai-jobs-report-claim',
    claim: 'A new study says AI will eliminate 40% of entry-level jobs within two years.',
    verdict: 'unverified',
    summary:
      'The cited "study" traces back to an unpublished blog post with no methodology, dataset, or peer review. We could not locate the original research.',
    source: 'Unable to verify — no primary source located',
    category: CATEGORIES[2],
    checkedAt: '2026-07-12T12:00:00.000Z',
    checkedBy: CHECKERS[0],
  },
  {
    id: 'fc6',
    slug: 'water-supply-contamination-claim',
    claim: "The city's water supply tested positive for unsafe lead levels this week.",
    verdict: 'verified',
    summary:
      'Independent lab results obtained by our newsroom confirm lead levels exceeding EPA action limits in two test sites, matching the original report.',
    source: 'EPA testing records; independent lab confirmation',
    category: CATEGORIES[4],
    checkedAt: '2026-07-10T08:20:00.000Z',
    checkedBy: CHECKERS[1],
  },
]
