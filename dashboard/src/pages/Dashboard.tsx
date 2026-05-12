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
    // 1. Carregamento Inicial
    axios.get('http://localhost:3333/checkin/risco', { headers })
      .then(res => setAlunosRisco(res.data))
      .catch(err => console.error("Erro ao buscar risco:", err))

    axios.get('http://localhost:3333/alunos/ranking/1', { headers })
      .then(res => setRanking(res.data))
      .catch(err => console.error("Erro ao buscar ranking:", err))

    // 2. Configuração do Socket
    socket.on('connect', () => setConectado(true))
    socket.on('disconnect', () => setConectado(false))

    socket.on('presenca:nova', (data: any) => {
      console.log("Recebi presença via socket:", data)

      const novaPresenca: Checkin = {
        aluno: {
          id: data.aluno.id,
          nome: data.aluno.nome,
          pontos: data.aluno.pontos,
          turma: data.aluno.turma?.nome || 'Turma'
        },
        emRisco: data.emRisco || false,
        horario: data.data || new Date().toISOString()
      }

      setCheckins(prev => [novaPresenca, ...prev].slice(0, 20))
      setTotalHoje(prev => prev + 1)

      // Atualiza ranking e risco automaticamente
      axios.get('http://localhost:3333/alunos/ranking/1', { headers })
        .then(res => setRanking(res.data))
      
      if (data.emRisco) {
        axios.get('http://localhost:3333/checkin/risco', { headers })
          .then(res => setAlunosRisco(res.data))
      }
    })

    return () => {
      socket.off('presenca:nova')
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
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{professor?.nome}</span>
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
        {/* Lista de Check-ins */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#63b3ed' }}>⚡ Check-ins em Tempo Real</h2>
          {checkins.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>Aguardando...</p>
          ) : (
            checkins.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>{c.aluno.nome}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#63b3ed' }}>{new Date(c.horario).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Ranking */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#f6c90e' }}>🏆 Ranking — 9º Ano A</h2>
          {ranking.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <span>{medalha(i)} {a.nome}</span>
              <span style={{ color: '#f6c90e' }}>{a.pontos} pts</span>
            </div>
          ))}
        </div>

        {/* Alunos em Risco */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#ff6b6b' }}>🚨 Busca Ativa</h2>
          {alunosRisco.map((a, i) => (
            <div key={i} style={{ background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{a.nome}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}