// app/(public)/login.tsx

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { COLORS } from './theme'
import { storeUserData } from '../utils/storage'

interface LoginResponse {
  id: string
  email: string
  message: string
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  // 1) Pede permissão e retorna expoPushToken
  const registerForPushNotificationsAsync = async (): Promise<string> => {
    // iOS: pedir permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      throw new Error('Permissão de notificação negada')
    }

    const tokenData = await Notifications.getExpoPushTokenAsync()
    const token = tokenData.data

    // Android: configurar canal
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    return token
  }

  const handleLogin = async () => {
    try {
      // 2) captura o push token
      const expoPushToken = await registerForPushNotificationsAsync()

      // 3) chama o backend incluindo o token
      const response = await fetch('http://192.168.0.60:3100/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          senha: password,
          expoPushToken,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Falha no login')
      }

      const data = (await response.json()) as LoginResponse

      // 4) guarda dados básicos localmente
      await storeUserData({ id: data.id, email: data.email })

      Alert.alert('Sucesso', data.message)
      router.replace('/(tabs)/home')
    } catch (error: any) {
      Alert.alert('Erro', error.message)
    }
  }

  return (
    <View style={styles.container}>
      {/* Nome do App */}
      <Text style={styles.appName}>UniDelas</Text>

      {/* Título de acolhimento */}
      <Text style={styles.title}>Bem‑vinda</Text>

      <TextInput
        style={styles.input}
        placeholder="E‑mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Ainda não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: COLORS.primary,
    marginTop: 14,
    textDecorationLine: 'underline',
  },
})
