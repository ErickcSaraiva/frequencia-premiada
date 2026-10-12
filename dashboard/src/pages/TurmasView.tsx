import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

type Turma = {
  id: string
  nome: string
}
type Aluno = {
  id: string
  nome: string
  matricula: string
  nfc_uid: string | null
  pontos: number
}

export default function TurmasView({ token }: { token: string | null }) {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [carregandoAlunos, setCarregandoAlunos] = useState(false)
  const [erroAlunos, setErroAlunos] = useState('')
  const [tentativaAlunos, setTentativaAlunos] = useState(0)
  const perfil = (() => {
  try {
    const conta = JSON.parse(localStorage.getItem('professor') || '{}')
      return conta?.perfil
    } catch {
      return null
    }
  })()
  const [nomeNovaTurma, setNomeNovaTurma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState('')
  const [sucessoCadastro, setSucessoCadastro] = useState('')

  // Consulta as turmas ao abrir a tela ou solicitar uma atualização.
  useEffect(() => {
    const controller = new AbortController()

    async function carregarTurmas() {
      setCarregando(true)
      setErro('')

      try {
        const resposta = await axios.get<Turma[]>(`${API_URL}/turmas`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          setTurmas(resposta.data)
        }
      } catch (error) {
        if (controller.signal.aborted) return

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErro('Sua sessão expirou. Saia e faça login novamente.')
        } else if (axios.isAxiosError(error) && error.response?.status === 403) {
          setErro('Seu acesso não permite consultar turmas.')
        } else {
          setErro('Não foi possível carregar as turmas.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false)
        }
      }
    }

    void carregarTurmas()

    return () => controller.abort()
  }, [token, tentativa])

  // Envia o nome para a API e atualiza a lista após o cadastro.
  async function criarTurma() {
    if (salvando) return

    const nome = nomeNovaTurma.trim()

    setErroCadastro('')
    setSucessoCadastro('')

    if (!nome) {
      setErroCadastro('Informe o nome da turma.')
      return
    }

    setSalvando(true)

    try {
      await axios.post(
        `${API_URL}/turmas`,
        { nome },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setNomeNovaTurma('')
      setBusca('')
      setSucessoCadastro('Turma cadastrada com sucesso!')
      setTentativa((valor) => valor + 1)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErroCadastro('Sua sessão expirou. Faça login novamente.')
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErroCadastro('Seu acesso não permite cadastrar turmas.')
      } else {
        setErroCadastro(
          'Não foi possível confirmar o cadastro. Confira a lista antes de tentar novamente.',
        )
      }
    } finally {
      setSalvando(false)
    }
  }

  useEffect(() => {
  if (!turmaSelecionada || !token) return

  const controller = new AbortController()

  if (!turmaSelecionada || !token) {
    setCarregandoAlunos(false)
    return
  }

  const controller = new AbortController()
  const turmaId = turmaSelecionada.id

  async function carregarAlunos() {
    setCarregandoAlunos(true)

    try {
      const resposta = await axios.get<Aluno[]>(
        `${API_URL}/alunos/turma/${encodeURIComponent(turmaId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      )

      if (!controller.signal.aborted) {
        setAlunos(resposta.data)
      }
    } catch (error) {
      if (controller.signal.aborted) return

      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined

      setErroAlunos(
        status === 401
          ? 'Sua sessão expirou. Faça login novamente.'
          : status === 403 || status === 404
            ? 'Essa turma não está disponível para seu acesso.'
            : 'Não foi possível carregar os alunos.',
      )
    } finally {
      if (!controller.signal.aborted) {
        setCarregandoAlunos(false)
      }
    }
  }

  void carregarAlunos()
  return () => controller.abort()
}, [turmaSelecionada, token, tentativaAlunos])

  const turmasFiltradas = turmas.filter((turma) =>
    turma.nome
      .toLocaleLowerCase('pt-BR')
      .includes(busca.trim().toLocaleLowerCase('pt-BR')),
  )

  return (
    <main className="home-view">
      <h1>Turmas</h1>
    {perfil === 'professor' && (
      <section aria-labelledby="titulo-cadastro-turma">
        <h2 id="titulo-cadastro-turma">Criar turma</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void criarTurma()
          }}
        >
          <label htmlFor="nome-nova-turma">Nome da turma</label>
          <input
            id="nome-nova-turma"
            type="text"
            value={nomeNovaTurma}
            onChange={(event) => setNomeNovaTurma(event.target.value)}
            placeholder="Ex.: Ciência da Computação"
            required
            disabled={salvando}
          />

          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Criar turma'}
          </button>
        </form>

        {erroCadastro ? <p role="alert">{erroCadastro}</p> : null}
        {sucessoCadastro ? <p role="status">{sucessoCadastro}</p> : null}
          </section>
      )}

      <section aria-labelledby="titulo-lista-turmas">
        <h2 id="titulo-lista-turmas">Turmas cadastradas</h2>
        <p>Pesquise uma turma pelo nome.</p>

        <label htmlFor="busca-turma">Buscar turma</label>
        <input
          id="busca-turma"
          type="search"
          placeholder="Ex.: Ciência da Computação"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        {carregando ? (
          <p role="status">Carregando turmas...</p>
        ) : erro ? (
          <div role="alert">
            <p>{erro}</p>
            <button
              type="button"
              onClick={() => {
                setErroAlunos('')
                setCarregandoAlunos(true)
                setTentativaAlunos((valor) => valor + 1)
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : turmas.length === 0 ? (
          <p>Nenhuma turma cadastrada.</p>
        ) : turmasFiltradas.length === 0 ? (
          <p>Nenhuma turma encontrada para essa busca.</p>
        ) : (
          <ul>
            {turmasFiltradas.map((turma) => (
              <li key={turma.id}>
              <span>{turma.nome}</span>{' '}
              <button
                type="button"
                onClick={() => {
                setAlunos([])
                setErroAlunos('')
                setCarregandoAlunos(true)
                setTurmaSelecionada(turma)
                setTentativaAlunos(valor => valor + 1)
    }}
  >
    Ver alunos
  </button>
</li>
            ))}
          </ul>
        )}
      </section>
      {turmaSelecionada ? (
  <section aria-labelledby="titulo-alunos-turma">
    <h2 id="titulo-alunos-turma">
      Alunos — {turmaSelecionada.nome}
    </h2>

    {carregandoAlunos ? (
      <p role="status">Carregando alunos...</p>
    ) : erroAlunos ? (
      <div role="alert">
        <p>{erroAlunos}</p>
        <button
          type="button"
          onClick={() => setTentativaAlunos(valor => valor + 1)}
        >
          Tentar novamente
        </button>
      </div>
    ) : alunos.length === 0 ? (
      <p>Nenhum aluno cadastrado nesta turma.</p>
    ) : (
      <>
        <p>Total: {alunos.length} alunos</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Matrícula</th>
              <th scope="col">Tag NFC</th>
              <th scope="col">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.matricula}</td>
                <td>{aluno.nfc_uid ? 'Vinculada' : 'Não vinculada'}</td>
                <td>{aluno.pontos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </section>
) : null}
    </main>
  )
}