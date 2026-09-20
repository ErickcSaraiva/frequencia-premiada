import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import axios from 'axios'
import NfcManager, { NfcTech } from 'react-native-nfc-manager'

import {
  AlunoResumo,
  buscarAlunoPorTag,
  listarAlunosPorTurma,
  listarTurmas,
  normalizeNfcUid,
  Turma,
  vincularTagNfc,
} from '../services/professorApi'

type ApiError = {
  erro?: string
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.erro || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

const confirmLink = (
  aluno: AlunoResumo,
  nfcUid: string,
): Promise<boolean> =>
  new Promise((resolve) => {
    const action = aluno.nfc_uid ? 'Substituir' : 'Vincular'

    Alert.alert(
      `${action} tag NFC`,
      [
        `Aluno: ${aluno.nome}`,
        `Matrícula: ${aluno.matricula}`,
        `Final do UID: ...${nfcUid.slice(-4)}`,
        '',
        `Deseja ${action.toLowerCase()} a tag deste aluno?`,
      ].join('\n'),
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: action,
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(false),
      },
    )
  })

export default function CadastroNfcScreen({
  navigation,
}: any) {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaId, setTurmaId] = useState('')
  const [alunos, setAlunos] = useState<AlunoResumo[]>([])
  const [alunoId, setAlunoId] = useState('')
  const [loading, setLoading] = useState(true)
  const [reading, setReading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nfcAvailable, setNfcAvailable] = useState(true)

  const selectedStudent =
    alunos.find((aluno) => aluno.id === alunoId) ?? null

  const loadClasses = async () => {
    try {
      setLoading(true)

      const response = await listarTurmas()
      setTurmas(response)

      if (response.length > 0) {
        setTurmaId((current) => current || response[0].id)
      }
    } catch (error: unknown) {
      Alert.alert(
        'Erro',
        getErrorMessage(error, 'Não foi possível carregar as turmas.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async (selectedClassId: string) => {
    try {
      setLoading(true)

      const response = await listarAlunosPorTurma(
        selectedClassId,
      )

      setAlunos(response)
      setAlunoId('')
    } catch (error: unknown) {
      setAlunos([])

      Alert.alert(
        'Erro',
        getErrorMessage(error, 'Não foi possível carregar os alunos.'),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const startNfc = async () => {
      try {
        const supported = await NfcManager.isSupported()
        setNfcAvailable(supported)

        if (supported) {
          await NfcManager.start()
        }
      } catch {
        setNfcAvailable(false)
      }
    }

    void startNfc()
    void loadClasses()

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => null)
    }
  }, [])

  useEffect(() => {
    if (turmaId) {
      void loadStudents(turmaId)
    }
  }, [turmaId])

  const readAndLinkTag = async () => {
    if (!selectedStudent) {
      Alert.alert('Atenção', 'Selecione um aluno primeiro.')
      return
    }

    if (!nfcAvailable) {
      Alert.alert(
        'NFC indisponível',
        'Este aparelho não possui NFC disponível.',
      )
      return
    }

    try {
      setReading(true)

      await NfcManager.requestTechnology([
        NfcTech.Ndef,
        NfcTech.NfcA,
      ])

      const tag = await NfcManager.getTag()
      const tagId = tag?.id

      const rawUid = Array.isArray(tagId)
        ? tagId
            .map((byte: number) =>
              byte.toString(16).padStart(2, '0'),
            )
            .join('')
        : String(tagId ?? '')

      const nfcUid = normalizeNfcUid(rawUid)

      if (!/^[0-9A-F]+$/.test(nfcUid)) {
        throw new Error('A tag lida não possui um UID válido.')
      }

      const linkedStudent = await buscarAlunoPorTag(nfcUid)

      if (linkedStudent) {
        if (
          linkedStudent.matricula === selectedStudent.matricula
        ) {
          Alert.alert(
            'Tag já cadastrada',
            `Esta tag já pertence a ${selectedStudent.nome}.`,
          )
        } else {
          Alert.alert(
            'Tag indisponível',
            `Esta tag já está vinculada a ${linkedStudent.nome}.`,
          )
        }

        return
      }

      const confirmed = await confirmLink(
        selectedStudent,
        nfcUid,
      )

      if (!confirmed) {
        return
      }

      setSaving(true)

      const response = await vincularTagNfc(
        selectedStudent.matricula,
        nfcUid,
      )

      Alert.alert('Sucesso', response.message)
      await loadStudents(turmaId)
    } catch (error: unknown) {
      Alert.alert(
        'Erro na leitura',
        getErrorMessage(
          error,
          'Não foi possível ler ou vincular a tag.',
        ),
      )
    } finally {
      setReading(false)
      setSaving(false)
      NfcManager.cancelTechnologyRequest().catch(() => null)
    }
  }

  const busy = loading || reading || saving

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={busy}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Cadastrar tag NFC</Text>
          <Text style={styles.subtitle}>
            Acesso exclusivo do professor
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Escolha a turma</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classList}
        >
          {turmas.map((turma) => (
            <TouchableOpacity
              key={turma.id}
              style={[
                styles.classButton,
                turmaId === turma.id &&
                  styles.classButtonSelected,
              ]}
              onPress={() => setTurmaId(turma.id)}
              disabled={busy}
            >
              <Text
                style={[
                  styles.classButtonText,
                  turmaId === turma.id &&
                    styles.classButtonTextSelected,
                ]}
              >
                {turma.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>2. Escolha o aluno</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#5A95FF"
            style={styles.loader}
          />
        ) : alunos.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum aluno encontrado nesta turma.
          </Text>
        ) : (
          alunos.map((aluno) => {
            const selected = aluno.id === alunoId

            return (
              <TouchableOpacity
                key={aluno.id}
                style={[
                  styles.studentCard,
                  selected && styles.studentCardSelected,
                ]}
                onPress={() => setAlunoId(aluno.id)}
                disabled={busy}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {aluno.nome}
                  </Text>
                  <Text style={styles.studentRegistration}>
                    {aluno.matricula}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.tagStatus,
                    aluno.nfc_uid
                      ? styles.tagRegistered
                      : styles.tagPending,
                  ]}
                >
                  {aluno.nfc_uid
                    ? 'Tag cadastrada'
                    : 'Sem tag'}
                </Text>
              </TouchableOpacity>
            )
          })
        )}

        <Text style={styles.sectionTitle}>3. Leia a tag</Text>

        <TouchableOpacity
          style={[
            styles.readButton,
            (!selectedStudent || busy || !nfcAvailable) &&
              styles.readButtonDisabled,
          ]}
          onPress={readAndLinkTag}
          disabled={!selectedStudent || busy || !nfcAvailable}
        >
          {reading || saving ? (
            <ActivityIndicator color="#03163E" />
          ) : (
            <>
              <Text style={styles.readButtonIcon}>📡</Text>
              <Text style={styles.readButtonText}>
                {selectedStudent
                  ? `Ler tag de ${selectedStudent.nome}`
                  : 'Selecione um aluno'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!nfcAvailable && (
          <Text style={styles.nfcWarning}>
            NFC indisponível neste aparelho.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060D1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#243252',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backText: {
    color: '#B6CBFF',
    fontSize: 42,
    lineHeight: 44,
  },
  title: {
    color: '#E2E7F2',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#AAB2C5',
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionTitle: {
    color: '#D7E1FF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  classList: {
    gap: 10,
  },
  classButton: {
    borderWidth: 1,
    borderColor: '#344362',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  classButtonSelected: {
    backgroundColor: '#5A95FF',
    borderColor: '#5A95FF',
  },
  classButtonText: {
    color: '#B0B8CA',
    fontWeight: '700',
  },
  classButtonTextSelected: {
    color: '#03163E',
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    color: '#AAB2C5',
    paddingVertical: 24,
    textAlign: 'center',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121A33',
    borderWidth: 1,
    borderColor: '#243252',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  studentCardSelected: {
    borderColor: '#5A95FF',
    backgroundColor: '#17274A',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#E2E7F2',
    fontSize: 18,
    fontWeight: '800',
  },
  studentRegistration: {
    color: '#AAB2C5',
    marginTop: 3,
  },
  tagStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  tagRegistered: {
    color: '#67D391',
  },
  tagPending: {
    color: '#FFBC70',
  },
  readButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5A95FF',
    borderRadius: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  readButtonDisabled: {
    opacity: 0.45,
  },
  readButtonIcon: {
    fontSize: 26,
  },
  readButtonText: {
    flexShrink: 1,
    color: '#03163E',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  nfcWarning: {
    color: '#FFB4AB',
    textAlign: 'center',
    marginTop: 12,
  },
})
