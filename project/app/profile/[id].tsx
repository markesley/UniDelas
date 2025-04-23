// app/profile/[id].tsx
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'

interface Profile {
  id: string
  nome: string
  username: string
  email: string
  telefone?: string
  fotoPerfil?: string
  universidade?: {
    id: string
    nome: string
    cidade: string
    estado: string
  }
}

function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    const part1 = digits.slice(0, 2)
    const part2 = digits.slice(2, 7)
    const part3 = digits.slice(7, 11)
  
    if (part3) {
      return `(${part1})${part2}-${part3}`
    } else if (part2) {
      return `(${part1})${part2}`
    } else if (part1) {
      return `(${part1}`
    }
    return ''
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [id])

  

  async function fetchProfile() {
    try {
      const res = await fetch(`http://192.168.0.60:3100/users/${id}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Falha ao carregar perfil')
      const data = await res.json()
      setProfile(data)
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B4F9F" />
      </View>
    )
  if (!profile)
    return (
      <View style={styles.container}>
        <Text>Perfil não encontrado</Text>
      </View>
    )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.content}>
        {profile.fotoPerfil && (
          <Image
            source={{ uri: profile.fotoPerfil }}
            style={styles.avatar}
          />
        )}
        <Text style={styles.name}>
          {profile.nome} (@{profile.username})
        </Text>
        <Text style={styles.email}>{profile.email}</Text>
        {profile.telefone && (
          <Text style={styles.info}>
          📞 {formatPhone(profile.telefone)}
        </Text>
        )}
        {profile.universidade && (
          <View style={styles.uni}>
            <Text style={styles.sectionTitle}>Universidade</Text>
            <Text style={styles.info}>
              {profile.universidade.nome}
            </Text>
            <Text style={styles.info}>
              {profile.universidade.cidade} -{' '}
              {profile.universidade.estado}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B4F9F',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  back: {
    color: '#FFF',
    fontSize: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: { alignItems: 'center', padding: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 4,
  },
  email: { fontSize: 16, color: '#666', marginBottom: 12 },
  info: { fontSize: 14, color: '#333', marginBottom: 4 },
  uni: { marginTop: 20, alignItems: 'center' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 6,
  },
})
