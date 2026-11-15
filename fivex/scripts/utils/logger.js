
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const labels = {
  info: `${colors.cyan}[INFO]${colors.reset}`,
  success: `${colors.green}[SUCCESS]${colors.reset}`,
  warning: `${colors.yellow}[SKIP]${colors.reset}`,
  error: `${colors.red}[ERROR]${colors.reset}`,
  detail: `${colors.gray}[DETAIL]${colors.reset}`,
}

function log(level, message) {
  console.log(`${labels[level] || '[LOG]'} ${message}`)
}

function createSummary() {
  const counts = {
    created: 0,
    skipped: 0,
    failed: 0,
    inspected: 0,
  }

  return {
    increment(type, amount = 1) {
      if (Object.hasOwn(counts, type)) {
        counts[type] += amount
      }
    },

    getCounts() {
      return { ...counts }
    },

    print() {
      console.log('\nSummary')
      console.log('-------')
      console.log(`Created: ${counts.created}`)
      console.log(`Skipped: ${counts.skipped}`)
      console.log(`Failed: ${counts.failed}`)
      console.log(`Inspected: ${counts.inspected}`)
    },
  }
}

export { log, createSummary }
