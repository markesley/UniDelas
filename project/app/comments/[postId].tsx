// app/(tabs)/comments/[postId].tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { API_BASE_URL } from '../config/config'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Comment {
  id: string
  conteudo: string
  username: string
  dataComentario: string
}

interface Post {
  id: string
  conteudo: string
  username: string
  dataPublicacao: string
}

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [postId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1) Buscar post
      const resPost = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        credentials: 'include',
      })
      if (!resPost.ok) throw new Error('Post não encontrado')
      const postData = await resPost.json()
      setPost(postData)

      // 2) Buscar comentários (com username)
      const resCom = await fetch(
        `${API_BASE_URL}/comentarios/post/${postId}`,
        { credentials: 'include' }
      )
      if (!resCom.ok) throw new Error('Erro nos comentários')
      const comData: Comment[] = await resCom.json()
      setComments(comData)
    } catch (err: any) {
      console.error(err)
      Alert.alert('Erro', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    try {
      const res = await fetch(`${API_BASE_URL}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          conteudo: newComment,
          visibilidade: 'PUBLICO',
          status: 'ATIVO',
        }),
      })
      if (!res.ok) throw new Error('Falha ao enviar comentário')
      setNewComment('')
      fetchData()
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

  if (!post)
    return (
      <View style={styles.loader}>
        <Text>Post não encontrado</Text>
      </View>
    )

  return (
    <SafeAreaView style={styles.container}>
    <TouchableOpacity onPress={() => router.back()}>
      <Text style={styles.back}>← Voltar</Text>
    </TouchableOpacity>
    <ScrollView style={styles.scroll}>
        <View style={styles.post}>
          <Text style={styles.author}>{post.username}</Text>
          <Text style={styles.content}>{post.conteudo}</Text>
          <Text style={styles.date}>
            {format(new Date(post.dataPublicacao), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </Text>
        </View>

        <Text style={styles.section}>Comentários</Text>
        {comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Text style={styles.commentAuthor}>{c.username}</Text>
            <Text style={styles.commentText}>{c.conteudo}</Text>
            <Text style={styles.commentDate}>
              {format(new Date(c.dataComentario), 'HH:mm dd/MM', {
                locale: ptBR,
              })}
            </Text>
          </View>
        ))}

        <View style={styles.newComment}>
          <TextInput
            style={styles.input}
            placeholder="Adicione um comentário..."
            placeholderTextColor="#888"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleComment}
          >
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
        </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  back: { padding: 16, color: '#8B4F9F', fontWeight: '600' },
  scroll: { paddingHorizontal: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  post: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  author: { fontWeight: '600', color: '#8B4F9F' },
  content: { marginTop: 8, color: '#333' },
  date: { marginTop: 6, fontSize: 12, color: '#999' },

  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 8,
  },
  comment: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  commentAuthor: { fontWeight: '600', color: '#333' },
  commentText: { marginTop: 4, color: '#555' },
  commentDate: { marginTop: 4, fontSize: 10, color: '#999' },

  newComment: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#8B4F9F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendText: { color: '#FFF', fontWeight: '600' },
})
