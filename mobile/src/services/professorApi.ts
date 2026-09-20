import axios from 'axios'

import { API_URL } from '../config/api'
import { getSessionToken } from './session'

export type Turma = {
  id: string
  nome: string
}

export type AlunoResumo = {
  id: string
  nome: string
  apelido?: string | null
  matricula: string
  nfc_uid?: string | null
  pontos: number
}

type VincularNfcResponse = {
  message: string
  aluno: AlunoResumo
}

const getAuthorizationHeaders = async () => {
  const token = await getSessionToken()

  if (!token) {
    throw new Error('Sessão não encontrada. Entre novamente.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const normalizeNfcUid = (value: string): string =>
  value
    .trim()
    .replace(/[\s:-]/g, '')
    .toUpperCase()

export const listarTurmas = async (): Promise<Turma[]> => {
  const headers = await getAuthorizationHeaders()

  const response = await axios.get<Turma[]>(
    `${API_URL}/turmas`,
    { headers },
  )

  return response.data
}

export const listarAlunosPorTurma = async (
  turmaId: string,
): Promise<AlunoResumo[]> => {
  const headers = await getAuthorizationHeaders()

  const response = await axios.get<AlunoResumo[]>(
    `${API_URL}/alunos/turma/${encodeURIComponent(turmaId)}`,
    { headers },
  )

  return response.data
}

export const buscarAlunoPorTag = async (
  nfcUid: string,
): Promise<AlunoResumo | null> => {
  const headers = await getAuthorizationHeaders()

  try {
    const response = await axios.get<AlunoResumo>(
      `${API_URL}/alunos/tag/${encodeURIComponent(nfcUid)}`,
      { headers },
    )

    return response.data
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return null
    }

    throw error
  }
}

export const vincularTagNfc = async (
  matricula: string,
  nfcUid: string,
): Promise<VincularNfcResponse> => {
  const headers = await getAuthorizationHeaders()

  const response = await axios.patch<VincularNfcResponse>(
    `${API_URL}/alunos/vincular-nfc`,
    {
      matricula,
      nfc_uid: nfcUid,
    },
    { headers },
  )

  return response.data
}
