import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import FlashMessage from 'react-native-flash-message'

import { HomeScreen } from './src/screens/HomeScreen'
import { BridgeScreen } from './src/screens/BridgeScreen'
import { TransactionsScreen } from './src/screens/TransactionsScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { AuthProvider } from './src/providers/AuthProvider'
import { theme } from './src/theme'

const Tab = createBottomTabNavigator()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: any

                  if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline'
                  } else if (route.name === 'Bridge') {
                    iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline'
                  } else if (route.name === 'Transactions') {
                    iconName = focused ? 'list' : 'list-outline'
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline'
                  }

                  return <Ionicons name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                  backgroundColor: theme.colors.background,
                  borderTopColor: theme.colors.border,
                },
                headerStyle: {
                  backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
              })}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Bridge" component={BridgeScreen} />
              <Tab.Screen name="Transactions" component={TransactionsScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer>
          <FlashMessage position="top" />
        </AuthProvider>
      </QueryClientProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  )
}