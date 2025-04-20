// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </>
//   );
// }



//NOVO

// app/_layout.tsx
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { EmergencyProvider, useEmergency } from './contexts/EmergencyContext'

function InnerLayout() {
  const router = useRouter()
  const { addEmergency } = useEmergency()

  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(({ request }) => {
      const { latitude, longitude, nome } = request.content.data
      if (latitude && longitude && nome) {
        addEmergency({
          id: String(Date.now()),
          nome,
          latitude,
          longitude,
        })
      }
    })

    const sub2 = Notifications.addNotificationResponseReceivedListener(({ notification }) => {
      const { latitude, longitude, nome } = notification.request.content.data
      if (latitude && longitude && nome) {
        // garante que também fique no histórico
        addEmergency({
          id: String(Date.now()),
          nome,
          latitude,
          longitude,
        })
        router.push(`/alert-map?latitude=${latitude}&longitude=${longitude}&nome=${encodeURIComponent(nome)}`)
      }
    })

    return () => {
      sub1.remove()
      sub2.remove()
    }
  }, [])

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="home" />
        <Stack.Screen name="support" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="panic" />
        <Stack.Screen name="info" />
        <Stack.Screen name="emergencies" />      {/* nossa nova tela */}
        <Stack.Screen name="alert-map" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

export default function RootLayout() {
  return (
    <EmergencyProvider>
      <InnerLayout />
    </EmergencyProvider>
  )
}

