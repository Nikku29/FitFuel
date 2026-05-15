// ============================================================================
// Supabase Storage Layer (replaces Firebase Storage)
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'uploads';

// Upload file with progress tracking
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string | null; error: any }> => {
  try {
    // Supabase doesn't support progress natively, simulate start/end
    if (onProgress) onProgress(10);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    if (onProgress) onProgress(100);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
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
  const path = `${userId}/avatar/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload workout media
export const uploadWorkoutMedia = async (
  userId: string,
  file: File,
  workoutId?: string,
  onProgress?: (progress: number) => void
) => {
  const path = `${userId}/workouts/${workoutId || 'general'}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload recipe image
export const uploadRecipeImage = async (
  userId: string,
  file: File,
  recipeId?: string,
  onProgress?: (progress: number) => void
) => {
  const path = `${userId}/recipes/${recipeId || 'general'}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload general media
export const uploadMedia = async (
  userId: string,
  file: File,
  category: string = 'general',
  onProgress?: (progress: number) => void
) => {
  const path = `${userId}/${category}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Download file (get signed URL)
export const downloadFile = async (path: string) => {
  try {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { url: null, error };
  }
};

// Delete file
export const deleteFile = async (path: string) => {
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error };
  }
};

// List files in directory
export const listFiles = async (path: string) => {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(path);
    if (error) throw error;

    const files = (data || []).map((item) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${path}/${item.name}`);
      return {
        name: item.name,
        path: `${path}/${item.name}`,
        url: urlData.publicUrl,
        metadata: item.metadata,
      };
    });

    return { files, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { files: [], error };
  }
};

// Get file metadata
export const getFileMetadata = async (path: string) => {
  try {
    // Supabase doesn't have a direct getMetadata, use list on parent
    const parts = path.split('/');
    const fileName = parts.pop();
    const folder = parts.join('/');

    const { data, error } = await supabase.storage.from(BUCKET).list(folder);
    if (error) throw error;

    const file = data?.find(f => f.name === fileName);
    return { metadata: file?.metadata || null, error: null };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return { metadata: null, error };
  }
};

// Update file metadata (limited in Supabase - re-upload with new metadata)
export const updateFileMetadata = async (_path: string, _newMetadata: any) => {
  // Supabase Storage doesn't support metadata updates directly
  console.warn('updateFileMetadata is not supported in Supabase Storage');
  return { metadata: null, error: null };
};

// Image compression utility (pure client-side, no backend dependency)
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