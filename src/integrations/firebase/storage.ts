import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata,
  UploadTask
} from 'firebase/storage';
import { storage } from './config';

// Upload file with progress tracking
export const uploadFile = async (
  file: File, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<{ url: string | null; error: any }> => {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            resolve({ url: null, error });
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, error: null });
            } catch (error) {
              resolve({ url: null, error });
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, error: null };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
};

// Upload user avatar
export const uploadUserAvatar = async (
  userId: string, 
  file: File, 
  onProgress?: (progress: number) => void
) => {
  const path = `user_uploads/${userId}/avatar/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload workout media
export const uploadWorkoutMedia = async (
  userId: string, 
  file: File, 
  workoutId?: string,
  onProgress?: (progress: number) => void
) => {
  const path = `user_uploads/${userId}/workouts/${workoutId || 'general'}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload recipe image
export const uploadRecipeImage = async (
  userId: string, 
  file: File, 
  recipeId?: string,
  onProgress?: (progress: number) => void
) => {
  const path = `user_uploads/${userId}/recipes/${recipeId || 'general'}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload general media
export const uploadMedia = async (
  userId: string, 
  file: File, 
  category: string = 'general',
  onProgress?: (progress: number) => void
) => {
  const path = `user_uploads/${userId}/${category}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Download file
export const downloadFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { url: null, error };
  }
};

// Delete file
export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
};

// List files in directory
export const listFiles = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
          metadata,
        };
      })
    );
    
    return { files, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { files: [], error };
  }
};

// Get file metadata
export const getFileMetadata = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    return { metadata, error: null };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return { metadata: null, error };
  }
};

// Update file metadata
export const updateFileMetadata = async (path: string, newMetadata: any) => {
  try {
    const storageRef = ref(storage, path);
    const metadata = await updateMetadata(storageRef, newMetadata);
    return { metadata, error: null };
  } catch (error) {
    console.error('Error updating file metadata:', error);
    return { metadata: null, error };
  }
};

// Image compression utility
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};