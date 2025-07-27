export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  filePath: string;
  fileType: 'pdf' | 'image';
  expiryDate?: string;
  notes?: string;
  uploadDate: string;
  reminderSet?: boolean;
}

export type DocumentCategory = 'id' | 'school' | 'work' | 'travel' | 'custom';

export interface DocumentCategoryInfo {
  id: DocumentCategory;
  name: string;
  icon: string;
  color: string;
}