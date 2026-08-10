import type { Category, VerificationStatus } from './article.types';

export interface FactCheck {
  id: string;
  slug: string;
  claim: string;
  verdict: VerificationStatus;
  summary: string;
  source: string;
  category: Category;
  checkedAt: string; // ISO date
  checkedBy: string;
}
