import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

app.use(cors())
app.use(express.json())

// Rotas
app.use('/auth', authRoutes)

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