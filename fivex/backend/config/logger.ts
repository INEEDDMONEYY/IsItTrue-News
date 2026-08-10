/* eslint-disable no-console */
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function timestamp(): string {
  return new Date().toISOString()
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log

  if (meta !== undefined) {
    consoleMethod(line, meta)
  } else {
    consoleMethod(line)
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
}
