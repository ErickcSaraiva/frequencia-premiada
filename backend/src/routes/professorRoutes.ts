import { Router } from 'express'
import { cadastrarProfessor } from '../controllers/professorController'
import { autenticar, autorizarRole } from '../middlewares/authMiddleware'

const router = Router()

// Somente um professor autenticado pode cadastrar outro professor.
router.post(
  '/',
  autenticar,
  autorizarRole(['professor']),
  cadastrarProfessor
)

export default router
