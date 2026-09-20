import type { ComponentType } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { SessionProvider, useSession } from './src/contexts/SessionContext'
import LoginScreen from './src/screens/LoginScreen'
import CheckinScreen from './src/screens/CheckinScreen'
import TabRoutes from './src/screens/TabRoutes'

export type RootStackParamList = {
  Login: undefined
  MainTabs: undefined
  Checkin: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

function RootNavigator() {
  const { session, isLoading } = useSession()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5A95FF" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabRoutes as ComponentType<any>}
            />

            {session.role === 'professor' && (
              <Stack.Screen
                name="Checkin"
                component={CheckinScreen as ComponentType<any>}
              />
            )}
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#060D1E',
  },
})
