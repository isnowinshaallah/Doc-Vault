import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DocumentStorage } from '../../utils/documentStorage';
import { DOCUMENT_CATEGORIES } from '../../constants/documentCategories';
import { DocumentCard } from '../../components/DocumentCard';
import { ArrowLeft, Upload } from 'lucide-react-native';

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const category = DOCUMENT_CATEGORIES.find(cat => cat.id === id);

  useEffect(() => {
    loadDocuments();
  }, [id]);

  const loadDocuments = async () => {
    try {
      const categoryDocs = await DocumentStorage.getDocumentsByCategory(id);
      setDocuments(categoryDocs);
    } catch (error) {
      console.error('Error loading category documents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleDocumentPress = (document) => {
    router.push(`/document/${document.id}`);
  };

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name} Documents</Text>
        <TouchableOpacity onPress={() => router.push('/upload')}>
          <Upload size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No {category.name.toLowerCase()} documents</Text>
            <Text style={styles.emptyDescription}>
              Upload your first {category.name.toLowerCase()} document to get started
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/upload')}
            >
              <Text style={styles.emptyButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </Text>
            
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onPress={() => handleDocumentPress(document)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#00796B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#00796B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#E53935',
    marginBottom: 16,
  },
  backText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#00796B',
  },
});