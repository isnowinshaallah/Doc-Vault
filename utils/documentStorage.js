import AsyncStorage from '@react-native-async-storage/async-storage';

const DOCUMENTS_KEY = 'documents';

export const DocumentStorage = {
  async getDocuments() {
    try {
      const data = await AsyncStorage.getItem(DOCUMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  async saveDocument(document) {
    try {
      const documents = await this.getDocuments();
      documents.push(document);
      await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },

  async updateDocument(documentId, updates) {
    try {
      const documents = await this.getDocuments();
      const index = documents.findIndex(doc => doc.id === documentId);
      if (index !== -1) {
        documents[index] = { ...documents[index], ...updates };
        await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
      }
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async deleteDocument(documentId) {
    try {
      const documents = await this.getDocuments();
      const filtered = documents.filter(doc => doc.id !== documentId);
      await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async getDocumentsByCategory(category) {
    try {
      const documents = await this.getDocuments();
      return documents.filter(doc => doc.category === category);
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  },

  async getExpiringDocuments(daysAhead = 30) {
    try {
      const documents = await this.getDocuments();
      const now = new Date();
      const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
      
      return documents.filter(doc => {
        if (!doc.expiryDate) return false;
        const expiryDate = new Date(doc.expiryDate);
        return expiryDate >= now && expiryDate <= futureDate;
      });
    } catch (error) {
      console.error('Error getting expiring documents:', error);
      return [];
    }
  }
};