import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import { promotionalCodeRepository } from '../repositories/promotionalCode.repository.js'
import type { PromotionalCodeInput } from '../validations/promotionalCode.validation.js'

const DUPLICATE_KEY_ERROR = 11000

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === DUPLICATE_KEY_ERROR
}

async function rejectDuplicateCode<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError('This code already exists.', 409)
    }
    throw error
  }
}

async function requireCode(id: string) {
  const code = Types.ObjectId.isValid(id) ? await promotionalCodeRepository.findById(id) : null
  if (!code) {
    throw new AppError('Promotional code not found.', 404)
  }
  return code
}

export const promotionalCodeService = {
  async list() {
    return promotionalCodeRepository.findAll()
  },

  async create(input: PromotionalCodeInput) {
    return rejectDuplicateCode(() => promotionalCodeRepository.create(input))
  },

  async update(id: string, input: PromotionalCodeInput) {
    await requireCode(id)
    const updated = await rejectDuplicateCode(() => promotionalCodeRepository.updateById(id, input))
    if (!updated) {
      throw new AppError('Promotional code not found.', 404)
    }
    return updated
  },

  async remove(id: string) {
    const existing = await requireCode(id)
    await promotionalCodeRepository.deleteById(String(existing._id))
    return existing
  },
}
