import { Router } from 'express'
import { resumoPainel } from '../controllers/painelController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()
router.get('/resumo', autenticar, autorizarRole(['professor']), resumoPainel)
export default router
