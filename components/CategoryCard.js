import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CreditCard, GraduationCap, Briefcase, MapPin, Folder } from 'lucide-react-native';

const iconMap = {
  'credit-card': CreditCard,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'map-pin': MapPin,
  'folder': Folder,
};

export const CategoryCard = ({
  category,
  documentCount,
  onPress,
}) => {
  const IconComponent = iconMap[category.icon];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
        <IconComponent size={24} color={category.color} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.documentCount}>{documentCount} docs</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 100,
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  documentCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
});