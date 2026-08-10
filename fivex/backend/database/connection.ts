import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

mongoose.set('strictQuery', true)

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error)
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
  })

  const connection = await mongoose.connect(env.MONGO_URI)
  logger.info(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`)
  return connection
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect()
}
