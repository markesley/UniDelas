import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL } from './config/config'

type Emergency = {
  id: string
  usuarioId: string
  usuarioNome: string
  dataHora: string
  latitude: number
  longitude: number
}

export default function EmergenciesScreen() {
  const [alerts, setAlerts] = useState<Emergency[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE_URL}/alertas-emergencia/recebidos`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar')
        return res.json()
      })
      .then((data: Emergency[]) => {
        console.log('Alertas recebidos:')
        data.forEach((alerta) => {
          console.log(
            `Alerta de ${alerta.usuarioNome}: Latitude ${alerta.latitude}, Longitude ${alerta.longitude}`
          )
        })
        setAlerts(data)
      })
      .catch((err) => {
        console.error(err)
        Alert.alert('Erro', 'Não foi possível carregar alertas')
      })
      .finally(() => setLoading(false))
  }, [])

  const renderItem = ({ item }: { item: Emergency }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(
          `/alert-map?latitude=${item.latitude}&longitude=${item.longitude}`
        )
      }
    >
      <Text style={styles.cardTitle}>Alerta de: {item.usuarioNome}</Text>
      <Text style={styles.cardText}>
        {new Date(item.dataHora).toLocaleString()}
      </Text>
      <Text style={styles.cardButton}>Ver no mapa</Text>
    </TouchableOpacity>
  )

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B4F9F" />
      </View>
    )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Text style={styles.navButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Alertas Recebidos</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Lista de alertas */}
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum alerta recebido</Text>
        }
        contentContainerStyle={{ padding: 10 }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navbar: {
    height: 60,
    backgroundColor: '#8B4F9F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  navTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#8B4F9F' },
  cardText: { fontSize: 14, color: '#666', marginVertical: 4 },
  cardButton: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B366CC',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
})
