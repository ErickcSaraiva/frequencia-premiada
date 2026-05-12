import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native' 

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

const corBadge: Record<string, { bg: string; borda: string; texto: string }> = {
  presente:    { bg: 'rgba(72,199,142,0.2)',  borda: 'rgba(72,199,142,0.5)',  texto: '#48c78e' },
  falta:       { bg: 'rgba(255,107,107,0.2)', borda: 'rgba(255,107,107,0.5)', texto: '#ff6b6b' },
  justificada: { bg: 'rgba(246,201,14,0.2)',  borda: 'rgba(246,201,14,0.5)',  texto: '#f6c90e' },
}

export default function PresencasScreen({ navigation }: any) {
  const [presencas, setPresencas] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  useFocusEffect(
    useCallback(() => {
      carregarPresencas()
    }, [])
  )

  const carregarPresencas = async () => {
    setCarregando(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await axios.get(`${API_URL}/checkin`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPresencas(response.data)
    } catch (error) {
      console.error('Erro ao buscar presenças:', error)
    } finally {
      setCarregando(false)
    }
  }

  // ✅ Movido para DENTRO do componente
  const fecharChamadaDaTurma = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const turmaId = '9º Ano'; // turma 

      const response = await axios.post(
        `${API_URL}/checkin/encerrar`, 
        { turmaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Sucesso', response.data.message);
      carregarPresencas(); // Recarrega a lista para mostrar as faltas

    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao encerrar a chamada.');
    }
  };

  const renderItem = ({ item }: any) => {
    const dataFormatada = new Date(item.data).toLocaleString('pt-BR')
    const estilo = corBadge[item.status] || corBadge.presente

    return (
      <View style={styles.cardAluno}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nomeAluno}>🎓 {item.aluno?.nome || 'Aluno Desconhecido'}</Text>
          <Text style={styles.dataPresenca}>📅 {dataFormatada}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: estilo.bg, borderColor: estilo.borda }]}>
          <Text style={[styles.badgeTexto, { color: estilo.texto }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico</Text>
        {/* ✅ Botão para o professor apertar no final da aula */}
        <TouchableOpacity style={styles.botaoEncerrar} onPress={fecharChamadaDaTurma}>
          <Text style={styles.textoBotaoEncerrar}>Encerrar Aula</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#4299e1" style={{ marginTop: 50 }} />
      ) : presencas.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhuma presença registrada ainda.</Text>
      ) : (
        <FlatList
          data={presencas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoVoltar}>⬅ Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  botaoEncerrar: { backgroundColor: '#ff4757', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  textoBotaoEncerrar: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cardAluno: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomeAluno: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  dataPresenca: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeTexto: { fontWeight: 'bold', fontSize: 12 },
  textoVazio: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 50, fontSize: 16 },
  botaoVoltar: { marginTop: 20, padding: 16, alignItems: 'center' },
  textoVoltar: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
})