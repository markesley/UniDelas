// app/(tabs)/feed.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { MessageCircle, Heart } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { API_BASE_URL } from '../config/config'

interface Post {
  id: string
  usuarioId: string
  username: string
  conteudo: string
  dataPublicacao: string
  curtidas: number
  liked: boolean
  comentariosCount: number
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Falha ao buscar posts')
      const data: Post[] = await res.json()
      // supondo que seu back já inclua um campo comentariosCount
      setPosts(
        data.sort(
          (a, b) =>
            new Date(b.dataPublicacao).getTime() -
            new Date(a.dataPublicacao).getTime()
        )
      )
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async () => {
    if (!newPost.trim()) {
      Alert.alert('Aviso', 'Digite algo antes de publicar!')
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conteudo: newPost,
          visibilidade: 'PUBLICO',
          status: 'ATIVO',
        }),
      })
      if (!res.ok) throw new Error('Não foi possível publicar')
      setNewPost('')
      fetchPosts()
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    }
  }

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8B4F9F" />
      </View>
    )

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Novo post */}
      <View style={styles.postInput}>
        <TextInput
          style={styles.input}
          placeholder="Compartilhe sua história..."
          placeholderTextColor="#555"
          multiline
          value={newPost}
          onChangeText={setNewPost}
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de posts */}
      {posts.map((post) => (
        <View key={post.id} style={styles.post}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/profile/[id]',
                params: { id: post.usuarioId },
              })
            }
          >
            <Text style={styles.postAuthor}>{post.username}</Text>
          </TouchableOpacity>
          <Text style={styles.postContent}>{post.conteudo}</Text>
          <Text style={styles.postDate}>
            {format(new Date(post.dataPublicacao), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </Text>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={20} color="#8B4F9F" />
              <Text style={styles.actionText}>{post.curtidas}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: '/comments/[postId]',
                  params: { postId: post.id },
                })
              }
            >
              <MessageCircle size={20} color="#8B4F9F" />
              <Text style={styles.actionText}>{post.comentariosCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postInput: {
    padding: 12,
    backgroundColor: '#FFF',
    margin: 10,
    borderRadius: 12,
    elevation: 2,
  },
  input: { height: 80, textAlignVertical: 'top', padding: 10, fontSize: 16 },
  postButton: {
    backgroundColor: '#8B4F9F',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  postButtonText: { color: '#FFF', fontWeight: '600' },

  post: {
    backgroundColor: '#FFF',
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  postAuthor: { fontSize: 16, fontWeight: '600', color: '#8B4F9F' },
  postContent: { fontSize: 14, color: '#333', marginVertical: 8 },
  postDate: { fontSize: 12, color: '#999', marginBottom: 8 },

  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionText: { marginLeft: 4, color: '#666' },
})
