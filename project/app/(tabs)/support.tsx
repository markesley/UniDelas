import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'

interface SimpleUser {
  id: string
  nome: string
  email: string
}

interface Solicitation {
  id: string
  solicitanteId: string
  solicitadoId: string
  status: string
  dataSolicitacao: string
  solicitante: { nome: string; email: string }
}

interface TrustedContact {
  id: string
  nome: string
  email: string
}

export default function SupportScreen() {
  const [searchEmail, setSearchEmail] = useState('')
  const [foundUser, setFoundUser] = useState<SimpleUser | null>(null)
  const [pending, setPending] = useState<Solicitation[]>([])
  const [contacts, setContacts] = useState<TrustedContact[]>([])
  const router = useRouter()

  useEffect(() => {
    loadPending()
    loadContacts()
  }, [])

  async function loadPending() {
    try {
      const res = await fetch(
        'http://192.168.0.60:3100/rede-apoio/solicitacao/pendentes',
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Falha ao carregar pendentes')
      setPending(await res.json())
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  async function loadContacts() {
    try {
      const res = await fetch(
        'http://192.168.0.60:3100/contatos-confianca/meus-contatos',
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Falha ao carregar contatos')
      setContacts(await res.json())
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  async function handleSearch() {
    if (!searchEmail.trim()) return
    try {
      const res = await fetch(
        `http://192.168.0.60:3100/usuarios/search/${searchEmail}`,
        { credentials: 'include' }
      )
      if (res.status === 404) {
        Alert.alert('Usuário não encontrado')
        return setFoundUser(null)
      }
      if (!res.ok) throw new Error('Erro na busca')
      setFoundUser(await res.json())
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  async function sendRequest() {
    if (!foundUser) return
    try {
      const res = await fetch(
        'http://192.168.0.60:3100/rede-apoio/solicitacao',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ solicitadoId: foundUser.id }),
        }
      )
      if (!res.ok) throw new Error('Falha ao enviar solicitação')
      Alert.alert('Solicitação enviada!')
      setFoundUser(null)
      setSearchEmail('')
      loadPending()
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  async function accept(id: string) {
    try {
      const res = await fetch(
        `http://192.168.0.60:3100/rede-apoio/solicitacao/${id}/aceitar`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      )
      if (!res.ok) throw new Error('Falha ao aceitar')
      Alert.alert('Solicitação aceita!')
      loadPending()
      loadContacts() // atualizar contatos ao aceitar
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  async function reject(id: string) {
    try {
      const res = await fetch(
        `http://192.168.0.60:3100/rede-apoio/solicitacao/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )
      if (res.status !== 204) throw new Error('Falha ao recusar')
      Alert.alert('Solicitação recusada')
      loadPending()
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  return (
    <View style={styles.container}>
      {/* Busca de usuário por e‑mail */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Procure por e‑mail"
          value={searchEmail}
          onChangeText={setSearchEmail}
        />
        <TouchableOpacity style={styles.btn} onPress={handleSearch}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {foundUser && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{foundUser.nome}</Text>
          <Text>{foundUser.email}</Text>
          <TouchableOpacity style={styles.btn} onPress={sendRequest}>
            <Text style={styles.btnText}>Solicitar Apoio</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de solicitações pendentes */}
      <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>
      <FlatList
        data={pending}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.solicitante.nome} ({item.solicitante.email})
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnAccept]}
                onPress={() => accept(item.id)}
              >
                <Text style={styles.btnText}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => reject(item.id)}
              >
                <Text style={styles.btnText}>Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Nenhuma pendente</Text>}
      />

      {/* Lista de contatos de confiança */}
      <Text style={styles.sectionTitle}>Seus Contatos de Confiança</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Nenhum contato ainda</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F0FC' },
  searchBox: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#8B4F9F',
    borderRadius: 8,
  },
  btn: {
    marginLeft: 8,
    backgroundColor: '#8B4F9F',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
  },
  btnText: { color: '#FFF', fontWeight: '600' },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#8B4F9F' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#8B4F9F',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // mantém distância
    marginTop: 12,
  },
  actionBtn: {
    // largura automática, definimos o padding
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnAccept: {
    backgroundColor: '#388E3C', // Verde mais escuro e forte
  },
  btnReject: {
    backgroundColor: '#D32F2F', // Vermelho mais forte
  },
})
