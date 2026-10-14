import { ArticleAuditLog, type IArticleAuditLog, type ArticleAuditLogDocument } from '../models/ArticleAuditLog.js'

export type NewArticleAuditEntry = Omit<IArticleAuditLog, 'createdAt'>

// Deliberately only create and read: the history of an article must not be editable.
export const articleAuditRepository = {
  async record(entry: NewArticleAuditEntry): Promise<void> {
    await ArticleAuditLog.create(entry)
  },

  async findByArticle(articleId: string, limit: number): Promise<ArticleAuditLogDocument[]> {
    return ArticleAuditLog.find({ article: articleId }).sort({ createdAt: -1, _id: -1 }).limit(limit)
  },

  async countByArticle(articleId: string): Promise<number> {
    return ArticleAuditLog.countDocuments({ article: articleId })
  },
}
