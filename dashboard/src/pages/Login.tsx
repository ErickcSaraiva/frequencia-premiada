import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setErro('')
    setCarregando(true)

    try {
      const response = await axios.post('http://localhost:3333/auth/login', {
        email,
        senha,
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('professor', JSON.stringify(response.data.professor))
      navigate('/dashboard')
    } catch (err: any) {
      setErro('Email ou senha inválidos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px', fontSize: '28px' }}>
          🎓 EduPoints
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '32px' }}>
          Frequência Premiada
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="professor@escola.com"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="••••••"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {erro && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '16px', fontSize: '14px' }}>
            {erro}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={carregando}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            background: carregando ? 'rgba(99,179,237,0.5)' : 'linear-gradient(135deg, #63b3ed, #4299e1)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: carregando ? 'not-allowed' : 'pointer',
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}