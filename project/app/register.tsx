// app/(public)/register.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { useRouter } from 'expo-router'
import { COLORS } from './theme'
import { API_BASE_URL } from './config/config'

interface University {
  id: string
  nome: string
}

export default function RegisterScreen() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefone, setTelefone] = useState('')

  const [universidades, setUniversidades] = useState<University[]>([])
  const [loadingUnis, setLoadingUnis] = useState(true)

  // autocomplete
  const [uniQuery, setUniQuery] = useState('')
  const [filteredUnis, setFilteredUnis] = useState<University[]>([])
  const [universidadeId, setUniversidadeId] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/university`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Não foi possível carregar universidades')
        return res.json()
      })
      .then((data: University[]) => {
        setUniversidades(data)
        setFilteredUnis(data)
      })
      .catch(err => {
        Alert.alert('Erro', err.message)
      })
      .finally(() => setLoadingUnis(false))
  }, [])

  useEffect(() => {
    const q = uniQuery.trim().toLowerCase()
    if (!q) return setFilteredUnis(universidades)
    setFilteredUnis(
      universidades.filter(u => u.nome.toLowerCase().includes(q))
    )
  }, [uniQuery, universidades])

  const handleRegister = async () => {
    if (!name || !username || !email || !password || !telefone || !universidadeId) {
      return Alert.alert('Atenção', 'Preencha todos os campos.')
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, username, email, password, telefone, universidadeId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Falha no cadastro')
      }
      Alert.alert('Sucesso', 'Cadastro realizado! Faça login.')
      router.replace('/login')
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    }
  }

  if (loadingUnis) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Cadastro</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
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

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#888"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
            value={telefone}
            onChangeText={setTelefone}
          />

          {/* Autocomplete de universidades */}
          <View style={styles.autocompleteContainer}>
            <TextInput
              style={styles.input}
              placeholder="Universidade"
              placeholderTextColor="#888"
              value={
                universidadeId
                  ? universidades.find(u => u.id === universidadeId)?.nome ?? uniQuery
                  : uniQuery
              }
              onChangeText={text => {
                setUniQuery(text)
                setUniversidadeId('') // desfaz seleção quando digitar
              }}
            />
            {
              // só mostra sugestões enquanto não houver seleção
              !universidadeId &&
              uniQuery.length > 0 &&
              filteredUnis.length > 0 && (
                <View style={styles.suggestionBox}>
                  {filteredUnis.slice(0, 5).map(u => (
                    <TouchableOpacity
                      key={u.id}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setUniQuery(u.nome)
                        setUniversidadeId(u.id)
                        Keyboard.dismiss()
                      }}
                    >
                      <Text>{u.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            }
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Já tem uma conta? Entrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 12,
    color: '#000',
  },
  autocompleteContainer: {
    width: '100%',
    marginBottom: 20,
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: '#FFF',
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
})
