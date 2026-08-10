import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export const TICKET_STATUSES = ['open', 'resolved'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export interface ITicket {
  subject: string
  message: string
  submittedByName: string
  submittedByEmail: string
  userId?: Types.ObjectId
  status: TicketStatus
  createdAt: Date
  updatedAt: Date
}

export type TicketDocument = HydratedDocument<ITicket>

const ticketSchema = new Schema<ITicket>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 3000,
    },
    submittedByName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    submittedByEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'open',
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

export const Ticket = model<ITicket>('Ticket', ticketSchema)
