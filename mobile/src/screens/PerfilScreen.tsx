import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useSession } from '../contexts/SessionContext'

export default function PerfilScreen() {
  const { session, signOut } = useSession()

  if (!session) {
    return null
  }

  const isProfessor = session.role === 'professor'
  const identifier = isProfessor
    ? session.user.email
    : session.user.matricula

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <Text style={styles.brand}>EduPoints</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>♙</Text>
        </View>

        <Text style={styles.title}>{session.user.nome}</Text>

        <Text style={styles.role}>
          {isProfessor ? 'Professor' : 'Aluno'}
        </Text>

        {identifier && (
          <Text style={styles.identifier}>{identifier}</Text>
        )}

        <Text style={styles.subtitle}>
          Configurações da sua conta.
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={signOut}
        >
          <Text style={styles.logoutText}>Sair do aplicativo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const colors = {
  background: '#10131a',
  primary: '#adc6ff',
  onSurface: '#e1e2ec',
  onSurfaceVariant: '#c2c6d6',
  outlineVariant: '#424754',
  error: '#ffb4ab',
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topbar: {
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: '#171a22',
    justifyContent: 'center',
  },
  brand: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#273A63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarIcon: {
    fontSize: 50,
    color: colors.primary,
  },
  title: {
    color: colors.onSurface,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  role: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  identifier: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    marginBottom: 24,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '700',
  },
})
