import { Schema, model, Types } from 'mongoose'
import { SELECTION_METHODS, type SelectionMethod } from '../constants.js'

/** Authenticated readers only. Anonymous preferences live in localStorage on the client. */
export interface IReaderLocationPreference {
  userId: Types.ObjectId
  method: SelectionMethod
  locationId: string
}

const readerLocationPreferenceSchema = new Schema<IReaderLocationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    method: { type: String, enum: [...SELECTION_METHODS], required: true },
    locationId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export const ReaderLocationPreference = model<IReaderLocationPreference>(
  'ReaderLocationPreference',
  readerLocationPreferenceSchema,
)
