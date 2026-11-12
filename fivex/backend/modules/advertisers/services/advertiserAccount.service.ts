import { logger } from '../../../config/logger.js'
import { mailService } from '../../../mail/mail.service.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { comparePassword, hashPassword } from '../../../utils/password.js'
import type { AdvertiserDocument } from '../models/Advertiser.js'
import { advertiserRepository } from '../repositories/advertiser.repository.js'
import type {
  ChangePasswordInput,
  UpdateNotificationsInput,
  UpdateProfileInput,
} from '../validations/advertiser.validation.js'
import { removeAdvertiserImage, storeAdvertiserImage } from './advertiserMedia.service.js'

function accountNotFound(): AppError {
  return new AppError('Account not found.', 404)
}

export const advertiserAccountService = {
  async updateProfile(advertiserId: string, input: UpdateProfileInput): Promise<AdvertiserDocument> {
    const advertiser = await advertiserRepository.updateProfile(advertiserId, input)
    if (!advertiser) throw accountNotFound()
    return advertiser
  },

  async uploadLogo(advertiserId: string, file: Express.Multer.File | undefined): Promise<AdvertiserDocument> {
    if (!file) throw new AppError('Please choose an image to upload.', 400)

    const stored = await storeAdvertiserImage(file)
    const previous = await advertiserRepository.setLogo(advertiserId, stored)
    if (!previous) {
      await removeAdvertiserImage(stored.publicId, stored.storage)
      throw accountNotFound()
    }
    if (previous.profile?.logoPublicId && previous.profile.logoStorage) {
      await removeAdvertiserImage(previous.profile.logoPublicId, previous.profile.logoStorage)
    }

    const advertiser = await advertiserRepository.findById(advertiserId)
    if (!advertiser) throw accountNotFound()
    return advertiser
  },

  async removeLogo(advertiserId: string): Promise<AdvertiserDocument> {
    const previous = await advertiserRepository.setLogo(advertiserId, null)
    if (!previous) throw accountNotFound()
    if (previous.profile?.logoPublicId && previous.profile.logoStorage) {
      await removeAdvertiserImage(previous.profile.logoPublicId, previous.profile.logoStorage)
    }

    const advertiser = await advertiserRepository.findById(advertiserId)
    if (!advertiser) throw accountNotFound()
    return advertiser
  },

  async updateNotifications(advertiserId: string, input: UpdateNotificationsInput): Promise<AdvertiserDocument> {
    const advertiser = await advertiserRepository.updateNotifications(advertiserId, input)
    if (!advertiser) throw accountNotFound()
    return advertiser
  },

  // Signs out every other session (via passwordChangedAt). The caller re-issues this browser's session.
  async changePassword(advertiserId: string, input: ChangePasswordInput): Promise<AdvertiserDocument> {
    const advertiser = await advertiserRepository.findByIdWithSecrets(advertiserId)
    if (!advertiser) throw accountNotFound()

    if (!(await comparePassword(input.currentPassword, advertiser.passwordHash))) {
      throw new AppError('Your current password is incorrect.', 400)
    }

    await advertiserRepository.setPassword(advertiserId, await hashPassword(input.newPassword), new Date())

    void mailService
      .sendAdvertiserPasswordChangedEmail({ businessName: advertiser.businessName, email: advertiser.email })
      .catch((error: unknown) => logger.error(`Failed to send advertiser password-changed notice to ${advertiser.email}`, error))

    return advertiser
  },
}
