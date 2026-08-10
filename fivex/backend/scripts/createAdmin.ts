/**
 * One-off CLI script to create (or promote) an admin user.
 *
 * Usage:
 *   npm run seed:admin -- fantometechnologies@gmail.com "Admin Name"
 *
 * The password is entered interactively (masked, never passed as a CLI arg
 * or environment variable) so it never ends up in shell history or logs.
 */
import readline from 'node:readline'
import { connectDatabase, disconnectDatabase } from '../database/connection.js'
import { User } from '../modules/users/models/User.js'
import { passwordSchema } from '../modules/auth/validations/auth.validation.js'
import { ROLES } from '../shared/constants/roles.js'
import { hashPassword } from '../utils/password.js'
import { logger } from '../config/logger.js'

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const rlInternal = rl as unknown as {
      _writeToOutput: (text: string) => void
      output: NodeJS.WritableStream
    }
    let isFirstWrite = true
    rlInternal._writeToOutput = (text: string) => {
      if (isFirstWrite) {
        rlInternal.output.write(text)
        isFirstWrite = false
        return
      }
      if (text === '\r\n' || text === '\n') {
        rlInternal.output.write(text)
        return
      }
      rlInternal.output.write('*')
    }

    rl.question(query, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

async function promptForPassword(): Promise<string> {
  for (;;) {
    const password = await promptHidden('Enter a password for this admin account: ')
    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      console.log(`✖ ${result.error.issues[0]?.message ?? 'Invalid password.'} Please try again.`)
      continue
    }

    const confirmation = await promptHidden('Confirm password: ')
    if (confirmation !== password) {
      console.log('✖ Passwords do not match. Please try again.')
      continue
    }

    return password
  }
}

async function main() {
  const email = (process.argv[2] ?? 'fantometechnologies@gmail.com').trim().toLowerCase()
  const name = process.argv[3] ?? 'Admin'

  console.log(`Creating/promoting admin account for: ${email}`)
  const password = await promptForPassword()
  const passwordHash = await hashPassword(password)

  await connectDatabase()

  const existing = await User.findOne({ email })

  if (existing) {
    existing.name = name
    existing.passwordHash = passwordHash
    existing.role = ROLES.ADMIN
    existing.isEmailVerified = true
    await existing.save()
    logger.info(`Existing user promoted to admin: ${email}`)
  } else {
    await User.create({
      name,
      email,
      passwordHash,
      role: ROLES.ADMIN,
      isEmailVerified: true,
    })
    logger.info(`New admin user created: ${email}`)
  }

  await disconnectDatabase()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Failed to create admin user', error)
    process.exit(1)
  })
