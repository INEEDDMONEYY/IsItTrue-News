import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import {
  ASSESSMENT_STATUSES,
  CLAIM_PRIORITIES,
  ESCALATION_KINDS,
  EVIDENCE_STANCES,
  EVIDENCE_STATUSES,
  SOURCE_RELIABILITIES,
  WORKFLOW_STATUSES,
  legacyStatus,
  type AssessmentStatus,
  type ClaimPriority,
  type EscalationKind,
  type EvidenceStance,
  type EvidenceStatus,
  type SourceReliability,
  type WorkflowStatus,
} from '../constants/claimStatus.js'

// What the reviewer concluded and why. Only present once the claim has an assessment.
export interface IAssessmentNarrative {
  conclusion?: string
  reasoning?: string
  limitations?: string
  // What is still not known, said plainly. Uncertainty is a legitimate part of a conclusion.
  uncertainty?: string
}

export interface IEvidenceItem {
  _id: Types.ObjectId
  stance: EvidenceStance
  title: string
  url?: string
  citation?: string
  reliability: SourceReliability
  reliabilityNote?: string
  // Admins can hide sensitive material from everyone but admins.
  restricted: boolean
  restrictedBy?: Types.ObjectId
  restrictedAt?: Date
  addedBy: Types.ObjectId
  addedAt: Date
}

export interface IEvidenceFlag {
  reason: string
  flaggedBy: Types.ObjectId
  flaggedAt: Date
}

export interface IEscalation {
  kind: EscalationKind
  reason: string
  escalatedBy: Types.ObjectId
  escalatedAt: Date
}

export interface IClaim {
  article: Types.ObjectId
  // The claim itself, kept apart from the work of checking it and from what was concluded.
  text: string
  context?: string
  checkReason?: string

  // The verification task.
  workflowStatus: WorkflowStatus
  assignee?: Types.ObjectId
  priority: ClaimPriority
  dueAt?: Date
  // Why an admin sent it back, shown to the reviewer until they pick it up again.
  returnReason?: string
  escalation?: IEscalation

  // The assessment.
  assessmentStatus: AssessmentStatus
  assessment?: IAssessmentNarrative
  // Who recorded the current assessment, and when. Credit follows the person who made the call.
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date

  // Evidence and sources.
  evidenceStatus: EvidenceStatus
  evidenceSummary?: string
  sources: string[]
  evidence: IEvidenceItem[]
  evidenceFlag?: IEvidenceFlag

  // Public connection beyond the article itself.
  investigation?: Types.ObjectId

  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ClaimDocument = HydratedDocument<IClaim>

const narrativeSchema = new Schema<IAssessmentNarrative>(
  {
    conclusion: { type: String, trim: true, maxlength: 1000 },
    reasoning: { type: String, trim: true, maxlength: 4000 },
    limitations: { type: String, trim: true, maxlength: 2000 },
    uncertainty: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
)

const evidenceItemSchema = new Schema<IEvidenceItem>({
  stance: { type: String, enum: EVIDENCE_STANCES, required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  url: { type: String, trim: true, maxlength: 2000 },
  citation: { type: String, trim: true, maxlength: 1000 },
  reliability: { type: String, enum: SOURCE_RELIABILITIES, default: 'unknown' },
  reliabilityNote: { type: String, trim: true, maxlength: 1000 },
  restricted: { type: Boolean, default: false },
  restrictedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  restrictedAt: { type: Date },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now },
})

const claimSchema = new Schema<IClaim>(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    context: { type: String, trim: true, maxlength: 1000 },
    checkReason: { type: String, trim: true, maxlength: 500 },

    workflowStatus: { type: String, enum: WORKFLOW_STATUSES, default: 'unreviewed', index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    priority: { type: String, enum: CLAIM_PRIORITIES, default: 'normal' },
    dueAt: { type: Date },
    returnReason: { type: String, trim: true, maxlength: 2000 },
    escalation: {
      type: new Schema<IEscalation>(
        {
          kind: { type: String, enum: ESCALATION_KINDS, required: true },
          reason: { type: String, required: true, trim: true, maxlength: 2000 },
          escalatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          escalatedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },

    assessmentStatus: { type: String, enum: ASSESSMENT_STATUSES, default: 'none', index: true },
    assessment: { type: narrativeSchema, default: undefined },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    evidenceStatus: { type: String, enum: EVIDENCE_STATUSES, default: 'none' },
    evidenceSummary: { type: String, trim: true, maxlength: 2000 },
    sources: { type: [String], default: [] },
    evidence: { type: [evidenceItemSchema], default: [] },
    evidenceFlag: {
      type: new Schema<IEvidenceFlag>(
        {
          reason: { type: String, required: true, trim: true, maxlength: 1000 },
          flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          flaggedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },

    investigation: { type: Schema.Types.ObjectId, ref: 'Investigation' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      // This is the editor-facing shape. It keeps the single combined `status` the oversight page uses,
      // withholds anything only admins should see (escalation details, who flagged), and masks restricted
      // evidence. The admin pages build their own explicit response instead of using this.
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.status = legacyStatus(ret.workflowStatus as WorkflowStatus, ret.assessmentStatus as AssessmentStatus)
        ret.evidence = ((ret.evidence as IEvidenceItem[] | undefined) ?? []).map((item) =>
          item.restricted
            ? { id: String(item._id), stance: item.stance, restricted: true }
            : {
                id: String(item._id),
                stance: item.stance,
                title: item.title,
                url: item.url,
                citation: item.citation,
                reliability: item.reliability,
                reliabilityNote: item.reliabilityNote,
                restricted: false,
              },
        )
        const flag = ret.evidenceFlag as IEvidenceFlag | undefined
        ret.evidenceFlag = flag ? { reason: flag.reason, flaggedAt: flag.flaggedAt } : undefined
        delete ret.escalation
        delete ret.investigation
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

claimSchema.index({ article: 1, workflowStatus: 1 })
claimSchema.index({ workflowStatus: 1, dueAt: 1 })
claimSchema.index({ updatedAt: -1 })

export const Claim = model<IClaim>('Claim', claimSchema)
