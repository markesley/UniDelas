// app/(tabs)/groups.tsx
import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { PlusCircle, List, ArrowLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { API_BASE_URL } from './config/config'

interface Grupo {
  id: string
  nome: string
  descricao: string
  local: string
  horario: string
  diaSemana: string
  contatoResponsavel: string
}

export default function GroupsScreen() {
  const [currentPage, setCurrentPage] = useState<'menu' | 'create' | 'list'>('menu')
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<Grupo[]>([])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [local, setLocal] = useState('')
  const [horario, setHorario] = useState('')
  const [diaSemana, setDiaSemana] = useState('')
  const [contatoResponsavel, setContatoResponsavel] = useState('')

  const router = useRouter()

  const handleBack = () => {
    if (currentPage === 'menu') {
      router.push('/home')
    } else {
      setCurrentPage('menu')
    }
  }

  useEffect(() => {
    if (currentPage === 'list') {
      setIsLoading(true)
      fetch(`${API_BASE_URL}/grupos-apoio`, { credentials: 'include' })
        .then(res => res.json())
        .then((data: Grupo[]) => setGroups(data))
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar grupos'))
        .finally(() => setIsLoading(false))
    }
  }, [currentPage])

  const handleSubmit = async () => {
    if (!nome.trim() || !descricao.trim() || !local.trim() || !horario.trim() || !diaSemana.trim() || !contatoResponsavel.trim()) {
      Alert.alert('Atenção', 'Todos os campos são obrigatórios')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/grupos-apoio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome, descricao, local, horario, diaSemana, contatoResponsavel }),
      })
      if (!res.ok) throw new Error()
      Alert.alert('Sucesso', 'Grupo criado!')
      // Limpa formulário e retorna ao menu
      setNome('')
      setDescricao('')
      setLocal('')
      setHorario('')
      setDiaSemana('')
      setContatoResponsavel('')
      setCurrentPage('menu')
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o grupo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.navbar}>
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Grupos e Eventos</Text>
            <View style={{ width: 24 }} />
          </View>

          {currentPage === 'menu' && (
            <View style={styles.pageContent}>
              <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentPage('create')}>
                <PlusCircle size={24} color="#FFF" />
                <Text style={styles.menuButtonText}>Criar Grupo/Evento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentPage('list')}>
                <List size={24} color="#FFF" />
                <Text style={styles.menuButtonText}>Ver Grupos/Eventos</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentPage === 'create' && (
            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Criar Grupo/Evento</Text>
              <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#000" value={nome} onChangeText={setNome} />
              <TextInput style={[styles.input, styles.textArea]} placeholder="Descrição" placeholderTextColor="#000" value={descricao} onChangeText={setDescricao} multiline />
              <TextInput style={styles.input} placeholder="Local" placeholderTextColor="#000" value={local} onChangeText={setLocal} />
              <TextInput style={styles.input} placeholder="Horário" placeholderTextColor="#000" value={horario} onChangeText={setHorario} />
              <TextInput style={styles.input} placeholder="Dia da semana" placeholderTextColor="#000" value={diaSemana} onChangeText={setDiaSemana} />
              <TextInput style={styles.input} placeholder="Contato responsável" placeholderTextColor="#000" value={contatoResponsavel} onChangeText={setContatoResponsavel} />
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitText}>Salvar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}

          {currentPage === 'list' && (
            <ScrollView contentContainerStyle={styles.pageContent}>
              <Text style={styles.title}>Grupos e Eventos</Text>
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : groups.length === 0 ? (
                <Text style={styles.noGroupText}>Nenhum grupo cadastrado</Text>
              ) : (
                groups.map(g => (
                  <View key={g.id} style={styles.groupCard}>
                    <Text style={styles.groupName}>{g.nome}</Text>
                    <Text style={styles.groupField}>Descrição: {g.descricao}</Text>
                    <Text style={styles.groupField}>Local: {g.local}</Text>
                    <Text style={styles.groupField}>Horário: {g.horario}</Text>
                    <Text style={styles.groupField}>Dia: {g.diaSemana}</Text>
                    <Text style={styles.groupField}>Contato: {g.contatoResponsavel}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  navbar: { height: 60, backgroundColor: '#B366CC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  pageContent: { flex: 1, padding: 20, justifyContent: 'center', gap: 20 },
  formContent: { padding: 20, paddingBottom: 100, gap: 16 },
  menuButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#B366CC', padding: 16, borderRadius: 12, justifyContent: 'center', gap: 10, marginBottom: 12 },
  menuButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#8B4F9F', marginBottom: 12 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 12, color: '#000' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#8B4F9F', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  groupCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 12 },
  groupName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  groupField: { fontSize: 14, color: '#333', marginBottom: 2 },
  noGroupText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
})
