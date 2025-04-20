import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Informações</Text>
        <Text style={styles.headerSubtitle}>
          Conheça seus direitos e saiba como se proteger
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Violência</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Violência Física</Text>
          <Text style={styles.infoDescription}>
            Qualquer conduta que ofenda a integridade ou saúde corporal da mulher.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Violência Psicológica</Text>
          <Text style={styles.infoDescription}>
            Condutas que causem dano emocional, diminuição da autoestima, prejudiquem
            o desenvolvimento ou visem controlar ações e decisões.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Assédio</Text>
          <Text style={styles.infoDescription}>
            Condutas indesejadas que tenham por objetivo ou efeito intimidar
            ou humilhar uma pessoa.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como Denunciar</Text>
        
        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Delegacia da Mulher</Text>
            <Text style={styles.linkDescription}>
              Encontre a delegacia mais próxima
            </Text>
          </View>
          <ExternalLink size={24} color="#8B4F9F" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Denúncia Online</Text>
            <Text style={styles.linkDescription}>
              Faça sua denúncia pela internet
            </Text>
          </View>
          <ExternalLink size={24} color="#8B4F9F" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legislação</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Lei Maria da Penha</Text>
          <Text style={styles.infoDescription}>
            Lei 11.340/2006 - Cria mecanismos para coibir a violência doméstica
            e familiar contra a mulher.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Lei do Minuto Seguinte</Text>
          <Text style={styles.infoDescription}>
            Lei 12.845/2013 - Dispõe sobre o atendimento obrigatório e integral
            às pessoas em situação de violência sexual.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0FC',
  },
  header: {
    padding: 20,
    backgroundColor: '#8B4F9F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0B8EF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4F9F',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
  },
});