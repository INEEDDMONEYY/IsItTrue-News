import { Types } from 'mongoose'
import { Comment, type CommentDocument } from '../models/Comment.js'

export interface CreateCommentInput {
  article: string
  author: string
  content: string
}

export interface ToggleCommentLikeResult {
  likesCount: number
  liked: boolean
}

export const commentRepository = {
  async create(input: CreateCommentInput): Promise<CommentDocument> {
    return Comment.create(input)
  },

  async findById(id: string): Promise<CommentDocument | null> {
    return Comment.findById(id)
  },

  async findByArticle(articleId: string): Promise<CommentDocument[]> {
    return Comment.find({ article: articleId }).sort({ createdAt: -1 }).populate('author', 'name')
  },

  async findByAuthor(authorId: string): Promise<CommentDocument[]> {
    return Comment.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate('article', 'title slug')
      .populate('author', 'name')
  },

  async findByArticleIds(articleIds: string[]): Promise<CommentDocument[]> {
    return Comment.find({ article: { $in: articleIds } })
      .sort({ createdAt: -1 })
      .populate('article', 'title slug')
      .populate('author', 'name')
  },

  async deleteById(id: string): Promise<void> {
    await Comment.deleteOne({ _id: id })
  },

  async toggleLike(id: string, userId: string): Promise<ToggleCommentLikeResult | null> {
    const comment = await Comment.findById(id)
    if (!comment) return null

    const alreadyLiked = comment.likedBy.some((likerId) => likerId.toString() === userId)
    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter((likerId) => likerId.toString() !== userId)
      comment.likesCount = Math.max(0, comment.likesCount - 1)
    } else {
      comment.likedBy.push(new Types.ObjectId(userId))
      comment.likesCount += 1
    }
    await comment.save()

    return { likesCount: comment.likesCount, liked: !alreadyLiked }
  },

  // Public author-profile "Library" tab: every comment a given user has liked.
  async findLikedByUser(userId: string): Promise<CommentDocument[]> {
    return Comment.find({ likedBy: userId })
      .sort({ createdAt: -1 })
      .populate('article', 'title slug')
      .populate('author', 'name')
  },
}
