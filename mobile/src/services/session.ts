import AsyncStorage from '@react-native-async-storage/async-storage'

export type UserRole = 'aluno' | 'professor'

export type SessionUser = {
  id: string
  nome: string
  email?: string
  matricula?: string
  apelido?: string
  turmaId?: string
  pontos?: number
}

export type Session = {
  token: string
  role: UserRole
  user: SessionUser
}

const STORAGE_KEYS = {
  token: 'token',
  role: 'role',
  user: 'user',
} as const

const isUserRole = (value: string | null): value is UserRole =>
  value === 'aluno' || value === 'professor'

const isSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Record<string, unknown>

  return typeof user.id === 'string' && typeof user.nome === 'string'
}

export const saveSession = async ({
  token,
  role,
  user,
}: Session): Promise<void> => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.token, token],
    [STORAGE_KEYS.role, role],
    [STORAGE_KEYS.user, JSON.stringify(user)],
  ])

  // Remove as chaves antigas para não deixar dados de outra sessão.
  await AsyncStorage.multiRemove(['aluno', 'professor'])
}

export const loadSession = async (): Promise<Session | null> => {
  const values = await AsyncStorage.multiGet([
    STORAGE_KEYS.token,
    STORAGE_KEYS.role,
    STORAGE_KEYS.user,
  ])

  const stored = Object.fromEntries(values)
  const token = stored[STORAGE_KEYS.token]
  const role = stored[STORAGE_KEYS.role]
  const serializedUser = stored[STORAGE_KEYS.user]

  if (!token || !isUserRole(role) || !serializedUser) {
    return null
  }

  try {
    const user: unknown = JSON.parse(serializedUser)

    if (!isSessionUser(user)) {
      await clearSession()
      return null
    }

    return {
      token,
      role,
      user,
    }
  } catch {
    await clearSession()
    return null
  }
}

export const getSessionToken = (): Promise<string | null> =>
  AsyncStorage.getItem(STORAGE_KEYS.token)

export const clearSession = (): Promise<void> =>
  AsyncStorage.multiRemove([
    STORAGE_KEYS.token,
    STORAGE_KEYS.role,
    STORAGE_KEYS.user,
    'aluno',
    'professor',
  ])
