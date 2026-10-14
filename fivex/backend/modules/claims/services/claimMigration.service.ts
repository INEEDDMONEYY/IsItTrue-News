import { logger } from '../../../config/logger.js'
import { Claim } from '../models/Claim.js'

const CONCLUDING = ['verified', 'partially_supported', 'disputed', 'unverified', 'unable_to_verify']

// Claims saved before workflow and assessment were separate fields carry one combined `status`. This turns
// each into the two new fields. It only touches claims that have not been converted, changes nothing else
// (the old field is left in place), and does nothing on a database that is already converted, so it is safe
// to run on every start.
export async function migrateLegacyClaims(): Promise<number> {
  const concluded = { $in: ['$status', CONCLUDING] }
  const result = await Claim.collection.updateMany({ workflowStatus: { $exists: false } }, [
    {
      $set: {
        workflowStatus: {
          $switch: {
            branches: [
              { case: concluded, then: 'completed' },
              { case: { $eq: ['$status', 'in_review'] }, then: 'in_review' },
            ],
            default: 'unreviewed',
          },
        },
        assessmentStatus: { $cond: [concluded, '$status', 'none'] },
        priority: { $ifNull: ['$priority', 'normal'] },
        evidence: { $ifNull: ['$evidence', []] },
        sources: { $ifNull: ['$sources', []] },
      },
    },
  ])

  if (result.modifiedCount > 0) {
    logger.info(`Converted ${result.modifiedCount} existing claim(s) to separate workflow and assessment fields.`)
  }
  return result.modifiedCount
}
