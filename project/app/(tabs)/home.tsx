// app/(tabs)/home.tsx
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { Bell } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen() {
  const router = useRouter()
  const [alertCount, setAlertCount] = useState(0)

  // Busca quantos alertas eu recebi
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(
          'http://192.168.0.60:3100/alertas-emergencia/recebidos',
          { credentials: 'include' }
        )
        if (!res.ok) throw new Error('Erro na busca')
        const data = await res.json()
        setAlertCount(Array.isArray(data) ? data.length : 0)
      } catch (err: any) {
        console.error(err)
        // você pode exibir um toast se quiser
      }
    }
    fetchAlerts()
  }, [])

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      router.replace('/login')
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível deslogar')
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vinda ao Juntas</Text>
        <Text style={styles.subtitle}>Um espaço seguro para todas nós</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* BANNER DE EMERGÊNCIAS (sempre aparece) */}
      <View style={styles.alertBanner}>
        <Bell size={20} color="#FFF" />
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => router.push('/alertas-recebidos')}
        >
          <Text style={styles.alertText}>
            Você tem {alertCount} alerta(s)
          </Text>
        </TouchableOpacity>
      </View>

      {/* AÇÕES RÁPIDAS */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/panic')}
        >
          <Text style={styles.buttonText}>Botão de Emergência</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/support')}
        >
          <Text style={styles.buttonText}>Encontrar Apoio</Text>
        </TouchableOpacity>
      </View>

      {/* NÚMEROS IMPORTANTES */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Números Importantes</Text>
        <View style={styles.helpCard}>
          <Text style={styles.helpNumber}>180</Text>
          <Text style={styles.helpText}>Central de Atendimento à Mulher</Text>
        </View>
        <View style={styles.helpCard}>
          <Text style={styles.helpNumber}>190</Text>
          <Text style={styles.helpText}>Polícia Militar</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  header: {
    padding: 20,
    backgroundColor: '#8B4F9F',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: 'relative',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#E0B8EF' },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#E57373',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  logoutText: { color: '#FFF', fontWeight: 'bold' },

  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#D72638',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButton: { marginLeft: 8 },
  alertText: { color: '#FFF', fontWeight: 'bold' },

  quickActions: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#B366CC',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  infoSection: { padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 15,
  },
  helpCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },
  helpNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4F9F',
    marginBottom: 5,
  },
  helpText: { fontSize: 16, color: '#666' },
})
