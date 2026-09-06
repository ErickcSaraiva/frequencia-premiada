import { Router } from 'express'
import { loginProfessor } from '../controllers/authController'

const router = Router()

// O login permanece público.
router.post('/login', loginProfessor)

export default router
