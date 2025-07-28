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
import * as Notifications from 'expo-notifications';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../components/firebaseConfig'; // adjust path
import { DocumentStorage } from '../utils/documentStorage';
import { Bell, Clock, Calendar, CheckCircle, ArrowLeft } from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const scheduleNotificationsForExpiringDocs = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, `users/${userId}/documents`));
    const now = new Date();

    snapshot.forEach(doc => {
      const data = doc.data();
      const expiryDate = data.expiryDate?.toDate?.(); // assuming expiryDate is a Timestamp

      if (expiryDate) {
        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysLeft = timeDiff / (1000 * 60 * 60 * 24);

        // ⚠️ Customize threshold (e.g., 1 day before expiration)
        if (daysLeft <= 1 && daysLeft > 0) {
          // Schedule push notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Document Expiring Soon',
              body: `${data.title || 'One of your documents'} is expiring in less than a day.`,
              sound: 'default',
            },
            trigger: {
              seconds: 5, // You can schedule it with real expiry time difference
            },
          });
        }
      }
    });

      } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

  useEffect(() => {
    loadExpiringDocuments();
  }, []);

  const loadExpiringDocuments = async () => {
    try {
      const expiring = await DocumentStorage.getExpiringDocuments(60); // 60 days ahead
      setExpiringDocuments(expiring);
    } catch (error) {
      console.error('Error loading expiring documents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpiringDocuments();
    setRefreshing(false);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getUrgencyLevel = (daysLeft) => {
    if (daysLeft <= 7) return 'critical';
    if (daysLeft <= 30) return 'warning';
    return 'info';
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return '#E53935';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const markAsHandled = async (documentId) => {
    try {
      await DocumentStorage.updateDocument(documentId, { reminderSet: true });
      await loadExpiringDocuments();
    } catch (error) {
      console.error('Error marking as handled:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {expiringDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#B2DFDB" />
            <Text style={styles.emptyTitle}>No upcoming expiries</Text>
            <Text style={styles.emptyDescription}>
              All your documents are up to date!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {expiringDocuments.length} document{expiringDocuments.length !== 1 ? 's' : ''} expiring soon
            </Text>
            
            {expiringDocuments.map((document) => {
              const daysLeft = getDaysUntilExpiry(document.expiryDate);
              const urgencyLevel = getUrgencyLevel(daysLeft);
              const urgencyColor = getUrgencyColor(urgencyLevel);

              return (
                <View key={document.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{document.name}</Text>
                      <View style={styles.expiryInfo}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.expiryText}>
                          Expires: {formatDate(document.expiryDate)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20` }]}>
                      <Clock size={12} color={urgencyColor} />
                      <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reminderActions}>
                    <TouchableOpacity
                      style={styles.handledButton}
                      onPress={() => markAsHandled(document.id)}
                    >
                      <CheckCircle size={16} color="#4CAF50" />
                      <Text style={styles.handledButtonText}>Mark as Handled</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
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
    fontSize: 20,
    color: '#FFFFFF',
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
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  handledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  handledButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});