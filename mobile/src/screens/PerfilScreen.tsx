import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function PerfilScreen({ navigation }: any) {
  
  const fazerLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'professor'])
    // Reseta a navegação e joga de volta pra tela de Login
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.topbarIconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>EduPoints</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>♙</Text>
        </View>
        <Text style={styles.title}>Meu Perfil</Text>
        <Text style={styles.subtitle}>Configurações da sua conta.</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={fazerLogout}>
          <Text style={styles.logoutText}>Sair do Aplicativo</Text>
        </TouchableOpacity>
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
  error: '#ffb4ab',
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
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#273A63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarIcon: {
    fontSize: 50,
    color: colors.primary,
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
    marginBottom: 48,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '700',
  },
})
