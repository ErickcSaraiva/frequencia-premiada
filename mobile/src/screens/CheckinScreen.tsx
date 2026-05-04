import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native'
import NfcManager, { NfcTech } from 'react-native-nfc-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

export default function CheckinScreen() {
  const [lendo, setLendo] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [nfcDisponivel, setNfcDisponivel] = useState(false)

  useEffect(() => {
    NfcManager.start().then(() => {
      setNfcDisponivel(true)
    }).catch(() => {
      setNfcDisponivel(false)
    })

    return () => {
      NfcManager.cancelTechnologyRequest()
    }
  }, [])

  const registrarCheckin = async (tagNfc: string) => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/checkin`,
        { tag_nfc: tagNfc, disciplinaId: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResultado({
        sucesso: true,
        mensagem: response.data.message,
        pontos: response.data.pontos,
        tag: tagNfc,
      })
    } catch (error: any) {
      setResultado({
        sucesso: false,
        mensagem: error.response?.data?.erro || 'Erro ao registrar presença',
        tag: tagNfc,
      })
    }
  }

  const lerTag = async () => {
    setLendo(true)
    setResultado(null)
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef)
      const tag = await NfcManager.getTag()
      const tagId = tag?.id || ''
      const tagHex = Array.isArray(tagId)
        ? tagId.map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
        : String(tagId)
      await registrarCheckin(tagHex)
    } catch (error: any) {
      if (error?.message !== 'cancelled') {
        if (error.request) {
          Alert.alert('Erro de conexão', `Não foi possível conectar ao servidor em ${API_URL}`)
        } else {
          Alert.alert('Erro', 'Não foi possível ler a tag NFC')
        }
      }
    } finally {
      NfcManager.cancelTechnologyRequest()
      setLendo(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instrucao}>
        {lendo ? 'Aproxime a tag NFC...' : 'Toque para iniciar a leitura'}
      </Text>

      <TouchableOpacity
        style={[styles.botaoNfc, lendo && styles.botaoLendo]}
        onPress={lerTag}
        disabled={lendo || !nfcDisponivel}
      >
        {lendo
          ? <ActivityIndicator size="large" color="#fff" />
          : <Text style={styles.botaoNfcIcone}>📡</Text>
        }
        <Text style={styles.botaoNfcTexto}>
          {lendo ? 'Aguardando tag...' : 'Ler tag NFC'}
        </Text>
      </TouchableOpacity>

      {!nfcDisponivel && (
        <Text style={styles.aviso}>⚠️ NFC não disponível neste dispositivo</Text>
      )}

      {resultado && (
        <View style={[
          styles.resultado,
          resultad,
          
          
          
          
          6o.sucesso ? styles.resultadoSucesso : styles.resultadoErro
        ]}>
          <Text style={styles.resultadoIcone}>
            {resultado.sucesso ? '✅' : '❌'}
          </Text>
          <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
          {resultado.sucesso && (
            <Text style={styles.resultadoPontos}>+10 pontos • Total: {resultado.pontos} pts</Text>
          )}
          <Text style={styles.resultadoTag}>Tag: {resultado.tag}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  instrucao: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 48,
    textAlign: 'center',
  },
  botaoNfc: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99,179,237,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(99,179,237,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  botaoLendo: {
    backgroundColor: 'rgba(72,199,142,0.15)',
    borderColor: 'rgba(72,199,142,0.4)',
  },
  botaoNfcIcone: { fontSize: 64, marginBottom: 8 },
  botaoNfcTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  aviso: {
    color: '#f6c90e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultado: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  resultadoSucesso: {
    backgroundColor: 'rgba(72,199,142,0.1)',
    borderColor: 'rgba(72,199,142,0.3)',
  },
  resultadoErro: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderColor: 'rgba(255,107,107,0.3)',
  },
  resultadoIcone: { fontSize: 40, marginBottom: 8 },
  resultadoMensagem: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultadoPontos: {
    color: '#48c78e',
    fontSize: 14,
    marginBottom: 4,
  },
  resultadoTag: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
})