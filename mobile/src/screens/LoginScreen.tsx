import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import axios from 'axios'

import { API_URL } from '../config/api'
import { useSession } from '../contexts/SessionContext'
import { UserRole } from '../services/session'

export default function LoginScreen() {
  const { signIn } = useSession()
  const [role, setRole] = useState<UserRole>('aluno')
  const [identifier, setIdentifier] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const selectRole = (nextRole: UserRole) => {
    setRole(nextRole)
    setIdentifier('')
    setSenha('')
  }

  const onLogin = async () => {
    const normalizedIdentifier = identifier.trim()

    if (!normalizedIdentifier || !senha) {
      Alert.alert(
        'Atenção',
        role === 'aluno'
          ? 'Preencha matrícula e senha.'
          : 'Preencha e-mail e senha.',
      )
      return
    }

    setLoading(true)

    try {
      if (role === 'aluno') {
        const response = await axios.post(`${API_URL}/alunos/login`, {
          matricula: normalizedIdentifier.toUpperCase(),
          senha,
        })

        await signIn({
          token: response.data.token,
          role: 'aluno',
          user: response.data.aluno,
        })
      } else {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: normalizedIdentifier.toLowerCase(),
          senha,
        })

        await signIn({
          token: response.data.token,
          role: 'professor',
          user: response.data.professor,
        })
      }
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.erro || 'Falha ao autenticar',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>EduPoints</Text>
      <Text style={styles.subtitle}>Gestão de presença inteligente</Text>

      <View style={styles.roleSelector}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'aluno' && styles.roleButtonSelected,
          ]}
          onPress={() => selectRole('aluno')}
          disabled={loading}
        >
          <Text
            style={[
              styles.roleText,
              role === 'aluno' && styles.roleTextSelected,
            ]}
          >
            Sou aluno
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'professor' && styles.roleButtonSelected,
          ]}
          onPress={() => selectRole('professor')}
          disabled={loading}
        >
          <Text
            style={[
              styles.roleText,
              role === 'professor' && styles.roleTextSelected,
            ]}
          >
            Sou professor
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.profileTitle}>
          Acesso de {role === 'aluno' ? 'aluno' : 'professor'}
        </Text>

        <Text style={styles.label}>
          {role === 'aluno' ? 'MATRÍCULA' : 'E-MAIL'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={
            role === 'aluno' ? 'ALUNO001' : 'professor@escola.com'
          }
          placeholderTextColor="#6E7890"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize={role === 'aluno' ? 'characters' : 'none'}
          autoCorrect={false}
          keyboardType={role === 'professor' ? 'email-address' : 'default'}
          editable={!loading}
        />

        <Text style={styles.label}>SENHA</Text>

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#6E7890"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!loading}
          onSubmitEditing={onLogin}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0b1938" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060D1E',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    color: '#B6CBFF',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#AAB2C5',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#11182F',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonSelected: {
    backgroundColor: '#5A95FF',
  },
  roleText: {
    color: '#AAB2C5',
    fontSize: 16,
    fontWeight: '700',
  },
  roleTextSelected: {
    color: '#03163E',
  },
  card: {
    backgroundColor: '#11182F',
    borderColor: '#253352',
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  profileTitle: {
    color: '#D7E1FF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  label: {
    color: '#A4AEC6',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#171F34',
    borderWidth: 1,
    borderColor: '#2D3959',
    borderRadius: 12,
    color: '#D7E1FF',
    padding: 14,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 18,
    backgroundColor: '#5A95FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#03163E',
    fontSize: 24,
    fontWeight: '800',
  },
})
