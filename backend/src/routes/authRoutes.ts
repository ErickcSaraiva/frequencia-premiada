import { Router } from 'express'
import { cadastrarProfessor, loginProfessor } from '../controllers/authController'

const router = Router()

router.post('/cadastrar', cadastrarProfessor)
router.post('/login', loginProfessor)

export default router