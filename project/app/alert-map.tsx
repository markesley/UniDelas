import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AlertMap() {
  const { latitude, longitude } = useLocalSearchParams()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Localização</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: Number(latitude),
          longitude: Number(longitude),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{
            latitude: Number(latitude),
            longitude: Number(longitude),
          }}
          title="Local do alerta"
        />
      </MapView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  map: { flex: 1 },
})
