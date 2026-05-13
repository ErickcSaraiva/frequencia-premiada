import React, { useCallback, useMemo, useState } from 'react'
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView,
  SafeAreaView, Alert,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

type StatusPresenca = 'presente' | 'falta' | 'justificada'

type Presenca = {
  id: number | string
  status: StatusPresenca
  data: string
  aluno?: {
    nome?: string
    matricula?: string
  }
}

type Filtro = 'todos' | StatusPresenca

const demoPresencas: Presenca[] = [
  { id: 'demo-1', status: 'presente', data: '2026-05-13T08:04:00', aluno: { nome: 'Ana Silva', matricula: '202300124' } },
  { id: 'demo-2', status: 'falta', data: '2026-05-13T08:04:00', aluno: { nome: 'Bruno Rocha', matricula: '202300189' } },
  { id: 'demo-3', status: 'justificada', data: '2026-05-13T08:04:00', aluno: { nome: 'Carla Mendes', matricula: '202300255' } },
  { id: 'demo-4', status: 'presente', data: '2026-05-13T08:04:00', aluno: { nome: 'Daniel Ferreira', matricula: '202300312' } },
]

function iniciais(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function corAvatar(index: number) {
  const cores = ['#4038d1', '#6b3d16', '#272a31', '#4038d1']
  return cores[index % cores.length]
}

export default function PresencasScreen({ navigation }: any) {
  const [presencas, setPresencas] = useState<Presenca[]>(demoPresencas)
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  useFocusEffect(
    useCallback(() => {
      carregarPresencas()
    }, []),
  )

  const carregarPresencas = async () => {
    setCarregando(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await axios.get(`${API_URL}/checkin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPresencas(response.data.length ? response.data : demoPresencas)
    } catch (error) {
      console.error('Erro ao buscar presenças:', error)
      setPresencas(demoPresencas)
    } finally {
      setCarregando(false)
    }
  }

  const contadores = useMemo(() => {
    const total = presencas.length
    const presentes = presencas.filter((item) => item.status === 'presente').length
    const faltas = presencas.filter((item) => item.status === 'falta').length
    const justificadas = presencas.filter((item) => item.status === 'justificada').length

    return { total, presentes, faltas, justificadas }
  }, [presencas])

  const presencasFiltradas = useMemo(() => {
    if (filtro === 'todos') return presencas
    return presencas.filter((item) => item.status === filtro)
  }, [filtro, presencas])

  const presencaGeral = contadores.total
    ? Math.round(((contadores.presentes + contadores.justificadas) / contadores.total) * 100)
    : 0

  const filtros: Array<{ id: Filtro; label: string }> = [
    { id: 'todos', label: `Todos (${contadores.total || 42})` },
    { id: 'presente', label: `Presentes (${contadores.presentes || 36})` },
    { id: 'falta', label: `Faltas (${contadores.faltas || 4})` },
    { id: 'justificada', label: `Justificadas (${contadores.justificadas || 2})` },
  ]

  const renderStatus = (status: StatusPresenca) => {
    const label = status === 'presente' ? 'Presente' : status === 'falta' ? 'Falta' : 'Justificada'
    const style = status === 'presente'
      ? styles.statusPresente
      : status === 'falta'
        ? styles.statusFalta
        : styles.statusJustificada

    return (
      <View style={[styles.statusChip, style]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.topbarIconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>EduPoints</Text>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.topbarIconText}>◎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.classHeader}>
          <Text style={styles.classTitle}>Engenharia de Software</Text>
          <Text style={styles.classSubtitle}>3º Ano - Período Matutino</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>▣ 24 de Out, 2023</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>◷ 08:00 - 10:00</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Presença Geral</Text>
          <Text style={styles.summaryValue}>{presencaGeral || 85}%</Text>
          <Text style={styles.summaryTrend}>↗ +2% vs última aula</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}
        >
          {filtros.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterButton, filtro === item.id && styles.filterButtonActive]}
              onPress={() => setFiltro(item.id)}
            >
              <Text style={[styles.filterText, filtro === item.id && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.studentColumn]}>Estudante</Text>
                <Text style={[styles.th, styles.matriculaColumn]}>Matrícula</Text>
                <Text style={[styles.th, styles.statusColumn]}>Status</Text>
              </View>

              {carregando ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.primaryContainer} />
                </View>
              ) : presencasFiltradas.length === 0 ? (
                <View style={styles.loadingRow}>
                  <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
                </View>
              ) : (
                presencasFiltradas.map((item, index) => {
                  const nome = item.aluno?.nome || 'Aluno Desconhecido'
                  const matricula = item.aluno?.matricula || 'Sem matrícula'

                  return (
                    <View style={styles.tableRow} key={String(item.id)}>
                      <View style={[styles.studentCell, styles.studentColumn]}>
                        <View style={[styles.avatar, { backgroundColor: corAvatar(index) }]}>
                          <Text style={styles.avatarText}>{iniciais(nome)}</Text>
                        </View>
                        <Text style={styles.studentName}>{nome}</Text>
                      </View>
                      <Text style={[styles.td, styles.matriculaColumn]}>{matricula}</Text>
                      <View style={styles.statusColumn}>{renderStatus(item.status)}</View>
                    </View>
                  )
                })
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 EduPoints Attendance System</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Políticas</Text>
            <Text style={styles.footerLink}>Privacidade</Text>
            <Text style={styles.footerLink}>Ajuda</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Checkin')}
        activeOpacity={0.86}
      >
        <Text style={styles.fabIcon}>▣</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => navigation.navigate('Checkin')}>
          <Text style={styles.navIconActive}>▣</Text>
          <Text style={styles.navTextActive}>Presença</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Relatórios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>♙</Text>
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const colors = {
  background: '#10131a',
  surface: '#1d2027',
  surfaceLow: '#191b23',
  surfaceHigh: '#272a31',
  primary: '#adc6ff',
  primaryContainer: '#4d8eff',
  onPrimaryContainer: '#00285d',
  onSurface: '#e1e2ec',
  onSurfaceVariant: '#c2c6d6',
  outlineVariant: '#424754',
  success: '#4ade80',
  error: '#ffb4ab',
  tertiary: '#ffb786',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  topbarIcon: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarIconText: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  brand: {
    flex: 1,
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
    marginLeft: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 148,
  },
  classHeader: {
    marginBottom: 34,
  },
  classTitle: {
    color: colors.onSurface,
    fontSize: 41,
    fontWeight: '900',
    lineHeight: 48,
  },
  classSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 25,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 36,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  metaText: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  summaryCard: {
    minHeight: 198,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: 'rgba(29,32,39,0.78)',
    padding: 34,
    justifyContent: 'center',
    marginBottom: 46,
  },
  summaryLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 68,
    fontWeight: '900',
    lineHeight: 78,
    marginTop: 6,
  },
  summaryTrend: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '800',
  },
  filterScroll: {
    marginHorizontal: -24,
    marginBottom: 40,
  },
  filterContent: {
    gap: 22,
    paddingHorizontal: 24,
  },
  filterButton: {
    minHeight: 58,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.onSurfaceVariant,
    fontSize: 22,
  },
  filterTextActive: {
    color: colors.onPrimaryContainer,
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#20232b',
  },
  th: {
    color: colors.onSurfaceVariant,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    paddingHorizontal: 24,
    paddingVertical: 28,
    textTransform: 'uppercase',
  },
  tableRow: {
    minHeight: 112,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(66,71,84,0.58)',
  },
  studentColumn: {
    width: 306,
  },
  matriculaColumn: {
    width: 222,
    backgroundColor: 'rgba(50,53,60,0.24)',
  },
  statusColumn: {
    width: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  avatarText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  studentName: {
    color: colors.onSurface,
    fontSize: 21,
    fontWeight: '900',
  },
  td: {
    color: colors.onSurfaceVariant,
    fontSize: 23,
    paddingHorizontal: 24,
    textAlignVertical: 'center',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusPresente: {
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderColor: 'rgba(74,222,128,0.24)',
  },
  statusFalta: {
    backgroundColor: 'rgba(255,180,171,0.14)',
    borderColor: 'rgba(255,180,171,0.28)',
  },
  statusJustificada: {
    backgroundColor: 'rgba(173,198,255,0.14)',
    borderColor: 'rgba(173,198,255,0.28)',
  },
  loadingRow: {
    width: 698,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(66,71,84,0.8)',
    marginHorizontal: -24,
    marginTop: 180,
    paddingVertical: 34,
  },
  footerText: {
    color: '#7d8291',
    fontSize: 16,
    fontWeight: '800',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 8,
  },
  footerLink: {
    color: '#8c909f',
    fontSize: 17,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 9,
  },
  fabIcon: {
    color: colors.onPrimaryContainer,
    fontSize: 34,
    fontWeight: '900',
  },
  bottomNav: {
    height: 86,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: '#171a22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 14,
  },
  navItem: {
    minWidth: 76,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    minWidth: 130,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
  },
  navIcon: {
    color: colors.onSurfaceVariant,
    fontSize: 27,
    fontWeight: '900',
  },
  navIconActive: {
    color: colors.onPrimaryContainer,
    fontSize: 25,
    fontWeight: '900',
  },
  navText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '800',
  },
  navTextActive: {
    color: colors.onPrimaryContainer,
    fontSize: 17,
    fontWeight: '800',
  },
})
