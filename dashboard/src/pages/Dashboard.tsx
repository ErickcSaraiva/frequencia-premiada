import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:3333')

interface Checkin {
  aluno: {
    id: number
    nome: string
    pontos: number
    turma: string
  }
  emRisco: boolean
  horario: string
}

interface AlunoRisco {
  id: number
  nome: string
  turma: { nome: string }
}

export default function Dashboard() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>([])
  const [conectado, setConectado] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const professor = JSON.parse(localStorage.getItem('professor') || '{}')

  useEffect(() => {
    // Busca alunos em risco ao carregar
    axios.get('http://localhost:3333/checkin/risco', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAlunosRisco(res.data))

    // Conecta ao Socket.io
    socket.on('connect', () => setConectado(true))
    socket.on('disconnect', () => setConectado(false))

    // Escuta eventos de check-in em tempo real
    socket.on('checkin', (data: Checkin) => {
      setCheckins(prev => [data, ...prev].slice(0, 20))
      if (data.emRisco) {
        setAlunosRisco(prev => [...prev, data.aluno as any])
      }
    })

    return () => {
      socket.off('checkin')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('professor')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>🎓 EduPoints</h1>
          <span style={{
            background: conectado ? 'rgba(72,199,142,0.2)' : 'rgba(255,107,107,0.2)',
            color: conectado ? '#48c78e' : '#ff6b6b',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
          }}>
            {conectado ? '● Ao vivo' : '● Desconectado'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {professor.nome}
          </span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,107,107,0.2)',
            color: '#ff6b6b',
            border: '1px solid rgba(255,107,107,0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Check-ins em tempo real */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#63b3ed' }}>
            ⚡ Check-ins em Tempo Real
          </h2>
          {checkins.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
              Aguardando check-ins...
            </p>
          ) : (
            checkins.map((c, i) => (
              <div key={i} style={{
                background: c.emRisco ? 'rgba(255,107,107,0.1)' : 'rgba(72,199,142,0.1)',
                border: `1px solid ${c.emRisco ? 'rgba(255,107,107,0.3)' : 'rgba(72,199,142,0.3)'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{c.aluno.nome}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {c.aluno.turma} • {c.aluno.pontos} pts
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(c.horario).toLocaleTimeString('pt-BR')}
                  </p>
                  {c.emRisco && (
                    <span style={{ color: '#ff6b6b', fontSize: '12px' }}>⚠️ Risco</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alunos em risco */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#ff6b6b' }}>
            🚨 Busca Ativa — Alunos em Risco
          </h2>
          {alunosRisco.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
              Nenhum aluno em risco 🎉
            </p>
          ) : (
            alunosRisco.map((a, i) => (
              <div key={i} style={{
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '8px',
              }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{a.nome}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {a.turma?.nome} • 3+ faltas consecutivas
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}