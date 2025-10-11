// Firebase configuration and services
export * from './config';
export * from './auth';
export * from './firestore';
export * from './storage';
export * from './types';
export * from './hooks';

// Re-export commonly used Firebase types
export type { User } from 'firebase/auth';
export type { 
  DocumentData, 
  QuerySnapshot, 
  DocumentSnapshot 
} from 'firebase/firestore';
export type { 
  UploadTask, 
  UploadTaskSnapshot 
} from 'firebase/storage';