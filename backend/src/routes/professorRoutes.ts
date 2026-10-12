import { Router } from 'express'
import { cadastrarProfessor } from '../controllers/professorController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

// Somente um administrador autenticado pode cadastrar outro professor.
router.post(
  '/',
  autenticar,
  autorizarRole(['admin']),
  cadastrarProfessor
)

export default router
