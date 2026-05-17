import type { ComponentType } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import LoginScreen from './src/screens/LoginScreen'
import CheckinScreen from './src/screens/CheckinScreen'

// Importe o TabRoutes que criamos no Passo 2
// Ajuste o caminho conforme a pasta onde você salvou o arquivo
import TabRoutes from './src/screens/TabRoutes'

export type RootStackParamList = {
  Login: undefined
  MainTabs: undefined // Substituiu o Home e o Presencas
  Checkin: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {/* Tela de Login */}
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* Nosso Menu Inferior (que contém a Home, Presenças, Relatórios, etc.) */}
        <Stack.Screen name="MainTabs" component={TabRoutes as ComponentType<any>} />
        
        {/* Tela de Checkin NFC solta, sem menu inferior para não atrapalhar */}
        <Stack.Screen name="Checkin" component={CheckinScreen as ComponentType<any>} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
