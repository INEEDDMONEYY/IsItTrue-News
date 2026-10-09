import { Correction, type CorrectionDocument, type ICorrection } from '../models/Correction.js'
import {
  ALL_CORRECTION_STATUSES,
  type CorrectionStatus,
} from '../constants/correctionStatus.js'

export type CreateCorrectionData = Pick<
  ICorrection,
  | 'article'
  | 'articleTitle'
  | 'articleSlug'
  | 'category'
  | 'description'
  | 'suggestedFix'
  | 'evidenceLinks'
  | 'reportedBy'
  | 'reportedByName'
  | 'history'
>

// There is deliberately no delete here: corrections are a permanent record.
export const correctionRepository = {
  create(input: CreateCorrectionData): Promise<CorrectionDocument> {
    return Correction.create(input)
  },

  findById(id: string): Promise<CorrectionDocument | null> {
    return Correction.findById(id)
  },

  findAll(status?: CorrectionStatus): Promise<CorrectionDocument[]> {
    return Correction.find(status ? { status } : {}).sort({ updatedAt: -1 })
  },

  async countByStatus(): Promise<Record<CorrectionStatus, number>> {
    const rows = await Correction.aggregate<{ _id: CorrectionStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const counts = Object.fromEntries(ALL_CORRECTION_STATUSES.map((status) => [status, 0])) as Record<
      CorrectionStatus,
      number
    >
    for (const row of rows) counts[row._id] = row.count
    return counts
  },

  save(correction: CorrectionDocument): Promise<CorrectionDocument> {
    return correction.save()
  },

  // Used to stop one account from flooding the editors' queue.
  countOpenByReporter(reporterId: string): Promise<number> {
    return Correction.countDocuments({
      reportedBy: reporterId,
      status: { $in: ['queued', 'investigating'] },
    })
  },
}
