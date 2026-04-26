import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen({ navigation }: any) {
  const [professor, setProfessor] = useState<any>(null)

  useEffect(() => {
    AsyncStorage.getItem('professor').then(data => {
      if (data) setProfessor(JSON.parse(data))
    })
  }, [])

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('professor')
    navigation.replace('Login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bemVindo}>Olá, {professor?.nome || 'Professor'} 👋</Text>
      <Text style={styles.subtitulo}>O que deseja fazer?</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Checkin')}
      >
        <Text style={styles.cardIcon}>📱</Text>
        <Text style={styles.cardTitulo}>Registrar Presença</Text>
        <Text style={styles.cardDesc}>Aproxime a tag NFC do aluno para registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.cardSecundario]}>
        <Text style={styles.cardIcon}>📊</Text>
        <Text style={styles.cardTitulo}>Ver Presenças</Text>
        <Text style={styles.cardDesc}>Consulte o histórico da turma</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
        <Text style={styles.botaoSairTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  bemVindo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(99,179,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,179,237,0.3)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardSecundario: {
    backgroundColor: 'rgba(72,199,142,0.1)',
    borderColor: 'rgba(72,199,142,0.3)',
  },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  botaoSair: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  botaoSairTexto: { color: '#ff6b6b', fontWeight: 'bold', fontSize: 16 },
})