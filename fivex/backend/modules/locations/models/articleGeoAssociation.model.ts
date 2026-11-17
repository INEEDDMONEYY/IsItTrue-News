import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ASSOCIATION_SOURCES,
  ASSOCIATION_STATUSES,
  CONFIDENCE_LEVELS,
  PRECISION_LEVELS,
  RELATIONSHIP_TYPES,
  type AssociationSource,
  type AssociationStatus,
  type ConfidenceLevel,
  type PublicPrecision,
  type RelationshipType,
} from '../constants.js'

export interface IArticleGeoAssociation {
  articleId: Types.ObjectId
  locationId: string
  relationshipType: RelationshipType
  publicPrecision: PublicPrecision
  status: AssociationStatus
  confidence: ConfidenceLevel
  source: AssociationSource
  proposedBy: Types.ObjectId | null
  reviewedBy: Types.ObjectId | null
  reviewedAt: Date | null
}

const articleGeoAssociationSchema = new Schema<IArticleGeoAssociation>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    locationId: { type: String, required: true, trim: true },
    relationshipType: { type: String, enum: [...RELATIONSHIP_TYPES], required: true },
    publicPrecision: { type: String, enum: [...PRECISION_LEVELS], required: true, default: 'hidden' },
    status: { type: String, enum: [...ASSOCIATION_STATUSES], required: true, default: 'proposed' },
    confidence: { type: String, enum: [...CONFIDENCE_LEVELS], required: true, default: 'uncertain' },
    source: { type: String, enum: [...ASSOCIATION_SOURCES], required: true, default: 'author' },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

articleGeoAssociationSchema.index({ articleId: 1, locationId: 1, relationshipType: 1 }, { unique: true })
articleGeoAssociationSchema.index(
  { articleId: 1, relationshipType: 1 },
  { unique: true, partialFilterExpression: { relationshipType: { $in: ['primary', 'dateline'] } } },
)
articleGeoAssociationSchema.index({ articleId: 1, status: 1 })

export type ArticleGeoAssociationDocument = HydratedDocument<IArticleGeoAssociation>
export const ArticleGeoAssociation = model<IArticleGeoAssociation>('ArticleGeoAssociation', articleGeoAssociationSchema)
