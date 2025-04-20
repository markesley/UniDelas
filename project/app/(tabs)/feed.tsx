import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MessageCircle, Heart } from 'lucide-react-native';
import { getUserData } from '../../utils/storage';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [userId, setUserId] = useState<string | null>(null); // estado para o ID do usuário

  // Quando o componente montar, busca os dados do usuário
  useEffect(() => {
    const loadUserAndPosts = async () => {
      const userData = await getUserData();
      if (userData?.id) {
        setUserId(userData.id);
        console.log('ID do usuário:', userData.id);
        fetchPosts(); // chama sem parâmetro
      } else {
        console.log('Nenhum dado de usuário encontrado no storage');
      }
    };
    loadUserAndPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const url = `http://192.168.0.60:3100/posts`;  // sem query param
      console.log('Buscando posts em:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      console.log('Status da resposta:', response.status);
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);
      
      const data = JSON.parse(responseText);
      setPosts(
        data.sort((a: any, b: any) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
      );
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) {
      Alert.alert('Aviso', 'Digite algo antes de publicar!');
      return;
    }
  
    try {
      const response = await fetch('http://192.168.0.60:3100/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conteudo: newPost,
          visibilidade: 'PUBLICO',
          status: 'ATIVO',
        }),
      });
  
      if (response.ok) {
        setNewPost('');
        fetchPosts();
      } else {
        Alert.alert('Erro', 'Não foi possível publicar o post.');
      }
    } catch (error) {
      console.error('Erro ao publicar post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://192.168.0.60:3100/curtidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuarioId: userId, postId }),
      });

      if (response.ok) {
        setPosts((prevPosts: any) =>
          prevPosts.map((post: any) =>
            post.id === postId
              ? { ...post, curtidas: (post.curtidas || 0) + 1, liked: true }
              : post
          )
        );
      } else {
        Alert.alert('Erro', 'Não foi possível curtir o post.');
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleUnlike = async (postId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://192.168.0.60:3100/curtidas/${userId}/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPosts((prevPosts: any) =>
          prevPosts.map((post: any) =>
            post.id === postId
              ? { ...post, curtidas: Math.max(0, (post.curtidas || 0) - 1), liked: false }
              : post
          )
        );
      } else {
        Alert.alert('Erro', 'Não foi possível remover a curtida.');
      }
    } catch (error) {
      console.error('Erro ao remover curtida:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.feed}>
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

        {posts.map((post: any) => (
          <View key={post.id} style={styles.post}>
            <Text style={styles.postAuthor}>{post.usuarioNome}</Text>
            <Text style={styles.postContent}>{post.conteudo}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => (post.liked ? handleUnlike(post.id) : handleLike(post.id))}
              >
                {post.liked ? (
                  <Heart size={20} color="#8B4F9F" fill="#8B4F9F" />
                ) : (
                  <Heart size={20} color="#8B4F9F" />
                )}
                <Text style={styles.actionText}>{post.curtidas || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleUnlike(post.id)}>
                <Text style={styles.actionText}>Descurtir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F0FC' },
  feed: { flex: 1 },
  postInput: {
    padding: 15,
    backgroundColor: '#FFF',
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: { height: 100, textAlignVertical: 'top', padding: 10, fontSize: 16 },
  postButton: {
    backgroundColor: '#8B4F9F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: { color: '#FFF', fontWeight: '600' },
  post: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postAuthor: { fontSize: 16, fontWeight: '600', color: '#8B4F9F', marginBottom: 8 },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  postActions: {
    flexDirection: 'row',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { marginLeft: 5, color: '#666' },
});
