import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { DocumentStorage } from '../utils/documentStorage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { DOCUMENT_CATEGORIES } from '../constants/documentCategories';
import { CategoryCard } from '../components/CategoryCard';
import { DocumentCard } from '../components/DocumentCard';
import { Upload, Bell, Settings } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    loadDocuments();
  }, []);

  const enableBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable Biometric Login',
    });
    if (result.success) {
      await SecureStore.setItemAsync('credentials', JSON.stringify({ uid }));
      Alert.alert('Enabled', 'You can now unlock with biometrics.');
    }
  };

  const loadDocuments = async () => {
    try {
      const allDocs = await DocumentStorage.getDocuments();
      const expiring = await DocumentStorage.getExpiringDocuments(30);
      
      setDocuments(allDocs);
      setExpiringDocuments(expiring);
      
      // Calculate category counts
      const counts = {};
      DOCUMENT_CATEGORIES.forEach(cat => {
        counts[cat.id] = allDocs.filter(doc => doc.category === cat.id).length;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId) => {
    router.push(`/category/${categoryId}`);
  };

  const handleDocumentPress = (document) => {
    router.push(`/document/${document.id}`);
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.isOfflineMode) return 'Offline User';
    return user.name || user.email.split('@')[0] || 'User';
  };

  const recentDocuments = documents
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appTitle}>Doc-Vault</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color="#FFFFFF" />
              {expiringDocuments.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{expiringDocuments.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>👋 Hi {getUserDisplayName()}!</Text>
          <Text style={styles.readyText}>Ready to upload?</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => router.push('/upload')}
        >
          <Upload size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Upload New Document</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {DOCUMENT_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                documentCount={categoryCounts[category.id] || 0}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </View>
        </View>

        {/* Expiring Soon */}
        {expiringDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expiring Soon</Text>
              <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Bell size={20} color="#00796B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.expiringContainer}>
              {expiringDocuments.slice(0, 2).map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPress={() => handleDocumentPress(document)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recent Uploads */}
        {recentDocuments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <View style={styles.recentContainer}>
              {recentDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPress={() => handleDocumentPress(document)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyDescription}>
              Start by uploading your first document
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/upload')}
            >
              <Text style={styles.emptyButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  readyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#B2DFDB',
  },
  uploadButton: {
    backgroundColor: '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  expiringContainer: {
    gap: 8,
  },
  recentContainer: {
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 8,
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
});