import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { CLAIM_EVENT_ACTIONS, type ClaimEventAction } from '../constants/claimEvent.js'
import {
  ASSESSMENT_STATUSES,
  WORKFLOW_STATUSES,
  type AssessmentStatus,
  type WorkflowStatus,
} from '../constants/claimStatus.js'

// A conclusion as it stood before it was replaced, copied in full so it can still be read afterwards.
export interface IAssessmentSnapshot {
  assessmentStatus: AssessmentStatus
  conclusion?: string
  reasoning?: string
  limitations?: string
  uncertainty?: string
  decidedBy?: Types.ObjectId
  decidedByName?: string
  decidedAt?: Date
}

export interface IPersonSnapshot {
  id: Types.ObjectId
  name: string
}

// One line in a claim's history. Entries are only ever added: nothing in the app updates or removes them.
// Names and the claim text are copied in, so the record still reads correctly after a rename or a deletion.
export interface IClaimEvent {
  claim: Types.ObjectId
  article: Types.ObjectId
  claimText: string
  action: ClaimEventAction
  actor: Types.ObjectId
  actorName: string
  actorRole: string
  note?: string
  fromWorkflow?: WorkflowStatus
  toWorkflow?: WorkflowStatus
  fromAssessment?: AssessmentStatus
  toAssessment?: AssessmentStatus
  fromAssignee?: IPersonSnapshot
  toAssignee?: IPersonSnapshot
  previousAssessment?: IAssessmentSnapshot
  changedFields?: string[]
  createdAt: Date
}

export type ClaimEventDocument = HydratedDocument<IClaimEvent>

const personSchema = new Schema<IPersonSnapshot>(
  { id: { type: Schema.Types.ObjectId, required: true }, name: { type: String, required: true } },
  { _id: false },
)

const snapshotSchema = new Schema<IAssessmentSnapshot>(
  {
    assessmentStatus: { type: String, enum: ASSESSMENT_STATUSES, required: true },
    conclusion: { type: String },
    reasoning: { type: String },
    limitations: { type: String },
    uncertainty: { type: String },
    decidedBy: { type: Schema.Types.ObjectId },
    decidedByName: { type: String },
    decidedAt: { type: Date },
  },
  { _id: false },
)

const claimEventSchema = new Schema<IClaimEvent>(
  {
    claim: { type: Schema.Types.ObjectId, required: true },
    article: { type: Schema.Types.ObjectId, required: true },
    claimText: { type: String, required: true, maxlength: 500 },
    action: { type: String, enum: CLAIM_EVENT_ACTIONS, required: true },
    actor: { type: Schema.Types.ObjectId, required: true },
    actorName: { type: String, required: true, maxlength: 200 },
    actorRole: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 2000 },
    fromWorkflow: { type: String, enum: WORKFLOW_STATUSES },
    toWorkflow: { type: String, enum: WORKFLOW_STATUSES },
    fromAssessment: { type: String, enum: ASSESSMENT_STATUSES },
    toAssessment: { type: String, enum: ASSESSMENT_STATUSES },
    fromAssignee: { type: personSchema, default: undefined },
    toAssignee: { type: personSchema, default: undefined },
    previousAssessment: { type: snapshotSchema, default: undefined },
    changedFields: { type: [String], default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

claimEventSchema.index({ claim: 1, createdAt: -1 })

export const ClaimEvent = model<IClaimEvent>('ClaimEvent', claimEventSchema)
