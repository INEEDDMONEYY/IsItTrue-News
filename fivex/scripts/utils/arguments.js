
export const args = process.argv.slice(2)

function getOption(name, fallback = '') {
  const prefix = `--${name}=`
  const argument = args.find((item) => item.startsWith(prefix))

  return argument ? argument.slice(prefix.length) : fallback
}

function hasFlag(flag) {
  return args.includes(flag)
}

function getListOption(name, fallback = []) {
  const value = getOption(name)

  if (!value) return fallback

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function requireOption(name) {
  const value = getOption(name)

  if (!value) {
    throw new Error(`Missing required option: --${name}=VALUE`)
  }

  return value
}

function printHelp(title, lines = []) {
  console.log(`\n${title}`)
  console.log('='.repeat(title.length))

  lines.forEach((line) => console.log(line))

  console.log('')
}

export { getOption, hasFlag, getListOption, requireOption, printHelp }
