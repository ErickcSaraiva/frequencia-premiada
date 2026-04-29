import { Router } from 'express'
import { exportarDadosAluno, anonimizarAluno, listarConsentimentos } from '../controllers/lgpdController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.get('/info', listarConsentimentos)
router.get('/alunos/:id/dados', autenticar, exportarDadosAluno)
router.delete('/alunos/:id', autenticar, anonimizarAluno)

export default router