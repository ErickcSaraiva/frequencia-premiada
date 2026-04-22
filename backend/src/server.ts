import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import turmaRoutes from './routes/turmaRoutes'
import alunoRoutes from './routes/alunoRoutes'
import disciplinaRoutes from './routes/disciplinaRoutes'
import checkinRoutes from './routes/checkinRoutes'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

// Rotas
app.use('/auth', authRoutes)
app.use('/turmas', turmaRoutes)
app.use('/alunos', alunoRoutes)
app.use('/disciplinas', disciplinaRoutes)
app.use('/checkin', checkinRoutes)

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Frequência Premiada API rodando! 🚀' })
})

// Socket.io — conexão em tempo real
io.on('connection', (socket) => {
  console.log(`✅ Dashboard conectado: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`❌ Dashboard desconectado: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3333

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

export { io }