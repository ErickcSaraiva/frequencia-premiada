import { Router } from 'express'
import { cadastrarAluno, listarAlunosPorTurma, buscarAlunoPorTag } from '../controllers/alunoController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', autenticar, cadastrarAluno)
router.get('/turma/:turmaId', autenticar, listarAlunosPorTurma)
router.get('/tag/:tag_nfc', autenticar, buscarAlunoPorTag)

export default router