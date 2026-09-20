import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  clearSession,
  loadSession,
  saveSession,
  Session,
} from '../services/session'

type SessionContextValue = {
  session: Session | null
  isLoading: boolean
  signIn: (session: Session) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
)

type SessionProviderProps = {
  children: ReactNode
}

export function SessionProvider({
  children,
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const storedSession = await loadSession()

        if (isMounted) {
          setSession(storedSession)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = useCallback(async (nextSession: Session) => {
    await saveSession(nextSession)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(async () => {
    await clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut],
  )

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error(
      'useSession deve ser usado dentro de SessionProvider',
    )
  }

  return context
}
