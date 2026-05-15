import type { ComponentType } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import LoginScreen from './src/screens/LoginScreen'
import HomeScreen from './src/screens/HomeScreen'
import CheckinScreen from './src/screens/CheckinScreen'
import PresencasScreen from './src/screens/PresencasScreen'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Checkin: undefined
  Presencas: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Checkin" component={CheckinScreen as ComponentType<any>} />
        <Stack.Screen name="Presencas" component={PresencasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
