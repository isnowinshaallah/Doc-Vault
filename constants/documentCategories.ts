import { DocumentCategoryInfo } from '@/types/Document';

export const DOCUMENT_CATEGORIES: DocumentCategoryInfo[] = [
  {
    id: 'id',
    name: 'ID',
    icon: 'credit-card',
    color: '#00796B',
  },
  {
    id: 'school',
    name: 'School',
    icon: 'graduation-cap',
    color: '#2196F3',
  },
  {
    id: 'work',
    name: 'Work',
    icon: 'briefcase',
    color: '#FF9800',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'map-pin',
    color: '#9C27B0',
  },
  {
    id: 'custom',
    name: 'Others',
    icon: 'folder',
    color: '#607D8B',
  },
];