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

interface AlunoRanking {
  id: number
  nome: string
  pontos: number
  turma: { nome: string }
}

export default function Dashboard() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>([])
  const [ranking, setRanking] = useState<AlunoRanking[]>([])
  const [totalHoje, setTotalHoje] = useState(0)
  const [conectado, setConectado] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const professor = JSON.parse(localStorage.getItem('professor') || '{}')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    // Busca alunos em risco
    axios.get('http://localhost:3333/checkin/risco', { headers })
      .then(res => setAlunosRisco(res.data))

    // Busca ranking da turma 1
    axios.get('http://localhost:3333/alunos/ranking/1', { headers })
      .then(res => setRanking(res.data))

    // Socket.io
    socket.on('connect', () => setConectado(true))
    socket.on('disconnect', () => setConectado(false))

    socket.on('checkin', (data: Checkin) => {
      setCheckins(prev => [data, ...prev].slice(0, 20))
      setTotalHoje(prev => prev + 1)
      if (data.emRisco) {
        setAlunosRisco(prev => [...prev, data.aluno as any])
      }
      // Atualiza ranking
      axios.get('http://localhost:3333/alunos/ranking/1', { headers })
        .then(res => setRanking(res.data))
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

  const medalha = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}º`
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
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{professor.nome}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,107,107,0.2)',
            color: '#ff6b6b',
            border: '1px solid rgba(255,107,107,0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}>Sair</button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.3)', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>CHECK-INS HOJE</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#63b3ed' }}>{totalHoje}</p>
        </div>
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>ALUNOS EM RISCO</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b' }}>{alunosRisco.length}</p>
        </div>
        <div style={{ background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.3)', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>ALUNOS CADASTRADOS</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#48c78e' }}>{ranking.length}</p>
        </div>
      </div>

      {/* Grid principal */}
      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>

        {/* Check-ins em tempo real */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#63b3ed' }}>⚡ Check-ins em Tempo Real</h2>
          {checkins.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>Aguardando check-ins...</p>
          ) : (
            checkins.map((c, i) => (
              <div key={i} style={{
                background: c.emRisco ? 'rgba(255,107,107,0.1)' : 'rgba(72,199,142,0.1)',
                border: `1px solid ${c.emRisco ? 'rgba(255,107,107,0.3)' : 'rgba(72,199,142,0.3)'}`,
                borderRadius: '8px', padding: '10px 14px', marginBottom: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{c.aluno.nome}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{c.aluno.turma} • {c.aluno.pontos} pts</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{new Date(c.horario).toLocaleTimeString('pt-BR')}</p>
                  {c.emRisco && <span style={{ color: '#ff6b6b', fontSize: '11px' }}>⚠️ Risco</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ranking */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#f6c90e' }}>🏆 Ranking — 9º Ano A</h2>
          {ranking.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>Nenhum aluno cadastrado</p>
          ) : (
            ranking.map((a, i) => (
              <div key={a.id} style={{
                background: i === 0 ? 'rgba(246,201,14,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? 'rgba(246,201,14,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', padding: '10px 14px', marginBottom: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{medalha(i)}</span>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: i === 0 ? 'bold' : 'normal' }}>{a.nome}</p>
                </div>
                <span style={{ color: '#f6c90e', fontWeight: 'bold', fontSize: '14px' }}>{a.pontos} pts</span>
              </div>
            ))
          )}
        </div>

        {/* Busca Ativa */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#ff6b6b' }}>🚨 Busca Ativa — Em Risco</h2>
          {alunosRisco.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>Nenhum aluno em risco 🎉</p>
          ) : (
            alunosRisco.map((a, i) => (
              <div key={i} style={{
                background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '8px',
              }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{a.nome}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{a.turma?.nome} • 3+ faltas consecutivas</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}