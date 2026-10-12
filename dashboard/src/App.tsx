import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard, { type EduPointsView } from './pages/Dashboard.tsx'
import Login from './pages/Login.tsx'

function ProtectedRoute({ view }: { view: EduPointsView }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  let perfil: unknown

try {
  const conta = JSON.parse(localStorage.getItem('professor') || '{}')
  perfil = conta?.perfil
} catch {
  return <Navigate to="/login" replace />
}

if (perfil !== 'admin' && perfil !== 'professor') {
  return <Navigate to="/login" replace />
}

if (view === 'director' && perfil !== 'admin') {
  return <Navigate to="/turmas" replace />
}

  return <Dashboard view={view} />
}

function App() {
  const token = localStorage.getItem('token')

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/inicio' : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute view="director" />} />
      <Route path="/inicio" element={<ProtectedRoute view="home" />} />
      <Route path="/turmas" element={<ProtectedRoute view="turmas" />} />
      <Route path="/chamada" element={<ProtectedRoute view="nfc" />} />
      <Route path="/presencas" element={<ProtectedRoute view="attendance" />} />
      <Route path="*" element={<Navigate to={token ? '/inicio' : '/login'} replace />} />
    </Routes>
  )
}

export default App
