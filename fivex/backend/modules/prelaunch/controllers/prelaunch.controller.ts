import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { prelaunchService } from '../services/prelaunch.service.js'
import type { AccessCodeInput, JoinWaitlistInput } from '../validations/prelaunch.validation.js'

export const prelaunchController = {
  joinWaitlist: asyncHandler(async (req: Request, res: Response) => {
    await prelaunchService.joinWaitlist(req.body as JoinWaitlistInput)
    res.status(200).json({ message: "You're on the list. We'll email you when your access opens." })
  }),

  verifyAccess: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body as AccessCodeInput
    prelaunchService.verifyAccessCode(code)
    res.status(200).json({ granted: true })
  }),
}
