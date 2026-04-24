import { Router } from 'express'
import { editarPresenca, lancarFaltaJustificada, listarAuditoria } from '../controllers/presencaController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()

router.put('/:id', autenticar, editarPresenca)
router.post('/justificada', autenticar, lancarFaltaJustificada)
router.get('/auditoria', autenticar, listarAuditoria)

export default router