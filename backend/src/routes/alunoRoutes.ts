import { Router } from 'express'
import { cadastrarAluno, listarAlunosPorTurma, buscarAlunoPorTag, rankingPorTurma } from '../controllers/alunoController'
import { autenticar } from '../middlewares/authMiddleware'


const router = Router()

router.post('/', autenticar, cadastrarAluno)
router.get('/turma/:turmaId', autenticar, listarAlunosPorTurma)
router.get('/tag/:tag_nfc', autenticar, buscarAlunoPorTag)
router.get('/ranking/:turmaId', autenticar, rankingPorTurma)

export default router