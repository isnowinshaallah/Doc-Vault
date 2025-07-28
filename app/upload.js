import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { DocumentStorage } from '../utils/documentStorage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { DOCUMENT_CATEGORIES } from '../constants/documentCategories';
import { ArrowLeft, Paperclip, Camera, Image, Calendar } from 'lucide-react-native';

export default function UploadScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('id');
  const [expiryDate, setExpiryDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const selectFile = async () => {
    Alert.alert(
      'Select File Source',
      'Choose how you want to add your document',
      [
        {
          text: 'Camera',
          onPress: selectFromCamera,
        },
        {
          text: 'Photo Library',
          onPress: selectFromLibrary,
        },
        {
          text: 'Files',
          onPress: selectFromFiles,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const selectFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera access is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedFile({
        ...result.assets[0],
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
      });
    }
  };

  const selectFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedFile({
        ...result.assets[0],
        name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        type: 'image',
      });
    }
  };

  const selectFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          ...result.assets[0],
          type: result.assets[0].mimeType?.includes('pdf') ? 'pdf' : 'image',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentName.trim()) {
      Alert.alert('Missing Information', 'Please select a file and enter a document name');
      return;
    }

    setIsUploading(true);
    try {
      const document = {
        id: Date.now().toString(),
        name: documentName.trim(),
        category: selectedCategory,
        filePath: selectedFile.uri,
        fileType: selectedFile.type === 'pdf' ? 'pdf' : 'image',
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
        uploadDate: new Date().toISOString(),
        reminderSet: false,
      };

      await DocumentStorage.saveDocument(document);
      
      Alert.alert(
        'Success',
        'Document uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
    Keyboard.dismiss();
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
  const formatted = date.toISOString().split('T')[0]; // DD/MM/YYYY
  setExpiryDate(formatted);
  hideDatePicker();
};

  return (
    <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Document</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select File</Text>
          <TouchableOpacity style={styles.fileSelector} onPress={selectFile}>
            <Paperclip size={20} color="#00796B" />
            <Text style={styles.fileSelectorText}>
              {selectedFile ? selectedFile.name : 'Choose file (PDF, JPEG only)'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.fileLimit}>Max file size: 5MB • JPEG, PDF only</Text>
        </View>

        {/* Document Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., National ID"
            value={documentName}
            onChangeText={setDocumentName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categorySelector}>
              {DOCUMENT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Expiry Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity onPress={showDatePicker} style={styles.dateInputContainer}>
            <Calendar size={20} color="#666" />
            <Text style={styles.dateInput}>
            {expiryDate || 'Select Expiry Date'}
          </Text>
          </TouchableOpacity>

<DateTimePickerModal
  isVisible={isDatePickerVisible}
  mode="date"
  onConfirm={handleConfirm}
  onCancel={hideDatePicker}
/>

        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="e.g., Original copy at home"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.disabledButton]}
          onPress={uploadDocument}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : 'Upload Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#00796B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  fileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  fileSelectorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
  fileLimit: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  notesInput: {
    height: 80,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  selectedCategory: {
    backgroundColor: '#00796B',
    borderColor: '#00796B',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  uploadButton: {
    backgroundColor: '#00796B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});