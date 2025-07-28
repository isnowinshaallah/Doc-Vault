import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Fingerprint,
  Cloud,
  User,
  Languages,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(false);

  useEffect(() => {
  // Load preference when settings screen opens
  const loadPreference = async () => {
    const enabled = await SecureStore.getItemAsync('biometricEnabled');
    setBiometricEnabled(enabled === 'true');
  };
  loadPreference();
}, []);

const toggleBiometric = async (value) => {
  setBiometricEnabled(value);
  if (value) {
    await SecureStore.setItemAsync('biometricEnabled', 'true');
  } else {
    await SecureStore.deleteItemAsync('biometricEnabled');
  }
};

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const clearLocalFiles = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your documents and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['documents', 'user']);
              Alert.alert('Success', 'All data has been cleared');
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    destructive = false 
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color="#999" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={<User size={20} color="#00796B" />}
            title="Manage Account"
            subtitle={user?.email || 'Offline User'}
            onPress={() => {}}
            rightElement={<ChevronRight size={20} color="#999" />}
          />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <SettingItem
            icon={<Fingerprint size={20} color="#00796B" />}
            title="Biometric Lock"
            subtitle="Use fingerprint or face ID to unlock app"
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#E0E0E0', true: '#B2DFDB' }}
                thumbColor={biometricEnabled ? '#00796B' : '#999'}
              />
            }
          />
        </View>

        {/* Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Sync</Text>
          
          <SettingItem
            icon={<Cloud size={20} color="#00796B" />}
            title="Backup to Google Drive"
            subtitle="Automatically backup your documents"
            rightElement={
              <Switch
                value={backupEnabled}
                onValueChange={setBackupEnabled}
                trackColor={{ false: '#E0E0E0', true: '#B2DFDB' }}
                thumbColor={backupEnabled ? '#00796B' : '#999'}
              />
            }
          />
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <SettingItem
            icon={<Languages size={20} color="#00796B" />}
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Coming Soon', 'Language selection will be available in a future update')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <SettingItem
            icon={<Trash2 size={20} color="#E53935" />}
            title="Clear Local Files"
            subtitle="Delete all documents and reset app"
            onPress={clearLocalFiles}
            destructive
          />
          
          <SettingItem
            icon={<LogOut size={20} color="#E53935" />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            destructive
          />
        </View>
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
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    marginTop: 8,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  destructiveText: {
    color: '#E53935',
  },
});