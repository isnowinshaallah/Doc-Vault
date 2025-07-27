import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Calendar, Clock } from 'lucide-react-native';

export const DocumentCard = ({ document, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = () => {
    if (!document.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();
  const isExpiringSoon = daysLeft !== null && daysLeft <= 30;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <FileText size={20} color="#00796B" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>
            {document.name}
          </Text>
          <Text style={styles.uploadDate}>
            {formatDate(document.uploadDate)}
          </Text>
        </View>
        {isExpiringSoon && (
          <View style={styles.warningBadge}>
            <Clock size={12} color="#E53935" />
            <Text style={styles.warningText}>{daysLeft}d</Text>
          </View>
        )}
      </View>
      
      {document.expiryDate && (
        <View style={styles.expiryContainer}>
          <Calendar size={14} color="#666" />
          <Text style={styles.expiryText}>
            Expires: {formatDate(document.expiryDate)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333333',
  },
  uploadDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#E53935',
    marginLeft: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
});