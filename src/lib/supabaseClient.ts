import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Storage Helper: Upload a file to a specific bucket
 */
export async function uploadFile(file: File, bucket: string = 'products', customFileName?: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = customFileName ? customFileName : `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Storage Helper: Delete a file from a specific bucket
 */
export async function deleteFile(fileUrl: string, bucket: string = 'products') {
  try {
    // Strip query parameters (e.g. ?v=timestamp cache busters) before extracting path
    const cleanUrl = fileUrl.split('?')[0];
    const urlParts = cleanUrl.split(bucket + '/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      if (!filePath) return; // Safety: don't try to delete empty paths
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) throw error;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}

/**
 * Storage Helper: List all files in a specific bucket
 */
export async function listFiles(bucket: string = 'products') {
  const { data, error } = await supabase.storage.from(bucket).list();
  if (error) {
    console.error('Error listing files:', error);
    return [];
  }
  
  // Map files to include their full public URL
  return data.map(file => {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(file.name);
    return {
      ...file,
      publicUrl
    };
  });
}

/**
 * Storage Helper: Rename/Move a file
 */
export async function renameFile(oldName: string, newName: string, bucket: string = 'products') {
  const { error } = await supabase.storage.from(bucket).move(oldName, newName);
  if (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
}

export default supabase;
