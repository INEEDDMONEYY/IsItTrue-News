import { Schema, model, type HydratedDocument } from 'mongoose'

export interface ITag {
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type TagDocument = HydratedDocument<ITag>

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const Tag = model<ITag>('Tag', tagSchema)
