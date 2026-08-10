import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { upload } from '../../../middleware/upload.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { mediaController } from '../controllers/media.controller.js'

const router = Router()

const CAN_UPLOAD = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]

router.post('/', authenticate, authorize(...CAN_UPLOAD), upload.single('file'), mediaController.upload)
router.delete('/:id', authenticate, authorize(...CAN_UPLOAD), mediaController.remove)

export const mediaRoutes = router
