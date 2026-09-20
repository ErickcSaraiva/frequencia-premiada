import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import { API_URL } from '../config/api'

type StatusPresenca = 'presente' | 'falta' | 'justificada'
type FiltroStatus = 'todos' | StatusPresenca
type Periodo = '7' | '30' | '90' | 'todos'

type Presenca = {
  id: string
  status: StatusPresenca
  data: string
  turma: {
    id: string
    nome: string
    disciplina: { id: string; nome: string } | null
  }
}

type Resumo = {
  total: number
  presentes: number
  faltas: number
  justificadas: number
  percentualFrequencia: number
}

type HistoricoResponse = {
  periodo: {
    valor: Periodo
    inicio: string | null
    fim: string
    fusoHorario: string
  }
  resumo: Resumo
  presencas: Presenca[]
}

type EstadoErro = { titulo: string; mensagem: string } | null

const resumoVazio: Resumo = {
  total: 0,
  presentes: 0,
  faltas: 0,
  justificadas: 0,
  percentualFrequencia: 0,
}

const periodos: Array<{ id: Periodo; label: string }> = [
  { id: '7', label: '7 dias' },
  { id: '30', label: '30 dias' },
  { id: '90', label: '90 dias' },
  { id: 'todos', label: 'Todo o histórico' },
]

const rotulosStatus: Record<StatusPresenca, string> = {
  presente: 'Presente',
  falta: 'Falta',
  justificada: 'Justificada',
}

export default function PresencasScreen() {
  const [presencas, setPresencas] = useState<Presenca[]>([])
  const [resumo, setResumo] = useState<Resumo>(resumoVazio)
  const [fusoHorario, setFusoHorario] = useState('America/Manaus')
  const [periodo, setPeriodo] = useState<Periodo>('30')
  const [status, setStatus] = useState<FiltroStatus>('todos')
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState<EstadoErro>(null)

  const carregarHistorico = useCallback(
    async (modoAtualizacao = false) => {
      modoAtualizacao ? setAtualizando(true) : setCarregando(true)
      setErro(null)

      if (!modoAtualizacao) {
        setPresencas([])
        setResumo(resumoVazio)
      }

      try {
        const token = await AsyncStorage.getItem('token')

        if (!token) {
          setPresencas([])
          setResumo(resumoVazio)
          setErro({
            titulo: 'Sessão encerrada',
            mensagem: 'Entre novamente para consultar seu histórico.',
          })
          return
        }

        const response = await axios.get<HistoricoResponse>(
          `${API_URL}/alunos/me/presencas`,
          {
            params: { periodo },
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          },
        )

        // A API é a única fonte da tela: resposta vazia permanece vazia.
        setPresencas(response.data.presencas ?? [])
        setResumo(response.data.resumo ?? resumoVazio)
        setFusoHorario(response.data.periodo?.fusoHorario ?? 'America/Manaus')
      } catch (falha) {
        setPresencas([])
        setResumo(resumoVazio)

        if (axios.isAxiosError(falha) && falha.response?.status === 401) {
          setErro({
            titulo: 'Sessão expirada',
            mensagem: 'Entre novamente para proteger os seus dados.',
          })
        } else if (axios.isAxiosError(falha) && !falha.response) {
          setErro({
            titulo: 'Sem conexão',
            mensagem: 'Confira sua internet e tente novamente.',
          })
        } else {
          setErro({
            titulo: 'Não foi possível carregar',
            mensagem:
              'O histórico está indisponível no momento. Nenhum dado demonstrativo foi exibido.',
          })
        }
      } finally {
        setCarregando(false)
        setAtualizando(false)
      }
    },
    [periodo],
  )

  useFocusEffect(
    useCallback(() => {
      carregarHistorico()
    }, [carregarHistorico]),
  )

  const contadores = useMemo(
    () => ({
      todos: presencas.length,
      presente: presencas.filter((item) => item.status === 'presente').length,
      falta: presencas.filter((item) => item.status === 'falta').length,
      justificada: presencas.filter((item) => item.status === 'justificada').length,
    }),
    [presencas],
  )

  const presencasFiltradas = useMemo(
    () =>
      status === 'todos'
        ? presencas
        : presencas.filter((item) => item.status === status),
    [presencas, status],
  )

  const formatarData = (data: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: fusoHorario,
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(data))

  const formatarHora = (data: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: fusoHorario,
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(data))

  const filtrosStatus: Array<{ id: FiltroStatus; label: string }> = [
    { id: 'todos', label: `Todos (${contadores.todos})` },
    { id: 'presente', label: `Presentes (${contadores.presente})` },
    { id: 'falta', label: `Faltas (${contadores.falta})` },
    { id: 'justificada', label: `Justificadas (${contadores.justificada})` },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <Text style={styles.brand}>EduPoints</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregarHistorico(true)}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.title}>Meu histórico</Text>
        <Text style={styles.subtitle}>
          Acompanhe suas presenças, faltas e justificativas.
        </Text>

        <Text style={styles.sectionLabel}>Período</Text>
        <FiltroHorizontal
          itens={periodos}
          selecionado={periodo}
          aoSelecionar={(id) => setPeriodo(id as Periodo)}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Frequência no período</Text>
          <Text style={styles.summaryValue}>{resumo.percentualFrequencia}%</Text>
          <Text style={styles.summaryRule}>
            Presenças e faltas justificadas contam como frequência.
          </Text>

          <View style={styles.summaryGrid}>
            <ResumoItem label="Aulas" valor={resumo.total} />
            <ResumoItem label="Presenças" valor={resumo.presentes} />
            <ResumoItem label="Faltas" valor={resumo.faltas} />
            <ResumoItem label="Justificadas" valor={resumo.justificadas} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Status</Text>
        <FiltroHorizontal
          itens={filtrosStatus}
          selecionado={status}
          aoSelecionar={(id) => setStatus(id as FiltroStatus)}
        />

        {carregando ? (
          <EstadoCentral>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateMessage}>Carregando seu histórico...</Text>
          </EstadoCentral>
        ) : erro ? (
          <EstadoCentral>
            <Text style={styles.stateTitle}>{erro.titulo}</Text>
            <Text style={styles.stateMessage}>{erro.mensagem}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => carregarHistorico()}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </EstadoCentral>
        ) : presencas.length === 0 ? (
          <EstadoCentral>
            <Text style={styles.stateTitle}>Nenhum registro no período</Text>
            <Text style={styles.stateMessage}>
              Quando uma chamada for registrada, ela aparecerá aqui.
            </Text>
          </EstadoCentral>
        ) : presencasFiltradas.length === 0 ? (
          <EstadoCentral>
            <Text style={styles.stateTitle}>Nenhum resultado</Text>
            <Text style={styles.stateMessage}>
              Não há registros com o status selecionado neste período.
            </Text>
          </EstadoCentral>
        ) : (
          presencasFiltradas.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.disciplina}>
                  {item.turma.disciplina?.nome ?? item.turma.nome}
                </Text>
                <StatusChip status={item.status} />
              </View>
              {item.turma.disciplina ? (
                <Text style={styles.turma}>{item.turma.nome}</Text>
              ) : null}
              <Text style={styles.date}>{formatarData(item.data)}</Text>
              <Text style={styles.time}>
                {formatarHora(item.data)} · horário de Manaus
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function FiltroHorizontal({
  itens,
  selecionado,
  aoSelecionar,
}: {
  itens: Array<{ id: string; label: string }>
  selecionado: string
  aoSelecionar: (id: string) => void
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContent}
      style={styles.filterScroll}
    >
      {itens.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.filterButton,
            selecionado === item.id && styles.filterButtonActive,
          ]}
          onPress={() => aoSelecionar(item.id)}
        >
          <Text
            style={[
              styles.filterText,
              selecionado === item.id && styles.filterTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

function ResumoItem({ label, valor }: { label: string; valor: number }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryItemValue}>{valor}</Text>
      <Text style={styles.summaryItemLabel}>{label}</Text>
    </View>
  )
}

function StatusChip({ status }: { status: StatusPresenca }) {
  const estiloStatus =
    status === 'presente'
      ? styles.statusPresente
      : status === 'falta'
        ? styles.statusFalta
        : styles.statusJustificada

  return (
    <View style={[styles.statusChip, estiloStatus]}>
      <Text style={styles.statusText}>{rotulosStatus[status]}</Text>
    </View>
  )
}

function EstadoCentral({ children }: { children: React.ReactNode }) {
  return <View style={styles.stateContainer}>{children}</View>
}

const colors = {
  background: '#060D1E',
  surface: '#11182F',
  surfaceHigh: '#1B2642',
  primary: '#B6CBFF',
  primaryContainer: '#5A95FF',
  onPrimaryContainer: '#03163E',
  onSurface: '#E4E9F5',
  onSurfaceVariant: '#AAB2C5',
  outline: '#2D3959',
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topbar: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    backgroundColor: '#0C1428',
  },
  brand: { color: colors.primary, fontSize: 30, fontWeight: '900' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: colors.onSurface, fontSize: 34, fontWeight: '900' },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 6,
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  filterScroll: { marginBottom: 22 },
  filterContent: { gap: 10, paddingRight: 20 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { color: colors.onSurfaceVariant, fontWeight: '700' },
  filterTextActive: { color: colors.onPrimaryContainer },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: 20,
    marginBottom: 24,
  },
  summaryLabel: { color: colors.onSurfaceVariant, fontSize: 16, fontWeight: '700' },
  summaryValue: { color: colors.primary, fontSize: 52, fontWeight: '900', marginTop: 4 },
  summaryRule: { color: colors.onSurfaceVariant, lineHeight: 20, marginBottom: 18 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryItem: {
    width: '47%',
    borderRadius: 14,
    backgroundColor: colors.surfaceHigh,
    padding: 14,
  },
  summaryItemValue: { color: colors.onSurface, fontSize: 24, fontWeight: '900' },
  summaryItemLabel: { color: colors.onSurfaceVariant, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  disciplina: { flex: 1, color: colors.onSurface, fontSize: 18, fontWeight: '800' },
  turma: { color: colors.onSurfaceVariant, marginTop: 5 },
  date: { color: colors.onSurface, textTransform: 'capitalize', marginTop: 16 },
  time: { color: colors.onSurfaceVariant, marginTop: 4 },
  statusChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  statusPresente: { backgroundColor: '#174D37' },
  statusFalta: { backgroundColor: '#662E35' },
  statusJustificada: { backgroundColor: '#5A431F' },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: 28,
    minHeight: 190,
  },
  stateTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  stateMessage: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryText: { color: colors.onPrimaryContainer, fontWeight: '900' },
})
