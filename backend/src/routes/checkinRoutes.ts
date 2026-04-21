import { Router } from 'express'
import { registrarCheckin, listarPresencasPorTurma, listarAlunosEmRisco } from '../controllers/checkinController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, registrarCheckin)
router.get('/turma/:turmaId', autenticar, listarPresencasPorTurma)
router.get('/risco', autenticar, listarAlunosEmRisco)

export default router