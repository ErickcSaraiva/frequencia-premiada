import { Router } from 'express'
import { cadastrarTurma, listarTurmas } from '../controllers/turmaController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, cadastrarTurma)
router.get('/', autenticar, listarTurmas)

export default router