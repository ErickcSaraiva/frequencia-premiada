import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha')
      return
    }

    setCarregando(true)
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, senha })
      await AsyncStorage.setItem('token', response.data.token)
      await AsyncStorage.setItem('professor', JSON.stringify(response.data.professor))
      navigation.replace('Home')
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Erro', error.response.data?.erro || 'Email ou senha inválidos')
      } else if (error.request) {
        Alert.alert('Erro de conexão', `Servidor não encontrado em ${API_URL}`)
      } else {
        Alert.alert('Erro', error.message)
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎓</Text>
      <Text style={styles.titulo}>EduPoints</Text>
      <Text style={styles.subtitulo}>Frequência Premiada</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#666"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botaoTexto}>Entrar</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logo: { fontSize: 64, marginBottom: 8 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 48 },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  botao: {
    width: '100%',
    backgroundColor: '#4299e1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})