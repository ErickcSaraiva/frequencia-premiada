import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Keyboard
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NfcManager, { NfcTech } from 'react-native-nfc-manager'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

export default function CheckinScreen({ navigation }: any) {
  const [nfcUid, setNfcUid] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [lendoNfc, setLendoNfc] = useState(false)

  useEffect(() => {
  NfcManager.start().catch(() => {
    Alert.alert('Aviso', 'NFC não disponível neste dispositivo')
  })
  return () => { NfcManager.cancelTechnologyRequest().catch(() => null) }
}, [])

  // Função principal para enviar os dados ao backend
  const executarRegistro = async (codigo: string) => {
    if (!codigo) {
      Alert.alert('Atenção', 'Informe o código do aluno ou use o NFC.')
      return
    }

    setCarregando(true)
    try {
      const token = await AsyncStorage.getItem('token')
      await axios.post(`${API_URL}/checkin`, 
        { tag_nfc: codigo, disciplinaId: 1 }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      Alert.alert('✅ Sucesso!', 'Presença registrada!')
      setNfcUid('')
      Keyboard.dismiss()
    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Erro ao registrar.'
      Alert.alert('❌ Erro', msg)
    } finally {
      setCarregando(false)
    }
  }

  // Função para abrir o leitor NFC do sistema
  const iniciarLeituraNFC = async () => {
    try {
      setLendoNfc(true)
      // Solicita a tecnologia da antena
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA])
      
      const tag = await NfcManager.getTag()
      
      if (tag?.id) {
  const tagHex = Array.isArray(tag.id)
    ? tag.id.map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    : String(tag.id)
  await executarRegistro(tagHex)
}
    } catch (ex) {
      console.warn('Leitura cancelada ou erro:', ex)
    } finally {
      setLendoNfc(false)
      // Fecha a antena para economizar bateria
      NfcManager.cancelTechnologyRequest().catch(() => null)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icone}>📱</Text>
      <Text style={styles.titulo}>Registrar Entrada</Text>
      
      {/* SEÇÃO 1: NFC */}
      <View style={styles.secao}>
        <Text style={styles.label}>Aproximação</Text>
        <TouchableOpacity 
          style={[styles.botaoCircular, lendoNfc && { borderColor: '#48c78e' }]} 
          onPress={iniciarLeituraNFC}
          disabled={carregando}
        >
          {lendoNfc ? (
            <ActivityIndicator size="large" color="#48c78e" />
          ) : (
            <>
              <Text style={styles.iconeAntena}>📡</Text>
              <Text style={styles.textoBotao}>Ler tag NFC</Text>
            </>
          )}
        </TouchableOpacity>
        {lendoNfc && <Text style={styles.status}>Aproxime o cartão agora...</Text>}
      </View>

      <View style={styles.divisor}>
        <View style={styles.linha} />
        <Text style={styles.ou}>OU</Text>
        <View style={styles.linha} />
      </View>

      {/* SEÇÃO 2: MANUAL */}
      <View style={styles.secao}>
        <Text style={styles.label}>Código Manual</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o código (ex: 12345)"
          placeholderTextColor="#666"
          value={nfcUid}
          onChangeText={setNfcUid}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={styles.botaoConfirmar}
          onPress={() => executarRegistro(nfcUid)}
          disabled={carregando || lendoNfc}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Confirmar Código</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoVoltar}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24, justifyContent: 'center' },
  icone: { fontSize: 50, textAlign: 'center', marginBottom: 10 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 30 },
  secao: { width: '100%', alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontSize: 14, alignSelf: 'flex-start' },
  
  botaoCircular: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99,179,237,0.1)',
    borderWidth: 2,
    borderColor: '#63b3ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#63b3ed",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  iconeAntena: { fontSize: 50, marginBottom: 10 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 15, color: '#fff', fontSize: 18, marginBottom: 15, textAlign: 'center'
  },
  botaoConfirmar: { width: '100%', backgroundColor: '#4299e1', padding: 18, borderRadius: 12, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divisor: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  linha: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  ou: { color: 'rgba(255,255,255,0.3)', marginHorizontal: 10, fontWeight: 'bold' },
  status: { color: '#48c78e', marginTop: 10, fontWeight: 'bold' },
  botaoVoltar: { marginTop: 40, alignItems: 'center' },
  textoVoltar: { color: 'rgba(255,255,255,0.4)' }
})