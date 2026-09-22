import { Router } from 'express'
import { cadastrarTurma, listarTurmas, rankingTurmas } from '../controllers/turmaController'
import {
  autenticar,
  autorizarRole,
} from '../middlewares/authMiddleware'

const router = Router()

router.post(
  '/',
  autenticar,
  autorizarRole(['professor']),
  cadastrarTurma,
)

router.get('/ranking', autenticar, rankingTurmas)

router.get(
  '/',
  autenticar,
  autorizarRole(['professor']),
  listarTurmas,
)

export default router
