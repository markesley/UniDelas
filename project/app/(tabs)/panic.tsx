import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { getUserData } from '../../utils/storage'; // ajuste o path conforme sua estrutura
import { API_BASE_URL } from '../config/config';
import { FontAwesome } from '@expo/vector-icons';

export default function PanicScreen() {
  const [isActivated, setIsActivated] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [whatsappLinks, setWhatsappLinks] = useState<{ nome: string; link: string }[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserData();
      if (userData?.id) {
        setUserId(userData.id);
        console.log('ID do usuário carregado:', userData.id);
      } else {
        console.log('Nenhum dado de usuário encontrado no storage');
      }
    };
    loadUser();
  }, []);

  const handlePanic = async () => {
    if (!isActivated) {
      Alert.alert(
        'Ativar Alerta de Emergência',
        'Isso enviará sua localização para seus contatos de confiança. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ativar',
            onPress: async () => {
              if (!userId) {
                Alert.alert('Erro', 'Usuário não identificado.');
                return;
              }

              setLoadingLocation(true);
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
                setLoadingLocation(false);
                return;
              }

              let currentLocation = await Location.getCurrentPositionAsync({});
              setLocation(currentLocation.coords);

              try {
                const response = await fetch(`${API_BASE_URL}/alertas-emergencia`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  setWhatsappLinks(result.whatsappLinks || []);
                  Alert.alert('Alerta enviado', 'Sua localização foi enviada com sucesso!');
                  setIsActivated(true);
                } else {
                  const errorText = await response.text();
                  console.error('Erro do backend:', errorText);
                  Alert.alert('Erro', 'Não foi possível enviar o alerta.');
                }
              } catch (error) {
                console.error('Erro ao enviar alerta:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao tentar enviar o alerta.');
              } finally {
                setLoadingLocation(false);
              }
            },
          },
        ]
      );
    } else {
      setIsActivated(false);
      setLocation(null);
      Alert.alert('Alerta desativado', 'Você marcou que está segura.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Botão de Emergência</Text>
        <Text style={styles.description}>
          Em caso de perigo, pressione o botão abaixo para enviar sua localização
          para seus contatos de confiança imediatamente.
        </Text>

        <TouchableOpacity
          style={[styles.panicButton, isActivated && styles.panicButtonActive]}
          onPress={handlePanic}
        >
          <Bell size={48} color="#FFF" />
          <Text style={styles.panicButtonText}>
            {isActivated ? 'Desativar Alerta' : 'Ativar Alerta'}
          </Text>
        </TouchableOpacity>

        {whatsappLinks.length > 0 && (
          <View style={{ marginTop: 20, width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B4F9F', marginBottom: 8 }}>
              Enviar mensagem pelo WhatsApp:
            </Text>
            {whatsappLinks.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: '#25D366',
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => Linking.openURL(item.link)}
              >
                <Text style={{ color: '#fff', fontSize: 16, flex: 1 }}>{item.nome}</Text>
                <FontAwesome name="whatsapp" size={20} color="#fff" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loadingLocation && <ActivityIndicator size="large" color="#8B4F9F" style={{ marginTop: 20 }} />}

        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="Você está aqui" />
          </MapView>
        )}

        <View style={styles.helpInfo}>
          <Text style={styles.helpTitle}>Contatos de Emergência</Text>
          <Text style={styles.helpText}>Polícia: 190</Text>
          <Text style={styles.helpText}>Central de Atendimento à Mulher: 180</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0FC',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4F9F',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  panicButton: {
    backgroundColor: '#FF4B4B',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  panicButtonActive: {
    backgroundColor: '#8B4F9F',
  },
  panicButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
  helpInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
});
