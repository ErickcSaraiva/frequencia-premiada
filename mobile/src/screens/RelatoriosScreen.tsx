import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'

export default function RelatoriosScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.topbarIconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>EduPoints</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.iconPlaceholder}>📊</Text>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>
          Em breve: Aqui você verá os gráficos de desempenho e faltas da turma.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const colors = {
  background: '#10131a',
  primary: '#adc6ff',
  onSurface: '#e1e2ec',
  onSurfaceVariant: '#c2c6d6',
  outlineVariant: '#424754',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconPlaceholder: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: colors.onSurface,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
})