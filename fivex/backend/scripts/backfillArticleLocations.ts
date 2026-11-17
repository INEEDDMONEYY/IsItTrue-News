import { connectDatabase, disconnectDatabase } from '../database/connection.js'
import { backfillArticleLocations } from '../modules/locations/services/articleLocationBackfill.service.js'

const apply = process.argv.includes('--apply')

async function main(): Promise<void> {
  await connectDatabase()
  try {
    const summary = await backfillArticleLocations({ apply })
    console.log(JSON.stringify(summary, null, 2))
    if (!apply) console.log('Dry run only. Re-run with --apply to write proposed associations.')
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
