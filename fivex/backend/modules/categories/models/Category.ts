import { Schema, model, type HydratedDocument } from 'mongoose'

export interface ICategory {
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type CategoryDocument = HydratedDocument<ICategory>

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
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

export const Category = model<ICategory>('Category', categorySchema)
