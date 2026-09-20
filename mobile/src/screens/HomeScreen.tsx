import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useSession } from '../contexts/SessionContext'

export default function HomeScreen({ navigation }: any) {
  const { session, signOut } = useSession()

  if (!session) {
    return null
  }

  const isProfessor = session.role === 'professor'
  const firstName = session.user.nome.trim().split(/\s+/)[0]

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>EduPoints</Text>

      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>
          {isProfessor ? 'PROFESSOR' : 'ALUNO'}
        </Text>
      </View>

      <Text style={styles.title}>Olá, {firstName}</Text>

      <Text style={styles.subtitle}>
        {isProfessor
          ? 'Pronto para gerenciar suas turmas hoje?'
          : 'Acompanhe sua frequência e seus pontos.'}
      </Text>

      {isProfessor ? (
        <>
          <TouchableOpacity
            style={[styles.card, styles.cardPrimary]}
            onPress={() => navigation.navigate('Checkin')}
          >
            <Text style={styles.cardTitle}>Registrar presença</Text>
            <Text style={styles.cardText}>
              Inicie a leitura das tags NFC dos alunos.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Relatorios')}
          >
            <Text style={styles.cardTitle}>Ver relatórios</Text>
            <Text style={styles.cardText}>
              Consulte presenças e indicadores das turmas.
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={[styles.card, styles.pointsCard]}>
            <Text style={styles.pointsLabel}>Seus pontos</Text>
            <Text style={styles.pointsValue}>
              {session.user.pontos ?? 0}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Presencas')}
          >
            <Text style={styles.cardTitle}>Meu histórico</Text>
            <Text style={styles.cardText}>
              Consulte suas presenças, faltas e justificativas.
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.logout}
        onPress={signOut}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060D1E',
    padding: 24,
  },
  brand: {
    color: '#B6CBFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#243A67',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 24,
  },
  roleBadgeText: {
    color: '#B6CBFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#E2E7F2',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 16,
  },
  subtitle: {
    color: '#AAB2C5',
    fontSize: 18,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#121A33',
    borderWidth: 1,
    borderColor: '#243252',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  cardPrimary: {
    borderColor: '#5A95FF',
  },
  cardTitle: {
    color: '#B9C9FB',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    color: '#B0B8CA',
    fontSize: 18,
    lineHeight: 26,
  },
  pointsCard: {
    alignItems: 'center',
  },
  pointsLabel: {
    color: '#AAB2C5',
    fontSize: 18,
    fontWeight: '700',
  },
  pointsValue: {
    color: '#7FB0FF',
    fontSize: 56,
    fontWeight: '900',
    marginTop: 4,
  },
  logout: {
    marginTop: 'auto',
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#93A4D3',
    fontSize: 18,
  },
})
