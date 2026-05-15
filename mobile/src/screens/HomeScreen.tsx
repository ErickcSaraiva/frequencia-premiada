import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen({ navigation }: any) {
  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'professor'])
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.top}>EduPoints</Text>
      <Text style={styles.title}>Olá, Professor</Text>
      <Text style={styles.sub}>Pronto para gerenciar suas turmas hoje?</Text>

      <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={() => navigation.navigate('Checkin')}>
        <Text style={styles.cardTitle}>Registrar Presença</Text>
        <Text style={styles.cardText}>Inicie a leitura dos cartões NFC dos alunos.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Presencas')}>
        <Text style={styles.cardTitle}>Ver Presenças</Text>
        <Text style={styles.cardText}>Consulte histórico e status dos estudantes.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.logoutText}>Sair</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060D1E', padding: 24 },
  top: { color: '#B6CBFF', fontSize: 40, fontWeight: '800', marginTop: 8 },
  title: { color: '#E2E7F2', fontSize: 48, fontWeight: '900', marginTop: 24 },
  sub: { color: '#AAB2C5', fontSize: 18, marginBottom: 28 },
  card: { backgroundColor: '#121A33', borderWidth: 1, borderColor: '#243252', borderRadius: 20, padding: 24, marginBottom: 16 },
  cardPrimary: { borderColor: '#3559A8' },
  cardTitle: { color: '#B9C9FB', fontSize: 34, fontWeight: '700', marginBottom: 8 },
  cardText: { color: '#B0B8CA', fontSize: 20, lineHeight: 28 },
  logout: { marginTop: 'auto', padding: 16, alignItems: 'center' },
  logoutText: { color: '#93A4D3', fontSize: 18 },
})
