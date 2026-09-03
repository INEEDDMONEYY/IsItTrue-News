import { Schema, model, Types, type HydratedDocument } from 'mongoose'

export interface IComment {
  article: Types.ObjectId
  author: Types.ObjectId
  content: string
  likedBy: Types.ObjectId[]
  likesCount: number
  createdAt: Date
  updatedAt: Date
}

export type CommentDocument = HydratedDocument<IComment>

const commentSchema = new Schema<IComment>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.likes = ret.likesCount ?? 0
        delete ret._id
        delete ret.__v
        delete ret.likedBy
        delete ret.likesCount
        return ret
      },
    },
  },
)

commentSchema.index({ article: 1, createdAt: -1 })
commentSchema.index({ author: 1, createdAt: -1 })

export const Comment = model<IComment>('Comment', commentSchema)
