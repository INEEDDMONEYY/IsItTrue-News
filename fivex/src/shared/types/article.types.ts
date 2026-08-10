export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  colorToken?: 'tag-1' | 'tag-2' | 'tag-3' | 'tag-4';
}

export type VerificationStatus = 'verified' | 'disputed' | 'pending' | 'unverified';

export interface ArticleStats {
  views: number;
  comments: number;
  shares: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  thumbnailUrl: string;
  category: Category;
  author: Author;
  publishedAt: string; // ISO date
  readTimeMinutes: number;
  stats: ArticleStats;
  verificationStatus?: VerificationStatus;
}