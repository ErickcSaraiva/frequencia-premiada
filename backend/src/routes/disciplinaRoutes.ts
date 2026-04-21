import { Router } from 'express'
import { cadastrarDisciplina, listarDisciplinas } from '../controllers/disciplinaController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, cadastrarDisciplina)
router.get('/', autenticar, listarDisciplinas)

export default router