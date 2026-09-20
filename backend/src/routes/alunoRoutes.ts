import { Router } from 'express'
import { 
  cadastrarAluno, 
  loginAluno,          
  listarAlunosPorTurma, 
  buscarAlunoPorTag, 
  rankingPorTurma,
  vincularNfc 
} from '../controllers/alunoController'
import { autenticar } from '../middlewares/authMiddleware'
import { autorizarRole } from '../middlewares/authMiddleware'
import { listarMeuHistorico } from '../controllers/historicoAlunoController'

const router = Router()

// 1. ROTA PÚBLICA: Login do Aluno no App Mobile
// Não usa o middleware 'autenticar' porque o aluno ainda não tem o Token JWT
router.post(
  '/',
  autenticar,
  autorizarRole(['professor']),
  cadastrarAluno,
)

// 2. ROTAS PROTEGIDAS (Exigem Token de autenticação)

// O ID vem do JWT. A rota não aceita alunoId por URL ou query string, evitando
// que um estudante tente consultar o histórico de outro.
router.get('/me/presencas', autenticar, autorizarRole(['aluno']), listarMeuHistorico)

// Cadastro inicial do aluno (via painel web do professor/admin)
router.post('/', autenticar, cadastrarAluno)

// Listagem da turma (para o app/painel do professor)
router.get(
  '/turma/:turmaId',
  autenticar,
  autorizarRole(['professor']),
  listarAlunosPorTurma,
)

// O "Bip" da tag NFC
router.get(
  '/tag/:nfc_uid',
  autenticar,
  autorizarRole(['professor']),
  buscarAlunoPorTag,
)

// Gamificação - Ranking público da turma
router.get('/ranking/:turmaId', autenticar, rankingPorTurma)

// "Batismo" da Tag - Associa a tag física a um aluno já matriculado
router.patch(
  '/vincular-nfc',
  autenticar,
  autorizarRole(['professor']),
  vincularNfc,
)

export default router
