import { Router } from 'express'
import { 
  cadastrarAluno, 
  listarAlunosPorTurma, 
  buscarAlunoPorTag, 
  rankingPorTurma,
  vincularNfc // Importando a nova função de "Batismo"
} from '../controllers/alunoController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

// Cadastro inicial do aluno (via painel web/admin)
router.post('/', autenticar, cadastrarAluno)

// Listagem da turma (para o app do professor)
router.get('/turma/:turmaId', autenticar, listarAlunosPorTurma)

// O "Bip" da tag - Atualizado o parâmetro para :nfc_uid
router.get('/tag/:nfc_uid', autenticar, buscarAlunoPorTag)

// Gamificação - O ranking que gera o engajamento
router.get('/ranking/:turmaId', autenticar, rankingPorTurma)

// "Batismo" da Tag - Associa a tag física a um aluno já matriculado
router.patch('/vincular-nfc', autenticar, vincularNfc)

export default router